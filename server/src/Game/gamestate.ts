import { Board } from "./board";
import { Piece, BoardCords } from "./piece";
import { PieceType } from "../Enums/pieces";

export interface MoveResult {
    success: boolean;
    message?: string;
    capturedPiece?: Piece;
    isCheckmate?: boolean;
    isDraw?: boolean;
    isCheck?: boolean;
}

export class GameState {
    public whitePlayer: string | null;
    public blackPlayer: string | null;

    public currentTurn: string; // "white" or "black"

    public turnList: string[][] = []; // List of turns made in the game

    public board: Board;

    // Timer properties (time in milliseconds)
    public whiteTimeRemaining: number = 20 * 60 * 1000; // 20 minutes in milliseconds
    public blackTimeRemaining: number = 20 * 60 * 1000; // 20 minutes in milliseconds
    private turnStartTime: number = 0; // When the current turn started
    private gameStarted: boolean = false; // Has the first move been made?

    constructor() {
        this.whitePlayer = null;
        this.blackPlayer = null;
        this.currentTurn = "white"; // White starts first
        this.board = new Board();
    }

    /**
     * Attempts to move a piece from one position to another
     * @param playerId - The ID of the player making the move
     * @param fromX - Source X coordinate
     * @param fromY - Source Y coordinate
     * @param toX - Destination X coordinate
     * @param toY - Destination Y coordinate
     * @param eventEmitter - Function to emit events (socket.io)
     * @returns MoveResult indicating success/failure and additional information
     */
    public movePiece(
        playerId: string, 
        fromX: number, 
        fromY: number, 
        toX: number, 
        toY: number,
        eventEmitter?: (event: string, data: any) => void
    ): MoveResult {
        // 1. Validate the move is legit
        const validationResult = this.validateMove(playerId, fromX, fromY, toX, toY);
        if (!validationResult.success) {
            return validationResult;
        }

        const piece = this.board.getPieceAt(fromX, fromY)!;
        const targetPiece = this.board.getPieceAt(toX, toY);

        // 2. Move the piece and update gamestate
        // If there's a piece to capture, remove it from the pieces array
        if (targetPiece) {
            const pieceIndex = this.board.pieces.findIndex(p => p.id === targetPiece.id);
            if (pieceIndex !== -1) {
                this.board.pieces.splice(pieceIndex, 1);
            }
        }

        this.board.squares[toX][toY] = piece.id;
        this.board.squares[fromX][fromY] = 0;
        piece.setHasMoved(true);

        // Record the move in algebraic notation
        const moveNotation = this.generateMoveNotation(piece, fromX, fromY, toX, toY, targetPiece);
        this.turnList.push([moveNotation]);

        // Handle timer logic
        if (!this.gameStarted) {
            // First move - start the timer
            this.gameStarted = true;
            this.turnStartTime = Date.now();
        } else {
            // Update the time for the player who just moved
            this.updateCurrentPlayerTime();
            this.turnStartTime = Date.now();
        }

        // Change turn
        this.currentTurn = this.currentTurn === "white" ? "black" : "white";

        // 3. Check if a piece was captured and emit event
        if (targetPiece && eventEmitter) {
            eventEmitter("pieceCaptured", {
                piece: {
                    type: targetPiece.getType(),
                    color: targetPiece.getColor(),
                    position: { x: toX, y: toY }
                }
            });
        }

        // 4. Check for checkmate
        const isCheckmate = this.isPlayerInCheckmate(this.currentTurn);
        if (isCheckmate) {
            // TODO: Handle ending the game with a winner
            console.log(`Checkmate! ${this.currentTurn === "white" ? "Black" : "White"} wins!`);
            return {
                success: true,
                isCheckmate: true,
                message: `Checkmate! ${this.currentTurn === "white" ? "Black" : "White"} wins!`
            };
        }

        // 5. Check for draw (stalemate)
        const isDraw = this.isStalemate(this.currentTurn);
        if (isDraw) {
            // TODO: Handle drawing the game
            console.log("Stalemate! The game is a draw.");
            return {
                success: true,
                isDraw: true,
                message: "Stalemate! The game is a draw."
            };
        }

        // 6. Emit gamestate event with updated state
        if (eventEmitter) {
            eventEmitter("gameState", this.toJSON());
        }

        // Check if the current player is in check (for notification)
        const isCheck = Piece.isPlayerInCheck(this.currentTurn, this.board);

        return {
            success: true,
            capturedPiece: targetPiece || undefined,
            isCheck: isCheck,
            message: isCheck ? `${this.currentTurn} is in check!` : undefined
        };
    }

