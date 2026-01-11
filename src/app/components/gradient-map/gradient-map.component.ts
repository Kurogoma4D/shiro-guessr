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
  untracked,
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

  /**
   * Pixel size for rendering (each map pixel = 16x16 canvas pixels)
   */
  private readonly PIXEL_SIZE = 16;

  /**
   * Reference to the last rendered map to detect actual changes
   */
  private lastRenderedMap: GradientMap | null = null;

  constructor() {
    // Effect to render the map when it changes
    effect(() => {
      const map = this.gradientMap();
      console.log('Map effect triggered, map:', map ? 'exists' : 'null');
      if (map && this.canvasRef) {
        // Check if this is actually a new map
        const isNewMap = this.lastRenderedMap !== map;
        console.log('Is new map:', isNewMap);

        if (isNewMap) {
          // Clear offscreen canvas when map changes to force re-render
          this.offscreenCanvas = null;

          // Reset viewport when new map is loaded (only if canvas is ready)
          if (isPlatformBrowser(this.platformId) &&
              this.canvasRef.nativeElement.width > 0 &&
              this.canvasRef.nativeElement.height > 0) {
            console.log('Calling initializeViewport from map effect');
            this.initializeViewport();
          }

          // Update last rendered map reference
          this.lastRenderedMap = map;
        }

        this.renderMap(map);
      }
    });

    // Effect to re-render when viewport changes
    effect(() => {
      // Subscribe to viewport changes
      this.navigationService.viewportState();

      // Use untracked to read gradientMap without subscribing to it
      // This prevents circular dependency between viewport and map changes
      untracked(() => {
        const map = this.gradientMap();
        if (map && this.canvasRef && this.canvasRef.nativeElement.width > 0) {
          this.renderMap(map);
        }
      });
    });

    // Effect to re-render when pin changes
    effect(() => {
      // Subscribe to pin changes
      this.pin();

      // Use untracked to read gradientMap without subscribing to it
      untracked(() => {
        const map = this.gradientMap();
        if (map && this.canvasRef) {
          this.renderMap(map);
        }
      });
    });
  }

  ngAfterViewInit(): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Use setTimeout to ensure canvas is fully rendered and sized
    setTimeout(() => {
      // Set canvas size to match its displayed size
      this.resizeCanvas();

      // Initialize viewport to fit map
      this.initializeViewport();

      // Re-render when gradient map is set
      const map = this.gradientMap();
      if (map) {
        this.renderMap(map);
      }
    }, 100);

    // Add resize listener to update canvas size
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => {
        this.resizeCanvas();
        this.initializeViewport();
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
    const parent = canvas.parentElement;

    if (!parent) {
      return;
    }

    const rect = parent.getBoundingClientRect();

    // Set canvas internal dimensions to match display size
    canvas.width = rect.width;
    canvas.height = rect.height;
  }

  /**
   * Initializes the viewport to fit the map in the canvas
   */
  private initializeViewport(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;

    // Early return if canvas is not ready
    if (canvas.width === 0 || canvas.height === 0) {
      return;
    }

    const dimensions = this.getDisplayDimensions();
    if (!dimensions) {
      return;
    }

    const displayWidth = dimensions.width;
    const displayHeight = dimensions.height;

    // Calculate zoom to fit map in canvas (full width)
    const zoomX = canvas.width / displayWidth;
    const zoomY = canvas.height / displayHeight;
    const fitZoom = Math.min(zoomX, zoomY); // Fill entire screen width/height

    // Always set viewport to fit map to screen
    this.navigationService.viewportState.set({
      center: { x: 0.5, y: 0.5 },
      zoom: fitZoom,
      offset: { x: 0, y: 0 },
    });
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
    this.isPanning.set(false); // Start as not panning

    // Prevent default to avoid text selection
    event.preventDefault();
  }

  /**
   * Handles pointer move event
   */
  onPointerMove(event: PointerEvent): void {
    if (!this.lastPointerPosition || this.disabled()) {
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
      this.isPanning.set(true); // Set panning to true only when actually moving
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
    console.log('zoomIn called, disabled:', this.disabled());
    if (this.disabled()) {
      return;
    }

    const beforeZoom = this.navigationService.viewportState().zoom;
    console.log('Before zoom:', beforeZoom);
    this.navigationService.zoom(0.2);

    // Check immediately after
    setTimeout(() => {
      const afterZoom = this.navigationService.viewportState().zoom;
      console.log('After zoom (immediate):', afterZoom);
    }, 0);

    // Check after a delay
    setTimeout(() => {
      const afterZoom = this.navigationService.viewportState().zoom;
      console.log('After zoom (delayed 100ms):', afterZoom);
    }, 100);
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
   * Gets the display dimensions of the map
   */
  private getDisplayDimensions(): { width: number; height: number } | null {
    const map = this.gradientMap();
    if (!map) return null;

    return {
      width: map.width * this.PIXEL_SIZE,
      height: map.height * this.PIXEL_SIZE,
    };
  }

  /**
   * Places a pin at the specified screen coordinates
   */
  private placePin(screenX: number, screenY: number): void {
    const canvas = this.canvasRef.nativeElement;
    const dimensions = this.getDisplayDimensions();
    if (!dimensions) return;

    const displayWidth = dimensions.width;
    const displayHeight = dimensions.height;

    // Get viewport state
    const viewport = this.navigationService.viewportState();

    // Calculate center offset (same logic as renderMap)
    const scaledWidth = displayWidth * viewport.zoom;
    const scaledHeight = displayHeight * viewport.zoom;
    const centerX = Math.max(0, (canvas.width - scaledWidth) / 2);
    const centerY = Math.max(0, (canvas.height - scaledHeight) / 2);

    // Inverse transformation: screen -> map coordinates
    // screenX = (mapX * zoom) + (centerX + offset.x)
    // mapX = (screenX - centerX - offset.x) / zoom
    const mapX = (screenX - centerX - viewport.offset.x) / viewport.zoom;
    const mapY = (screenY - centerY - viewport.offset.y) / viewport.zoom;

    // Normalize to 0-1 range
    const normalizedX = mapX / displayWidth;
    const normalizedY = mapY / displayHeight;

    // Clamp to valid range
    const coordinate: MapCoordinate = {
      x: Math.max(0, Math.min(1, normalizedX)),
      y: Math.max(0, Math.min(1, normalizedY)),
    };

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

    // Ensure canvas size is set
    if (canvas.width === 0 || canvas.height === 0) {
      this.resizeCanvas();
    }

    // Create or update offscreen canvas if needed
    if (!this.offscreenCanvas ||
        this.offscreenCanvas.width !== map.width ||
        this.offscreenCanvas.height !== map.height) {
      this.offscreenCanvas = document.createElement('canvas');
      this.gradientMapService.renderMapToCanvas(map, this.offscreenCanvas);
    }

    // Get viewport state
    const viewport = this.navigationService.viewportState();

    // Calculate display size
    const dimensions = this.getDisplayDimensions();
    if (!dimensions) return;

    const displayWidth = dimensions.width;
    const displayHeight = dimensions.height;

    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Center the map on the canvas (only if map is smaller than canvas)
    const scaledWidth = displayWidth * viewport.zoom;
    const scaledHeight = displayHeight * viewport.zoom;
    const centerX = Math.max(0, (canvas.width - scaledWidth) / 2);
    const centerY = Math.max(0, (canvas.height - scaledHeight) / 2);

    // Apply transformations for pan and zoom
    ctx.translate(centerX + viewport.offset.x, centerY + viewport.offset.y);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Disable image smoothing to get pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Draw the offscreen canvas (gradient map) with each pixel as 16px square
    ctx.drawImage(
      this.offscreenCanvas,
      0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height,  // Source rectangle
      0, 0, displayWidth, displayHeight  // Destination rectangle (16px per pixel)
    );

    // Restore context
    ctx.restore();

    // Draw pin if exists (in screen coordinates)
    const pin = this.pin();
    if (pin) {
      this.drawPin(pin, viewport, displayWidth, displayHeight);
    }
  }

  /**
   * Draws a pin on the canvas
   */
  private drawPin(pin: Pin, viewport: ViewportState, displayWidth: number, displayHeight: number): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate center offset (same logic as renderMap and placePin)
    const scaledWidth = displayWidth * viewport.zoom;
    const scaledHeight = displayHeight * viewport.zoom;
    const centerX = Math.max(0, (canvas.width - scaledWidth) / 2);
    const centerY = Math.max(0, (canvas.height - scaledHeight) / 2);

    // Convert normalized coordinates to map coordinates with viewport transformation
    const mapX = pin.coordinate.x * displayWidth;
    const mapY = pin.coordinate.y * displayHeight;

    // Apply viewport transformation with center offset
    const x = mapX * viewport.zoom + viewport.offset.x + centerX;
    const y = mapY * viewport.zoom + viewport.offset.y + centerY;

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
