import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { isCharacterId, getCharacter } from '../../core/data/characters';
import { DialogueService } from '../../core/services/dialogue.service';
import { CharacterPreview } from '../character-preview/character-preview';

/** Shows the current dialogue line; click or press E/Space to continue. */
@Component({
  selector: 'app-dialogue-box',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CharacterPreview],
  template: `
    @if (dialogue.current(); as line) {
      <div class="box" (click)="dialogue.advance()">
        @if (speakerCharacter(); as c) {
          <app-character-preview class="portrait" [characterId]="c.id" [size]="64" />
        }
        <div class="content">
          @if (speakerName(); as name) {
            <div class="name">{{ name }}</div>
          }
          <p [class.narration]="!speakerName()">{{ line.text }}</p>
        </div>
        <span class="more" aria-hidden="true">▼</span>
      </div>
    }
  `,
  styleUrl: './dialogue-box.scss',
})
export class DialogueBox {
  protected readonly dialogue = inject(DialogueService);

  protected readonly speakerCharacter = computed(() => {
    const speaker = this.dialogue.current()?.speaker;
    return isCharacterId(speaker) ? getCharacter(speaker) : null;
  });

  protected readonly speakerName = computed(
    () => this.speakerCharacter()?.name ?? this.dialogue.current()?.speaker ?? null,
  );
}
