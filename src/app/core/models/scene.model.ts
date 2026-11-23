import { CharacterAppearance, Facing } from './character.model';
import { DialogueLine } from './dialogue.model';

export type TilePattern =
  | 'plain'
  | 'wood'
  | 'checker'
  | 'carpet'
  | 'grass'
  | 'path'
  | 'water'
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
  /**
   * Run a scripted handler from the active case (see CaseDefinition.events),
   * or from `caseId` if given.
   */
  | { kind: 'event'; eventId: string; caseId?: string }
  /**
   * Poke something just for fun: the sprite plays its reaction animation and a
   * comic sound bubble pops up. Each poke shows the next reaction (cycling);
   * reactions with `lines` also open a short dialogue.
   */
  | { kind: 'poke'; reactions: PokeReaction[] };

export interface PokeReaction {
  /** Onomatopoeia shown in a bubble above the object, e.g. „MIAU!“. */
  bubble: string;
  lines?: DialogueLine[];
}

/** Scene-wide background animation drawn over the map. */
export type Ambience = 'leaves' | 'gusts' | 'dust' | 'bubbles';

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
  | 'box'
  | 'person'
  | 'pedestal'
  | 'pedestalWithChest'
  | 'display'
  | 'window'
  | 'painting'
  | 'feather'
  | 'parrot'
  | 'boat'
  | 'boots'
  | 'barrel'
  | 'pralineBox'
  | 'pralineBoxFull'
  | 'slide'
  | 'swing'
  | 'sign'
  | 'chocolateVat'
  | 'conveyor'
  | 'computerDesk'
  | 'computerDeskCrumbs'
  // Lively details (animated; see render/critter-sprites.ts)
  | 'cat'
  | 'dog'
  | 'fishbowl'
  | 'sink'
  | 'radio'
  | 'cuckooClock'
  | 'birdBath'
  | 'butterflies'
  | 'bees'
  | 'windChime'
  | 'shipBell'
  | 'mouse'
  | 'seagull'
  | 'jumpingFish'
  | 'buoy'
  | 'flag'
  | 'crab'
  | 'hamster'
  | 'xylophone'
  | 'pigeons'
  | 'squirrel'
  | 'bicycle'
  | 'steamWhistle'
  | 'chocolateFountain'
  | 'coffeeMachine'
  | 'printer'
  | 'fan';

/** Look of a non-player character drawn with the `person` sprite. */
export interface NpcLook extends CharacterAppearance {
  hat?: 'captain' | 'guard' | 'beret' | 'bun' | 'chef';
  beard?: string;
}

export interface SceneObject extends Rect {
  id: string;
  label: string;
  sprite: ObjectSprite;
  solid: boolean;
  /** Optional main colour override for the sprite. */
  color?: string;
  /** Required for the `person` sprite. */
  npc?: NpcLook;
  /** Which way a `person` looks (default: down). */
  facing?: Facing;
  interaction?: Interaction;
  /** Only present while this condition holds (a game-state flag, or `solved:<caseId>`). */
  showIf?: string;
  /** Removed from the scene once this condition holds (a game-state flag, or `solved:<caseId>`). */
  hideIf?: string;
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
  /** Background animations (wind-blown leaves, dust motes, …). */
  ambience?: Ambience[];
}
