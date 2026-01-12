import { TestBed } from '@angular/core/testing';
import { MapGameService } from './map-game.service';
import { TimerService } from './timer.service';
import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest';

describe('MapGameService', () => {
  let service: MapGameService;
  let timerService: TimerService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapGameService);
    timerService = TestBed.inject(TimerService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have initial game state', () => {
      const state = service.gameState();

      expect(state.rounds).toHaveLength(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(state.totalScore).toBe(0);
      expect(state.timeLimit).toBe(60);
    });

    it('should have no gradient map initially', () => {
      expect(service.currentGradientMap()).toBeNull();
    });

    it('should have no pin initially', () => {
      expect(service.currentPin()).toBeNull();
    });
  });

  describe('startNewGame', () => {
    it('should reset game state', () => {
      service.startNewGame();

      const state = service.gameState();
      expect(state.rounds).toHaveLength(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
    });

    it('should generate a new gradient map', () => {
      service.startNewGame();

      const map = service.currentGradientMap();
      expect(map).not.toBeNull();
      expect(map?.width).toBe(50);
      expect(map?.height).toBe(50);
      expect(map?.cornerColors).toHaveLength(4);
    });

    it('should reset pin', () => {
      service.startNewGame();
      expect(service.currentPin()).toBeNull();
    });

    it('should start timer', () => {
      service.startNewGame();

      expect(timerService.isRunning()).toBe(true);
      expect(timerService.timeRemaining()).toBe(60);
    });
  });

  describe('placePin', () => {
    beforeEach(() => {
      service.startNewGame();
    });

    it('should place pin at specified coordinate', () => {
      const coordinate = { x: 0.5, y: 0.5 };
      service.placePin(coordinate);

      const pin = service.currentPin();
      expect(pin).not.toBeNull();
      expect(pin?.coordinate).toEqual(coordinate);
    });

    it('should set pin color based on map', () => {
      const coordinate = { x: 0.5, y: 0.5 };
      service.placePin(coordinate);

      const pin = service.currentPin();
      expect(pin?.color).toBeDefined();
      expect(pin?.color.r).toBeGreaterThanOrEqual(245);
      expect(pin?.color.r).toBeLessThanOrEqual(255);
      expect(pin?.color.g).toBeGreaterThanOrEqual(245);
      expect(pin?.color.g).toBeLessThanOrEqual(255);
      expect(pin?.color.b).toBeGreaterThanOrEqual(245);
      expect(pin?.color.b).toBeLessThanOrEqual(255);
    });

    it('should allow moving the pin', () => {
      service.placePin({ x: 0.3, y: 0.3 });
      service.placePin({ x: 0.7, y: 0.7 });

      const pin = service.currentPin();
      expect(pin?.coordinate).toEqual({ x: 0.7, y: 0.7 });
    });

    it('should not place pin if game is not active', () => {
      service.submitGuess(); // This will fail but should not cause issues
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      // After submission, placing pin should not work
      service.placePin({ x: 0.8, y: 0.8 });

      const pin = service.currentPin();
      expect(pin?.coordinate).toEqual({ x: 0.5, y: 0.5 }); // Should still be the first pin
    });
  });

  describe('submitGuess', () => {
    beforeEach(() => {
      service.startNewGame();
    });

    it('should not submit without pin', () => {
      service.submitGuess();

      const current = service.currentRound();
      expect(current?.selectedColor).toBeNull();
    });

    it('should submit guess with pin placed', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      const current = service.currentRound();
      expect(current?.selectedColor).not.toBeNull();
    });

    it('should stop timer when submitting', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      expect(timerService.isRunning()).toBe(false);
    });

    it('should calculate distance and score', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      const current = service.currentRound();
      expect(current?.distance).not.toBeNull();
      expect(current?.score).not.toBeNull();
      expect(current?.score).toBeGreaterThanOrEqual(0);
      expect(current?.score).toBeLessThanOrEqual(1000);
    });

    it('should store pin and time remaining in round', () => {
      vi.advanceTimersByTime(5000); // Advance 5 seconds
      service.placePin({ x: 0.3, y: 0.7 });
      service.submitGuess();

      const current = service.currentRound();
      expect(current?.pin).not.toBeNull();
      expect(current?.pin?.coordinate).toEqual({ x: 0.3, y: 0.7 });
      expect(current?.timeRemaining).toBe(55);
    });

    it('should update total score', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      const state = service.gameState();
      expect(state.totalScore).toBeGreaterThanOrEqual(0);
    });

    it('should prevent double submission', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      const firstScore = service.gameState().totalScore;

      service.submitGuess(); // Try to submit again

      expect(service.gameState().totalScore).toBe(firstScore); // Should not change
    });
  });

  describe('handleTimeout', () => {
    beforeEach(() => {
      service.startNewGame();
    });

    it('should handle timeout with no pin placed', () => {
      vi.advanceTimersByTime(60000); // Wait for timeout

      const current = service.currentRound();
      expect(current?.selectedColor).not.toBeNull();
      expect(current?.pin).not.toBeNull();
    });

    it('should create default pin at center on timeout', () => {
      vi.advanceTimersByTime(60000);

      const current = service.currentRound();
      expect(current?.pin?.coordinate).toEqual({ x: 0.5, y: 0.5 });
    });

    it('should handle timeout with pin already placed', () => {
      service.placePin({ x: 0.3, y: 0.7 });
      vi.advanceTimersByTime(60000);

      const current = service.currentRound();
      expect(current?.pin?.coordinate).toEqual({ x: 0.3, y: 0.7 });
    });

    it('should stop timer after timeout', () => {
      vi.advanceTimersByTime(60000);

      expect(timerService.isRunning()).toBe(false);
    });
  });

  describe('nextRound', () => {
    beforeEach(() => {
      service.startNewGame();
    });

    it('should not advance without completing current round', () => {
      service.nextRound();

      const state = service.gameState();
      expect(state.currentRoundIndex).toBe(0);
    });

    it('should advance to next round after submission', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();
      service.nextRound();

      const state = service.gameState();
      expect(state.currentRoundIndex).toBe(1);
      expect(state.rounds).toHaveLength(2);
    });

    it('should generate new gradient map for next round', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      const firstMap = service.currentGradientMap();

      service.nextRound();

      const secondMap = service.currentGradientMap();
      expect(secondMap).not.toBeNull();
      expect(secondMap).not.toBe(firstMap);
    });

    it('should reset pin for next round', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();
      service.nextRound();

      expect(service.currentPin()).toBeNull();
    });

    it('should restart timer for next round', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();
      service.nextRound();

      expect(timerService.isRunning()).toBe(true);
      expect(timerService.timeRemaining()).toBe(60);
    });

    it('should complete game after 5 rounds', () => {
      // Play through all 5 rounds
      for (let i = 0; i < 5; i++) {
        service.placePin({ x: 0.5, y: 0.5 });
        service.submitGuess();
        if (i < 4) {
          service.nextRound();
        }
      }

      // Try to advance after 5th round
      service.nextRound();

      const state = service.gameState();
      expect(state.isCompleted).toBe(true);
      expect(state.rounds).toHaveLength(5);
    });

    it('should stop timer when game is completed', () => {
      // Play through all 5 rounds
      for (let i = 0; i < 5; i++) {
        service.placePin({ x: 0.5, y: 0.5 });
        service.submitGuess();
        if (i < 4) {
          service.nextRound();
        }
      }

      service.nextRound();

      expect(timerService.timeRemaining()).toBe(0);
      expect(timerService.isRunning()).toBe(false);
    });
  });

  describe('resetGame', () => {
    it('should reset game to initial state', () => {
      service.startNewGame();
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      service.resetGame();

      const state = service.gameState();
      expect(state.rounds).toHaveLength(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
      expect(state.totalScore).toBe(0);
    });

    it('should reset timer', () => {
      service.startNewGame();
      vi.advanceTimersByTime(30000);

      service.resetGame();

      expect(timerService.timeRemaining()).toBe(60);
    });

    it('should clear pin', () => {
      service.startNewGame();
      service.placePin({ x: 0.5, y: 0.5 });

      service.resetGame();

      expect(service.currentPin()).toBeNull();
    });
  });

  describe('replayGame', () => {
    it('should start a fresh game', () => {
      service.startNewGame();
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      service.replayGame();

      const state = service.gameState();
      expect(state.rounds).toHaveLength(1);
      expect(state.currentRoundIndex).toBe(0);
      expect(state.isCompleted).toBe(false);
    });
  });

  describe('currentRound computed', () => {
    beforeEach(() => {
      service.startNewGame();
    });

    it('should return current round', () => {
      const round = service.currentRound();
      expect(round).not.toBeNull();
      expect(round?.roundNumber).toBe(1);
    });

    it('should return null when game is completed', () => {
      // Complete the game
      for (let i = 0; i < 5; i++) {
        service.placePin({ x: 0.5, y: 0.5 });
        service.submitGuess();
        if (i < 4) {
          service.nextRound();
        }
      }
      service.nextRound();

      expect(service.currentRound()).toBeNull();
    });
  });

  describe('isGameActive computed', () => {
    beforeEach(() => {
      service.startNewGame();
    });

    it('should be true at game start', () => {
      expect(service.isGameActive()).toBe(true);
    });

    it('should be false after submission', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();

      expect(service.isGameActive()).toBe(false);
    });

    it('should be true again after advancing to next round', () => {
      service.placePin({ x: 0.5, y: 0.5 });
      service.submitGuess();
      service.nextRound();

      expect(service.isGameActive()).toBe(true);
    });

    it('should be false when game is completed', () => {
      for (let i = 0; i < 5; i++) {
        service.placePin({ x: 0.5, y: 0.5 });
        service.submitGuess();
        if (i < 4) {
          service.nextRound();
        }
      }
      service.nextRound();

      expect(service.isGameActive()).toBe(false);
    });
  });
});
