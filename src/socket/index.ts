import { Socket, io } from "socket.io-client";

import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
});

export const initSocket = () => {
  socket.connect();
}
