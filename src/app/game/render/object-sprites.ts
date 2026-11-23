import { TILE_SIZE as T } from '../../core/config';
import { Facing } from '../../core/models/character.model';
import { NpcLook, ObjectSprite, SceneObject } from '../../core/models/scene.model';
import { characterMetrics, drawCharacter } from './character-sprite';
import { ObjectAnim, STILL, drawCritter, seedOf } from './critter-sprites';
import { circle, ellipse, rect, roundRect, shade } from './draw-utils';

/** Sprites that lie flat on the floor and are drawn below everything else. */
export const FLAT_SPRITES: ReadonlySet<ObjectSprite> = new Set(['rug', 'feather']);

/** Grown-ups are drawn a bit bigger than the siblings. */
const NPC_SCALE = 1.2;

/**
 * Draws a furniture/prop placeholder. Everything is procedural so the game
 * runs without image assets; swap individual cases for real sprites later.
 */
export function drawObject(
  ctx: CanvasRenderingContext2D,
  obj: SceneObject,
  anim: ObjectAnim = STILL,
  walkTime = 0,
): void {
  const x = obj.x * T;
  const y = obj.y * T;
  const w = obj.w * T;
  const h = obj.h * T;
  const color = obj.color;
  /** Per-object time, so trees etc. don't all sway in sync. */
  const t = anim.time + seedOf(obj.id) * 10;
  if (drawCritter(ctx, obj, x, y, w, h, anim)) return;

  switch (obj.sprite) {
    case 'bed':
    case 'crib': {
      const c = color ?? '#6a7fb5';
      roundRect(ctx, x + 2, y + 2, w - 4, h - 2, 4, '#8b5a2b');
      rect(ctx, x + 5, y + 5, w - 10, h - 9, '#f5f1e8');
      roundRect(ctx, x + 7, y + 7, w - 14, 9, 3, '#ffffff');
      roundRect(ctx, x + 5, y + 19, w - 10, h - 23, 3, c);
      rect(ctx, x + 5, y + 19, w - 10, 3, shade(c, 0.15));
      if (obj.sprite === 'crib') {
        for (let bx = x + 6; bx < x + w - 4; bx += 5) rect(ctx, bx, y + h - 12, 2, 10, '#a06a35');
      }
      break;
    }
    case 'caseBoard': {
      rect(ctx, x + 2, y + 4, w - 4, h - 8, '#7a5230');
      rect(ctx, x + 5, y + 7, w - 10, h - 14, '#d4a36a');
      const notes = [
        [10, 9, '#fffbe6'],
        [34, 11, '#ffe3e3'],
        [58, 9, '#e3f1ff'],
        [76, 12, '#fffbe6'],
      ] as const;
      ctx.strokeStyle = '#c0392b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      notes.forEach(([nx, ny], i) => {
        const px = x + nx + 5;
        const py = y + ny + 3;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();
      for (const [nx, ny, nc] of notes) {
        if (nx + 10 > w - 5) continue;
        rect(ctx, x + nx, y + ny, 10, 8, nc);
        circle(ctx, x + nx + 5, y + ny + 1, 1.5, '#c0392b');
      }
      break;
    }
    case 'desk': {
      rect(ctx, x + 2, y + 4, w - 4, h - 6, '#9c6b3c');
      rect(ctx, x + 2, y + 4, w - 4, 10, '#b8834f');
      roundRect(ctx, x + 8, y + 6, 12, 7, 1, '#fdfdfd');
      circle(ctx, x + w - 16, y + 9, 4, '#5dade2');
      ctx.strokeStyle = '#3b2f2f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + w - 16, y + 9, 4, 0, Math.PI * 2);
      ctx.moveTo(x + w - 13, y + 12);
      ctx.lineTo(x + w - 9, y + 16);
      ctx.stroke();
      break;
    }
    case 'chest': {
      const c = color ?? '#c0392b';
      roundRect(ctx, x + 3, y + 6, w - 6, h - 8, 3, c);
      rect(ctx, x + 3, y + 12, w - 6, 2, shade(c, -0.2));
      circle(ctx, x + w / 2, y + 17, 2.5, '#f2d03b');
      break;
    }
    case 'counter': {
      rect(ctx, x, y + 2, w, h - 2, '#dfe3e8');
      rect(ctx, x, y + 2, w, 8, '#9aa5b1');
      for (let cx = x; cx < x + w; cx += T) rect(ctx, cx + T - 1, y + 10, 1, h - 10, '#b7c0ca');
      // Stove
      rect(ctx, x + w - 2 * T + 4, y + 2, 2 * T - 8, 8, '#3d3d3d');
      circle(ctx, x + w - 2 * T + 14, y + 6, 3, '#777');
      circle(ctx, x + w - T + 8, y + 6, 3, '#777');
      break;
    }
    case 'fridge':
      roundRect(ctx, x + 6, y - 14, w - 12, h + 12, 3, '#f4f6f8');
      rect(ctx, x + 6, y + 2, w - 12, 1, '#c5ccd3');
      rect(ctx, x + w - 14, y - 8, 2, 8, '#9aa5b1');
      rect(ctx, x + w - 14, y + 6, 2, 8, '#9aa5b1');
      break;
    case 'table':
      rect(ctx, x + 4, y + h - 10, 4, 10, '#7a4b2a');
      rect(ctx, x + w - 8, y + h - 10, 4, 10, '#7a4b2a');
      roundRect(ctx, x + 2, y + 2, w - 4, h - 12, 4, '#b8834f');
      circle(ctx, x + w / 2, y + h / 2 - 5, 5, '#ffffff');
      break;
    case 'sofa': {
      const c = color ?? '#6a7fb5';
      roundRect(ctx, x, y - 6, w, h + 4, 6, shade(c, -0.15));
      for (let i = 0; i < 3; i++) roundRect(ctx, x + 6 + (i * (w - 12)) / 3, y + 2, (w - 12) / 3 - 2, h - 8, 4, c);
      break;
    }
    case 'tv':
      rect(ctx, x + w / 2 - 14, y + h - 8, 28, 6, '#555');
      roundRect(ctx, x + 6, y - 6, w - 12, h - 2, 3, '#222');
      drawTvScreen(ctx, x + 9, y - 3, w - 18, h - 8, anim);
      break;
    case 'shelf': {
      rect(ctx, x + 2, y - 16, w - 4, h + 14, '#7a4b2a');
      const books = ['#c0392b', '#2980b9', '#f1c40f', '#27ae60', '#8e44ad', '#e67e22'];
      for (let row = 0; row < 3; row++) {
        const by = y - 13 + row * 14;
        rect(ctx, x + 4, by + 11, w - 8, 2, '#5c361d');
        for (let bx = x + 5, i = row; bx < x + w - 8; bx += 6, i++) {
          rect(ctx, bx, by + 1 + (i % 3), 5, 10 - (i % 3), books[i % books.length]);
        }
      }
      break;
    }
    case 'plant':
      roundRect(ctx, x + 9, y + 16, 14, 14, 3, '#c0703a');
      circle(ctx, x + 16, y + 8, 9, '#3f8f45');
      circle(ctx, x + 10, y + 13, 7, '#4fa857');
      circle(ctx, x + 22, y + 13, 7, '#4fa857');
      break;
    case 'rug': {
      const c = color ?? '#c0504d';
      roundRect(ctx, x, y, w, h, 8, c);
      ctx.strokeStyle = shade(c, 0.25);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(x + 5, y + 5, w - 10, h - 10, 5);
      ctx.stroke();
      break;
    }
    case 'coatRack':
      rect(ctx, x + 14, y - 18, 4, h + 14, '#5c361d');
      rect(ctx, x + 8, y + h - 6, 16, 4, '#5c361d');
      roundRect(ctx, x + 5, y - 14, 10, 18, 3, '#d35400');
      roundRect(ctx, x + 17, y - 12, 9, 15, 3, '#2e86c1');
      break;
    case 'tree': {
      rect(ctx, x + w / 2 - 6, y - 10, 12, h + 6, '#7a4b2a');
      ellipse(ctx, x + w / 2, y + h - 2, w / 2.2, 6, 'rgba(0,0,0,0.18)');
      // Swaying in the wind (and shaking when poked)
      const shake = anim.poke < 1 ? Math.sin(anim.poke * 30) * 3 * (1 - anim.poke) : 0;
      const cx = x + w / 2 + Math.sin(t * 1.3) * 1.5 + shake;
      const cy = y - 26;
      circle(ctx, cx, cy, 26, '#3f8f45');
      circle(ctx, cx - 16, cy + 8, 18, '#469c4c');
      circle(ctx, cx + 16, cy + 8, 18, '#469c4c');
      circle(ctx, cx - 6, cy - 8, 12, '#5bb361');
      break;
    }
    case 'bench':
      rect(ctx, x + 4, y + 12, 4, h - 12, '#5c361d');
      rect(ctx, x + w - 8, y + 12, 4, h - 12, '#5c361d');
      rect(ctx, x + 2, y + 6, w - 4, 7, '#a0703d');
      rect(ctx, x + 2, y - 6, w - 4, 6, '#a0703d');
      break;
    case 'mailbox':
      rect(ctx, x + 14, y + 10, 4, h - 10, '#5c361d');
      roundRect(ctx, x + 6, y - 2, 20, 14, 5, '#2e86c1');
      rect(ctx, x + 22, y - 6, 2, 8, '#c0392b');
      break;
    case 'gate':
      rect(ctx, x + 1, y + 4, w - 2, 4, '#8b5a2b');
      rect(ctx, x + 1, y + 20, w - 2, 4, '#8b5a2b');
      for (let gx = x + 3; gx < x + w - 4; gx += 8) rect(ctx, gx, y, 5, h - 2, '#a0703d');
      break;
    case 'flowers': {
      roundRect(ctx, x, y + 4, w, h - 6, 4, '#7a4b2a');
      const petals = ['#e74c3c', '#f1c40f', '#ffffff', '#e84393', '#9b59b6'];
      for (let i = 0, fx = x + 6; fx < x + w - 4; fx += 10, i++) {
        const sway = Math.sin(t * 2 + i) * 1.5;
        const fy = y + 10 + (i % 2) * 6;
        rect(ctx, fx - 0.5, fy, 1, 6, '#3f8f45');
        circle(ctx, fx + sway, fy, 4, petals[i % petals.length]);
        circle(ctx, fx + sway, fy, 1.5, '#f39c12');
      }
      break;
    }
    case 'sandbox':
      rect(ctx, x, y, w, h, '#a0703d');
      rect(ctx, x + 5, y + 5, w - 10, h - 10, '#f0d9a0');
      circle(ctx, x + w - 22, y + h - 20, 6, '#e74c3c');
      rect(ctx, x + 18, y + 18, 3, 12, '#2e86c1');
      break;
    case 'person':
      if (obj.npc) drawPerson(ctx, obj.npc, x + w / 2, y + h - 3, obj.facing ?? 'down', walkTime);
      break;
    case 'pedestal':
    case 'pedestalWithChest': {
      rect(ctx, x + 6, y + h - 8, w - 12, 6, '#b3a993');
      rect(ctx, x + 12, y - 2, w - 24, h - 6, '#cfc6b4');
      rect(ctx, x + 16, y - 2, 3, h - 6, '#e2dacb');
      rect(ctx, x + 6, y - 9, w - 12, 8, '#ddd5c4');
      rect(ctx, x + w / 2 - 8, y + 6, 16, 6, '#c9a227');
      if (obj.sprite === 'pedestalWithChest') {
        drawTreasureChest(ctx, x + w / 2, y - 7);
      } else {
        // Dust outline where the chest used to stand
        ctx.strokeStyle = 'rgba(120, 100, 70, 0.6)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 2]);
        ctx.strokeRect(x + 17.5, y - 7.5, w - 35, 5);
        ctx.setLineDash([]);
      }
      break;
    }
    case 'display': {
      const c = color ?? '#95a5a6';
      rect(ctx, x + 4, y + 10, w - 8, h - 12, '#7a4b2a');
      rect(ctx, x + 4, y + 10, w - 8, 3, '#9c6b3c');
      roundRect(ctx, x + w / 2 - 10, y + 1, 20, 8, 2, c);
      ctx.fillStyle = 'rgba(190, 225, 245, 0.4)';
      ctx.fillRect(x + 6, y - 14, w - 12, 24);
      ctx.strokeStyle = '#6d8796';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 6.5, y - 13.5, w - 13, 23);
      rect(ctx, x + 10, y - 11, 2, 14, 'rgba(255, 255, 255, 0.6)');
      break;
    }
    case 'window': {
      const inner = h - 12;
      rect(ctx, x + 4, y + 2, w - 8, h - 6, '#7a4b2a');
      rect(ctx, x + 7, y + 5, w - 14, inner, '#9fd3f2');
      rect(ctx, x + 7, y + 5 + inner * 0.6, w - 14, inner * 0.4, '#3f8fc9');
      // The left sash is swung open
      ctx.fillStyle = 'rgba(225, 240, 250, 0.75)';
      ctx.fillRect(x + 1, y + 4, 8, inner + 2);
      break;
    }
    case 'painting': {
      const cx = x + w / 2;
      const cy = y + h / 2;
      rect(ctx, x + 10, y + 1, w - 20, h - 4, '#c9a227');
      rect(ctx, x + 13, y + 4, w - 26, h - 10, '#2c3e50');
      circle(ctx, cx, cy, 6, '#f6d2b5');
      ellipse(ctx, cx, cy + 5, 6, 3.5, '#c0392b');
      rect(ctx, cx - 10, cy - 9, 20, 4, '#141414');
      rect(ctx, cx - 5, cy - 12, 10, 4, '#141414');
      rect(ctx, cx - 4, cy - 2, 3, 3, '#141414');
      break;
    }
    case 'feather': {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(-0.6);
      rect(ctx, -13, -0.5, 6, 1, '#6b6b6b');
      ellipse(ctx, 0, 0, 9, 3, '#3fae49');
      ellipse(ctx, 7, 0, 3, 2.5, '#f2d03b');
      ctx.restore();
      break;
    }
    case 'parrot': {
      const cx = x + w / 2;
      rect(ctx, cx - 8, y + h - 4, 16, 3, '#5c361d');
      rect(ctx, cx - 2, y + 4, 4, h - 6, '#5c361d');
      rect(ctx, cx - 2, y - 2, 4, 10, '#c0392b');
      rect(ctx, cx - 10, y + 2, 20, 3, '#7a4b2a');
      ellipse(ctx, cx, y - 6, 6, 9, '#3fae49');
      ellipse(ctx, cx - 2, y - 4, 3, 6, '#2e8b3a');
      // Head-bobbing like a little rock star
      const hb = Math.sin(t * 4) > 0.4 ? 1.5 : 0;
      circle(ctx, cx, y - 16 + hb, 5, '#f2d03b');
      circle(ctx, cx + 2, y - 17 + hb, 1.2, '#222222');
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(cx + 4, y - 17 + hb);
      ctx.lineTo(cx + 9, y - 14 + hb);
      ctx.lineTo(cx + 4, y - 12 + hb);
      ctx.fill();
      break;
    }
    case 'boat': {
      const c = color ?? '#c0392b';
      ctx.save();
      ctx.translate(0, Math.round(Math.sin(t * 1.4) * 1.5));
      const deck = y + h * 0.35;
      const mastX = x + w * 0.35;
      rect(ctx, mastX, y - 40, 4, deck - y + 40, '#5c361d');
      ctx.fillStyle = '#f4f1e6';
      ctx.beginPath();
      ctx.moveTo(mastX + 4, y - 38);
      ctx.lineTo(mastX + 4, deck - 4);
      ctx.lineTo(x + w * 0.78, deck - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x, deck);
      ctx.lineTo(x + w, deck);
      ctx.lineTo(x + w - 14, y + h - 4);
      ctx.lineTo(x + 14, y + h - 4);
      ctx.closePath();
      ctx.fill();
      rect(ctx, x + 2, deck, w - 4, 4, shade(c, -0.2));
      // Tarp with something square underneath
      roundRect(ctx, x + w * 0.55, deck - 14, 34, 16, 6, '#5d7a8c');
      rect(ctx, x + w * 0.55 + 27, deck - 4, 6, 4, '#c9a227');
      ctx.fillStyle = '#f4f1e6';
      ctx.font = 'bold 9px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('SEESCHNECKE', x + w / 2, y + h * 0.68);
      ctx.restore();
      break;
    }
    case 'boots':
      ellipse(ctx, x + w / 2, y + h - 4, 14, 4, '#e3cf9b');
      for (const bx of [x + 5, x + 17]) {
        roundRect(ctx, bx, y - 2, 9, 22, 2, '#f1c40f');
        roundRect(ctx, bx, y + 14, 12, 8, 3, '#f1c40f');
        rect(ctx, bx, y - 2, 9, 3, '#d4ac0d');
        circle(ctx, bx + 4, y + 19, 1.5, '#e3cf9b');
      }
      break;
    case 'barrel':
      roundRect(ctx, x + 6, y - 6, w - 12, h + 2, 6, '#8b5a2b');
      rect(ctx, x + 6, y, w - 12, 2, '#3d3d3d');
      rect(ctx, x + 6, y + h - 10, w - 12, 2, '#3d3d3d');
      ellipse(ctx, x + w / 2, y - 5, (w - 12) / 2, 3, '#a0703d');
      break;
    case 'pralineBox':
    case 'pralineBoxFull':
      drawPralineBox(ctx, x + w / 2, y + 14, obj.sprite === 'pralineBoxFull');
      break;
    case 'slide': {
      // Ladder on the left, platform at the top, chute down to the right
      const c = color ?? '#e74c3c';
      rect(ctx, x + 4, y - 22, 3, h + 18, '#7f8c8d');
      rect(ctx, x + 15, y - 22, 3, h + 18, '#7f8c8d');
      for (let ry = y - 16; ry < y + h - 6; ry += 8) rect(ctx, x + 4, ry, 14, 2, '#95a5a6');
      rect(ctx, x + 2, y - 26, 22, 6, '#2e86c1');
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(x + 20, y - 24);
      ctx.lineTo(x + 30, y - 24);
      ctx.lineTo(x + w - 2, y + h - 10);
      ctx.lineTo(x + w - 2, y + h - 2);
      ctx.lineTo(x + w - 14, y + h - 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = shade(c, -0.25);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 22, y - 24);
      ctx.lineTo(x + w - 12, y + h - 4);
      ctx.stroke();
      break;
    }
    case 'swing': {
      rect(ctx, x + 2, y - 28, 4, h + 26, '#5c361d');
      rect(ctx, x + w - 6, y - 28, 4, h + 26, '#5c361d');
      rect(ctx, x, y - 30, w, 5, '#7a4b2a');
      for (const [i, sx, c] of [
        [0, x + w * 0.3, '#f1c40f'],
        [1, x + w * 0.7, '#2e86c1'],
      ] as const) {
        // Swaying gently in the wind
        ctx.save();
        ctx.translate(sx, y - 25);
        ctx.rotate(Math.sin(t * 1.6 + i * 2) * 0.08);
        rect(ctx, -7, 0, 1, h + 6, '#3d3d3d');
        rect(ctx, 6, 0, 1, h + 6, '#3d3d3d');
        rect(ctx, -8, h + 5, 16, 4, c);
        ctx.restore();
      }
      break;
    }
    case 'sign':
      rect(ctx, x + w / 2 - 2, y + 6, 4, h - 6, '#5c361d');
      roundRect(ctx, x + 1, y - 8, w - 2, 16, 3, color ?? '#f4f1e6');
      ctx.strokeStyle = '#5c361d';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x + 1.5, y - 7.5, w - 3, 15);
      rect(ctx, x + 6, y - 3, w - 12, 2, '#5c361d');
      rect(ctx, x + 6, y + 1, w - 16, 2, '#5c361d');
      break;
    case 'chocolateVat': {
      // A big copper kettle full of melted chocolate, with a stirring paddle
      ellipse(ctx, x + w / 2, y + h - 3, w / 2 - 2, 5, 'rgba(0,0,0,0.2)');
      roundRect(ctx, x + 4, y - 4, w - 8, h, 10, '#b87333');
      rect(ctx, x + 4, y + 6, w - 8, 3, '#8e5a28');
      ellipse(ctx, x + w / 2, y - 4, w / 2 - 4, 8, '#8e5a28');
      ellipse(ctx, x + w / 2, y - 3, w / 2 - 8, 6, '#5a3220');
      ellipse(ctx, x + w / 2 - 6, y - 4, 6, 2, '#7b4a2e');
      // Blubb … blubb …
      for (let i = 0; i < 3; i++) {
        const k = (t * 0.8 + i / 3) % 1;
        const bx = x + w / 2 - 14 + i * 11;
        if (k < 0.8) circle(ctx, bx, y - 3, 1 + k * 3, '#7b4a2e');
        else {
          ctx.strokeStyle = 'rgba(123, 74, 46, 0.8)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, y - 3 - (k - 0.8) * 20, 2, Math.PI, 0);
          ctx.stroke();
        }
      }
      // The paddle stirs round and round
      const stir = Math.sin(t * 1.5) * 8;
      rect(ctx, x + w / 2 + 6 + stir, y - 26, 4, 24, '#a0703d');
      for (let i = 0; i < 2; i++) {
        const k = (t * 0.3 + i / 2) % 1;
        circle(
          ctx,
          x + w / 2 - 8 + i * 14 + Math.sin(k * 6) * 4,
          y - 10 - k * 24,
          3 + k * 4,
          `rgba(244, 230, 210, ${(1 - k) * 0.35})`,
        );
      }
      break;
    }
    case 'conveyor': {
      rect(ctx, x + 4, y + 10, 4, h - 10, '#7f8c8d');
      rect(ctx, x + w - 8, y + 10, 4, h - 10, '#7f8c8d');
      roundRect(ctx, x, y + 2, w, 10, 5, '#3d3d3d');
      const shift = (anim.time * 12) % 16;
      for (let px = x + 10 + shift - 16; px < x + w - 8; px += 16) {
        if (px < x + 6) continue;
        circle(ctx, px, y + 2, 4.5, '#d4ac0d');
        circle(ctx, px, y + 0.5, 3.5, '#6b3e26');
      }
      for (const rx of [x + 5, x + w - 5]) {
        const a = anim.time * 4;
        circle(ctx, rx, y + 7, 3, '#5d5d5d');
        rect(ctx, rx + Math.cos(a) * 2 - 0.5, y + 7 + Math.sin(a) * 2 - 0.5, 1, 1, '#b7c0ca');
      }
      break;
    }
    case 'computerDesk':
    case 'computerDeskCrumbs': {
      const c = color ?? '#8e9eab';
      rect(ctx, x + 4, y + 10, 4, h - 10, '#5d6d7e');
      rect(ctx, x + w - 8, y + 10, 4, h - 10, '#5d6d7e');
      rect(ctx, x + 2, y + 2, w - 4, 10, '#f4f6f8');
      rect(ctx, x + 2, y + 10, w - 4, 3, '#c5ccd3');
      // Monitor with code on it
      rect(ctx, x + w / 2 - 3, y - 4, 6, 7, '#3d3d3d');
      roundRect(ctx, x + w / 2 - 20, y - 26, 40, 24, 2, '#2c2c34');
      rect(ctx, x + w / 2 - 17, y - 23, 34, 18, '#1e2b3a');
      const code = ['#5dade2', '#f1c40f', '#58d68d', '#ec7063', '#5dade2'];
      code.forEach((cc, i) => rect(ctx, x + w / 2 - 15 + (i % 2) * 4, y - 21 + i * 3.3, 10 + ((i * 7) % 14), 1.6, cc));
      // Keyboard and mug
      rect(ctx, x + w / 2 - 14, y + 4, 28, 5, c);
      roundRect(ctx, x + 8, y + 1, 7, 8, 1, '#e74c3c');
      if (obj.sprite !== 'computerDeskCrumbs') break;
      // Crumbs and golden praline cups
      for (const [dx, dy] of [[-0.32, 6], [-0.28, 8], [0.3, 7], [0.36, 5], [0.33, 9]] as const) {
        circle(ctx, x + w / 2 + dx * w, y + dy, 1.2, '#d4a056');
      }
      for (const dx of [0.28, 0.36, 0.44]) circle(ctx, x + w * (0.5 + dx * 0.9) - 8, y + 6, 2.5, '#d4ac0d');
      break;
    }
    case 'box':
    default: {
      const c = color ?? '#95a5a6';
      rect(ctx, x + 2, y + 2, w - 4, h - 4, c);
      rect(ctx, x + 2, y + 2, w - 4, 6, shade(c, 0.15));
      break;
    }
  }
}

