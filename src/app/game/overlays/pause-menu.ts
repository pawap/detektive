import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStateService } from '../../core/services/game-state.service';
import { OverlayService } from '../../core/services/overlay.service';
import { TEXT } from '../../core/texts';
import { GameEngine } from '../engine/game-engine';

@Component({
  selector: 'app-pause-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="panel menu" role="dialog" aria-labelledby="menu-title">
      <h2 id="menu-title">{{ text.menu }}</h2>
      <button type="button" class="btn" (click)="overlay.close()">{{ text.resume }}</button>
      <button type="button" class="btn" (click)="toTitle()">{{ text.toTitle }}</button>
      <p class="save-info" role="status" [class.error]="!state.storageOk()">
        {{ state.storageOk() ? text.autoSaveInfo : text.saveFailed }}
      </p>
    </section>
  `,
  styles: `
    .menu { display: flex; flex-direction: column; gap: 0.6em; max-width: 18em; text-align: center; }
    .save-info { margin: 0.4em 0 0; font-size: 0.85em; opacity: 0.8; }
    .save-info.error { opacity: 1; color: #b3261e; font-weight: bold; }
  `,
})
export class PauseMenu {
  private readonly engine = inject(GameEngine);
  private readonly router = inject(Router);
  protected readonly overlay = inject(OverlayService);
  protected readonly state = inject(GameStateService);
  protected readonly text = TEXT;

  protected toTitle(): void {
    this.engine.saveGame();
    void this.router.navigate(['/']);
  }
}
