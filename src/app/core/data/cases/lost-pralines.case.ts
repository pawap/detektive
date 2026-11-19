import { CaseDefinition, CaseEventContext } from '../../models/case.model';
import { ACTIVE_SPEAKER, DialogueLine } from '../../models/dialogue.model';
import { NpcLook, SceneDefinition, SceneObject } from '../../models/scene.model';
import type { GameStateService } from '../../services/game-state.service';
import { TILESET } from '../tiles';
import { PIRATE_TREASURE_CASE } from './pirate-treasure.case';

/**
 * Case 2: "Der Fall der verlorenen Pralinen" (unlocks after case 1)
 *
 * Mama's heart-shaped pralines – a present from Papa – have vanished, although
 * "there were still lots left". The trail leads through the kindergarten
 * (chocolate faces, but only birthday cake), the playground (a golden praline
 * cup with pastry crumbs on top of the slide – the office people next door
 * picnic there with baked goods every lunch break) and the chocolate factory
 * (order book: bought by the software office at the playground) to Papa's
 * office. Papa, a software developer who usually works from home, admits
 * to eating two or three. Asked again, Mama admits there were probably only two
 * left – she ate the rest herself. Papa comes home with a new box.
 *
 * Every sibling gets a moment: Nino talks to little Mo, Maja climbs the slide,
 * Leah reads the order book.
 */

const CASE_ID = 'lost-pralines';

const KITA = 'pralines-kita';
const PLAYGROUND = 'pralines-playground';
const FACTORY = 'pralines-factory';
const OFFICE = 'pralines-office';

const MAMA = 'Mama';
const PAPA = 'Papa';
const TEACHER = 'Frau Sonnenschein';
const PAUL = 'Paul';
const LOTTA = 'Lotta';
const MO = 'Mo';
const OMA = 'Oma Krümel';
const CHOCOLATIER = 'Frau Kakao';
const JANA = 'Kollegin Jana';
const BEN = 'Kollege Ben';
/** Papa's company. */
const COMPANY = 'Pixelwerk';

const FLAG = {
  metMama: 'pralines.metMama',
  metPapa: 'pralines.metPapa',
  /** Papa is home with the new box (end of the case). */
  papaHome: 'pralines.papaHome',
} as const;

const CLUE = {
  story: 'pralines.story',
  box: 'pralines.box',
  chocoFaces: 'pralines.chocoFaces',
  tip: 'pralines.tip',
  paperCup: 'pralines.paperCup',
  orderBook: 'pralines.orderBook',
  desk: 'pralines.desk',
  confession: 'pralines.confession',
} as const;

/** Evidence the siblings need before Papa owns up. */
const PAPA_EVIDENCE = [CLUE.paperCup, CLUE.orderBook, CLUE.desk];

// --- People ------------------------------------------------------------------

const SKIN = '#f6d2b5';

/** Where Papa stands at home: next to Mama, out of the way of anyone talking to her. */
const PAPA_HOME_SPOT = { x: 8.3, y: 8.7 };
/** His way in at the end: from the front door into the living room, up to Mama. */
const PAPA_WALK_IN = [
  { x: 12.5, y: 13 },
  { x: 12.5, y: 10.5 },
];
/** Drawn like a beard: a chocolate-smeared mouth. */
const CHOCOLATE_MOUTH = '#6b3e26';

const MAMA_LOOK: NpcLook = {
  hairColor: '#7a4a2a',
  hairStyle: 'long',
  accent: '#f2d03b',
  skin: SKIN,
  shirt: '#e88fa8',
  pants: '#e88fa8',
  shoes: '#a93246',
  heightScale: 1,
};

const PAPA_LOOK: NpcLook = {
  // Very short and sparse
  hairColor: '#5a4636',
  hairStyle: 'sparse',
  accent: '#34495e',
  skin: SKIN,
  shirt: '#34495e',
  pants: '#36508f',
  shoes: '#5c361d',
  heightScale: 1.08,
};

const TEACHER_LOOK: NpcLook = {
  hairColor: '#e6b85c',
  hairStyle: 'long',
  accent: '#f7c948',
  skin: SKIN,
  shirt: '#f7c948',
  pants: '#4a6fa5',
  shoes: '#3b2f2f',
  heightScale: 0.98,
};

const OMA_LOOK: NpcLook = {
  hairColor: '#d9d9d9',
  hairStyle: 'short',
  hat: 'bun',
  accent: '#d9d9d9',
  skin: SKIN,
  shirt: '#9b7fb8',
  pants: '#5d4b73',
  shoes: '#3b2f2f',
  heightScale: 0.92,
};

const CHOCOLATIER_LOOK: NpcLook = {
  hairColor: '#2c1b12',
  hairStyle: 'short',
  hat: 'chef',
  accent: '#6b3e26',
  skin: '#e8b98f',
  shirt: '#fdfdfd',
  pants: '#6b3e26',
  shoes: '#3b2f2f',
  heightScale: 1,
};

const kid = (look: Partial<NpcLook>): NpcLook => ({
  hairColor: '#c96f2d',
  hairStyle: 'short',
  accent: '#e84393',
  skin: SKIN,
  shirt: '#3498db',
  pants: '#2c3e50',
  shoes: '#c0392b',
  heightScale: 0.55,
  ...look,
});

const PAUL_LOOK = kid({ beard: CHOCOLATE_MOUTH });
const LOTTA_LOOK = kid({
  hairColor: '#2c1b12',
  hairStyle: 'pigtails',
  shirt: '#e84393',
  pants: '#7a4fa3',
  beard: CHOCOLATE_MOUTH,
});
const JANA_LOOK: NpcLook = {
  hairColor: '#b03a2e',
  hairStyle: 'long',
  accent: '#16a085',
  skin: SKIN,
  shirt: '#16a085',
  pants: '#2c3e50',
  shoes: '#3b2f2f',
  heightScale: 0.96,
};

const BEN_LOOK: NpcLook = {
  hairColor: '#2c1b12',
  hairStyle: 'short',
  beard: '#2c1b12',
  accent: '#f39c12',
  skin: '#d9a77c',
  shirt: '#f39c12',
  pants: '#36508f',
  shoes: '#222222',
  heightScale: 1.04,
};

const MO_LOOK = kid({
  hairColor: '#f5dc86',
  shirt: '#27ae60',
  pants: '#3f78c9',
  heightScale: 0.45,
});

// --- Scenes --------------------------------------------------------------------

