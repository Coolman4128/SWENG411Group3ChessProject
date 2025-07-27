import { PieceType } from "../Enums/pieces";

export class Piece{
    private type: PieceType;
    private color: string;
    
    private static pieceCount: number = 1;
    public id: number;

    constructor(type: PieceType, color: string) {
        this.type = type;
        if (color !== "white" && color !== "black") {
            throw new Error("Invalid color. Must be 'white' or 'black'.");
        }
        this.color = color;
        this.id = Piece.pieceCount++;
    }

    public getValue(): number{
        switch (this.type) {
            case PieceType.PAWN:
                return 1;
            case PieceType.ROOK:
                return 5;
            case PieceType.KNIGHT:
                return 3;
            case PieceType.BISHOP:
                return 3;
            case PieceType.QUEEN:
                return 9;
            case PieceType.KING:
                return 0; // King is invaluable in terms of game rules
            default:
                return 0; // Empty piece has no value
        }
    }

    public getPiecePNG(): string {
        var pieceName = this.type.toString().toLowerCase();
        return `${this.color}-${pieceName}.png`;
    }
}