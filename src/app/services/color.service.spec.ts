import { TestBed } from '@angular/core/testing';
import { ColorService } from './color.service';
import { RGBColor } from '../models/game.model';

describe('ColorService', () => {
  let service: ColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateRandomWhiteColor', () => {
    it('should generate a color with RGB values between 245-255', () => {
      const color = service.generateRandomWhiteColor();

      expect(color.r).toBeGreaterThanOrEqual(245);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(245);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(245);
      expect(color.b).toBeLessThanOrEqual(255);
    });

    it('should generate different colors on multiple calls', () => {
      const colors = new Set<string>();
      // Generate 100 random colors and check we get some variety
      for (let i = 0; i < 100; i++) {
        const color = service.generateRandomWhiteColor();
        colors.add(`${color.r},${color.g},${color.b}`);
      }
      // With 100 random samples from 1,331 possibilities, we should get more than 1 unique value
      expect(colors.size).toBeGreaterThan(1);
    });

    it('should generate valid RGB values', () => {
      const color = service.generateRandomWhiteColor();

      expect(Number.isInteger(color.r)).toBe(true);
      expect(Number.isInteger(color.g)).toBe(true);
      expect(Number.isInteger(color.b)).toBe(true);
    });
  });

  describe('generateRandomColor', () => {
    it('should generate a color with RGB values between 0-255', () => {
      const color = service.generateRandomColor();

      expect(color.r).toBeGreaterThanOrEqual(0);
      expect(color.r).toBeLessThanOrEqual(255);
      expect(color.g).toBeGreaterThanOrEqual(0);
      expect(color.g).toBeLessThanOrEqual(255);
      expect(color.b).toBeGreaterThanOrEqual(0);
      expect(color.b).toBeLessThanOrEqual(255);
    });

    it('should generate different colors on multiple calls', () => {
      const colors = new Set<string>();
      // Generate 100 random colors and check we get some variety
      for (let i = 0; i < 100; i++) {
        const color = service.generateRandomColor();
        colors.add(`${color.r},${color.g},${color.b}`);
      }
      // With 100 random samples from 16.7M possibilities, we should get more than 1 unique value
      expect(colors.size).toBeGreaterThan(1);
    });

    it('should generate valid RGB values', () => {
      const color = service.generateRandomColor();

      expect(Number.isInteger(color.r)).toBe(true);
      expect(Number.isInteger(color.g)).toBe(true);
      expect(Number.isInteger(color.b)).toBe(true);
    });
  });

  describe('generateAllWhiteColors', () => {
    it('should generate exactly 1,331 colors (11 × 11 × 11)', () => {
      const colors = service.generateAllWhiteColors();
      expect(colors.length).toBe(1331); // 11 × 11 × 11
    });

    it('should generate all unique colors', () => {
      const colors = service.generateAllWhiteColors();
      const uniqueColors = new Set(colors.map(c => `${c.r},${c.g},${c.b}`));
      expect(uniqueColors.size).toBe(1331);
    });

    it('should include the minimum color (245, 245, 245)', () => {
      const colors = service.generateAllWhiteColors();
      const hasMinColor = colors.some(c => c.r === 245 && c.g === 245 && c.b === 245);
      expect(hasMinColor).toBe(true);
    });

    it('should include the maximum color (255, 255, 255)', () => {
      const colors = service.generateAllWhiteColors();
      const hasMaxColor = colors.some(c => c.r === 255 && c.g === 255 && c.b === 255);
      expect(hasMaxColor).toBe(true);
    });

    it('should only contain colors in the 245-255 range', () => {
      const colors = service.generateAllWhiteColors();
      colors.forEach(color => {
        expect(color.r).toBeGreaterThanOrEqual(245);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(245);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(245);
        expect(color.b).toBeLessThanOrEqual(255);
      });
    });
  });

  describe('getRandomPaletteColors', () => {
    it('should return 25 colors by default', () => {
      const paletteColors = service.getRandomPaletteColors();
      expect(paletteColors.length).toBe(25);
    });

    it('should return the specified number of colors', () => {
      const paletteColors = service.getRandomPaletteColors(10);
      expect(paletteColors.length).toBe(10);
    });

    it('should return palette colors with the correct structure', () => {
      const paletteColors = service.getRandomPaletteColors(5);
      paletteColors.forEach(pc => {
        expect(pc).toHaveProperty('color');
        expect(pc.color).toHaveProperty('r');
        expect(pc.color).toHaveProperty('g');
        expect(pc.color).toHaveProperty('b');
      });
    });

    it('should return unique colors', () => {
      const paletteColors = service.getRandomPaletteColors(25);
      const uniqueColors = new Set(
        paletteColors.map(pc => `${pc.color.r},${pc.color.g},${pc.color.b}`)
      );
      expect(uniqueColors.size).toBe(25);
    });

    it('should return colors in the 245-255 range', () => {
      const paletteColors = service.getRandomPaletteColors(25);
      paletteColors.forEach(pc => {
        expect(pc.color.r).toBeGreaterThanOrEqual(245);
        expect(pc.color.r).toBeLessThanOrEqual(255);
        expect(pc.color.g).toBeGreaterThanOrEqual(245);
        expect(pc.color.g).toBeLessThanOrEqual(255);
        expect(pc.color.b).toBeGreaterThanOrEqual(245);
        expect(pc.color.b).toBeLessThanOrEqual(255);
      });
    });

    it('should return different colors on multiple calls', () => {
      const palette1 = service.getRandomPaletteColors(5);
      const palette2 = service.getRandomPaletteColors(5);

      const colors1 = palette1.map(pc => `${pc.color.r},${pc.color.g},${pc.color.b}`).join('|');
      const colors2 = palette2.map(pc => `${pc.color.r},${pc.color.g},${pc.color.b}`).join('|');

      // With randomization, these should very rarely be identical
      // We'll just check they're not exactly the same order
      expect(colors1).not.toBe(colors2);
    });
  });

  describe('calculateManhattanDistance', () => {
    it('should return 0 for identical colors', () => {
      const color1: RGBColor = { r: 250, g: 250, b: 250 };
      const color2: RGBColor = { r: 250, g: 250, b: 250 };

      const distance = service.calculateManhattanDistance(color1, color2);
      expect(distance).toBe(0);
    });

    it('should calculate correct distance for different colors', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      // Distance = |245-255| + |245-255| + |245-255| = 10 + 10 + 10 = 30
      const distance = service.calculateManhattanDistance(color1, color2);
      expect(distance).toBe(30);
    });

    it('should calculate correct distance for partially different colors', () => {
      const color1: RGBColor = { r: 250, g: 250, b: 250 };
      const color2: RGBColor = { r: 252, g: 248, b: 251 };

      // Distance = |250-252| + |250-248| + |250-251| = 2 + 2 + 1 = 5
      const distance = service.calculateManhattanDistance(color1, color2);
      expect(distance).toBe(5);
    });

    it('should be symmetric (distance(A,B) === distance(B,A))', () => {
      const color1: RGBColor = { r: 245, g: 250, b: 255 };
      const color2: RGBColor = { r: 255, g: 245, b: 250 };

      const distance1 = service.calculateManhattanDistance(color1, color2);
      const distance2 = service.calculateManhattanDistance(color2, color1);

      expect(distance1).toBe(distance2);
    });

    it('should return maximum distance of 30 for extreme white colors', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      const distance = service.calculateManhattanDistance(color1, color2);
      expect(distance).toBe(30);
    });

    it('should handle single channel differences', () => {
      const color1: RGBColor = { r: 250, g: 250, b: 250 };
      const color2: RGBColor = { r: 255, g: 250, b: 250 };

      // Distance = |250-255| + 0 + 0 = 5
      const distance = service.calculateManhattanDistance(color1, color2);
      expect(distance).toBe(5);
    });
  });

  describe('rgbToString', () => {
    it('should convert RGB color to CSS string format', () => {
      const color: RGBColor = { r: 250, g: 250, b: 250 };
      const cssString = service.rgbToString(color);
      expect(cssString).toBe('rgb(250, 250, 250)');
    });

    it('should handle minimum white color values', () => {
      const color: RGBColor = { r: 245, g: 245, b: 245 };
      const cssString = service.rgbToString(color);
      expect(cssString).toBe('rgb(245, 245, 245)');
    });

    it('should handle maximum white color values', () => {
      const color: RGBColor = { r: 255, g: 255, b: 255 };
      const cssString = service.rgbToString(color);
      expect(cssString).toBe('rgb(255, 255, 255)');
    });

    it('should handle mixed values', () => {
      const color: RGBColor = { r: 245, g: 250, b: 255 };
      const cssString = service.rgbToString(color);
      expect(cssString).toBe('rgb(245, 250, 255)');
    });

    it('should create valid CSS color strings', () => {
      const color = service.generateRandomWhiteColor();
      const cssString = service.rgbToString(color);

      // Check format with regex
      expect(cssString).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    });
  });

  describe('interpolateColor', () => {
    it('should return color1 when t is 0', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      const result = service.interpolateColor(color1, color2, 0);
      expect(result).toEqual(color1);
    });

    it('should return color2 when t is 1', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      const result = service.interpolateColor(color1, color2, 1);
      expect(result).toEqual(color2);
    });

    it('should return midpoint color when t is 0.5', () => {
      const color1: RGBColor = { r: 240, g: 240, b: 240 };
      const color2: RGBColor = { r: 250, g: 250, b: 250 };

      const result = service.interpolateColor(color1, color2, 0.5);
      expect(result).toEqual({ r: 245, g: 245, b: 245 });
    });

    it('should interpolate correctly with different values per channel', () => {
      const color1: RGBColor = { r: 245, g: 250, b: 255 };
      const color2: RGBColor = { r: 255, g: 245, b: 245 };

      const result = service.interpolateColor(color1, color2, 0.5);
      expect(result).toEqual({ r: 250, g: 248, b: 250 });
    });

    it('should clamp t to 0 when negative', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      const result = service.interpolateColor(color1, color2, -0.5);
      expect(result).toEqual(color1);
    });

    it('should clamp t to 1 when greater than 1', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      const result = service.interpolateColor(color1, color2, 1.5);
      expect(result).toEqual(color2);
    });

    it('should round interpolated values to integers', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 246, g: 246, b: 246 };

      const result = service.interpolateColor(color1, color2, 0.3);
      // 245 + (246 - 245) * 0.3 = 245.3, should round to 245
      expect(result.r).toBe(245);
      expect(result.g).toBe(245);
      expect(result.b).toBe(245);
      expect(Number.isInteger(result.r)).toBe(true);
      expect(Number.isInteger(result.g)).toBe(true);
      expect(Number.isInteger(result.b)).toBe(true);
    });

    it('should work with identical colors', () => {
      const color: RGBColor = { r: 250, g: 250, b: 250 };

      const result = service.interpolateColor(color, color, 0.5);
      expect(result).toEqual(color);
    });

    it('should produce smooth gradient at multiple steps', () => {
      const color1: RGBColor = { r: 245, g: 245, b: 245 };
      const color2: RGBColor = { r: 255, g: 255, b: 255 };

      const steps = [0, 0.25, 0.5, 0.75, 1];
      const results = steps.map(t => service.interpolateColor(color1, color2, t));

      // Check that values are monotonically increasing
      for (let i = 1; i < results.length; i++) {
        expect(results[i].r).toBeGreaterThanOrEqual(results[i - 1].r);
        expect(results[i].g).toBeGreaterThanOrEqual(results[i - 1].g);
        expect(results[i].b).toBeGreaterThanOrEqual(results[i - 1].b);
      }
    });
  });
});
