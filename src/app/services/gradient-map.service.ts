import { Injectable, inject } from '@angular/core';
import { RGBColor, GradientMap, MapCoordinate } from '../models/game.model';
import { ColorService } from './color.service';

/**
 * Service for generating and rendering gradient maps
 */
@Injectable({
  providedIn: 'root',
})
export class GradientMapService {
  private readonly colorService = inject(ColorService);

  /**
   * Generates a gradient map with fixed white colors at the four corners
   * Colors are always in the range (245-255) for consistency
   * @param width Width of the map in pixels
   * @param height Height of the map in pixels
   * @returns Generated gradient map
   */
  generateGradientMap(width: number, height: number): GradientMap {
    // Use fixed white colors (245-255) for each corner for consistent map appearance
    const topLeft: RGBColor = { r: 245, g: 245, b: 245 };
    const topRight: RGBColor = { r: 255, g: 245, b: 255 };
    const bottomLeft: RGBColor = { r: 245, g: 255, b: 255 };
    const bottomRight: RGBColor = { r: 255, g: 255, b: 245 };

    return {
      width,
      height,
      cornerColors: [topLeft, topRight, bottomLeft, bottomRight],
    };
  }

  /**
   * Gets the color at a specific coordinate using bilinear interpolation
   * @param map The gradient map
   * @param coordinate Normalized coordinate (0-1)
   * @returns Interpolated color at the coordinate
   */
  getColorAt(map: GradientMap, coordinate: MapCoordinate): RGBColor {
    const { x, y } = coordinate;
    const [topLeft, topRight, bottomLeft, bottomRight] = map.cornerColors;

    // Interpolate top edge (between topLeft and topRight)
    const topColor = this.colorService.interpolateColor(topLeft, topRight, x);

    // Interpolate bottom edge (between bottomLeft and bottomRight)
    const bottomColor = this.colorService.interpolateColor(bottomLeft, bottomRight, x);

    // Interpolate between top and bottom
    const finalColor = this.colorService.interpolateColor(topColor, bottomColor, y);

    return finalColor;
  }

  /**
   * Renders the gradient map to a canvas element
   * @param map The gradient map to render
   * @param canvas The target canvas element
   */
  renderMapToCanvas(map: GradientMap, canvas: HTMLCanvasElement): void {
    const { width, height } = map;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Failed to get 2D context from canvas');
      return;
    }

    // Create ImageData for efficient pixel manipulation
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    // Render each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Normalize coordinates (0-1)
        const normalizedX = x / (width - 1);
        const normalizedY = y / (height - 1);

        // Get color at this coordinate
        const color = this.getColorAt(map, { x: normalizedX, y: normalizedY });

        // Set pixel color in ImageData
        const index = (y * width + x) * 4;
        data[index] = color.r;     // Red
        data[index + 1] = color.g; // Green
        data[index + 2] = color.b; // Blue
        data[index + 3] = 255;     // Alpha (fully opaque)
      }
    }

    // Draw the ImageData to the canvas
    ctx.putImageData(imageData, 0, 0);
  }
}
