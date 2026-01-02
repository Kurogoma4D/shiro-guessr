import { Injectable } from '@angular/core';
import { GameState } from '../models/game.model';

/**
 * Service for sharing game results to social media
 */
@Injectable({
  providedIn: 'root',
})
export class ShareService {
  /**
   * Generates share text for social media with detailed round breakdown
   * @param gameState The completed game state
   * @returns The share text with score, accuracy, and round details
   */
  generateShareText(gameState: GameState): string {
    const scorePercentage = Math.round((gameState.totalScore / 5000) * 100);
    const roundBreakdown = gameState.rounds
      .map((round, index) => `R${index + 1}: ${round.score ?? 0}`)
      .join(' | ');

    return `${gameState.totalScore}/5000 (${scorePercentage}%)\n${roundBreakdown}\n#白Guessr`;
  }

  /**
   * Shares the game result to X (Twitter)
   * Opens a new window with Twitter's web intent URL
   * @param gameState The completed game state
   */
  shareResult(gameState: GameState): void {
    const text = this.generateShareText(gameState);
    const url = window.location.href;
    const shareText = `${text}\n\n${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  /**
   * Shares the game result to Bluesky
   * Opens a new window with Bluesky's compose intent URL
   * @param gameState The completed game state
   */
  shareToBluesky(gameState: GameState): void {
    const text = this.generateShareText(gameState);
    const url = window.location.href;
    const shareText = `${text}\n\n${url}`;
    const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(shareText)}`;
    window.open(blueskyUrl, '_blank', 'width=550,height=600');
  }

  /**
   * Shares the game result using Web Share API
   * Falls back to copying to clipboard if Web Share API is not available
   * @param gameState The completed game state
   */
  async shareToOther(gameState: GameState): Promise<void> {
    const text = this.generateShareText(gameState);
    const url = window.location.href;
    const shareText = `${text}\n\n${url}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '白Guessr - Color Guessing Game',
          text: shareText,
          url: url,
        });
      } catch (error) {
        // User cancelled the share or share failed
        console.error('Share failed:', error);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('Result copied to clipboard!');
      } catch (error) {
        console.error('Copy to clipboard failed:', error);
        alert('Sharing is not supported on this device');
      }
    }
  }
}
