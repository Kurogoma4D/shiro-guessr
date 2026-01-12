import {
  Component,
  input,
  output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  effect,
  inject,
  PLATFORM_ID,
  untracked,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { GradientMap, Pin, MapCoordinate } from '../../models/game.model';
import { GradientMapService } from '../../services/gradient-map.service';

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
   * Target pin location on the map
   */
  readonly targetPin = input<Pin | null>(null);

  /**
   * Whether interaction is disabled
   */
  readonly disabled = input<boolean>(false);

  /**
   * Emits when a pin is placed
   */
  readonly pinPlaced = output<MapCoordinate>();


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
      if (map && this.canvasRef) {
        // Check if this is actually a new map
        const isNewMap = this.lastRenderedMap !== map;

        if (isNewMap) {
          // Clear offscreen canvas when map changes to force re-render
          this.offscreenCanvas = null;

          // Update last rendered map reference
          this.lastRenderedMap = map;
        }

        this.renderMap(map);
      }
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

    // Effect to re-render when targetPin changes
    effect(() => {
      // Subscribe to targetPin changes
      this.targetPin();

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
    const screenWidth = window.innerWidth;
    const parent = canvas.parentElement;

    if (!parent) {
      return;
    }

    const rect = parent.getBoundingClientRect();

    if (screenWidth <= 480) {
      // For mobile screens (480px or less), use 2/3 of screen width
      canvas.height = rect.width * 2 / 3;
    } else {
      // For larger screens, use 1/2 of screen width
      canvas.height = rect.width * 1 / 2;
    }

    canvas.width = rect.width;
  }


  /**
   * Handles canvas click event
   */
  onCanvasClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    this.placePin(x, y);
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

    const originalWidth = dimensions.width;
    const originalHeight = dimensions.height;

    // Calculate scale to fit map in canvas (same as renderMap)
    const scaleX = canvas.width / originalWidth;
    const scaleY = canvas.height / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    // Calculate scaled dimensions
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;

    // Calculate center offset
    const centerX = (canvas.width - scaledWidth) / 2;
    const centerY = (canvas.height - scaledHeight) / 2;

    // Convert screen coordinates to map coordinates
    const mapX = screenX - centerX;
    const mapY = screenY - centerY;

    // Normalize to 0-1 range
    const normalizedX = mapX / scaledWidth;
    const normalizedY = mapY / scaledHeight;

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

    // Calculate original display size (16px per map pixel)
    const dimensions = this.getDisplayDimensions();
    if (!dimensions) return;

    const originalWidth = dimensions.width;
    const originalHeight = dimensions.height;

    // Calculate scale to fit map in canvas
    const scaleX = canvas.width / originalWidth;
    const scaleY = canvas.height / originalHeight;
    const scale = Math.min(scaleX, scaleY);

    // Calculate scaled dimensions
    const scaledWidth = originalWidth * scale;
    const scaledHeight = originalHeight * scale;

    // Clear main canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Center the map on the canvas
    const centerX = (canvas.width - scaledWidth) / 2;
    const centerY = (canvas.height - scaledHeight) / 2;

    // Disable image smoothing to get pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Draw the offscreen canvas (gradient map) scaled to fit
    ctx.drawImage(
      this.offscreenCanvas,
      0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height,  // Source rectangle
      centerX, centerY, scaledWidth, scaledHeight  // Destination rectangle (scaled and centered)
    );

    // Draw target pin if exists (in green)
    const targetPin = this.targetPin();
    if (targetPin) {
      this.drawPin(targetPin, scaledWidth, scaledHeight, centerX, centerY, '#10b981');
    }

    // Draw user pin if exists (in red)
    const pin = this.pin();
    if (pin) {
      this.drawPin(pin, scaledWidth, scaledHeight, centerX, centerY, '#ef4444');
    }
  }

  /**
   * Draws a pin on the canvas
   */
  private drawPin(
    pin: Pin,
    scaledWidth: number,
    scaledHeight: number,
    offsetX: number,
    offsetY: number,
    color: string = '#ef4444'
  ): void {
    // Only run in browser environment
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Convert normalized coordinates to screen coordinates
    const x = pin.coordinate.x * scaledWidth + offsetX;
    const y = pin.coordinate.y * scaledHeight + offsetY;

    // Draw pin shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;

    // Draw pin body
    ctx.beginPath();
    ctx.fillStyle = color;
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
