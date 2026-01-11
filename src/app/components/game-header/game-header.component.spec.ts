import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameHeaderComponent } from './game-header.component';
import { RGBColor } from '../../models/game.model';
import { beforeEach, describe, it, expect } from 'vitest';

describe('GameHeaderComponent', () => {
  let component: GameHeaderComponent;
  let fixture: ComponentFixture<GameHeaderComponent>;

  const mockColor: RGBColor = { r: 250, g: 250, b: 250 };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameHeaderComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('targetColor', mockColor);
    fixture.componentRef.setInput('currentRound', 3);
    fixture.componentRef.setInput('totalRounds', 5);
    fixture.componentRef.setInput('timeRemaining', 45);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getTargetColorStyle', () => {
    it('should return CSS color string', () => {
      const colorStyle = component.getTargetColorStyle();
      expect(colorStyle).toBe('rgb(250, 250, 250)');
    });
  });

  describe('isTimeLow', () => {
    it('should return false when time is above 10 seconds', () => {
      fixture.componentRef.setInput('timeRemaining', 45);
      expect(component.isTimeLow()).toBe(false);
    });

    it('should return true when time is 10 seconds', () => {
      fixture.componentRef.setInput('timeRemaining', 10);
      expect(component.isTimeLow()).toBe(true);
    });

    it('should return true when time is below 10 seconds', () => {
      fixture.componentRef.setInput('timeRemaining', 5);
      expect(component.isTimeLow()).toBe(true);
    });

    it('should return true when time is 0', () => {
      fixture.componentRef.setInput('timeRemaining', 0);
      expect(component.isTimeLow()).toBe(true);
    });
  });

  describe('formatTime', () => {
    it('should format time as MM:SS', () => {
      fixture.componentRef.setInput('timeRemaining', 45);
      expect(component.formatTime()).toBe('0:45');
    });

    it('should pad seconds with zero', () => {
      fixture.componentRef.setInput('timeRemaining', 5);
      expect(component.formatTime()).toBe('0:05');
    });

    it('should handle full minutes', () => {
      fixture.componentRef.setInput('timeRemaining', 60);
      expect(component.formatTime()).toBe('1:00');
    });

    it('should handle multiple minutes', () => {
      fixture.componentRef.setInput('timeRemaining', 125);
      expect(component.formatTime()).toBe('2:05');
    });

    it('should handle zero time', () => {
      fixture.componentRef.setInput('timeRemaining', 0);
      expect(component.formatTime()).toBe('0:00');
    });
  });

  describe('template rendering', () => {
    it('should display target color', () => {
      const colorDisplay = fixture.nativeElement.querySelector('.color-display');
      expect(colorDisplay).toBeTruthy();
      expect(colorDisplay.style.backgroundColor).toBe('rgb(250, 250, 250)');
    });

    it('should display RGB values', () => {
      const rgbValue = fixture.nativeElement.querySelector('.rgb-value');
      expect(rgbValue.textContent).toContain('250, 250, 250');
    });

    it('should display formatted timer', () => {
      const timerValue = fixture.nativeElement.querySelector('.timer-value');
      expect(timerValue.textContent.trim()).toBe('0:45');
    });

    it('should display round progress', () => {
      const roundValue = fixture.nativeElement.querySelector('.round-value');
      expect(roundValue.textContent.trim()).toBe('3 / 5');
    });

    it('should display current score', () => {
      fixture.componentRef.setInput('currentScore', 1500);
      fixture.detectChanges();

      const scoreValue = fixture.nativeElement.querySelector('.score-value');
      expect(scoreValue.textContent.trim()).toBe('1500');
    });

    it('should apply time-low class when time is low', () => {
      fixture.componentRef.setInput('timeRemaining', 8);
      fixture.detectChanges();

      const timer = fixture.nativeElement.querySelector('.timer');
      expect(timer.classList.contains('time-low')).toBe(true);
    });

    it('should not apply time-low class when time is sufficient', () => {
      fixture.componentRef.setInput('timeRemaining', 45);
      fixture.detectChanges();

      const timer = fixture.nativeElement.querySelector('.timer');
      expect(timer.classList.contains('time-low')).toBe(false);
    });
  });
});