/** The TV screen: every poke switches to the next channel. */
function drawTvScreen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  anim: ObjectAnim,
): void {
  const t = anim.time;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  switch (anim.pokes % 5) {
    case 0:
      // Off: just a reflection
      rect(ctx, x, y, w, h, '#2f4f6f');
      rect(ctx, x + 6, y + 3, 10, 2, 'rgba(255,255,255,0.25)');
      break;
    case 1: {
      // Cartoon: a bouncing ball
      rect(ctx, x, y, w, h, '#9fd3f2');
      rect(ctx, x, y + h - 5, w, 5, '#7cc06a');
      const bx = x + 8 + ((t * 30) % (w - 16));
      const by = y + h - 9 - Math.abs(Math.sin(t * 5)) * (h - 12);
      circle(ctx, bx, by, 4, '#e74c3c');
      rect(ctx, bx - 1, by - 4, 2, 8, '#f4f1e6');
      break;
    }
    case 2:
      // Weather: sun and a cloud drifting by
      rect(ctx, x, y, w, h, '#5dade2');
      circle(ctx, x + w * 0.3, y + h / 2, 6 + Math.sin(t * 3) * 0.8, '#f1c40f');
      ellipse(ctx, x + ((t * 10) % (w + 20)) - 10, y + h / 2 + 2, 9, 4, '#f4f6f8');
      break;
    case 3:
      // Snow
      rect(ctx, x, y, w, h, '#555');
      for (let i = 0; i < 60; i++) {
        const sx = x + ((i * 37 + Math.floor(t * 30) * 13) % w);
        const sy = y + ((i * 23 + Math.floor(t * 30) * 7) % h);
        rect(ctx, sx, sy, 2, 1, i % 2 ? '#ddd' : '#999');
      }
      break;
    case 4: {
      // Nature documentary: a fish
      rect(ctx, x, y, w, h, '#1f5f8b');
      const fx = x + w / 2 + Math.sin(t) * (w / 3);
      const dir = Math.cos(t) > 0 ? 1 : -1;
      ellipse(ctx, fx, y + h / 2, 6, 3.5, '#f39c12');
      ctx.fillStyle = '#e67e22';
      ctx.beginPath();
      ctx.moveTo(fx - 5 * dir, y + h / 2);
      ctx.lineTo(fx - 10 * dir, y + h / 2 - 4);
      ctx.lineTo(fx - 10 * dir, y + h / 2 + 4);
      ctx.fill();
      circle(ctx, fx + 6 * dir, y + h / 2 - 6 - ((t * 8) % 8), 1, 'rgba(255,255,255,0.7)');
      break;
    }
  }
  ctx.restore();
}

