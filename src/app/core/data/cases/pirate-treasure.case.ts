import { CaseDefinition, CaseEventContext } from '../../models/case.model';
import { ACTIVE_SPEAKER, DialogueLine } from '../../models/dialogue.model';
import { NpcLook, SceneDefinition } from '../../models/scene.model';
import { TILESET } from '../tiles';

/**
 * Case 1: "Der Schatz von Käpt’n Klabauter"
 *
 * The pirate chest has vanished from the harbour museum overnight. The trail
 * leads to Käpt’n Kuddel, who sells fish rolls at the harbour, owns a very
 * loud parrot – and turns out to be Klabauter's great-great-great-grandson.
 * Twist: the "gold" was chocolate all along.
 *
 * Flow: museum (4 clues: footprints, feather, squawk, Nino-only foil) →
 * harbour (boots, parrot) → confront Kuddel → fetch the chest from his boat →
 * bring it back to the director, which solves the case.
 */

const CASE_ID = 'pirate-treasure';

const MUSEUM = 'pirate-museum';
const HARBOUR = 'pirate-harbour';

const DIRECTOR = 'Frau Dr. Möwe';
const GUARD = 'Herr Schnarchmann';
const PAINTER = 'Frau Pinsel';
const KUDDEL = 'Käpt’n Kuddel';
const PARROT = 'Papagei Krakeele';

const FLAG = {
  metDirector: 'pirate.metDirector',
  featherTaken: 'pirate.featherTaken',
  metKuddel: 'pirate.metKuddel',
  confessed: 'pirate.confessed',
  chestFound: 'pirate.chestFound',
  chestReturned: 'pirate.chestReturned',
} as const;

const CLUE = {
  footprints: 'pirate.footprints',
  feather: 'pirate.feather',
  squawk: 'pirate.squawk',
  foil: 'pirate.foil',
  chocolate: 'pirate.chocolate',
  boots: 'pirate.boots',
  parrot: 'pirate.parrot',
} as const;

/** Evidence the siblings need before Kuddel gives up. */
const REQUIRED_CLUES = [CLUE.footprints, CLUE.feather, CLUE.squawk, CLUE.foil, CLUE.boots, CLUE.parrot];

const CHEST_ITEM = 'pirate.chest';

// --- People ------------------------------------------------------------------

const SKIN = '#f6d2b5';

const DIRECTOR_LOOK: NpcLook = {
  hairColor: '#bfbfbf',
  hairStyle: 'short',
  hat: 'bun',
  accent: '#bfbfbf',
  skin: SKIN,
  shirt: '#2c8c8c',
  pants: '#3b3b4f',
  shoes: '#3b2f2f',
  heightScale: 1,
};

const GUARD_LOOK: NpcLook = {
  hairColor: '#6b4a2e',
  hairStyle: 'short',
  hat: 'guard',
  accent: '#2c3e70',
  skin: SKIN,
  shirt: '#2c3e70',
  pants: '#1b2650',
  shoes: '#222222',
  heightScale: 1.05,
};

const PAINTER_LOOK: NpcLook = {
  hairColor: '#d35400',
  hairStyle: 'long',
  hat: 'beret',
  accent: '#c0392b',
  skin: SKIN,
  shirt: '#f4f1e6',
  pants: '#4a6fa5',
  shoes: '#3b2f2f',
  heightScale: 0.95,
};

const KUDDEL_LOOK: NpcLook = {
  hairColor: '#e8e8e8',
  hairStyle: 'short',
  hat: 'captain',
  beard: '#e8e8e8',
  accent: '#1f2a44',
  skin: '#efc3a0',
  shirt: '#2e86c1',
  pants: '#1f2a44',
  // Fluffy red slippers – his boots are drying in front of the stand.
  shoes: '#e74c3c',
  heightScale: 1.05,
};

// --- Scenes --------------------------------------------------------------------

const MUSEUM_ROW = '#' + 'm'.repeat(22) + '#';

