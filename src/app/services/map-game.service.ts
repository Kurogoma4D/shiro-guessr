import { Injectable, signal, computed, inject } from '@angular/core';
import { GameState, GameRound, RGBColor, GradientMap, Pin, MapCoordinate } from '../models/game.model';
import { ColorService } from './color.service';
import { ScoreService } from './score.service';
import { TimerService } from './timer.service';
import { GradientMapService } from './gradient-map.service';

/**
 * Service for managing map-based game state and logic
 */
@Injectable({
  providedIn: 'root',
})
export class MapGameService {
  /**
   * Number of rounds in a complete game
   */
  private readonly TOTAL_ROUNDS = 5;

  /**
   * Time limit per round in seconds
   */
  private readonly TIME_LIMIT = 60;

  /**
   * Map dimensions (each pixel will be rendered as 16x16px)
   */
  private readonly MAP_WIDTH = 50;
  private readonly MAP_HEIGHT = 50;

  /**
   * Injected services
   */
  private readonly colorService = inject(ColorService);
  private readonly scoreService = inject(ScoreService);
  private readonly timerService = inject(TimerService);
  private readonly gradientMapService = inject(GradientMapService);

  /**
   * Game state signal
   */
  private readonly _gameState = signal<GameState>(this.createInitialState());

  /**
   * Current gradient map signal
   */
  private readonly _currentGradientMap = signal<GradientMap | null>(null);

  /**
   * Current pin signal
   */
  private readonly _currentPin = signal<Pin | null>(null);

  /**
   * Public read-only game state
   */
  readonly gameState = this._gameState.asReadonly();

  /**
   * Public read-only gradient map
   */
  readonly currentGradientMap = this._currentGradientMap.asReadonly();

  /**
   * Public read-only pin
   */
  readonly currentPin = this._currentPin.asReadonly();

  /**
   * Computed signal for the current round
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
   */
  readonly isGameActive = computed<boolean>(() => {
    const state = this._gameState();
    const current = this.currentRound();
    return !state.isCompleted && current !== null && current.selectedColor === null;
  });

  /**
   * Computed signal for time remaining
   */
  readonly timeRemaining = computed<number>(() => this.timerService.timeRemaining());

  constructor() {
    // Subscribe to timer timeout events
    this.timerService.onTimeout$.subscribe(() => {
      this.handleTimeout();
    });
  }

  /**
   * Starts a new game by resetting state and creating first round
   */
  startNewGame(): void {
    this._gameState.set(this.createInitialState());
    this._currentPin.set(null);
    this.startRound();
  }

  /**
   * Places a pin on the map at the specified coordinate
   * @param coordinate The map coordinate where the pin is placed
   */
  placePin(coordinate: MapCoordinate): void {
    const map = this._currentGradientMap();
    if (!map || !this.isGameActive()) {
      return;
    }

    // Get the color at the pin location
    const color = this.gradientMapService.getColorAt(map, coordinate);

    // Create the pin
    const pin: Pin = {
      coordinate,
      color,
    };

    this._currentPin.set(pin);
  }

  /**
   * Submits the current guess
   */
  submitGuess(): void {
    const state = this._gameState();
    const current = this.currentRound();
    const pin = this._currentPin();
    const map = this._currentGradientMap();

    // Validate: can only submit if game is active and pin is placed
    if (!current || state.isCompleted || current.selectedColor !== null || !pin || !map) {
      return;
    }

    // Stop the timer
    this.timerService.stopTimer();

    // Calculate distance and score
    const distance = this.colorService.calculateManhattanDistance(current.targetColor, pin.color);
    const score = this.scoreService.calculateRoundScore(distance);

    // Find the target pin location on the map
    const targetCoordinate = this.gradientMapService.findCoordinateForColor(map, current.targetColor);
    const targetPin: Pin = {
      coordinate: targetCoordinate,
      color: current.targetColor,
    };

    // Update the current round with selection
    const updatedRound: GameRound = {
      ...current,
      selectedColor: pin.color,
      distance,
      score,
      pin,
      targetPin,
      timeRemaining: this.timerService.timeRemaining(),
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
   * Handles timeout event
   */
  handleTimeout(): void {
    const state = this._gameState();
    const current = this.currentRound();

    // Only handle timeout if game is active and no selection has been made
    if (!current || state.isCompleted || current.selectedColor !== null) {
      return;
    }

    // If no pin is placed, create a default pin at center with score 0
    if (!this._currentPin()) {
      const centerCoordinate: MapCoordinate = { x: 0.5, y: 0.5 };
      const map = this._currentGradientMap();
      if (map) {
        const color = this.gradientMapService.getColorAt(map, centerCoordinate);
        this._currentPin.set({
          coordinate: centerCoordinate,
          color,
        });
      }
    }

    // Submit the guess (will use the pin if placed, or the default center pin)
    this.submitGuess();
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
      this.timerService.resetTimer();
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

    // Reset pin and start the new round
    this._currentPin.set(null);
    this.startRound();
  }

  /**
   * Resets the game to initial state
   */
  resetGame(): void {
    this.timerService.resetTimer();
    this.startNewGame();
  }

  /**
   * Replays the game by starting fresh
   */
  replayGame(): void {
    this.resetGame();
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
      timeLimit: this.TIME_LIMIT,
    };
  }

  /**
   * Creates a new game round with a random target color
   * @param roundNumber The round number (1-based)
   * @returns A new GameRound
   */
  private createRound(roundNumber: number): GameRound {
    // Target color will be set when the round starts and we have the gradient map
    const targetColor: RGBColor = { r: 0, g: 0, b: 0 }; // Placeholder

    return {
      roundNumber,
      targetColor,
      selectedColor: null,
      distance: null,
      score: null,
      paletteColors: [], // Not used in map mode
    };
  }

  /**
   * Starts a round by generating a new gradient map and starting the timer
   */
  private startRound(): void {
    // Generate new gradient map
    const map = this.gradientMapService.generateGradientMap(this.MAP_WIDTH, this.MAP_HEIGHT);
    this._currentGradientMap.set(map);

    // Pick a random target color from the gradient map
    const randomX = Math.random();
    const randomY = Math.random();
    const targetColor = this.gradientMapService.getColorAt(map, { x: randomX, y: randomY });

    // Update the current round with the target color
    const state = this._gameState();
    const currentRound = state.rounds[state.currentRoundIndex];
    if (currentRound) {
      currentRound.targetColor = targetColor;
      this._gameState.set({ ...state });
    }

    // Reset pin
    this._currentPin.set(null);

    // Start timer
    this.timerService.startTimer(this.TIME_LIMIT);
  }
}
