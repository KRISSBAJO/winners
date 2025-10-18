// src/realtime/socketClient.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) return socket;

  const url = import.meta.env.VITE_SOCKET_URL; // <-- use SOCKET URL, not REST URL
  socket = io(url, {
    auth: { token },
    transports: ["websocket"],
    // path: "/socket.io", // uncomment if you customized the path server-side
  });

  // helpful logs
  socket.on("connect", () => console.log("[socket] connected", socket?.id));
  socket.on("connect_error", (err) => console.error("[socket] connect_error", err.message));
  socket.on("error", (err) => console.error("[socket] error", err));
  socket.on("disconnect", (reason) => console.warn("[socket] disconnected:", reason));

  return socket;
}

export function getSocket() { return socket; }
export function disconnectSocket() { socket?.disconnect(); socket = null; }
