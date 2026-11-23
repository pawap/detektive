import { DEFAULT_SPAWN } from '../../config';
import { SceneDefinition } from '../../models/scene.model';
import { CASES } from '../cases';
import { LIVELY_DETAILS } from '../lively-details';
import { buildWorld } from '../world';

const ALL_SCENES: SceneDefinition[] = buildWorld();
const sceneIds = new Set(ALL_SCENES.map((s) => s.id));

describe.each(ALL_SCENES.map((s) => [s.id, s] as const))('scene "%s"', (_id, scene) => {
  const width = scene.map[0].length;
  const height = scene.map.length;
  const tileAt = (x: number, y: number) => scene.tiles[scene.map[Math.floor(y)]?.[Math.floor(x)]];

  it('has a rectangular map using only known tiles', () => {
    for (const row of scene.map) {
      expect(row.length).toBe(width);
      for (const ch of row) expect(scene.tiles[ch], `unknown tile "${ch}"`).toBeDefined();
    }
  });

  it('has a start spawn and all spawns stand on walkable tiles', () => {
    expect(scene.spawns[DEFAULT_SPAWN]).toBeDefined();
    for (const [name, spawn] of Object.entries(scene.spawns)) {
      expect(tileAt(spawn.x, spawn.y - 0.01)?.solid, `spawn "${name}"`).toBe(false);
    }
  });

  it('keeps objects inside the map', () => {
    for (const o of scene.objects) {
      expect(o.x >= 0 && o.y >= 0 && o.x + o.w <= width && o.y + o.h <= height, o.id).toBe(true);
    }
  });

  it('has unique object ids', () => {
    const ids = scene.objects.map((o) => o.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('links exits to existing scenes and spawns', () => {
    for (const exit of scene.exits) {
      expect(sceneIds.has(exit.target), exit.target).toBe(true);
      const target = ALL_SCENES.find((s) => s.id === exit.target)!;
      expect(target.spawns[exit.spawn], `${exit.target}.${exit.spawn}`).toBeDefined();
    }
  });
});

describe('cases', () => {
  const caseIds = new Set(CASES.map((c) => c.id));

  it('start in an existing scene', () => {
    for (const c of CASES) expect(sceneIds.has(c.firstSceneId), c.id).toBe(true);
  });

  it('only require existing cases and add objects to existing scenes', () => {
    for (const c of CASES) {
      for (const id of c.requires ?? []) expect(caseIds.has(id), `${c.id} requires ${id}`).toBe(true);
      for (const sceneId of Object.keys(c.extraObjects ?? {})) expect(sceneIds.has(sceneId), sceneId).toBe(true);
    }
  });

  it('only add lively details to existing scenes', () => {
    for (const sceneId of Object.keys(LIVELY_DETAILS))
      expect(sceneIds.has(sceneId), sceneId).toBe(true);
  });

  it('give every poke interaction at least one reaction', () => {
    for (const scene of ALL_SCENES) {
      for (const o of scene.objects) {
        if (o.interaction?.kind === 'poke')
          expect(o.interaction.reactions.length, `${scene.id}.${o.id}`).toBeGreaterThan(0);
      }
    }
  });

  it('have a handler for every event interaction', () => {
    for (const scene of ALL_SCENES) {
      const owner = CASES.find((c) => c.scenes.some((s) => s.id === scene.id));
      for (const o of scene.objects) {
        const interaction = o.interaction;
        if (interaction?.kind !== 'event') continue;
        const caseDef = interaction.caseId ? CASES.find((c) => c.id === interaction.caseId) : owner;
        expect(caseDef?.events?.[interaction.eventId], `${scene.id}.${o.id}`).toBeDefined();
      }
    }
  });
});
