import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColorPaletteComponent } from './color-palette.component';
import { PaletteColor, RGBColor } from '../../models/game.model';
import { ColorService } from '../../services/color.service';

describe('ColorPaletteComponent', () => {
  let component: ColorPaletteComponent;
  let fixture: ComponentFixture<ColorPaletteComponent>;

  const mockColors: PaletteColor[] = Array.from({ length: 25 }, (_, i) => ({
    color: { r: 245 + i, g: 250, b: 255 },
  }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorPaletteComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ColorPaletteComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display 25 color cells', () => {
    fixture.componentRef.setInput('colors', mockColors);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.color-cell');
    expect(cells.length).toBe(25);
  });

  it('should emit colorSelected event when a color is clicked', () => {
    const selectedColor: RGBColor = { r: 245, g: 250, b: 255 };
    fixture.componentRef.setInput('colors', mockColors);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();

    let emittedColor: RGBColor | undefined;
    component.colorSelected.subscribe((color) => {
      emittedColor = color;
    });

    component.onColorClick(selectedColor);
    expect(emittedColor).toEqual(selectedColor);
  });

  it('should not emit event when disabled', () => {
    const selectedColor: RGBColor = { r: 245, g: 250, b: 255 };
    fixture.componentRef.setInput('colors', mockColors);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let emittedColor: RGBColor | undefined;
    component.colorSelected.subscribe((color) => {
      emittedColor = color;
    });

    component.onColorClick(selectedColor);
    expect(emittedColor).toBeUndefined();
  });

  it('should emit event on Enter key press', () => {
    const selectedColor: RGBColor = { r: 245, g: 250, b: 255 };
    fixture.componentRef.setInput('colors', mockColors);
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();

    let emittedColor: RGBColor | undefined;
    component.colorSelected.subscribe((color) => {
      emittedColor = color;
    });

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    component.onColorKeydown(enterEvent, selectedColor);
    expect(emittedColor).toEqual(selectedColor);
  });

  it('should not emit event on other key press', () => {
    const selectedColor: RGBColor = { r: 245, g: 250, b: 255 };
    fixture.componentRef.setInput('disabled', false);
    fixture.detectChanges();

    let emittedColor: RGBColor | undefined;
    component.colorSelected.subscribe((color) => {
      emittedColor = color;
    });

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    component.onColorKeydown(spaceEvent, selectedColor);
    expect(emittedColor).toBeUndefined();
  });

  it('should apply disabled state to buttons', () => {
    fixture.componentRef.setInput('colors', mockColors);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('.color-cell');
    cells.forEach((cell: HTMLButtonElement) => {
      expect(cell.disabled).toBe(true);
    });
  });

  it('should have proper ARIA attributes', () => {
    fixture.componentRef.setInput('colors', mockColors);
    fixture.detectChanges();

    const palette = fixture.nativeElement.querySelector('.color-palette');
    expect(palette.getAttribute('role')).toBe('grid');
    expect(palette.getAttribute('aria-label')).toBe('Color palette');

    const firstCell = fixture.nativeElement.querySelector('.color-cell');
    expect(firstCell.getAttribute('role')).toBe('gridcell');
    expect(firstCell.getAttribute('aria-label')).toContain('Color 1');
  });
});
