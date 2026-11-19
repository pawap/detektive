# Die Detektiv-Geschwister

A 2D role-playing adventure for the browser, built with Angular 21 (standalone components, signals, zoneless).
Leah (8), Maja (6) and Nino (3) run their own detective agency. Every case starts at their house.

## Getting started

```bash
npm install
npm start          # http://localhost:4200
npm test           # unit tests (Vitest)
npm run build      # production build in dist/
```

## Controls

| Key                      | Action                                |
| ------------------------ | ------------------------------------- |
| Arrow keys / WASD        | Walk                                  |
| E / Space / Enter        | Inspect / talk / continue dialogue    |
| Tab / Q, 1–3             | Switch which sibling leads            |
| N                        | Notebook (team, active case, clues)   |
| Esc                      | Menu (save, back to title)            |

## Project structure

```
src/app/
  core/
    config.ts                 tile size, viewport, speeds, ids
    texts.ts                  all UI strings (German)
    models/                   Character, Scene, Case, Dialogue types
    data/
      characters.ts           Leah, Maja, Nino (look, age, speed)
      tiles.ts                shared tile set (map characters → tiles)
      scenes/                 house (start) + garden
      cases/index.ts          case registry
      cases/pirate-treasure.case.ts   case 1: „Der Schatz von Käpt’n Klabauter“ (museum + harbour)
    services/
      game-state.service.ts   progress: scene, flags, items, clues, cases, save/load (localStorage)
      dialogue.service.ts     dialogue queue
      overlay.service.ts      which panel is open
      input.service.ts        keyboard → actions
      scene-registry.service.ts
  game/
    engine/game-engine.ts     game loop, movement, collision, following siblings, interactions, camera
    render/                   procedural drawing of characters, tiles and furniture (no image assets yet)
    game-canvas/, hud/, dialogue-box/, overlays/ (case board, notebook, pause menu), character-preview/
  screens/
    title/                    title screen
    game/                     in-game screen
```

## How the game flow works

1. A new game starts in the kids' room (`house` scene) with Leah leading; her siblings follow.
2. The **case board** (Fallwand) in the kids' room lists all cases from `core/data/cases`. Accepting one makes it active.
3. The **garden gate** takes the siblings to the active case's `firstSceneId`.

## Adding content

**A scene:** create a `SceneDefinition` (map rows using tile characters from `tiles.ts`, spawns, objects, exits).
Home scenes go into `BASE_SCENES`; case scenes go into the case's `scenes` array.

**A grown-up (NPC):** a `SceneObject` with `sprite: 'person'`, an `npc` look (like a character's appearance,
plus optional `hat` and `beard`) and an optional `facing`.

**Objects that appear or disappear:** `showIf: 'some.flag'` / `hideIf: 'some.flag'` show or hide an object
(drawing, collision and interaction) depending on a game-state flag.

**An interaction:** give a `SceneObject` an `interaction`:

- `{ kind: 'dialogue', lines: [...] }`: use `speaker: ACTIVE_SPEAKER` for "whoever is leading"
- `{ kind: 'caseBoard' }`, `{ kind: 'departure' }`
- `{ kind: 'event', eventId: 'x' }`: runs `events.x(ctx)` of the active case, with access to the game state
  (`ctx.state.addClue(...)`, flags, items), dialogue (`ctx.say`) and scene changes (`ctx.goTo`).
  If no case is active (e.g. it is solved), the handler of the case that owns the current scene is used.

**A case:** add a `CaseDefinition` to `CASES`:

```ts
export const MY_CASE: CaseDefinition = {
  id: 'my-case',
  title: '…',
  summary: '…',
  firstSceneId: 'my-case-street',
  scenes: [MY_CASE_STREET],
  clues: [{ id: 'footprint', title: '…', description: '…' }],
  events: { inspectFootprint: (ctx) => { ctx.state.addClue('footprint'); ctx.say([...]); } },
};
```

The scene tests (`scenes.spec.ts`) check every registered scene: rectangular maps, known tiles, walkable spawns, valid exits.
