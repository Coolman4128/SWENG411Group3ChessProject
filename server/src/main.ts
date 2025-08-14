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

// Track players waiting for a rematch
let playersWaitingForRematch = new Set<string>();

// Timer interval for checking timeouts and updating game state
let gameTimer: NodeJS.Timeout | null = null;

// Helper to look up winner socket id from a color string
function getPlayerIdByColor(color: string | undefined): string | null {
  if (!color) return null;
  const gs = gameManager.getGameState();
  if (color === "white") return gs.whitePlayer;
  if (color === "black") return gs.blackPlayer;
  return null;
}

// Unified emit helpers so "winner" is ALWAYS the socket id of the winner (never a color or message)
function emitCheckmate(resultMessage: string, explicitWinnerColor?: string) {
  // Prefer explicit winnerColor passed from MoveResult; fallback to parsing message
  const parsedColor = /White wins!/i.test(resultMessage) ? "white" : /Black wins!/i.test(resultMessage) ? "black" : undefined;
  const winnerColor = explicitWinnerColor || parsedColor;
  const winnerId = getPlayerIdByColor(winnerColor || "");
  io.emit("gameEnded", {
    reason: "checkmate",
    winner: winnerId,
    winnerId,
    winnerColor,
    message: resultMessage
  });
}

function emitTimeout(winnerColor: string) {
  const winnerId = getPlayerIdByColor(winnerColor);
  io.emit("gameEnded", {
    reason: "timeout",
    winner: winnerId,
    winnerId,
    winnerColor,
    message: `${winnerColor} wins by timeout!`
  });
}

function emitConcede(winnerId: string | null, loserId: string) {
  const gs = gameManager.getGameState();
  const winnerColor = winnerId === gs.whitePlayer ? "white" : winnerId === gs.blackPlayer ? "black" : undefined;
  io.emit("gameEnded", {
    reason: "concede",
    winner: winnerId,
    winnerId,
    winnerColor,
    loser: loserId,
    message: winnerId ? `${winnerColor} wins by concession` : `Game ended by concession`
  });
}

function emitPlayerLeft(winnerId: string | null, loserId: string, loserColor: string | null) {
  const gs = gameManager.getGameState();
  const winnerColor = winnerId === gs.whitePlayer ? "white" : winnerId === gs.blackPlayer ? "black" : undefined;
  io.emit("gameEnded", {
    reason: "playerLeft",
    winner: winnerId,
    winnerId,
    winnerColor,
    loser: loserId,
    message: `${loserColor ?? "A"} player left the game`
  });
}

function startGameTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
  }
  
  gameTimer = setInterval(() => {
    // Check for timeouts
    const timeoutResult = gameManager.checkForTimeout();
    if (timeoutResult.isTimeOut) {
      // End the game due to timeout
      if (timeoutResult.winner) {
        emitTimeout(timeoutResult.winner);
        console.log(`Game ended - ${timeoutResult.winner} won by timeout`);
      }
      clearInterval(gameTimer!);
      gameTimer = null;
      return;
    }
    
    // Send updated game state to keep timers in sync
    io.emit("gameState", gameManager.packageGameStateJSON());
  }, 1000); // Update every second
}

function stopGameTimer() {
  if (gameTimer) {
    clearInterval(gameTimer);
    gameTimer = null;
  }
}

