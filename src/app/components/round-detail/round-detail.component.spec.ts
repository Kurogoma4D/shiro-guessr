import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RoundDetailComponent } from './round-detail.component';
import { GameRound } from '../../models/game.model';

describe('RoundDetailComponent', () => {
  let component: RoundDetailComponent;
  let fixture: ComponentFixture<RoundDetailComponent>;

  const mockRound: GameRound = {
    roundNumber: 1,
    targetColor: { r: 250, g: 250, b: 250 },
    selectedColor: { r: 245, g: 248, b: 252 },
    distance: 9,
    score: 700,
    paletteColors: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoundDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoundDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('round', mockRound);
    expect(component).toBeTruthy();
  });

  it('should display round number', () => {
    fixture.componentRef.setInput('round', mockRound);
    fixture.detectChanges();

    const roundNumber = fixture.nativeElement.querySelector('.round-number');
    expect(roundNumber.textContent).toContain('Round 1');
  });

  it('should display score', () => {
    fixture.componentRef.setInput('round', mockRound);
    fixture.detectChanges();

    const scoreBadge = fixture.nativeElement.querySelector('.score-badge');
    expect(scoreBadge.textContent.trim()).toBe('700 pts');
  });

  it('should display selected color RGB values', () => {
    fixture.componentRef.setInput('round', mockRound);
    fixture.detectChanges();

    const rgbTexts = fixture.nativeElement.querySelectorAll('.color-rgb');
    const selectedColorText = rgbTexts[0].textContent.trim();
    expect(selectedColorText).toContain('245');
    expect(selectedColorText).toContain('248');
    expect(selectedColorText).toContain('252');
  });

  it('should display target color RGB values', () => {
    fixture.componentRef.setInput('round', mockRound);
    fixture.detectChanges();

    const rgbTexts = fixture.nativeElement.querySelectorAll('.color-rgb');
    const targetColorText = rgbTexts[1].textContent.trim();
    expect(targetColorText).toContain('250');
    expect(targetColorText).toContain('250');
    expect(targetColorText).toContain('250');
  });

  it('should display distance', () => {
    fixture.componentRef.setInput('round', mockRound);
    fixture.detectChanges();

    const distanceValue = fixture.nativeElement.querySelector('.distance-value');
    expect(distanceValue.textContent.trim()).toBe('9');
  });

  it('should apply perfect class for zero distance', () => {
    const perfectRound: GameRound = {
      ...mockRound,
      distance: 0,
      score: 1000,
    };
    fixture.componentRef.setInput('round', perfectRound);
    fixture.detectChanges();

    const scoreBadge = fixture.nativeElement.querySelector('.score-badge');
    expect(scoreBadge.classList.contains('perfect')).toBe(true);
  });

  it('should apply excellent class for low distance', () => {
    const excellentRound: GameRound = {
      ...mockRound,
      distance: 3,
      score: 900,
    };
    fixture.componentRef.setInput('round', excellentRound);
    fixture.detectChanges();

    const distanceValue = fixture.nativeElement.querySelector('.distance-value');
    expect(distanceValue.classList.contains('excellent')).toBe(true);
  });

  it('should apply good class for medium distance', () => {
    const goodRound: GameRound = {
      ...mockRound,
      distance: 10,
      score: 667,
    };
    fixture.componentRef.setInput('round', goodRound);
    fixture.detectChanges();

    const distanceValue = fixture.nativeElement.querySelector('.distance-value');
    expect(distanceValue.classList.contains('good')).toBe(true);
  });

  it('should display color samples', () => {
    fixture.componentRef.setInput('round', mockRound);
    fixture.detectChanges();

    const colorSamples = fixture.nativeElement.querySelectorAll('.color-sample');
    expect(colorSamples.length).toBe(2);
  });
});
