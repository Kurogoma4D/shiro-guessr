import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameControlsComponent } from './game-controls.component';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('GameControlsComponent', () => {
  let component: GameControlsComponent;
  let fixture: ComponentFixture<GameControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameControlsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GameControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isButtonDisabled', () => {
    it('should return true when no pin is placed', () => {
      fixture.componentRef.setInput('hasPin', false);
      expect(component.isButtonDisabled()).toBe(true);
    });

    it('should return false when pin is placed and not disabled', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.componentRef.setInput('disabled', false);
      expect(component.isButtonDisabled()).toBe(false);
    });

    it('should return true when disabled', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.componentRef.setInput('disabled', true);
      expect(component.isButtonDisabled()).toBe(true);
    });

    it('should return true when no pin and disabled', () => {
      fixture.componentRef.setInput('hasPin', false);
      fixture.componentRef.setInput('disabled', true);
      expect(component.isButtonDisabled()).toBe(true);
    });
  });

  describe('onGuessClick', () => {
    it('should emit guess event when button is enabled', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.componentRef.setInput('disabled', false);

      const emitSpy = vi.fn();
      component.guess.subscribe(emitSpy);

      component.onGuessClick();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit guess event when button is disabled', () => {
      fixture.componentRef.setInput('hasPin', false);
      fixture.componentRef.setInput('disabled', false);

      const emitSpy = vi.fn();
      component.guess.subscribe(emitSpy);

      component.onGuessClick();

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should not emit guess event when disabled input is true', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.componentRef.setInput('disabled', true);

      const emitSpy = vi.fn();
      component.guess.subscribe(emitSpy);

      component.onGuessClick();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('template rendering', () => {
    it('should render guess button', () => {
      const button = fixture.nativeElement.querySelector('.guess-button');
      expect(button).toBeTruthy();
      expect(button.textContent).toContain('Guess');
    });

    it('should disable button when no pin is placed', () => {
      fixture.componentRef.setInput('hasPin', false);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.guess-button');
      expect(button.disabled).toBe(true);
      expect(button.classList.contains('disabled')).toBe(true);
    });

    it('should enable button when pin is placed', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.guess-button');
      expect(button.disabled).toBe(false);
      expect(button.classList.contains('disabled')).toBe(false);
    });

    it('should disable button when disabled input is true', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.guess-button');
      expect(button.disabled).toBe(true);
    });

    it('should show hint text when no pin is placed', () => {
      fixture.componentRef.setInput('hasPin', false);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.guess-button');
      const ariaLabel = button.getAttribute('aria-label');
      expect(ariaLabel).toContain('Place a pin');
    });

    it('should not show hint text when pin is placed', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.guess-button');
      const ariaLabel = button.getAttribute('aria-label');
      expect(ariaLabel).toContain('Submit your guess');
    });

    it('should emit guess event when button is clicked', () => {
      fixture.componentRef.setInput('hasPin', true);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.guess.subscribe(emitSpy);

      const button = fixture.nativeElement.querySelector('.guess-button');
      button.click();

      expect(emitSpy).toHaveBeenCalledTimes(1);
    });

    it('should not emit guess event when disabled button is clicked', () => {
      fixture.componentRef.setInput('hasPin', false);
      fixture.detectChanges();

      const emitSpy = vi.fn();
      component.guess.subscribe(emitSpy);

      const button = fixture.nativeElement.querySelector('.guess-button');
      button.click();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
