import { TestBed } from '@angular/core/testing';
import { ScoreService } from './score.service';
import { GameRound } from '../models/game.model';

describe('ScoreService', () => {
  let service: ScoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateRoundScore', () => {
    it('should return 1000 points for distance 0 (perfect match)', () => {
      const score = service.calculateRoundScore(0);
      expect(score).toBe(1000);
    });

    it('should return 0 points for distance 30 (maximum distance)', () => {
      const score = service.calculateRoundScore(30);
      expect(score).toBe(0);
    });

    it('should return 500 points for distance 15 (halfway)', () => {
      const score = service.calculateRoundScore(15);
      expect(score).toBe(500);
    });

    it('should calculate correct score for distance 5', () => {
      const score = service.calculateRoundScore(5);
      // 1000 × (1 - 5/30) = 1000 × (25/30) = 1000 × 0.8333... = 833.33 → 833
      expect(score).toBe(833);
    });

    it('should calculate correct score for distance 10', () => {
      const score = service.calculateRoundScore(10);
      // 1000 × (1 - 10/30) = 1000 × (20/30) = 1000 × 0.6667 = 666.67 → 667
      expect(score).toBe(667);
    });

    it('should calculate correct score for distance 20', () => {
      const score = service.calculateRoundScore(20);
      // 1000 × (1 - 20/30) = 1000 × (10/30) = 1000 × 0.3333 = 333.33 → 333
      expect(score).toBe(333);
    });

    it('should calculate correct score for distance 25', () => {
      const score = service.calculateRoundScore(25);
      // 1000 × (1 - 25/30) = 1000 × (5/30) = 1000 × 0.1667 = 166.67 → 167
      expect(score).toBe(167);
    });

    it('should handle distance 1 correctly', () => {
      const score = service.calculateRoundScore(1);
      // 1000 × (1 - 1/30) = 1000 × (29/30) = 966.67 → 967
      expect(score).toBe(967);
    });

    it('should clamp negative distances to 0', () => {
      const score = service.calculateRoundScore(-5);
      expect(score).toBe(1000);
    });

    it('should clamp distances greater than 30 to maximum', () => {
      const score = service.calculateRoundScore(50);
      expect(score).toBe(0);
    });

    it('should handle decimal distances correctly', () => {
      const score = service.calculateRoundScore(7.5);
      // 1000 × (1 - 7.5/30) = 1000 × 0.75 = 750
      expect(score).toBe(750);
    });

    it('should return integer scores', () => {
      for (let distance = 0; distance <= 30; distance++) {
        const score = service.calculateRoundScore(distance);
        expect(Number.isInteger(score)).toBe(true);
      }
    });

    it('should return scores in range 0-1000', () => {
      for (let distance = 0; distance <= 30; distance++) {
        const score = service.calculateRoundScore(distance);
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(1000);
      }
    });

    it('should have monotonically decreasing scores as distance increases', () => {
      let previousScore = 1001; // Start higher than max
      for (let distance = 0; distance <= 30; distance++) {
        const score = service.calculateRoundScore(distance);
        expect(score).toBeLessThanOrEqual(previousScore);
        previousScore = score;
      }
    });
  });

  describe('calculateTotalScore', () => {
    it('should return 0 for empty rounds array', () => {
      const totalScore = service.calculateTotalScore([]);
      expect(totalScore).toBe(0);
    });

    it('should calculate total score for single completed round', () => {
      const rounds: GameRound[] = [
        {
          roundNumber: 1,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 250, g: 250, b: 250 },
          distance: 0,
          score: 1000,
          paletteColors: [],
        },
      ];

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(1000);
    });

    it('should calculate total score for multiple completed rounds', () => {
      const rounds: GameRound[] = [
        {
          roundNumber: 1,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 250, g: 250, b: 250 },
          distance: 0,
          score: 1000,
          paletteColors: [],
        },
        {
          roundNumber: 2,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 245, g: 245, b: 245 },
          distance: 15,
          score: 500,
          paletteColors: [],
        },
        {
          roundNumber: 3,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 240, g: 240, b: 240 },
          distance: 30,
          score: 0,
          paletteColors: [],
        },
      ];

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(1500); // 1000 + 500 + 0
    });

    it('should ignore rounds with null scores', () => {
      const rounds: GameRound[] = [
        {
          roundNumber: 1,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 250, g: 250, b: 250 },
          distance: 0,
          score: 1000,
          paletteColors: [],
        },
        {
          roundNumber: 2,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: null,
          distance: null,
          score: null, // Not yet completed
          paletteColors: [],
        },
      ];

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(1000); // Only count the first round
    });

    it('should handle all perfect scores', () => {
      const rounds: GameRound[] = Array.from({ length: 5 }, (_, i) => ({
        roundNumber: i + 1,
        targetColor: { r: 250, g: 250, b: 250 },
        selectedColor: { r: 250, g: 250, b: 250 },
        distance: 0,
        score: 1000,
        paletteColors: [],
      }));

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(5000); // 5 × 1000
    });

    it('should handle all zero scores', () => {
      const rounds: GameRound[] = Array.from({ length: 5 }, (_, i) => ({
        roundNumber: i + 1,
        targetColor: { r: 250, g: 250, b: 250 },
        selectedColor: { r: 220, g: 220, b: 220 },
        distance: 30,
        score: 0,
        paletteColors: [],
      }));

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(0);
    });

    it('should calculate total for realistic game scenario', () => {
      const rounds: GameRound[] = [
        {
          roundNumber: 1,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 250, g: 250, b: 250 },
          distance: 0,
          score: 1000,
          paletteColors: [],
        },
        {
          roundNumber: 2,
          targetColor: { r: 255, g: 255, b: 255 },
          selectedColor: { r: 252, g: 253, b: 254 },
          distance: 5,
          score: 833,
          paletteColors: [],
        },
        {
          roundNumber: 3,
          targetColor: { r: 245, g: 248, b: 252 },
          selectedColor: { r: 248, g: 250, b: 250 },
          distance: 7,
          score: 767,
          paletteColors: [],
        },
        {
          roundNumber: 4,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 245, g: 245, b: 245 },
          distance: 15,
          score: 500,
          paletteColors: [],
        },
        {
          roundNumber: 5,
          targetColor: { r: 252, g: 252, b: 252 },
          selectedColor: { r: 250, g: 251, b: 253 },
          distance: 4,
          score: 867,
          paletteColors: [],
        },
      ];

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(3967); // 1000 + 833 + 767 + 500 + 867
    });

    it('should handle mixed completed and incomplete rounds', () => {
      const rounds: GameRound[] = [
        {
          roundNumber: 1,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 250, g: 250, b: 250 },
          distance: 0,
          score: 1000,
          paletteColors: [],
        },
        {
          roundNumber: 2,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: { r: 245, g: 245, b: 245 },
          distance: 15,
          score: 500,
          paletteColors: [],
        },
        {
          roundNumber: 3,
          targetColor: { r: 250, g: 250, b: 250 },
          selectedColor: null,
          distance: null,
          score: null,
          paletteColors: [],
        },
      ];

      const totalScore = service.calculateTotalScore(rounds);
      expect(totalScore).toBe(1500); // 1000 + 500, ignore incomplete round
    });
  });

  describe('integration with calculateRoundScore', () => {
    it('should correctly sum scores calculated by calculateRoundScore', () => {
      const distances = [0, 5, 10, 15, 20];
      const rounds: GameRound[] = distances.map((distance, index) => ({
        roundNumber: index + 1,
        targetColor: { r: 250, g: 250, b: 250 },
        selectedColor: { r: 245, g: 245, b: 245 },
        distance,
        score: service.calculateRoundScore(distance),
        paletteColors: [],
      }));

      const totalScore = service.calculateTotalScore(rounds);

      // Calculate expected total manually
      const expectedTotal = distances.reduce(
        (sum, distance) => sum + service.calculateRoundScore(distance),
        0
      );

      expect(totalScore).toBe(expectedTotal);
    });
  });
});
