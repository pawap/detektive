import { Facing } from './character.model';
import { DialogueLine } from './dialogue.model';

export type TilePattern =
  | 'plain'
  | 'wood'
  | 'checker'
  | 'carpet'
  | 'grass'
  | 'path'
  | 'wall'
  | 'brick'
  | 'fence'
  | 'door';

export interface TileDefinition {
  solid: boolean;
  pattern: TilePattern;
  base: string;
  detail: string;
}

/** Rectangle in tile units. */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Interaction =
  /** Show a few lines of dialogue. */
  | { kind: 'dialogue'; lines: DialogueLine[] }
  /** Open the case board (case selection). */
  | { kind: 'caseBoard' }
  /** Leave home for the active case's first scene. */
  | { kind: 'departure' }
  /** Run a scripted handler from the active case (see CaseDefinition.events). */
  | { kind: 'event'; eventId: string };

export type ObjectSprite =
  | 'bed'
  | 'crib'
  | 'caseBoard'
  | 'desk'
  | 'chest'
  | 'counter'
  | 'fridge'
  | 'table'
  | 'sofa'
  | 'tv'
  | 'shelf'
  | 'plant'
  | 'rug'
  | 'coatRack'
  | 'tree'
  | 'bench'
  | 'mailbox'
  | 'gate'
  | 'flowers'
  | 'sandbox'
  | 'box';

export interface SceneObject extends Rect {
  id: string;
  label: string;
  sprite: ObjectSprite;
  solid: boolean;
  /** Optional main colour override for the sprite. */
  color?: string;
  interaction?: Interaction;
}

/** Walking into this zone switches to another scene. */
export interface SceneExit extends Rect {
  target: string;
  spawn: string;
}

export interface SpawnPoint {
  x: number;
  y: number;
  facing: Facing;
}

export interface SceneDefinition {
  id: string;
  name: string;
  /** One string per tile row; each character is a key of `tiles`. */
  map: string[];
  tiles: Record<string, TileDefinition>;
  /** Must contain at least the `start` spawn. */
  spawns: Record<string, SpawnPoint>;
  objects: SceneObject[];
  exits: SceneExit[];
  /** Colour drawn around the map when it is smaller than the viewport. */
  background: string;
}
