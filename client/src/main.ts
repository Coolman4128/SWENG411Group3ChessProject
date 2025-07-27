import { io } from "socket.io-client";


// Initialize Socket.IO client for localhost on port 3000
const socket = io("http://localhost:3000");

document.addEventListener("DOMContentLoaded", () => {
  // Socket.IO event listeners
  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });
});