import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Component for displaying game score and progress information
 * Shows current round, total rounds, current score, and cumulative score
 */
@Component({
  selector: 'app-score-board',
  imports: [CommonModule],
  templateUrl: './score-board.component.html',
  styleUrl: './score-board.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScoreBoardComponent {
  /**
   * Current round number (1-based)
   */
  currentRound = input<number>(1);

  /**
   * Total number of rounds in the game
   */
  totalRounds = input<number>(5);

  /**
   * Score for the current round
   */
  currentScore = input<number>(0);

  /**
   * Total cumulative score across all rounds
   */
  totalScore = input<number>(0);

  /**
   * Computed signal for progress percentage
   */
  progressPercentage = computed(() => {
    const total = this.totalRounds();
    if (total === 0) return 0;
    return (this.currentRound() / total) * 100;
  });

  /**
   * Computed signal to check if current round has been completed
   */
  isRoundCompleted = computed(() => {
    return this.currentScore() > 0;
  });
}