/** Comic sound bubble („MIAU!“) floating up above a poked object. */
export function drawSoundBubble(
  ctx: CanvasRenderingContext2D,
  obj: SceneObject,
  text: string,
  age: number,
  duration: number,
): void {
  const k = age / duration;
  const cx = (obj.x + obj.w / 2) * T;
  const cy = Math.max(obj.y * T - 42, 14) - k * 14;
  const pop = age < 0.15 ? 0.6 + (age / 0.15) * 0.4 : 1;
  ctx.save();
  ctx.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
  ctx.translate(cx, cy);
  ctx.scale(pop, pop);
  ctx.rotate(Math.sin(age * 9) * 0.05);
  ctx.font = 'bold 11px system-ui, sans-serif';
  const width = ctx.measureText(text).width + 14;
  roundRect(ctx, -width / 2, -10, width, 20, 9, '#fffbe6');
  ctx.fillStyle = '#fffbe6';
  ctx.beginPath();
  ctx.moveTo(-5, 9);
  ctx.lineTo(0, 16);
  ctx.lineTo(4, 9);
  ctx.fill();
  ctx.strokeStyle = '#3b2f2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -10, width, 20, 9);
  ctx.stroke();
  ctx.fillStyle = '#c0392b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0.5);
  ctx.restore();
}

