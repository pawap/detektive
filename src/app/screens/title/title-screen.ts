import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CHARACTERS } from '../../core/data/characters';
import { GameStateService } from '../../core/services/game-state.service';
import { TEXT } from '../../core/texts';
import { CharacterPreview } from '../../game/character-preview/character-preview';

@Component({
  selector: 'app-title-screen',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CharacterPreview],
  templateUrl: './title-screen.html',
  styleUrl: './title-screen.scss',
})
export class TitleScreen {
  private readonly state = inject(GameStateService);
  private readonly router = inject(Router);

  protected readonly text = TEXT;
  protected readonly characters = CHARACTERS;
  protected readonly hasSave = this.state.hasSave();
  /** Asking before a new game replaces the existing save. */
  protected readonly confirmingNewGame = signal(false);

  protected newGame(): void {
    if (this.hasSave && !this.confirmingNewGame()) {
      this.confirmingNewGame.set(true);
      return;
    }
    this.state.newGame();
    void this.router.navigate(['/game']);
  }

  protected continueGame(): void {
    if (this.state.load()) void this.router.navigate(['/game']);
  }
}
