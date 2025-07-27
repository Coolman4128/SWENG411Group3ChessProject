import { GameState } from "./gamestate";

export class GameManager {
    private gameState: GameState;

    constructor() {
        this.gameState = new GameState();
    }

    public packageGameStateJSON(): string{
        return JSON.stringify({
            whitePlayer: this.gameState.whitePlayer,
            blackPlayer: this.gameState.blackPlayer,
            currentTurn: this.gameState.currentTurn,
            board: this.gameState.board
        });
    }

    public getOpenPlayerSlot(): string | null {
        if (this.gameState.whitePlayer === null && this.gameState.blackPlayer === null) {
            var randomPosition = Math.random() < 0.5 ? "white" : "black";
            return randomPosition; // Randomly assign to either white or black
        }
        else if (this.gameState.whitePlayer === null) {
            return "white"; // White slot is open
        }
        else if (this.gameState.blackPlayer === null) {
            return "black"; // Black slot is open
        }
        return null; // No open slots
    }

    public assignPlayer(playerId: string, position:string): void {
        if (position === "white" && this.gameState.whitePlayer == null) {
            this.gameState.whitePlayer = playerId;
        } else if (position === "black" && this.gameState.blackPlayer == null) {
            this.gameState.blackPlayer = playerId;
        } else {
            throw new Error("Invalid position. Must be 'white' or 'black'.");
        }
    }
}