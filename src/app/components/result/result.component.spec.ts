import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultComponent } from './result.component';
import { GameState, GameRound } from '../../models/game.model';
import { RoundDetailComponent } from '../round-detail/round-detail.component';

describe('ResultComponent', () => {
  let component: ResultComponent;
  let fixture: ComponentFixture<ResultComponent>;

  const mockRounds: GameRound[] = [
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
      targetColor: { r: 248, g: 252, b: 255 },
      selectedColor: { r: 245, g: 250, b: 253 },
      distance: 5,
      score: 833,
      paletteColors: [],
    },
    {
      roundNumber: 3,
      targetColor: { r: 255, g: 255, b: 255 },
      selectedColor: { r: 245, g: 245, b: 245 },
      distance: 30,
      score: 0,
      paletteColors: [],
    },
    {
      roundNumber: 4,
      targetColor: { r: 250, g: 248, b: 252 },
      selectedColor: { r: 249, g: 249, b: 250 },
      distance: 4,
      score: 867,
      paletteColors: [],
    },
    {
      roundNumber: 5,
      targetColor: { r: 246, g: 254, b: 250 },
      selectedColor: { r: 245, g: 252, b: 248 },
      distance: 5,
      score: 833,
      paletteColors: [],
    },
  ];

  const createMockGameState = (totalScore: number): GameState => ({
    rounds: mockRounds,
    currentRoundIndex: 4,
    isCompleted: true,
    totalScore,
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResultComponent, RoundDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('gameState', createMockGameState(3533));
    expect(component).toBeTruthy();
  });

  it('should display total score', () => {
    const gameState = createMockGameState(3533);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const finalScore = fixture.nativeElement.querySelector('.final-score');
    expect(finalScore.textContent.trim()).toBe('3533');
  });

  it('should calculate score percentage correctly', () => {
    const gameState = createMockGameState(4000);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    expect(component.scorePercentage()).toBe(80);
  });

  it('should show "Excellent!" for high scores', () => {
    const gameState = createMockGameState(4500);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const performance = component.performanceMessage();
    expect(performance.title).toBe('Excellent!');
    expect(performance.emoji).toBe('🎉');
  });

  it('should show "Good Job!" for medium scores', () => {
    const gameState = createMockGameState(4000);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const performance = component.performanceMessage();
    expect(performance.title).toBe('Good Job!');
    expect(performance.emoji).toBe('👍');
  });

  it('should show "Try Again!" for low scores', () => {
    const gameState = createMockGameState(2000);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const performance = component.performanceMessage();
    expect(performance.title).toBe('Try Again!');
    expect(performance.emoji).toBe('💪');
  });

  it('should display all 5 round details', () => {
    const gameState = createMockGameState(3533);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const roundDetails = fixture.nativeElement.querySelectorAll('app-round-detail');
    expect(roundDetails.length).toBe(5);
  });

  it('should emit replay event when replay button is clicked', () => {
    const gameState = createMockGameState(3533);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    let replayEmitted = false;
    component.replay.subscribe(() => {
      replayEmitted = true;
    });

    const replayButton = fixture.nativeElement.querySelector('.replay-button');
    replayButton.click();

    expect(replayEmitted).toBe(true);
  });

  it('should display performance message', () => {
    const gameState = createMockGameState(4500);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const message = fixture.nativeElement.querySelector('.performance-message');
    expect(message.textContent).toContain('amazing eye');
  });

  it('should display score subtitle with percentage', () => {
    const gameState = createMockGameState(2500);
    fixture.componentRef.setInput('gameState', gameState);
    fixture.detectChanges();

    const subtitle = fixture.nativeElement.querySelector('.score-subtitle');
    expect(subtitle.textContent).toContain('50%');
    expect(subtitle.textContent).toContain('5000');
  });
});
