import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { OverlayService } from '../../core/services/overlay.service';
import { DialogueBox } from '../../game/dialogue-box/dialogue-box';
import { GameEngine } from '../../game/engine/game-engine';
import { GameCanvas } from '../../game/game-canvas/game-canvas';
import { Hud } from '../../game/hud/hud';
import { CaseBoard } from '../../game/overlays/case-board';
import { Notebook } from '../../game/overlays/notebook';
import { PauseMenu } from '../../game/overlays/pause-menu';

/** The in-game screen: world canvas with HUD, dialogue and overlay panels on top. */
@Component({
  selector: 'app-game-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [GameEngine],
  imports: [GameCanvas, Hud, DialogueBox, CaseBoard, Notebook, PauseMenu],
  template: `
    <div class="stage">
      <app-game-canvas />
      <app-hud />
      <app-dialogue-box />
      @if (overlay.active(); as kind) {
        <div class="backdrop">
          @switch (kind) {
            @case ('caseBoard') { <app-case-board /> }
            @case ('notebook') { <app-notebook /> }
            @case ('menu') { <app-pause-menu /> }
          }
        </div>
      }
    </div>
  `,
  styles: `
    :host { display: grid; place-items: center; height: 100dvh; background: var(--night); }
    .stage {
      position: relative;
      width: min(100vw, calc(100dvh * 640 / 384));
      aspect-ratio: 640 / 384;
      overflow: hidden;
      box-shadow: 0 0 40px rgba(0, 0, 0, 0.6);
    }
    .backdrop {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      background: rgba(20, 16, 28, 0.55);
      overflow: auto;
    }
  `,
})
export class GameScreen {
  protected readonly overlay = inject(OverlayService);
}
