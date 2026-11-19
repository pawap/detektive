import { TestBed } from '@angular/core/testing';
import { CaseEventContext } from '../../models/case.model';
import { DialogueLine } from '../../models/dialogue.model';
import { GameStateService } from '../../services/game-state.service';
import { LOST_PRALINES_CASE } from './lost-pralines.case';
import { PIRATE_TREASURE_CASE } from './pirate-treasure.case';

describe('Der Fall der verlorenen Pralinen', () => {
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
    };
    LOST_PRALINES_CASE.events![eventId](ctx);
  };

  beforeEach(() => {
    state = TestBed.inject(GameStateService);
    state.newGame();
  });

  it('stays locked until the pirate case is solved', () => {
    expect(state.isCaseUnlocked(LOST_PRALINES_CASE)).toBe(false);
    state.startCase(LOST_PRALINES_CASE.id);
    expect(state.activeCaseId()).toBeNull();

    state.solveCase(PIRATE_TREASURE_CASE.id);
    expect(state.isCaseUnlocked(LOST_PRALINES_CASE)).toBe(true);
  });

  it('shows Mama at home only after the pirate case', () => {
    const mama = LOST_PRALINES_CASE.extraObjects!['house'].find((o) => o.id === 'mama')!;
    expect(state.isSet(mama.showIf!)).toBe(false);
    state.solveCase(PIRATE_TREASURE_CASE.id);
    expect(state.isSet(mama.showIf!)).toBe(true);
  });

  it('starts the case when Mama tells her story', () => {
    state.solveCase(PIRATE_TREASURE_CASE.id);
    run('talkMama');
    expect(state.activeCaseId()).toBe(LOST_PRALINES_CASE.id);
    expect(state.hasClue('pralines.story')).toBe(true);
  });

  it('needs the right sibling for Mo, the slide and the order book', () => {
    state.solveCase(PIRATE_TREASURE_CASE.id);
    run('talkMama');
    run('talkMo');
    expect(state.hasClue('pralines.tip')).toBe(false);
    state.activeCharacter.set('nino');
    run('talkMo');
    expect(state.hasClue('pralines.tip')).toBe(true);

    run('inspectSlide');
    expect(state.hasClue('pralines.paperCup')).toBe(false);
    state.activeCharacter.set('maja');
    run('inspectSlide');
    expect(state.hasClue('pralines.paperCup')).toBe(true);

    run('inspectOrderBook');
    expect(state.hasClue('pralines.orderBook')).toBe(false);
    state.activeCharacter.set('leah');
    run('inspectOrderBook');
    expect(state.hasClue('pralines.orderBook')).toBe(true);
  });

  it('keeps Papa quiet until all evidence is collected', () => {
    state.solveCase(PIRATE_TREASURE_CASE.id);
    run('talkMama');
    run('talkPapa');
    expect(state.hasClue('pralines.confession')).toBe(false);
    expect(lastLines.at(-1)!.text).toContain('0 von 3');
  });

  it('can be played from start to finish', () => {
    state.solveCase(PIRATE_TREASURE_CASE.id);
    run('talkMama');
    run('inspectBox');
    run('talkTeacher');
    state.activeCharacter.set('nino');
    run('talkMo');
    state.activeCharacter.set('maja');
    run('inspectSlide');
    run('talkOma');
    run('talkChocolatier');
    state.activeCharacter.set('leah');
    run('inspectOrderBook');
    run('inspectWorkbench');
    run('talkPapa');
    expect(state.hasClue('pralines.confession')).toBe(true);
    expect(state.solvedCases()).not.toContain(LOST_PRALINES_CASE.id);

    run('talkMama');
    expect(state.solvedCases()).toContain(LOST_PRALINES_CASE.id);
    expect(state.activeCaseId()).toBeNull();
    expect(state.flag('pralines.papaHome')).toBe(true);
    for (const clue of LOST_PRALINES_CASE.clues) expect(state.hasClue(clue.id), clue.id).toBe(true);
  });
});
