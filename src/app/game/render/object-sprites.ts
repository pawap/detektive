import { TILE_SIZE as T } from '../../core/config';
import { ObjectSprite, SceneObject } from '../../core/models/scene.model';
import { circle, ellipse, rect, roundRect, shade } from './draw-utils';

/** Sprites that lie flat on the floor and are drawn below everything else. */
export const FLAT_SPRITES: ReadonlySet<ObjectSprite> = new Set(['rug']);

/**
 * Draws a furniture/prop placeholder. Everything is procedural so the game
 * runs without image assets; swap individual cases for real sprites later.
 */
export function drawObject(ctx: CanvasRenderingContext2D, obj: SceneObject): void {
  const x = obj.x * T;
  const y = obj.y * T;
  const w = obj.w * T;
  const h = obj.h * T;
  const color = obj.color;

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
      rect(ctx, x + 9, y - 3, w - 18, h - 8, '#2f4f6f');
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
      const cx = x + w / 2;
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
        circle(ctx, fx, y + 10 + (i % 2) * 6, 4, petals[i % petals.length]);
        circle(ctx, fx, y + 10 + (i % 2) * 6, 1.5, '#f39c12');
      }
      break;
    }
    case 'sandbox':
      rect(ctx, x, y, w, h, '#a0703d');
      rect(ctx, x + 5, y + 5, w - 10, h - 10, '#f0d9a0');
      circle(ctx, x + w - 22, y + h - 20, 6, '#e74c3c');
      rect(ctx, x + 18, y + 18, 3, 12, '#2e86c1');
      break;
    case 'box':
    default: {
      const c = color ?? '#95a5a6';
      rect(ctx, x + 2, y + 2, w - 4, h - 4, c);
      rect(ctx, x + 2, y + 2, w - 4, 6, shade(c, 0.15));
      break;
    }
  }
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
