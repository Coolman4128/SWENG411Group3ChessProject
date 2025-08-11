import { PieceType } from "../Enums/pieces";

export class BoardCords {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    equals(other: BoardCords): boolean {
        return this.x === other.x && this.y === other.y;
    }
}

export class Piece{
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

    public getHasMoved(): boolean {
        return this.hasMoved;
    }

    public setHasMoved(moved: boolean): void {
        this.hasMoved = moved;
    }

    public getValidMoves(currentPos: BoardCords, board?: any): BoardCords[] {
        if (!board) {
            // If no board is provided, return basic movement patterns (for compatibility)
            return this.getBasicMovementPattern(currentPos);
        }

        let validMoves: BoardCords[] = [];
        
        switch (this.type) {
            case PieceType.PAWN:
                validMoves = this.getPawnMoves(currentPos, board);
                break;
            case PieceType.ROOK:
                validMoves = this.getRookMoves(currentPos, board);
                break;
            case PieceType.KNIGHT:
                validMoves = this.getKnightMoves(currentPos, board);
                break;
            case PieceType.BISHOP:
                validMoves = this.getBishopMoves(currentPos, board);
                break;
            case PieceType.QUEEN:
                validMoves = this.getQueenMoves(currentPos, board);
                break;
            case PieceType.KING:
                validMoves = this.getKingMoves(currentPos, board);
                break;
            default:
                throw new Error("Invalid piece type.");
        }

        // Filter out moves that would put own king in check
        validMoves = this.filterMovesInCheck(currentPos, validMoves, board);

        return validMoves;
    }

    private getPawnMoves(currentPos: BoardCords, board: any): BoardCords[] {
        const validMoves: BoardCords[] = [];
        const direction = this.color === "white" ? -1 : 1;

        // Forward move
        const oneForward = new BoardCords(currentPos.x + direction, currentPos.y);
        if (this.isInBounds(oneForward) && !board.getPieceAt(oneForward.x, oneForward.y)) {
            validMoves.push(oneForward);

            // Double move if hasn't moved yet
            if (!this.hasMoved) {
                const twoForward = new BoardCords(currentPos.x + (2 * direction), currentPos.y);
                if (this.isInBounds(twoForward) && !board.getPieceAt(twoForward.x, twoForward.y)) {
                    validMoves.push(twoForward);
                }
            }
        }

        // Diagonal captures
        const captureLeft = new BoardCords(currentPos.x + direction, currentPos.y - 1);
        const captureRight = new BoardCords(currentPos.x + direction, currentPos.y + 1);

        if (this.isInBounds(captureLeft)) {
            const pieceLeft = board.getPieceAt(captureLeft.x, captureLeft.y);
            if (pieceLeft && pieceLeft.getColor() !== this.color) {
                validMoves.push(captureLeft);
            }
        }

        if (this.isInBounds(captureRight)) {
            const pieceRight = board.getPieceAt(captureRight.x, captureRight.y);
            if (pieceRight && pieceRight.getColor() !== this.color) {
                validMoves.push(captureRight);
            }
        }

        return validMoves;
    }

    private getRookMoves(currentPos: BoardCords, board: any): BoardCords[] {
        const validMoves: BoardCords[] = [];
        const directions = [
            { x: 0, y: 1 },   // Right
            { x: 0, y: -1 },  // Left
            { x: 1, y: 0 },   // Down
            { x: -1, y: 0 }   // Up
        ];

        for (const dir of directions) {
            for (let i = 1; i < 8; i++) {
                const newPos = new BoardCords(currentPos.x + dir.x * i, currentPos.y + dir.y * i);
                
                if (!this.isInBounds(newPos)) break;
                
                const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
                if (!pieceAtPos) {
                    validMoves.push(newPos);
                } else {
                    if (pieceAtPos.getColor() !== this.color) {
                        validMoves.push(newPos); // Can capture
                    }
                    break; // Can't move past any piece
                }
            }
        }

        return validMoves;
    }

