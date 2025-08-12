// Chess9000 UI Manager - Interface for updating the game UI

export interface CapturedPiece {
  type: string; // e.g., 'pawn', 'rook', 'knight', 'bishop', 'queen', 'king'
  color: 'white' | 'black';
  imageUrl: string;
}

export interface GameScore {
  playerScore: number;
  opponentScore: number;
}

export interface GameTimers {
  playerTime: number; // time in milliseconds
  opponentTime: number; // time in milliseconds
}

export interface MoveEntry {
  moveNumber: number;
  whiteMove: string;
  blackMove?: string;
}

export class Chess9000UI {
  private static instance: Chess9000UI;
  private dialogContainer: HTMLElement | null = null;
  
  private constructor() {
    this.initializeDialogContainer();
  }

  /**
   * Show a dedicated promotion selection dialog returning chosen piece type string.
   */
  public async promotionDialog(color: 'white'|'black'): Promise<'queen'|'rook'|'bishop'|'knight'> {
    return new Promise(resolve => {
      this.initializeDialogContainer();
      const dialog = document.createElement('div');
      dialog.className = 'pulldown-dialog';
      const backdrop = document.createElement('div');
      backdrop.className = 'dialog-backdrop';
      const content = document.createElement('div');
      content.className = 'dialog-content';
      const messageElement = document.createElement('div');
      messageElement.className = 'dialog-message';
      messageElement.textContent = 'Promote pawn to:';
      const buttons = document.createElement('div');
      buttons.className = 'dialog-buttons promotion-buttons';
      const options: Array<{key:string; label:string}> = [
        { key: 'queen', label: 'Queen' },
        { key: 'rook', label: 'Rook' },
        { key: 'bishop', label: 'Bishop' },
        { key: 'knight', label: 'Knight' }
      ];
      const finish = (choice: 'queen'|'rook'|'bishop'|'knight') => {
        this.hideDialog(dialog, () => resolve(choice));
      };
      options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'dialog-button good';
        btn.textContent = opt.label;
        btn.addEventListener('click', () => finish(opt.key as any));
        buttons.appendChild(btn);
      });
      backdrop.addEventListener('click', () => finish('queen')); // default queen
      content.appendChild(messageElement);
      content.appendChild(buttons);
      dialog.appendChild(backdrop);
      dialog.appendChild(content);
      if (this.dialogContainer) {
        this.dialogContainer.appendChild(dialog);
        this.showDialog(dialog);
      }
    });
  }
  
  public static getInstance(): Chess9000UI {
    if (!Chess9000UI.instance) {
      Chess9000UI.instance = new Chess9000UI();
    }
    return Chess9000UI.instance;
  }

  /**
   * Initialize the dialog container if it doesn't exist
   */
  private initializeDialogContainer(): void {
    if (!this.dialogContainer) {
      this.dialogContainer = document.createElement('div');
      this.dialogContainer.id = 'chess9000-dialog-container';
      this.dialogContainer.className = 'dialog-container';
      document.body.appendChild(this.dialogContainer);
    }
  }

  /**
   * Show a slide down dialog with a message and two response options
   * @param message - The message to display in the dialog
   * @param goodResponse - Text for the positive/good response button
   * @param badResponse - Text for the negative/bad response button
   * @returns Promise<boolean> - true if good response was clicked, false if bad response was clicked
   */
  public async pulldownDialog(message: string, goodResponse: string, badResponse: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.initializeDialogContainer();
      
      // Create dialog structure
      const dialog = document.createElement('div');
      dialog.className = 'pulldown-dialog';
      
      // Dialog backdrop
      const backdrop = document.createElement('div');
      backdrop.className = 'dialog-backdrop';
      
      // Dialog content
      const content = document.createElement('div');
      content.className = 'dialog-content';
      
      // Message
      const messageElement = document.createElement('div');
      messageElement.className = 'dialog-message';
      messageElement.textContent = message;
      
      // Button container
      const buttonContainer = document.createElement('div');
      buttonContainer.className = 'dialog-buttons';
      
      // Good response button
      const goodButton = document.createElement('button');
      goodButton.className = 'dialog-button good';
      goodButton.textContent = goodResponse;
      
      // Bad response button
      const badButton = document.createElement('button');
      badButton.className = 'dialog-button bad';
      badButton.textContent = badResponse;
      
      // Handle good button click
      goodButton.addEventListener('click', () => {
        this.hideDialog(dialog, () => resolve(true));
      });
      
      // Handle bad button click
      badButton.addEventListener('click', () => {
        this.hideDialog(dialog, () => resolve(false));
      });
      
      // Handle backdrop click (dismiss as bad response)
      backdrop.addEventListener('click', () => {
        this.hideDialog(dialog, () => resolve(false));
      });
      
      // Handle escape key (dismiss as bad response)
      const handleKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          document.removeEventListener('keydown', handleKeydown);
          this.hideDialog(dialog, () => resolve(false));
        }
      };
      document.addEventListener('keydown', handleKeydown);
      
      // Assemble dialog
      buttonContainer.appendChild(goodButton);
      buttonContainer.appendChild(badButton);
      content.appendChild(messageElement);
      content.appendChild(buttonContainer);
      dialog.appendChild(backdrop);
      dialog.appendChild(content);
      
      // Add to container and show
      if (this.dialogContainer) {
        this.dialogContainer.appendChild(dialog);
        this.showDialog(dialog);
      }
    });
  }

  /**
   * Show the dialog with slide down animation
   */
  private showDialog(dialog: HTMLElement): void {
    // Force reflow to ensure initial state is applied
    dialog.offsetHeight;
    
    // Add show class to trigger animation
    setTimeout(() => {
      dialog.classList.add('show');
    }, 10);
  }

  /**
   * Hide the dialog with slide up animation
   */
  private hideDialog(dialog: HTMLElement, callback: () => void): void {
    dialog.classList.remove('show');
    dialog.classList.add('hide');
    
    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      if (this.dialogContainer && this.dialogContainer.contains(dialog)) {
        this.dialogContainer.removeChild(dialog);
      }
      callback();
    }, 300); // Match the CSS transition duration
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
    const playerScore = document.getElementById('playerScore');
    const opponentScore = document.getElementById('opponentScore');

    if (playerScore) {
      playerScore.textContent = scores.playerScore.toString();
      // Set color based on score value
      if (scores.playerScore > 0) {
        playerScore.style.color = '#10b981'; // Green for positive
        playerScore.style.fontWeight = 'bold';
      } else if (scores.playerScore < 0) {
        playerScore.style.color = '#ef4444'; // Red for negative
        playerScore.style.fontWeight = 'bold';
      } else {
        playerScore.style.color = '#1e293b'; // Default color for zero
        playerScore.style.fontWeight = 'bold';
      }
    }

    if (opponentScore) {
      opponentScore.textContent = scores.opponentScore.toString();
      // Set color based on score value
      if (scores.opponentScore > 0) {
        opponentScore.style.color = '#10b981'; // Green for positive
        opponentScore.style.fontWeight = 'bold';
      } else if (scores.opponentScore < 0) {
        opponentScore.style.color = '#ef4444'; // Red for negative
        opponentScore.style.fontWeight = 'bold';
      } else {
        opponentScore.style.color = '#1e293b'; // Default color for zero
        opponentScore.style.fontWeight = 'bold';
      }
    }
  }

  /**
   * Update the timer display
   * @param timers - Current game timers
   */
  public updateTimers(timers: GameTimers): void {
    const playerTime = document.getElementById('playerTime');
    const opponentTime = document.getElementById('opponentTime');

    if (playerTime) playerTime.textContent = this.formatTime(timers.playerTime);
    if (opponentTime) opponentTime.textContent = this.formatTime(timers.opponentTime);
  }

  /**
   * Format time in milliseconds to MM:SS
   * @param timeMs - Time in milliseconds
   * @returns Formatted time string
   */
  private formatTime(timeMs: number): string {
    const totalSeconds = Math.max(0, Math.floor(timeMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const secondsStr = seconds < 10 ? '0' + seconds : seconds.toString();
    return `${minutes}:${secondsStr}`;
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
    this.updateScores({ playerScore: 0, opponentScore: 0 });
    this.updateTimers({ playerTime: 20 * 60 * 1000, opponentTime: 20 * 60 * 1000 });
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

// Show pulldown dialog
const result = await ui.pulldownDialog(
  "Your opponent has requested a draw. Do you accept?",
  "Accept",
  "Decline"
);

if (result) {
  console.log("Player accepted the draw");
} else {
  console.log("Player declined the draw");
}

// Another example
const quitResult = await ui.pulldownDialog(
  "Are you sure you want to quit the game?",
  "Yes, Quit",
  "Cancel"
);

if (quitResult) {
  // Handle quit game
} else {
  // Continue playing
}
*/
