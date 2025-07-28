// Chess9000 UI Manager - Interface for updating the game UI

export interface CapturedPiece {
  type: string; // e.g., 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
  color: 'white' | 'black';
  imageUrl: string;
}

export interface GameScore {
  playerPieces: number;
  playerScore: number;
  opponentPieces: number;
  opponentScore: number;
}

export interface MoveEntry {
  moveNumber: number;
  whiteMove: string;
  blackMove?: string;
}

export class Chess9000UI {
  private static instance: Chess9000UI;
  
  private constructor() {}
  
  public static getInstance(): Chess9000UI {
    if (!Chess9000UI.instance) {
      Chess9000UI.instance = new Chess9000UI();
    }
    return Chess9000UI.instance;
  }

  /**
   * Update the turn indicator
   * @param isPlayerTurn - true if it's the player's turn, false if opponent's turn
   */
  public updateTurnIndicator(isPlayerTurn: boolean): void {
    const indicator = document.getElementById('turnIndicator');
    if (indicator) {
      indicator.textContent = isPlayerTurn ? 'Your Turn' : "Opponent's Turn";
      indicator.className = `turn-indicator ${isPlayerTurn ? 'your-turn' : 'opponent-turn'}`;
    }
  }

  /**
   * Add a captured piece to the display
   * @param piece - The captured piece details
   * @param isPlayerCapture - true if player captured the piece, false if opponent did
   */
  public addCapturedPiece(piece: CapturedPiece, isPlayerCapture: boolean): void {
    const containerId = isPlayerCapture ? 'playerCaptured' : 'opponentCaptured';
    const container = document.getElementById(containerId);
    
    if (container) {
      const pieceElement = document.createElement('div');
      pieceElement.className = 'captured-piece';
      pieceElement.style.backgroundImage = `url(${piece.imageUrl})`;
      pieceElement.title = `${piece.color} ${piece.type}`;
      container.appendChild(pieceElement);
    }
  }

  /**
   * Update the score display
   * @param scores - Current game scores
   */
  public updateScores(scores: GameScore): void {
    const playerPieceCount = document.getElementById('playerPieceCount');
    const playerScore = document.getElementById('playerScore');
    const opponentPieceCount = document.getElementById('opponentPieceCount');
    const opponentScore = document.getElementById('opponentScore');

    if (playerPieceCount) playerPieceCount.textContent = scores.playerPieces.toString();
    if (playerScore) playerScore.textContent = scores.playerScore.toString();
    if (opponentPieceCount) opponentPieceCount.textContent = scores.opponentPieces.toString();
    if (opponentScore) opponentScore.textContent = scores.opponentScore.toString();
  }

  /**
   * Add a move to the move history
   * @param move - The move details
   */
  public addMove(move: MoveEntry): void {
    const movesList = document.getElementById('movesList');
    if (movesList) {
      const moveElement = document.createElement('div');
      moveElement.className = 'move-item';
      
      const moveNumber = document.createElement('span');
      moveNumber.className = 'move-number';
      moveNumber.textContent = `${move.moveNumber}.`;
      
      const moveNotation = document.createElement('span');
      moveNotation.className = 'move-notation';
      moveNotation.textContent = move.blackMove 
        ? `${move.whiteMove} ${move.blackMove}` 
        : move.whiteMove;
      
      moveElement.appendChild(moveNumber);
      moveElement.appendChild(moveNotation);
      movesList.appendChild(moveElement);
      
      // Auto-scroll to bottom
      movesList.scrollTop = movesList.scrollHeight;
    }
  }

  /**
   * Clear all moves from the history
   */
  public clearMoveHistory(): void {
    const movesList = document.getElementById('movesList');
    if (movesList) {
      movesList.innerHTML = '';
    }
  }

  /**
   * Clear all captured pieces
   */
  public clearCapturedPieces(): void {
    const playerCaptured = document.getElementById('playerCaptured');
    const opponentCaptured = document.getElementById('opponentCaptured');
    
    if (playerCaptured) playerCaptured.innerHTML = '';
    if (opponentCaptured) opponentCaptured.innerHTML = '';
  }

  /**
   * Set up event listeners for the action buttons
   * @param onRequestDraw - Callback for draw request
   * @param onConcede - Callback for concede
   */
  public setupActionButtons(
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

  /**
   * Enable or disable action buttons
   * @param enabled - Whether buttons should be enabled
   */
  public setActionButtonsEnabled(enabled: boolean): void {
    const drawBtn = document.getElementById('requestDrawBtn') as HTMLButtonElement;
    const concedeBtn = document.getElementById('concedeBtn') as HTMLButtonElement;
    
    if (drawBtn) drawBtn.disabled = !enabled;
    if (concedeBtn) concedeBtn.disabled = !enabled;
  }

  /**
   * Reset the UI to initial state
   */
  public resetUI(): void {
    this.clearMoveHistory();
    this.clearCapturedPieces();
    this.updateScores({ playerPieces: 0, playerScore: 0, opponentPieces: 0, opponentScore: 0 });
    this.updateTurnIndicator(true); // Assuming player starts
    this.setActionButtonsEnabled(true);
  }
}

// Piece value constants for scoring
export const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0 // King is invaluable
};

// Helper function to get piece image URL
export function getPieceImageUrl(piece: string, color: 'white' | 'black'): string {
  return `${color}-${piece}.png`;
}

// Example usage in your game logic:
/*
const ui = Chess9000UI.getInstance();

// Initialize the UI
ui.setupActionButtons(
  () => console.log('Draw requested'),
  () => console.log('Game conceded')
);

// Update turn
ui.updateTurnIndicator(true);

// Add captured piece
ui.addCapturedPiece({
  type: 'pawn',
  color: 'black',
  imageUrl: getPieceImageUrl('pawn', 'black')
}, true);

// Update scores
ui.updateScores({
  playerPieces: 1,
  playerScore: 1,
  opponentPieces: 0,
  opponentScore: 0
});

// Add move
ui.addMove({
  moveNumber: 1,
  whiteMove: 'e4',
  blackMove: 'e5'
});
*/
