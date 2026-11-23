import { Ambience } from '../../core/models/scene.model';
import { circle, ellipse } from './draw-utils';

/** Wrap `v` into [0, size). */
const wrap = (v: number, size: number) => ((v % size) + size) % size;

/**
 * Scene-wide background animation, drawn over the map in world coordinates.
 * Everything is a pure function of time, so there is no particle state.
 */
export function drawAmbience(
  ctx: CanvasRenderingContext2D,
  kinds: readonly Ambience[],
  mapW: number,
  mapH: number,
  time: number,
): void {
  for (const kind of kinds) {
    switch (kind) {
      case 'leaves': {
        // Leaves blown across the scene by the wind, which comes in gusts
        const gust = 1 + Math.max(0, Math.sin(time * 0.4)) * 1.5;
        const colors = ['#e67e22', '#d4ac0d', '#c0392b', '#7cb342'];
        for (let i = 0; i < 9; i++) {
          const speed = 18 + (i % 4) * 6;
          const lx = wrap(i * 173 + time * speed * gust, mapW + 40) - 20;
          const ly = wrap(i * 97 + time * 9 + Math.sin(time * 1.3 + i) * 12, mapH);
          ctx.save();
          ctx.translate(lx, ly);
          ctx.rotate(time * (2 + (i % 3)) + i);
          ctx.scale(1, Math.abs(Math.sin(time * 3 + i)) * 0.8 + 0.2);
          ellipse(ctx, 0, 0, 4, 2, colors[i % colors.length]);
          ctx.restore();
        }
        break;
      }
      case 'gusts': {
        // Sea breeze: white streaks sweeping across
        ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
          const k = wrap(time * 0.35 + i * 0.23, 1);
          const gx = -60 + k * (mapW + 120);
          const gy = 30 + ((i * 131) % Math.max(1, mapH - 60));
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.sin(k * Math.PI) * 0.45})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.quadraticCurveTo(gx + 20, gy - 6 + Math.sin(time * 2 + i) * 4, gx + 40, gy);
          ctx.stroke();
        }
        ctx.lineCap = 'butt';
        break;
      }
      case 'dust': {
        // Dust motes dancing slowly in the air
        for (let i = 0; i < 18; i++) {
          const dx = wrap(i * 211 + Math.sin(time * 0.3 + i) * 20 + time * 3, mapW);
          const dy = wrap(i * 89 - time * (4 + (i % 3)), mapH);
          const a = 0.25 + 0.25 * Math.sin(time * 2 + i * 1.7);
          circle(ctx, dx, dy, 1.2, `rgba(255, 244, 214, ${a})`);
        }
        break;
      }
      case 'bubbles': {
        // Soap bubbles rising and popping
        for (let i = 0; i < 6; i++) {
          const period = 7 + (i % 3);
          const k = wrap(time / period + i / 6, 1);
          const bx = ((i * 157) % Math.max(1, mapW - 80)) + 40 + Math.sin(time * 1.5 + i) * 10;
          const by = mapH - 40 - k * (mapH - 60);
          const r = 4 + (i % 3) * 1.5;
          if (k > 0.92) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            for (let s = 0; s < 6; s++) {
              const a = (s * Math.PI) / 3;
              const d = r + (k - 0.92) * 80;
              ctx.beginPath();
              ctx.moveTo(bx + Math.cos(a) * d, by + Math.sin(a) * d);
              ctx.lineTo(bx + Math.cos(a) * (d + 2), by + Math.sin(a) * (d + 2));
              ctx.stroke();
            }
            continue;
          }
          ctx.strokeStyle = `hsla(${(time * 60 + i * 50) % 360}, 80%, 75%, 0.75)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(bx, by, r, 0, Math.PI * 2);
          ctx.stroke();
          circle(ctx, bx - r * 0.35, by - r * 0.35, 1, 'rgba(255, 255, 255, 0.8)');
        }
        break;
      }
    }
  }
}
