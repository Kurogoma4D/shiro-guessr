/**
 * RGB color representation with values from 0-255
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

/**
 * Map coordinate with normalized values (0-1)
 */
export interface MapCoordinate {
  /** Normalized x coordinate (0-1) */
  x: number;
  /** Normalized y coordinate (0-1) */
  y: number;
}

/**
 * Pin placed on the gradient map
 */
export interface Pin {
  /** The coordinate where the pin is placed */
  coordinate: MapCoordinate;
  /** The color at the pin location */
  color: RGBColor;
}

/**
 * Viewport state for map navigation
 */
export interface ViewportState {
  /** Center point of the viewport */
  center: MapCoordinate;
  /** Zoom level (0.5 - 4.0) */
  zoom: number;
  /** Offset from the center in pixels */
  offset: { x: number; y: number };
}

/**
 * Gradient map with bilinear interpolation
 */
export interface GradientMap {
  /** Width of the map in pixels */
  width: number;
  /** Height of the map in pixels */
  height: number;
  /** Colors at the four corners: [topLeft, topRight, bottomLeft, bottomRight] */
  cornerColors: [RGBColor, RGBColor, RGBColor, RGBColor];
}

/**
 * A single round in the game
 */
export interface GameRound {
  /** The round number (1-based) */
  roundNumber: number;
  /** The target color to guess */
  targetColor: RGBColor;
  /** The color selected by the player */
  selectedColor: RGBColor | null;
  /** Manhattan distance between target and selected color */
  distance: number | null;
  /** Score for this round (0-1000) */
  score: number | null;
  /** Available colors in the palette for this round */
  paletteColors: PaletteColor[];
  /** Pin placed on the map (for map mode) */
  pin?: Pin;
  /** Target pin location on the map (for map mode) */
  targetPin?: Pin;
  /** Time remaining when the guess was made (for map mode) */
  timeRemaining?: number;
}

/**
 * Overall game state
 */
export interface GameState {
  /** All rounds in the game */
  rounds: GameRound[];
  /** Current round index (0-based) */
  currentRoundIndex: number;
  /** Whether the game has been completed */
  isCompleted: boolean;
  /** Total score across all rounds */
  totalScore: number;
  /** Time limit per round in seconds (for map mode) */
  timeLimit?: number;
}

/**
 * A color in the palette with its RGB values
 */
export interface PaletteColor {
  color: RGBColor;
}
