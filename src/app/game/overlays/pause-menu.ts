import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
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
      <button type="button" class="btn" (click)="save()">{{ text.save }}</button>
      <button type="button" class="btn" (click)="toTitle()">{{ text.toTitle }}</button>
      @if (message(); as m) {
        <p role="status">{{ m }}</p>
      }
    </section>
  `,
  styles: `
    .menu { display: flex; flex-direction: column; gap: 0.6em; max-width: 18em; text-align: center; }
  `,
})
export class PauseMenu {
  private readonly engine = inject(GameEngine);
  private readonly router = inject(Router);
  protected readonly overlay = inject(OverlayService);
  protected readonly text = TEXT;
  protected readonly message = signal<string | null>(null);

  protected save(): void {
    this.message.set(this.engine.saveGame() ? TEXT.saved : TEXT.saveFailed);
  }

  protected toTitle(): void {
    this.engine.saveGame();
    void this.router.navigate(['/']);
  }
}