// Socket.IO Connection Handling
io.on("connection", (socket) => {
  // When a user connects, log the connection
  console.log(`User connected: ${socket.id}`);
  // Then find an open player slot and assign that player
  var position = gameManager.getOpenPlayerSlot();
  if (position){
      gameManager.assignPlayer(socket.id, position);
  }
  
  // Send the current game state to all players
  io.emit("gameState", gameManager.packageGameStateJSON());

  socket.on("takePiece", (data) => {
    try {
      console.log(`Piece take attempt by ${socket.id}:`, data);
      
      // Extract coordinates from the data
      const { from, to } = data;
      if (!from || !to || typeof from !== 'object' || typeof to !== 'object') {
        socket.emit("moveResult", { 
          success: false, 
          message: "Invalid coordinate data format." 
        });
        return;
      }
      
      const fromX = from.x;
      const fromY = from.y;
      const toX = to.x;
      const toY = to.y;
      
      // Create an event emitter function for this socket and broadcast to all clients
      const eventEmitter = (event: string, eventData: any) => {
        if (event === "gameState") {
          // Broadcast game state to all clients
          io.emit(event, eventData);
        } else {
          // Emit other events to all clients as well
          io.emit(event, eventData);
        }
      };

      const result = gameManager.handleTakePiece(
        socket.id,
        fromX,
        fromY,
        toX,
        toY,
        eventEmitter
      );

      // Send result back to the requesting client
      socket.emit("moveResult", result);

      if (!result.success) {
        console.log(`Take piece failed: ${result.message}`);
      } else {
        console.log(`Piece successfully taken by ${socket.id}`);
        if (result.isCheckmate) {
          console.log("Game ended in checkmate!");
          stopGameTimer();
          emitCheckmate(result.message || "Checkmate!", result.winnerColor);
        } else if (result.isDraw) {
          console.log("Game ended in draw!");
          stopGameTimer();
          io.emit("gameEnded", { reason: "stalemate" });
        }
      }
    } catch (error) {
      console.error("Error handling take piece:", error);
      socket.emit("moveResult", { 
        success: false, 
        message: "Server error occurred while processing move." 
      });
    }
  });

  socket.on("movePiece", (data) => {
    try {
      console.log(`Piece move attempt by ${socket.id}:`, data);
      
      // Validate input data
      if (!data || typeof data !== 'object') {
        socket.emit("moveResult", { 
          success: false, 
          message: "Invalid move data format." 
        });
        return;
      }
      
      // Extract and validate coordinates from the data
      const { from, to } = data;
      
      if (!from || !to || typeof from !== 'object' || typeof to !== 'object') {
        socket.emit("moveResult", { 
          success: false, 
          message: "Invalid coordinate data format." 
        });
        return;
      }
      
      const fromX = from.x;
      const fromY = from.y;
      const toX = to.x;
      const toY = to.y;
      
      if (fromX === undefined || fromY === undefined || toX === undefined || toY === undefined) {
        socket.emit("moveResult", { 
          success: false, 
          message: "Missing coordinate data." 
        });
        return;
      }
      
      // Convert to numbers if they're strings
      const fromXNum = Number(fromX);
      const fromYNum = Number(fromY);
      const toXNum = Number(toX);
      const toYNum = Number(toY);
      
      if (isNaN(fromXNum) || isNaN(fromYNum) || isNaN(toXNum) || isNaN(toYNum)) {
        socket.emit("moveResult", { 
          success: false, 
          message: "Invalid coordinate values." 
        });
        return;
      }
      
      // Create an event emitter function for this socket and broadcast to all clients
      const eventEmitter = (event: string, eventData: any) => {
        if (event === "gameState") {
          // Broadcast game state to all clients
          io.emit(event, eventData);
        } else {
          // Emit other events to all clients as well
          io.emit(event, eventData);
        }
      };

      const result = gameManager.handleMovePiece(
        socket.id,
        fromXNum,
        fromYNum,
        toXNum,
        toYNum,
        eventEmitter
      );

      // Send result back to the requesting client
      socket.emit("moveResult", result);

      if (!result.success) {
        console.log(`Move failed: ${result.message}`);
      } else {
        console.log(`Piece successfully moved by ${socket.id}`);
        if (result.isCheckmate) {
          console.log("Game ended in checkmate!");
          stopGameTimer();
          emitCheckmate(result.message || "Checkmate!", result.winnerColor);
        } else if (result.isDraw) {
          console.log("Game ended in draw!");
          stopGameTimer();
          io.emit("gameEnded", { reason: "stalemate" });
        }
      }
    } catch (error) {
      console.error("Error handling move piece:", error);
      socket.emit("moveResult", { 
        success: false, 
        message: "Server error occurred while processing move." 
      });
    }
  });

  // Handle promotion choice from client
  socket.on("promotionChoice", (data) => {
    try {
      const { pieceId, newType } = data || {};
      if (pieceId === undefined || newType === undefined) {
        socket.emit("moveResult", { success: false, message: "Invalid promotion data." });
        return;
      }
      // Map incoming number to PieceType (trust client minimal, but validate range)
      const PieceType = require('./Enums/pieces').PieceType;
      if (![PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].includes(newType)) {
        socket.emit("moveResult", { success: false, message: "Invalid promotion piece type." });
        return;
      }
      const result = (gameManager as any).gameState.finalizePromotion(
        socket.id,
        pieceId,
        newType,
        (event: string, eventData: any) => {
          if (event === "gameState") {
            io.emit(event, eventData);
          } else {
            io.emit(event, eventData);
          }
        }
      );
      socket.emit("moveResult", result);
      if (result.isCheckmate) {
        stopGameTimer();
  emitCheckmate(result.message || "Checkmate!", result.winnerColor);
      } else if (result.isDraw) {
        stopGameTimer();
        io.emit("gameEnded", { reason: "stalemate" });
      }
    } catch (err) {
      console.error("Error finalizing promotion", err);
      socket.emit("moveResult", { success: false, message: "Server error during promotion." });
    }
  });

  socket.on("requestDraw", () => {
    try {
      console.log(`Draw request from ${socket.id}`);
      
      // Get the opponent's socket ID
      const opponentId = gameManager.getOpponentId(socket.id);
      if (opponentId) {
        // Send draw request to opponent
        io.to(opponentId).emit("drawRequest", { from: socket.id });
      } else {
        socket.emit("moveResult", { 
          success: false, 
          message: "No opponent found for draw request." 
        });
      }
    } catch (error) {
      console.error("Error handling draw request:", error);
      socket.emit("moveResult", { 
        success: false, 
        message: "Server error occurred while processing draw request." 
      });
    }
  });

  socket.on("drawResponse", (data) => {
    try {
      console.log(`Draw response from ${socket.id}:`, data);
      
      if (data.accept) {
        // Draw accepted - end the game
        stopGameTimer();
        io.emit("gameEnded", { reason: "draw" });
        console.log("Game ended in draw by agreement");
      } else {
        // Draw declined - notify the requesting player
        const opponentId = gameManager.getOpponentId(socket.id);
        if (opponentId) {
          io.to(opponentId).emit("drawDeclined");
        }
      }
    } catch (error) {
      console.error("Error handling draw response:", error);
    }
  });

  socket.on("concede", () => {
    try {
      console.log(`Player ${socket.id} conceded`);
      
      // Determine winner (the opponent of the conceding player)
      const opponentId = gameManager.getOpponentId(socket.id);
      
      // Stop the timer and end the game
      stopGameTimer();
  emitConcede(opponentId, socket.id);
  console.log(`Game ended - ${opponentId ?? "Unknown"} won by concession`);
    } catch (error) {
      console.error("Error handling concede:", error);
    }
  });

  socket.on("startGame", () => {
    try {
      console.log(`Start game request from ${socket.id}`);
      
      // Check if both players are connected
      const gameState = gameManager.getGameState();
      if (gameState.whitePlayer && gameState.blackPlayer) {
        console.log("Both players connected, starting game...");
        // Start the game timer
        startGameTimer();
        // Broadcast game starting message to all clients
        io.emit("gameStarting");
      } else {
        console.log("Cannot start game - not enough players");
        socket.emit("gameStartError", { message: "Not enough players connected" });
      }
    } catch (error) {
      console.error("Error handling start game:", error);
      socket.emit("gameStartError", { message: "Server error occurred" });
    }
  });

  socket.on("playAgain", () => {
    try {
      console.log(`Player ${socket.id} wants to play again`);
      
      // Add player to the waiting list
      playersWaitingForRematch.add(socket.id);
      
      // Get the opponent's ID
      const opponentId = gameManager.getOpponentId(socket.id);
      
      if (opponentId && playersWaitingForRematch.has(opponentId)) {
        // Both players want to play again - start a new game
        console.log("Both players want to play again, starting new game");
        
        // Clear the waiting list
        playersWaitingForRematch.clear();
        
        // Reset the game state
        gameManager.resetGame();
        
        // Reassign players to the new game
        const position1 = Math.random() < 0.5 ? "white" : "black";
        const position2 = position1 === "white" ? "black" : "white";
        
        gameManager.assignPlayer(socket.id, position1);
        gameManager.assignPlayer(opponentId, position2);
        
        // Send both players back to lobby
        io.to(socket.id).emit("returnToLobby");
        io.to(opponentId).emit("returnToLobby");
        
        // Broadcast updated game state
        io.emit("gameState", gameManager.packageGameStateJSON());
        
        console.log(`New game created - ${socket.id}: ${position1}, ${opponentId}: ${position2}`);
      } else {
        // Only this player wants to play again, wait for opponent
        console.log(`Player ${socket.id} is waiting for opponent to decide`);
        
        // Reset game state and add this player back
        gameManager.resetGame();
        const position = Math.random() < 0.5 ? "white" : "black";
        gameManager.assignPlayer(socket.id, position);
        
        // Send this player back to lobby
        socket.emit("returnToLobby");
        
        // Broadcast updated game state
        io.emit("gameState", gameManager.packageGameStateJSON());
        
        console.log(`Player ${socket.id} assigned to ${position} and waiting in lobby`);
      }
    } catch (error) {
      console.error("Error handling play again:", error);
    }
  });

  socket.on("leaveGame", () => {
    try {
      console.log(`Player ${socket.id} is leaving the game`);
      
      // Remove player from waiting list if they were there
      playersWaitingForRematch.delete(socket.id);
      
      // Remove player from game if they're in it
      if (gameManager.isPlayerInGame(socket.id)) {
        gameManager.removePlayer(socket.id);
      }
      
      // Disconnect the socket and send them to main menu
      socket.emit("returnToMainMenu");
      socket.disconnect();
      
      console.log(`Player ${socket.id} disconnected and returned to main menu`);
    } catch (error) {
      console.error("Error handling leave game:", error);
    }
  });

  // Handle player disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    
    try {
      // Remove from rematch waiting list
      playersWaitingForRematch.delete(socket.id);
      
      // Check if the disconnecting player is in the game
      if (gameManager.isPlayerInGame(socket.id)) {
        const gameStarted = gameManager.isGameStarted();
        const playerColor = gameManager.removePlayer(socket.id);
        
        if (!gameStarted) {
          // Game hasn't started yet - just remove player and update game state
          console.log(`Player ${socket.id} (${playerColor}) left before game started`);
          io.emit("gameState", gameManager.packageGameStateJSON());
        } else {
          // Game has started - end the game due to player leaving
          const opponentId = gameManager.getOpponentId(socket.id);
          console.log(`Player ${socket.id} (${playerColor}) left during active game`);
          
          stopGameTimer();
          emitPlayerLeft(opponentId, socket.id, playerColor);
        }
      }
    } catch (error) {
      console.error("Error handling player disconnection:", error);
    }
  });
});