const wallRow = (width: number) => '#'.repeat(width);
const roomRow = (width: number, floor: string) => '#' + floor.repeat(width - 2) + '#';
/** Bottom wall with a two-tile doorway in the middle. */
const doorRow = (width: number, floor: string) => {
  const side = (width - 2) / 2;
  return '#'.repeat(side) + floor.repeat(2) + '#'.repeat(side);
};
const room = (width: number, height: number, floor: string) => [
  wallRow(width),
  ...Array.from({ length: height - 2 }, () => roomRow(width, floor)),
  doorRow(width, floor),
];

const KITA_SCENE: SceneDefinition = {
  id: KITA,
  name: 'Kindergarten Sonnenschein',
  background: '#2a2233',
  tiles: TILESET,
  map: room(22, 12, 'k'),
  spawns: {
    start: { x: 11, y: 10.2, facing: 'up' },
    fromPlayground: { x: 11, y: 10.2, facing: 'up' },
  },
  exits: [{ x: 10, y: 11, w: 2, h: 1, target: PLAYGROUND, spawn: 'kitaDoor' }],
  objects: [
    {
      id: 'toy-shelf',
      label: 'Spielzeugregal',
      sprite: 'shelf',
      x: 1,
      y: 1,
      w: 3,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Bilderbücher, Puzzles und eine Kiste voller Holztiere.' },
          { speaker: 'nino', text: 'Mein Lieblingsbuch! Das mit dem Bagger!' },
        ],
      },
    },
    {
      id: 'crib-1',
      label: 'Schlafecke',
      sprite: 'crib',
      color: '#f7c948',
      x: 17,
      y: 1,
      w: 1,
      h: 1.5,
      solid: true,
      interaction: { kind: 'dialogue', lines: [{ text: 'Die Schlafecke. Nino gähnt ganz laut.' }] },
    },
    {
      id: 'crib-2',
      label: 'Schlafecke',
      sprite: 'crib',
      color: '#7fb3d5',
      x: 19,
      y: 1,
      w: 1,
      h: 1.5,
      solid: true,
    },
    {
      id: 'birthday-table',
      label: 'Geburtstagstisch',
      sprite: 'table',
      x: 8,
      y: 4,
      w: 4,
      h: 1.5,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            text: 'Ein Geburtstagstisch mit einem riesigen Schokokuchen. Also … mit dem, was davon übrig ist.',
          },
          { speaker: 'maja', text: 'Nur noch Krümel. Und eine Kerze mit einer 5 drauf.' },
        ],
      },
    },
    {
      id: 'teacher',
      label: TEACHER,
      sprite: 'person',
      npc: TEACHER_LOOK,
      facing: 'left',
      x: 14,
      y: 3,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkTeacher' },
    },
    {
      id: 'paul',
      label: PAUL,
      sprite: 'person',
      npc: PAUL_LOOK,
      facing: 'right',
      x: 7,
      y: 6,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { speaker: PAUL, text: 'Ich hab heute Geburtstag! Ich bin jetzt FÜNF!' },
          {
            speaker: 'maja',
            text: 'Herzlichen Glückwunsch! Du hast da übrigens … Schokolade im ganzen Gesicht.',
          },
          { speaker: PAUL, text: 'Das ist Kuchen. Drei Stück! Oder vier.' },
          { speaker: ACTIVE_SPEAKER, text: 'Ein Schokomund … sehr verdächtig.' },
        ],
      },
    },
    {
      id: 'lotta',
      label: LOTTA,
      sprite: 'person',
      npc: LOTTA_LOOK,
      facing: 'left',
      x: 12.5,
      y: 6.5,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            speaker: LOTTA,
            text: 'Ich war’s nicht! Ich hab nur Kuchen gegessen. Und Pudding. Und noch mal Kuchen.',
          },
          { speaker: 'nino', text: 'Ich will auch Pudding!' },
        ],
      },
    },
    {
      id: 'rug',
      label: 'Spielteppich',
      sprite: 'rug',
      color: '#7fb3d5',
      x: 15,
      y: 7,
      w: 4,
      h: 3,
      solid: false,
    },
    {
      id: 'mo',
      label: MO,
      sprite: 'person',
      npc: MO_LOOK,
      x: 16,
      y: 8,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkMo' },
    },
    {
      id: 'blocks',
      label: 'Bauklötze',
      sprite: 'box',
      color: '#3f78c9',
      x: 17.5,
      y: 8,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [{ text: 'Mo hat einen Turm gebaut. Er ist fast so groß wie Nino.' }],
      },
    },
    {
      id: 'coat-rack',
      label: 'Garderobe',
      sprite: 'coatRack',
      x: 1,
      y: 9,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [{ text: 'Lauter kleine Jacken. An einer klebt ein Gummibärchen.' }],
      },
    },
    { id: 'plant', label: 'Pflanze', sprite: 'plant', x: 20, y: 10, w: 1, h: 1, solid: true },
  ],
};

const PLAYGROUND_LAWN = 'f' + 'g'.repeat(11) + 'pp' + 'g'.repeat(11) + 'f';