    /**
     * Attempts to take (capture) a piece
     * @param playerId - The ID of the player making the move
     * @param fromX - Source X coordinate
     * @param fromY - Source Y coordinate
     * @param toX - Destination X coordinate (where the piece to capture is)
     * @param toY - Destination Y coordinate (where the piece to capture is)
     * @param eventEmitter - Function to emit events (socket.io)
     * @returns MoveResult indicating success/failure and additional information
     */
    public takePiece(
        playerId: string,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        eventEmitter?: (event: string, data: any) => void
    ): MoveResult {
        // Taking a piece is essentially the same as moving a piece to an occupied square
        // The validation will check if it's a legal capture
        const targetPiece = this.board.getPieceAt(toX, toY);
        
        if (!targetPiece) {
            return {
                success: false,
                message: "No piece to capture at the target position."
            };
        }

        // Use the same logic as movePiece - it will handle the capture
        return this.movePiece(playerId, fromX, fromY, toX, toY, eventEmitter);
    }

    /**
     * Validates if a move is legal
     */
    private validateMove(playerId: string, fromX: number, fromY: number, toX: number, toY: number): MoveResult {
        // Check if it's the player's turn
        const playerColor = this.getPlayerColor(playerId);
        if (!playerColor) {
            return { success: false, message: "Player not in game." };
        }

        if (playerColor !== this.currentTurn) {
            return { success: false, message: "It's not your turn." };
        }

        // Check bounds
        if (fromX < 0 || fromX >= 8 || fromY < 0 || fromY >= 8 || toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
            return { success: false, message: "Move coordinates out of bounds." };
        }

        // Check if there's a piece at the source position
        const piece = this.board.getPieceAt(fromX, fromY);
        if (!piece) {
            return { success: false, message: "No piece at source position." };
        }

        // Check if the piece belongs to the current player
        if (piece.getColor() !== playerColor) {
            return { success: false, message: "That piece doesn't belong to you." };
        }

        // Check if the target position has a piece of the same color
        const targetPiece = this.board.getPieceAt(toX, toY);
        if (targetPiece && targetPiece.getColor() === playerColor) {
            return { success: false, message: "Cannot capture your own piece." };
        }

        // Check if the move is valid for this piece type
        const currentPos = new BoardCords(fromX, fromY);
        const targetPos = new BoardCords(toX, toY);
        const validMoves = piece.getValidMoves(currentPos, this.board);
        
        const isMoveValid = validMoves.some(move => move.equals(targetPos));
        if (!isMoveValid) {
            return { success: false, message: "Invalid move for this piece." };
        }

        return { success: true };
    }

    /**
     * Gets the player's color based on their ID
     */
    private getPlayerColor(playerId: string): string | null {
        if (this.whitePlayer === playerId) return "white";
        if (this.blackPlayer === playerId) return "black";
        return null;
    }

    /**
     * Checks if a player is in checkmate
     */
    private isPlayerInCheckmate(playerColor: string): boolean {
        // First check if the player is in check
        if (!Piece.isPlayerInCheck(playerColor, this.board)) {
            return false;
        }

        // If in check, see if there are any valid moves that get out of check
        return !this.hasValidMoves(playerColor);
    }

    /**
     * Checks if a player is in stalemate (no valid moves but not in check)
     */
    private isStalemate(playerColor: string): boolean {
        // If in check, it's not stalemate
        if (Piece.isPlayerInCheck(playerColor, this.board)) {
            return false;
        }

        // If not in check but has no valid moves, it's stalemate
        return !this.hasValidMoves(playerColor);
    }

