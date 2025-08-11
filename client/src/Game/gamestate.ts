import { Board } from "./board";

export class GameState {
    public whitePlayer: string | null;
    public blackPlayer: string | null;

    public currentTurn: string; // "white" or "black"

    public turnList: string[][] = []; // List of turns made in the game

    public board: Board;

    // Timer properties (time in milliseconds)
    public whiteTimeRemaining: number = 20 * 60 * 1000; // 20 minutes in milliseconds
    public blackTimeRemaining: number = 20 * 60 * 1000; // 20 minutes in milliseconds
    public gameStarted: boolean = false; // Has the first move been made?

    constructor(jsonData: any, playerID: string = "") {
    const data = jsonData;
    this.whitePlayer = data.whitePlayer || null;
    this.blackPlayer = data.blackPlayer || null;
    this.currentTurn = data.currentTurn || "white";
    this.turnList = data.turnList || [];
    this.whiteTimeRemaining = data.whiteTimeRemaining || 20 * 60 * 1000;
    this.blackTimeRemaining = data.blackTimeRemaining || 20 * 60 * 1000;
    this.gameStarted = data.gameStarted || false;
    
    if (data.board === undefined) {
        console.log("Board is undefined, creating new board");
        this.board = new Board();
    }
    else {
        console.log("Loading board from JSON data");
        this.board = Board.getBoardFromJSON(data.board);
    }
}
}