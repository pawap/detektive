import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CASES } from '../../core/data/cases';
import { CHARACTERS } from '../../core/data/characters';
import { GameStateService } from '../../core/services/game-state.service';
import { OverlayService } from '../../core/services/overlay.service';
import { TEXT } from '../../core/texts';
import { CharacterPreview } from '../character-preview/character-preview';

/** The agency's notebook: investigators, active case and collected clues. */
@Component({
  selector: 'app-notebook',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CharacterPreview],
  template: `
    <section class="panel" role="dialog" aria-labelledby="notebook-title">
      <h2 id="notebook-title">{{ text.notebook }}</h2>

      <h3>{{ text.investigators }}</h3>
      <ul class="team">
        @for (c of characters; track c.id) {
          <li>
            <app-character-preview [characterId]="c.id" [size]="44" />
            <span>
              <strong>{{ c.name }}</strong><br />
              {{ text.yearsOld(c.age) }}
            </span>
          </li>
        }
      </ul>

      <h3>{{ text.activeCase }}</h3>
      <p>{{ state.activeCase()?.title ?? text.noActiveCase }}</p>

      <h3>{{ text.clues }}</h3>
      @for (clue of clues(); track clue.id) {
        <p>
          <strong>{{ clue.title }}</strong> – {{ clue.description }}
        </p>
      } @empty {
        <p class="empty">{{ text.noClues }}</p>
      }

      <div class="actions">
        <button type="button" class="btn" (click)="overlay.close()">{{ text.close }}</button>
      </div>
    </section>
  `,
  styles: `
    .team { list-style: none; padding: 0; margin: 0; display: flex; gap: 1.2em; flex-wrap: wrap; }
    .team li { display: flex; align-items: center; gap: 0.5em; }
    .team app-character-preview { border-radius: 50%; overflow: hidden; background: #cfe3f5; }
  `,
})
export class Notebook {
  protected readonly state = inject(GameStateService);
  protected readonly overlay = inject(OverlayService);
  protected readonly characters = CHARACTERS;
  protected readonly text = TEXT;

  protected readonly clues = computed(() => {
    const all = CASES.flatMap((c) => c.clues);
    return this.state
      .clues()
      .map((id) => all.find((clue) => clue.id === id))
      .filter((clue) => clue !== undefined);
  });
}
