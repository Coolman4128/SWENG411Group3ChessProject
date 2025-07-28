import { Board } from "./board";

export class GameState {
    public whitePlayer: string | null;
    public blackPlayer: string | null;

    public currentTurn: string; // "white" or "black"

    public turnList: string[][] = []; // List of turns made in the game

    public board: Board;

    constructor() {
        this.whitePlayer = null;
        this.blackPlayer = null;
        this.currentTurn = "white"; // White starts first
        this.board = new Board();
    }
}