const MUSEUM_SCENE: SceneDefinition = {
  id: MUSEUM,
  name: 'Hafenmuseum',
  background: '#2a2233',
  tiles: TILESET,
  map: ['########################', ...Array.from({ length: 12 }, () => MUSEUM_ROW), '###########mm###########'],
  spawns: {
    start: { x: 12, y: 12.2, facing: 'up' },
    fromHarbour: { x: 12, y: 12.2, facing: 'up' },
  },
  exits: [{ x: 11, y: 13, w: 2, h: 1, target: HARBOUR, spawn: 'museumDoor' }],
  objects: [
    {
      id: 'display-sabre',
      label: 'Vitrine: Säbel',
      sprite: 'display',
      color: '#bdc3c7',
      x: 2,
      y: 1,
      w: 2,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Der Säbel von Käpt’n Klabauter. Er ist ganz krumm.' },
          { speaker: 'maja', text: 'Damit hat er bestimmt Bananen geschält.' },
        ],
      },
    },
    {
      id: 'display-spyglass',
      label: 'Vitrine: Fernrohr',
      sprite: 'display',
      color: '#c9a227',
      x: 5,
      y: 1,
      w: 2,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Ein goldenes Fernrohr. Das Schild sagt: „Bitte nicht durchgucken.“' },
          { speaker: 'nino', text: 'Ich will durchgucken!' },
        ],
      },
    },
    {
      id: 'display-map',
      label: 'Vitrine: Schatzkarte',
      sprite: 'display',
      color: '#e8d5a3',
      x: 8,
      y: 1,
      w: 2,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Eine alte Schatzkarte. Das X ist mitten im Hafen.' },
          { speaker: 'leah', text: 'Und unten rechts hat jemand einen Papagei draufgemalt.' },
        ],
      },
    },
    {
      id: 'painting-klabauter',
      label: 'Gemälde: Käpt’n Klabauter',
      sprite: 'painting',
      x: 13,
      y: 0,
      w: 2,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            text: 'Käpt’n Klabauter, der Schrecken der sieben Meere. Mit Augenklappe und rotem Bart.',
          },
          { text: 'Auf seiner Schulter sitzt ein grüner Papagei mit gelbem Kopf.' },
          { speaker: 'nino', text: 'Arrr!' },
        ],
      },
    },
    {
      id: 'window',
      label: 'Offenes Fenster',
      sprite: 'window',
      x: 18,
      y: 0,
      w: 2,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: 'Das Fenster steht sperrangelweit offen. Draußen glitzert der Hafen.' },
          { speaker: ACTIVE_SPEAKER, text: 'Hier könnte jemand reingeklettert sein …' },
        ],
      },
    },
    {
      id: 'feather',
      label: 'Feder',
      sprite: 'feather',
      x: 18.5,
      y: 1.3,
      w: 1,
      h: 0.8,
      solid: false,
      hideIf: FLAG.featherTaken,
      interaction: { kind: 'event', eventId: 'inspectFeather' },
    },
    {
      id: 'pedestal-empty',
      label: 'Leerer Sockel',
      sprite: 'pedestal',
      x: 11,
      y: 6,
      w: 2,
      h: 1,
      solid: true,
      hideIf: FLAG.chestReturned,
      interaction: { kind: 'event', eventId: 'inspectPedestal' },
    },
    {
      id: 'pedestal-chest',
      label: 'Schatztruhe',
      sprite: 'pedestalWithChest',
      x: 11,
      y: 6,
      w: 2,
      h: 1,
      solid: true,
      showIf: FLAG.chestReturned,
      interaction: { kind: 'event', eventId: 'inspectPedestal' },
    },
    {
      id: 'director',
      label: DIRECTOR,
      sprite: 'person',
      npc: DIRECTOR_LOOK,
      facing: 'left',
      x: 14,
      y: 6,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkDirector' },
    },
    {
      id: 'guard',
      label: GUARD,
      sprite: 'person',
      npc: GUARD_LOOK,
      facing: 'right',
      x: 2,
      y: 9,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkGuard' },
    },
    {
      id: 'bench',
      label: 'Museumsbank',
      sprite: 'bench',
      x: 5,
      y: 10,
      w: 2,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'inspectBench' },
    },
    {
      id: 'painter',
      label: PAINTER,
      sprite: 'person',
      npc: PAINTER_LOOK,
      facing: 'left',
      x: 16,
      y: 2,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          {
            speaker: PAINTER,
            text: 'Hallo, ihr Kleinen! Ich putze gerade das Bild von Käpt’n Klabauter. Mit echter Goldfarbe!',
          },
          {
            speaker: 'maja',
            text: 'Psst, Leah … sie hat ganz goldene Finger! Ist SIE die Diebin?',
          },
          {
            speaker: PAINTER,
            text: 'Hihi, das ist nur Farbe. Ich war heute Nacht zu Hause und habe geschlafen.',
          },
          {
            speaker: PAINTER,
            text: 'Aber wusstet ihr? Käpt’n Klabauter hatte einen Papagei. Der hat den ganzen Tag „Schatz!“ geschrien.',
          },
          {
            speaker: PAINTER,
            text: 'Komisch … unten am Hafen kreischt neuerdings auch so ein Vogel.',
          },
        ],
      },
    },
    { id: 'plant-1', label: 'Palme', sprite: 'plant', x: 21, y: 1, w: 1, h: 1, solid: true },
    { id: 'plant-2', label: 'Palme', sprite: 'plant', x: 1, y: 12, w: 1, h: 1, solid: true },
    { id: 'plant-3', label: 'Palme', sprite: 'plant', x: 22, y: 12, w: 1, h: 1, solid: true },
  ],
};

