import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/map',
    pathMatch: 'full',
  },
  {
    path: 'classic',
    loadComponent: () =>
      import('./components/classic-game/classic-game.component').then((m) => m.ClassicGameComponent),
  },
  {
    path: 'game',
    redirectTo: '/map',
    pathMatch: 'full',
  },
  {
    path: 'map',
    loadComponent: () =>
      import('./components/map-game/map-game.component').then((m) => m.MapGameComponent),
  },
  {
    path: 'app',
    loadComponent: () =>
      import('./components/ios-landing/ios-landing.component').then((m) => m.IosLandingComponent),
  },
  {
    path: 'support',
    loadComponent: () =>
      import('./components/support/support.component').then((m) => m.SupportComponent),
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./components/privacy-policy/privacy-policy.component').then((m) => m.PrivacyPolicyComponent),
  },
];