const PLAYGROUND_SCENE: SceneDefinition = {
  id: PLAYGROUND,
  name: 'Spielplatz',
  background: '#4f8a45',
  tiles: TILESET,
  map: [
    // Kindergarten, chocolate factory and Papa's office face the playground
    'HHHddHHHHHHHddHHHHHHHddHHH',
    'f' + 'p'.repeat(24) + 'f',
    ...Array.from({ length: 11 }, () => PLAYGROUND_LAWN),
    'f'.repeat(12) + 'pp' + 'f'.repeat(12),
  ],
  spawns: {
    start: { x: 13, y: 12.2, facing: 'up' },
    kitaDoor: { x: 4, y: 2, facing: 'down' },
    factoryDoor: { x: 13, y: 2, facing: 'down' },
    officeDoor: { x: 22, y: 2, facing: 'down' },
  },
  exits: [
    { x: 3, y: 0, w: 2, h: 1, target: KITA, spawn: 'fromPlayground' },
    { x: 12, y: 0, w: 2, h: 1, target: FACTORY, spawn: 'fromPlayground' },
    { x: 21, y: 0, w: 2, h: 1, target: OFFICE, spawn: 'fromPlayground' },
    { x: 12, y: 13, w: 2, h: 1, target: 'garden', spawn: 'gate' },
  ],
  objects: [
    {
      id: 'sign-kita',
      label: 'Schild',
      sprite: 'sign',
      color: '#fff3c4',
      x: 1,
      y: 2,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'dialogue', lines: [{ text: '„Kindergarten Sonnenschein“' }] },
    },
    {
      id: 'sign-factory',
      label: 'Schild',
      sprite: 'sign',
      color: '#f7d6dc',
      x: 10,
      y: 2,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [{ text: '„Schokoladenfabrik Zuckerschnute – die feinsten Pralinen der Stadt“' }],
      },
    },
    {
      id: 'sign-office',
      label: 'Schild',
      sprite: 'sign',
      color: '#e0b981',
      x: 24,
      y: 2,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'dialogue', lines: [{ text: `„${COMPANY} – Softwarebüro“` }] },
    },
    {
      id: 'slide',
      label: 'Rutsche',
      sprite: 'slide',
      x: 3,
      y: 5,
      w: 2,
      h: 3,
      solid: true,
      interaction: { kind: 'event', eventId: 'inspectSlide' },
    },
    {
      id: 'swing',
      label: 'Schaukel',
      sprite: 'swing',
      x: 17,
      y: 5,
      w: 3,
      h: 2,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { speaker: 'maja', text: 'Schaukeln! Nur ganz kurz!' },
          { speaker: 'leah', text: 'Detektive schaukeln erst, wenn der Fall gelöst ist.' },
        ],
      },
    },
    {
      id: 'sandbox',
      label: 'Sandkasten',
      sprite: 'sandbox',
      x: 3,
      y: 10,
      w: 3,
      h: 2,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { speaker: 'nino', text: 'Ein Sandkasten! Größer als meiner!' },
          { text: 'Nino buddelt kurz. Er findet eine Schaufel, einen Stein und keine Pralinen.' },
        ],
      },
    },
    { id: 'bench', label: 'Parkbank', sprite: 'bench', x: 16, y: 10, w: 2, h: 1, solid: true },
    {
      id: 'oma',
      label: OMA,
      sprite: 'person',
      npc: OMA_LOOK,
      facing: 'left',
      x: 18.5,
      y: 10,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkOma' },
    },
    { id: 'tree-1', label: 'Linde', sprite: 'tree', x: 8, y: 4, w: 2, h: 1, solid: true },
    { id: 'tree-2', label: 'Ahorn', sprite: 'tree', x: 22, y: 8, w: 2, h: 1, solid: true },
    { id: 'tree-3', label: 'Kastanie', sprite: 'tree', x: 8, y: 11, w: 2, h: 1, solid: true },
    {
      id: 'flowers',
      label: 'Blumenbeet',
      sprite: 'flowers',
      x: 19,
      y: 12,
      w: 3,
      h: 1,
      solid: true,
    },
  ],
};

const FACTORY_SCENE: SceneDefinition = {
  id: FACTORY,
  name: 'Schokoladenfabrik Zuckerschnute',
  background: '#2a1d17',
  tiles: TILESET,
  map: room(24, 13, 'y'),
  spawns: {
    start: { x: 12, y: 11.2, facing: 'up' },
    fromPlayground: { x: 12, y: 11.2, facing: 'up' },
  },
  exits: [{ x: 11, y: 12, w: 2, h: 1, target: PLAYGROUND, spawn: 'factoryDoor' }],
  objects: [
    {
      id: 'vat',
      label: 'Schokoladenkessel',
      sprite: 'chocolateVat',
      x: 2,
      y: 2,
      w: 3,
      h: 2,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Ein riesiger Kupferkessel voller flüssiger Schokolade. Es blubbert.' },
          { speaker: 'nino', text: 'Ich will da reinspringen!' },
          { speaker: 'leah', text: 'Nein, Nino. Auf gar keinen Fall.' },
        ],
      },
    },
    {
      id: 'conveyor',
      label: 'Fließband',
      sprite: 'conveyor',
      x: 7,
      y: 3,
      w: 9,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            text: 'Auf dem Fließband fahren Pralinen vorbei. Jede sitzt in einem goldenen Papierförmchen.',
          },
          { speaker: 'maja', text: 'Goldene Förmchen … genau wie in Mamas Schachtel!' },
        ],
      },
    },
    {
      id: 'chocolatier',
      label: CHOCOLATIER,
      sprite: 'person',
      npc: CHOCOLATIER_LOOK,
      x: 12,
      y: 6,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkChocolatier' },
    },
    {
      id: 'order-desk',
      label: 'Bestellbuch',
      sprite: 'desk',
      x: 18,
      y: 8,
      w: 2,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'inspectOrderBook' },
    },
    {
      id: 'box-shelf',
      label: 'Pralinenregal',
      sprite: 'shelf',
      x: 18,
      y: 1,
      w: 3,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            text: 'Ein Regal voller Pralinenschachteln. Ganz oben: die Herzschachteln. Rot und glänzend.',
          },
        ],
      },
    },
    {
      id: 'boxes-1',
      label: 'Kartons',
      sprite: 'box',
      color: '#a93246',
      x: 2,
      y: 9,
      w: 1,
      h: 1,
      solid: true,
    },
    {
      id: 'boxes-2',
      label: 'Kartons',
      sprite: 'box',
      color: '#a0703d',
      x: 3,
      y: 9,
      w: 1,
      h: 1,
      solid: true,
    },
    {
      id: 'boxes-3',
      label: 'Kartons',
      sprite: 'box',
      color: '#a93246',
      x: 2,
      y: 10,
      w: 1,
      h: 1,
      solid: true,
    },
    { id: 'plant', label: 'Pflanze', sprite: 'plant', x: 22, y: 11, w: 1, h: 1, solid: true },
  ],
};