const WATER = 'w'.repeat(26);
const DOCK = 'w'.repeat(15) + '='.repeat(4) + 'w'.repeat(7);
const QUAY = 'f' + 'c'.repeat(24) + 'H';
const QUAY_DOORS = 'p' + 'c'.repeat(24) + 'd';

const HARBOUR_SCENE: SceneDefinition = {
  id: HARBOUR,
  name: 'Hafen',
  background: '#3f8fc9',
  tiles: TILESET,
  map: [WATER, WATER, DOCK, DOCK, QUAY, QUAY, QUAY, QUAY_DOORS, QUAY_DOORS, QUAY, QUAY, QUAY, 'f'.repeat(26)],
  spawns: {
    start: { x: 2, y: 8.2, facing: 'right' },
    museumDoor: { x: 24.2, y: 8.2, facing: 'left' },
  },
  exits: [
    { x: 0, y: 7, w: 1, h: 2, target: 'garden', spawn: 'gate' },
    { x: 25, y: 7, w: 1, h: 2, target: MUSEUM, spawn: 'fromHarbour' },
  ],
  objects: [
    {
      id: 'fish-stand',
      label: 'Fischbrötchen-Bude',
      sprite: 'counter',
      x: 3,
      y: 5,
      w: 4,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [
          { text: '„Kuddels Fischbrötchen – 2 Euro“. Darunter klebt ein Zettel:' },
          { text: '„Heute geschlossen. Der Kapitän hat Bauchweh.“' },
          { speaker: 'maja', text: 'Bauchweh? Wovon wohl …' },
        ],
      },
    },
    {
      id: 'boots',
      label: 'Gummistiefel',
      sprite: 'boots',
      x: 8,
      y: 5,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'inspectBoots' },
    },
    {
      id: 'kuddel',
      label: KUDDEL,
      sprite: 'person',
      npc: KUDDEL_LOOK,
      x: 11,
      y: 5,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkKuddel' },
    },
    {
      id: 'parrot',
      label: PARROT,
      sprite: 'parrot',
      x: 12.3,
      y: 5,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'event', eventId: 'talkParrot' },
    },
    {
      id: 'boat',
      label: 'Boot „Seeschnecke“',
      sprite: 'boat',
      x: 19.2,
      y: 1.6,
      w: 4,
      h: 2,
      solid: true,
      interaction: { kind: 'event', eventId: 'inspectBoat' },
    },
    {
      id: 'bench',
      label: 'Bank',
      sprite: 'bench',
      x: 15,
      y: 9,
      w: 2,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [{ text: 'Eine Bank mit Blick aufs Wasser. Eine Möwe schaut euch misstrauisch an.' }],
      },
    },
    { id: 'barrel-1', label: 'Fass', sprite: 'barrel', x: 22, y: 9, w: 1, h: 1, solid: true },
    { id: 'barrel-2', label: 'Fass', sprite: 'barrel', x: 23, y: 9, w: 1, h: 1, solid: true },
    {
      id: 'crate',
      label: 'Kiste',
      sprite: 'box',
      color: '#a0703d',
      x: 22,
      y: 10.2,
      w: 1,
      h: 1,
      solid: true,
      interaction: {
        kind: 'dialogue',
        lines: [{ speaker: ACTIVE_SPEAKER, text: 'Nur Fischernetze. Und eine einzelne Socke.' }],
      },
    },
  ],
};

