import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

  protected newGame(): void {
    this.state.newGame();
    void this.router.navigate(['/game']);
  }

  protected continueGame(): void {
    if (this.state.load()) void this.router.navigate(['/game']);
  }
}
