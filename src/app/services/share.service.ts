import { Injectable, inject } from '@angular/core';
import { GameState } from '../models/game.model';

/**
 * Service for sharing game results to social media
 */
@Injectable({
  providedIn: 'root',
})
export class ShareService {
  /**
   * Generates an image of the game results using canvas
   * @param gameState The completed game state
   * @returns Promise resolving to a Blob of the generated image
   */
  async generateResultImage(gameState: GameState): Promise<Blob> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    // Set canvas size for social media sharing (optimized for Twitter)
    canvas.width = 1200;
    canvas.height = 675;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#e3f2fd');
    gradient.addColorStop(1, '#bbdefb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game title
    ctx.fillStyle = '#1976d2';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('白Guessr', canvas.width / 2, 100);

    // Score section
    ctx.fillStyle = '#424242';
    ctx.font = 'bold 96px sans-serif';
    ctx.fillText(`${gameState.totalScore}`, canvas.width / 2, 250);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText('out of 5000 points', canvas.width / 2, 310);

    // Performance evaluation
    const scorePercentage = Math.round((gameState.totalScore / 5000) * 100);
    let performanceEmoji = '💪';
    let performanceText = 'Try Again!';

    if (gameState.totalScore >= 4500) {
      performanceEmoji = '🎉';
      performanceText = 'Excellent!';
    } else if (gameState.totalScore >= 3500) {
      performanceEmoji = '👍';
      performanceText = 'Good Job!';
    }

    ctx.font = '64px sans-serif';
    ctx.fillText(performanceEmoji, canvas.width / 2, 410);

    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#1976d2';
    ctx.fillText(performanceText, canvas.width / 2, 480);

    ctx.font = '32px sans-serif';
    ctx.fillStyle = '#757575';
    ctx.fillText(`${scorePercentage}% Accuracy`, canvas.width / 2, 530);

    // Round breakdown
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = '#424242';
    ctx.textAlign = 'left';
    ctx.fillText('Round Breakdown:', 100, 600);

    let xPos = 100;
    gameState.rounds.forEach((round, index) => {
      const roundScore = round.score ?? 0;
      ctx.fillStyle = roundScore >= 900 ? '#4caf50' : roundScore >= 700 ? '#ff9800' : '#f44336';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`R${index + 1}: ${roundScore}`, xPos, 640);
      xPos += 200;
    });

    // Convert canvas to Blob
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      }, 'image/png');
    });
  }

  /**
   * Generates share text for social media
   * @param gameState The completed game state
   * @returns The share text with score and hashtag
   */
  generateShareText(gameState: GameState): string {
    const scorePercentage = Math.round((gameState.totalScore / 5000) * 100);
    return `${gameState.totalScore}/5000 (${scorePercentage}%) #白Guessr`;
  }

  /**
   * Shares the game result to X (Twitter)
   * Opens a new window with Twitter's web intent URL
   * @param gameState The completed game state
   */
  shareToTwitter(gameState: GameState): void {
    const text = this.generateShareText(gameState);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  }

  /**
   * Downloads the result image
   * @param gameState The completed game state
   */
  async downloadResultImage(gameState: GameState): Promise<void> {
    try {
      const blob = await this.generateResultImage(gameState);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `shiro-guessr-result-${gameState.totalScore}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download image:', error);
    }
  }

  /**
   * Attempts to use the Web Share API to share the result
   * On mobile: shares with image using native share
   * On desktop: downloads image and opens Twitter intent
   * @param gameState The completed game state
   */
  async shareResult(gameState: GameState): Promise<void> {
    const text = this.generateShareText(gameState);

    try {
      // Try to generate and share with image using Web Share API (mobile)
      const blob = await this.generateResultImage(gameState);
      const file = new File([blob], 'shiro-guessr-result.png', { type: 'image/png' });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: text,
          files: [file],
        });
        return;
      }
    } catch (error) {
      console.log('Web Share API not available, using desktop fallback');
    }

    // Desktop fallback: download image and open Twitter intent
    try {
      await this.downloadResultImage(gameState);
      // Wait a bit for download to start before opening Twitter
      setTimeout(() => {
        this.shareToTwitter(gameState);
      }, 500);
    } catch (error) {
      console.error('Failed to download image:', error);
      // Still open Twitter even if download fails
      this.shareToTwitter(gameState);
    }
  }
}
