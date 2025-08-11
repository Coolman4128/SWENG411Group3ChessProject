import { GameState, MoveResult } from "./gamestate";

export class GameManager {
    private gameState: GameState;

    constructor() {
        this.gameState = new GameState();
    }

    public packageGameStateJSON(): string{
        return this.gameState.toJSON();
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

    /**
     * Handles a move piece request
     */
    public handleMovePiece(
        playerId: string,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        eventEmitter?: (event: string, data: any) => void
    ): MoveResult {
        return this.gameState.movePiece(playerId, fromX, fromY, toX, toY, eventEmitter);
    }

    /**
     * Handles a take piece request
     */
    public handleTakePiece(
        playerId: string,
        fromX: number,
        fromY: number,
        toX: number,
        toY: number,
        eventEmitter?: (event: string, data: any) => void
    ): MoveResult {
        return this.gameState.takePiece(playerId, fromX, fromY, toX, toY, eventEmitter);
    }

    /**
     * Gets the current game state
     */
    public getGameState(): GameState {
        return this.gameState;
    }

    /**
     * Gets the opponent's player ID given a player ID
     */
    public getOpponentId(playerId: string): string | null {
        if (this.gameState.whitePlayer === playerId) {
            return this.gameState.blackPlayer;
        } else if (this.gameState.blackPlayer === playerId) {
            return this.gameState.whitePlayer;
        }
        return null;
    }

    /**
     * Checks if the game has started (both players assigned and at least one move made)
     */
    public isGameStarted(): boolean {
        return this.gameState.whitePlayer !== null && 
               this.gameState.blackPlayer !== null && 
               this.gameState.turnList.length > 0;
    }

    /**
     * Removes a player from the game
     * @param playerId - The ID of the player to remove
     * @returns The color of the removed player, or null if player not found
     */
    public removePlayer(playerId: string): string | null {
        if (this.gameState.whitePlayer === playerId) {
            this.gameState.whitePlayer = null;
            return "white";
        } else if (this.gameState.blackPlayer === playerId) {
            this.gameState.blackPlayer = null;
            return "black";
        }
        return null;
    }

    /**
     * Checks if either player has run out of time
     */
    public checkForTimeout(): { isTimeOut: boolean; winner?: string } {
        return this.gameState.checkTimeOut();
    }

    /**
     * Checks if a player is assigned to this game
     */
    public isPlayerInGame(playerId: string): boolean {
        return this.gameState.whitePlayer === playerId || this.gameState.blackPlayer === playerId;
    }

    /**
     * Reset the game state to start a new game
     */
    public resetGame(): void {
        this.gameState = new GameState();
    }

    /**
     * Check if both players are ready for a new game
     */
    public areBothPlayersReady(): boolean {
        return this.gameState.whitePlayer !== null && this.gameState.blackPlayer !== null;
    }
}