// --- Events --------------------------------------------------------------------

function inspectPedestal(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.flag(FLAG.chestReturned)) {
    ctx.say([
      {
        text: 'Die Schatztruhe steht wieder auf ihrem Sockel. Ein bisschen schokoladig, aber glücklich.',
      },
    ]);
    return;
  }
  if (state.hasClue(CLUE.footprints)) {
    ctx.say([
      {
        text: 'Hier stand die Truhe. Die sandigen Stiefelspuren führen zum Ausgang Richtung Hafen.',
      },
    ]);
    return;
  }
  ctx.say(
    [
      { text: 'Der Sockel ist leer. Nur ein Staubrand zeigt, wo die Truhe gestanden hat.' },
      { speaker: 'leah', text: 'Seht mal, auf dem Boden! Riesige Fußabdrücke. Aus Sand!' },
      { speaker: 'maja', text: 'Und die riechen … nach Fisch! Bäääh!' },
      { speaker: 'nino', text: 'Großer Fuß! Riesenfuß!' },
      { speaker: 'leah', text: 'Das schreiben wir auf: riesige, sandige Stiefelabdrücke.' },
    ],
    () => state.addClue(CLUE.footprints),
  );
}

function inspectFeather(ctx: CaseEventContext): void {
  ctx.say(
    [
      { speaker: ACTIVE_SPEAKER, text: 'Eine Feder! Grün, mit einer gelben Spitze.' },
      {
        speaker: 'maja',
        text: 'Die ist viel zu groß für einen Spatz. Und viel zu bunt für eine Taube.',
      },
      { speaker: 'leah', text: 'Und sie liegt genau unter dem offenen Fenster …' },
    ],
    () => {
      ctx.state.addClue(CLUE.feather);
      ctx.state.setFlag(FLAG.featherTaken, true);
    },
  );
}

function talkGuard(ctx: CaseEventContext): void {
  if (ctx.state.hasClue(CLUE.squawk)) {
    ctx.say([{ speaker: GUARD, text: 'Chrrr … Schatz … chrrr … pffff …' }]);
    return;
  }
  ctx.say(
    [
      { speaker: GUARD, text: 'Chrrrrr … pfffff … chrrrrr …' },
      { speaker: ACTIVE_SPEAKER, text: 'Hallo? Herr Wachmann?' },
      {
        speaker: GUARD,
        text: 'Hä? Was? Ich schlafe nicht! Ich bewache mit geschlossenen Augen. Das ist eine Spezialtechnik.',
      },
      { speaker: 'maja', text: 'Haben Sie heute Nacht etwas gehört?' },
      {
        speaker: GUARD,
        text: 'Nur so einen komischen Traum. Da hat jemand ganz laut gekreischt: „SCHATZ! SCHATZ!“',
      },
      {
        speaker: GUARD,
        text: 'Und dann hat es gerumpelt. Und dann hat jemand „Pssst, Krakeele!“ gesagt. Und dann … chrrr …',
      },
      { speaker: 'leah', text: 'Jemand hat „Schatz!“ gekreischt? Das notiere ich lieber.' },
    ],
    () => ctx.state.addClue(CLUE.squawk),
  );
}

