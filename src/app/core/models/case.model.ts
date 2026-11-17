import type { GameStateService } from '../services/game-state.service';
import { DialogueLine } from './dialogue.model';
import { SceneDefinition } from './scene.model';

export interface ClueDefinition {
  id: string;
  title: string;
  description: string;
}

/** What a case's scripted event handler can do. */
export interface CaseEventContext {
  state: GameStateService;
  say(lines: DialogueLine[], onDone?: () => void): void;
  goTo(sceneId: string, spawn?: string): void;
}

export type CaseEventHandler = (ctx: CaseEventContext) => void;

/**
 * A detective case (one adventure). Every case starts at home: the siblings
 * accept it at the case board and leave through the garden gate, which takes
 * them to `firstSceneId`.
 */
export interface CaseDefinition {
  id: string;
  title: string;
  summary: string;
  firstSceneId: string;
  /** Scenes that belong to this case (registered automatically). */
  scenes: SceneDefinition[];
  clues: ClueDefinition[];
  /** Handlers for `{ kind: 'event' }` interactions, keyed by eventId. */
  events?: Record<string, CaseEventHandler>;
}
