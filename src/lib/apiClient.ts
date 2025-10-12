import axios, { AxiosError, AxiosRequestConfig } from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshQueue: ((token?: string) => void)[] = [];

const onTokenRefreshed = (token?: string) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

const addToQueue = (cb: (token?: string) => void) => {
  refreshQueue.push(cb);
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // If no response or no request cfg, just reject
    if (!error.response || !originalRequest) return Promise.reject(error);

    // Do not attempt to refresh if we are already on /auth/refresh
    const isRefreshCall = (originalRequest.url || "").includes("/auth/refresh");

    if (error.response.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      // if a refresh is in-flight, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addToQueue((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      isRefreshing = true;
      try {
        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } }
        );

        // Persist new tokens
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        // Update default header for future requests
        apiClient.defaults.headers.Authorization = `Bearer ${data.accessToken}`;

        // Flush queue
        onTokenRefreshed(data.accessToken);
        isRefreshing = false;

        // Retry original
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        isRefreshing = false;
        onTokenRefreshed(undefined); // flush queued with failure
        logoutAndRedirect();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
}

export default apiClient;