function inspectBench(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.hasClue(CLUE.foil)) {
    ctx.say([
      {
        text: 'Eine Museumsbank. Darunter liegt jetzt nur noch Staub. Und ein Gummibärchen von 1998.',
      },
    ]);
    return;
  }
  if (state.activeCharacter() !== 'nino') {
    ctx.say([
      {
        speaker: ACTIVE_SPEAKER,
        text: 'Ganz hinten unter der Bank glitzert etwas. Aber ich komme nicht dran – ich bin zu groß.',
      },
      { speaker: 'nino', text: 'Ich bin klein! Ich kann das!' },
      { text: '(Tipp: Mit Tab oder der Taste 3 übernimmt Nino die Führung.)' },
    ]);
    return;
  }
  ctx.say(
    [
      { speaker: 'nino', text: 'Da unten! Was Glitzi!' },
      {
        text: 'Nino krabbelt unter die Bank und kommt mit einem zerknüllten Goldpapier wieder heraus.',
      },
      { speaker: 'nino', text: 'Riecht nach Schoki!' },
      {
        speaker: 'leah',
        text: 'Das ist das Papier von einem Schokoladentaler! Super gemacht, Nino!',
      },
      { speaker: 'maja', text: 'Aber wer isst denn mitten in der Nacht im Museum Schokolade?' },
    ],
    () => state.addClue(CLUE.foil),
  );
}

function talkDirector(ctx: CaseEventContext): void {
  const { state } = ctx;

  if (state.solvedCases().includes(CASE_ID)) {
    ctx.say([
      {
        speaker: DIRECTOR,
        text: 'Danke noch mal, Detektive! Kommt bald zur Piratenführung – mit Papagei!',
      },
    ]);
    return;
  }

  if (state.flag(FLAG.chestFound)) {
    ctx.say(
      [
        {
          speaker: DIRECTOR,
          text: 'Die Truhe! Ihr habt sie wirklich gefunden! Ich könnte euch alle drei knuddeln!',
        },
        {
          speaker: 'leah',
          text: 'Käpt’n Kuddel hatte sie. Er ist der Ur-ur-ur-Enkel von Käpt’n Klabauter und dachte, sie gehört ihm.',
        },
        {
          speaker: DIRECTOR,
          text: 'Ein echter Klabauter? Hier bei uns im Hafen? Das ist ja … wunderbar!',
        },
        {
          speaker: DIRECTOR,
          text: 'Ich frage ihn, ob er bei uns Piratenführungen machen möchte. Mit Krakeele auf der Schulter!',
        },
        { speaker: 'maja', text: 'Und mit Schokotalern für alle Kinder!' },
        {
          speaker: DIRECTOR,
          text: 'Wo wir gerade davon sprechen … ein paar Taler sind noch übrig. Die habt ihr euch verdient.',
        },
        { speaker: 'nino', text: 'SCHOKI! Ich bin ein Pirat! Arrrr!' },
        { text: 'FALL GELÖST! Die Detektiv-Geschwister haben ihren ersten Fall geknackt.' },
        { text: 'Und Nino hat jetzt Schokolade bis zu den Ohren.' },
      ],
      () => {
        state.removeItem(CHEST_ITEM);
        state.setFlag(FLAG.chestReturned, true);
        state.solveCase(CASE_ID);
      },
    );
    return;
  }

  if (!state.flag(FLAG.metDirector)) {
    ctx.say(
      [
        {
          speaker: DIRECTOR,
          text: 'Detektive! Endlich! Ihr seid doch die Detektiv-Geschwister, oder?',
        },
        { speaker: 'leah', text: 'Genau! Ich bin Leah, das sind Maja und Nino. Was ist passiert?' },
        {
          speaker: DIRECTOR,
          text: 'Eine Katastrophe! Die Schatztruhe von Käpt’n Klabauter ist weg! Heute Nacht gestohlen!',
        },
        {
          speaker: DIRECTOR,
          text: 'Sie stand genau hier auf dem Sockel. Randvoll mit Goldmünzen. Der größte Schatz des ganzen Museums!',
        },
        { speaker: 'maja', text: 'Ein echter Piratenschatz? Wie aufregend!' },
        { speaker: 'nino', text: 'Ich will auch Gold!' },
        {
          speaker: 'leah',
          text: 'Keine Sorge, Frau Dr. Möwe. Wir finden die Truhe. Los, Team – wir suchen Hinweise!',
        },
      ],
      () => state.setFlag(FLAG.metDirector, true),
    );
    return;
  }

  if (state.hasClue(CLUE.foil) && !state.hasClue(CLUE.chocolate)) {
    ctx.say(
      [
        {
          speaker: ACTIVE_SPEAKER,
          text: 'Frau Dr. Möwe, wir haben unter der Bank dieses Goldpapier gefunden. Es riecht nach Schokolade.',
        },
        { speaker: DIRECTOR, text: 'Oh. Oh nein. Das … ähm … das muss ich euch wohl beichten.' },
        {
          speaker: DIRECTOR,
          text: 'Die Goldmünzen in der Truhe waren gar nicht echt. Es waren … Schokoladentaler.',
        },
        {
          speaker: DIRECTOR,
          text: 'Die echten liegen sicher im Tresor. Aber das darf niemand wissen! Die Truhe selbst ist trotzdem 300 Jahre alt!',
        },
        { speaker: 'maja', text: 'Der Dieb hat also einen Schoko-Schatz geklaut. Hihihi!' },
        { speaker: 'nino', text: 'Mmmmh … Schoki-Schatz …' },
      ],
      () => state.addClue(CLUE.chocolate),
    );
    return;
  }

  const museumDone = [CLUE.footprints, CLUE.feather, CLUE.squawk, CLUE.foil].every((c) => state.hasClue(c));
  ctx.say([
    museumDone
      ? {
          speaker: DIRECTOR,
          text: 'Die Spuren führen nach draußen? Der Ausgang zum Hafen ist gleich da unten.',
        }
      : {
          speaker: DIRECTOR,
          text: 'Habt ihr schon überall nachgesehen? Herr Schnarchmann hatte Nachtwache … angeblich.',
        },
  ]);
}

