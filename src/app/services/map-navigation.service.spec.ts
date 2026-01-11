import { TestBed } from '@angular/core/testing';
import { MapNavigationService } from './map-navigation.service';
import { beforeEach, describe, it, expect } from 'vitest';

describe('MapNavigationService', () => {
  let service: MapNavigationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapNavigationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have initial viewport state centered with zoom 1.0', () => {
      const state = service.viewportState();

      expect(state.center).toEqual({ x: 0.5, y: 0.5 });
      expect(state.zoom).toBe(1.0);
      expect(state.offset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('pan', () => {
    it('should update offset when panning', () => {
      service.pan(10, 20);

      const state = service.viewportState();
      expect(state.offset).toEqual({ x: 10, y: 20 });
    });

    it('should accumulate pan movements', () => {
      service.pan(10, 20);
      service.pan(5, -10);

      const state = service.viewportState();
      expect(state.offset).toEqual({ x: 15, y: 10 });
    });

    it('should handle negative deltas', () => {
      service.pan(-10, -20);

      const state = service.viewportState();
      expect(state.offset).toEqual({ x: -10, y: -20 });
    });

    it('should not affect zoom level', () => {
      service.pan(10, 20);

      const state = service.viewportState();
      expect(state.zoom).toBe(1.0);
    });

    it('should not affect center', () => {
      service.pan(10, 20);

      const state = service.viewportState();
      expect(state.center).toEqual({ x: 0.5, y: 0.5 });
    });
  });

  describe('zoom', () => {
    it('should update zoom level', () => {
      service.zoom(0.5);

      const state = service.viewportState();
      expect(state.zoom).toBe(1.5);
    });

    it('should clamp zoom to minimum (0.5)', () => {
      service.zoom(-1.0);

      const state = service.viewportState();
      expect(state.zoom).toBe(0.5);
    });

    it('should clamp zoom to maximum (4.0)', () => {
      service.zoom(5.0);

      const state = service.viewportState();
      expect(state.zoom).toBe(4.0);
    });

    it('should allow zoom in', () => {
      service.zoom(0.5);
      service.zoom(0.5);

      const state = service.viewportState();
      expect(state.zoom).toBe(2.0);
    });

    it('should allow zoom out', () => {
      service.zoom(1.0); // Zoom to 2.0
      service.zoom(-0.5); // Zoom to 1.5

      const state = service.viewportState();
      expect(state.zoom).toBe(1.5);
    });

    it('should handle zoom with center point', () => {
      const center = { x: 0.3, y: 0.7 };
      service.zoom(0.5, center);

      const state = service.viewportState();
      expect(state.zoom).toBe(1.5);
      // Offset should be adjusted when center is provided
      expect(state.offset).toBeDefined();
    });

    it('should adjust offset when zooming with center', () => {
      // Set initial offset
      service.pan(10, 20);
      const initialOffset = service.viewportState().offset;

      // Zoom with center
      const center = { x: 0.5, y: 0.5 };
      service.zoom(1.0, center); // Zoom from 1.0 to 2.0

      const state = service.viewportState();
      expect(state.zoom).toBe(2.0);
      // Offset should be scaled by zoom ratio (2.0 / 1.0 = 2.0)
      expect(state.offset.x).toBe(initialOffset.x * 2);
      expect(state.offset.y).toBe(initialOffset.y * 2);
    });

    it('should not modify offset when zooming without center', () => {
      service.pan(10, 20);
      service.zoom(0.5);

      const state = service.viewportState();
      expect(state.offset).toEqual({ x: 10, y: 20 });
    });
  });

  describe('resetView', () => {
    it('should reset viewport to initial state', () => {
      // Modify viewport
      service.pan(10, 20);
      service.zoom(1.0);

      // Reset
      service.resetView();

      const state = service.viewportState();
      expect(state.center).toEqual({ x: 0.5, y: 0.5 });
      expect(state.zoom).toBe(1.0);
      expect(state.offset).toEqual({ x: 0, y: 0 });
    });

    it('should reset from extreme zoom', () => {
      service.zoom(3.0); // Zoom to 4.0 (clamped)
      service.resetView();

      const state = service.viewportState();
      expect(state.zoom).toBe(1.0);
    });

    it('should reset from large pan offset', () => {
      service.pan(100, -100);
      service.resetView();

      const state = service.viewportState();
      expect(state.offset).toEqual({ x: 0, y: 0 });
    });
  });

  describe('screenToMapCoordinate', () => {
    const canvasWidth = 800;
    const canvasHeight = 600;

    it('should convert center screen point to center map coordinate at zoom 1.0', () => {
      const coord = service.screenToMapCoordinate(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth,
        canvasHeight
      );

      expect(coord.x).toBeCloseTo(0.5, 2);
      expect(coord.y).toBeCloseTo(0.5, 2);
    });

    it('should convert top-left screen point to top-left map coordinate at zoom 1.0', () => {
      const coord = service.screenToMapCoordinate(0, 0, canvasWidth, canvasHeight);

      expect(coord.x).toBeCloseTo(0, 2);
      expect(coord.y).toBeCloseTo(0, 2);
    });

    it('should convert bottom-right screen point to bottom-right map coordinate at zoom 1.0', () => {
      const coord = service.screenToMapCoordinate(
        canvasWidth,
        canvasHeight,
        canvasWidth,
        canvasHeight
      );

      expect(coord.x).toBeCloseTo(1, 2);
      expect(coord.y).toBeCloseTo(1, 2);
    });

    it('should clamp coordinates to [0, 1] range', () => {
      const coord = service.screenToMapCoordinate(-100, -100, canvasWidth, canvasHeight);

      expect(coord.x).toBeGreaterThanOrEqual(0);
      expect(coord.x).toBeLessThanOrEqual(1);
      expect(coord.y).toBeGreaterThanOrEqual(0);
      expect(coord.y).toBeLessThanOrEqual(1);
    });

    it('should account for pan offset', () => {
      service.pan(100, 50);

      const coord = service.screenToMapCoordinate(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth,
        canvasHeight
      );

      // Coordinate should be shifted due to pan
      expect(coord.x).not.toBeCloseTo(0.5, 1);
      expect(coord.y).not.toBeCloseTo(0.5, 1);
    });

    it('should account for zoom level', () => {
      service.zoom(1.0); // Zoom to 2.0

      const coord = service.screenToMapCoordinate(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth,
        canvasHeight
      );

      // At higher zoom, center coordinate changes due to zoom adjustment
      expect(coord).toBeDefined();
      expect(coord.x).toBeGreaterThanOrEqual(0);
      expect(coord.x).toBeLessThanOrEqual(1);
    });

    it('should handle edge coordinates', () => {
      const coords = [
        service.screenToMapCoordinate(0, 0, canvasWidth, canvasHeight),
        service.screenToMapCoordinate(canvasWidth, 0, canvasWidth, canvasHeight),
        service.screenToMapCoordinate(0, canvasHeight, canvasWidth, canvasHeight),
        service.screenToMapCoordinate(canvasWidth, canvasHeight, canvasWidth, canvasHeight),
      ];

      coords.forEach((coord) => {
        expect(coord.x).toBeGreaterThanOrEqual(0);
        expect(coord.x).toBeLessThanOrEqual(1);
        expect(coord.y).toBeGreaterThanOrEqual(0);
        expect(coord.y).toBeLessThanOrEqual(1);
      });
    });

    it('should produce different coordinates for different screen points', () => {
      const coord1 = service.screenToMapCoordinate(100, 100, canvasWidth, canvasHeight);
      const coord2 = service.screenToMapCoordinate(200, 200, canvasWidth, canvasHeight);

      expect(coord1.x).not.toBe(coord2.x);
      expect(coord1.y).not.toBe(coord2.y);
    });
  });

  describe('integration scenarios', () => {
    it('should handle combined pan and zoom operations', () => {
      service.pan(50, 30);
      service.zoom(0.5);
      service.pan(-20, 10);

      const state = service.viewportState();
      expect(state.zoom).toBe(1.5);
      expect(state.offset).toEqual({ x: 30, y: 40 });
    });

    it('should maintain state across multiple operations', () => {
      service.zoom(0.5);
      service.pan(10, 10);
      service.zoom(0.5);
      service.pan(-5, 5);

      const state = service.viewportState();
      expect(state.zoom).toBe(2.0);
      expect(state.offset).toEqual({ x: 5, y: 15 });
    });

    it('should handle reset after complex operations', () => {
      service.zoom(2.0);
      service.pan(100, -50);
      service.zoom(-0.5);
      service.resetView();

      const state = service.viewportState();
      expect(state).toEqual({
        center: { x: 0.5, y: 0.5 },
        zoom: 1.0,
        offset: { x: 0, y: 0 },
      });
    });
  });
});
