import { Injectable, signal, computed } from '@angular/core';
import { ColorService } from './color.service';
import { ScoreService } from './score.service';
import { GameState, GameRound, RGBColor, PaletteColor } from '../models/game.model';
import { inject } from '@angular/core';

/**
 * Service for managing game state and logic
 */
@Injectable({
  providedIn: 'root',
})
export class GameService {
  /**
   * Number of rounds in a complete game
   */
  private readonly TOTAL_ROUNDS = 5;

  /**
   * Number of colors in the palette for each round
   */
  private readonly PALETTE_SIZE = 25;

  /**
   * Injected ColorService for color generation and manipulation
   */
  private readonly colorService = inject(ColorService);

  /**
   * Injected ScoreService for score calculations
   */
  private readonly scoreService = inject(ScoreService);

  /**
   * Game state signal - writable signal containing the complete game state
   */
  private readonly _gameState = signal<GameState>(this.createInitialState());

  /**
   * Public read-only game state
   */
  readonly gameState = this._gameState.asReadonly();

  /**
   * Computed signal for the current round
   * Returns null if game is completed or not started
   */
  readonly currentRound = computed<GameRound | null>(() => {
    const state = this._gameState();
    if (state.isCompleted || state.currentRoundIndex >= state.rounds.length) {
      return null;
    }
    return state.rounds[state.currentRoundIndex];
  });

  /**
   * Computed signal indicating whether the game is currently active
   * Active means: game has started, not completed, and current round has no selection yet
   */
  readonly isGameActive = computed<boolean>(() => {
    const state = this._gameState();
    const current = this.currentRound();
    return !state.isCompleted && current !== null && current.selectedColor === null;
  });

  /**
   * Starts a new game by resetting state and creating first round
   */
  startNewGame(): void {
    this._gameState.set(this.createInitialState());
  }

  /**
   * Handles color selection for the current round
   * Calculates distance and score, updates the round
   * @param color The color selected by the player
   */
  selectColor(color: RGBColor): void {
    const state = this._gameState();
    const current = this.currentRound();

    // Validate: can only select if game is active
    if (!current || state.isCompleted || current.selectedColor !== null) {
      return;
    }

    // Calculate distance and score
    const distance = this.colorService.calculateManhattanDistance(current.targetColor, color);
    const score = this.scoreService.calculateRoundScore(distance);

    // Update the current round with selection
    const updatedRound: GameRound = {
      ...current,
      selectedColor: color,
      distance,
      score,
    };

    // Update rounds array
    const updatedRounds = [...state.rounds];
    updatedRounds[state.currentRoundIndex] = updatedRound;

    // Calculate new total score
    const totalScore = this.scoreService.calculateTotalScore(updatedRounds);

    // Update state
    this._gameState.update((s) => ({
      ...s,
      rounds: updatedRounds,
      totalScore,
    }));
  }

  /**
   * Advances to the next round or completes the game
   */
  nextRound(): void {
    const state = this._gameState();
    const current = this.currentRound();

    // Validate: can only advance if current round is completed
    if (!current || current.selectedColor === null) {
      return;
    }

    const nextRoundIndex = state.currentRoundIndex + 1;

    // Check if game should be completed
    if (nextRoundIndex >= this.TOTAL_ROUNDS) {
      this._gameState.update((s) => ({
        ...s,
        isCompleted: true,
      }));
      return;
    }

    // Create next round
    const nextRound = this.createRound(nextRoundIndex + 1);
    const updatedRounds = [...state.rounds, nextRound];

    // Update state with next round
    this._gameState.update((s) => ({
      ...s,
      rounds: updatedRounds,
      currentRoundIndex: nextRoundIndex,
    }));
  }

  /**
   * Resets the game to initial state (same as startNewGame)
   */
  resetGame(): void {
    this.startNewGame();
  }

  /**
   * Replays the game by starting fresh
   * (In this implementation, it's the same as resetGame/startNewGame)
   */
  replayGame(): void {
    this.startNewGame();
  }

  /**
   * Creates the initial game state with the first round
   * @returns Initial GameState
   */
  private createInitialState(): GameState {
    const firstRound = this.createRound(1);
    return {
      rounds: [firstRound],
      currentRoundIndex: 0,
      isCompleted: false,
      totalScore: 0,
    };
  }

  /**
   * Creates a new game round with a random target color and palette
   * @param roundNumber The round number (1-based)
   * @returns A new GameRound
   */
  private createRound(roundNumber: number): GameRound {
    const targetColor = this.colorService.generateRandomWhiteColor();
    const paletteColors = this.colorService.getRandomPaletteColors(this.PALETTE_SIZE);

    // Ensure target color is in the palette
    const targetInPalette = paletteColors.some(
      (p) =>
        p.color.r === targetColor.r &&
        p.color.g === targetColor.g &&
        p.color.b === targetColor.b
    );

    // If target is not in palette, replace the first color with target
    if (!targetInPalette) {
      paletteColors[0] = { color: targetColor };
    }

    return {
      roundNumber,
      targetColor,
      selectedColor: null,
      distance: null,
      score: null,
      paletteColors,
    };
  }
}