const OFFICE_SCENE: SceneDefinition = {
  id: OFFICE,
  name: 'Papas Büro',
  background: '#2a2233',
  tiles: TILESET,
  map: room(20, 11, 'o'),
  spawns: {
    start: { x: 10, y: 9.2, facing: 'up' },
    fromPlayground: { x: 10, y: 9.2, facing: 'up' },
  },
  exits: [{ x: 9, y: 10, w: 2, h: 1, target: PLAYGROUND, spawn: 'officeDoor' }],
  objects: [
    {
      id: 'papa-desk',
      label: 'Papas Schreibtisch',
      sprite: 'computerDeskCrumbs',
      x: 5,
      y: 3,
      w: 3,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'inspectDesk' },
    },
    {
      id: 'papa',
      label: PAPA,
      sprite: 'person',
      npc: PAPA_LOOK,
      facing: 'left',
      x: 8.3,
      y: 3,
      w: 1,
      h: 1,
      solid: true,
      hideIf: FLAG.papaHome,
      interaction: { kind: 'event', eventId: 'talkPapa' },
    },
    {
      id: 'jana-desk',
      label: 'Schreibtisch',
      sprite: 'computerDesk',
      color: '#a3c4bc',
      x: 12,
      y: 3,
      w: 3,
      h: 1,
      solid: true,
    },
    {
      id: 'jana',
      label: JANA,
      sprite: 'person',
      npc: JANA_LOOK,
      facing: 'left',
      x: 15.3,
      y: 3,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            speaker: JANA,
            text: 'Hallo! Ihr seid bestimmt die Detektiv-Kinder. Euer Papa erzählt ständig von euch.',
          },
          {
            speaker: JANA,
            text: 'Er arbeitet ja meistens von zu Hause. Aber wenn er hier ist, machen wir Mittagspause auf dem Spielplatz.',
          },
          {
            speaker: JANA,
            text: 'Mit Gebäck vom Bäcker! Heute gab es Croissants. Und Streuselschnecken.',
          },
          { speaker: 'nino', text: 'Schnecken? Igitt!' },
          { speaker: JANA, text: 'Hihi, keine echten Schnecken. Süße!' },
        ],
      },
    },
    {
      id: 'ben-desk',
      label: 'Schreibtisch',
      sprite: 'computerDesk',
      color: '#c39bd3',
      x: 12,
      y: 7,
      w: 3,
      h: 1,
      solid: true,
    },
    {
      id: 'ben',
      label: BEN,
      sprite: 'person',
      npc: BEN_LOOK,
      facing: 'left',
      x: 15.3,
      y: 7,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { speaker: BEN, text: 'Hmm … wo steckt nur dieser Fehler im Programm …' },
          {
            speaker: BEN,
            text: 'Oh, hallo! Ich suche Fehler. Ihr sucht Diebe. Dann sind wir ja quasi Kollegen!',
          },
          { speaker: 'maja', text: 'Haben Sie heute auch Pralinen gegessen?' },
          {
            speaker: BEN,
            text: 'Pralinen? Nein, nur drei Croissants. Oder vier. Auf dem Spielplatz krümelt man immer so.',
          },
        ],
      },
    },
    {
      id: 'bakery-bag',
      label: 'Bäckertüte',
      sprite: 'table',
      x: 2,
      y: 7,
      w: 3,
      h: 1.5,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Auf dem Tisch liegt eine leere Bäckertüte. Drinnen: nur noch Krümel.' },
          { speaker: 'nino', text: 'Krümel! Wie auf der Rutsche!' },
        ],
      },
    },
    {
      id: 'book-shelf',
      label: 'Bücherregal',
      sprite: 'shelf',
      x: 1,
      y: 1,
      w: 3,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Dicke Bücher: „Programmieren für Anfänger“, „Programmieren für Profis“ …' },
          { text: '… und „Programmieren für müde Papas“.' },
        ],
      },
    },
    { id: 'plant', label: 'Pflanze', sprite: 'plant', x: 18, y: 1, w: 1, h: 1, solid: true },
  ],
};

/** Mama, Papa and the praline box at home (added to the house scene). */
const HOUSE_OBJECTS: SceneObject[] = [
  {
    id: 'mama',
    label: MAMA,
    sprite: 'person',
    npc: MAMA_LOOK,
    facing: 'left',
    x: 7,
    y: 10,
    w: 1,
    h: 1,
    solid: true,
    // Her first appearance: she is home once the pirate case is solved
    showIf: `solved:${PIRATE_TREASURE_CASE.id}`,
    interaction: { kind: 'event', eventId: 'talkMama' },
  },
  {
    id: 'praline-box',
    label: 'Pralinenschachtel',
    sprite: 'pralineBox',
    x: 17,
    y: 3,
    w: 1,
    h: 1.6,
    solid: false,
    showIf: `solved:${PIRATE_TREASURE_CASE.id}`,
    hideIf: `solved:${CASE_ID}`,
    interaction: { kind: 'event', eventId: 'inspectBox' },
  },
  {
    id: 'praline-box-new',
    label: 'Neue Pralinenschachtel',
    sprite: 'pralineBoxFull',
    x: 17,
    y: 3,
    w: 1,
    h: 1.6,
    solid: false,
    showIf: `solved:${CASE_ID}`,
    interaction: { kind: 'event', eventId: 'inspectBox' },
  },
  {
    id: 'papa',
    label: PAPA,
    sprite: 'person',
    npc: PAPA_LOOK,
    facing: 'left',
    ...PAPA_HOME_SPOT,
    w: 1,
    h: 1,
    solid: true,
    // Appears at the front door at the end and walks in (see talkMama)
    showIf: FLAG.papaHome,
    interaction: { kind: 'event', eventId: 'talkPapa' },
  },
];

// --- Events --------------------------------------------------------------------

const isSolved = (state: GameStateService) => state.solvedCases().includes(CASE_ID);
const isActive = (state: GameStateService) => state.activeCaseId() === CASE_ID;

/** Leah's tip after switching leaders, e.g. "1" for Leah. */
const switchTip = (name: string, key: number): DialogueLine => ({
  text: `(Tipp: Mit Tab oder der Taste ${key} übernimmt ${name} die Führung.)`,
});

/** What Mama suggests next, depending on what the siblings already found. */
function mamaHint(state: GameStateService): DialogueLine[] {
  if (!state.hasClue(CLUE.box)) {
    return [
      {
        speaker: MAMA,
        text: 'Die leere Schachtel steht noch in der Küche auf dem Tisch. Vielleicht findet ihr da etwas?',
      },
    ];
  }
  if (!state.hasClue(CLUE.chocoFaces) || !state.hasClue(CLUE.tip)) {
    return [
      {
        speaker: MAMA,
        text: 'Die Kinder im Kindergarten lieben Schokolade SEHR. Ob die etwas wissen?',
      },
    ];
  }
  if (!state.hasClue(CLUE.paperCup)) {
    return [
      {
        speaker: MAMA,
        text: 'Der Spielplatz liegt gleich neben dem Kindergarten. Habt ihr da schon geschaut?',
      },
    ];
  }
  if (!state.hasClue(CLUE.orderBook)) {
    return [
      {
        speaker: MAMA,
        text: 'Ein goldenes Förmchen? Die Pralinen sind aus der Schokoladenfabrik am Spielplatz. Fragt doch dort mal!',
      },
    ];
  }
  return [
    {
      speaker: MAMA,
      text: 'Papa arbeitet heute ausnahmsweise nicht zu Hause, sondern im Büro am Spielplatz. Vielleicht kann er euch helfen?',
    },
  ];
}

