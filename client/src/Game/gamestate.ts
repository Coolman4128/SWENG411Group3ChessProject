import { Board } from "./board";

export class GameState {
    public whitePlayer: string | null;
    public blackPlayer: string | null;

    public currentTurn: string; // "white" or "black"

    public turnList: string[][] = []; // List of turns made in the game

    public board: Board;

    constructor(jsonData: any, playerID: string = "") {
    const data = jsonData;
    this.whitePlayer = data.whitePlayer || null;
    this.blackPlayer = data.blackPlayer || null;
    this.currentTurn = data.currentTurn || "white";
    this.turnList = data.turnList || [];
    
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