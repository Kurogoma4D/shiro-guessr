/**
 * RGB color representation with values from 0-255
 */
export interface RGBColor {
  r: number;
  g: number;
  b: number;
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
}

/**
 * A color in the palette with its RGB values
 */
export interface PaletteColor {
  color: RGBColor;
}
