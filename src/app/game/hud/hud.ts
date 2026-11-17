import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CHARACTERS } from '../../core/data/characters';
import { CharacterId } from '../../core/models/character.model';
import { GameStateService } from '../../core/services/game-state.service';
import { OverlayService } from '../../core/services/overlay.service';
import { TEXT } from '../../core/texts';
import { CharacterPreview } from '../character-preview/character-preview';
import { GameEngine } from '../engine/game-engine';

/**
 * Party portraits, location, interaction hint and menu buttons.
 * Buttons don't take focus so the keyboard keeps controlling the game.
 */
@Component({
  selector: 'app-hud',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CharacterPreview],
  templateUrl: './hud.html',
  styleUrl: './hud.scss',
})
export class Hud {
  protected readonly engine = inject(GameEngine);
  protected readonly state = inject(GameStateService);
  protected readonly overlay = inject(OverlayService);
  protected readonly characters = CHARACTERS;
  protected readonly text = TEXT;

  protected select(id: CharacterId): void {
    this.engine.setActiveCharacter(id);
  }
}
