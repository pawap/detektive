import { DestroyRef, Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { HOME_SCENE_ID, SAVE_KEY } from '../config';
import { findCase } from '../data/cases';
import { CaseDefinition } from '../models/case.model';
import { isCharacterId } from '../data/characters';
import { CharacterId, Facing } from '../models/character.model';

export type FlagValue = boolean | number | string;

export interface PartyPosition {
  x: number;
  y: number;
  facing: Facing;
}

export interface SaveData {
  version: 1;
  savedAt: string;
  sceneId: string;
  /** null = the scene's default spawn. */
  position: PartyPosition | null;
  activeCharacter: CharacterId;
  flags: Record<string, FlagValue>;
  inventory: string[];
  clues: string[];
  activeCaseId: string | null;
  solvedCases: string[];
}

/** Condition prefix for "this case is solved" (see {@link GameStateService.isSet}). */
export const SOLVED_PREFIX = 'solved:';

const FACINGS: readonly Facing[] = ['up', 'down', 'left', 'right'];

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

const isFlagRecord = (value: unknown): value is Record<string, FlagValue> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((v) => ['boolean', 'number', 'string'].includes(typeof v));

/**
 * The persistent progress of a playthrough.
 *
 * While a game is in progress every change to the progress signals is written
 * to localStorage automatically (plus the party position when the page is
 * hidden or closed), so a reload or closed tab never loses progress.
 */
@Injectable({ providedIn: 'root' })
export class GameStateService {
  /** True once a game was started or loaded; autosave only runs while true. */
  readonly inProgress = signal(false);
  /** False when the last write to localStorage failed (e.g. storage blocked/full). */
  readonly storageOk = signal(true);

  readonly sceneId = signal(HOME_SCENE_ID);
  /** Where the leader stands; null = the scene's default spawn. */
  readonly leaderPosition = signal<PartyPosition | null>(null);
  readonly activeCharacter = signal<CharacterId>('leah');
  readonly flags = signal<Readonly<Record<string, FlagValue>>>({});
  readonly inventory = signal<readonly string[]>([]);
  readonly clues = signal<readonly string[]>([]);
  readonly activeCaseId = signal<string | null>(null);
  readonly solvedCases = signal<readonly string[]>([]);

  readonly activeCase = computed(() => findCase(this.activeCaseId()));

  /** Supplies the live party position while the world is running (set by the engine). */
  private positionSource: (() => PartyPosition) | null = null;

  constructor() {
    // Autosave whenever progress changes.
    effect(() => {
      if (!this.inProgress()) return;
      this.sceneId();
      this.activeCharacter();
      this.flags();
      this.inventory();
      this.clues();
      this.activeCaseId();
      this.solvedCases();
      untracked(() => this.persist());
    });

    // Capture the current position when the tab is hidden, reloaded or closed.
    if (typeof window !== 'undefined') {
      const flush = () => {
        if (this.inProgress()) this.persist();
      };
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') flush();
      };
      window.addEventListener('pagehide', flush);
      document.addEventListener('visibilitychange', onVisibility);
      inject(DestroyRef).onDestroy(() => {
        window.removeEventListener('pagehide', flush);
        document.removeEventListener('visibilitychange', onVisibility);
      });
    }
  }

  /** Restores the saved game (if any) at app start, so a reload continues where it left off. */
  restore(): void {
    this.load();
  }

  /** Lets the running engine report the live party position for saves; null to detach. */
  trackPosition(source: (() => PartyPosition) | null): void {
    this.positionSource = source;
  }

  /** Starts over and immediately replaces any previous save. */
  newGame(): void {
    this.sceneId.set(HOME_SCENE_ID);
    this.leaderPosition.set(null);
    this.activeCharacter.set('leah');
    this.flags.set({});
    this.inventory.set([]);
    this.clues.set([]);
    this.activeCaseId.set(null);
    this.solvedCases.set([]);
    this.inProgress.set(true);
    this.persist();
  }

  // --- Flags, items, clues, cases -------------------------------------------

  flag(key: string): FlagValue | undefined {
    return this.flags()[key];
  }

  setFlag(key: string, value: FlagValue): void {
    this.flags.update((flags) => ({ ...flags, [key]: value }));
  }

  /** True if a condition holds: `solved:<caseId>` checks a case, anything else is a flag. */
  isSet(condition: string): boolean {
    if (condition.startsWith(SOLVED_PREFIX)) {
      return this.solvedCases().includes(condition.slice(SOLVED_PREFIX.length));
    }
    return !!this.flags()[condition];
  }

  hasItem(id: string): boolean {
    return this.inventory().includes(id);
  }

  addItem(id: string): void {
    if (!this.hasItem(id)) this.inventory.update((items) => [...items, id]);
  }

  removeItem(id: string): void {
    this.inventory.update((items) => items.filter((i) => i !== id));
  }

  hasClue(id: string): boolean {
    return this.clues().includes(id);
  }

  addClue(id: string): void {
    if (!this.hasClue(id)) this.clues.update((clues) => [...clues, id]);
  }

  /** A case is available once all the cases it requires are solved. */
  isCaseUnlocked(caseDef: CaseDefinition): boolean {
    return (caseDef.requires ?? []).every((id) => this.solvedCases().includes(id));
  }

  /** Makes a case active; ignored for unknown or still locked cases. */
  startCase(id: string): void {
    const caseDef = findCase(id);
    if (caseDef && this.isCaseUnlocked(caseDef)) this.activeCaseId.set(id);
  }

  solveCase(id: string): void {
    if (!this.solvedCases().includes(id)) this.solvedCases.update((s) => [...s, id]);
    if (this.activeCaseId() === id) this.activeCaseId.set(null);
  }

  // --- Persistence ------------------------------------------------------------

  hasSave(): boolean {
    return this.readSave() !== null;
  }

  /** Writes the current progress; uses the live position if the engine is running. */
  persist(): boolean {
    const position = this.positionSource?.() ?? this.leaderPosition();
    if (position) this.leaderPosition.set(position);
    return this.write(position);
  }

  private write(position: PartyPosition | null): boolean {
    const data: SaveData = {
      version: 1,
      savedAt: new Date().toISOString(),
      sceneId: this.sceneId(),
      position,
      activeCharacter: this.activeCharacter(),
      flags: { ...this.flags() },
      inventory: [...this.inventory()],
      clues: [...this.clues()],
      activeCaseId: this.activeCaseId(),
      solvedCases: [...this.solvedCases()],
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      this.storageOk.set(true);
      return true;
    } catch {
      this.storageOk.set(false);
      return false;
    }
  }

  load(): boolean {
    const data = this.readSave();
    if (!data) return false;
    this.sceneId.set(data.sceneId);
    this.leaderPosition.set(data.position);
    this.activeCharacter.set(data.activeCharacter);
    this.flags.set(data.flags);
    this.inventory.set(data.inventory);
    this.clues.set(data.clues);
    this.activeCaseId.set(data.activeCaseId);
    this.solvedCases.set(data.solvedCases);
    this.inProgress.set(true);
    return true;
  }

  deleteSave(): void {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // storage unavailable – nothing to delete
    }
  }

  private readSave(): SaveData | null {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as Partial<SaveData>;
      const position = data.position;
      const validPosition =
        position === null ||
        (typeof position?.x === 'number' &&
          typeof position?.y === 'number' &&
          FACINGS.includes(position.facing));
      const valid =
        data.version === 1 &&
        typeof data.sceneId === 'string' &&
        validPosition &&
        isCharacterId(data.activeCharacter) &&
        isFlagRecord(data.flags) &&
        isStringArray(data.inventory) &&
        isStringArray(data.clues) &&
        (data.activeCaseId === null || typeof data.activeCaseId === 'string') &&
        isStringArray(data.solvedCases);
      return valid ? (data as SaveData) : null;
    } catch {
      return null;
    }
  }
}
