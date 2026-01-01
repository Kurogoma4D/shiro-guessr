import { TestBed } from '@angular/core/testing';
import { GameService } from './game.service';
import { ColorService } from './color.service';
import { ScoreService } from './score.service';
import { RGBColor } from '../models/game.model';

describe('GameService', () => {
  let service: GameService;
  let colorService: ColorService;
  let scoreService: ScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameService);
    colorService = TestBed.inject(ColorService);
    scoreService = TestBed.inject(ScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Game Start', () => {
    it('should initialize with a new game state', () => {
      const state = service.gameState();

      expect(state.rounds.length).toBe(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(state.totalScore).toBe(0);
    });

    it('should create first round with target color and palette', () => {
      const state = service.gameState();
      const firstRound = state.rounds[0];

      expect(firstRound.roundNumber).toBe(1);
      expect(firstRound.targetColor).toBeDefined();
      expect(firstRound.targetColor.r).toBeGreaterThanOrEqual(245);
      expect(firstRound.targetColor.r).toBeLessThanOrEqual(255);
      expect(firstRound.selectedColor).toBeNull();
      expect(firstRound.distance).toBeNull();
      expect(firstRound.score).toBeNull();
      expect(firstRound.paletteColors.length).toBe(25);
    });

    it('should ensure target color is in the palette', () => {
      const state = service.gameState();
      const firstRound = state.rounds[0];
      const target = firstRound.targetColor;

      const targetInPalette = firstRound.paletteColors.some(
        (p) => p.color.r === target.r && p.color.g === target.g && p.color.b === target.b
      );

      expect(targetInPalette).toBe(true);
    });

    it('should have currentRound computed signal return first round', () => {
      const currentRound = service.currentRound();

      expect(currentRound).not.toBeNull();
      expect(currentRound?.roundNumber).toBe(1);
    });

    it('should have isGameActive computed signal return true initially', () => {
      expect(service.isGameActive()).toBe(true);
    });
  });

  describe('startNewGame', () => {
    it('should reset the game state', () => {
      // Make some progress in the game first
      const state = service.gameState();
      const firstRound = state.rounds[0];
      service.selectColor(firstRound.targetColor);
      service.nextRound();

      // Now start a new game
      service.startNewGame();

      const newState = service.gameState();
      expect(newState.rounds.length).toBe(1);
      expect(newState.currentRoundIndex).toBe(0);
      expect(newState.isCompleted).toBe(false);
      expect(newState.totalScore).toBe(0);
    });
  });

  describe('Color Selection', () => {
    it('should update round with selected color, distance, and score', () => {
      const state = service.gameState();
      const currentRound = state.rounds[0];
      const targetColor = currentRound.targetColor;

      // Select the exact target color (perfect match)
      service.selectColor(targetColor);

      const updatedState = service.gameState();
      const updatedRound = updatedState.rounds[0];

      expect(updatedRound.selectedColor).toEqual(targetColor);
      expect(updatedRound.distance).toBe(0);
      expect(updatedRound.score).toBe(1000);
    });

    it('should calculate correct distance and score for non-perfect match', () => {
      const state = service.gameState();
      const currentRound = state.rounds[0];
      const targetColor = currentRound.targetColor;

      // Create a color with distance of 3 (1+1+1)
      const selectedColor: RGBColor = {
        r: targetColor.r + 1,
        g: targetColor.g + 1,
        b: targetColor.b + 1,
      };

      service.selectColor(selectedColor);

      const updatedState = service.gameState();
      const updatedRound = updatedState.rounds[0];

      expect(updatedRound.selectedColor).toEqual(selectedColor);
      expect(updatedRound.distance).toBe(3);
      expect(updatedRound.score).toBe(scoreService.calculateRoundScore(3));
    });

    it('should update totalScore after selection', () => {
      const state = service.gameState();
      const currentRound = state.rounds[0];

      service.selectColor(currentRound.targetColor);

      const updatedState = service.gameState();
      expect(updatedState.totalScore).toBe(1000);
    });

    it('should set isGameActive to false after selection', () => {
      const state = service.gameState();
      const currentRound = state.rounds[0];

      expect(service.isGameActive()).toBe(true);

      service.selectColor(currentRound.targetColor);

      expect(service.isGameActive()).toBe(false);
    });

    it('should not allow selecting color twice for same round', () => {
      const state = service.gameState();
      const currentRound = state.rounds[0];
      const targetColor = currentRound.targetColor;

      // First selection
      service.selectColor(targetColor);

      // Try to select again
      const differentColor: RGBColor = { r: 250, g: 250, b: 250 };
      service.selectColor(differentColor);

      const updatedState = service.gameState();
      const updatedRound = updatedState.rounds[0];

      // Should still have first selection
      expect(updatedRound.selectedColor).toEqual(targetColor);
      expect(updatedRound.score).toBe(1000);
    });

    it('should not allow selection when game is completed', () => {
      // Complete all 5 rounds
      for (let i = 0; i < 5; i++) {
        const state = service.gameState();
        const currentRound = service.currentRound();
        if (currentRound) {
          service.selectColor(currentRound.targetColor);
          service.nextRound();
        }
      }

      const testColor: RGBColor = { r: 255, g: 255, b: 255 };
      service.selectColor(testColor);

      // Should not affect anything
      const state = service.gameState();
      expect(state.isCompleted).toBe(true);
    });
  });

  describe('Round Progression', () => {
    it('should advance to next round after selection', () => {
      const state = service.gameState();
      const firstRound = state.rounds[0];

      service.selectColor(firstRound.targetColor);
      service.nextRound();

      const updatedState = service.gameState();
      expect(updatedState.rounds.length).toBe(2);
      expect(updatedState.currentRoundIndex).toBe(1);
      expect(updatedState.isCompleted).toBe(false);
    });

    it('should create new round with correct round number', () => {
      const state = service.gameState();
      service.selectColor(state.rounds[0].targetColor);
      service.nextRound();

      const updatedState = service.gameState();
      const secondRound = updatedState.rounds[1];

      expect(secondRound.roundNumber).toBe(2);
      expect(secondRound.selectedColor).toBeNull();
      expect(secondRound.paletteColors.length).toBe(25);
    });

    it('should not advance if current round has no selection', () => {
      service.nextRound();

      const state = service.gameState();
      expect(state.rounds.length).toBe(1);
      expect(state.currentRoundIndex).toBe(0);
    });

    it('should update currentRound computed signal after advancing', () => {
      const firstRound = service.currentRound();
      expect(firstRound?.roundNumber).toBe(1);

      service.selectColor(firstRound!.targetColor);
      service.nextRound();

      const secondRound = service.currentRound();
      expect(secondRound?.roundNumber).toBe(2);
    });

    it('should accumulate totalScore across rounds', () => {
      // Round 1: perfect score
      let currentRound = service.currentRound();
      service.selectColor(currentRound!.targetColor);
      service.nextRound();

      let state = service.gameState();
      expect(state.totalScore).toBe(1000);

      // Round 2: perfect score again
      currentRound = service.currentRound();
      service.selectColor(currentRound!.targetColor);
      service.nextRound();

      state = service.gameState();
      expect(state.totalScore).toBe(2000);
    });
  });

  describe('Game Completion', () => {
    it('should complete game after 5 rounds', () => {
      // Play through all 5 rounds
      for (let i = 0; i < 5; i++) {
        const currentRound = service.currentRound();
        expect(currentRound).not.toBeNull();

        service.selectColor(currentRound!.targetColor);
        service.nextRound();
      }

      const state = service.gameState();
      expect(state.isCompleted).toBe(true);
      expect(state.rounds.length).toBe(5);
    });

    it('should set currentRound to null when completed', () => {
      // Complete all rounds
      for (let i = 0; i < 5; i++) {
        const currentRound = service.currentRound();
        if (currentRound) {
          service.selectColor(currentRound.targetColor);
          service.nextRound();
        }
      }

      expect(service.currentRound()).toBeNull();
    });

    it('should set isGameActive to false when completed', () => {
      // Complete all rounds
      for (let i = 0; i < 5; i++) {
        const currentRound = service.currentRound();
        if (currentRound) {
          service.selectColor(currentRound.targetColor);
          service.nextRound();
        }
      }

      expect(service.isGameActive()).toBe(false);
    });

    it('should calculate final totalScore correctly', () => {
      // Complete all rounds with perfect scores
      for (let i = 0; i < 5; i++) {
        const currentRound = service.currentRound();
        if (currentRound) {
          service.selectColor(currentRound.targetColor);
          service.nextRound();
        }
      }

      const state = service.gameState();
      expect(state.totalScore).toBe(5000);
    });

    it('should have all rounds completed', () => {
      // Complete all rounds
      for (let i = 0; i < 5; i++) {
        const currentRound = service.currentRound();
        if (currentRound) {
          service.selectColor(currentRound.targetColor);
          service.nextRound();
        }
      }

      const state = service.gameState();
      state.rounds.forEach((round) => {
        expect(round.selectedColor).not.toBeNull();
        expect(round.distance).not.toBeNull();
        expect(round.score).not.toBeNull();
      });
    });
  });

  describe('resetGame', () => {
    it('should reset to initial state', () => {
      // Make some progress
      const currentRound = service.currentRound();
      service.selectColor(currentRound!.targetColor);
      service.nextRound();

      // Reset
      service.resetGame();

      const state = service.gameState();
      expect(state.rounds.length).toBe(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(state.totalScore).toBe(0);
      expect(service.isGameActive()).toBe(true);
    });
  });

  describe('replayGame', () => {
    it('should start a new game', () => {
      // Complete the game
      for (let i = 0; i < 5; i++) {
        const currentRound = service.currentRound();
        if (currentRound) {
          service.selectColor(currentRound.targetColor);
          service.nextRound();
        }
      }

      expect(service.gameState().isCompleted).toBe(true);

      // Replay
      service.replayGame();

      const state = service.gameState();
      expect(state.rounds.length).toBe(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(state.totalScore).toBe(0);
      expect(service.isGameActive()).toBe(true);
    });
  });
});