/** Bouncing marker above the object the leader could interact with. */
export function drawFocusMarker(ctx: CanvasRenderingContext2D, obj: SceneObject, time: number): void {
  const cx = (obj.x + obj.w / 2) * T;
  const cy = Math.max(obj.y * T - 18, 14) + Math.sin(time * 5) * 3;
  roundRect(ctx, cx - 9, cy - 10, 18, 18, 5, '#fffbe6');
  ctx.strokeStyle = '#3b2f2f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(cx - 9, cy - 10, 18, 18, 5);
  ctx.stroke();
  ctx.fillStyle = '#3b2f2f';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('E', cx, cy);
}

/** A pirate chest standing on `bottomY`, centred on `cx`. */
function drawTreasureChest(ctx: CanvasRenderingContext2D, cx: number, bottomY: number): void {
  const w = 30;
  const h = 20;
  const x = cx - w / 2;
  const y = bottomY - h;
  circle(ctx, x + 6, y - 1, 3, '#f2d03b');
  circle(ctx, x + w - 8, y - 2, 3, '#f7dc6f');
  roundRect(ctx, x, y + 6, w, h - 6, 2, '#8b5a2b');
  roundRect(ctx, x, y, w, 9, 4, '#a0703d');
  rect(ctx, x, y + 8, w, 2, '#5c361d');
  rect(ctx, x + 5, y, 3, h, '#c9a227');
  rect(ctx, x + w - 8, y, 3, h, '#c9a227');
  rect(ctx, cx - 3, y + 7, 6, 6, '#f2d03b');
}

