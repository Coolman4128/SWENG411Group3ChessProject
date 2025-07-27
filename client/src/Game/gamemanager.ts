import { Board } from "./board";

export class GameManager {
    private board: Board;
    private isTurn: boolean; // true your turn, false opponent's turn

    private playerColor: string; // "white" or "black"

    constructor() {
        this.board = new Board();
        this.isTurn = true;
        this.playerColor = "white";
    }

    private friendlyCapturedPieces: number[] = [];
    private opponentCapturedPieces: number[] = [];

    public getBoard(): Board {
        return this.board;
    }

    public getIsTurn(): boolean {
        return this.isTurn;
    }

    public getPlayerColor(): string {
        return this.playerColor;
    }
}