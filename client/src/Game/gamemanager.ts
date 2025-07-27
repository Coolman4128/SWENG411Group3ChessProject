import { Board } from "./board";
import { GameState } from "./gamestate";

export class GameManager {
    private gameState: GameState;

    private playerID: string; // ID of the player whose turn it is
    private playerColor: string | null; // "white" or "black" null for spectators

    constructor() {
        this.playerID = ""; // This will be set when a player connects
        this.playerColor = null; // Initially, the player has no color assigned
        this.gameState = new GameState("{}");
    }

    public setPlayerID(playerID: string): void {
        this.playerID = playerID;
    }
    public loadGameState(jsonData: any): void {
        this.gameState = new GameState(jsonData, this.playerID);
        if (this.gameState.whitePlayer === this.playerID) {
            this.playerColor = "white";
        } else if (this.gameState.blackPlayer === this.playerID) {
            this.playerColor = "black";
        }
        else {
            this.playerColor = null; // Spectator or not assigned
        }
    }

    public getBoard(): Board {
        return this.gameState.board;
    }

    public getIsTurn(): boolean {
        if (this.playerColor === null) {
            return false; // Spectators cannot make moves
        }
        if (this.playerColor === this.gameState.currentTurn) {
            return true; // It's the player's turn
        }
        return false;
    }

    public getPlayerColor(): string | null {
        return this.playerColor;
    }
}