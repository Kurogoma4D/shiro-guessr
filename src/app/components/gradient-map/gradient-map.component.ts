import {
  Component,
  input,
  output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect,
  inject,
  signal,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GradientMap, Pin, MapCoordinate, ViewportState } from '../../models/game.model';
import { GradientMapService } from '../../services/gradient-map.service';
import { MapNavigationService } from '../../services/map-navigation.service';

/**
 * Component for displaying and interacting with a gradient map
 */
@Component({
  selector: 'app-gradient-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gradient-map.component.html',
  styleUrl: './gradient-map.component.css',
})
export class GradientMapComponent implements AfterViewInit {
  private readonly gradientMapService = inject(GradientMapService);
  private readonly navigationService = inject(MapNavigationService);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Canvas element reference
   */
  @ViewChild('canvas', { static: false })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  /**
   * Gradient map to display
   */
  readonly gradientMap = input<GradientMap | null>(null);

  /**
   * Pin placed on the map
   */
  readonly pin = input<Pin | null>(null);

  /**
   * Whether interaction is disabled
   */
  readonly disabled = input<boolean>(false);

  /**
   * Emits when a pin is placed
   */
  readonly pinPlaced = output<MapCoordinate>();

  /**
   * Whether panning is active
   */
  private readonly isPanning = signal(false);

  /**
   * Last pointer position for panning
   */
  private lastPointerPosition: { x: number; y: number } | null = null;

  /**
   * Offscreen canvas for caching the gradient map
   */
  private offscreenCanvas: HTMLCanvasElement | null = null;

  constructor() {
    // Effect to render the map when it changes
    effect(() => {
      const map = this.gradientMap();
      if (map && this.canvasRef) {
        // Clear offscreen canvas when map changes to force re-render
        this.offscreenCanvas = null;
        this.renderMap(map);
      }
    });

    // Effect to re-render when viewport changes
    effect(() => {
      // Subscribe to viewport changes
      this.navigationService.viewportState();
      const map = this.gradientMap();
      if (map && this.canvasRef) {
        this.renderMap(map);
      }
    });
  }

  ngAfterViewInit(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Set canvas size to match its displayed size
    this.resizeCanvas();

    // Re-render when gradient map is set
    const map = this.gradientMap();
    if (map) {
      this.renderMap(map);
    }

    // Add resize listener to update canvas size
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.resizeCanvas();
        const currentMap = this.gradientMap();
        if (currentMap) {
          this.renderMap(currentMap);
        }
      });
    }
  }

  /**
   * Resizes the canvas to match its container size
   */
  private resizeCanvas(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();

    // Set canvas internal dimensions to match display size
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  /**
   * Handles pointer down event
   */
  onPointerDown(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.lastPointerPosition = { x, y };
    this.isPanning.set(true);

    // Prevent default to avoid text selection
    event.preventDefault();
  }

  /**
   * Handles pointer move event
   */
  onPointerMove(event: PointerEvent): void {
    if (!this.isPanning() || !this.lastPointerPosition || this.disabled()) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const deltaX = x - this.lastPointerPosition.x;
    const deltaY = y - this.lastPointerPosition.y;

    // Check if this is actually a pan (moved more than threshold)
    const threshold = 5;
    if (Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold) {
      this.navigationService.pan(deltaX, deltaY);
      this.lastPointerPosition = { x, y };
    }
  }

  /**
   * Handles pointer up event
   */
  onPointerUp(event: PointerEvent): void {
    if (this.disabled()) {
      return;
    }

    const wasPanning = this.isPanning();
    this.isPanning.set(false);

    // If not panning (was a click), place pin
    if (!wasPanning && this.lastPointerPosition) {
      const canvas = this.canvasRef.nativeElement;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Check if pointer didn't move much (was a click, not a drag)
      const threshold = 5;
      const dx = Math.abs(x - this.lastPointerPosition.x);
      const dy = Math.abs(y - this.lastPointerPosition.y);

      if (dx <= threshold && dy <= threshold) {
        this.placePin(x, y);
      }
    }

    this.lastPointerPosition = null;
  }

  /**
   * Handles wheel event for zooming
   */
  onWheel(event: WheelEvent): void {
    if (this.disabled()) {
      return;
    }

    event.preventDefault();

    const delta = event.deltaY > 0 ? -0.1 : 0.1;
    this.navigationService.zoom(delta);
  }

  /**
   * Zooms in
   */
  zoomIn(): void {
    if (this.disabled()) {
      return;
    }

    this.navigationService.zoom(0.2);
  }

  /**
   * Zooms out
   */
  zoomOut(): void {
    if (this.disabled()) {
      return;
    }

    this.navigationService.zoom(-0.2);
  }

  /**
   * Resets the view
   */
  resetView(): void {
    this.navigationService.resetView();
  }

  /**
   * Places a pin at the specified screen coordinates
   */
  private placePin(screenX: number, screenY: number): void {
    const canvas = this.canvasRef.nativeElement;
    const coordinate = this.navigationService.screenToMapCoordinate(
      screenX,
      screenY,
      canvas.width,
      canvas.height
    );

    this.pinPlaced.emit(coordinate);
  }

  /**
   * Renders the gradient map to the canvas
   */
  private renderMap(map: GradientMap): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create or update offscreen canvas if needed
    if (!this.offscreenCanvas ||
        this.offscreenCanvas.width !== map.width ||
        this.offscreenCanvas.height !== map.height) {
      this.offscreenCanvas = document.createElement('canvas');
      this.gradientMapService.renderMapToCanvas(map, this.offscreenCanvas);
    }

    // Get viewport state
    const viewport = this.navigationService.viewportState();

    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Apply transformations for pan and zoom
    ctx.translate(viewport.offset.x, viewport.offset.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Draw the offscreen canvas (gradient map) scaled to fill the main canvas
    // This stretches the gradient map to fit the canvas size
    ctx.drawImage(
      this.offscreenCanvas,
      0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height,  // Source rectangle
      0, 0, canvas.width, canvas.height  // Destination rectangle (fill canvas)
    );

    // Restore context
    ctx.restore();

    // Draw pin if exists (in screen coordinates)
    const pin = this.pin();
    if (pin) {
      this.drawPin(pin, viewport);
    }
  }

  /**
   * Draws a pin on the canvas
   */
  private drawPin(pin: Pin, viewport: ViewportState): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert normalized coordinates to screen coordinates with viewport transformation
    const mapX = pin.coordinate.x * canvas.width;
    const mapY = pin.coordinate.y * canvas.height;

    // Apply viewport transformation
    const x = mapX * viewport.zoom + viewport.offset.x;
    const y = mapY * viewport.zoom + viewport.offset.y;

    // Draw pin shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Draw pin body (inverted teardrop shape)
    ctx.beginPath();
    ctx.fillStyle = '#ef4444'; // Red color
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fill();

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw pin outline
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Draw pin center
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}
