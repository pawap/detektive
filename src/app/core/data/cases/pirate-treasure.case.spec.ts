import { TestBed } from '@angular/core/testing';
import { CaseEventContext } from '../../models/case.model';
import { DialogueLine } from '../../models/dialogue.model';
import { GameStateService } from '../../services/game-state.service';
import { PIRATE_TREASURE_CASE } from './pirate-treasure.case';

describe('Der Schatz von Käpt’n Klabauter', () => {
  let state: GameStateService;
  let lastLines: DialogueLine[];

  /** Runs an event and immediately "reads" its dialogue to the end. */
  const run = (eventId: string) => {
    const ctx: CaseEventContext = {
      state,
      say: (lines, onDone) => {
        lastLines = lines;
        onDone?.();
      },
      goTo: () => undefined,
      walk: (_id, _from, onDone) => onDone?.(),
    };
    PIRATE_TREASURE_CASE.events![eventId](ctx);
  };

  beforeEach(() => {
    state = TestBed.inject(GameStateService);
    state.newGame();
    state.startCase(PIRATE_TREASURE_CASE.id);
  });

  it('only lets Nino reach the gold foil under the bench', () => {
    run('inspectBench');
    expect(state.hasClue('pirate.foil')).toBe(false);
    state.activeCharacter.set('nino');
    run('inspectBench');
    expect(state.hasClue('pirate.foil')).toBe(true);
  });

  it('keeps Kuddel quiet until all evidence is collected', () => {
    run('talkKuddel');
    expect(state.flag('pirate.confessed')).toBeUndefined();
    expect(lastLines.at(-1)!.text).toContain('0 von 6');
    run('inspectBoat');
    expect(state.flag('pirate.chestFound')).toBeUndefined();
  });

  it('can be played from start to finish', () => {
    run('talkDirector');
    run('inspectPedestal');
    run('inspectFeather');
    run('talkGuard');
    state.activeCharacter.set('nino');
    run('inspectBench');
    run('talkDirector');
    expect(state.hasClue('pirate.chocolate')).toBe(true);
    run('inspectBoots');
    run('talkParrot');
    run('talkKuddel');
    expect(state.flag('pirate.confessed')).toBe(true);
    run('inspectBoat');
    expect(state.hasItem('pirate.chest')).toBe(true);
    run('talkDirector');

    expect(state.solvedCases()).toContain(PIRATE_TREASURE_CASE.id);
    expect(state.activeCaseId()).toBeNull();
    expect(state.flag('pirate.chestReturned')).toBe(true);
    expect(state.hasItem('pirate.chest')).toBe(false);
    for (const clue of PIRATE_TREASURE_CASE.clues) expect(state.hasClue(clue.id), clue.id).toBe(true);
  });
});
