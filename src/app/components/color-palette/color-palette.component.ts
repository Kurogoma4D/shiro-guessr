import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteColor, RGBColor } from '../../models/game.model';
import { ColorService } from '../../services/color.service';
import { inject } from '@angular/core';

/**
 * Component for displaying a 5x5 grid of color palette options
 * Allows users to select a color from the palette
 */
@Component({
  selector: 'app-color-palette',
  imports: [CommonModule],
  templateUrl: './color-palette.component.html',
  styleUrl: './color-palette.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPaletteComponent {
  /**
   * Array of palette colors to display (25 colors for 5x5 grid)
   */
  colors = input<PaletteColor[]>([]);

  /**
   * Whether the palette is disabled (e.g., after selection)
   */
  disabled = input<boolean>(false);

  /**
   * Event emitted when a color is selected
   */
  colorSelected = output<RGBColor>();

  /**
   * ColorService for converting RGB to CSS string
   */
  private readonly colorService = inject(ColorService);

  /**
   * Handles color selection
   * @param color The selected color
   */
  onColorClick(color: RGBColor): void {
    if (!this.disabled()) {
      this.colorSelected.emit(color);
    }
  }

  /**
   * Handles keyboard selection (Enter key)
   * @param event Keyboard event
   * @param color The color associated with the key press
   */
  onColorKeydown(event: KeyboardEvent, color: RGBColor): void {
    if (event.key === 'Enter' && !this.disabled()) {
      this.colorSelected.emit(color);
    }
  }

  /**
   * Converts RGB color to CSS string for styling
   * @param color The RGB color
   * @returns CSS color string
   */
  getColorString(color: RGBColor): string {
    return this.colorService.rgbToString(color);
  }

  /**
   * Gets aria-label for a color button
   * @param color The RGB color
   * @param index The index in the palette
   * @returns Aria label string
   */
  getAriaLabel(color: RGBColor, index: number): string {
    return `Color ${index + 1}: RGB(${color.r}, ${color.g}, ${color.b})`;
  }
}
