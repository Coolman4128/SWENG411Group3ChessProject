import { io } from "socket.io-client";
import { CanvasManager } from "./Game/canvasmanager";
import { Board } from "./Game/board";
import { Piece } from "./Game/piece";
import { PieceType } from "./Enums/pieces";
import { GameManager } from "./Game/gamemanager";
import { Chess9000UI, getPieceImageUrl } from "./UI/chess9000ui";

// Initialize Socket.IO client for localhost on port 3000
const socket = io("http://localhost:3000");

let canvasManager: CanvasManager;
let gameManager: GameManager;
let board: Board;
let ui: Chess9000UI;

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the UI
  ui = Chess9000UI.getInstance();
  
  // Set up launch button functionality
  setupLaunchScreen();

  // Initialize the game (but keep it hidden initially)
  initializeChessGame();

  // Socket.IO event listeners
  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);

    gameManager.setPlayerID(socket.id ?? "");
    gameManager.setSocket(socket);

    socket.on("gameState", (data) => {
      console.log("Received game state:", data);
      // Update the game state in the game manager
      var dataObject = JSON.parse(data);
      gameManager.loadGameState(dataObject);
      
      // Update the turn indicator in the UI
      updateTurnIndicator();
      
      // Update move history in the UI
      updateMoveHistory(dataObject.turnList);
      
      drawGame();
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
    });
    
    socket.on("pieceCaptured", (data) => {
      console.log("Piece captured:", data);
      // Update captured pieces UI
      updateCapturedPieces(data);
    });
  });
});

function setupLaunchScreen(): void {
  const launchButton = document.getElementById("launchButton");
  const launchScreen = document.getElementById("launchScreen");
  const lobbyDialog = document.getElementById("lobbyDialog");

  if (launchButton && launchScreen && lobbyDialog) {
    launchButton.addEventListener("click", () => {
      // Hide launch screen
      launchScreen.classList.add("hidden");
      
      // Show lobby dialog
      lobbyDialog.style.display = "flex";
      
      // Initialize lobby functionality
      setupLobby();
    });
  }
}

function setupLobby(): void {
  const startGameBtn = document.getElementById("startGameBtn");
  const leaveLobbyBtn = document.getElementById("leaveLobbyBtn");
  const lobbyDialog = document.getElementById("lobbyDialog");
  const gameContainer = document.getElementById("gameContainer");
  const opponentStatus = document.getElementById("opponentStatus");

  // Setup leave lobby button
  if (leaveLobbyBtn && lobbyDialog) {
    leaveLobbyBtn.addEventListener("click", () => {
      // Hide lobby dialog and return to launch screen
      lobbyDialog.style.display = "none";
      const launchScreen = document.getElementById("launchScreen");
      if (launchScreen) {
        launchScreen.classList.remove("hidden");
      }
    });
  }

  // Setup start game button
  if (startGameBtn && lobbyDialog && gameContainer) {
    startGameBtn.addEventListener("click", () => {
      // Hide lobby dialog
      lobbyDialog.style.display = "none";
      
      // Show game container
      gameContainer.style.display = "flex";
      
      // Redraw the game to ensure proper rendering
      setTimeout(() => {
        drawGame();
      }, 100);
    });
  }

  // Simulate opponent joining after 3 seconds (replace with actual socket logic later)
  setTimeout(() => {
    if (opponentStatus && startGameBtn) {
      opponentStatus.textContent = "Opponent joined!";
      opponentStatus.className = "status-value ready";
      (startGameBtn as HTMLButtonElement).disabled = false;
    }
  }, 3000);
}

function initializeChessGame(): void {
  try {
    // Initialize the canvas manager
    gameManager = new GameManager();
    canvasManager = new CanvasManager("chessCanvas");

    // Initialize UI and reset it to clean state
    ui.resetUI();

    // Add click listener for piece movement
    canvasManager.addClickListener((row, col) => {
      console.log(`Clicked on square: ${row}, ${col}`);
      const piece = gameManager.getBoard().getPieceAt(row, col);
      if (piece) {
        if (gameManager.getPlayerColor() === piece.getColor()){
          gameManager.selectPiece(piece);
        }
        else if (gameManager.getSelectedPiece() !== null){
          gameManager.attemptTakePiece(piece);
        }
      }
      else {
        gameManager.attemptMovePiece(row, col);
      }

      drawGame(gameManager.getSelectedPiece());
    });

    // Wait a bit for images to load, then draw the board
    setTimeout(() => {
      drawGame();
    }, 500);

  } catch (error) {
    console.error("Error initializing chess game:", error);
  }
}


function drawGame(selectPiece: Piece | null = null): void {
  if (canvasManager && canvasManager.isImagesLoaded()) {
    console.log("Drawing game board");
    console.log("Current board state:", gameManager.getBoard());
    canvasManager.drawBoard(gameManager.getBoard(), selectPiece);
  } else {
    // Retry drawing after a short delay if images aren't loaded yet
    setTimeout(() => drawGame(selectPiece), 100);
  }
}

function updateTurnIndicator(): void {
  if (ui && gameManager) {
    const isPlayerTurn = gameManager.getIsTurn();
    ui.updateTurnIndicator(isPlayerTurn);
  }
}

function updateMoveHistory(turnList: string[][]): void {
  if (ui && turnList) {
    // Clear existing move history
    ui.clearMoveHistory();
    
    // Group moves by pairs (white move, black move)
    for (let i = 0; i < turnList.length; i += 2) {
      const moveNumber = Math.floor(i / 2) + 1;
      const whiteMove = turnList[i] ? turnList[i][0] : '';
      const blackMove = turnList[i + 1] ? turnList[i + 1][0] : undefined;
      
      ui.addMove({
        moveNumber: moveNumber,
        whiteMove: whiteMove,
        blackMove: blackMove
      });
    }
  }
}

function updateCapturedPieces(captureData: any): void {
  if (ui && captureData && captureData.piece) {
    const piece = captureData.piece;
    
    // Convert piece type number to string
    const pieceTypeString = getPieceTypeName(piece.type);
    
    // Determine if this was a player capture or opponent capture
    const isPlayerCapture = piece.color !== gameManager.getPlayerColor();
    
    // Add the captured piece to the UI
    ui.addCapturedPiece({
      type: pieceTypeString,
      color: piece.color,
      imageUrl: getPieceImageUrl(pieceTypeString, piece.color)
    }, isPlayerCapture);
  }
}

function getPieceTypeName(pieceType: number): string {
  switch (pieceType) {
    case PieceType.PAWN: return 'pawn';
    case PieceType.ROOK: return 'rook';
    case PieceType.KNIGHT: return 'knight';
    case PieceType.BISHOP: return 'bishop';
    case PieceType.QUEEN: return 'queen';
    case PieceType.KING: return 'king';
    default: return 'unknown';
  }
}