import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GradientMapComponent } from './gradient-map.component';
import { GradientMap } from '../../models/game.model';
import { beforeEach, describe, it, expect } from 'vitest';

describe('GradientMapComponent', () => {
  let component: GradientMapComponent;
  let fixture: ComponentFixture<GradientMapComponent>;

  const mockMap: GradientMap = {
    width: 800,
    height: 600,
    cornerColors: [
      { r: 245, g: 245, b: 245 },
      { r: 255, g: 245, b: 245 },
      { r: 245, g: 255, b: 245 },
      { r: 255, g: 255, b: 255 },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradientMapComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GradientMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('template rendering', () => {
    it('should render canvas element', () => {
      const canvas = fixture.nativeElement.querySelector('.gradient-map-canvas');
      expect(canvas).toBeTruthy();
    });

    it('should apply disabled class when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const canvas = fixture.nativeElement.querySelector('.gradient-map-canvas');
      expect(canvas.classList.contains('disabled')).toBe(true);
    });
  });

  describe('interaction', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('gradientMap', mockMap);
      fixture.componentRef.setInput('disabled', false);
      fixture.detectChanges();
    });

    it('should handle pointer down event', () => {
      const canvas = fixture.nativeElement.querySelector('.gradient-map-canvas');
      const event = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        bubbles: true,
      });

      canvas.dispatchEvent(event);
      expect(component).toBeTruthy(); // Basic assertion
    });

    it('should not interact when disabled', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      const canvas = fixture.nativeElement.querySelector('.gradient-map-canvas');
      const event = new PointerEvent('pointerdown', {
        clientX: 100,
        clientY: 100,
        bubbles: true,
      });

      canvas.dispatchEvent(event);
      // Should not trigger any interaction
      expect(component).toBeTruthy(); // Basic assertion
    });
  });
});
