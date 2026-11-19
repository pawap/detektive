import type { GameStateService } from '../services/game-state.service';
import { DialogueLine } from './dialogue.model';
import { SceneDefinition, SceneObject } from './scene.model';

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
  /**
   * A little cutscene: the person `objectId` in the current scene walks from
   * `from[0]` through the other waypoints (object coordinates, in tiles) to
   * its own position. The game waits meanwhile; `onDone` runs on arrival
   * (right away if the object isn't visible).
   */
  walk(objectId: string, from: { x: number; y: number }[], onDone?: () => void): void;
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
  /** Ids of cases that must be solved before this one shows up on the case board. */
  requires?: string[];
  /** Scenes that belong to this case (registered automatically). */
  scenes: SceneDefinition[];
  /**
   * Objects this case places into scenes it does not own, keyed by scene id
   * (e.g. people at home). Their `event` interactions run this case's handlers.
   */
  extraObjects?: Record<string, SceneObject[]>;
  clues: ClueDefinition[];
  /** Handlers for `{ kind: 'event' }` interactions, keyed by eventId. */
  events?: Record<string, CaseEventHandler>;
}
