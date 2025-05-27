import { io } from "socket.io-client";
import { BASE_URL } from '@env';

let socket;

export const connectSocket = (token) => {
  socket = io(BASE_URL, {
    query: { token },
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    console.log("✅ Socket bağlantısı kuruldu");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket bağlantısı kesildi");
  });

  return socket;
};

export const getSocket = () => socket;
