import { Injectable, computed, signal } from '@angular/core';
import { HOME_SCENE_ID, SAVE_KEY } from '../config';
import { findCase } from '../data/cases';
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
  position: PartyPosition;
  activeCharacter: CharacterId;
  flags: Record<string, FlagValue>;
  inventory: string[];
  clues: string[];
  activeCaseId: string | null;
  solvedCases: string[];
}

/** The persistent progress of a playthrough. */
@Injectable({ providedIn: 'root' })
export class GameStateService {
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

  newGame(): void {
    this.sceneId.set(HOME_SCENE_ID);
    this.leaderPosition.set(null);
    this.activeCharacter.set('leah');
    this.flags.set({});
    this.inventory.set([]);
    this.clues.set([]);
    this.activeCaseId.set(null);
    this.solvedCases.set([]);
  }

  // --- Flags, items, clues, cases -------------------------------------------

  flag(key: string): FlagValue | undefined {
    return this.flags()[key];
  }

  setFlag(key: string, value: FlagValue): void {
    this.flags.update((flags) => ({ ...flags, [key]: value }));
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

  startCase(id: string): void {
    this.activeCaseId.set(id);
  }

  solveCase(id: string): void {
    if (!this.solvedCases().includes(id)) this.solvedCases.update((s) => [...s, id]);
    if (this.activeCaseId() === id) this.activeCaseId.set(null);
  }

  // --- Persistence ------------------------------------------------------------

  hasSave(): boolean {
    return this.readSave() !== null;
  }

  save(position: PartyPosition): boolean {
    this.leaderPosition.set(position);
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
      return true;
    } catch {
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
      const valid =
        data.version === 1 &&
        typeof data.sceneId === 'string' &&
        typeof data.position?.x === 'number' &&
        typeof data.position?.y === 'number' &&
        isCharacterId(data.activeCharacter) &&
        Array.isArray(data.inventory) &&
        Array.isArray(data.clues) &&
        Array.isArray(data.solvedCases);
      return valid ? (data as SaveData) : null;
    } catch {
      return null;
    }
  }
}
