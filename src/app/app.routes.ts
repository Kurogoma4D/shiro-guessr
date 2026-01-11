import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/classic',
    pathMatch: 'full',
  },
  {
    path: 'classic',
    loadComponent: () =>
      import('./components/classic-game/classic-game.component').then((m) => m.ClassicGameComponent),
  },
  {
    path: 'map',
    redirectTo: '/classic',
  },
];
