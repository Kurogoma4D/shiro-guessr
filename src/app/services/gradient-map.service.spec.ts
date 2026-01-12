import { TestBed } from '@angular/core/testing';
import { GradientMapService } from './gradient-map.service';
import { ColorService } from './color.service';
import { RGBColor, GradientMap } from '../models/game.model';
import { beforeEach, describe, it, expect, vi } from 'vitest';

describe('GradientMapService', () => {
  let service: GradientMapService;
  let colorService: ColorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GradientMapService);
    colorService = TestBed.inject(ColorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateGradientMap', () => {
    it('should generate a gradient map with specified dimensions', () => {
      const width = 800;
      const height = 600;

      const map = service.generateGradientMap(width, height);

      expect(map.width).toBe(width);
      expect(map.height).toBe(height);
    });

    it('should generate four corner colors', () => {
      const map = service.generateGradientMap(800, 600);

      expect(map.cornerColors).toHaveLength(4);
      map.cornerColors.forEach((color) => {
        expect(color).toHaveProperty('r');
        expect(color).toHaveProperty('g');
        expect(color).toHaveProperty('b');
      });
    });

    it('should generate corner colors within white range (245-255)', () => {
      const map = service.generateGradientMap(800, 600);

      map.cornerColors.forEach((color) => {
        expect(color.r).toBeGreaterThanOrEqual(245);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(245);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(245);
        expect(color.b).toBeLessThanOrEqual(255);
      });
    });

    it('should generate consistent maps on multiple calls', () => {
      // Generate multiple maps
      const map1 = service.generateGradientMap(800, 600);
      const map2 = service.generateGradientMap(800, 600);

      // Serialize corner colors for comparison
      const colors1 = JSON.stringify(map1.cornerColors);
      const colors2 = JSON.stringify(map2.cornerColors);

      // Maps should have consistent corner colors (not random)
      expect(colors1).toBe(colors2);

      // Verify the fixed corner colors
      expect(map1.cornerColors[0]).toEqual({ r: 245, g: 245, b: 245 }); // Top-left
      expect(map1.cornerColors[1]).toEqual({ r: 255, g: 245, b: 255 }); // Top-right
      expect(map1.cornerColors[2]).toEqual({ r: 245, g: 255, b: 255 }); // Bottom-left
      expect(map1.cornerColors[3]).toEqual({ r: 255, g: 255, b: 245 }); // Bottom-right
    });
  });

  describe('getColorAt', () => {
    let map: GradientMap;

    beforeEach(() => {
      // Create a predictable gradient map for testing
      map = {
        width: 800,
        height: 600,
        cornerColors: [
          { r: 245, g: 245, b: 245 }, // Top-left
          { r: 255, g: 245, b: 245 }, // Top-right
          { r: 245, g: 255, b: 245 }, // Bottom-left
          { r: 255, g: 255, b: 255 }, // Bottom-right
        ],
      };
    });

    it('should return top-left color at (0, 0)', () => {
      const color = service.getColorAt(map, { x: 0, y: 0 });
      expect(color).toEqual({ r: 245, g: 245, b: 245 });
    });

    it('should return top-right color at (1, 0)', () => {
      const color = service.getColorAt(map, { x: 1, y: 0 });
      expect(color).toEqual({ r: 255, g: 245, b: 245 });
    });

    it('should return bottom-left color at (0, 1)', () => {
      const color = service.getColorAt(map, { x: 0, y: 1 });
      expect(color).toEqual({ r: 245, g: 255, b: 245 });
    });

    it('should return bottom-right color at (1, 1)', () => {
      const color = service.getColorAt(map, { x: 1, y: 1 });
      expect(color).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should interpolate correctly at center (0.5, 0.5)', () => {
      const color = service.getColorAt(map, { x: 0.5, y: 0.5 });
      // Expected: average of all four corners
      // R: (245 + 255 + 245 + 255) / 4 = 250
      // G: (245 + 245 + 255 + 255) / 4 = 250
      // B: (245 + 245 + 245 + 255) / 4 = 247.5 → 248
      expect(color).toEqual({ r: 250, g: 250, b: 248 });
    });

    it('should interpolate correctly at intermediate points', () => {
      // Test point at (0.5, 0) - middle of top edge
      const topMiddle = service.getColorAt(map, { x: 0.5, y: 0 });
      expect(topMiddle).toEqual({ r: 250, g: 245, b: 245 });

      // Test point at (0, 0.5) - middle of left edge
      const leftMiddle = service.getColorAt(map, { x: 0, y: 0.5 });
      expect(leftMiddle).toEqual({ r: 245, g: 250, b: 245 });
    });

    it('should produce smooth gradients', () => {
      // Test that colors change monotonically along a diagonal
      const steps = [0, 0.25, 0.5, 0.75, 1];
      const colors = steps.map((t) => service.getColorAt(map, { x: t, y: t }));

      // Check that R and G values increase or stay the same
      for (let i = 1; i < colors.length; i++) {
        expect(colors[i].r).toBeGreaterThanOrEqual(colors[i - 1].r);
        expect(colors[i].g).toBeGreaterThanOrEqual(colors[i - 1].g);
      }
    });

    it('should handle coordinates outside [0, 1] range gracefully', () => {
      // The ColorService.interpolateColor should clamp these
      const color1 = service.getColorAt(map, { x: -0.1, y: 0.5 });
      const color2 = service.getColorAt(map, { x: 1.1, y: 0.5 });

      // Should not throw and should return valid colors
      expect(color1).toBeDefined();
      expect(color2).toBeDefined();
    });

    it('should return colors within valid RGB range', () => {
      // Test at multiple random points
      const testPoints = [
        { x: 0.1, y: 0.1 },
        { x: 0.3, y: 0.7 },
        { x: 0.6, y: 0.4 },
        { x: 0.9, y: 0.9 },
      ];

      testPoints.forEach((coord) => {
        const color = service.getColorAt(map, coord);
        expect(color.r).toBeGreaterThanOrEqual(0);
        expect(color.r).toBeLessThanOrEqual(255);
        expect(color.g).toBeGreaterThanOrEqual(0);
        expect(color.g).toBeLessThanOrEqual(255);
        expect(color.b).toBeGreaterThanOrEqual(0);
        expect(color.b).toBeLessThanOrEqual(255);
      });
    });
  });

  describe('renderMapToCanvas', () => {
    let canvas: HTMLCanvasElement;
    let map: GradientMap;

    beforeEach(() => {
      // Create a canvas element
      canvas = document.createElement('canvas');

      // Create a simple gradient map
      map = {
        width: 100,
        height: 100,
        cornerColors: [
          { r: 245, g: 245, b: 245 },
          { r: 255, g: 245, b: 245 },
          { r: 245, g: 255, b: 245 },
          { r: 255, g: 255, b: 255 },
        ],
      };
    });

    // Helper function to check if canvas is supported in test environment
    const isCanvasSupported = () => {
      try {
        const testCanvas = document.createElement('canvas');
        const ctx = testCanvas.getContext('2d');
        return ctx !== null;
      } catch {
        return false;
      }
    };

    it('should set canvas dimensions to match map', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      service.renderMapToCanvas(map, canvas);

      expect(canvas.width).toBe(map.width);
      expect(canvas.height).toBe(map.height);
    });

    it('should render without errors', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      expect(() => service.renderMapToCanvas(map, canvas)).not.toThrow();
    });

    it('should render pixels to canvas', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      service.renderMapToCanvas(map, canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, map.width, map.height);
      expect(imageData.data.length).toBe(map.width * map.height * 4);

      // Check that pixels have been written (not all zeros)
      let hasNonZero = false;
      for (let i = 0; i < imageData.data.length; i++) {
        if (imageData.data[i] !== 0) {
          hasNonZero = true;
          break;
        }
      }
      expect(hasNonZero).toBe(true);
    });

    it('should render corner pixels with correct colors', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      service.renderMapToCanvas(map, canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Check top-left pixel (0, 0)
      const topLeft = ctx.getImageData(0, 0, 1, 1).data;
      expect(topLeft[0]).toBe(245); // R
      expect(topLeft[1]).toBe(245); // G
      expect(topLeft[2]).toBe(245); // B
      expect(topLeft[3]).toBe(255); // A

      // Check top-right pixel (99, 0)
      const topRight = ctx.getImageData(99, 0, 1, 1).data;
      expect(topRight[0]).toBe(255); // R
      expect(topRight[1]).toBe(245); // G
      expect(topRight[2]).toBe(245); // B

      // Check bottom-left pixel (0, 99)
      const bottomLeft = ctx.getImageData(0, 99, 1, 1).data;
      expect(bottomLeft[0]).toBe(245); // R
      expect(bottomLeft[1]).toBe(255); // G
      expect(bottomLeft[2]).toBe(245); // B

      // Check bottom-right pixel (99, 99)
      const bottomRight = ctx.getImageData(99, 99, 1, 1).data;
      expect(bottomRight[0]).toBe(255); // R
      expect(bottomRight[1]).toBe(255); // G
      expect(bottomRight[2]).toBe(255); // B
    });

    it('should set alpha channel to 255 (fully opaque)', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      service.renderMapToCanvas(map, canvas);

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, map.width, map.height);

      // Check that all alpha values are 255
      for (let i = 3; i < imageData.data.length; i += 4) {
        expect(imageData.data[i]).toBe(255);
      }
    });

    it('should handle small canvas sizes', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      const smallMap: GradientMap = {
        width: 2,
        height: 2,
        cornerColors: [
          { r: 245, g: 245, b: 245 },
          { r: 255, g: 245, b: 245 },
          { r: 245, g: 255, b: 245 },
          { r: 255, g: 255, b: 255 },
        ],
      };

      expect(() => service.renderMapToCanvas(smallMap, canvas)).not.toThrow();
      expect(canvas.width).toBe(2);
      expect(canvas.height).toBe(2);
    });

    it('should handle large canvas sizes', () => {
      if (!isCanvasSupported()) {
        // Skip test in environments without canvas support
        return;
      }

      const largeMap: GradientMap = {
        width: 1920,
        height: 1080,
        cornerColors: [
          { r: 245, g: 245, b: 245 },
          { r: 255, g: 245, b: 245 },
          { r: 245, g: 255, b: 245 },
          { r: 255, g: 255, b: 255 },
        ],
      };

      expect(() => service.renderMapToCanvas(largeMap, canvas)).not.toThrow();
      expect(canvas.width).toBe(1920);
      expect(canvas.height).toBe(1080);
    });
  });
});
