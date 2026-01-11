import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

/**
 * Mode switcher component for navigating between game modes
 */
@Component({
  selector: 'app-mode-switcher',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './mode-switcher.component.html',
  styleUrl: './mode-switcher.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeSwitcherComponent {
  /**
   * Current game mode
   */
  readonly currentMode = input<'classic' | 'map'>();
}
