import { Board } from "./board";

export class GameState {
    public whitePlayer: string | null;
    public blackPlayer: string | null;

    public currentTurn: string; // "white" or "black"

    public board: Board;

    constructor() {
        this.whitePlayer = null;
        this.blackPlayer = null;
        this.currentTurn = "white"; // White starts first
        this.board = new Board();
    }
}