function talkMama(ctx: CaseEventContext): void {
  const { state } = ctx;

  if (isSolved(state)) {
    ctx.say([
      {
        speaker: MAMA,
        text: 'Mmmh … Nougat-Herz. Danke, ihr Süßen. Und ab jetzt zähle ich meine Pralinen. Ganz genau!',
      },
    ]);
    return;
  }

  if (!state.flag(FLAG.metMama)) {
    ctx.say(
      [
        {
          speaker: MAMA,
          text: 'Da sind ja meine drei Schatzsucher! Ich habe schon gehört: Ihr habt den Piratenschatz gefunden!',
        },
        { speaker: 'leah', text: 'Mama! Ja! Und der Schatz war aus Schokolade!' },
        { speaker: MAMA, text: 'Das sehe ich. Nino, du hast Schokolade bis zu den Ohren.' },
        { speaker: 'nino', text: 'Piratenschoki!' },
        {
          speaker: MAMA,
          text: 'Wo wir gerade von Schokolade sprechen … ich hätte da selbst einen Fall für euch. Einen kniffligen.',
        },
        {
          speaker: MAMA,
          text: 'Papa hat mir doch neulich Herzpralinen geschenkt. Die ganz feinen, mit Nougat. Weil er mich so lieb hat.',
        },
        { speaker: MAMA, text: 'Da waren noch ganz viele drin. Bestimmt … ganz, ganz viele!' },
        {
          speaker: MAMA,
          text: 'Und eben wollte ich mir eine nehmen – und die Schachtel ist LEER!',
        },
        { speaker: 'maja', text: 'Ein Pralinen-Dieb! Bei uns im Haus!' },
        { speaker: 'nino', text: 'Ich war’s nicht! Ich hatte Piratenschoki!' },
        {
          speaker: MAMA,
          text: 'Ich weiß, mein Schatz. Die Schachtel steht noch in der Küche. Vielleicht findet ihr dort eine Spur?',
        },
        {
          speaker: 'leah',
          text: 'Keine Sorge, Mama. Die Detektiv-Geschwister übernehmen den Fall!',
        },
        { text: 'Neuer Fall: „Der Fall der verlorenen Pralinen“' },
      ],
      () => {
        state.setFlag(FLAG.metMama, true);
        state.addClue(CLUE.story);
        if (!isActive(state)) state.startCase(CASE_ID);
      },
    );
    return;
  }

  if (!state.hasClue(CLUE.confession)) {
    ctx.say([
      { speaker: MAMA, text: 'Und, meine Detektive? Habt ihr schon eine Spur?' },
      ...mamaHint(state),
    ]);
    return;
  }

  const papaComesHome: DialogueLine[] = [
    { speaker: PAPA, text: 'Hallo, ihr Lieben! Ich bin zu Hause!' },
    {
      speaker: PAPA,
      text: 'Und ich habe etwas mitgebracht: Heute Morgen war ich schon in der Schokoladenfabrik. Eine neue Schachtel Herzpralinen!',
    },
    { speaker: 'maja', text: 'DESHALB standen zwei Schachteln im Bestellbuch!' },
    {
      speaker: PAPA,
      text: 'Ich wusste doch, dass die alte fast leer war. Ich hab ja die letzten zwei gegessen.',
    },
    { speaker: MAMA, text: 'Oh, mein Schatz! Du bist der Beste.' },
    { speaker: 'nino', text: 'Schoki für alle!' },
    {
      text: 'FALL GELÖST! Die Detektiv-Geschwister haben den Fall der verlorenen Pralinen geknackt.',
    },
    { text: 'Und diesmal zählt Mama ihre Pralinen ganz genau. Eins … zwei … mmmh.' },
  ];
  const finish = () => ctx.say(papaComesHome, () => state.solveCase(CASE_ID));

  // Papa is already home (e.g. the game was closed during the ending): just finish
  if (state.flag(FLAG.papaHome)) {
    finish();
    return;
  }

  ctx.say(
    [
      {
        speaker: 'leah',
        text: 'Mama, wir haben mit Papa gesprochen. Er hat Pralinen gegessen. Aber nur zwei oder drei!',
      },
      { speaker: MAMA, text: 'Nur zwei oder drei? Aber es waren doch noch so viele drin …' },
      { speaker: 'maja', text: 'Papa sagt, die Schachtel war da schon fast leer.' },
      { speaker: MAMA, text: 'Fast leer? Hmm … lasst mich mal nachdenken …' },
      {
        speaker: MAMA,
        text: 'Gestern Abend … auf dem Sofa … bei meinem Krimi … da habe ich vielleicht … eine Praline genascht.',
      },
      { speaker: 'nino', text: 'Eine?' },
      {
        speaker: MAMA,
        text: 'Na gut. Ein paar. Ziemlich viele. Oh je … dann waren wohl wirklich nur noch zwei übrig.',
      },
      {
        speaker: 'leah',
        text: 'Fall gelöst! Die meisten Pralinen hat Mama selbst gegessen – und Papa nur die letzten zwei.',
      },
      { speaker: 'maja', text: 'Mama, du bist eine Naschkatze!' },
      { speaker: MAMA, text: 'Ertappt! Ihr seid wirklich die besten Detektive der Welt.' },
      { text: 'Da geht die Haustür auf.' },
    ],
    () => {
      // Papa appears in the doorway and walks over to Mama, then the dialogue goes on
      state.setFlag(FLAG.papaHome, true);
      ctx.walk('papa', PAPA_WALK_IN, finish);
    },
  );
}

