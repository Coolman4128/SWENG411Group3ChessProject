import { PieceType } from "../Enums/pieces";

export class BoardCords {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}

export class Piece {
    private type: PieceType;
    private color: string;
    private hasMoved: boolean = false;
    private static pieceCount: number = 1;
    public id: number;

    constructor(type: PieceType, color: string, id: number = -1) {
        this.type = type;
        if (color !== "white" && color !== "black") {
            throw new Error("Invalid color. Must be 'white' or 'black'.");
        }
        this.color = color;
        if (id >= 0) {
            this.id = id;
        }
        else {
            this.id = Piece.pieceCount++;
        }
    }

    public getValue(): number {
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
        var pieceName = "";
        switch (this.type) {
            case PieceType.PAWN:
                pieceName = "pawn";
                break;
            case PieceType.ROOK:
                pieceName = "rook";
                break;
            case PieceType.KNIGHT:
                pieceName = "knight";
                break;
            case PieceType.BISHOP:
                pieceName = "bishop";
                break;
            case PieceType.QUEEN:
                pieceName = "queen";
                break;
            case PieceType.KING:
                pieceName = "king";
                break;
            default:
                throw new Error("Invalid piece type.");
        }

        return `${this.color}-${pieceName}.png`;
    }

    public getType(): PieceType {
        return this.type;
    }

    public getColor(): string {
        return this.color;
    }

    public getValidMoves(currentPos: BoardCords): BoardCords[] {
        let validMoves: BoardCords[] = [];
        switch (this.type) {
            case PieceType.PAWN:
                if (this.hasMoved === true) {
                    validMoves.push(new BoardCords(currentPos.x, currentPos.y + 2));
                }
                validMoves.push(new BoardCords(currentPos.x, currentPos.y + 1));
                break;
            case PieceType.ROOK:
                for (let i = 1; i < 8; i++) {
                    validMoves.push(new BoardCords(i, currentPos.y));
                }
                for (let i = 1; i < 8; i++) {
                    validMoves.push(new BoardCords(currentPos.x, i));
                }
                break;
            case PieceType.KNIGHT:
                validMoves.push(new BoardCords(currentPos.x + 2, currentPos.y + 1));
                validMoves.push(new BoardCords(currentPos.x + 2, currentPos.y - 1));
                validMoves.push(new BoardCords(currentPos.x - 2, currentPos.y + 1));
                validMoves.push(new BoardCords(currentPos.x - 2, currentPos.y - 1));
                validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y + 2));
                validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y - 2));
                validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y + 2));
                validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y - 2));
                break;
            case PieceType.BISHOP:
                // Diagonal directions: top-right, top-left, bottom-right, bottom-left
                for (let i = 1; i < 8; i++) {
                    validMoves.push(new BoardCords(currentPos.x + i, currentPos.y + i)); // top-right
                    validMoves.push(new BoardCords(currentPos.x - i, currentPos.y + i)); // top-left
                    validMoves.push(new BoardCords(currentPos.x + i, currentPos.y - i)); // bottom-right
                    validMoves.push(new BoardCords(currentPos.x - i, currentPos.y - i)); // bottom-left
                }
                break;

            case PieceType.QUEEN:
                // Horizontal and vertical (same as rook)
                for (let i = 1; i < 8; i++) {
                    validMoves.push(new BoardCords(i, currentPos.y)); // Horizontal
                    validMoves.push(new BoardCords(currentPos.x, i)); // Vertical
                }
                // Diagonal (same as bishop)
                for (let i = 1; i < 8; i++) {
                    validMoves.push(new BoardCords(currentPos.x + i, currentPos.y + i));
                    validMoves.push(new BoardCords(currentPos.x - i, currentPos.y + i));
                    validMoves.push(new BoardCords(currentPos.x + i, currentPos.y - i));
                    validMoves.push(new BoardCords(currentPos.x - i, currentPos.y - i));
                }
                break;
            case PieceType.KING:
                validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y));
                validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y));
                validMoves.push(new BoardCords(currentPos.x, currentPos.y + 1));
                validMoves.push(new BoardCords(currentPos.x, currentPos.y - 1));
                validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y + 1));
                validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y - 1));
                validMoves.push(new BoardCords(currentPos.x + 1, currentPos.y - 1));
                validMoves.push(new BoardCords(currentPos.x - 1, currentPos.y + 1));
                break;
            default:
                throw new Error("Invalid piece type.");
        }

        // Filter out moves that are out of bounds
        validMoves = validMoves.filter(move => move.x >= 1 && move.x <= 8 && move.y >= 1 && move.y <= 8);
        // Remove the current position from valid moves
        validMoves = validMoves.filter(move => move.x !== currentPos.x || move.y !== currentPos.y);
        // Remove duplicates
        validMoves = validMoves.filter((move, index, self) =>
            index === self.findIndex(m => m.x === move.x && m.y === move.y)
        );
        return validMoves;

    }
}