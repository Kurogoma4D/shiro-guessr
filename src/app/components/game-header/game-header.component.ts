import { Component, input } from '@angular/core';
import { RGBColor } from '../../models/game.model';
import { ColorService } from '../../services/color.service';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Header component for the map game showing target color, timer, and score
 */
@Component({
  selector: 'app-game-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-header.component.html',
  styleUrl: './game-header.component.css',
})
export class GameHeaderComponent {
  private readonly colorService = inject(ColorService);

  /**
   * Target color for the current round
   */
  readonly targetColor = input.required<RGBColor>();

  /**
   * Current round number (1-based)
   */
  readonly currentRound = input.required<number>();

  /**
   * Total number of rounds
   */
  readonly totalRounds = input.required<number>();

  /**
   * Time remaining in seconds
   */
  readonly timeRemaining = input.required<number>();

  /**
   * Current score
   */
  readonly currentScore = input<number>(0);

  /**
   * Gets CSS color string for the target color
   */
  getTargetColorStyle(): string {
    return this.colorService.rgbToString(this.targetColor());
  }

  /**
   * Checks if time is running low (less than or equal to 10 seconds)
   */
  isTimeLow(): boolean {
    return this.timeRemaining() <= 10;
  }

  /**
   * Formats time remaining as MM:SS
   */
  formatTime(): string {
    const time = this.timeRemaining();
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
