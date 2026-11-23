import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import {
  DEFAULT_SPAWN,
  FOLLOW_SPACING,
  HOME_SCENE_ID,
  TILE_SIZE as T,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  WALK_SPEED,
} from '../../core/config';
import { CASES, findCase } from '../../core/data/cases';
import { CHARACTERS, PARTY_ORDER } from '../../core/data/characters';
import { CharacterDefinition, CharacterId, Facing } from '../../core/models/character.model';
import { ACTIVE_SPEAKER, DialogueLine } from '../../core/models/dialogue.model';
import { Rect, SceneDefinition, SceneObject, SpawnPoint } from '../../core/models/scene.model';
import { DialogueService } from '../../core/services/dialogue.service';
import { GameStateService, PartyPosition } from '../../core/services/game-state.service';
import { InputService } from '../../core/services/input.service';
import { OverlayService } from '../../core/services/overlay.service';
import { SceneRegistry } from '../../core/services/scene-registry.service';
import { TEXT } from '../../core/texts';
import { drawAmbience } from '../render/ambience';
import { drawCharacter } from '../render/character-sprite';
import { ObjectAnim } from '../render/critter-sprites';
import {
  FLAT_SPRITES,
  drawFocusMarker,
  drawObject,
  drawSoundBubble,
} from '../render/object-sprites';
import { drawTiles, tileAt } from '../render/tile-renderer';

interface Actor {
  def: CharacterDefinition;
  x: number;
  y: number;
  facing: Facing;
  moving: boolean;
  walkTime: number;
}

interface Point {
  x: number;
  y: number;
}

/** Collision box around the feet, in tiles. */
const FOOT_HALF_WIDTH = 0.28;
const FOOT_HEIGHT = 0.3;

/** The leader's path is recorded as points this far apart (tiles). */
const TRAIL_STEP = 0.1;
const TRAIL_POINTS_PER_SLOT = Math.round(FOLLOW_SPACING / TRAIL_STEP);

const FADE_SECONDS = 0.25;

/** Walking speed of people in cutscenes (tiles per second). */
const CUTSCENE_WALK_SPEED = WALK_SPEED * 0.75;

/** A person walking along waypoints during a cutscene (see CaseEventContext.walk). */
interface Walker {
  objectId: string;
  x: number;
  y: number;
  facing: Facing;
  walkTime: number;
  /** Remaining waypoints; the last one is the object's own position. */
  path: Point[];
  onDone?: () => void;
}

/** How long a person pauses after turning towards the kids before talking (seconds). */
const TURN_PAUSE_SECONDS = 0.2;

/** How long a poke's sound bubble („MIAU!“) stays up (seconds). */
const BUBBLE_SECONDS = 1.4;

/** The last time an object was interacted with, for its reaction animation. */
interface Poke {
  at: number;
  count: number;
  bubble?: string;
}

const OPPOSITE_FACING: Record<Facing, Facing> = { up: 'down', down: 'up', left: 'right', right: 'left' };

const FACING_VECTORS: Record<Facing, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/**
 * Runs the 2D world: scene loading, movement & collision, the following
 * siblings, interactions and rendering. Provided per game screen.
 */
@Injectable()
export class GameEngine {
  private readonly state = inject(GameStateService);
  private readonly input = inject(InputService);
  private readonly dialogue = inject(DialogueService);
  private readonly overlay = inject(OverlayService);
  private readonly scenes = inject(SceneRegistry);

  /** Label of the object the leader can currently interact with. */
  readonly focusLabel = signal<string | null>(null);
  readonly sceneName = signal('');

