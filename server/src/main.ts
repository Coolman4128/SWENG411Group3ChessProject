import * as http from "http";
import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import { Server } from "socket.io";
import { GameManager } from "./Game/gamemanager";

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "../public");

// Create HTTP Server to serve our static files
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "", true);
  let pathname = parsedUrl.pathname || "/";

  if (pathname === "/") {
    pathname = "/index.html";
  }

  const filePath = path.join(PUBLIC_DIR, pathname);
  const ext = path.extname(filePath).toLowerCase();

  const mimeTypes: { [key: string]: string } = {
    ".html": "text/html",
    ".js": "text/javascript",
    ".css": "text/css",
    ".json": "application/json",
    ".png": "image/png",
    ".jpg": "image/jpg",
    ".ico": "image/x-icon"
  };

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
    } else {
      res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
      res.end(data);
    }
  });
});


// Start listening on that server
server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});


// Initialize Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const gameManager = new GameManager();

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  // When a user connects, log the connection
  console.log(`User connected: ${socket.id}`);
  // Then find an open player slot and assign that player
  var position = gameManager.getOpenPlayerSlot();
  if (position){
      gameManager.assignPlayer(socket.id, position);
  }
  
  // Send the current game state to the newly connected player
  socket.emit("gameState", gameManager.packageGameStateJSON());

  // Handle player disconnection
  socket.on("disconnect", () => {
    //TODO handle player disconnection
    console.log(`User disconnected: ${socket.id}`);
  });
});
