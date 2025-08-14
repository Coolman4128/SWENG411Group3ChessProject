import { io } from "socket.io-client";
import { CanvasManager } from "./Game/canvasmanager";
import { Board } from "./Game/board";
import { Piece, BoardCords } from "./Game/piece";
import { PieceType } from "./Enums/pieces";
import { GameManager } from "./Game/gamemanager";
import { Chess9000UI, getPieceImageUrl } from "./UI/chess9000ui";
import { SoundManager } from "./UI/soundmanager"; // added

// Socket will be initialized when user clicks launch button
let socket: any = null;

let canvasManager: CanvasManager;
let gameManager: GameManager;
let board: Board;
let ui: Chess9000UI;
const sound = SoundManager.getInstance(); // added

// Test function for the pulldown dialog - can be called from browser console
(window as any).testDialog = async () => {
  const result = await ui.pulldownDialog(
    "This is a test dialog. Choose your response!",
    "Good Choice",
    "Bad Choice"
  );
  console.log("Dialog result:", result ? "Good" : "Bad");
};

document.addEventListener("DOMContentLoaded", () => {
  // Initialize the UI
  ui = Chess9000UI.getInstance();
  setupSettingsMenu(); // added
  
  // Set up launch button functionality
  setupLaunchScreen();

  // Initialize the game (but keep it hidden initially)
  initializeChessGame();
});

