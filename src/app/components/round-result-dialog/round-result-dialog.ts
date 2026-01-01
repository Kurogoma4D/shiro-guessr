import { Component, ChangeDetectionStrategy, input, output, computed, AfterViewInit, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RGBColor } from '../../models/game.model';

/**
 * M3 Dialog component for displaying round results
 * Shows target color, selected color, score, and distance in a modal dialog
 */
@Component({
  selector: 'app-round-result-dialog',
  imports: [CommonModule],
  templateUrl: './round-result-dialog.html',
  styleUrl: './round-result-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoundResultDialog implements AfterViewInit {
  /**
   * Reference to the dialog container element
   */
  private readonly dialogContainer = viewChild<ElementRef>('dialogContainer');
  /**
   * The target color that was shown to the user
   */
  targetColor = input.required<RGBColor>();

  /**
   * The color selected by the user
   */
  selectedColor = input.required<RGBColor>();

  /**
   * Score achieved in this round (0-1000)
   */
  score = input.required<number>();

  /**
   * Manhattan distance between target and selected color
   */
  distance = input.required<number>();

  /**
   * Whether this is the last round of the game
   */
  isLastRound = input<boolean>(false);

  /**
   * Event emitted when user clicks Next Round button
   */
  nextRound = output<void>();

  /**
   * Computed performance level based on distance
   */
  performanceLevel = computed(() => {
    const dist = this.distance();
    if (dist === 0) return 'perfect';
    if (dist <= 5) return 'excellent';
    if (dist <= 15) return 'good';
    return 'fair';
  });

  /**
   * Computed performance message based on level
   */
  performanceMessage = computed(() => {
    const level = this.performanceLevel();
    switch (level) {
      case 'perfect':
        return {
          title: 'Perfect Match!',
          emoji: '🎯',
          message: 'Incredible! You found the exact color!',
        };
      case 'excellent':
        return {
          title: 'Excellent!',
          emoji: '⭐',
          message: 'Amazing perception! Very close match!',
        };
      case 'good':
        return {
          title: 'Good Job!',
          emoji: '👍',
          message: 'Well done! Keep refining your eye!',
        };
      default:
        return {
          title: 'Nice Try!',
          emoji: '💪',
          message: 'Practice makes perfect!',
        };
    }
  });

  /**
   * Helper to convert RGB to CSS string
   */
  rgbToString(color: RGBColor): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
   * Handles Next Round button click
   */
  onNextRound(): void {
    this.nextRound.emit();
  }

  /**
   * Handles keyboard events for accessibility
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Tab') {
      this.handleTabKey(event);
    }
  }

  /**
   * Called after view initialization to set initial focus
   */
  ngAfterViewInit(): void {
    // Focus the dialog container when it's rendered
    const container = this.dialogContainer();
    if (container) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        container.nativeElement.focus();
      }, 0);
    }
  }

  /**
   * Handles Tab key to trap focus within dialog
   */
  private handleTabKey(event: KeyboardEvent): void {
    const container = this.dialogContainer();
    if (!container) return;

    const focusableElements = container.nativeElement.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // If shift+tab on first element, go to last
    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    }
    // If tab on last element, go to first
    else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }
}
