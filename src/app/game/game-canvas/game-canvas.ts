import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, inject, viewChild } from '@angular/core';
import { GameEngine } from '../engine/game-engine';

/** The canvas the world is drawn on; hands it to the engine once rendered. */
@Component({
  selector: 'app-game-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host, canvas { display: block; width: 100%; height: 100%; }
    canvas { image-rendering: pixelated; }
  `,
})
export class GameCanvas {
  private readonly engine = inject(GameEngine);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterNextRender(() => this.engine.start(this.canvas().nativeElement));
  }
}
