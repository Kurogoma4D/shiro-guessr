import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapGameComponent } from './map-game.component';
import { MapGameService } from '../../services/map-game.service';
import { ActivatedRoute } from '@angular/router';
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

describe('MapGameComponent', () => {
  let component: MapGameComponent;
  let fixture: ComponentFixture<MapGameComponent>;
  let mapGameService: MapGameService;

  beforeEach(async () => {
    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [MapGameComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({}),
            snapshot: { params: {} },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapGameComponent);
    component = fixture.componentInstance;
    mapGameService = TestBed.inject(MapGameService);

    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start a new game on init', () => {
    const startGameSpy = vi.spyOn(mapGameService, 'startNewGame');
    component.ngOnInit();
    expect(startGameSpy).toHaveBeenCalled();
  });

  describe('onPinPlaced', () => {
    it('should call mapGameService.placePin', () => {
      const placePinSpy = vi.spyOn(mapGameService, 'placePin');
      const coordinate = { x: 0.5, y: 0.5 };

      component.onPinPlaced(coordinate);

      expect(placePinSpy).toHaveBeenCalledWith(coordinate);
    });
  });

  describe('onGuess', () => {
    it('should call mapGameService.submitGuess', () => {
      const submitGuessSpy = vi.spyOn(mapGameService, 'submitGuess');

      component.onGuess();

      expect(submitGuessSpy).toHaveBeenCalled();
    });
  });

  describe('onReplay', () => {
    it('should call mapGameService.replayGame', () => {
      const replaySpy = vi.spyOn(mapGameService, 'replayGame');

      component.onReplay();

      expect(replaySpy).toHaveBeenCalled();
    });
  });

  describe('onNextRound', () => {
    it('should call mapGameService.nextRound', () => {
      const nextRoundSpy = vi.spyOn(mapGameService, 'nextRound');

      component.onNextRound();

      expect(nextRoundSpy).toHaveBeenCalled();
    });
  });

  describe('computed properties', () => {
    it('should compute totalRounds as 5', () => {
      expect(component.totalRounds()).toBe(5);
    });

    it('should compute isProcessing correctly', () => {
      // Initially not processing (no selection)
      expect(component.isProcessing()).toBe(false);

      // After making a guess, should be processing
      mapGameService.placePin({ x: 0.5, y: 0.5 });
      mapGameService.submitGuess();

      expect(component.isProcessing()).toBe(true);
    });
  });
});
