import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { GameStateService } from './core/services/game-state.service';

export const routes: Routes = [
  {
    path: '',
    title: 'Die Detektiv-Geschwister',
    loadComponent: () => import('./screens/title/title-screen').then((m) => m.TitleScreen),
  },
  {
    path: 'game',
    title: 'Die Detektiv-Geschwister – Spiel',
    // Without a started or saved game there is nothing to play yet.
    canActivate: [() => inject(GameStateService).inProgress() || inject(Router).createUrlTree(['/'])],
    loadComponent: () => import('./screens/game/game-screen').then((m) => m.GameScreen),
  },
  { path: '**', redirectTo: '' },
];
