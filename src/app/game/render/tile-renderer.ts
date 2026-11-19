import { TILE_SIZE as T } from '../../core/config';
import { SceneDefinition, TileDefinition } from '../../core/models/scene.model';
import { hash, rect, shade } from './draw-utils';

export function tileAt(scene: SceneDefinition, tx: number, ty: number): TileDefinition | undefined {
  const ch = scene.map[ty]?.[tx];
  return ch === undefined ? undefined : scene.tiles[ch];
}

/** Draws all tiles in the given (inclusive) tile range. */
export function drawTiles(
  ctx: CanvasRenderingContext2D,
  scene: SceneDefinition,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): void {
  for (let ty = Math.max(0, y0); ty <= Math.min(scene.map.length - 1, y1); ty++) {
    for (let tx = Math.max(0, x0); tx <= Math.min(scene.map[ty].length - 1, x1); tx++) {
      const tile = tileAt(scene, tx, ty);
      if (tile) drawTile(ctx, scene, tile, tx, ty);
    }
  }
}

function drawTile(ctx: CanvasRenderingContext2D, scene: SceneDefinition, tile: TileDefinition, tx: number, ty: number) {
  const px = tx * T;
  const py = ty * T;
  const { base, detail } = tile;
  rect(ctx, px, py, T, T, base);
  const rnd = hash(tx, ty);

  switch (tile.pattern) {
    case 'wood':
      for (let i = 0; i < 4; i++) {
        rect(ctx, px, py + i * 8 + 7, T, 1, detail);
        const seam = ((tx * 3 + ty * 5 + i * 7) % 4) * 8;
        rect(ctx, px + seam, py + i * 8, 1, 8, detail);
      }
      break;
    case 'checker':
      rect(ctx, px, py, T / 2, T / 2, detail);
      rect(ctx, px + T / 2, py + T / 2, T / 2, T / 2, detail);
      break;
    case 'carpet':
      for (const [dx, dy] of [
        [6, 6],
        [22, 14],
        [10, 24],
      ]) {
        rect(ctx, px + dx, py + dy, 2, 2, detail);
      }
      break;
    case 'grass':
      for (let i = 0; i < 3; i++) {
        const gx = (rnd >> (i * 5)) % 28;
        const gy = (rnd >> (i * 5 + 3)) % 28;
        rect(ctx, px + gx, py + gy, 2, 4, detail);
        rect(ctx, px + gx + 2, py + gy + 1, 1, 3, detail);
      }
      break;
    case 'path':
      for (let i = 0; i < 4; i++) {
        rect(ctx, px + ((rnd >> (i * 4)) % 28), py + ((rnd >> (i * 4 + 2)) % 28), 3, 2, detail);
      }
      break;
    case 'wall': {
      const below = tileAt(scene, tx, ty + 1);
      if (below && !below.solid) {
        // Front face of the wall: wallpaper with stripes and a skirting board
        rect(ctx, px, py, T, T, detail);
        for (let sx = 4; sx < T; sx += 8) rect(ctx, px + sx, py, 2, T, shade(detail, -0.05));
        rect(ctx, px, py, T, 4, base);
        rect(ctx, px, py + T - 5, T, 5, shade(detail, -0.3));
      } else {
        rect(ctx, px, py, T, T, base);
        rect(ctx, px, py, T, 2, shade(base, 0.08));
      }
      break;
    }
    case 'brick':
      for (let row = 0; row < 4; row++) {
        rect(ctx, px, py + row * 8 + 7, T, 1, detail);
        const offset = row % 2 === 0 ? 0 : 8;
        rect(ctx, px + offset, py + row * 8, 1, 8, detail);
        rect(ctx, px + offset + 16, py + row * 8, 1, 8, detail);
      }
      break;
    case 'fence':
      rect(ctx, px, py + 10, T, 3, detail);
      rect(ctx, px, py + 22, T, 3, detail);
      for (const fx of [3, 13, 23]) {
        rect(ctx, px + fx, py + 4, 6, 26, detail);
        rect(ctx, px + fx, py + 28, 6, 2, shade(detail, -0.25));
      }
      break;
    case 'door':
      rect(ctx, px + 2, py, T - 4, T, detail);
      rect(ctx, px + 4, py + 2, T - 8, T - 2, base);
      break;
    case 'water':
      for (let i = 0; i < 2; i++) {
        const wx = (rnd >> (i * 6)) % 22;
        const wy = 6 + i * 14 + ((rnd >> (i * 6 + 3)) % 6);
        rect(ctx, px + wx, py + wy, 6, 2, detail);
        rect(ctx, px + wx + 6, py + wy - 1, 4, 2, detail);
      }
      break;
    case 'plain':
      break;
  }
}