function initializeSocketConnection(): void {
  // Initialize Socket.IO client - connect to the same host and port as the webpage
  socket = io();

  // Socket.IO event listeners
  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);

    gameManager.setPlayerID(socket.id ?? "");
    gameManager.setSocket(socket);

    // Update connection status in lobby
    const connectionStatus = document.getElementById("connectionStatus");
    if (connectionStatus) {
      connectionStatus.textContent = "Connected";
      connectionStatus.className = "status-value connected";
    }

    socket.on("gameState", (data: any) => {
      console.log("Received game state:", data);
      // Update the game state in the game manager
      var dataObject = JSON.parse(data);
      gameManager.loadGameState(dataObject);
      
      // Update lobby opponent status based on game state
      updateLobbyOpponentStatus(dataObject);
      
      // Update the turn indicator in the UI
      updateTurnIndicator();
      
      // Update move history in the UI
      updateMoveHistory(dataObject.turnList);
      
      // Update timers in the UI
      updateTimers();
      
      // Preserve the currently selected piece when redrawing
  drawGame(gameManager.getSelectedPiece());
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      // Update connection status in lobby
      const connectionStatus = document.getElementById("connectionStatus");
      if (connectionStatus) {
        connectionStatus.textContent = "Disconnected";
        connectionStatus.className = "status-value disconnected";
      }
    });
    
    socket.on("pieceCaptured", (data: any) => {
      console.log("Piece captured:", data);
      // Update captured pieces UI
      updateCapturedPieces(data);
    });

    socket.on("promote", async (data: any) => {
      // Only prompt the player who owns the pawn
      try {
        if (!data || !data.pieceId) return;
        const { pieceId, color, choices } = data;
        if (color !== gameManager.getPlayerColor()) {
          // Not this player's pawn; just wait for opponent's choice
          return;
        }
        const selection = await ui.promotionDialog(color);
        // Map selection to PieceType numeric (import locally to avoid circular refs at runtime)
        const { PieceType } = await import('./Enums/pieces');
        const mapping: any = { queen: PieceType.QUEEN, rook: PieceType.ROOK, bishop: PieceType.BISHOP, knight: PieceType.KNIGHT };
        const newType = mapping[selection] ?? PieceType.QUEEN;
        if (!choices.includes(newType)) {
          // fallback if server choices restricted
            const fallback = choices.find((c:number)=> c === PieceType.QUEEN) ?? choices[0];
            socket.emit('promotionChoice', { pieceId, newType: fallback });
        } else {
          socket.emit('promotionChoice', { pieceId, newType });
        }
      } catch (e) {
        console.error('Error handling promote event', e);
      }
    });

    socket.on("drawRequest", async (data: any) => {
      console.log("Draw request received:", data);
      const result = await ui.pulldownDialog(
        "Your opponent has requested a draw. Do you accept?",
        "Accept Draw",
        "Decline"
      );
      
      socket.emit("drawResponse", { accept: result });
    });

    socket.on("drawDeclined", async () => {
      console.log("Draw request was declined");
      const result = await ui.pulldownDialog(
        "Your draw request was declined. What would you like to do?",
        "Keep Playing",
        "Concede"
      );
      
      if (!result) {
        // Player chose to concede
        socket.emit("concede");
      }
    });

    socket.on("gameEnded", async (data: any) => {
      console.log("Game ended:", data);
      sound.playGameEnd(); // play end sound
      let message = "";
      // Normalize winnerId (server now always sends winner as socket id) and winnerColor if available
      const winnerId = data.winnerId || data.winner; // socket id of winner
      const winnerColor = data.winnerColor; // optional color string
      const playerSocketId = socket.id;
      const playerColor = gameManager.getPlayerColor();
      let didPlayerWin = false;
      if (winnerColor && playerColor) {
        didPlayerWin = winnerColor === playerColor;
      } else if (winnerId) {
        didPlayerWin = winnerId === playerSocketId;
      }
      if (data.reason === "draw") {
        message = "Game ended in a draw!";
      } else if (data.reason === "concede") {
        message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} by concession!`;
      } else if (data.reason === "checkmate") {
        message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} by checkmate!`;
      } else if (data.reason === "stalemate") {
        message = "Game ended in a stalemate!";
      } else if (data.reason === "timeout") {
        message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} by timeout!`;
      } else if (data.reason === "playerLeft") {
        message = `Game ended - ${didPlayerWin ? "You won" : "You lost"} because the opponent left!`;
      }
      const playAgain = await ui.pulldownDialog(message, "Play Again", "Leave");
      if (playAgain) {
        // Player wants to play again
        console.log("Player chose to play again");
        socket.emit("playAgain");
      } else {
        // Player wants to leave
        console.log("Player chose to leave");
        socket.emit("leaveGame");
      }
    });

    socket.on("gameStarting", () => {
      console.log("Game is starting!");
      const lobbyDialog = document.getElementById("lobbyDialog");
      const gameContainer = document.getElementById("gameContainer");
      
      if (lobbyDialog && gameContainer) {
        // Hide lobby dialog
        lobbyDialog.style.display = "none";
        
        // Show game container
        gameContainer.style.display = "flex";
        
        // Redraw the game to ensure proper rendering
        setTimeout(() => {
          drawGame();
        }, 100);
      }
    });

    socket.on("returnToLobby", () => {
      console.log("Returning to lobby for new game");
      returnToLobby();
    });

    socket.on("returnToMainMenu", () => {
      console.log("Returning to main menu");
      returnToMainMenu();
    });

    socket.on("moveResult", (result: any) => {
      console.log("Move result:", result);
      // If the move was successful, clear the selected piece
      if (result.success) {
        sound.playMove(); // play move sound
        gameManager.clearSelection();
        // Redraw the game to show the cleared selection
        drawGame();
      }
    });
  });
}

function updateLobbyOpponentStatus(gameState: any): void {
  const opponentStatus = document.getElementById("opponentStatus");
  const startGameBtn = document.getElementById("startGameBtn") as HTMLButtonElement;
  
  if (opponentStatus && startGameBtn && socket) {
    const currentPlayerId = socket.id;
    const hasWhitePlayer = gameState.whitePlayer !== null;
    const hasBlackPlayer = gameState.blackPlayer !== null;
    const bothPlayersConnected = hasWhitePlayer && hasBlackPlayer;
    
    if (bothPlayersConnected) {
      opponentStatus.textContent = "Opponent joined!";
      opponentStatus.className = "status-value ready";
      startGameBtn.disabled = false;
    } else {
      opponentStatus.textContent = "Waiting for opponent...";
      opponentStatus.className = "status-value waiting";
      startGameBtn.disabled = true;
    }
  }
}

function setupLaunchScreen(): void {
  const launchButton = document.getElementById("launchButton");
  const launchScreen = document.getElementById("launchScreen");
  const lobbyDialog = document.getElementById("lobbyDialog");

  if (launchButton && launchScreen && lobbyDialog) {
    launchButton.addEventListener("click", () => {
      // Initialize socket connection when user clicks launch
      initializeSocketConnection();
      
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
      // Disconnect from socket if connected
      if (socket) {
        socket.disconnect();
        socket = null;
      }
      
      // Hide lobby dialog and return to launch screen
      lobbyDialog.style.display = "none";
      const launchScreen = document.getElementById("launchScreen");
      if (launchScreen) {
        launchScreen.classList.remove("hidden");
      }
      
      // Reset lobby status
      const connectionStatus = document.getElementById("connectionStatus");
      if (connectionStatus) {
        connectionStatus.textContent = "Disconnected";
        connectionStatus.className = "status-value disconnected";
      }
      if (opponentStatus) {
        opponentStatus.textContent = "Waiting for opponent...";
        opponentStatus.className = "status-value waiting";
      }
      if (startGameBtn) {
        (startGameBtn as HTMLButtonElement).disabled = true;
      }
    });
  }

  // Setup start game button
  if (startGameBtn && socket) {
    startGameBtn.addEventListener("click", () => {
      console.log("Starting game...");
      // Send start game message to server
      socket.emit("startGame");
    });
  }
}

function initializeChessGame(): void {
  try {
    // Initialize the canvas manager
    gameManager = new GameManager();
    canvasManager = new CanvasManager("chessCanvas");

    // Initialize UI and reset it to clean state
    ui.resetUI();

    // Initialize scores
    updateScores();

    // Setup action buttons with dialog handlers
    ui.setupActionButtons(handleDrawRequest, handleConcede);

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
  const gs: any = gameManager.getGameStateRaw() ?? null;
    let lastFrom = gs?.lastMoveFrom ? { x: gs.lastMoveFrom.x, y: gs.lastMoveFrom.y } : null;
    let lastTo = gs?.lastMoveTo ? { x: gs.lastMoveTo.x, y: gs.lastMoveTo.y } : null;

    // Determine if player's king (or opponent's) is in check to highlight that square
    let inCheckSquare: { x: number; y: number } | null = null;
    if (gs) {
      const board = gameManager.getBoard();
      const whiteInCheck = gs.whiteInCheck;
      const blackInCheck = gs.blackInCheck;
      if (whiteInCheck) {
        const kingPos = findKingPosition('white', board);
        if (kingPos) inCheckSquare = { x: kingPos.x, y: kingPos.y };
      }
      if (blackInCheck) {
        const kingPos = findKingPosition('black', board);
        if (kingPos) inCheckSquare = { x: kingPos.x, y: kingPos.y };
      }
    }

    canvasManager.drawBoard(gameManager.getBoard(), selectPiece, gameManager.getPlayerColor(), lastFrom, lastTo, inCheckSquare);
  } else {
    setTimeout(() => drawGame(selectPiece), 100);
  }
}

function findKingPosition(color: string, board: Board): BoardCords | null {
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const piece = board.getPieceAt(x, y);
      if (piece && piece.getColor() === color && piece.getType() === PieceType.KING) {
        return new BoardCords(x, y);
      }
    }
  }
  return null;
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

function updateTimers(): void {
  if (ui && gameManager) {
    const playerTime = gameManager.getPlayerTime();
    const opponentTime = gameManager.getOpponentTime();
    
    ui.updateTimers({
      playerTime: playerTime,
      opponentTime: opponentTime
    });
  }
}

function updateScores(): void {
  if (ui && gameManager) {
    const playerScore = gameManager.getPlayerScore();
    const opponentScore = gameManager.getOpponentScore();
    
    ui.updateScores({
      playerScore: playerScore,
      opponentScore: opponentScore
    });
  }
}

function updateCapturedPieces(captureData: any): void {
  if (ui && captureData && captureData.piece) {
    const piece = captureData.piece;
    
    // Convert piece type number to string
    const pieceTypeString = getPieceTypeName(piece.type);
    
    // Determine if this was a player capture or opponent capture
    const isPlayerCapture = piece.color !== gameManager.getPlayerColor();
    
    // Create a piece object for score tracking
    const capturedPiece = new Piece(piece.type, piece.color, piece.id);
    
    // Add to game manager's captured pieces tracking
    gameManager.addCapturedPiece(capturedPiece, isPlayerCapture);
    
    // Add the captured piece to the UI
    ui.addCapturedPiece({
      type: pieceTypeString,
      color: piece.color,
      imageUrl: getPieceImageUrl(pieceTypeString, piece.color)
    }, isPlayerCapture);
    
    // Update scores in the UI
    updateScores();
  }
}

function setupActionButtons(
  onRequestDraw: () => void,
  onConcede: () => void
): void {
  const drawBtn = document.getElementById('requestDrawBtn');
  const concedeBtn = document.getElementById('concedeBtn');
  
  if (drawBtn) {
    drawBtn.addEventListener('click', onRequestDraw);
  }
  
  if (concedeBtn) {
    concedeBtn.addEventListener('click', onConcede);
  }
}

async function handleDrawRequest(): Promise<void> {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }
  console.log("Requesting draw...");
  socket.emit("requestDraw");
}

async function handleConcede(): Promise<void> {
  if (!socket) {
    console.error("Socket not connected");
    return;
  }
  
  const result = await ui.pulldownDialog(
    "Are you sure you want to concede this game?",
    "Yes, Concede",
    "Keep Playing"
  );
  
  if (result) {
    console.log("Game conceded!");
    socket.emit("concede");
  } else {
    console.log("Continuing to play!");
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

function returnToLobby(): void {
  const gameContainer = document.getElementById("gameContainer");
  const lobbyDialog = document.getElementById("lobbyDialog");
  
  if (gameContainer && lobbyDialog) {
    // Hide game container
    gameContainer.style.display = "none";
    
    // Show lobby dialog
    lobbyDialog.style.display = "flex";
    
    // Reset the UI
    ui.resetUI();
    
    // Reset game manager
    gameManager = new GameManager();
    if (socket) {
      gameManager.setPlayerID(socket.id);
      gameManager.setSocket(socket);
    }
    
    console.log("Returned to lobby, waiting for opponent or game start");
  }
}

function returnToMainMenu(): void {
  const gameContainer = document.getElementById("gameContainer");
  const lobbyDialog = document.getElementById("lobbyDialog");
  const launchScreen = document.getElementById("launchScreen");
  
  if (gameContainer && lobbyDialog && launchScreen) {
    // Hide game container and lobby
    gameContainer.style.display = "none";
    lobbyDialog.style.display = "none";
    
    // Show launch screen
    launchScreen.classList.remove("hidden");
    
    // Reset UI and game state
    ui.resetUI();
    gameManager = new GameManager();
    
    // Clear socket reference
    socket = null;
    
    console.log("Returned to main menu");
  }
}

function setupSettingsMenu() {
  const gear = document.querySelector('.settings-icon');
  const menu = document.getElementById('settingsDropdown');
  const muteToggle = document.getElementById('muteSfxToggle') as HTMLInputElement | null;
  if (!gear) return;
  if (muteToggle) {
    muteToggle.checked = sound.isMuted();
    muteToggle.addEventListener('change', () => {
      sound.setMuted(muteToggle.checked);
    });
  }
  gear.addEventListener('click', (e) => {
    e.stopPropagation();
    if (menu) menu.classList.toggle('open');
  });
  document.addEventListener('click', (e) => {
    if (menu && !menu.contains(e.target as Node) && !(e.target as HTMLElement).classList.contains('settings-icon')) {
      menu.classList.remove('open');
    }
  });
}