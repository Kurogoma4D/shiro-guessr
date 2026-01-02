import { TestBed } from '@angular/core/testing';
import { ShareService } from './share.service';
import { GameState } from '../models/game.model';

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
    it('should generate correct share text with score and percentage', () => {
      const mockGameState: GameState = {
        rounds: [],
        currentRoundIndex: 4,
        totalScore: 3750,
        isCompleted: true,
      };

      const text = service.generateShareText(mockGameState);

      expect(text).toBe('3750/5000 (75%) #白Guessr');
    });

    it('should handle perfect score', () => {
      const mockGameState: GameState = {
        rounds: [],
        currentRoundIndex: 4,
        totalScore: 5000,
        isCompleted: true,
      };

      const text = service.generateShareText(mockGameState);

      expect(text).toBe('5000/5000 (100%) #白Guessr');
    });
  });

  describe('generateResultImage', () => {
    it('should generate a blob from canvas', async () => {
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

      const blob = await service.generateResultImage(mockGameState);

      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('image/png');
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('shareToTwitter', () => {
    it('should open Twitter intent URL in new window', () => {
      const mockGameState: GameState = {
        rounds: [],
        currentRoundIndex: 4,
        totalScore: 4000,
        isCompleted: true,
      };

      spyOn(window, 'open');

      service.shareToTwitter(mockGameState);

      expect(window.open).toHaveBeenCalledWith(
        jasmine.stringContaining('https://twitter.com/intent/tweet'),
        '_blank',
        'width=550,height=420'
      );
    });
  });

  describe('downloadResultImage', () => {
    it('should trigger download of result image', async () => {
      const mockGameState: GameState = {
        rounds: [],
        currentRoundIndex: 4,
        totalScore: 2500,
        isCompleted: true,
      };

      const mockLink = document.createElement('a');
      spyOn(document, 'createElement').and.returnValue(mockLink);
      spyOn(mockLink, 'click');
      spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-url');
      spyOn(URL, 'revokeObjectURL');

      await service.downloadResultImage(mockGameState);

      expect(mockLink.download).toContain('shiro-guessr-result-2500.png');
      expect(mockLink.click).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
    });
  });
});
