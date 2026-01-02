import { TestBed } from '@angular/core/testing';
import { ShareService } from './share.service';
import { GameState } from '../models/game.model';
import { vi } from 'vitest';

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateShareText', () => {
    it('should generate correct share text with score, percentage, and round breakdown', () => {
      const mockGameState: GameState = {
        rounds: [
          {
            roundNumber: 1,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 250, g: 250, b: 250 },
            distance: 10,
            score: 900,
          },
          {
            roundNumber: 2,
            targetColor: { r: 200, g: 200, b: 200 },
            paletteColors: [],
            selectedColor: { r: 195, g: 195, b: 195 },
            distance: 15,
            score: 850,
          },
          {
            roundNumber: 3,
            targetColor: { r: 150, g: 150, b: 150 },
            paletteColors: [],
            selectedColor: { r: 145, g: 145, b: 145 },
            distance: 20,
            score: 800,
          },
          {
            roundNumber: 4,
            targetColor: { r: 100, g: 100, b: 100 },
            paletteColors: [],
            selectedColor: { r: 95, g: 95, b: 95 },
            distance: 25,
            score: 700,
          },
          {
            roundNumber: 5,
            targetColor: { r: 50, g: 50, b: 50 },
            paletteColors: [],
            selectedColor: { r: 45, g: 45, b: 45 },
            distance: 30,
            score: 500,
          },
        ],
        currentRoundIndex: 4,
        totalScore: 3750,
        isCompleted: true,
      };

      const text = service.generateShareText(mockGameState);

      expect(text).toBe('白Guessr\n3750/5000 (75%)\nR1: 900 | R2: 850 | R3: 800 | R4: 700 | R5: 500\n#白Guessr');
    });

    it('should handle perfect score', () => {
      const mockGameState: GameState = {
        rounds: [
          {
            roundNumber: 1,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 255, g: 255, b: 255 },
            distance: 0,
            score: 1000,
          },
          {
            roundNumber: 2,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 255, g: 255, b: 255 },
            distance: 0,
            score: 1000,
          },
          {
            roundNumber: 3,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 255, g: 255, b: 255 },
            distance: 0,
            score: 1000,
          },
          {
            roundNumber: 4,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 255, g: 255, b: 255 },
            distance: 0,
            score: 1000,
          },
          {
            roundNumber: 5,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 255, g: 255, b: 255 },
            distance: 0,
            score: 1000,
          },
        ],
        currentRoundIndex: 4,
        totalScore: 5000,
        isCompleted: true,
      };

      const text = service.generateShareText(mockGameState);

      expect(text).toBe('白Guessr\n5000/5000 (100%)\nR1: 1000 | R2: 1000 | R3: 1000 | R4: 1000 | R5: 1000\n#白Guessr');
    });
  });

  describe('shareResult', () => {
    it('should open Twitter intent URL in new window with text and URL', () => {
      const mockGameState: GameState = {
        rounds: [
          {
            roundNumber: 1,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 250, g: 250, b: 250 },
            distance: 10,
            score: 900,
          },
        ],
        currentRoundIndex: 0,
        totalScore: 900,
        isCompleted: true,
      };

      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      service.shareResult(mockGameState);

      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'width=550,height=420'
      );
    });
  });

  describe('shareToBluesky', () => {
    it('should open Bluesky intent URL in new window with text and URL', () => {
      const mockGameState: GameState = {
        rounds: [
          {
            roundNumber: 1,
            targetColor: { r: 255, g: 255, b: 255 },
            paletteColors: [],
            selectedColor: { r: 250, g: 250, b: 250 },
            distance: 10,
            score: 900,
          },
        ],
        currentRoundIndex: 0,
        totalScore: 900,
        isCompleted: true,
      };

      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      service.shareToBluesky(mockGameState);

      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining('https://bsky.app/intent/compose'),
        '_blank',
        'width=550,height=600'
      );
    });
  });
});
