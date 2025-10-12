// src/realtime/socketClient.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(token: string) {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_API_BASE, {
    auth: { token },
    transports: ["websocket"],
  });
  return socket;
}
export function getSocket() { return socket; }
export function disconnectSocket() { socket?.disconnect(); socket = null; }
