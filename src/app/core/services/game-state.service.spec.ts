import { TestBed } from '@angular/core/testing';
import { HOME_SCENE_ID, SAVE_KEY } from '../config';
import { GameStateService } from './game-state.service';

describe('GameStateService', () => {
  let state: GameStateService;

  beforeEach(() => {
    localStorage.removeItem(SAVE_KEY);
    state = TestBed.inject(GameStateService);
    state.newGame();
  });

  it('starts a new game at home with Leah leading', () => {
    expect(state.sceneId()).toBe(HOME_SCENE_ID);
    expect(state.activeCharacter()).toBe('leah');
    expect(state.hasSave()).toBe(false);
  });

  it('round-trips progress through save and load', () => {
    state.sceneId.set('garden');
    state.activeCharacter.set('nino');
    state.setFlag('metNeighbour', true);
    state.addItem('magnifier');
    state.addClue('footprint');
    expect(state.save({ x: 3, y: 4, facing: 'left' })).toBe(true);

    state.newGame();
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
    state.addClue('a');
    state.addClue('a');
    state.addItem('b');
    state.addItem('b');
    expect(state.clues()).toEqual(['a']);
    expect(state.inventory()).toEqual(['b']);
  });
});