    /**
     * Checks if a player has any valid moves
     */
    private hasValidMoves(playerColor: string): boolean {
        // Check all pieces of the given color
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = this.board.getPieceAt(x, y);
                if (piece && piece.getColor() === playerColor) {
                    const validMoves = piece.getValidMoves(new BoardCords(x, y), this.board);
                    if (validMoves.length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Generates algebraic notation for a move
     */
    private generateMoveNotation(piece: Piece, fromX: number, fromY: number, toX: number, toY: number, capturedPiece?: Piece | null): string {
        let notation = "";

        // Piece notation (except for pawns)
        if (piece.getType() !== PieceType.PAWN) {
            switch (piece.getType()) {
                case PieceType.KING: notation += "K"; break;
                case PieceType.QUEEN: notation += "Q"; break;
                case PieceType.ROOK: notation += "R"; break;
                case PieceType.BISHOP: notation += "B"; break;
                case PieceType.KNIGHT: notation += "N"; break;
            }
        }

        // For pawns, if capturing, include the file
        if (piece.getType() === PieceType.PAWN && capturedPiece) {
            notation += String.fromCharCode(97 + fromY); // Convert to letter (a-h)
        }

        // Capture notation
        if (capturedPiece) {
            notation += "x";
        }

        // Destination square
        notation += String.fromCharCode(97 + toY) + (8 - toX);

        return notation;
    }

    /**
     * Updates the time remaining for the current player
     */
    private updateCurrentPlayerTime(): void {
        if (this.turnStartTime > 0) {
            const elapsedTime = Date.now() - this.turnStartTime;
            if (this.currentTurn === "white") {
                this.whiteTimeRemaining = Math.max(0, this.whiteTimeRemaining - elapsedTime);
            } else {
                this.blackTimeRemaining = Math.max(0, this.blackTimeRemaining - elapsedTime);
            }
        }
    }

    /**
     * Gets the current time remaining for both players, accounting for the current turn
     */
    public getCurrentTimeRemaining(): { whiteTime: number; blackTime: number } {
        let whiteTime = this.whiteTimeRemaining;
        let blackTime = this.blackTimeRemaining;

        // If game has started and we're in the middle of a turn, subtract elapsed time
        if (this.gameStarted && this.turnStartTime > 0) {
            const elapsedTime = Date.now() - this.turnStartTime;
            if (this.currentTurn === "white") {
                whiteTime = Math.max(0, whiteTime - elapsedTime);
            } else {
                blackTime = Math.max(0, blackTime - elapsedTime);
            }
        }

        return { whiteTime, blackTime };
    }

    /**
     * Checks if either player has run out of time
     */
    public checkTimeOut(): { isTimeOut: boolean; winner?: string } {
        const times = this.getCurrentTimeRemaining();
        
        if (times.whiteTime <= 0) {
            return { isTimeOut: true, winner: "black" };
        } else if (times.blackTime <= 0) {
            return { isTimeOut: true, winner: "white" };
        }
        
        return { isTimeOut: false };
    }

    /**
     * Converts the game state to JSON for transmission
     */
    public toJSON(): string {
        const currentTimes = this.getCurrentTimeRemaining();
        return JSON.stringify({
            whitePlayer: this.whitePlayer,
            blackPlayer: this.blackPlayer,
            currentTurn: this.currentTurn,
            turnList: this.turnList,
            whiteTimeRemaining: currentTimes.whiteTime,
            blackTimeRemaining: currentTimes.blackTime,
            gameStarted: this.gameStarted,
            board: {
                squares: this.board.squares,
                pieces: this.board.pieces.map(piece => ({
                    id: piece.id,
                    type: piece.getType(),
                    color: piece.getColor(),
                    hasMoved: piece.getHasMoved(),
                    value: piece.getValue(),
                    pngPath: piece.getPiecePNG()
                }))
            }
        });
    }
}