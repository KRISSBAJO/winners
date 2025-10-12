import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner"; // ✅ Toast notifications
import Routes from "./routes";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Routes />
      {/* ✅ Global toast provider */}
      <Toaster richColors position="top-right" expand />
    </QueryClientProvider>
  </React.StrictMode>
);
