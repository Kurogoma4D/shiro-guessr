import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { GameService } from '../../services/game.service';
import { ColorService } from '../../services/color.service';
import { ScoreService } from '../../services/score.service';
import { RGBColor } from '../../models/game.model';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;
  let gameService: GameService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameComponent],
      providers: [GameService, ColorService, ScoreService],
    }).compileComponents();

    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;
    gameService = TestBed.inject(GameService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start a new game on initialization', () => {
    fixture.detectChanges();
    const state = component.gameState();
    expect(state.rounds.length).toBe(1);
    expect(state.currentRoundIndex).toBe(0);
    expect(state.isCompleted).toBe(false);
  });

  it('should display game screen when game is not completed', () => {
    fixture.detectChanges();
    const gameScreen = fixture.nativeElement.querySelector('.game-screen');
    const resultComponent = fixture.nativeElement.querySelector('app-result');
    expect(gameScreen).toBeTruthy();
    expect(resultComponent).toBeFalsy();
  });

  it('should display result screen when game is completed', () => {
    // Complete all 5 rounds
    for (let i = 0; i < 5; i++) {
      const round = component.currentRound();
      if (round) {
        gameService.selectColor(round.targetColor);
        if (i < 4) {
          gameService.nextRound();
        }
      }
    }
    gameService.nextRound(); // Complete the game
    fixture.detectChanges();

    const gameScreen = fixture.nativeElement.querySelector('.game-screen');
    const resultComponent = fixture.nativeElement.querySelector('app-result');
    expect(gameScreen).toBeFalsy();
    expect(resultComponent).toBeTruthy();
  });

  it('should handle color selection', () => {
    fixture.detectChanges();
    const selectedColor: RGBColor = { r: 250, g: 250, b: 250 };

    component.onColorSelected(selectedColor);
    fixture.detectChanges();

    const round = component.currentRound();
    expect(round?.selectedColor).toEqual(selectedColor);
  });

  it('should show next button after color selection', () => {
    fixture.detectChanges();
    const round = component.currentRound();

    // Select a color
    if (round) {
      component.onColorSelected(round.targetColor);
      fixture.detectChanges();

      expect(component.showNextButton()).toBe(true);
      const nextButton = fixture.nativeElement.querySelector('.next-button');
      expect(nextButton).toBeTruthy();
    }
  });

  it('should advance to next round when next button is clicked', () => {
    fixture.detectChanges();
    const round = component.currentRound();

    if (round) {
      component.onColorSelected(round.targetColor);
      fixture.detectChanges();

      const initialRoundIndex = component.gameState().currentRoundIndex;
      component.onNextRound();
      fixture.detectChanges();

      expect(component.gameState().currentRoundIndex).toBe(initialRoundIndex + 1);
    }
  });

  it('should disable palette after color selection', () => {
    fixture.detectChanges();
    const round = component.currentRound();

    if (round) {
      component.onColorSelected(round.targetColor);
      fixture.detectChanges();

      expect(component.isRoundCompleted()).toBe(true);
    }
  });

  it('should display score board with correct values', () => {
    fixture.detectChanges();
    const scoreBoard = fixture.nativeElement.querySelector('app-score-board');
    expect(scoreBoard).toBeTruthy();
  });

  it('should display color palette', () => {
    fixture.detectChanges();
    const palette = fixture.nativeElement.querySelector('app-color-palette');
    expect(palette).toBeTruthy();
  });

  it('should display target color', () => {
    fixture.detectChanges();
    const targetDisplay = fixture.nativeElement.querySelector('.target-color-display');
    expect(targetDisplay).toBeTruthy();
  });

  it('should restart game on replay', () => {
    // Complete the game
    for (let i = 0; i < 5; i++) {
      const round = component.currentRound();
      if (round) {
        gameService.selectColor(round.targetColor);
        if (i < 4) {
          gameService.nextRound();
        }
      }
    }
    gameService.nextRound();
    fixture.detectChanges();

    expect(component.gameState().isCompleted).toBe(true);

    // Replay
    component.onReplay();
    fixture.detectChanges();

    expect(component.gameState().isCompleted).toBe(false);
    expect(component.gameState().currentRoundIndex).toBe(0);
  });
});