function inspectBoots(ctx: CaseEventContext): void {
  if (ctx.state.hasClue(CLUE.boots)) {
    ctx.say([{ text: 'Kuddels Gummistiefel. Immer noch sandig. Immer noch fischig.' }]);
    return;
  }
  ctx.say(
    [
      { speaker: ACTIVE_SPEAKER, text: 'Riesige gelbe Gummistiefel. Voller Sand!' },
      { speaker: 'maja', text: '*schnupper* … Fisch! Genau wie die Spuren im Museum!' },
      { speaker: 'nino', text: 'Riesenfuß-Schuhe!' },
      { speaker: 'leah', text: 'Und sie stehen direkt vor Kuddels Fischbude. Interessant …' },
    ],
    () => ctx.state.addClue(CLUE.boots),
  );
}

function talkParrot(ctx: CaseEventContext): void {
  if (ctx.state.flag(FLAG.confessed)) {
    ctx.say([{ speaker: PARROT, text: 'KRÄÄH! KUDDEL HAT BAUCHWEH! KRÄÄH!' }]);
    return;
  }
  if (ctx.state.hasClue(CLUE.parrot)) {
    ctx.say([{ speaker: PARROT, text: 'SCHATZ! SCHOKOLADE! SCHATZ! KRÄÄH!' }]);
    return;
  }
  ctx.say(
    [
      { speaker: PARROT, text: 'SCHATZ! SCHATZ! KRÄÄÄÄH!' },
      { speaker: 'nino', text: 'Der Vogel hat „Schatz“ gesagt!' },
      {
        speaker: 'leah',
        text: 'Grüne Federn mit gelben Spitzen … genau wie die Feder am Museumsfenster!',
      },
      { speaker: PARROT, text: 'SCHOKOLADE! KRÄÄH! PSSST, KRAKEELE! KRÄÄH!' },
      { speaker: 'maja', text: '„Pssst, Krakeele“? Das hat der Wachmann doch im Traum gehört!' },
    ],
    () => ctx.state.addClue(CLUE.parrot),
  );
}