function inspectBox(ctx: CaseEventContext): void {
  const { state } = ctx;

  if (state.flag(FLAG.papaHome)) {
    ctx.say([
      { text: 'Die neue Herzschachtel von Papa. Randvoll mit Nougat-Pralinen!' },
      { speaker: 'nino', text: 'Eine für mich? Bitte, bitte?' },
    ]);
    return;
  }
  if (!isActive(state)) {
    ctx.say([
      { text: 'Eine rote Herzschachtel. Mamas Pralinen – ein Geschenk von Papa.' },
      { speaker: ACTIVE_SPEAKER, text: 'Die ist ja leer! Wir sollten mal mit Mama reden.' },
    ]);
    return;
  }
  if (state.hasClue(CLUE.box)) {
    ctx.say([
      { text: 'Die leere Herzschachtel. Lauter goldene Förmchen – und keine einzige Praline.' },
    ]);
    return;
  }
  ctx.say(
    [
      {
        text: 'Eine rote Herzschachtel. Auf dem Deckel steht: „Herzpralinen – Schokoladenfabrik Zuckerschnute“.',
      },
      { text: 'Drinnen: lauter leere goldene Papierförmchen. Keine einzige Praline mehr.' },
      { speaker: 'maja', text: 'Hier ist ein Schoko-Fingerabdruck am Rand!' },
      {
        speaker: 'leah',
        text: 'Ganz schön groß … Aber vielleicht auch von einem Kind mit großen Händen?',
      },
      { speaker: 'nino', text: 'Kinder lieben Schoki! Kindergarten!' },
      {
        speaker: 'leah',
        text: 'Gute Idee, Nino. Wir fangen im Kindergarten an. Los, durchs Gartentor!',
      },
    ],
    () => state.addClue(CLUE.box),
  );
}

function talkTeacher(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.chocoFaces)) {
    ctx.say([
      {
        speaker: TEACHER,
        text: 'Viel Erfolg, ihr Detektive! Und Paul: Bitte Hände waschen. Und Gesicht. Und Haare.',
      },
    ]);
    return;
  }
  ctx.say(
    [
      {
        speaker: TEACHER,
        text: 'Hallo! Ihr seid doch die Detektiv-Geschwister. Schön, dich zu sehen, Nino!',
      },
      {
        speaker: 'leah',
        text: 'Hallo, Frau Sonnenschein! Wir suchen einen Pralinen-Dieb. Und hier gibt es Kinder, die Schokolade SEHR mögen …',
      },
      { speaker: 'maja', text: 'Paul und Lotta haben ganz braune Münder. Verdächtig!' },
      {
        speaker: TEACHER,
        text: 'Hihi. Paul hat heute Geburtstag, da gab es Schokokuchen. Darum sind alle so … schokoladig.',
      },
      {
        speaker: TEACHER,
        text: 'Und Pralinen hatte hier niemand. Die Kinder waren den ganzen Tag bei mir. Ich hätte es gemerkt!',
      },
      {
        speaker: 'leah',
        text: 'Dann haben die Schokomünder ein Alibi. Schade … äh, ich meine: gut!',
      },
      {
        speaker: TEACHER,
        text: 'Fragt doch mal den kleinen Mo. Der sieht immer alles. Aber er redet nicht mit jedem.',
      },
    ],
    () => state.addClue(CLUE.chocoFaces),
  );
}

function talkMo(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.tip)) {
    ctx.say([
      { speaker: MO, text: 'Rutsche! Goldi! Mampf!' },
      { speaker: 'nino', text: 'Mampf!' },
    ]);
    return;
  }
  if (state.activeCharacter() !== 'nino') {
    ctx.say([
      { text: 'Mo versteckt sich hinter seinem Bauklotzturm.' },
      { speaker: MO, text: '… Nö.' },
      {
        speaker: ACTIVE_SPEAKER,
        text: 'Mo ist noch ganz klein. Vielleicht redet er lieber mit jemandem in seiner Größe …',
      },
      switchTip('Nino', 3),
    ]);
    return;
  }
  ctx.say(
    [
      { speaker: 'nino', text: 'Hallo Mo! Ich bin Detektiv!' },
      { speaker: MO, text: 'Hallo Nino!' },
      { speaker: 'nino', text: 'Hast du Schoki gesehen? Goldene?' },
      { speaker: MO, text: 'Goldi! Auf Rutsche! Großer Mann rutscht. Mampf, mampf!' },
      { speaker: 'nino', text: 'Großer Mann? Mampf?' },
      { speaker: MO, text: 'Mampf!' },
      {
        speaker: 'leah',
        text: 'Ein großer Mann hat auf der Rutsche am Spielplatz etwas Goldenes gegessen? Super, Nino!',
      },
      { speaker: 'maja', text: 'Der Spielplatz ist direkt vor der Tür. Los!' },
    ],
    () => state.addClue(CLUE.tip),
  );
}

function inspectSlide(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.paperCup)) {
    ctx.say([{ text: 'Die rote Rutsche.' }, { speaker: 'maja', text: 'Wiiiii! Einmal noch!' }]);
    return;
  }
  if (!state.hasClue(CLUE.tip)) {
    ctx.say([
      { text: 'Eine große rote Rutsche mit einer hohen Leiter.' },
      { speaker: 'maja', text: 'Rutschen wir später? Jetzt wird erst ermittelt!' },
    ]);
    return;
  }
  if (state.activeCharacter() !== 'maja') {
    ctx.say([
      {
        text: 'Ganz oben auf der Plattform glitzert etwas Goldenes. Aber die Leiter ist hoch und wackelig.',
      },
      { speaker: 'maja', text: 'Lasst mich! Ich bin die beste Kletterin der ganzen Familie!' },
      switchTip('Maja', 2),
    ]);
    return;
  }
  ctx.say(
    [
      { text: 'Maja klettert flink wie ein Eichhörnchen die Leiter hinauf.' },
      {
        speaker: 'maja',
        text: 'Hab’s! Ein goldenes Papierförmchen! Genau wie in Mamas Schachtel!',
      },
      { speaker: 'maja', text: 'Und da kleben Krümel dran. Kuchenkrümel! Oder … Croissantkrümel?' },
      { speaker: 'maja', text: 'Wiiiiiiiiii!' },
      { text: 'Maja saust die Rutsche hinunter und landet direkt vor ihren Geschwistern.' },
      {
        speaker: 'leah',
        text: 'Ein Pralinen-Förmchen mit Gebäckkrümeln … Wer isst denn auf dem Spielplatz Pralinen UND Kuchen?',
      },
    ],
    () => state.addClue(CLUE.paperCup),
  );
}

