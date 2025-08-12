import { Board } from "./board";
import { Piece, BoardCords } from "./piece";

export class CanvasManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private squareSize: number = 80;
    private boardImage!: HTMLImageElement;
    private selectorImage!: HTMLImageElement;
    private pieceImages: Map<string, HTMLImageElement> = new Map();
    private imagesLoaded: boolean = false;
    private isFlipped: boolean = false; // Whether to flip the board for black player

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found.`);
        }
        
        this.ctx = this.canvas.getContext('2d')!;
        if (!this.ctx) {
            throw new Error('Could not get 2D context from canvas.');
        }

        // Set up responsive canvas sizing
        this.setupResponsiveCanvas();
        
        // Add window resize listener to handle screen size changes
        window.addEventListener('resize', () => {
            this.setupResponsiveCanvas();
            // Redraw after resize if images are loaded
            if (this.imagesLoaded) {
                this.redrawCanvas();
            }
        });

        this.loadImages();
    }

    private async loadImages(): Promise<void> {
        // Load the board background image
        this.boardImage = new Image();
        this.boardImage.src = './rect-8x8.png';

        // Load the selector square image
        this.selectorImage = new Image();
        this.selectorImage.src = './selector_square.png';

        // Load all piece images
        const pieceTypes = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
        const colors = ['white', 'black'];
        
        const imagePromises: Promise<void>[] = [];

        // Load board image
        imagePromises.push(new Promise((resolve) => {
            this.boardImage.onload = () => resolve();
        }));

        // Load selector image
        imagePromises.push(new Promise((resolve) => {
            this.selectorImage.onload = () => resolve();
        }));

        // Load piece images
        for (const color of colors) {
            for (const piece of pieceTypes) {
                const imageName = `${color}-${piece}.png`;
                const image = new Image();
                image.src = `./${imageName}`;
                this.pieceImages.set(imageName, image);
                
                imagePromises.push(new Promise((resolve) => {
                    image.onload = () => resolve();
                }));
            }
        }

        await Promise.all(imagePromises);
        this.imagesLoaded = true;
        console.log('All images loaded successfully');
    }

    public drawBoard(board: Board, selectPiece: Piece | null, playerColor: string | null = null, lastMoveFrom: {x:number;y:number}|null = null, lastMoveTo: {x:number;y:number}|null = null, inCheckSquare: {x:number;y:number}|null = null): void {
        if (!this.imagesLoaded) {
            console.warn('Images not loaded yet, retrying in 100ms...');
            setTimeout(() => this.drawBoard(board, selectPiece, playerColor), 100);
            return;
        }

        // Store the current state for potential redraws
        this.lastBoard = board;
        this.lastSelectPiece = selectPiece;
        this.lastPlayerColor = playerColor;

        // Set flip state based on player color
        this.isFlipped = playerColor === "black";

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the board background
        this.ctx.drawImage(this.boardImage, 0, 0, this.canvas.width, this.canvas.height);

        // Highlight last move squares (destination first so origin overlay remains visible)
        if (lastMoveFrom && lastMoveTo) {
            this.highlightSquare(lastMoveFrom.x, lastMoveFrom.y, 'rgba(255,215,0,0.35)'); // gold origin
            this.highlightSquare(lastMoveTo.x, lastMoveTo.y, 'rgba(50,205,50,0.45)'); // green destination
        }

        // Highlight king in check
        if (inCheckSquare) {
            this.highlightSquare(inCheckSquare.x, inCheckSquare.y, 'rgba(255,0,0,0.5)');
        }

        // Draw valid move indicators if a piece is selected
        if (selectPiece) {
            this.drawValidMoves(board, selectPiece);
        }

        // Draw the pieces
        this.drawPieces(board, selectPiece);
    }

    private drawValidMoves(board: Board, selectPiece: Piece): void {
        const currentPos = board.getPiecePosition(selectPiece);
        if (!currentPos) {
            return;
        }

        const validMoves = selectPiece.getValidMoves(currentPos, board);
        
        for (const move of validMoves) {
            // Check if the move is within board bounds
            if (move.x >= 0 && move.x < 8 && move.y >= 0 && move.y < 8) {
                const { canvasX, canvasY } = this.boardToCanvas(move.x, move.y);
                
                // Draw the selector square
                this.ctx.drawImage(this.selectorImage, canvasX, canvasY, this.squareSize, this.squareSize);
            }
        }
    }

    private drawPieces(board: Board, selectPiece: Piece | null = null): void {
        const squares = board.getSquares();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.getPieceAt(row, col);
                if (piece) {
                    const isSelected = selectPiece !== null && piece.id === selectPiece.id;
                    this.drawPiece(piece, row, col, isSelected);
                }
            }
        }
    }

    private drawPiece(piece: Piece, row: number, col: number, isSelected: boolean = false): void {
        const imageName = piece.getPiecePNG();
        const image = this.pieceImages.get(imageName);
        
        if (image) {
            const { canvasX, canvasY } = this.boardToCanvas(row, col);
            
            // Draw the piece image scaled to fit the square
            this.ctx.drawImage(image, canvasX, canvasY, this.squareSize, this.squareSize);
            
            // Draw yellow border if piece is selected
            if (isSelected) {
                this.ctx.strokeStyle = 'yellow';
                this.ctx.lineWidth = 4;
                this.ctx.strokeRect(canvasX + 2, canvasY + 2, this.squareSize - 4, this.squareSize - 4);
            }
        } else {
            console.warn(`Image not found for piece: ${imageName}`);
        }
    }

    // Helper method to convert board coordinates to canvas coordinates
    private boardToCanvas(row: number, col: number): { canvasX: number, canvasY: number } {
        if (this.isFlipped) {
            // Flip both row and column for black player perspective
            const flippedRow = 7 - row;
            const flippedCol = 7 - col;
            return {
                canvasX: flippedCol * this.squareSize,
                canvasY: flippedRow * this.squareSize
            };
        } else {
            // Normal orientation for white player
            return {
                canvasX: col * this.squareSize,
                canvasY: row * this.squareSize
            };
        }
    }

    // Helper method to convert canvas coordinates to board coordinates
    private canvasToBoard(canvasX: number, canvasY: number): { row: number, col: number } {
        const col = Math.floor(canvasX / this.squareSize);
        const row = Math.floor(canvasY / this.squareSize);
        
        if (this.isFlipped) {
            // Flip coordinates back to normal board coordinates for black player
            return {
                row: 7 - row,
                col: 7 - col
            };
        } else {
            // Normal coordinates for white player
            return { row, col };
        }
    }

    public getSquareFromPixel(x: number, y: number): { row: number, col: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        const { row, col } = this.canvasToBoard(canvasX, canvasY);
        
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            return { row, col };
        }
        
        return null;
    }

    public addClickListener(callback: (row: number, col: number) => void): void {
        this.canvas.addEventListener('click', (event) => {
            const square = this.getSquareFromPixel(event.clientX, event.clientY);
            if (square) {
                callback(square.row, square.col);
            }
        });
    }

    public highlightSquare(row: number, col: number, color: string = 'rgba(255, 255, 0, 0.5)'): void {
        const { canvasX, canvasY } = this.boardToCanvas(row, col);
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(canvasX, canvasY, this.squareSize, this.squareSize);
    }

    public isImagesLoaded(): boolean {
        return this.imagesLoaded;
    }

    private setupResponsiveCanvas(): void {
        // Get the container dimensions
        const container = this.canvas.parentElement;
        if (!container) return;

        // Calculate available space (considering padding and margins)
        const containerRect = container.getBoundingClientRect();
        const containerStyle = window.getComputedStyle(container);
        
        // Account for container padding
        const paddingLeft = parseFloat(containerStyle.paddingLeft);
        const paddingRight = parseFloat(containerStyle.paddingRight);
        const paddingTop = parseFloat(containerStyle.paddingTop);
        const paddingBottom = parseFloat(containerStyle.paddingBottom);
        
        const availableWidth = containerRect.width - paddingLeft - paddingRight;
        const availableHeight = containerRect.height - paddingTop - paddingBottom;
        
        // Make it square and fit within available space - use 95% of available space for maximum sizing
        const usableSize = Math.min(availableWidth, availableHeight) * 0.95;
        const maxSize = Math.min(usableSize, 800); // Increased cap from 720 to 800
        const minSize = 320; // Minimum size for very small screens
        const boardSize = Math.max(minSize, maxSize);
        
        // Calculate square size (8x8 board)
        this.squareSize = Math.floor(boardSize / 8);
        const actualBoardSize = this.squareSize * 8;
        
        // Update canvas dimensions
        this.canvas.width = actualBoardSize;
        this.canvas.height = actualBoardSize;
        
        // Also set CSS dimensions to ensure proper display
        this.canvas.style.width = actualBoardSize + 'px';
        this.canvas.style.height = actualBoardSize + 'px';
        
        console.log(`Canvas resized to: ${actualBoardSize}x${actualBoardSize}, square size: ${this.squareSize}`);
    }

    private redrawCanvas(): void {
        // Trigger a redraw with the last known state after canvas resize
        this.redrawWithLastState();
    }

    // Store reference to last drawn board state for redraws
    private lastBoard: Board | null = null;
    private lastSelectPiece: Piece | null = null;
    private lastPlayerColor: string | null = null;

    // Method to trigger a complete redraw with last known state
    public redrawWithLastState(): void {
        if (this.lastBoard) {
            this.drawBoard(this.lastBoard, this.lastSelectPiece, this.lastPlayerColor);
        }
    }
}