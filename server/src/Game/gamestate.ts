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
    promotionRequired?: boolean; // Indicates the move requires a pawn promotion choice
    winnerColor?: string; // Color string ("white"|"black") if decisive result
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
    // Track last move for client-side highlighting
    public lastMoveFrom: { x: number; y: number } | null = null;
    public lastMoveTo: { x: number; y: number } | null = null;

    // Cached check status (updated each move)
    public whiteInCheck: boolean = false;
    public blackInCheck: boolean = false;

    // Pending promotion details (if a pawn has reached last rank and awaits selection)
    private pendingPromotion: {
        pieceId: number;
        fromX: number; fromY: number; toX: number; toY: number;
        capturedPieceId?: number;
    } | null = null;

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
        // If a promotion is pending, block new moves until it's resolved
        if (this.pendingPromotion) {
            return { success: false, message: "Pending promotion must be completed before making another move." };
        }
        // 1. Validate the move is legit
        const validationResult = this.validateMove(playerId, fromX, fromY, toX, toY);
        if (!validationResult.success) {
            return validationResult;
        }

    const piece = this.board.getPieceAt(fromX, fromY)!;
        const targetPiece = this.board.getPieceAt(toX, toY);

        // Detect castling before normal move application (king moving two squares horizontally)
        let castlingPerformed: "king" | "queen" | null = null;
        if (piece.getType() === PieceType.KING && Math.abs(toY - fromY) === 2 && fromX === toX) {
            // Determine side
            if (toY === 6) {
                // Kingside castle: move rook from y=7 to y=5
                const rook = this.board.getPieceAt(fromX, 7);
                if (rook && rook.getType() === PieceType.ROOK) {
                    this.board.squares[fromX][5] = rook.id;
                    this.board.squares[fromX][7] = 0;
                    rook.setHasMoved(true);
                    castlingPerformed = "king";
                }
            } else if (toY === 2) {
                // Queenside castle: move rook from y=0 to y=3
                const rook = this.board.getPieceAt(fromX, 0);
                if (rook && rook.getType() === PieceType.ROOK) {
                    this.board.squares[fromX][3] = rook.id;
                    this.board.squares[fromX][0] = 0;
                    rook.setHasMoved(true);
                    castlingPerformed = "queen";
                }
            }
        }

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

    // Track last move squares
    this.lastMoveFrom = { x: fromX, y: fromY };
    this.lastMoveTo = { x: toX, y: toY };

    // Check for pawn promotion BEFORE finalizing turn logic
    const isPawn = piece.getType() === PieceType.PAWN;
    const promotionRankReached = (piece.getColor() === "white" && toX === 0) || (piece.getColor() === "black" && toX === 7);
    if (isPawn && promotionRankReached) {
            // Store pending promotion data
            this.pendingPromotion = { pieceId: piece.id, fromX, fromY, toX, toY, capturedPieceId: targetPiece?.id };

            // Emit promote event so client can request choice
            if (eventEmitter) {
                eventEmitter("promote", {
                    pieceId: piece.id,
                    color: piece.getColor(),
                    position: { x: toX, y: toY },
                    choices: [PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT]
                });
            }
            // Do not push notation or change turn yet
            return { success: true, promotionRequired: true };
    }

    // Record the move in algebraic notation (we might append + or # later)
    let moveNotation = castlingPerformed === "king" ? "O-O" : castlingPerformed === "queen" ? "O-O-O" : this.generateMoveNotation(piece, fromX, fromY, toX, toY, targetPiece);
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

    // Determine opponent color BEFORE flipping turn (needed for check detection on opponent)
    const opponentColor = this.currentTurn === "white" ? "black" : "white";

    // Change turn
    this.currentTurn = opponentColor;

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

        // Update check status for both colors
        this.whiteInCheck = Piece.isPlayerInCheck("white", this.board);
        this.blackInCheck = Piece.isPlayerInCheck("black", this.board);

        // Determine if opponent is now in check (the move just played against opponentColor)
        const opponentInCheck = opponentColor === "white" ? this.whiteInCheck : this.blackInCheck;

        // If the move delivered check, append '+' to previous notation (or '#' if checkmate below)
        if (opponentInCheck) {
            const lastIdx = this.turnList.length - 1;
            if (lastIdx >= 0) {
                this.turnList[lastIdx][0] = this.turnList[lastIdx][0] + "+"; // temporary, may change to # if mate
            }
        }

        // 4. Check for checkmate (on opponent just put in turn position)
        const isCheckmate = this.isPlayerInCheckmate(this.currentTurn);
        if (isCheckmate) {
            // Replace '+' with '#' if previously added or just append
            const lastIdx = this.turnList.length - 1;
            if (lastIdx >= 0) {
                this.turnList[lastIdx][0] = this.turnList[lastIdx][0].replace(/\+?$/, "#");
            }
            const winnerColor = opponentColor === "white" ? "black" : "white"; // previous player before turn flip
            console.log(`Checkmate! ${winnerColor === "white" ? "White" : "Black"} wins!`);
            // Emit updated state before returning
            if (eventEmitter) {
                eventEmitter("gameState", this.toJSON());
            }
            return {
                success: true,
                isCheckmate: true,
                winnerColor,
                message: `Checkmate! ${winnerColor === "white" ? "White" : "Black"} wins!`
            };
        }

        // 5. Check for draw (stalemate)
        const isDraw = this.isStalemate(this.currentTurn);
        if (isDraw) {
            console.log("Stalemate! The game is a draw.");
            if (eventEmitter) {
                eventEmitter("gameState", this.toJSON());
            }
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

        return {
            success: true,
            capturedPiece: targetPiece || undefined,
            isCheck: opponentInCheck,
            message: opponentInCheck ? `${this.currentTurn} is in check!` : undefined
        };
    }

    /**
     * Finalizes a pending pawn promotion by changing the piece type and then executing
     * the remaining post-move logic (notation, turn change, check/mate detection, emit state)
     */
    public finalizePromotion(playerId: string, pieceId: number, newType: PieceType, eventEmitter?: (event: string, data: any) => void): MoveResult {
        if (!this.pendingPromotion) {
            return { success: false, message: "No promotion is pending." };
        }
        const { pieceId: pendingId, fromX, fromY, toX, toY, capturedPieceId } = this.pendingPromotion;
        if (pendingId !== pieceId) {
            return { success: false, message: "Piece does not match pending promotion." };
        }
        // Validate player color
        const playerColor = this.getPlayerColor(playerId);
        if (!playerColor) {
            return { success: false, message: "Player not in game." };
        }
        const piece = this.board.getPieceAt(toX, toY);
        if (!piece) {
            return { success: false, message: "Promoting piece not found." };
        }
        if (piece.getColor() !== playerColor) {
            return { success: false, message: "Cannot promote opponent's piece." };
        }
        if (piece.getType() !== PieceType.PAWN) {
            return { success: false, message: "Only pawns can be promoted." };
        }
        if (![PieceType.QUEEN, PieceType.ROOK, PieceType.BISHOP, PieceType.KNIGHT].includes(newType)) {
            return { success: false, message: "Invalid promotion type." };
        }

        // Set new type on piece
        (piece as any).setTypeForPromotion(newType);

        // Generate notation now with promotion suffix
        const capturedPiece = capturedPieceId ? this.board.getPieceById(capturedPieceId) : null;
        let moveNotation = this.generateMoveNotationPromoted(piece, fromX, fromY, toX, toY, capturedPiece, newType);
        this.turnList.push([moveNotation]);

        // Handle timer logic (same as in movePiece for first move vs subsequent)
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.turnStartTime = Date.now();
        } else {
            this.updateCurrentPlayerTime();
            this.turnStartTime = Date.now();
        }

        // Opponent color BEFORE turn flip
        const opponentColor = this.currentTurn === "white" ? "black" : "white";
        // Change turn
        this.currentTurn = opponentColor;

        // Update check status
        this.whiteInCheck = Piece.isPlayerInCheck("white", this.board);
        this.blackInCheck = Piece.isPlayerInCheck("black", this.board);

        const opponentInCheck = opponentColor === "white" ? this.whiteInCheck : this.blackInCheck;
        if (opponentInCheck) {
            const lastIdx = this.turnList.length - 1;
            if (lastIdx >= 0) {
                this.turnList[lastIdx][0] = this.turnList[lastIdx][0] + "+";
            }
        }

        const isCheckmate = this.isPlayerInCheckmate(this.currentTurn);
        if (isCheckmate) {
            const lastIdx = this.turnList.length - 1;
            if (lastIdx >= 0) {
                this.turnList[lastIdx][0] = this.turnList[lastIdx][0].replace(/\+?$/, "#");
            }
            const winnerColor = opponentColor === "white" ? "black" : "white"; // previous mover wins
            if (eventEmitter) {
                eventEmitter("gameState", this.toJSON());
            }
            this.pendingPromotion = null; // clear
            return { success: true, isCheckmate: true, winnerColor, message: `Checkmate! ${winnerColor === "white" ? "White" : "Black"} wins!` };
        }

        const isDraw = this.isStalemate(this.currentTurn);
        if (isDraw) {
            if (eventEmitter) {
                eventEmitter("gameState", this.toJSON());
            }
            this.pendingPromotion = null;
            return { success: true, isDraw: true, message: "Stalemate! The game is a draw." };
        }

        if (eventEmitter) {
            eventEmitter("gameState", this.toJSON());
        }
        this.pendingPromotion = null;
        return { success: true, isCheck: opponentInCheck, message: opponentInCheck ? `${this.currentTurn} is in check!` : undefined };
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

    private generateMoveNotationPromoted(piece: Piece, fromX: number, fromY: number, toX: number, toY: number, capturedPiece: Piece | null, promotionType: PieceType): string {
        // Temporarily treat as pawn for original capture/file logic BEFORE promotion piece letter
        let baseNotation = this.generateMoveNotation(Object.assign(Object.create(Object.getPrototypeOf(piece)), piece, { getType: () => PieceType.PAWN }) as Piece, fromX, fromY, toX, toY, capturedPiece);
        // Append =<PieceLetter>
        let pieceLetter = "";
        switch (promotionType) {
            case PieceType.QUEEN: pieceLetter = "Q"; break;
            case PieceType.ROOK: pieceLetter = "R"; break;
            case PieceType.BISHOP: pieceLetter = "B"; break;
            case PieceType.KNIGHT: pieceLetter = "N"; break;
        }
        return `${baseNotation}=${pieceLetter}`;
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
            lastMoveFrom: this.lastMoveFrom,
            lastMoveTo: this.lastMoveTo,
            whiteInCheck: this.whiteInCheck,
            blackInCheck: this.blackInCheck,
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