    private getKnightMoves(currentPos: BoardCords, board: any): BoardCords[] {
        const validMoves: BoardCords[] = [];
        const knightMoves = [
            { x: 2, y: 1 }, { x: 2, y: -1 }, { x: -2, y: 1 }, { x: -2, y: -1 },
            { x: 1, y: 2 }, { x: 1, y: -2 }, { x: -1, y: 2 }, { x: -1, y: -2 }
        ];

        for (const move of knightMoves) {
            const newPos = new BoardCords(currentPos.x + move.x, currentPos.y + move.y);
            
            if (this.isInBounds(newPos)) {
                const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
                if (!pieceAtPos || pieceAtPos.getColor() !== this.color) {
                    validMoves.push(newPos);
                }
            }
        }

        return validMoves;
    }

    private getBishopMoves(currentPos: BoardCords, board: any): BoardCords[] {
        const validMoves: BoardCords[] = [];
        const directions = [
            { x: 1, y: 1 },   // Down-right
            { x: 1, y: -1 },  // Down-left
            { x: -1, y: 1 },  // Up-right
            { x: -1, y: -1 }  // Up-left
        ];

        for (const dir of directions) {
            for (let i = 1; i < 8; i++) {
                const newPos = new BoardCords(currentPos.x + dir.x * i, currentPos.y + dir.y * i);
                
                if (!this.isInBounds(newPos)) break;
                
                const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
                if (!pieceAtPos) {
                    validMoves.push(newPos);
                } else {
                    if (pieceAtPos.getColor() !== this.color) {
                        validMoves.push(newPos); // Can capture
                    }
                    break; // Can't move past any piece
                }
            }
        }

        return validMoves;
    }

    private getQueenMoves(currentPos: BoardCords, board: any): BoardCords[] {
        // Queen moves like both rook and bishop
        return [...this.getRookMoves(currentPos, board), ...this.getBishopMoves(currentPos, board)];
    }

    private getKingMoves(currentPos: BoardCords, board: any): BoardCords[] {
        const validMoves: BoardCords[] = [];
        const kingMoves = [
            { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 }
        ];

        for (const move of kingMoves) {
            const newPos = new BoardCords(currentPos.x + move.x, currentPos.y + move.y);
            
            if (this.isInBounds(newPos)) {
                const pieceAtPos = board.getPieceAt(newPos.x, newPos.y);
                if (!pieceAtPos || pieceAtPos.getColor() !== this.color) {
                    // Don't add moves that would put king in check (will be filtered later)
                    validMoves.push(newPos);
                }
            }
        }

        return validMoves;
    }

    private isInBounds(pos: BoardCords): boolean {
        return pos.x >= 0 && pos.x < 8 && pos.y >= 0 && pos.y < 8;
    }

    private filterMovesInCheck(currentPos: BoardCords, moves: BoardCords[], board: any): BoardCords[] {
        const validMoves: BoardCords[] = [];

        for (const move of moves) {
            if (!this.wouldMoveExposeKingToCheck(currentPos, move, board)) {
                validMoves.push(move);
            }
        }

        return validMoves;
    }

    private wouldMoveExposeKingToCheck(from: BoardCords, to: BoardCords, board: any): boolean {
        // Simulate the move
        const originalPiece = board.getPieceAt(to.x, to.y);
        const movingPiece = board.getPieceAt(from.x, from.y);
        
        // Temporarily make the move
        board.squares[to.x][to.y] = movingPiece.id;
        board.squares[from.x][from.y] = 0;

        // Find our king
        const kingPos = this.findKing(this.color, board);
        let kingInCheck = false;

        if (kingPos) {
            // If we moved the king, check from the new position
            const checkPos = this.type === PieceType.KING ? to : kingPos;
            kingInCheck = this.isPositionUnderAttack(checkPos, this.color, board);
        }

        // Restore the board
        board.squares[from.x][from.y] = movingPiece.id;
        board.squares[to.x][to.y] = originalPiece ? originalPiece.id : 0;

        return kingInCheck;
    }

