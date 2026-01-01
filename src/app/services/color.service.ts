import { Injectable } from '@angular/core';
import { RGBColor, PaletteColor } from '../models/game.model';

/**
 * Service for generating and manipulating colors
 */
@Injectable({
  providedIn: 'root',
})
export class ColorService {
  /**
   * Minimum RGB value for white colors (inclusive)
   */
  private readonly MIN_WHITE_VALUE = 245;

  /**
   * Maximum RGB value for white colors (inclusive)
   */
  private readonly MAX_WHITE_VALUE = 255;

  /**
   * Generates a random white color with RGB values between 245-255
   * @returns A random white RGBColor
   */
  generateRandomWhiteColor(): RGBColor {
    return {
      r: this.randomInRange(this.MIN_WHITE_VALUE, this.MAX_WHITE_VALUE),
      g: this.randomInRange(this.MIN_WHITE_VALUE, this.MAX_WHITE_VALUE),
      b: this.randomInRange(this.MIN_WHITE_VALUE, this.MAX_WHITE_VALUE),
    };
  }

  /**
   * Generates all possible white colors (RGB 245-255)
   * Total: 11 × 11 × 11 = 1,331 colors
   * @returns Array of all possible white colors
   */
  generateAllWhiteColors(): RGBColor[] {
    const colors: RGBColor[] = [];
    for (let r = this.MIN_WHITE_VALUE; r <= this.MAX_WHITE_VALUE; r++) {
      for (let g = this.MIN_WHITE_VALUE; g <= this.MAX_WHITE_VALUE; g++) {
        for (let b = this.MIN_WHITE_VALUE; b <= this.MAX_WHITE_VALUE; b++) {
          colors.push({ r, g, b });
        }
      }
    }
    return colors;
  }

  /**
   * Gets a random sample of palette colors from all possible white colors
   * @param count Number of colors to sample (default: 25)
   * @returns Array of random palette colors
   */
  getRandomPaletteColors(count: number = 25): PaletteColor[] {
    const allColors = this.generateAllWhiteColors();
    const shuffled = this.shuffleArray([...allColors]);
    return shuffled.slice(0, count).map((color) => ({ color }));
  }

  /**
   * Calculates the Manhattan distance between two RGB colors
   * Formula: |r1 - r2| + |g1 - g2| + |b1 - b2|
   * @param color1 First color
   * @param color2 Second color
   * @returns Manhattan distance (0-30 for white colors)
   */
  calculateManhattanDistance(color1: RGBColor, color2: RGBColor): number {
    return Math.abs(color1.r - color2.r) + Math.abs(color1.g - color2.g) + Math.abs(color1.b - color2.b);
  }

  /**
   * Converts an RGB color to a CSS color string
   * @param color The RGB color
   * @returns CSS color string in format "rgb(r, g, b)"
   */
  rgbToString(color: RGBColor): string {
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
  }

  /**
   * Generates a random integer between min and max (inclusive)
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random integer
   */
  private randomInRange(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Shuffles an array using Fisher-Yates algorithm
   * @param array Array to shuffle
   * @returns Shuffled array
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}