function talkOma(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.paperCup) && !state.hasClue(CLUE.orderBook)) {
    ctx.say([
      { speaker: ACTIVE_SPEAKER, text: 'Oma Krümel, kennen Sie dieses goldene Förmchen?' },
      {
        speaker: OMA,
        text: 'Oh, das ist von den Herzpralinen! Die gibt es nur in der Schokoladenfabrik Zuckerschnute.',
      },
      {
        speaker: OMA,
        text: 'Gleich da oben, die mittlere Tür. Frau Kakao weiß alles über ihre Pralinen.',
      },
      {
        speaker: OMA,
        text: 'Und die Krümel? Die sind bestimmt von den Büroleuten. Die picknicken hier mittags immer mit Gebäck.',
      },
    ]);
    return;
  }
  if (state.hasClue(CLUE.paperCup)) {
    ctx.say([
      {
        speaker: OMA,
        text: 'Gurr, gurr! Na, ihr Detektive? Die Tauben und ich drücken euch die Daumen.',
      },
    ]);
    return;
  }
  ctx.say([
    {
      speaker: OMA,
      text: 'Hallo, ihr Süßen! Ich bin Oma Krümel. Ich füttere hier jeden Tag die Tauben. Gurr, gurr!',
    },
    {
      speaker: OMA,
      text: 'Mittags kommen immer die Leute aus dem Büro da drüben und essen hier Gebäck. Krümel für meine Tauben!',
    },
    {
      speaker: OMA,
      text: 'Und heute ist einer von denen sogar gerutscht. Wie ein kleines Kind! Hihi!',
    },
    { speaker: 'maja', text: 'Ein großer Mann auf der Rutsche? Merkwürdig …' },
  ]);
}

function talkChocolatier(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.orderBook)) {
    ctx.say([
      {
        speaker: CHOCOLATIER,
        text: 'Zwei Schachteln Herzpralinen für denselben Kunden … der muss jemanden SEHR lieb haben!',
      },
    ]);
    return;
  }
  if (state.hasClue(CLUE.paperCup)) {
    ctx.say([
      { speaker: 'leah', text: 'Frau Kakao, wir haben dieses Förmchen auf der Rutsche gefunden.' },
      {
        speaker: CHOCOLATIER,
        text: 'Zeigt mal her … Eindeutig! Das ist ein Förmchen von unseren Herzpralinen.',
      },
      { speaker: CHOCOLATIER, text: 'Die sind sehr teuer. Davon verkaufen wir nicht viele.' },
      {
        speaker: CHOCOLATIER,
        text: 'Wer sie gekauft hat, steht in unserem Bestellbuch dort am Pult. Schaut ruhig nach!',
      },
    ]);
    return;
  }
  ctx.say([
    {
      speaker: CHOCOLATIER,
      text: 'Willkommen in der Schokoladenfabrik Zuckerschnute! Ich bin Frau Kakao, die Chef-Chocolatière.',
    },
    {
      speaker: CHOCOLATIER,
      text: 'Unsere feinsten Pralinen sind die Herzpralinen mit Nougat. Jede in einem goldenen Förmchen.',
    },
    { speaker: 'nino', text: 'Probieren?' },
    { speaker: CHOCOLATIER, text: 'Eine winzige Kostprobe für jeden. Aber nur eine!' },
    { speaker: 'nino', text: 'Mmmmmmh!' },
    {
      speaker: 'leah',
      text: 'Herzpralinen … genau die sind bei Mama verschwunden. Wir brauchen eine Spur, bevor wir weiterfragen.',
    },
  ]);
}

function inspectOrderBook(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.orderBook)) {
    ctx.say([{ text: `Das Bestellbuch: zweimal Herzpralinen für „${COMPANY} – Softwarebüro“.` }]);
    return;
  }
  if (!state.hasClue(CLUE.paperCup)) {
    ctx.say([
      { text: 'Ein dickes Buch voller Namen und Zahlen.' },
      {
        speaker: ACTIVE_SPEAKER,
        text: 'Ohne Spur wissen wir gar nicht, wonach wir suchen sollen.',
      },
    ]);
    return;
  }
  const reader = state.activeCharacter();
  if (reader !== 'leah') {
    ctx.say([
      reader === 'maja'
        ? {
            speaker: 'maja',
            text: 'H … e … r … z … Puh, das ist ja Schreibschrift! Die kann nur Leah lesen.',
          }
        : { speaker: 'nino', text: 'Ich kann nur Bilder lesen! Da ist ein Herz!' },
      switchTip('Leah', 1),
    ]);
    return;
  }
  ctx.say(
    [
      {
        speaker: 'leah',
        text: `Hier steht: „Herzpralinen, große Schachtel. Abgeholt von: ${COMPANY} – Softwarebüro.“`,
      },
      {
        speaker: 'maja',
        text: `${COMPANY}? Da arbeitet doch Papa, wenn er nicht zu Hause arbeitet! Das Büro ist direkt am Spielplatz!`,
      },
      { speaker: 'nino', text: 'Papa!' },
      {
        speaker: 'leah',
        text: `Und hier, von heute Morgen: noch eine große Schachtel. Wieder für ${COMPANY}.`,
      },
      { speaker: 'maja', text: 'Zwei Schachteln? Komisch …' },
      {
        speaker: 'leah',
        text: 'Gebäckkrümel, Büro am Spielplatz … Wir müssen dringend mit Papa reden!',
      },
    ],
    () => state.addClue(CLUE.orderBook),
  );
}

function inspectDesk(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.desk)) {
    ctx.say([
      { text: 'Papas Schreibtisch. Die goldenen Förmchen liegen immer noch zwischen den Krümeln.' },
    ]);
    return;
  }
  ctx.say(
    [
      {
        text: 'Papas Schreibtisch: ein Bildschirm voller bunter Buchstaben, eine Tastatur, eine Kaffeetasse.',
      },
      { text: 'Am Bildschirmrand klebt ein Bild, das Nino gemalt hat.' },
      { speaker: 'nino', text: 'Mein Bild!' },
      { speaker: 'maja', text: 'Und überall Krümel! Und da, dazwischen: goldene Förmchen!' },
      { speaker: 'nino', text: 'Eins, zwei, drei!' },
      {
        speaker: 'leah',
        text: 'Genau solche Förmchen wie das auf der Rutsche. Und dieselben Krümel …',
      },
    ],
    () => state.addClue(CLUE.desk),
  );
}