function talkKuddel(ctx: CaseEventContext): void {
  const { state } = ctx;

  if (state.flag(FLAG.chestFound)) {
    ctx.say([
      {
        speaker: KUDDEL,
        text: 'Bringt die Truhe gut ins Museum, ihr Landratten. Ich komm später vorbei und entschuldige mich. Ehrenwort!',
      },
    ]);
    return;
  }
  if (state.flag(FLAG.confessed)) {
    ctx.say([
      {
        speaker: KUDDEL,
        text: 'Die Truhe steht auf meinem Boot, unter der Plane. Holt sie ruhig.',
      },
    ]);
    return;
  }

  const found = REQUIRED_CLUES.filter((c) => state.hasClue(c)).length;
  if (found < REQUIRED_CLUES.length) {
    const intro: DialogueLine[] = state.flag(FLAG.metKuddel)
      ? [
          {
            speaker: KUDDEL,
            text: 'Na, ihr schon wieder? Ich hab nix gesehen, nix gehört und nix genascht!',
          },
        ]
      : [
          {
            speaker: KUDDEL,
            text: 'Ahoi, ihr kleinen Landratten! Ich bin Käpt’n Kuddel. Fischbrötchen gefällig?',
          },
          {
            speaker: 'leah',
            text: 'Wir sind Detektive. Aus dem Museum wurde eine Schatztruhe gestohlen.',
          },
          {
            speaker: KUDDEL,
            text: 'Eine Truhe? Nie gesehen! Ich war die ganze Nacht im Bett. In meinen Pantoffeln. Hohoho!',
          },
        ];
    ctx.say(
      [
        ...intro,
        {
          speaker: 'leah',
          text: `Hmm. Für eine Anklage brauchen wir mehr Beweise. (Beweise: ${found} von ${REQUIRED_CLUES.length})`,
        },
      ],
      () => state.setFlag(FLAG.metKuddel, true),
    );
    return;
  }

  ctx.say(
    [
      { speaker: 'leah', text: 'Käpt’n Kuddel, wir müssen mit Ihnen reden. Als Detektive.' },
      {
        speaker: 'maja',
        text: 'Im Museum waren riesige, sandige Fischstiefel-Spuren. Und Ihre Stiefel da sind riesig, sandig und fischig!',
      },
      {
        speaker: 'leah',
        text: 'Unter dem offenen Fenster lag eine grün-gelbe Feder. Genau wie die von Krakeele.',
      },
      {
        speaker: 'maja',
        text: 'Und der Wachmann hat nachts „Schatz! Schatz!“ und „Pssst, Krakeele!“ gehört.',
      },
      { speaker: PARROT, text: 'SCHATZ! SCHATZ! KRÄÄH!' },
      { speaker: 'nino', text: 'Und du hast Schoki im Bart!' },
      { text: 'Alle schauen auf Kuddels Bart. Darin klebt ein dicker brauner Schokoladenkrümel.' },
      { speaker: KUDDEL, text: 'Äh … das ist … Seetang?' },
      { speaker: 'nino', text: 'SCHOKI!' },
      { speaker: KUDDEL, text: 'Na gut, na gut! Ich geb’s zu! Ich hab die Truhe geholt!' },
      {
        speaker: KUDDEL,
        text: 'Aber versteht doch: Käpt’n Klabauter war mein Ur-ur-ur-Opa! Ich heiße Kuddel Klabauter!',
      },
      {
        speaker: KUDDEL,
        text: 'Krakeele hat jeden Tag vorm Museumsfenster „Schatz!“ gekreischt. Da dachte ich: Die Truhe gehört doch zur Familie!',
      },
      {
        speaker: KUDDEL,
        text: 'Also bin ich nachts mit ihm durchs Fenster und hab sie mitgenommen. Und dann hab ich reingeschaut …',
      },
      {
        speaker: KUDDEL,
        text: 'Und das Gold war SCHOKOLADE! Da hab ich ein paar Taler genascht. Oder vierzig. Jetzt hab ich Bauchweh.',
      },
      {
        speaker: 'leah',
        text: 'Einfach etwas mitnehmen geht aber trotzdem nicht. Auch wenn es mal Ihrem Ur-ur-ur-Opa gehört hat.',
      },
      {
        speaker: KUDDEL,
        text: 'Ihr habt ja recht. Die Truhe steht auf meinem Boot, unter der Plane. Bringt sie zurück ins Museum.',
      },
    ],
    () => state.setFlag(FLAG.confessed, true),
  );
}

