import { SceneObject } from '../../core/models/scene.model';
import { circle, ellipse, rect, roundRect, shade } from './draw-utils';

/** Animation input for a scene object. */
export interface ObjectAnim {
  /** Seconds since the game started (drives idle animations). */
  time: number;
  /** Seconds since the object was last poked (Infinity if never). */
  poke: number;
  /** How often the object has been poked in this scene visit. */
  pokes: number;
}

export const STILL: ObjectAnim = { time: 0, poke: Infinity, pokes: 0 };

/** Stable 0..1 value per object id so identical critters don't move in sync. */
export function seedOf(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return ((h >>> 0) % 1000) / 1000;
}

/** 0 → 1 → 0 over the first `duration` seconds after a poke, 0 otherwise. */
function pulse(poke: number, duration: number): number {
  return poke < duration ? Math.sin((poke / duration) * Math.PI) : 0;
}

/** A decaying wobble after a poke (0 once it has died down). */
function wobble(poke: number, decay: number, frequency: number): number {
  return poke < 4 ? Math.exp(-poke * decay) * Math.sin(poke * frequency) : 0;
}

function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
  width = 1,
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function poly(ctx: CanvasRenderingContext2D, points: [number, number][], color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([px, py], i) => (i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py)));
  ctx.closePath();
  ctx.fill();
}

function label(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string,
  size = 9,
  alpha = 1,
) {
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
  ctx.globalAlpha = 1;
}

/** Notes (♪) drifting upwards from (x, y). */
function notes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  t: number,
  color: string,
  count = 3,
) {
  for (let i = 0; i < count; i++) {
    const k = (t * 0.6 + i / count) % 1;
    label(
      ctx,
      i % 2 ? '♫' : '♪',
      x + Math.sin(k * 6 + i) * 6 + i * 3,
      y - k * 26,
      color,
      10,
      1 - k,
    );
  }
}

/** A little bird seen from the side, facing left (dir = 1) or right (dir = -1). */
function bird(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  body: string,
  dir: 1 | -1,
  flap = -1,
) {
  ellipse(ctx, cx, cy, 6, 4.5, body);
  circle(ctx, cx - 5 * dir, cy - 4, 3.5, body);
  circle(ctx, cx - 6 * dir, cy - 4.8, 0.9, '#1b1b1b');
  poly(
    ctx,
    [
      [cx - 8 * dir, cy - 4.5],
      [cx - 11 * dir, cy - 3.5],
      [cx - 8 * dir, cy - 2.5],
    ],
    '#e67e22',
  );
  poly(
    ctx,
    [
      [cx + 5 * dir, cy - 1],
      [cx + 11 * dir, cy - 3],
      [cx + 10 * dir, cy + 1],
    ],
    shade(body, -0.15),
  );
  if (flap >= 0) {
    // Wings up/down while flying
    const wy = cy - 2 - flap * 8;
    poly(
      ctx,
      [
        [cx - 2, cy - 1],
        [cx + 4 * dir, wy],
        [cx + 6 * dir, cy],
      ],
      shade(body, -0.2),
    );
  } else {
    ellipse(ctx, cx + 1 * dir, cy, 3.5, 2.5, shade(body, -0.12));
  }
}

/**
 * Draws one of the animated "lively detail" sprites. Returns false if the
 * sprite isn't one of them.
 */
