import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { RGBColor } from '../../models/game.model';
import { ColorPaletteComponent } from '../color-palette/color-palette.component';
import { ScoreBoardComponent } from '../score-board/score-board.component';
import { ResultComponent } from '../result/result.component';
import { RoundResultDialog } from '../round-result-dialog/round-result-dialog';

/**
 * Main game component that orchestrates the game flow
 * Displays the active game or results based on game state
 */
@Component({
  selector: 'app-game',
  imports: [CommonModule, ColorPaletteComponent, ScoreBoardComponent, ResultComponent, RoundResultDialog],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameComponent {
  /**
   * Injected GameService for managing game state
   */
  private readonly gameService = inject(GameService);

  /**
   * Game state from the service
   */
  readonly gameState = this.gameService.gameState;

  /**
   * Current round from the service
   */
  readonly currentRound = this.gameService.currentRound;

  /**
   * Whether the game is active
   */
  readonly isGameActive = this.gameService.isGameActive;

  /**
   * Computed signal to check if current round has been completed
   */
  readonly isRoundCompleted = computed(() => {
    const round = this.currentRound();
    return round !== null && round.selectedColor !== null;
  });

  /**
   * Computed signal for showing the "Next Round" button
   */
  readonly showNextButton = computed(() => {
    const state = this.gameState();
    const round = this.currentRound();
    return !state.isCompleted && round !== null && round.selectedColor !== null;
  });

  /**
   * Signal to control dialog visibility
   */
  readonly showDialog = signal(false);

  /**
   * Computed signal to check if this is the last round
   */
  readonly isLastRound = computed(() => {
    const state = this.gameState();
    return state.currentRoundIndex === 4; // 0-based index, so 4 is the 5th round
  });

  /**
   * Initializes the component and starts a new game
   */
  constructor() {
    this.gameService.startNewGame();
  }

  /**
   * Handles color selection from the palette
   * @param color The selected RGB color
   */
  onColorSelected(color: RGBColor): void {
    this.gameService.selectColor(color);
    // Show dialog after color selection
    this.showDialog.set(true);
  }

  /**
   * Advances to the next round
   */
  onNextRound(): void {
    this.gameService.nextRound();
  }

  /**
   * Replays the game by starting a new game
   */
  onReplay(): void {
    this.gameService.replayGame();
  }

  /**
   * Handles Next Round button click from dialog
   */
  onDialogNextRound(): void {
    this.showDialog.set(false);
    this.onNextRound();
  }
}
