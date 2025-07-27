import { Board } from "./board";
import { Piece } from "./piece";

export class CanvasManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private squareSize: number = 80;
    private boardImage!: HTMLImageElement;
    private pieceImages: Map<string, HTMLImageElement> = new Map();
    private imagesLoaded: boolean = false;

    constructor(canvasId: string) {
        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (!this.canvas) {
            throw new Error(`Canvas with id '${canvasId}' not found.`);
        }
        
        this.ctx = this.canvas.getContext('2d')!;
        if (!this.ctx) {
            throw new Error('Could not get 2D context from canvas.');
        }

        this.loadImages();
    }

    private async loadImages(): Promise<void> {
        // Load the board background image
        this.boardImage = new Image();
        this.boardImage.src = './rect-8x8.png';

        // Load all piece images
        const pieceTypes = ['pawn', 'rook', 'knight', 'bishop', 'queen', 'king'];
        const colors = ['white', 'black'];
        
        const imagePromises: Promise<void>[] = [];

        // Load board image
        imagePromises.push(new Promise((resolve) => {
            this.boardImage.onload = () => resolve();
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

    public drawBoard(board: Board): void {
        if (!this.imagesLoaded) {
            console.warn('Images not loaded yet, retrying in 100ms...');
            setTimeout(() => this.drawBoard(board), 100);
            return;
        }

        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw the board background
        this.ctx.drawImage(this.boardImage, 0, 0, this.canvas.width, this.canvas.height);

        // Draw the pieces
        this.drawPieces(board);
    }

    private drawPieces(board: Board): void {
        const squares = board.getSquares();
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = board.getPieceAt(row, col);
                if (piece) {
                    this.drawPiece(piece, row, col);
                }
            }
        }
    }

    private drawPiece(piece: Piece, row: number, col: number): void {
        const imageName = piece.getPiecePNG();
        const image = this.pieceImages.get(imageName);
        
        if (image) {
            const x = col * this.squareSize;
            const y = row * this.squareSize;
            
            // Draw the piece image scaled to fit the square
            this.ctx.drawImage(image, x, y, this.squareSize, this.squareSize);
        } else {
            console.warn(`Image not found for piece: ${imageName}`);
        }
    }

    public getSquareFromPixel(x: number, y: number): { row: number, col: number } | null {
        const rect = this.canvas.getBoundingClientRect();
        const canvasX = x - rect.left;
        const canvasY = y - rect.top;
        
        const col = Math.floor(canvasX / this.squareSize);
        const row = Math.floor(canvasY / this.squareSize);
        
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
        const x = col * this.squareSize;
        const y = row * this.squareSize;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.squareSize, this.squareSize);
    }

    public isImagesLoaded(): boolean {
        return this.imagesLoaded;
    }
}