  private ctx: CanvasRenderingContext2D | null = null;
  private scene!: SceneDefinition;
  private readonly actors = new Map<CharacterId, Actor>();
  private trail: Point[] = [];
  private focus: SceneObject | null = null;
  /** Prevents re-triggering the exit the party just arrived through. */
  private exitLocked = true;
  private frameHandle = 0;
  private lastTimestamp = 0;
  private time = 0;
  private transition: { phase: 'out' | 'in'; t: number; sceneId?: string; spawn?: string } | null = null;
  private walker: Walker | null = null;
  /** Which way scene people look after turning to talk; reset when the scene is entered. */
  private readonly turnedFacing = new Map<string, Facing>();
  /** A person who just turned towards the kids; the interaction runs once the pause is over. */
  private turning: { obj: SceneObject; t: number } | null = null;
  /** Objects interacted with during this scene visit (drives their reactions). */
  private readonly pokes = new Map<string, Poke>();

  constructor() {
    for (const def of CHARACTERS) {
      this.actors.set(def.id, { def, x: 0, y: 0, facing: 'down', moving: false, walkTime: 0 });
    }
    inject(DestroyRef).onDestroy(() => this.stop());
  }

  // --- Lifecycle ---------------------------------------------------------------

  start(canvas: HTMLCanvasElement): void {
    canvas.width = VIEW_WIDTH;
    canvas.height = VIEW_HEIGHT;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.input.enable();
    this.state.trackPosition(() => this.leaderPosition());
    this.enterScene(this.state.sceneId(), this.state.leaderPosition() ?? DEFAULT_SPAWN);
    this.transition = { phase: 'in', t: 0 };
    this.lastTimestamp = performance.now();
    this.frameHandle = requestAnimationFrame(this.tick);
  }

  stop(): void {
    if (this.ctx) {
      // Leaving the game screen: keep the exact spot before detaching.
      this.saveGame();
      this.state.trackPosition(null);
    }
    cancelAnimationFrame(this.frameHandle);
    this.ctx = null;
    this.input.disable();
    this.dialogue.close();
    this.overlay.close();
  }

  private readonly tick = (now: number) => {
    if (!this.ctx) return;
    const dt = Math.min(0.05, (now - this.lastTimestamp) / 1000);
    this.lastTimestamp = now;
    this.time += dt;
    this.update(dt);
    this.render(this.ctx);
    this.frameHandle = requestAnimationFrame(this.tick);
  };

  // --- Public API (HUD, overlays) -----------------------------------------------

  setActiveCharacter(id: CharacterId): void {
    if (id === this.state.activeCharacter()) return;
    this.state.activeCharacter.set(id);
    this.rebuildTrail();
  }

  cycleCharacter(): void {
    const index = PARTY_ORDER.indexOf(this.state.activeCharacter());
    this.setActiveCharacter(PARTY_ORDER[(index + 1) % PARTY_ORDER.length]);
  }

  interactWithFocus(): void {
    if (this.focus && !this.isPaused()) this.interact(this.focus);
  }

  saveGame(): boolean {
    return this.state.persist();
  }

  /** Fade out and move the party to another scene. */
  changeScene(sceneId: string, spawn: string = DEFAULT_SPAWN): void {
    this.transition = { phase: 'out', t: 0, sceneId, spawn };
  }

  /** Open dialogue, resolving the "active sibling" speaker placeholder. */
  say(lines: DialogueLine[], onDone?: () => void): void {
    const active = this.state.activeCharacter();
    this.dialogue.open(
      lines.map((l) => (l.speaker === ACTIVE_SPEAKER ? { ...l, speaker: active } : l)),
      onDone,
    );
  }

  // --- Update --------------------------------------------------------------------

  private get party(): Actor[] {
    const active = this.state.activeCharacter();
    return [active, ...PARTY_ORDER.filter((id) => id !== active)].map((id) => this.actors.get(id)!);
  }

  private isPaused(): boolean {
    return (
      this.transition !== null ||
      this.walker !== null ||
      this.turning !== null ||
      this.dialogue.isOpen() ||
      this.overlay.isOpen()
    );
  }

