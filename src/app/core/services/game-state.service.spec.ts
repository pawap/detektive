import { TestBed } from '@angular/core/testing';
import { HOME_SCENE_ID, SAVE_KEY } from '../config';
import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
  let state: GameStateService;

  const stored = () => JSON.parse(localStorage.getItem(SAVE_KEY)!);

  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    state = TestBed.inject(GameStateService);
  });

  it('does not create a save before a game is started', () => {
    TestBed.tick();
    expect(state.inProgress()).toBe(false);
    expect(state.hasSave()).toBe(false);
  });

  it('starts a new game at home with Leah leading and saves it right away', () => {
    state.newGame();
    expect(state.sceneId()).toBe(HOME_SCENE_ID);
    expect(state.activeCharacter()).toBe('leah');
    expect(state.hasSave()).toBe(true);
  });

  it('replaces an existing save when a new game starts', () => {
    state.newGame();
    state.addClue('footprint');
    state.persist();
    state.newGame();
    expect(stored().clues).toEqual([]);
  });

  it('autosaves progress changes', () => {
    state.newGame();
    state.addClue('footprint');
    state.setFlag('metNeighbour', true);
    TestBed.tick();
    expect(stored().clues).toEqual(['footprint']);
    expect(stored().flags).toEqual({ metNeighbour: true });
  });

  it('restores the save at startup so a reload continues the game', () => {
    state.newGame();
    state.sceneId.set('garden');
    state.persist();

    TestBed.resetTestingModule();
    const fresh = TestBed.inject(GameStateService);
    expect(fresh.inProgress()).toBe(false);
    fresh.restore();
    expect(fresh.inProgress()).toBe(true);
    expect(fresh.sceneId()).toBe('garden');
  });

  it('ignores saves with invalid flags', () => {
    state.newGame();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ ...stored(), flags: undefined }));
    expect(state.hasSave()).toBe(false);
  });

  it('round-trips progress through save and load', () => {
    state.newGame();
    state.sceneId.set('garden');
    state.activeCharacter.set('nino');
    state.setFlag('metNeighbour', true);
    state.addItem('magnifier');
    state.addClue('footprint');
    state.trackPosition(() => ({ x: 3, y: 4, facing: 'left' }));
    expect(state.persist()).toBe(true);
    state.trackPosition(null);

    // Simulate a page reload: a fresh service reads the save back.
    TestBed.resetTestingModule();
    state = TestBed.inject(GameStateService);
    expect(state.load()).toBe(true);
    expect(state.sceneId()).toBe('garden');
    expect(state.activeCharacter()).toBe('nino');
    expect(state.flag('metNeighbour')).toBe(true);
    expect(state.hasItem('magnifier')).toBe(true);
    expect(state.hasClue('footprint')).toBe(true);
    expect(state.leaderPosition()).toEqual({ x: 3, y: 4, facing: 'left' });
  });

  it('ignores corrupt save data', () => {
    localStorage.setItem(SAVE_KEY, '{"version":1,"sceneId":42}');
    expect(state.hasSave()).toBe(false);
    expect(state.load()).toBe(false);
  });

  it('does not duplicate clues or items', () => {
    state.newGame();
    state.addClue('a');
    state.addClue('a');
    state.addItem('b');
    state.addItem('b');
    expect(state.clues()).toEqual(['a']);
    expect(state.inventory()).toEqual(['b']);
  });
});
