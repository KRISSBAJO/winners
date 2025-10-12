import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../api/features/auth/store/useAuthStore";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { accessToken } = useAuthStore();
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
};