  private update(dt: number): void {
    if (this.transition) {
      this.updateTransition(dt);
    } else if (this.walker) {
      this.updateWalker(dt);
    } else if (this.turning) {
      this.turning.t += dt;
      if (this.turning.t >= TURN_PAUSE_SECONDS) {
        const obj = this.turning.obj;
        this.turning = null;
        this.runInteraction(obj);
      }
    } else if (this.dialogue.isOpen()) {
      if (this.input.consume('interact')) this.dialogue.advance();
    } else if (this.overlay.isOpen()) {
      const toggledNotebook = this.overlay.active() === 'notebook' && this.input.consume('notebook');
      if (this.input.consume('menu') || toggledNotebook) this.overlay.close();
    } else {
      this.updatePlaying(dt);
    }
    this.input.clearPressed();
    if (this.isPaused()) for (const a of this.actors.values()) a.moving = false;
    for (const a of this.actors.values()) a.walkTime = a.moving ? a.walkTime + dt : 0;
  }

  private updatePlaying(dt: number): void {
    if (this.input.consume('menu')) return this.overlay.open('menu');
    if (this.input.consume('notebook')) return this.overlay.open('notebook');
    if (this.input.consume('switch')) this.cycleCharacter();
    if (this.input.consume('select1')) this.setActiveCharacter(PARTY_ORDER[0]);
    if (this.input.consume('select2')) this.setActiveCharacter(PARTY_ORDER[1]);
    if (this.input.consume('select3')) this.setActiveCharacter(PARTY_ORDER[2]);

    this.updateLeader(dt);
    this.updateFollowers(dt);
    if (this.checkExits()) return;
    this.updateFocus();
    if (this.input.consume('interact') && this.focus) this.interact(this.focus);
  }

  private updateTransition(dt: number): void {
    const transition = this.transition!;
    transition.t += dt;
    if (transition.t < FADE_SECONDS) return;
    if (transition.phase === 'out' && transition.sceneId) {
      this.enterScene(transition.sceneId, transition.spawn ?? DEFAULT_SPAWN);
      this.saveGame();
      this.transition = { phase: 'in', t: 0 };
    } else {
      this.transition = null;
    }
  }

  /** Lets a scene person walk into place while everything else waits. */
  private startWalk(objectId: string, from: Point[], onDone?: () => void): void {
    const obj = this.visibleObjects().find((o) => o.id === objectId);
    if (!obj || from.length === 0) {
      onDone?.();
      return;
    }
    // After walking the person ends up looking the way the scene defines again
    this.turnedFacing.delete(objectId);
    this.walker = {
      objectId,
      x: from[0].x,
      y: from[0].y,
      facing: obj.facing ?? 'down',
      walkTime: 0,
      path: [...from.slice(1), { x: obj.x, y: obj.y }],
      onDone,
    };
  }

  private updateWalker(dt: number): void {
    const walker = this.walker!;
    walker.walkTime += dt;
    let step = CUTSCENE_WALK_SPEED * dt;
    while (step > 0 && walker.path.length > 0) {
      const target = walker.path[0];
      const dx = target.x - walker.x;
      const dy = target.y - walker.y;
      const distance = Math.hypot(dx, dy);
      if (distance > 0.001) {
        walker.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      }
      if (distance <= step) {
        walker.x = target.x;
        walker.y = target.y;
        walker.path.shift();
        step -= distance;
      } else {
        walker.x += (dx / distance) * step;
        walker.y += (dy / distance) * step;
        step = 0;
      }
    }
    if (walker.path.length === 0) {
      // Arrived: the object is drawn at its own position (and facing) again
      this.walker = null;
      walker.onDone?.();
    }
  }