/** A heart-shaped praline box (open), centred on (cx, cy). */
function drawPralineBox(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  full: boolean,
): void {
  const heart = (r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, cy + r * 0.9);
    ctx.bezierCurveTo(cx - r * 1.4, cy, cx - r * 0.9, cy - r, cx, cy - r * 0.35);
    ctx.bezierCurveTo(cx + r * 0.9, cy - r, cx + r * 1.4, cy, cx, cy + r * 0.9);
    ctx.fill();
  };
  heart(12, '#a93246');
  heart(9.5, '#f7d6dc');
  const spots: [number, number][] = [
    [-4.5, -2],
    [0, -1],
    [4.5, -2],
    [-2.5, 3],
    [2.5, 3],
  ];
  for (const [dx, dy] of spots) {
    circle(ctx, cx + dx, cy + dy, 2.4, '#d4ac0d');
    if (full) circle(ctx, cx + dx, cy + dy - 0.6, 1.9, '#5a3220');
  }
}

/** A grown-up NPC: a scaled-up character plus optional hat and beard. */
function drawPerson(
  ctx: CanvasRenderingContext2D,
  look: NpcLook,
  fx: number,
  fy: number,
  facing: Facing,
  walkTime: number,
): void {
  drawCharacter(ctx, look, fx, fy, facing, walkTime, NPC_SCALE);
  const { height, headRadius: r } = characterMetrics(look, NPC_SCALE);
  const hx = fx;
  const hy = fy - height + r;
  if (look.beard && facing !== 'up') {
    const bx = facing === 'left' ? hx - r * 0.3 : facing === 'right' ? hx + r * 0.3 : hx;
    ellipse(ctx, bx, hy + r * 0.72, r * 0.72, r * 0.42, look.beard);
    ellipse(ctx, bx, hy + r * 0.4, r * 0.42, r * 0.12, look.beard);
  }
  switch (look.hat) {
    case 'captain':
      roundRect(ctx, hx - r * 1.05, hy - r * 1.35, r * 2.1, r * 0.75, r * 0.25, '#1f2a44');
      rect(ctx, hx - r * 1.05, hy - r * 0.8, r * 2.1, r * 0.14, '#f4f1e6');
      rect(ctx, hx - r * 1.2, hy - r * 0.66, r * 2.4, r * 0.2, '#141b2e');
      circle(ctx, hx, hy - r * 1.02, r * 0.15, '#f2d03b');
      break;
    case 'guard':
      roundRect(ctx, hx - r, hy - r * 1.3, r * 2, r * 0.65, r * 0.2, '#2c3e70');
      rect(ctx, hx - r * 1.1, hy - r * 0.7, r * 2.2, r * 0.18, '#1b2650');
      circle(ctx, hx, hy - r, r * 0.13, '#f2d03b');
      break;
    case 'beret':
      ellipse(ctx, hx + r * 0.2, hy - r * 0.95, r, r * 0.35, '#c0392b');
      circle(ctx, hx + r * 0.2, hy - r * 1.32, r * 0.12, '#c0392b');
      break;
    case 'bun':
      circle(ctx, hx, hy - r * 1.15, r * 0.45, look.hairColor);
      break;
    case 'chef':
      rect(ctx, hx - r * 0.75, hy - r * 1.45, r * 1.5, r * 0.65, '#fdfdfd');
      circle(ctx, hx - r * 0.45, hy - r * 1.55, r * 0.45, '#fdfdfd');
      circle(ctx, hx + r * 0.45, hy - r * 1.55, r * 0.45, '#fdfdfd');
      circle(ctx, hx, hy - r * 1.8, r * 0.5, '#fdfdfd');
      rect(ctx, hx - r * 0.8, hy - r * 0.88, r * 1.6, r * 0.14, '#d9d9d9');
      break;
  }
}
