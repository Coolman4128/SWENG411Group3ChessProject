import { Piece } from "./piece";

export class Board {
    private squares: number[][] = [];
    private pieces: Piece[] = [];

    constructor() {
        this.initializeBoard();
    }

    private initializeBoard() {
        for (let i = 0; i < 8; i++) {
            this.squares[i] = [];
            for (let j = 0; j < 8; j++) {
                this.squares[i][j] = 0;
            }
        }
    }

    public getSquares(): number[][] {
        return this.squares;
    }

    public addPiece(piece: Piece, x: number, y: number) {
        if (x < 0 || x >= 8 || y < 0 || y >= 8) {
            throw new Error("Coordinates out of bounds.");
        }
        if (this.squares[x][y] !== 0) {
            throw new Error("Square is already occupied.");
        }
        this.squares[x][y] = piece.id;
        this.pieces.push(piece);
    }

    public getPieceAt(x: number, y: number): Piece | null {
        const pieceId = this.squares[x][y];
        return pieceId ? this.pieces.find(piece => piece.id === pieceId) || null : null;
    }

    public attemptMovePiece(fromX: number, fromY: number, toX: number, toY: number): boolean {
        const piece = this.getPieceAt(fromX, fromY);
        if (!piece) {
            throw new Error("No piece at the specified coordinates.");
        }
        if (toX < 0 || toX >= 8 || toY < 0 || toY >= 8) {
            throw new Error("Target coordinates out of bounds.");
        }
        if (this.squares[toX][toY] !== 0) {
            throw new Error("Target square is already occupied.");
        }

        // TODO: CHECK VALIDITY OF MOVE BASED ON PIECE TYPE AND GAME RULES

        // TODO: IF PIECE IS THERE, ADD IT TO THE CAPTURED PIECES LIST
        
        this.squares[toX][toY] = piece.id;
        this.squares[fromX][fromY] = 0;
        return true;
    }

    
}