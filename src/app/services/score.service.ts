import { Injectable } from '@angular/core';
import { GameRound } from '../models/game.model';

/**
 * Service for calculating game scores
 */
@Injectable({
  providedIn: 'root',
})
export class ScoreService {
  /**
   * Maximum possible score for a single round
   */
  private readonly MAX_ROUND_SCORE = 1000;

  /**
   * Maximum possible Manhattan distance for white colors (245-255 range)
   * Distance = |255-245| + |255-245| + |255-245| = 30
   */
  private readonly MAX_DISTANCE = 30;

  /**
   * Calculates the score for a single round based on Manhattan distance
   * Formula: 1000 × (1 - distance / 30)
   * - Distance 0 (perfect match) = 1000 points
   * - Distance 30 (maximum) = 0 points
   * - Score decreases linearly with distance
   *
   * @param distance Manhattan distance between selected and target color
   * @returns Score for the round (0-1000)
   */
  calculateRoundScore(distance: number): number {
    // Clamp distance to valid range [0, 30]
    const clampedDistance = Math.max(0, Math.min(distance, this.MAX_DISTANCE));

    // Calculate score: 1000 × (1 - distance / 30)
    const score = this.MAX_ROUND_SCORE * (1 - clampedDistance / this.MAX_DISTANCE);

    // Round to nearest integer for cleaner scores
    return Math.round(score);
  }

  /**
   * Calculates the total score across all completed rounds
   * @param rounds Array of game rounds
   * @returns Total score (sum of all round scores)
   */
  calculateTotalScore(rounds: GameRound[]): number {
    return rounds.reduce((total, round) => {
      // Only count rounds that have been completed (score is not null)
      return total + (round.score ?? 0);
    }, 0);
  }
}
