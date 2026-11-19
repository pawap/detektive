import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CASES, findCase } from '../../core/data/cases';
import { CaseDefinition } from '../../core/models/case.model';
import { GameStateService } from '../../core/services/game-state.service';
import { OverlayService } from '../../core/services/overlay.service';
import { TEXT } from '../../core/texts';

/** Case selection, opened from the case board in the kids' room. */
@Component({
  selector: 'app-case-board',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="panel" role="dialog" aria-labelledby="case-board-title">
      <h2 id="case-board-title">{{ text.caseBoardTitle }}</h2>
      @for (c of cases; track c.id) {
        @if (state.isCaseUnlocked(c)) {
          <article class="case" [class.active]="state.activeCaseId() === c.id">
            <h3>{{ c.title }}</h3>
            <p>{{ c.summary }}</p>
            @if (state.activeCaseId() === c.id) {
              <strong>{{ text.activeCase }}</strong>
            } @else if (state.solvedCases().includes(c.id)) {
              <strong>{{ text.solvedCase }}</strong>
            } @else {
              <button type="button" class="btn" (click)="state.startCase(c.id)">{{ text.acceptCase }}</button>
            }
          </article>
        } @else {
          <article class="case locked">
            <h3>{{ text.lockedCaseTitle }}</h3>
            <p>{{ text.lockedCase(requiredTitles(c)) }}</p>
          </article>
        }
      } @empty {
        <p class="empty">{{ text.noCases }}</p>
      }
      <div class="actions">
        <button type="button" class="btn" (click)="overlay.close()">{{ text.close }}</button>
      </div>
    </section>
  `,
  styles: `
    .case { border: 2px dashed var(--ink); border-radius: 8px; padding: 0.5em 0.8em; margin-bottom: 0.6em; }
    .case.active { background: var(--highlight); }
    .case.locked { opacity: 0.6; }
    .case h3 { margin: 0 0 0.3em; }
  `,
})
export class CaseBoard {
  protected readonly state = inject(GameStateService);
  protected readonly overlay = inject(OverlayService);
  protected readonly cases = CASES;
  protected readonly text = TEXT;

  protected requiredTitles(c: CaseDefinition): string {
    return (c.requires ?? []).map((id) => `„${findCase(id)?.title ?? id}“`).join(' und ');
  }
}
