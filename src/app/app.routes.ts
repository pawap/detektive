import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Die Detektiv-Geschwister',
    loadComponent: () => import('./screens/title/title-screen').then((m) => m.TitleScreen),
  },
  {
    path: 'game',
    title: 'Die Detektiv-Geschwister – Spiel',
    loadComponent: () => import('./screens/game/game-screen').then((m) => m.GameScreen),
  },
  { path: '**', redirectTo: '' },
];
