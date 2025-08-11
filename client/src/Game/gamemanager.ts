import { Socket } from "socket.io-client";
import { Board } from "./board";
import { GameState } from "./gamestate";
import { Piece } from "./piece";

export class GameManager {
    private gameState: GameState;

    private playerID: string; // ID of the player whose turn it is
    private playerColor: string | null; // "white" or "black" null for spectators

    private piece: Piece | null = null; // Currently selected piece, if any

    private socket: Socket | null = null; // Socket connection, if needed

    constructor() {
        this.playerID = ""; // This will be set when a player connects
        this.playerColor = null; // Initially, the player has no color assigned
        this.gameState = new GameState("{}");
    }

    public setSocket(socket: Socket): void {
        console.log("Setting socket:", socket);
        this.socket = socket;
    }

    public setPlayerID(playerID: string): void {
        this.playerID = playerID;
    }
    public loadGameState(jsonData: any): void {
        this.gameState = new GameState(jsonData, this.playerID);
        if (this.gameState.whitePlayer === this.playerID) {
            this.playerColor = "white";
        } else if (this.gameState.blackPlayer === this.playerID) {
            this.playerColor = "black";
        }
        else {
            this.playerColor = null; // Spectator or not assigned
        }
    }

    public attemptTakePiece(pieceToTake: Piece): void {
        // Find the position of the piece to take
        const selectedPiece = this.getSelectedPiece();
        if (!selectedPiece) {
            console.error("No piece selected to move.");
            return;
        }
        const takePos = this.getBoard().getPiecePosition(pieceToTake);
        const selectedPos = this.getBoard().getPiecePosition(selectedPiece);
        if (!takePos) {
            console.error("Piece to take not found on the board.");
            return;
        }
        if (!selectedPos) {
            console.error("Selected piece not found on the board.");
            return;
        }
        const validMoves = selectedPiece.getValidMoves(selectedPos, this.getBoard());
        validMoves.forEach((move) => {
            if (move.x === takePos.x && move.y === takePos.y) {
                // Send Socket Message to attempt to take the piece
                if (this.socket) {
                    this.socket.emit("takePiece", {
                        piece: selectedPiece.id,
                        target: pieceToTake.id,
                        from: { x: selectedPos.x, y: selectedPos.y },
                        to: { x: takePos.x, y: takePos.y },
                        playerID: this.playerID,
                    });
                }
            }
        });



    }

    public attemptMovePiece(x: number, y: number): void {
        const selectedPiece = this.getSelectedPiece();
        if (!selectedPiece) {
            console.error("No piece selected to move.");
            return;
        }
        const selectedPos = this.getBoard().getPiecePosition(selectedPiece);
        if (!selectedPos) {
            console.error("Selected piece not found on the board.");
            return;
        }
        const validMoves = selectedPiece.getValidMoves(selectedPos, this.getBoard());
        console.log("Attempting to move to:", x, y);
        console.log("Valid moves:", validMoves);
        console.log("Selected piece position:", selectedPos);
        
        validMoves.forEach((move) => {
            if (move.x === x && move.y === y) {
                // Send Socket Message to attempt to move the piece
                if (this.socket) {
                    console.log("attempting move");
                    this.socket.emit("movePiece", {
                        piece: selectedPiece.id,
                        from: { x: selectedPos.x, y: selectedPos.y },
                        to: { x: x, y: y },
                        playerID: this.playerID,
                    });
                } else {
                    console.log("No socket connection available");
                }
            }
        });
    }

    public getBoard(): Board {
        return this.gameState.board;
    }

    public getIsTurn(): boolean {
        if (this.playerColor === null) {
            return false; // Spectators cannot make moves
        }
        if (this.playerColor === this.gameState.currentTurn) {
            return true; // It's the player's turn
        }
        return false;
    }

    public getPlayerColor(): string | null {
        return this.playerColor;
    }

    public selectPiece(piece: Piece): void {
        this.piece = piece;
    }

    public getSelectedPiece(): Piece | null {
        return this.piece;
    }
}