  private updateLeader(dt: number): void {
    const leader = this.party[0];
    const options: Facing[] = [];
    let dx = 0;
    let dy = 0;
    for (const facing of ['left', 'right', 'up', 'down'] as const) {
      if (!this.input.isHeld(facing)) continue;
      dx += FACING_VECTORS[facing].x;
      dy += FACING_VECTORS[facing].y;
      options.push(facing);
    }
    if (dx === 0 && dy === 0) {
      leader.moving = false;
      return;
    }
    if (!options.includes(leader.facing)) leader.facing = options[0];

    const speed = WALK_SPEED * leader.def.walkSpeedFactor * dt;
    const length = Math.hypot(dx, dy);
    const stepX = (dx / length) * speed;
    const stepY = (dy / length) * speed;
    const startX = leader.x;
    const startY = leader.y;
    if (!this.collides(leader.x + stepX, leader.y)) leader.x += stepX;
    if (!this.collides(leader.x, leader.y + stepY)) leader.y += stepY;
    leader.moving = leader.x !== startX || leader.y !== startY;
    if (leader.moving) this.recordTrail(leader);
  }

  private recordTrail(leader: Actor): void {
    const head = this.trail[0];
    const distance = Math.hypot(leader.x - head.x, leader.y - head.y);
    const steps = Math.floor(distance / TRAIL_STEP);
    for (let i = 1; i <= steps; i++) {
      const t = (i * TRAIL_STEP) / distance;
      this.trail.unshift({ x: head.x + (leader.x - head.x) * t, y: head.y + (leader.y - head.y) * t });
    }
    this.trail.length = Math.min(this.trail.length, (PARTY_ORDER.length - 1) * TRAIL_POINTS_PER_SLOT + 1);
  }

