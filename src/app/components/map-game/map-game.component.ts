import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModeSwitcherComponent } from '../mode-switcher/mode-switcher.component';
import { GameHeaderComponent } from '../game-header/game-header.component';
import { GradientMapComponent } from '../gradient-map/gradient-map.component';
import { GameControlsComponent } from '../game-controls/game-controls.component';
import { ResultComponent } from '../result/result.component';
import { MapGameService } from '../../services/map-game.service';
import { MapCoordinate } from '../../models/game.model';

/**
 * Main component for the map-based game mode
 */
@Component({
  selector: 'app-map-game',
  standalone: true,
  imports: [
    CommonModule,
    ModeSwitcherComponent,
    GameHeaderComponent,
    GradientMapComponent,
    GameControlsComponent,
    ResultComponent,
  ],
  templateUrl: './map-game.component.html',
  styleUrl: './map-game.component.css',
})
export class MapGameComponent implements OnInit {
  private readonly mapGameService = inject(MapGameService);

  /**
   * Game state
   */
  readonly gameState = this.mapGameService.gameState;

  /**
   * Current gradient map
   */
  readonly currentGradientMap = this.mapGameService.currentGradientMap;

  /**
   * Current pin
   */
  readonly currentPin = this.mapGameService.currentPin;

  /**
   * Current round
   */
  readonly currentRound = this.mapGameService.currentRound;

  /**
   * Time remaining
   */
  readonly timeRemaining = this.mapGameService.timeRemaining;

  /**
   * Whether the game is currently processing (between rounds)
   */
  readonly isProcessing = computed(() => {
    const current = this.currentRound();
    return current !== null && current.selectedColor !== null;
  });

  /**
   * Current total rounds
   */
  readonly totalRounds = computed(() => 5);

  ngOnInit(): void {
    // Start a new game when component is initialized
    this.mapGameService.startNewGame();
  }

  /**
   * Handles pin placement on the map
   */
  onPinPlaced(coordinate: MapCoordinate): void {
    this.mapGameService.placePin(coordinate);
  }

  /**
   * Handles guess submission
   */
  onGuess(): void {
    this.mapGameService.submitGuess();
  }

  /**
   * Handles replay action
   */
  onReplay(): void {
    this.mapGameService.replayGame();
  }

  /**
   * Handles next round action
   */
  onNextRound(): void {
    this.mapGameService.nextRound();
  }
}
