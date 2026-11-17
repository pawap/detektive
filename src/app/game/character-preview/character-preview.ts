import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, input, viewChild } from '@angular/core';
import { getCharacter } from '../../core/data/characters';
import { CharacterId } from '../../core/models/character.model';
import { BASE_CHARACTER_HEIGHT, characterMetrics, drawCharacter } from '../render/character-sprite';

/** Pixel density of the preview canvas (crisper on HiDPI screens). */
const DENSITY = 2;

/**
 * Draws a sibling with the in-game sprite renderer: either a head-and-shoulders
 * portrait or the full body (all siblings at the same scale, so their heights compare).
 */
@Component({
  selector: 'app-character-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas
    #canvas
    [width]="size() * density"
    [height]="size() * density"
    [style.width.px]="size()"
    [style.height.px]="size()"
    [attr.aria-label]="character().name"
    role="img"
  ></canvas>`,
  styles: `
    :host { display: inline-block; line-height: 0; }
  `,
})
export class CharacterPreview {
  readonly characterId = input.required<CharacterId>();
  readonly mode = input<'portrait' | 'full'>('portrait');
  readonly size = input(48);

  protected readonly density = DENSITY;
  protected readonly character = computed(() => getCharacter(this.characterId()));
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    afterRenderEffect(() => {
      const ctx = this.canvas().nativeElement.getContext('2d');
      if (!ctx) return;
      const look = this.character().appearance;
      const s = this.size() * DENSITY;
      ctx.clearRect(0, 0, s, s);

      if (this.mode() === 'full') {
        const scale = (s * 0.88) / BASE_CHARACTER_HEIGHT;
        drawCharacter(ctx, look, s / 2, s * 0.96, 'down', 0, scale);
      } else {
        // Same head size for everyone, head centred slightly above middle
        const scale = (s * 0.3) / characterMetrics(look).headRadius;
        const { height, headRadius } = characterMetrics(look, scale);
        drawCharacter(ctx, look, s / 2, s * 0.5 + height - headRadius, 'down', 0, scale);
      }
    });
  }
}