  private updateFollowers(dt: number): void {
    const party = this.party;
    for (let i = 1; i < party.length; i++) {
      const actor = party[i];
      const target = this.trail[Math.min(i * TRAIL_POINTS_PER_SLOT, this.trail.length - 1)];
      const dx = target.x - actor.x;
      const dy = target.y - actor.y;
      const distance = Math.hypot(dx, dy);
      actor.moving = distance > 0.05;
      if (distance < 0.01) continue;
      const step = Math.min(distance, WALK_SPEED * 1.4 * dt);
      actor.x += (dx / distance) * step;
      actor.y += (dy / distance) * step;
      if (actor.moving) {
        actor.facing = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'left' : 'right') : dy < 0 ? 'up' : 'down';
      }
    }
  }

  /** Lay the trail through the current positions so nobody jumps after a switch. */
  private rebuildTrail(): void {
    const party = this.party;
    this.trail = [{ x: party[0].x, y: party[0].y }];
    for (let i = 1; i < party.length; i++) {
      const from = party[i - 1];
      const to = party[i];
      for (let k = 1; k <= TRAIL_POINTS_PER_SLOT; k++) {
        const t = k / TRAIL_POINTS_PER_SLOT;
        this.trail.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
      }
    }
  }

  private checkExits(): boolean {
    const leader = this.party[0];
    const exit = this.scene.exits.find((e) => contains(e, leader.x, leader.y));
    if (!exit) {
      this.exitLocked = false;
      return false;
    }
    if (this.exitLocked) return false;
    this.changeScene(exit.target, exit.spawn);
    return true;
  }

  private updateFocus(): void {
    const leader = this.party[0];
    const v = FACING_VECTORS[leader.facing];
    const px = leader.x + v.x * 0.7;
    const py = leader.y - 0.15 + v.y * 0.7;
    const margin = 0.1;
    const found =
      this.visibleObjects().find(
        (o) =>
          o.interaction &&
          px >= o.x - margin &&
          px <= o.x + o.w + margin &&
          py >= o.y - margin &&
          py <= o.y + o.h + margin,
      ) ?? null;
    if (found !== this.focus) {
      this.focus = found;
      this.focusLabel.set(found?.label ?? null);
    }
  }

  /** People first turn towards the kids, then the interaction starts. */
  private interact(obj: SceneObject): void {
    if (obj.sprite === 'person') {
      const towardsKids = OPPOSITE_FACING[this.party[0].facing];
      if (this.facingOf(obj) !== towardsKids) {
        this.turnedFacing.set(obj.id, towardsKids);
        this.turning = { obj, t: 0 };
        return;
      }
    }
    this.runInteraction(obj);
  }

  private facingOf(obj: SceneObject): Facing {
    return this.turnedFacing.get(obj.id) ?? obj.facing ?? 'down';
  }

  private runInteraction(obj: SceneObject): void {
    const interaction = obj.interaction;
    const poke: Poke = { at: this.time, count: (this.pokes.get(obj.id)?.count ?? 0) + 1 };
    this.pokes.set(obj.id, poke);
    switch (interaction?.kind) {
      case 'poke': {
        const reactions = interaction.reactions;
        const reaction = reactions[(poke.count - 1) % reactions.length];
        if (!reaction) break;
        poke.bubble = reaction.bubble;
        if (reaction.lines?.length) this.say(reaction.lines);
        break;
      }
      case 'dialogue':
        this.say(interaction.lines);
        break;
      case 'caseBoard':
        this.overlay.open('caseBoard');
        break;
      case 'departure': {
        const activeCase = this.state.activeCase();
        if (activeCase) this.changeScene(activeCase.firstSceneId);
        else this.say([{ speaker: ACTIVE_SPEAKER, text: TEXT.noCaseToDepart }]);
        break;
      }
      case 'event': {
        // An explicit case first, then the active case, then the case this scene belongs to (e.g. after solving it)
        const owner = CASES.find((c) => c.scenes.some((s) => s.id === this.scene.id));
        const handler = interaction.caseId
          ? findCase(interaction.caseId)?.events?.[interaction.eventId]
          : (this.state.activeCase()?.events?.[interaction.eventId] ?? owner?.events?.[interaction.eventId]);
        if (handler) {
          handler({
            state: this.state,
            say: (lines, onDone) => this.say(lines, onDone),
            goTo: (sceneId, spawn) => this.changeScene(sceneId, spawn),
            walk: (objectId, from, onDone) => this.startWalk(objectId, from, onDone),
          });
        } else {
          console.warn(`No handler for event "${interaction.eventId}" on "${obj.id}"`);
        }
        break;
      }
    }
  }

  // --- Scenes & collision ----------------------------------------------------------

  private enterScene(sceneId: string, spawn: string | PartyPosition): void {
    const scene = this.scenes.get(sceneId) ?? this.scenes.get(HOME_SCENE_ID)!;
    if (scene.id !== sceneId) spawn = DEFAULT_SPAWN;
    this.scene = scene;
    this.state.sceneId.set(scene.id);
    this.sceneName.set(scene.name);

    const point: SpawnPoint =
      typeof spawn === 'string' ? (scene.spawns[spawn] ?? scene.spawns[DEFAULT_SPAWN]) : spawn;
    for (const actor of this.actors.values()) {
      actor.x = point.x;
      actor.y = point.y;
      actor.facing = point.facing;
      actor.moving = false;
    }
    this.rebuildTrail();
    this.turnedFacing.clear();
    this.turning = null;
    this.pokes.clear();
    this.exitLocked = true;
    this.focus = null;
    this.focusLabel.set(null);
  }

  private animOf(obj: SceneObject): ObjectAnim {
    const poke = this.pokes.get(obj.id);
    return {
      time: this.time,
      poke: poke ? this.time - poke.at : Infinity,
      pokes: poke?.count ?? 0,
    };
  }

  private leaderPosition(): PartyPosition {
    const leader = this.party[0];
    return { x: leader.x, y: leader.y, facing: leader.facing };
  }

  private collides(x: number, y: number): boolean {
    const box: Rect = { x: x - FOOT_HALF_WIDTH, y: y - FOOT_HEIGHT, w: FOOT_HALF_WIDTH * 2, h: FOOT_HEIGHT };
    for (let ty = Math.floor(box.y); ty <= Math.floor(box.y + box.h - 1e-6); ty++) {
      for (let tx = Math.floor(box.x); tx <= Math.floor(box.x + box.w - 1e-6); tx++) {
        const tile = tileAt(this.scene, tx, ty);
        if (!tile || tile.solid) return true;
      }
    }
    return this.visibleObjects().some((o) => o.solid && overlaps(o, box));
  }

  /** Scene objects whose `showIf` / `hideIf` conditions currently let them appear. */
  private visibleObjects(): SceneObject[] {
    return this.scene.objects.filter(
      (o) => (!o.showIf || this.state.isSet(o.showIf)) && (!o.hideIf || !this.state.isSet(o.hideIf)),
    );
  }

  // --- Rendering ----------------------------------------------------------------------

  private render(ctx: CanvasRenderingContext2D): void {
    const scene = this.scene;
    const leader = this.party[0];
    const mapW = scene.map[0].length * T;
    const mapH = scene.map.length * T;
    const camX = Math.round(camera(leader.x * T, mapW, VIEW_WIDTH));
    const camY = Math.round(camera(leader.y * T - T / 2, mapH, VIEW_HEIGHT));

    ctx.fillStyle = scene.background;
    ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    ctx.save();
    ctx.translate(-camX, -camY);

    drawTiles(
      ctx,
      scene,
      Math.floor(camX / T),
      Math.floor(camY / T),
      Math.ceil((camX + VIEW_WIDTH) / T),
      Math.ceil((camY + VIEW_HEIGHT) / T),
    );

    const objects = this.visibleObjects();
    for (const obj of objects)
      if (FLAT_SPRITES.has(obj.sprite)) drawObject(ctx, obj, this.animOf(obj));

    // Depth-sort everything else by its bottom edge
    const drawables: { depth: number; draw: () => void }[] = [];
    for (const obj of objects) {
      if (FLAT_SPRITES.has(obj.sprite)) continue;
      const walker = this.walker?.objectId === obj.id ? this.walker : null;
      if (walker) {
        const moved = { ...obj, x: walker.x, y: walker.y, facing: walker.facing };
        const anim = this.animOf(obj);
        drawables.push({ depth: walker.y + obj.h, draw: () => drawObject(ctx, moved, anim, walker.walkTime) });
      } else {
        const shown = this.turnedFacing.has(obj.id) ? { ...obj, facing: this.facingOf(obj) } : obj;
        const anim = this.animOf(obj);
        drawables.push({ depth: obj.y + obj.h, draw: () => drawObject(ctx, shown, anim) });
      }
    }
    for (const actor of this.actors.values()) {
      drawables.push({
        depth: actor.y,
        draw: () => drawCharacter(ctx, actor.def.appearance, actor.x * T, actor.y * T, actor.facing, actor.walkTime),
      });
    }
    drawables.sort((a, b) => a.depth - b.depth).forEach((d) => d.draw());

    if (scene.ambience) drawAmbience(ctx, scene.ambience, mapW, mapH, this.time);

    let bubbleShown = false;
    for (const obj of objects) {
      const poke = this.pokes.get(obj.id);
      const age = poke ? this.time - poke.at : Infinity;
      if (poke?.bubble && age < BUBBLE_SECONDS) {
        drawSoundBubble(ctx, obj, poke.bubble, age, BUBBLE_SECONDS);
        if (obj === this.focus) bubbleShown = true;
      }
    }
    if (this.focus && !this.isPaused() && !bubbleShown) drawFocusMarker(ctx, this.focus, this.time);
    ctx.restore();

    if (this.transition) {
      const p = Math.min(1, this.transition.t / FADE_SECONDS);
      ctx.fillStyle = `rgba(20, 16, 28, ${this.transition.phase === 'out' ? p : 1 - p})`;
      ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
    }
  }
}

function contains(r: Rect, x: number, y: number): boolean {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

/** Camera offset that follows `focus` but stays inside the map (or centres a small map). */
function camera(focus: number, mapSize: number, viewSize: number): number {
  if (mapSize <= viewSize) return -(viewSize - mapSize) / 2;
  return Math.max(0, Math.min(mapSize - viewSize, focus - viewSize / 2));
}
