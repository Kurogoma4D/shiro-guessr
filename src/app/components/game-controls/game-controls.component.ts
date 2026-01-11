import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Controls component for the map game with Guess button
 */
@Component({
  selector: 'app-game-controls',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-controls.component.html',
  styleUrl: './game-controls.component.css',
})
export class GameControlsComponent {
  /**
   * Whether a pin has been placed
   */
  readonly hasPin = input<boolean>(false);

  /**
   * Whether the controls are disabled
   */
  readonly disabled = input<boolean>(false);

  /**
   * Emits when the guess button is clicked
   */
  readonly guess = output<void>();

  /**
   * Handles guess button click
   */
  onGuessClick(): void {
    if (!this.isButtonDisabled()) {
      this.guess.emit();
    }
  }

  /**
   * Checks if the guess button should be disabled
   */
  isButtonDisabled(): boolean {
    return !this.hasPin() || this.disabled();
  }
}
