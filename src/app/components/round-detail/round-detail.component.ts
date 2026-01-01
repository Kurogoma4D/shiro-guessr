import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameRound } from '../../models/game.model';
import { ColorService } from '../../services/color.service';
import { inject } from '@angular/core';

/**
 * Component for displaying detailed information about a completed game round
 * Shows round number, selected color, target color, distance, and score
 */
@Component({
  selector: 'app-round-detail',
  imports: [CommonModule],
  templateUrl: './round-detail.component.html',
  styleUrl: './round-detail.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundDetailComponent {
  /**
   * The game round to display details for
   */
  round = input.required<GameRound>();

  /**
   * ColorService for converting RGB to CSS string
   */
  private readonly colorService = inject(ColorService);

  /**
   * Converts RGB color to CSS string for styling
   * @param r Red value
   * @param g Green value
   * @param b Blue value
   * @returns CSS color string
   */
  getColorString(r: number, g: number, b: number): string {
    return this.colorService.rgbToString({ r, g, b });
  }
}
