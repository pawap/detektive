import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { GameStateService } from './core/services/game-state.service';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Continue the saved game after a reload (also when reloading on /game).
    provideAppInitializer(() => inject(GameStateService).restore()),
  ]
};
