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

    // White-based background with subtle gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#FEFEFE');
    gradient.addColorStop(1, '#F5F5F5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Game title with soft blue-gray color - centered higher
    ctx.fillStyle = '#7C9BB5';
    ctx.font = 'bold 72px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('白Guessr', canvas.width / 2, 120);

    // Score section with dark gray - centered
    ctx.fillStyle = '#2C2C2C';
    ctx.font = 'bold 120px sans-serif';
    ctx.fillText(`${gameState.totalScore}`, canvas.width / 2, 280);

    ctx.font = '40px sans-serif';
    ctx.fillStyle = '#6B6B6B';
    ctx.fillText('out of 5000 points', canvas.width / 2, 340);

    // Performance evaluation - only percentage, centered
    const scorePercentage = Math.round((gameState.totalScore / 5000) * 100);

    ctx.font = '36px sans-serif';
    ctx.fillStyle = '#7C9BB5';
    ctx.fillText(`${scorePercentage}% Accuracy`, canvas.width / 2, 400);

    // Round breakdown with rounded container - centered lower
    const containerX = 80;
    const containerY = 480;
    const containerWidth = canvas.width - 160;
    const containerHeight = 90;
    const cornerRadius = 20;

    // Draw rounded rectangle background
    ctx.fillStyle = '#F9F9F9';
    ctx.beginPath();
    ctx.moveTo(containerX + cornerRadius, containerY);
    ctx.lineTo(containerX + containerWidth - cornerRadius, containerY);
    ctx.quadraticCurveTo(containerX + containerWidth, containerY, containerX + containerWidth, containerY + cornerRadius);
    ctx.lineTo(containerX + containerWidth, containerY + containerHeight - cornerRadius);
    ctx.quadraticCurveTo(containerX + containerWidth, containerY + containerHeight, containerX + containerWidth - cornerRadius, containerY + containerHeight);
    ctx.lineTo(containerX + cornerRadius, containerY + containerHeight);
    ctx.quadraticCurveTo(containerX, containerY + containerHeight, containerX, containerY + containerHeight - cornerRadius);
    ctx.lineTo(containerX, containerY + cornerRadius);
    ctx.quadraticCurveTo(containerX, containerY, containerX + cornerRadius, containerY);
    ctx.closePath();
    ctx.fill();

    // Round breakdown title
    ctx.font = 'bold 24px sans-serif';
    ctx.fillStyle = '#2C2C2C';
    ctx.textAlign = 'left';
    ctx.fillText('Round Breakdown:', containerX + 20, containerY + 32);

    // Round scores
    let xPos = containerX + 20;
    gameState.rounds.forEach((round, index) => {
      const roundScore = round.score ?? 0;
      ctx.fillStyle = roundScore >= 900 ? '#87C4A5' : roundScore >= 700 ? '#7C9BB5' : '#E89393';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`R${index + 1}: ${roundScore}`, xPos, containerY + 68);
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
   * Shares the game result to Bluesky
   * Opens a new window with Bluesky's compose intent URL
   * @param gameState The completed game state
   */
  shareToBlueskyIntent(gameState: GameState): void {
    const text = this.generateShareText(gameState);
    const blueskyUrl = `https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`;
    window.open(blueskyUrl, '_blank', 'width=550,height=600');
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
   * Attempts to use the Web Share API to share the result to X (Twitter)
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

  /**
   * Attempts to use the Web Share API to share the result to Bluesky
   * On mobile: shares with image using native share
   * On desktop: opens Bluesky compose intent
   * @param gameState The completed game state
   */
  async shareToBluesky(gameState: GameState): Promise<void> {
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

    // Desktop fallback: open Bluesky compose intent
    this.shareToBlueskyIntent(gameState);
  }
}
