import { Injectable, signal, WritableSignal } from '@angular/core';
import { MapCoordinate, ViewportState } from '../models/game.model';

/**
 * Service for managing map navigation (pan, zoom, coordinate transformation)
 */
@Injectable({
  providedIn: 'root',
})
export class MapNavigationService {
  /**
   * Minimum allowed zoom level
   */
  private readonly MIN_ZOOM = 0.5;

  /**
   * Maximum allowed zoom level
   */
  private readonly MAX_ZOOM = 4.0;

  /**
   * Current viewport state
   */
  readonly viewportState: WritableSignal<ViewportState> = signal({
    center: { x: 0.5, y: 0.5 },
    zoom: 1.0,
    offset: { x: 0, y: 0 },
  });

  /**
   * Pans the viewport by the specified deltas
   * @param deltaX Horizontal movement in pixels
   * @param deltaY Vertical movement in pixels
   */
  pan(deltaX: number, deltaY: number): void {
    const currentState = this.viewportState();
    const newOffset = {
      x: currentState.offset.x + deltaX,
      y: currentState.offset.y + deltaY,
    };

    this.viewportState.set({
      ...currentState,
      offset: newOffset,
    });
  }

  /**
   * Zooms the viewport by the specified delta
   * @param delta Zoom delta (positive to zoom in, negative to zoom out)
   * @param center Optional center point for zooming (in normalized coordinates)
   */
  zoom(delta: number, center?: MapCoordinate): void {
    const currentState = this.viewportState();
    const newZoom = this.clampZoom(currentState.zoom + delta);

    // If center is provided, adjust offset to zoom towards that point
    let newOffset = currentState.offset;
    if (center) {
      const zoomRatio = newZoom / currentState.zoom;
      newOffset = {
        x: currentState.offset.x * zoomRatio,
        y: currentState.offset.y * zoomRatio,
      };
    }

    this.viewportState.set({
      ...currentState,
      zoom: newZoom,
      offset: newOffset,
    });
  }

  /**
   * Resets the viewport to the initial state
   */
  resetView(): void {
    this.viewportState.set({
      center: { x: 0.5, y: 0.5 },
      zoom: 1.0,
      offset: { x: 0, y: 0 },
    });
  }

  /**
   * Converts screen coordinates to map coordinates
   * @param screenX Screen X coordinate in pixels
   * @param screenY Screen Y coordinate in pixels
   * @param canvasWidth Canvas width in pixels
   * @param canvasHeight Canvas height in pixels
   * @returns Normalized map coordinate (0-1)
   */
  screenToMapCoordinate(
    screenX: number,
    screenY: number,
    canvasWidth: number,
    canvasHeight: number
  ): MapCoordinate {
    const state = this.viewportState();

    // Adjust for offset
    const adjustedX = screenX - state.offset.x;
    const adjustedY = screenY - state.offset.y;

    // Normalize to 0-1 range, accounting for zoom
    const normalizedX = (adjustedX / canvasWidth) / state.zoom;
    const normalizedY = (adjustedY / canvasHeight) / state.zoom;

    // Adjust for center offset
    const centerOffsetX = (1 - state.zoom) / (2 * state.zoom);
    const centerOffsetY = (1 - state.zoom) / (2 * state.zoom);

    const mapX = normalizedX + centerOffsetX;
    const mapY = normalizedY + centerOffsetY;

    return {
      x: this.clamp(mapX, 0, 1),
      y: this.clamp(mapY, 0, 1),
    };
  }

  /**
   * Clamps zoom level to valid range
   * @param zoom Zoom level
   * @returns Clamped zoom level
   */
  private clampZoom(zoom: number): number {
    return this.clamp(zoom, this.MIN_ZOOM, this.MAX_ZOOM);
  }

  /**
   * Clamps a value to a range
   * @param value Value to clamp
   * @param min Minimum value
   * @param max Maximum value
   * @returns Clamped value
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