export function drawCritter(
  ctx: CanvasRenderingContext2D,
  obj: SceneObject,
  x: number,
  y: number,
  w: number,
  h: number,
  anim: ObjectAnim,
): boolean {
  const seed = seedOf(obj.id);
  const t = anim.time + seed * 10;
  const p = anim.poke;

  switch (obj.sprite) {
    case 'cat': {
      const c = obj.color ?? '#e8964a';
      const dark = shade(c, -0.18);
      const cx = x + w / 2;
      const by = y + h - 4;
      ellipse(ctx, cx, by, 13, 3, 'rgba(0,0,0,0.15)');
      if (p < 2.2) {
        // Woken up: a startled hop, then sitting with a swishing tail
        const hop = p < 0.5 ? Math.sin((p / 0.5) * Math.PI) * 12 : 0;
        const cy = by - hop;
        const swish = Math.sin(p * 10) * 4;
        ctx.lineCap = 'round';
        line(ctx, cx + 6, cy - 3, cx + 12 + swish, cy - 16, c, 3);
        ctx.lineCap = 'butt';
        ellipse(ctx, cx, cy - 7, 8, 8, c);
        rect(ctx, cx - 4, cy - 12, 8, 2, dark);
        circle(ctx, cx, cy - 18, 7, c);
        poly(
          ctx,
          [
            [cx - 7, cy - 21],
            [cx - 5, cy - 29],
            [cx - 1, cy - 23],
          ],
          c,
        );
        poly(
          ctx,
          [
            [cx + 7, cy - 21],
            [cx + 5, cy - 29],
            [cx + 1, cy - 23],
          ],
          c,
        );
        circle(ctx, cx - 3, cy - 19, 2, '#9be37a');
        circle(ctx, cx + 3, cy - 19, 2, '#9be37a');
        rect(ctx, cx - 3.4, cy - 20.5, 0.9, 3, '#1b1b1b');
        rect(ctx, cx + 2.6, cy - 20.5, 0.9, 3, '#1b1b1b');
        circle(ctx, cx, cy - 15.5, 1, '#e84393');
        line(ctx, cx - 2, cy - 15, cx - 9, cy - 16, '#ffffff', 0.6);
        line(ctx, cx + 2, cy - 15, cx + 9, cy - 16, '#ffffff', 0.6);
      } else {
        // Curled up asleep, breathing, with floating Zzz
        const breathe = 1 + Math.sin(t * 2) * 0.06;
        ellipse(ctx, cx + 2, by - 6, 13, 7 * breathe, c);
        for (const sx of [-2, 4, 10]) rect(ctx, cx + sx, by - 12 * breathe, 2, 5, dark);
        ctx.strokeStyle = c;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(cx + 2, by - 5, 12, 0.2, 1.9);
        ctx.stroke();
        circle(ctx, cx - 9, by - 7, 6, c);
        poly(
          ctx,
          [
            [cx - 14, by - 10],
            [cx - 13, by - 16],
            [cx - 9, by - 12],
          ],
          c,
        );
        poly(
          ctx,
          [
            [cx - 7, by - 12],
            [cx - 4, by - 16],
            [cx - 3, by - 10],
          ],
          c,
        );
        line(ctx, cx - 12, by - 7, cx - 9.5, by - 7, '#3b2f2f', 1);
        line(ctx, cx - 8, by - 7, cx - 5.5, by - 7, '#3b2f2f', 1);
        for (let i = 0; i < 3; i++) {
          const k = (t * 0.35 + i / 3) % 1;
          label(ctx, 'z', cx - 12 + k * 10, by - 16 - k * 18, '#f4f1e6', 7 + k * 5, 1 - k);
        }
      }
      return true;
    }

    case 'dog': {
      // Kennel on the right, the dog in front of it on the left
      const kx = x + w - 34;
      const ky = y + h - 2;
      rect(ctx, kx + 3, ky - 20, 28, 20, '#b8834f');
      poly(
        ctx,
        [
          [kx, ky - 18],
          [kx + 17, ky - 32],
          [kx + 34, ky - 18],
        ],
        '#c0392b',
      );
      roundRect(ctx, kx + 10, ky - 14, 14, 14, 7, '#3b2618');
      rect(ctx, kx + 10, ky - 7, 14, 7, '#3b2618');
      rect(ctx, kx + 12, ky - 24, 10, 5, '#f4f1e6');
      label(ctx, 'BELLO', kx + 17, ky - 21.5, '#5c361d', 4.5);

      const c = obj.color ?? '#c8a26b';
      const excited = p < 2.4;
      const hop = excited ? Math.abs(Math.sin(p * 7)) * 7 * (1 - p / 2.4) : 0;
      const cx = x + 20;
      const cy = y + h - 11 - hop;
      ellipse(ctx, cx, y + h - 3, 12, 3, 'rgba(0,0,0,0.15)');
      const wag = Math.sin(t * (excited ? 26 : 6)) * (excited ? 0.9 : 0.5);
      ctx.lineCap = 'round';
      line(
        ctx,
        cx + 9,
        cy - 2,
        cx + 9 + Math.cos(-1.2 + wag) * 9,
        cy - 2 + Math.sin(-1.2 + wag) * 9,
        c,
        3,
      );
      ctx.lineCap = 'butt';
      for (const lx of [-7, -3, 4, 8]) rect(ctx, cx + lx, cy + 2, 3, 7 + hop * 0.3, shade(c, -0.1));
      ellipse(ctx, cx, cy, 11, 7, c);
      ellipse(ctx, cx + 3, cy - 1, 4, 3, '#f4f1e6');
      circle(ctx, cx - 9, cy - 8, 7, c);
      ellipse(ctx, cx - 15, cy - 6, 4.5, 3.5, shade(c, 0.1));
      circle(ctx, cx - 19, cy - 7, 1.8, '#1b1b1b');
      circle(ctx, cx - 10, cy - 10, 1.3, '#1b1b1b');
      ellipse(ctx, cx - 5, cy - 7, 3, 5.5, shade(c, -0.3));
      if (excited || Math.sin(t * 0.7) > 0.6) {
        // Panting tongue
        roundRect(ctx, cx - 17, cy - 3, 3.5, 5 + Math.sin(t * 12), 1.5, '#e84393');
      }
      return true;
    }

    case 'fishbowl': {
      const cx = x + w / 2;
      rect(ctx, cx - 9, y + h - 12, 18, 10, '#8b5a2b');
      rect(ctx, cx - 9, y + h - 12, 18, 3, '#a0703d');
      const by = y + h - 22;
      circle(ctx, cx, by, 11, 'rgba(190, 225, 245, 0.45)');
      ctx.fillStyle = 'rgba(63, 143, 201, 0.55)';
      ctx.beginPath();
      ctx.arc(cx, by, 11, 0.15, Math.PI - 0.15);
      ctx.fill();
      rect(ctx, cx - 3, by + 7, 6, 2, '#3fae49');
      if (p < 1.1) {
        // The goldfish leaps out and back in
        const k = p / 1.1;
        const fy = by + 2 - Math.sin(k * Math.PI) * 22;
        ellipse(ctx, cx + (k - 0.5) * 8, fy, 4, 2.6, '#f39c12');
        for (let i = 0; i < 4; i++)
          circle(ctx, cx - 8 + i * 5, by - 4 - Math.sin(k * Math.PI) * (6 + i * 2), 1, '#8cc7ee');
      } else {
        const fx = cx + Math.sin(t * 0.9) * 5;
        const dir = Math.cos(t * 0.9) > 0 ? 1 : -1;
        ellipse(ctx, fx, by + 3, 3.5, 2.2, '#f39c12');
        poly(
          ctx,
          [
            [fx - 3 * dir, by + 3],
            [fx - 6 * dir, by + 1],
            [fx - 6 * dir, by + 5],
          ],
          '#e67e22',
        );
        const k = (t * 0.5) % 1;
        circle(ctx, fx + 4 * dir, by + 1 - k * 8, 1, 'rgba(255,255,255,0.7)');
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, by, 11, 3.6, 4.4);
      ctx.stroke();
      return true;
    }

    case 'sink': {
      rect(ctx, x, y + 2, w, h - 2, '#dfe3e8');
      rect(ctx, x, y + 2, w, 8, '#9aa5b1');
      rect(ctx, x + w / 2 - 1, y + 10, 1, h - 10, '#b7c0ca');
      ellipse(ctx, x + w / 2, y + 7, w / 2 - 8, 4, '#6d7a87');
      const sx = x + w / 2 + 6;
      // Faucet
      rect(ctx, sx + 4, y - 10, 3, 12, '#c5ccd3');
      rect(ctx, sx - 3, y - 11, 10, 3, '#c5ccd3');
      rect(ctx, sx - 3, y - 9, 3, 4, '#c5ccd3');
      circle(ctx, sx + 5.5, y - 13, 2.5, p < 2.5 ? '#e74c3c' : '#5dade2');
      if (p < 2.5) {
        // Full blast!
        const wobble = Math.sin(anim.time * 40) * 0.6;
        rect(ctx, sx - 2.5 + wobble, y - 5, 2.5, 12, 'rgba(140, 199, 238, 0.9)');
        ellipse(ctx, x + w / 2, y + 7, (w / 2 - 9) * Math.min(1, p / 0.8), 3, '#8cc7ee');
        for (let i = 0; i < 5; i++) {
          const k = (anim.time * 2.5 + i / 5) % 1;
          circle(
            ctx,
            sx - 1 + Math.cos(i * 2.1) * k * 16,
            y + 6 - Math.sin(k * Math.PI) * 9,
            1.3,
            '#8cc7ee',
          );
        }
      } else {
        // Drip … drip …
        const k = (t * 0.6) % 1;
        if (k < 0.6) circle(ctx, sx - 1.5, y - 5 + (k / 0.6) * 10, 1.4, '#8cc7ee');
        else
          ellipse(
            ctx,
            sx - 1.5,
            y + 6,
            2 + (k - 0.6) * 10,
            1,
            `rgba(140,199,238,${1 - (k - 0.6) / 0.4})`,
          );
      }
      return true;
    }

    case 'radio': {
      const station = anim.pokes % 4;
      rect(ctx, x + 4, y + 8, w - 8, h - 8, '#8b5a2b');
      rect(ctx, x + 4, y + 8, w - 8, 3, '#a0703d');
      const shake = p < 0.4 ? Math.sin(p * 60) * 1.5 : 0;
      const beat = station === 3 ? 0 : Math.abs(Math.sin(t * (station === 1 ? 9 : 5))) * 1.2;
      const rx = x + 5 + shake;
      const ry = y - 8;
      line(ctx, rx + 18, ry, rx + 25, ry - 12, '#9aa5b1', 1);
      roundRect(ctx, rx, ry, 22, 16, 3, '#c0392b');
      circle(ctx, rx + 7, ry + 8, 5 + beat, '#3d3d3d');
      circle(ctx, rx + 7, ry + 8, 2, '#777');
      rect(ctx, rx + 14, ry + 4, 6, 4, '#f4f1e6');
      rect(ctx, rx + 15 + station * 1.3, ry + 4, 1, 4, '#c0392b');
      circle(ctx, rx + 17, ry + 12, 1.5, '#f2d03b');
      if (station === 3) {
        for (let i = 0; i < 6; i++) {
          const sx = rx + 4 + ((anim.time * 97 + i * 37) % 20);
          const sy = ry - 4 - ((anim.time * 53 + i * 19) % 12);
          rect(ctx, sx, sy, 1.5, 1.5, '#d5d8dc');
        }
      } else {
        notes(
          ctx,
          rx + 8,
          ry - 2,
          t * (station === 1 ? 2 : 1),
          ['#f4f1e6', '#f1c40f', '#e84393'][station],
        );
      }
      return true;
    }

    case 'cuckooClock': {
      const cx = x + w / 2;
      // Pendulum and weights
      const swing = Math.sin(anim.time * 3.2) * 0.35;
      ctx.save();
      ctx.translate(cx, y + 17);
      ctx.rotate(swing);
      rect(ctx, -0.5, 0, 1, 10, '#c9a227');
      circle(ctx, 0, 11, 2.5, '#c9a227');
      ctx.restore();
      rect(ctx, cx - 6, y + 17, 1, 9, '#3d3d3d');
      rect(ctx, cx + 5, y + 17, 1, 6, '#3d3d3d');
      roundRect(ctx, cx - 7.5, y + 25, 4, 5, 1, '#5c361d');
      roundRect(ctx, cx + 3.5, y + 22, 4, 5, 1, '#5c361d');
      // House-shaped case
      rect(ctx, cx - 9, y + 4, 18, 14, '#7a4b2a');
      poly(
        ctx,
        [
          [cx - 12, y + 6],
          [cx, y - 4],
          [cx + 12, y + 6],
        ],
        '#5c361d',
      );
      circle(ctx, cx, y + 11, 5, '#f4f1e6');
      const minute = anim.time * 0.4;
      line(ctx, cx, y + 11, cx + Math.sin(minute) * 4, y + 11 - Math.cos(minute) * 4, '#1b1b1b', 1);
      line(
        ctx,
        cx,
        y + 11,
        cx + Math.sin(minute / 12) * 2.5,
        y + 11 - Math.cos(minute / 12) * 2.5,
        '#1b1b1b',
        1.2,
      );
      // The cuckoo pops out when poked (and every 30 seconds)
      const auto = anim.time % 30;
      const out = p < 1.8 ? pulse(p, 1.8) : auto < 1.2 ? pulse(auto, 1.2) : 0;
      rect(ctx, cx - 3, y - 1, 6, 4, '#2b1a10');
      if (out > 0) {
        const bx = cx;
        const by = y + 1 - out * 5 + Math.sin(anim.time * 18) * out;
        line(ctx, bx, y + 2, bx, by + 2, '#c5ccd3', 1);
        bird(ctx, bx, by - 2, '#f1c40f', 1);
      }
      return true;
    }

    case 'birdBath': {
      const cx = x + w / 2;
      rect(ctx, cx - 3, y + 6, 6, h - 8, '#b3a993');
      rect(ctx, cx - 7, y + h - 4, 14, 3, '#9b9282');
      ellipse(ctx, cx, y + 5, 13, 5, '#cfc6b4');
      ellipse(ctx, cx, y + 4, 10, 3, '#8cc7ee');
      const fly = p < 2.6;
      if (fly) {
        const k = p / 2.6;
        const away = k < 0.5 ? k * 2 : (1 - k) * 2;
        const dir = k < 0.5 ? -1 : 1;
        bird(
          ctx,
          cx + 4 - away * 50,
          y - 2 - away * 70,
          '#a0703d',
          dir as 1 | -1,
          Math.abs(Math.sin(p * 20)),
        );
        for (let i = 0; i < 4; i++) {
          if (p > 0.5) break;
          circle(
            ctx,
            cx - 6 + i * 4,
            y + 2 - Math.sin((p / 0.5) * Math.PI) * (5 + i),
            1,
            '#8cc7ee',
          );
        }
      } else {
        const bathing = Math.sin(t * 1.5) > 0.7;
        const dir = Math.sin(t * 0.4) > 0 ? 1 : -1;
        bird(ctx, cx + 5 * dir, y - (bathing ? 1 : 3), '#a0703d', dir as 1 | -1);
        if (bathing) {
          for (let i = 0; i < 3; i++)
            circle(
              ctx,
              cx + 5 * dir - 4 + i * 4,
              y - 3 - Math.abs(Math.sin(t * 9 + i)) * 4,
              1,
              '#8cc7ee',
            );
        }
      }
      return true;
    }

    case 'butterflies':
    case 'bees': {
      const count = obj.sprite === 'bees' ? 3 : 2;
      for (let i = 0; i < count; i++) {
        const s = t * (obj.sprite === 'bees' ? 1.6 : 0.7) + i * 2.4;
        // Poked: they scatter, then come back
        const scatter = pulse(p, 1.6) * 30;
        const bx = x + w / 2 + Math.sin(s * 1.3) * (w / 2 - 6) + Math.cos(i * 2) * scatter;
        const by = y + 2 + Math.sin(s * 2.1 + i) * 10 - Math.cos(s * 0.7) * 6 - scatter * 0.6;
        if (obj.sprite === 'bees') {
          const jitter = Math.sin(anim.time * 37 + i) * 1;
          ellipse(ctx, bx, by + jitter, 3.5, 2.5, '#f1c40f');
          rect(ctx, bx - 0.8, by + jitter - 2.4, 1.2, 4.8, '#1b1b1b');
          rect(ctx, bx + 1.5, by + jitter - 2.2, 1, 4.4, '#1b1b1b');
          const flap = Math.abs(Math.sin(anim.time * 50 + i)) * 2 + 1;
          ellipse(ctx, bx - 1, by + jitter - 3.5, 2, flap, 'rgba(255,255,255,0.75)');
        } else {
          const flap = Math.abs(Math.sin(anim.time * 11 + i * 1.7));
          const c = ['#e84393', '#f1c40f', '#5dade2'][i % 3];
          ellipse(ctx, bx - 3 * flap, by - 2, 3.5 * flap + 0.5, 3.5, c);
          ellipse(ctx, bx + 3 * flap, by - 2, 3.5 * flap + 0.5, 3.5, c);
          ellipse(ctx, bx - 2 * flap, by + 2, 2 * flap + 0.4, 2, shade(c, -0.15));
          ellipse(ctx, bx + 2 * flap, by + 2, 2 * flap + 0.4, 2, shade(c, -0.15));
          rect(ctx, bx - 0.6, by - 3, 1.2, 6, '#3b2f2f');
        }
      }
      return true;
    }

    case 'windChime': {
      const cx = x + w / 2;
      rect(ctx, cx - 1, y, 2, 5, '#5c361d');
      ellipse(ctx, cx, y + 6, 11, 2, '#7a4b2a');
      const wind = Math.sin(t * 1.4) * 0.12 + wobble(p, 1.6, 9) * 0.5;
      const colors = ['#c5ccd3', '#d5c08b', '#c5ccd3', '#d5c08b', '#c5ccd3'];
      colors.forEach((c, i) => {
        const len = 10 + ((i * 3) % 7);
        const ox = cx - 8 + i * 4;
        const angle = wind * (1 + (i % 2) * 0.4) + Math.sin(t * 3 + i) * 0.05;
        ctx.save();
        ctx.translate(ox, y + 7);
        ctx.rotate(angle);
        rect(ctx, -0.3, 0, 0.6, 3, '#3d3d3d');
        rect(ctx, -1.2, 3, 2.4, len, c);
        ctx.restore();
      });
      if (p < 1.2) {
        for (let i = 0; i < 3; i++)
          label(
            ctx,
            '✦',
            cx - 10 + i * 10,
            y + 4 - (p / 1.2) * 12 + i * 3,
            '#f7dc6f',
            7,
            1 - p / 1.2,
          );
      }
      return true;
    }

    case 'shipBell': {
      const cx = x + w / 2;
      rect(ctx, x + 5, y - 22, 3, h + 18, '#5c361d');
      rect(ctx, x + w - 8, y - 22, 3, h + 18, '#5c361d');
      rect(ctx, x + 3, y - 24, w - 6, 4, '#7a4b2a');
      const angle = wobble(p, 1.3, 11) * 0.7 + Math.sin(t * 1.1) * 0.03;
      ctx.save();
      ctx.translate(cx, y - 20);
      ctx.rotate(angle);
      rect(ctx, -1, 0, 2, 3, '#3d3d3d');
      ctx.fillStyle = '#c9a227';
      ctx.beginPath();
      ctx.moveTo(-5, 4);
      ctx.quadraticCurveTo(-6, 14, -10, 17);
      ctx.lineTo(10, 17);
      ctx.quadraticCurveTo(6, 14, 5, 4);
      ctx.quadraticCurveTo(0, 1, -5, 4);
      ctx.fill();
      rect(ctx, -10, 16, 20, 2, '#a68414');
      rect(ctx, -3, 6, 2, 9, '#f2d03b');
      // Clapper
      circle(ctx, Math.sin(-angle * 2) * 3, 19, 2, '#3d3d3d');
      ctx.restore();
      if (p < 1.5) {
        ctx.strokeStyle = `rgba(242, 208, 59, ${1 - p / 1.5})`;
        ctx.lineWidth = 1.5;
        for (const r of [14, 20]) {
          ctx.beginPath();
          ctx.arc(cx, y - 10, r + p * 10, -2.6, -0.5);
          ctx.stroke();
        }
      }
      return true;
    }

    case 'mouse': {
      // Peeks out of its hole on the right, scurries to the left, sniffs and runs back
      const holeX = x + w - 8;
      const floor = y + h;
      ctx.fillStyle = '#1e1622';
      ctx.beginPath();
      ctx.arc(holeX, floor, 6, Math.PI, 0);
      ctx.fill();
      const cycle = (anim.time + seed * 14) % 14;
      let mx: number;
      let dir: 1 | -1 = 1;
      if (cycle < 3) return true;
      else if (cycle < 6) mx = holeX - ((cycle - 3) / 3) * (w - 24);
      else if (cycle < 8) mx = x + 16;
      else if (cycle < 11) {
        mx = x + 16 + ((cycle - 8) / 3) * (w - 24);
        dir = -1;
      } else return true;
      const pausing = cycle >= 6 && cycle < 8;
      if (pausing) dir = Math.sin(cycle * 6) > 0 ? 1 : -1;
      const my = floor - 4 - (pausing ? 0 : Math.abs(Math.sin(anim.time * 25)) * 1.2);
      line(
        ctx,
        mx + 5 * dir,
        my + 1,
        mx + 13 * dir,
        my - 1 + Math.sin(anim.time * 9),
        '#e7a1a8',
        0.8,
      );
      ellipse(ctx, mx, my, 6, 3.5, '#8e8e93');
      ellipse(ctx, mx - 5 * dir, my - 0.5, 3, 2.5, '#8e8e93');
      circle(ctx, mx - 2 * dir, my - 3.5, 2, '#a6a6ab');
      circle(ctx, mx - 2 * dir, my - 3.5, 1, '#e7a1a8');
      circle(ctx, mx - 8 * dir, my - 0.5, 0.9, '#e7a1a8');
      circle(ctx, mx - 5.5 * dir, my - 1.5, 0.6, '#1b1b1b');
      return true;
    }

    case 'seagull': {
      const cx = x + w / 2;
      roundRect(ctx, cx - 6, y + 2, 12, h - 4, 3, '#4a4a4a');
      ellipse(ctx, cx, y + 2, 6, 2.5, '#5d5d5d');
      const flying = p < 3;
      let gx = cx;
      let gy = y - 6;
      let dir: 1 | -1 = Math.sin(t * 0.8) > 0 ? 1 : -1;
      if (flying) {
        const k = p / 3;
        const away = k < 0.5 ? k * 2 : (1 - k) * 2;
        gx = cx + away * 70;
        gy = y - 6 - away * 90;
        dir = k < 0.5 ? -1 : 1;
      }
      ellipse(ctx, gx, gy + 1, 8, 5, '#f4f6f8');
      circle(ctx, gx - 6 * dir, gy - 5, 4, '#f4f6f8');
      circle(ctx, gx - 7 * dir, gy - 6, 0.9, '#1b1b1b');
      poly(
        ctx,
        [
          [gx - 9.5 * dir, gy - 5.5],
          [gx - 14 * dir, gy - 4],
          [gx - 9.5 * dir, gy - 3.5],
        ],
        '#f1c40f',
      );
      circle(ctx, gx - 12 * dir, gy - 4.4, 0.8, '#e74c3c');
      if (flying) {
        const flap = Math.sin(p * 18) * 8;
        poly(
          ctx,
          [
            [gx - 4, gy],
            [gx - 2, gy - 6 - flap],
            [gx + 8, gy - 4 - flap],
            [gx + 4, gy],
          ],
          '#c5ccd3',
        );
      } else {
        ellipse(ctx, gx + 2 * dir, gy, 6, 3.5, '#9aa5b1');
        poly(
          ctx,
          [
            [gx + 6 * dir, gy],
            [gx + 12 * dir, gy - 1],
            [gx + 7 * dir, gy + 3],
          ],
          '#3d3d3d',
        );
        rect(ctx, gx - 2, gy + 5, 1, 3, '#f1c40f');
        rect(ctx, gx + 2, gy + 5, 1, 3, '#f1c40f');
      }
      return true;
    }

    case 'jumpingFish': {
      const period = 3.3;
      const cycle = Math.floor((anim.time + seed * period) / period);
      const k = ((anim.time + seed * period) % period) / 1.1;
      const r = seedOf(`${obj.id}:${cycle}`);
      const fx = x + 16 + r * (w - 32);
      const base = y + h * (0.35 + r * 0.4);
      const dir = r > 0.5 ? 1 : -1;
      if (k < 1) {
        const jx = fx + (k - 0.5) * 30 * dir;
        const jy = base - Math.sin(k * Math.PI) * 26;
        ctx.save();
        ctx.translate(jx, jy);
        ctx.rotate((k - 0.5) * 2.2 * dir);
        ellipse(ctx, 0, 0, 6, 3, '#9aa5b1');
        ellipse(ctx, 0, 1, 5, 1.5, '#d5d8dc');
        poly(
          ctx,
          [
            [-5 * dir, 0],
            [-10 * dir, -3],
            [-10 * dir, 3],
          ],
          '#7f8c8d',
        );
        circle(ctx, 3.5 * dir, -0.8, 0.8, '#1b1b1b');
        ctx.restore();
      }
      for (const [at, sx] of [
        [0, fx - 15 * dir],
        [1, fx + 15 * dir],
      ] as const) {
        const age = k - at;
        if (age < 0 || age > 0.8) continue;
        ctx.strokeStyle = `rgba(244, 246, 248, ${1 - age / 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(sx, base, 4 + age * 14, 2 + age * 5, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      return true;
    }

    case 'buoy': {
      const cx = x + w / 2;
      const tilt = wobble(p, 1.4, 10) * 0.5;
      const bob = Math.sin(t * 2) * 2;
      ctx.strokeStyle = 'rgba(244,246,248,0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(cx, y + h - 6, 13 + Math.sin(t * 2) * 2, 4, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.save();
      ctx.translate(cx, y + h - 6 + bob);
      ctx.rotate(Math.sin(t * 1.3) * 0.1 + tilt);
      ellipse(ctx, 0, 0, 10, 5, '#c0392b');
      rect(ctx, -6, -18, 12, 16, '#e74c3c');
      rect(ctx, -6, -12, 12, 4, '#f4f1e6');
      rect(ctx, -1, -26, 2, 8, '#3d3d3d');
      poly(
        ctx,
        [
          [-4, -24],
          [0, -32],
          [4, -24],
        ],
        '#c9a227',
      );
      circle(ctx, Math.sin(-tilt * 3) * 2, -23, 1.5, '#3d3d3d');
      ctx.restore();
      return true;
    }

    case 'flag': {
      const px = x + 6;
      rect(ctx, px, y - 44, 3, h + 40, '#9aa5b1');
      circle(ctx, px + 1.5, y - 45, 2.5, '#c9a227');
      rect(ctx, px - 4, y + h - 6, 11, 4, '#7f8c8d');
      const fw = 30;
      const fh = 18;
      const top = y - 42;
      const stripe = (from: number, to: number, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        for (let i = 0; i <= 10; i++) {
          const fx = (i / 10) * fw;
          const wave = Math.sin(anim.time * 6 - i * 0.8) * (i / 10) * 3.5;
          const yy = top + from * fh + wave;
          i === 0 ? ctx.moveTo(px + 3 + fx, yy) : ctx.lineTo(px + 3 + fx, yy);
        }
        for (let i = 10; i >= 0; i--) {
          const fx = (i / 10) * fw;
          const wave = Math.sin(anim.time * 6 - i * 0.8) * (i / 10) * 3.5;
          ctx.lineTo(px + 3 + fx, top + to * fh + wave);
        }
        ctx.fill();
      };
      stripe(0, 0.5, '#2e86c1');
      stripe(0.5, 1, '#f4f1e6');
      return true;
    }

    case 'crab': {
      const cx = x + 10 + (0.5 + 0.5 * Math.sin(t * 0.55)) * (w - 20);
      const cy = y + h - 7;
      const moving = Math.abs(Math.cos(t * 0.55)) > 0.2;
      const step = moving ? Math.sin(anim.time * 20) * 1.5 : 0;
      ellipse(ctx, cx, cy + 5, 9, 2, 'rgba(0,0,0,0.15)');
      for (let i = 0; i < 3; i++) {
        const o = (i % 2 ? step : -step) * 0.8;
        line(ctx, cx - 5, cy + 1, cx - 10, cy + 4 + o + i, '#c0392b', 1.4);
        line(ctx, cx + 5, cy + 1, cx + 10, cy + 4 - o + i, '#c0392b', 1.4);
      }
      ellipse(ctx, cx, cy, 7, 5, '#e74c3c');
      const snap = Math.sin(anim.time * 4) > 0.3 ? 2 : 0;
      for (const s of [-1, 1]) {
        line(ctx, cx + 4 * s, cy - 3, cx + 9 * s, cy - 7, '#c0392b', 1.5);
        circle(ctx, cx + 10 * s, cy - 8, 3, '#e74c3c');
        poly(
          ctx,
          [
            [cx + 10 * s, cy - 9],
            [cx + (13 + snap) * s, cy - 12],
            [cx + 12 * s, cy - 8],
          ],
          '#fdebd0',
        );
      }
      rect(ctx, cx - 3, cy - 8, 1, 4, '#c0392b');
      rect(ctx, cx + 2, cy - 8, 1, 4, '#c0392b');
      circle(ctx, cx - 2.5, cy - 8.5, 1.4, '#1b1b1b');
      circle(ctx, cx + 2.5, cy - 8.5, 1.4, '#1b1b1b');
      return true;
    }

    case 'hamster': {
      // Cage with a running wheel; poking makes him sprint, then he's dizzy
      rect(ctx, x + 2, y + h - 10, w - 4, 8, '#3f78c9');
      rect(ctx, x + 4, y + h - 13, w - 8, 3, '#f0d9a0');
      const top = y - 16;
      ctx.strokeStyle = '#9aa5b1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x + 3.5, top + 0.5, w - 7, y + h - 10 - top, [8, 8, 0, 0]);
      for (let bx = x + 8; bx < x + w - 4; bx += 5) {
        ctx.moveTo(bx + 0.5, top + 2);
        ctx.lineTo(bx + 0.5, y + h - 10);
      }
      ctx.stroke();
      const wx = x + w * 0.35;
      const wy = y + h - 25;
      const sprint = p < 2.5;
      const dizzy = p >= 2.5 && p < 4.5;
      const spin = anim.time * (sprint ? 16 : dizzy ? 0 : 4);
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(wx, wy, 11, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = spin + (i * Math.PI) / 4;
        line(
          ctx,
          wx - Math.cos(a) * 10,
          wy - Math.sin(a) * 10,
          wx + Math.cos(a) * 10,
          wy + Math.sin(a) * 10,
          '#b7c0ca',
          1,
        );
      }
      rect(ctx, wx - 1, wy, 2, y + h - 13 - wy, '#7f8c8d');
      const run = sprint
        ? Math.sin(anim.time * 40) * 1.5
        : dizzy
          ? 0
          : Math.sin(anim.time * 14) * 1;
      const hx = dizzy ? x + w * 0.72 : wx;
      const hy = dizzy ? y + h - 17 : wy + 6 + run * 0.4;
      ellipse(ctx, hx, hy, 6, 4.5, '#e8b77a');
      ellipse(ctx, hx - 4, hy - 1, 3.5, 3.2, '#e8b77a');
      ellipse(ctx, hx + 1, hy + 1.5, 4, 2.5, '#fbe9d0');
      circle(ctx, hx - 4, hy - 4, 1.4, '#e7a1a8');
      circle(ctx, hx - 6, hy - 1.5, 0.8, '#1b1b1b');
      circle(ctx, hx - 7.3, hy - 0.5, 0.6, '#e84393');
      if (dizzy) {
        for (let i = 0; i < 3; i++) {
          const a = anim.time * 5 + (i * Math.PI * 2) / 3;
          label(ctx, '★', hx - 3 + Math.cos(a) * 6, hy - 9 + Math.sin(a) * 2, '#f1c40f', 6);
        }
      }
      // Water bottle
      roundRect(ctx, x + w - 12, top + 6, 5, 12, 2, 'rgba(140,199,238,0.8)');
      return true;
    }

    case 'xylophone': {
      poly(
        ctx,
        [
          [x + 3, y + 4],
          [x + w - 3, y + 8],
          [x + w - 3, y + h - 10],
          [x + 3, y + h - 4],
        ],
        '#a0703d',
      );
      const bars = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6'];
      const playing = p < 1.8 ? Math.floor((p / 1.8) * (bars.length + 1)) : -1;
      bars.forEach((c, i) => {
        const bx = x + 7 + i * ((w - 14) / bars.length);
        const shrink = i * 1.4;
        const hit = i === playing;
        const by = y + 2 + shrink / 2 + (hit ? 2 : 0);
        roundRect(
          ctx,
          bx,
          by,
          (w - 14) / bars.length - 2,
          h - 6 - shrink,
          2,
          hit ? shade(c, 0.25) : c,
        );
        circle(ctx, bx + 3, by + 3, 1, '#f4f1e6');
      });
      if (playing >= 0 && playing < bars.length) {
        // Mallet hopping from bar to bar
        const mx = x + 10 + playing * ((w - 14) / bars.length);
        line(ctx, mx, y - 2, mx + 12, y - 14, '#7a4b2a', 2);
        circle(ctx, mx, y - 2, 3, '#e84393');
      }
      if (p < 2.6) notes(ctx, x + w / 2, y - 4, p * 1.5, bars[anim.pokes % bars.length], 4);
      return true;
    }

    case 'pigeons': {
      const up = pulse(p, 2);
      for (let i = 0; i < 3; i++) {
        const px = x + 8 + i * ((w - 16) / 2);
        const dir: 1 | -1 = i % 2 ? -1 : 1;
        const py = y + h - 8 - (i % 2) * 3;
        ellipse(ctx, px, y + h - 3, 6, 2, 'rgba(0,0,0,0.12)');
        if (up > 0) {
          bird(
            ctx,
            px + Math.sin(i * 2 + p * 4) * 6 * up,
            py - up * (30 + i * 8),
            '#8e9eab',
            dir,
            Math.abs(Math.sin(p * 22 + i)),
          );
          continue;
        }
        const peck = Math.max(0, Math.sin(t * 3 + i * 1.9)) > 0.85;
        const walk = Math.sin(t * 0.5 + i) * 4;
        ellipse(ctx, px + walk, py, 6, 4.5, '#8e9eab');
        circle(ctx, px + walk - 5 * dir, py - (peck ? 0 : 5), 3.2, '#7f8c8d');
        rect(ctx, px + walk - 4 * dir - 1.5, py - (peck ? -2 : 3), 3, 2, '#58d68d');
        circle(ctx, px + walk - 6 * dir, py - (peck ? 0.5 : 5.5), 0.8, '#e67e22');
        poly(
          ctx,
          [
            [px + walk - 8 * dir, py - (peck ? 0 : 5)],
            [px + walk - 10 * dir, py + (peck ? 2 : -4)],
            [px + walk - 7.5 * dir, py - (peck ? -1 : 4)],
          ],
          '#3d3d3d',
        );
        poly(
          ctx,
          [
            [px + walk + 4 * dir, py - 1],
            [px + walk + 10 * dir, py - 2],
            [px + walk + 8 * dir, py + 2],
          ],
          '#5d6d7e',
        );
        rect(ctx, px + walk - 1, py + 4, 1, 3, '#e74c3c');
        rect(ctx, px + walk + 2, py + 4, 1, 3, '#e74c3c');
        if (peck)
          for (let k = 0; k < 2; k++)
            circle(ctx, px + walk - 9 * dir + k * 2, py + 5, 0.8, '#d4a056');
      }
      return true;
    }

    case 'squirrel': {
      // Scampers up and down the tree trunk it sits on
      const cycle = (anim.time + seed * 10) % 10;
      const cx = x + w / 2;
      const ground = y + h - 6;
      const crown = y - 16;
      let sy: number;
      let climbing = true;
      if (cycle < 3) {
        sy = ground;
        climbing = false;
      } else if (cycle < 4.5) sy = ground - ((cycle - 3) / 1.5) * (ground - crown);
      else if (cycle < 8) return true;
      else if (cycle < 9.5) sy = crown + ((cycle - 8) / 1.5) * (ground - crown);
      else {
        sy = ground;
        climbing = false;
      }
      const sx = climbing ? cx + 6 : cx + 14;
      const bob = Math.sin(anim.time * (climbing ? 24 : 3)) * 1;
      ellipse(ctx, sx + 5, sy - 6, 4, 7, '#a0522d');
      ellipse(ctx, sx + 6, sy - 11, 3, 4, '#b5652d');
      ellipse(ctx, sx, sy - 2 + bob, 4, 5, '#c0642d');
      circle(ctx, sx - 2, sy - 7 + bob, 3, '#c0642d');
      poly(
        ctx,
        [
          [sx - 3, sy - 9 + bob],
          [sx - 2, sy - 12 + bob],
          [sx - 0.5, sy - 9 + bob],
        ],
        '#c0642d',
      );
      circle(ctx, sx - 3, sy - 7.5 + bob, 0.7, '#1b1b1b');
      if (!climbing) circle(ctx, sx - 3, sy - 2 + bob, 2, '#7a4b2a');
      return true;
    }

    case 'bicycle': {
      const ring = p < 1.2;
      const shake = ring ? Math.sin(p * 50) * 0.8 : 0;
      const bx = x + shake;
      const wy = y + h - 9;
      for (const wx of [bx + 9, bx + w - 9]) {
        ctx.strokeStyle = '#2c2c34';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(wx, wy, 8, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = (i * Math.PI) / 3;
          line(
            ctx,
            wx - Math.cos(a) * 7,
            wy - Math.sin(a) * 7,
            wx + Math.cos(a) * 7,
            wy + Math.sin(a) * 7,
            '#b7c0ca',
            0.6,
          );
        }
      }
      const c = obj.color ?? '#16a085';
      const seat: [number, number] = [bx + 20, wy - 13];
      const head: [number, number] = [bx + w - 15, wy - 15];
      line(ctx, bx + 9, wy, seat[0], wy - 10, c, 2.5);
      line(ctx, seat[0], wy - 10, head[0], head[1], c, 2.5);
      line(ctx, bx + 9, wy, bx + 30, wy, c, 2.5);
      line(ctx, bx + 30, wy, head[0] - 2, head[1] + 1, c, 2.5);
      line(ctx, seat[0], wy - 10, bx + 30, wy, c, 2.5);
      line(ctx, head[0], head[1], bx + w - 9, wy, c, 2.5);
      line(ctx, head[0], head[1], head[0] - 2, head[1] - 6, '#3d3d3d', 2);
      line(ctx, head[0] - 5, head[1] - 6, head[0] + 3, head[1] - 6, '#3d3d3d', 2);
      roundRect(ctx, seat[0] - 5, seat[1] - 1, 10, 3, 1.5, '#2c2c34');
      circle(ctx, head[0] - 4, head[1] - 8, 2.2, ring ? '#f7dc6f' : '#c9a227');
      line(ctx, bx + 30, wy, bx + 26, y + h - 1, '#7f8c8d', 1.5);
      roundRect(ctx, bx + w - 16, head[1] + 2, 12, 8, 2, '#a0703d');
      if (ring) {
        for (const s of [-1, 1]) {
          ctx.strokeStyle = `rgba(247, 220, 111, ${1 - p / 1.2})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(
            head[0] - 4,
            head[1] - 8,
            5 + p * 8,
            s > 0 ? -0.8 : Math.PI - 0.8,
            s > 0 ? 0.8 : Math.PI + 0.8,
          );
          ctx.stroke();
        }
      }
      return true;
    }

    case 'steamWhistle': {
      const cx = x + w / 2;
      rect(ctx, cx - 2, y, 4, 12, '#7f8c8d');
      rect(ctx, cx - 10, y + 2, 20, 3, '#7f8c8d');
      const blowing = p < 2;
      const shake = blowing ? Math.sin(p * 70) * 0.8 : 0;
      roundRect(ctx, cx - 4 + shake, y + 10, 8, 12, 2, '#c9a227');
      rect(ctx, cx - 5 + shake, y + 14, 10, 2, '#a68414');
      circle(ctx, cx - 9, y + 3.5, 3, '#c0392b');
      const puffs = blowing ? 6 : 2;
      for (let i = 0; i < puffs; i++) {
        const k = ((blowing ? p * 1.6 : t * 0.4) + i / puffs) % 1;
        const r = blowing ? 4 + k * 10 : 2 + k * 4;
        circle(
          ctx,
          cx + Math.sin(i * 1.7 + k * 3) * (blowing ? 8 : 3),
          y + 10 - k * (blowing ? 40 : 14),
          r,
          `rgba(244, 246, 248, ${(1 - k) * (blowing ? 0.8 : 0.4)})`,
        );
      }
      return true;
    }

    case 'chocolateFountain': {
      const cx = x + w / 2;
      const choc = '#6b3e26';
      const splash = pulse(p, 1.2);
      ellipse(ctx, cx, y + h - 6, 14, 5, '#d5d8dc');
      ellipse(ctx, cx, y + h - 7, 11, 3.5, choc);
      rect(ctx, cx - 1.5, y - 24, 3, h + 16, '#c5ccd3');
      ellipse(ctx, cx, y - 2, 10, 3, '#d5d8dc');
      ellipse(ctx, cx, y - 16, 7, 2.5, '#d5d8dc');
      circle(ctx, cx, y - 26 - splash * 4, 3 + splash * 2, choc);
      // Curtains of chocolate running down
      for (const [top, bottom, r] of [
        [y - 26, y - 16, 7],
        [y - 16, y - 2, 10],
        [y - 2, y + h - 8, 13],
      ] as const) {
        for (let i = -2; i <= 2; i++) {
          const fx = cx + (i / 2) * r * 0.9;
          const k = (anim.time * 1.4 + i * 0.3) % 1;
          rect(ctx, fx - 1, top, 2, bottom - top, choc);
          circle(ctx, fx, top + k * (bottom - top), 1.6, '#8b5a3c');
        }
      }
      if (splash > 0) {
        for (let i = 0; i < 5; i++)
          circle(ctx, cx - 10 + i * 5, y - 28 - Math.sin(i + p * 6) * splash * 8, 1.5, choc);
      }
      return true;
    }

    case 'coffeeMachine': {
      rect(ctx, x + 2, y + 8, w - 4, h - 8, '#7a4b2a');
      rect(ctx, x + 2, y + 8, w - 4, 3, '#9c6b3c');
      const brewing = p < 3;
      const shake = brewing && p < 2 ? Math.sin(p * 80) * 0.7 : 0;
      const mx = x + 6 + shake;
      roundRect(ctx, mx, y - 18, 20, 26, 3, '#2c2c34');
      rect(ctx, mx + 2, y - 16, 16, 6, '#3d3d46');
      circle(ctx, mx + 15, y - 13, 1.5, brewing ? '#58d68d' : '#e74c3c');
      rect(ctx, mx + 7, y - 9, 6, 3, '#5d5d66');
      // Cup
      const fill = brewing ? Math.min(1, p / 2) : 1;
      roundRect(ctx, mx + 5, y + 1, 10, 7, 2, '#f4f6f8');
      rect(ctx, mx + 6, y + 7 - fill * 5, 8, fill * 5, '#6b3e26');
      if (brewing && p < 2) rect(ctx, mx + 9.5, y - 6, 1.2, 8, '#6b3e26');
      for (let i = 0; i < 3; i++) {
        const k = (anim.time * 0.7 + i / 3) % 1;
        const a = brewing ? 0.75 : 0.35;
        ctx.strokeStyle = `rgba(244,246,248,${(1 - k) * a})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(mx + 8 + i * 2, y);
        ctx.quadraticCurveTo(
          mx + 5 + i * 2 + Math.sin(k * 6) * 3,
          y - 6 - k * 6,
          mx + 8 + i * 2,
          y - 8 - k * 10,
        );
        ctx.stroke();
      }
      return true;
    }

    case 'printer': {
      rect(ctx, x + 4, y + 10, 3, h - 10, '#5d6d7e');
      rect(ctx, x + w - 7, y + 10, 3, h - 10, '#5d6d7e');
      rect(ctx, x + 2, y + 6, w - 4, 5, '#f4f6f8');
      const printing = p < 1.8;
      const shake = printing ? Math.sin(p * 60) * 0.6 : 0;
      const px = x + 5 + shake;
      roundRect(ctx, px, y - 10, w - 10, 14, 2, '#d5d8dc');
      rect(ctx, px + 2, y - 3, w - 14, 2, '#5d6d7e');
      circle(
        ctx,
        px + w - 14,
        y - 7,
        1.2,
        printing || Math.sin(anim.time * 4) > 0 ? '#58d68d' : '#1e8449',
      );
      rect(ctx, px + 4, y - 15, w - 18, 5, '#f4f6f8');
      // Paper pile grows with every poke
      const pile = Math.min(anim.pokes, 6) - (printing ? 1 : 0);
      for (let i = 0; i < pile; i++)
        rect(ctx, x + 8 + (i % 2), y + 3 - i, w - 16, 2, i % 2 ? '#ecf0f1' : '#ffffff');
      if (printing) {
        const k = Math.min(1, p / 1.2);
        rect(ctx, px + 4, y - 1, w - 18, k * 8, '#ffffff');
        for (let i = 0; i < 3; i++)
          rect(ctx, px + 6, y + 1 + i * 2.5, (w - 24) * Math.min(1, k * 1.5), 0.8, '#5d6d7e');
      }
      return true;
    }

    case 'fan': {
      const cx = x + w / 2;
      const cy = y - 10;
      ellipse(ctx, cx, y + h - 4, 9, 3, '#5d6d7e');
      rect(ctx, cx - 1.5, cy, 3, y + h - 4 - cy, '#7f8c8d');
      const turbo = p < 3;
      const spin = anim.time * (turbo ? 40 : 14);
      const sway = Math.cos(anim.time * 0.8);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.55 + 0.45 * Math.abs(sway), 1);
      circle(ctx, 0, 0, 12, 'rgba(200, 210, 220, 0.35)');
      for (let i = 0; i < 3; i++) {
        const a = spin + (i * Math.PI * 2) / 3;
        ctx.fillStyle = turbo ? 'rgba(93, 173, 226, 0.55)' : '#5dade2';
        ctx.beginPath();
        ctx.ellipse(Math.cos(a) * 6, Math.sin(a) * 6, 6, 2.6, a, 0, Math.PI * 2);
        ctx.fill();
      }
      circle(ctx, 0, 0, 2.5, '#2c3e50');
      ctx.strokeStyle = '#7f8c8d';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.moveTo(-12, 0);
      ctx.lineTo(12, 0);
      ctx.moveTo(0, -12);
      ctx.lineTo(0, 12);
      ctx.stroke();
      ctx.restore();
      // Wind lines, and on turbo a few papers whirling away
      for (let i = 0; i < (turbo ? 4 : 2); i++) {
        const k = (anim.time * (turbo ? 2 : 1) + i / 3) % 1;
        const wx = cx + sway * (14 + k * 40);
        ctx.strokeStyle = `rgba(244,246,248,${(1 - k) * 0.6})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx, cy - 6 + i * 4);
        ctx.lineTo(wx + sway * 8, cy - 6 + i * 4);
        ctx.stroke();
      }
      if (turbo) {
        for (let i = 0; i < 2; i++) {
          const k = Math.min(1, p / 2.4 + i * 0.15);
          ctx.save();
          ctx.translate(
            cx + sway * 10 - k * 50 * (i ? 1 : -0.6),
            cy - k * 30 - Math.sin(k * 8) * 4,
          );
          ctx.rotate(k * 9 + i);
          rect(ctx, -4, -5, 8, 10, `rgba(255,255,255,${1 - k})`);
          ctx.restore();
        }
      }
      return true;
    }
  }
  return false;
}
