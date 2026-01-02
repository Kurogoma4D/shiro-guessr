import { Component, ChangeDetectionStrategy, input, output, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameState } from '../../models/game.model';
import { RoundDetailComponent } from '../round-detail/round-detail.component';
import { ShareService } from '../../services/share.service';

/**
 * Component for displaying final game results
 * Shows total score, performance evaluation, and detailed breakdown of each round
 */
@Component({
  selector: 'app-result',
  imports: [CommonModule, RoundDetailComponent],
  templateUrl: './result.component.html',
  styleUrl: './result.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultComponent {
  /**
   * The completed game state
   */
  gameState = input.required<GameState>();

  /**
   * Event emitted when user wants to replay the game
   */
  replay = output<void>();

  /**
   * Injected ShareService for sharing game results
   */
  private readonly shareService = inject(ShareService);

  /**
   * Signal to track if sharing is in progress
   */
  readonly isSharing = signal(false);

  /**
   * Maximum possible score (1000 points per round × 5 rounds)
   */
  private readonly MAX_SCORE = 5000;

  /**
   * Thresholds for performance evaluation
   */
  private readonly EXCELLENT_THRESHOLD = 4500; // 90% of max score
  private readonly GOOD_THRESHOLD = 3500; // 70% of max score

  /**
   * Computed signal for performance evaluation message
   */
  performanceMessage = computed(() => {
    const score = this.gameState().totalScore;

    if (score >= this.EXCELLENT_THRESHOLD) {
      return {
        title: 'Excellent!',
        message: 'You have an amazing eye for subtle color differences!',
        emoji: '🎉',
      };
    } else if (score >= this.GOOD_THRESHOLD) {
      return {
        title: 'Good Job!',
        message: 'Your color perception is quite good. Keep practicing!',
        emoji: '👍',
      };
    } else {
      return {
        title: 'Try Again!',
        message: 'Practice makes perfect. Challenge yourself again!',
        emoji: '💪',
      };
    }
  });

  /**
   * Computed signal for score percentage
   */
  scorePercentage = computed(() => {
    return Math.round((this.gameState().totalScore / this.MAX_SCORE) * 100);
  });

  /**
   * Handles replay button click
   */
  onReplayClick(): void {
    this.replay.emit();
  }

  /**
   * Handles share to X (Twitter) button click
   */
  async onShareToX(): Promise<void> {
    this.isSharing.set(true);
    try {
      await this.shareService.shareResult(this.gameState());
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      this.isSharing.set(false);
    }
  }

  /**
   * Handles share to Bluesky button click
   * Attempts to use Web Share API, falls back to Bluesky compose intent
   */
  async onShareToBluesky(): Promise<void> {
    this.isSharing.set(true);
    try {
      await this.shareService.shareToBluesky(this.gameState());
    } catch (error) {
      console.error('Failed to share to Bluesky:', error);
    } finally {
      this.isSharing.set(false);
    }
  }
}