    private findKing(color: string, board: any): BoardCords | null {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = board.getPieceAt(x, y);
                if (piece && piece.getType() === PieceType.KING && piece.getColor() === color) {
                    return new BoardCords(x, y);
                }
            }
        }
        return null;
    }

    private isPositionUnderAttack(pos: BoardCords, defendingColor: string, board: any): boolean {
        const attackingColor = defendingColor === "white" ? "black" : "white";

        // Check all opponent pieces to see if any can attack this position
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = board.getPieceAt(x, y);
                if (piece && piece.getColor() === attackingColor) {
                    const attackingMoves = piece.getBasicMovementPattern(new BoardCords(x, y));
                    // For pawns, we need to check diagonal attacks specifically
                    if (piece.getType() === PieceType.PAWN) {
                        const direction = piece.getColor() === "white" ? -1 : 1;
                        const leftAttack = new BoardCords(x + direction, y - 1);
                        const rightAttack = new BoardCords(x + direction, y + 1);
                        if ((leftAttack.equals(pos) || rightAttack.equals(pos)) && this.isInBounds(leftAttack) && this.isInBounds(rightAttack)) {
                            return true;
                        }
                    } else {
                        // For other pieces, check if they can reach this position
                        if (this.canPieceAttackPosition(piece, new BoardCords(x, y), pos, board)) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    private canPieceAttackPosition(piece: any, piecePos: BoardCords, targetPos: BoardCords, board: any): boolean {
        const moves = piece.getBasicMovementPattern(piecePos);
        
        for (const move of moves) {
            if (move.equals(targetPos)) {
                // Check if path is clear for sliding pieces
                if (piece.getType() === PieceType.ROOK || piece.getType() === PieceType.BISHOP || piece.getType() === PieceType.QUEEN) {
                    return this.isPathClear(piecePos, targetPos, board);
                }
                return true; // Knights and kings don't need path checking
            }
        }
        
        return false;
    }

    private isPathClear(from: BoardCords, to: BoardCords, board: any): boolean {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        // Determine step direction
        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        
        let currentX = from.x + stepX;
        let currentY = from.y + stepY;
        
        // Check each square along the path (excluding the destination)
        while (currentX !== to.x || currentY !== to.y) {
            if (board.getPieceAt(currentX, currentY)) {
                return false; // Path is blocked
            }
            currentX += stepX;
            currentY += stepY;
        }
        
        return true;
    }

    // Keep the original function for backward compatibility
    private getBasicMovementPattern(currentPos: BoardCords): BoardCords[] {
        let validMoves: BoardCords[] = [];
        switch (this.type) {
            case PieceType.PAWN:
                // For pawns, direction depends on color
                // White pawns move "up" the board (decreasing row numbers: 6->5->4, etc.)
                // Black pawns move "down" the board (increasing row numbers: 1->2->3, etc.)
                const direction = this.color === "white" ? -1 : 1;
                
                // Single move forward
                validMoves.push(new BoardCords(currentPos.x + direction, currentPos.y));
                
                // Double move if hasn't moved yet
                if (!this.hasMoved) {
                    validMoves.push(new BoardCords(currentPos.x + (2 * direction), currentPos.y));
                }

                // Diagonal attacks for pawns
                validMoves.push(new BoardCords(currentPos.x + direction, currentPos.y - 1));
                validMoves.push(new BoardCords(currentPos.x + direction, currentPos.y + 1));
                break;
            case PieceType.ROOK:
                // Horizontal and vertical moves
                for (let i = 1; i < 8; i++) {
                    // Move right (increasing column)
                    validMoves.push(new BoardCords(currentPos.x, currentPos.y + i));
                    // Move left (decreasing column)
                    validMoves.push(new BoardCords(currentPos.x, currentPos.y - i));
                    // Move down (increasing row)
                    validMoves.push(new BoardCords(currentPos.x + i, currentPos.y));
                    // Move up (decreasing row)
                    validMoves.push(new BoardCords(currentPos.x - i, currentPos.y));
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
                    // Move right (increasing column)
                    validMoves.push(new BoardCords(currentPos.x, currentPos.y + i));
                    // Move left (decreasing column)
                    validMoves.push(new BoardCords(currentPos.x, currentPos.y - i));
                    // Move down (increasing row)
                    validMoves.push(new BoardCords(currentPos.x + i, currentPos.y));
                    // Move up (decreasing row)
                    validMoves.push(new BoardCords(currentPos.x - i, currentPos.y));
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
        validMoves = validMoves.filter(move => move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8);
        // Remove the current position from valid moves
        validMoves = validMoves.filter(move => move.x !== currentPos.x || move.y !== currentPos.y);
        // Remove duplicates
        validMoves = validMoves.filter((move, index, self) =>
            index === self.findIndex(m => m.x === move.x && m.y === move.y)
        );
        return validMoves;
    }

    // Static helper methods for checking game state
    public static isPlayerInCheck(playerColor: string, board: any): boolean {
        const kingPos = Piece.findKingPosition(playerColor, board);
        if (!kingPos) return false;

        return Piece.isPositionUnderAttackStatic(kingPos, playerColor, board);
    }

    public static findKingPosition(color: string, board: any): BoardCords | null {
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = board.getPieceAt(x, y);
                if (piece && piece.getType() === PieceType.KING && piece.getColor() === color) {
                    return new BoardCords(x, y);
                }
            }
        }
        return null;
    }

    public static isPositionUnderAttackStatic(pos: BoardCords, defendingColor: string, board: any): boolean {
        const attackingColor = defendingColor === "white" ? "black" : "white";

        // Check all opponent pieces to see if any can attack this position
        for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
                const piece = board.getPieceAt(x, y);
                if (piece && piece.getColor() === attackingColor) {
                    if (Piece.canPieceAttackPositionStatic(piece, new BoardCords(x, y), pos, board)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    public static canPieceAttackPositionStatic(piece: any, piecePos: BoardCords, targetPos: BoardCords, board: any): boolean {
        // Special handling for pawns
        if (piece.getType() === PieceType.PAWN) {
            const direction = piece.getColor() === "white" ? -1 : 1;
            const leftAttack = new BoardCords(piecePos.x + direction, piecePos.y - 1);
            const rightAttack = new BoardCords(piecePos.x + direction, piecePos.y + 1);
            return (leftAttack.equals(targetPos) || rightAttack.equals(targetPos));
        }

        const moves = piece.getBasicMovementPattern(piecePos);
        
        for (const move of moves) {
            if (move.equals(targetPos)) {
                // Check if path is clear for sliding pieces
                if (piece.getType() === PieceType.ROOK || piece.getType() === PieceType.BISHOP || piece.getType() === PieceType.QUEEN) {
                    return Piece.isPathClearStatic(piecePos, targetPos, board);
                }
                return true; // Knights and kings don't need path checking
            }
        }
        
        return false;
    }

    public static isPathClearStatic(from: BoardCords, to: BoardCords, board: any): boolean {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        // Determine step direction
        const stepX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
        const stepY = dy === 0 ? 0 : dy > 0 ? 1 : -1;
        
        let currentX = from.x + stepX;
        let currentY = from.y + stepY;
        
        // Check each square along the path (excluding the destination)
        while (currentX !== to.x || currentY !== to.y) {
            if (board.getPieceAt(currentX, currentY)) {
                return false; // Path is blocked
            }
            currentX += stepX;
            currentY += stepY;
        }
        
        return true;
    }
}