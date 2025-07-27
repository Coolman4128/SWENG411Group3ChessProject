import { io } from "socket.io-client";
import { CanvasManager } from "./Game/canvasmanager";
import { Board } from "./Game/board";
import { Piece } from "./Game/piece";
import { PieceType } from "./Enums/pieces";
import { GameManager } from "./Game/gamemanager";

// Initialize Socket.IO client for localhost on port 3000
const socket = io("http://localhost:3000");

let canvasManager: CanvasManager;
let gameManager: GameManager;
let board: Board;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the game
  initializeChessGame();

  // Socket.IO event listeners
  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);

    gameManager.setPlayerID(socket.id ?? "");

    socket.on("gameState", (data) => {
      console.log("Received game state:", data);
      // Update the game state in the game manager
      var dataObject = JSON.parse(data);
      gameManager.loadGameState(dataObject);
      drawGame();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  });
});

function initializeChessGame(): void {
  try {
    // Initialize the canvas manager
    gameManager = new GameManager();
    canvasManager = new CanvasManager("chessCanvas");

    // Add click listener for piece movement
    canvasManager.addClickListener((row, col) => {
      console.log(`Clicked on square: ${row}, ${col}`);
      const piece = gameManager.getBoard().getPieceAt(row, col);
      if (piece) {
        console.log(`Piece at clicked square: ${piece.getPiecePNG()}`);
        // Here you would handle the piece movement logic
        // For now, just log the piece type and color
        console.log(`Piece type: ${piece.getType()}, color: ${piece.getColor()}`);
      }
    });

    // Wait a bit for images to load, then draw the board
    setTimeout(() => {
      drawGame();
    }, 500);

  } catch (error) {
    console.error("Error initializing chess game:", error);
  }
}


function drawGame(): void {
  if (canvasManager && canvasManager.isImagesLoaded()) {
    console.log("Drawing game board");
    console.log("Current board state:", gameManager.getBoard());
    canvasManager.drawBoard(gameManager.getBoard());
  } else {
    // Retry drawing after a short delay if images aren't loaded yet
    setTimeout(drawGame, 100);
  }
}