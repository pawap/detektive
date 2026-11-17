import { CharacterAppearance, Facing } from '../../core/models/character.model';
import { circle, ellipse, rect, roundRect, shade } from './draw-utils';

/** Height in pixels of a character with heightScale 1 at scale 1. */
export const BASE_CHARACTER_HEIGHT = 46;

export interface CharacterMetrics {
  /** Total height in px. */
  height: number;
  /** Head radius in px. */
  headRadius: number;
}

export function characterMetrics(look: CharacterAppearance, scale = 1): CharacterMetrics {
  const height = BASE_CHARACTER_HEIGHT * look.heightScale * scale;
  return { height, headRadius: height * 0.22 };
}

/**
 * Draws a chibi-style child, anchored at the centre of the feet (x, y).
 * `walkTime` > 0 animates the walk cycle.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  look: CharacterAppearance,
  x: number,
  y: number,
  facing: Facing,
  walkTime: number,
  scale = 1,
): void {
  const { height: h, headRadius: r } = characterMetrics(look, scale);
  const walking = walkTime > 0;
  const swing = walking ? Math.sin(walkTime * 11) : 0;
  const bob = walking ? Math.abs(Math.sin(walkTime * 11)) * h * 0.03 : 0;
  const side = facing === 'left' || facing === 'right';
  const dir = facing === 'left' ? -1 : 1;

  const legH = h * 0.2;
  const shoeH = Math.max(2, h * 0.05);
  const bodyW = r * 1.45;
  const headX = x;
  const headY = y - h + r - bob;
  const bodyTop = headY + r * 0.8;
  const bodyBottom = y - legH - bob;

  ctx.save();

  // Shadow
  ellipse(ctx, x, y, r * 0.95, r * 0.3, 'rgba(0, 0, 0, 0.22)');

  // Legs
  const legW = bodyW * 0.32;
  const legs = side
    ? [
        { lx: x - legW / 2 + swing * legW * 0.7, lift: 0 },
        { lx: x - legW / 2 - swing * legW * 0.7, lift: 0 },
      ]
    : [
        { lx: x - bodyW * 0.05 - legW, lift: Math.max(0, swing) * h * 0.05 },
        { lx: x + bodyW * 0.05, lift: Math.max(0, -swing) * h * 0.05 },
      ];
  for (const leg of legs) {
    rect(ctx, leg.lx, bodyBottom - 1, legW, y - shoeH - bodyBottom + 1 - leg.lift, look.pants);
    roundRect(ctx, leg.lx - (side ? 0 : 0.5), y - shoeH - leg.lift, legW + (side ? 1 : 1), shoeH, 1, look.shoes);
  }

  // Long hair falling behind the body
  if (look.hairStyle === 'long' && facing === 'down') {
    roundRect(ctx, headX - r * 1.05, headY, r * 2.1, r * 1.9, r * 0.4, shade(look.hairColor, -0.08));
  }

  // Arms (behind body when seen from the side)
  const armW = bodyW * 0.24;
  const armH = (bodyBottom - bodyTop) * 0.85;
  const drawArm = (ax: number, offset: number) => {
    roundRect(ctx, ax, bodyTop + r * 0.15 + offset, armW, armH, armW / 2, shade(look.shirt, -0.1));
    circle(ctx, ax + armW / 2, bodyTop + r * 0.15 + offset + armH, armW * 0.55, look.skin);
  };
  if (side) drawArm(x - armW / 2 - swing * armW, 0);

  // Body
  roundRect(ctx, x - bodyW / 2, bodyTop, bodyW, bodyBottom - bodyTop + 1, r * 0.4, look.shirt);

  if (!side) {
    drawArm(x - bodyW / 2 - armW * 0.75, swing * armH * 0.12);
    drawArm(x + bodyW / 2 - armW * 0.25, -swing * armH * 0.12);
  }

  // Long hair over the back
  if (look.hairStyle === 'long' && facing === 'up') {
    roundRect(ctx, headX - r * 1.05, headY, r * 2.1, r * 1.95, r * 0.4, look.hairColor);
  }
  if (look.hairStyle === 'long' && side) {
    roundRect(ctx, headX - dir * r * 0.55 - r * 0.475, headY, r * 0.95, r * 1.8, r * 0.4, look.hairColor);
  }

  // Head
  circle(ctx, headX, headY, r, look.skin);
  drawHair(ctx, look, headX, headY, r, facing);
  if (facing !== 'up') drawFace(ctx, headX, headY, r, facing);

  ctx.restore();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  look: CharacterAppearance,
  hx: number,
  hy: number,
  r: number,
  facing: Facing,
): void {
  const R = r * 1.08;
  ctx.fillStyle = look.hairColor;
  ctx.beginPath();
  if (facing === 'up') {
    ctx.arc(hx, hy, R, 0, Math.PI * 2);
  } else if (facing === 'down') {
    ctx.arc(hx, hy - r * 0.08, R, Math.PI, Math.PI * 2);
  } else if (facing === 'left') {
    ctx.moveTo(hx, hy);
    ctx.arc(hx, hy - r * 0.05, R, Math.PI, Math.PI * 2.35);
  } else {
    ctx.moveTo(hx, hy);
    ctx.arc(hx, hy - r * 0.05, R, Math.PI * 0.65, Math.PI * 2);
  }
  ctx.closePath();
  ctx.fill();

  // Fringe bumps for a softer hairline
  if (facing === 'down') {
    for (let i = -2; i <= 2; i++) circle(ctx, hx + i * r * 0.38, hy - r * 0.1, r * 0.24, look.hairColor);
  }

  switch (look.hairStyle) {
    case 'pigtails': {
      const tails =
        facing === 'up' || facing === 'down'
          ? [hx - r * 1.12, hx + r * 1.12]
          : [hx + (facing === 'left' ? 1 : -1) * r * 1.05];
      for (const tx of tails) {
        circle(ctx, tx, hy + r * 0.15, r * 0.42, look.hairColor);
        circle(ctx, tx + (tx < hx ? r * 0.25 : -r * 0.25), hy - r * 0.05, r * 0.13, look.accent);
      }
      break;
    }
    case 'short': {
      // A little tuft on top
      ctx.beginPath();
      ctx.moveTo(hx - r * 0.25, hy - R + r * 0.1);
      ctx.lineTo(hx + r * 0.05, hy - R - r * 0.3);
      ctx.lineTo(hx + r * 0.25, hy - R + r * 0.12);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 'long':
      break;
  }
}

function drawFace(ctx: CanvasRenderingContext2D, hx: number, hy: number, r: number, facing: Facing): void {
  const eye = '#2b2b3a';
  const blush = 'rgba(240, 120, 130, 0.45)';
  const eyeY = hy + r * 0.2;
  if (facing === 'down') {
    for (const s of [-1, 1]) {
      ellipse(ctx, hx + s * r * 0.38, eyeY, r * 0.11, r * 0.15, eye);
      circle(ctx, hx + s * r * 0.62, hy + r * 0.48, r * 0.15, blush);
    }
    ctx.strokeStyle = '#a0524f';
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.beginPath();
    ctx.arc(hx, hy + r * 0.45, r * 0.16, Math.PI * 0.15, Math.PI * 0.85);
    ctx.stroke();
  } else {
    const dir = facing === 'left' ? -1 : 1;
    ellipse(ctx, hx + dir * r * 0.5, eyeY, r * 0.11, r * 0.15, eye);
    circle(ctx, hx + dir * r * 0.32, hy + r * 0.5, r * 0.15, blush);
  }
}