function inspectBoat(ctx: CaseEventContext): void {
  const { state } = ctx;
  if (state.flag(FLAG.chestFound)) {
    ctx.say([{ text: 'Die „Seeschnecke“. Ein bisschen schief, aber sie schwimmt.' }]);
    return;
  }
  if (!state.flag(FLAG.confessed)) {
    ctx.say([
      {
        text: 'Ein kleines Fischerboot namens „Seeschnecke“. Unter einer Plane ist etwas Eckiges versteckt.',
      },
      {
        speaker: KUDDEL,
        text: 'He! Finger weg von meinem Boot! Da ist nur … äh … Fisch drin! Eckiger Fisch!',
      },
    ]);
    return;
  }
  ctx.say(
    [
      {
        text: 'Unter der Plane steht sie: die Schatztruhe von Käpt’n Klabauter! Ein bisschen schokoladig, aber heil.',
      },
      { speaker: 'leah', text: 'Wir haben sie! Schnell zurück ins Museum zu Frau Dr. Möwe!' },
      { speaker: 'maja', text: 'Hau … ruck! Puh, die ist ja schwer!' },
      { speaker: 'nino', text: 'Ich helf tragen!' },
      { text: 'Nino trägt einen Schokotaler. Das ist auch eine wichtige Aufgabe.' },
    ],
    () => {
      state.addItem(CHEST_ITEM);
      state.setFlag(FLAG.chestFound, true);
    },
  );
}

// --- Case ------------------------------------------------------------------------

export const PIRATE_TREASURE_CASE: CaseDefinition = {
  id: CASE_ID,
  title: 'Der Schatz von Käpt’n Klabauter',
  summary:
    'Aus dem Hafenmuseum ist über Nacht die Schatztruhe des berüchtigten Piraten Käpt’n Klabauter verschwunden – ' +
    'randvoll mit Gold! Die Museumsdirektorin Frau Dr. Möwe braucht dringend Hilfe.',
  firstSceneId: MUSEUM,
  scenes: [MUSEUM_SCENE, HARBOUR_SCENE],
  clues: [
    {
      id: CLUE.footprints,
      title: 'Sandige Riesenspuren',
      description: 'Riesige Stiefelabdrücke aus Sand am leeren Sockel. Sie riechen nach Fisch.',
    },
    {
      id: CLUE.feather,
      title: 'Grün-gelbe Feder',
      description: 'Lag unter dem offenen Museumsfenster. Viel zu groß für einen Spatz.',
    },
    {
      id: CLUE.squawk,
      title: '„Schatz! Schatz!“',
      description: 'Der Wachmann hat nachts ein Kreischen gehört – und jemanden, der „Pssst, Krakeele!“ flüstert.',
    },
    {
      id: CLUE.foil,
      title: 'Goldpapier',
      description: 'Nino hat es unter der Museumsbank gefunden. Es riecht nach Schokolade.',
    },
    {
      id: CLUE.chocolate,
      title: 'Das Schoko-Geheimnis',
      description: 'Die Goldmünzen in der Truhe waren Schokoladentaler! Die echten liegen im Tresor.',
    },
    {
      id: CLUE.boots,
      title: 'Gelbe Gummistiefel',
      description: 'Riesig, sandig und fischig. Sie stehen vor Kuddels Fischbude am Hafen.',
    },
    {
      id: CLUE.parrot,
      title: 'Papagei Krakeele',
      description: 'Kuddels Papagei hat grün-gelbe Federn und kreischt ständig „Schatz!“.',
    },
  ],
  events: {
    inspectPedestal,
    inspectFeather,
    talkGuard,
    inspectBench,
    talkDirector,
    inspectBoots,
    talkParrot,
    talkKuddel,
    inspectBoat,
  },
};