function talkPapa(ctx: CaseEventContext): void {
  const { state } = ctx;

  if (state.flag(FLAG.papaHome)) {
    ctx.say([
      {
        speaker: PAPA,
        text: 'Na, meine Meisterdetektive? Eine Praline für jeden – Mama hat’s erlaubt.',
      },
      {
        speaker: PAPA,
        text: 'Ab morgen arbeite ich wieder hier zu Hause. Direkt neben der Pralinenschachtel. Nur zum Aufpassen, natürlich.',
      },
      { speaker: 'nino', text: 'Mjam!' },
    ]);
    return;
  }
  if (state.hasClue(CLUE.confession)) {
    ctx.say([
      {
        speaker: PAPA,
        text: 'Fragt Mama doch noch mal, wie viele Pralinen wirklich noch drin waren. Ich hab da so einen Verdacht …',
      },
    ]);
    return;
  }

  const found = PAPA_EVIDENCE.filter((c) => state.hasClue(c)).length;
  if (found < PAPA_EVIDENCE.length) {
    const intro: DialogueLine[] = state.flag(FLAG.metPapa)
      ? [
          {
            speaker: PAPA,
            text: 'Ihr schon wieder? Ich muss weiterprogrammieren. Tipp, tipp, tipp!',
          },
        ]
      : [
          {
            speaker: PAPA,
            text: 'Hallo, meine Detektive! Was macht ihr denn hier im Büro?',
          },
          { speaker: 'leah', text: 'Wir ermitteln, Papa. Mamas Pralinen sind verschwunden!' },
          {
            speaker: PAPA,
            text: 'Verschwunden? Oh. Ähm. Das ist ja … schlimm. Ganz schlimm. Ich muss dann mal weiterprogrammieren!',
          },
        ];
    ctx.say(
      [
        ...intro,
        {
          speaker: 'leah',
          text: `Papa benimmt sich komisch. Wir brauchen mehr Beweise. (Beweise: ${found} von ${PAPA_EVIDENCE.length})`,
        },
      ],
      () => state.setFlag(FLAG.metPapa, true),
    );
    return;
  }

  ctx.say(
    [
      { speaker: 'leah', text: 'Papa, wir müssen mit dir reden. Als Detektive.' },
      {
        speaker: 'maja',
        text: 'Oben auf der Rutsche lag ein goldenes Pralinen-Förmchen. Mit Gebäckkrümeln dran!',
      },
      {
        speaker: 'leah',
        text: `Und im Bestellbuch der Schokoladenfabrik steht: Die Herzpralinen hat ${COMPANY} gekauft. Also DU.`,
      },
      { speaker: 'nino', text: 'Und auf deinem Tisch liegen Förmchen! Eins, zwei, drei!' },
      { speaker: PAPA, text: 'Ähm … oh. Ihr seid wirklich gute Detektive.' },
      {
        speaker: PAPA,
        text: 'Na gut, ich geb’s zu: Ich habe heute Morgen ein paar Pralinen für unser Mittagspicknick mitgenommen.',
      },
      {
        speaker: PAPA,
        text: 'Croissant und Praline zusammen – das ist das Allerbeste!',
      },
      { speaker: PAPA, text: 'Zwei. Oder drei. Aber ehrlich – nicht mehr!' },
      {
        speaker: PAPA,
        text: 'Und dann bin ich gerutscht. Jana hat gesagt, das traue ich mich nicht. Hab ich aber!',
      },
      { speaker: 'maja', text: 'Aber Mama sagt, es waren noch GANZ viele drin!' },
      {
        speaker: PAPA,
        text: 'Ganz viele? Nein, nein. Als ich reingeschaut habe, war die Schachtel schon fast leer.',
      },
      {
        speaker: 'leah',
        text: 'Hmm. Wenn Papa nur zwei oder drei gegessen hat … wer hat dann den ganzen Rest gegessen?',
      },
      {
        speaker: PAPA,
        text: 'Fragt doch Mama noch mal. Ich komme heute Abend auch nach Hause – mit einer kleinen Überraschung.',
      },
    ],
    () => state.addClue(CLUE.confession),
  );
}

// --- Case ------------------------------------------------------------------------

export const LOST_PRALINES_CASE: CaseDefinition = {
  id: CASE_ID,
  title: 'Der Fall der verlorenen Pralinen',
  summary:
    'Mamas feine Herzpralinen – ein Geschenk von Papa – sind spurlos verschwunden. ' +
    'Dabei waren doch noch so viele übrig! Mama wartet im Wohnzimmer auf ihre Detektive.',
  firstSceneId: KITA,
  requires: [PIRATE_TREASURE_CASE.id],
  scenes: [KITA_SCENE, PLAYGROUND_SCENE, FACTORY_SCENE, OFFICE_SCENE],
  extraObjects: { house: HOUSE_OBJECTS },
  clues: [
    {
      id: CLUE.story,
      title: 'Mamas leere Schachtel',
      description:
        'Papa hat Mama Herzpralinen geschenkt. Laut Mama waren noch „ganz, ganz viele“ drin – jetzt ist alles weg.',
    },
    {
      id: CLUE.box,
      title: 'Herzschachtel von Zuckerschnute',
      description:
        'Lauter leere goldene Förmchen und ein großer Schoko-Fingerabdruck. Die Pralinen sind aus der Schokoladenfabrik Zuckerschnute.',
    },
    {
      id: CLUE.chocoFaces,
      title: 'Schokomünder im Kindergarten',
      description:
        'Paul und Lotta sind voller Schokolade – aber nur vom Geburtstagskuchen. Frau Sonnenschein bestätigt ihr Alibi.',
    },
    {
      id: CLUE.tip,
      title: 'Mos Beobachtung',
      description:
        '„Goldi! Auf Rutsche! Großer Mann rutscht. Mampf!“ – Mo hat einen großen Mann auf der Spielplatz-Rutsche naschen sehen.',
    },
    {
      id: CLUE.paperCup,
      title: 'Förmchen mit Krümeln',
      description:
        'Maja hat oben auf der Rutsche ein goldenes Pralinen-Förmchen gefunden. Daran kleben Gebäckkrümel – die Büroleute vom Spielplatz picknicken mittags mit Gebäck.',
    },
    {
      id: CLUE.orderBook,
      title: 'Das Bestellbuch',
      description: `Die Herzpralinen hat „${COMPANY}“ gekauft – Papas Büro am Spielplatz! Und heute Morgen noch eine Schachtel.`,
    },
    {
      id: CLUE.desk,
      title: 'Förmchen auf Papas Schreibtisch',
      description:
        'Drei goldene Förmchen zwischen lauter Gebäckkrümeln auf Papas Schreibtisch im Büro.',
    },
    {
      id: CLUE.confession,
      title: 'Papas Geständnis',
      description:
        'Papa hat zwei oder drei Pralinen gegessen – mehr nicht. Die Schachtel war da schon fast leer.',
    },
  ],
  events: {
    talkMama,
    inspectBox,
    talkTeacher,
    talkMo,
    inspectSlide,
    talkOma,
    talkChocolatier,
    inspectOrderBook,
    inspectDesk,
    talkPapa,
  },
};
