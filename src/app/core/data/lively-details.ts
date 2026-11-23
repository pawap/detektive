import { ACTIVE_SPEAKER } from '../models/dialogue.model';
import { Ambience, PokeReaction, SceneObject } from '../models/scene.model';

/**
 * Animals, gadgets and weather that make the places feel alive. None of it
 * matters for the cases – it's just there to be poked. Keyed by scene id and
 * merged into the scenes by `buildWorld`.
 */
export interface LivelyDetails {
  ambience?: Ambience[];
  objects: SceneObject[];
}

const poke = (...reactions: PokeReaction[]) => ({ kind: 'poke' as const, reactions });

export const LIVELY_DETAILS: Record<string, LivelyDetails> = {
  house: {
    objects: [
      {
        id: 'fun-cat',
        label: 'Kater Moppel',
        sprite: 'cat',
        x: 4.4,
        y: 9.2,
        w: 1.2,
        h: 0.8,
        solid: true,
        interaction: poke(
          { bubble: 'MIAU!', lines: [{ speaker: 'nino', text: 'Moppel ist wach!' }] },
          { bubble: 'Schnurr …' },
          { bubble: 'FAUCH!', lines: [{ text: 'Moppel möchte jetzt bitte weiterschlafen.' }] },
          { bubble: 'Mrrrau?' },
        ),
      },
      {
        id: 'fun-clock',
        label: 'Kuckucksuhr',
        sprite: 'cuckooClock',
        x: 14,
        y: 6,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'KUCKUCK!' },
          {
            bubble: 'KUCKUCK! KUCKUCK!',
            lines: [{ speaker: 'nino', text: 'Noch mal! Noch mal!' }],
          },
          { bubble: 'Kuck…?', lines: [{ text: 'Der Kuckuck schaut euch vorwurfsvoll an.' }] },
        ),
      },
      {
        id: 'fun-sink',
        label: 'Spüle',
        sprite: 'sink',
        x: 19,
        y: 1,
        w: 2,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'PLITSCH!' },
          {
            bubble: 'Gluck gluck!',
            lines: [{ speaker: 'leah', text: 'Wasserhahn wieder zu! Wasser ist kostbar.' }],
          },
          {
            bubble: 'SPRITZ!',
            lines: [
              { speaker: 'maja', text: 'Huch! Jetzt ist Ninos Hose nass.' },
              { speaker: 'nino', text: 'Ich war das nicht!' },
            ],
          },
        ),
      },
      {
        id: 'fun-radio',
        label: 'Radio',
        sprite: 'radio',
        x: 21,
        y: 1,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: '♪ Bumm-tschak! ♪' },
          {
            bubble: '♪ La-la-laaa ♪',
            lines: [
              { text: 'Eine Opernsängerin singt so hoch, dass die Gläser im Schrank zittern.' },
            ],
          },
          { bubble: 'Krrrzzz …' },
          { bubble: '♪ Dudel-dudel ♪' },
        ),
      },
      {
        id: 'fun-fishbowl',
        label: 'Goldfisch Blubbi',
        sprite: 'fishbowl',
        x: 10,
        y: 1,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Blubb!' },
          {
            bubble: 'BLUBB BLUBB!',
            lines: [{ speaker: 'nino', text: 'Blubbi hat Hallo gesagt!' }],
          },
          {
            bubble: 'Platsch!',
            lines: [
              { speaker: 'leah', text: 'Nicht so doll klopfen. Sonst wird Blubbi seekrank.' },
            ],
          },
        ),
      },
    ],
  },

  garden: {
    ambience: ['leaves'],
    objects: [
      {
        id: 'fun-dog',
        label: 'Hund Bello',
        sprite: 'dog',
        x: 7,
        y: 1,
        w: 2,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'WUFF!' },
          {
            bubble: 'Hechel hechel!',
            lines: [
              { text: 'Bello wedelt so doll mit dem Schwanz, dass sein ganzer Po mitwackelt.' },
            ],
          },
          {
            bubble: 'WUFF WUFF!',
            lines: [
              { speaker: 'maja', text: 'Bello, du bist der beste Spürhund der Welt!' },
              { text: 'Bello schnüffelt an Ninos Schuh und niest.' },
            ],
          },
        ),
      },
      {
        id: 'fun-birdbath',
        label: 'Vogeltränke',
        sprite: 'birdBath',
        x: 16,
        y: 4,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Tschilp!' },
          { bubble: 'Flatter flatter!' },
          {
            bubble: 'Tschilp tschilp!',
            lines: [
              { speaker: 'nino', text: 'Der Vogel hat Angst vor mir.' },
              { speaker: 'leah', text: 'Der kommt gleich wieder. Siehst du?' },
            ],
          },
        ),
      },
      {
        id: 'fun-chime',
        label: 'Windspiel',
        sprite: 'windChime',
        x: 9,
        y: 0,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke({ bubble: 'Kling-klang!' }, { bubble: 'Dingeling!' }),
      },
      {
        id: 'fun-butterflies',
        label: 'Schmetterlinge',
        sprite: 'butterflies',
        x: 15,
        y: 6.5,
        w: 3,
        h: 1.5,
        solid: false,
      },
    ],
  },

  'pirate-museum': {
    ambience: ['dust'],
    objects: [
      {
        id: 'fun-bell',
        label: 'Schiffsglocke',
        sprite: 'shipBell',
        x: 20,
        y: 4,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          {
            bubble: 'BIMM BAMM!',
            lines: [
              { text: 'Der Wachmann schreckt hoch und tut so, als hätte er gar nicht geschlafen.' },
            ],
          },
          { bubble: 'DONG!' },
          { bubble: 'BIMM!', lines: [{ speaker: 'maja', text: 'Alle Mann an Deck!' }] },
        ),
      },
      {
        id: 'fun-mouse',
        label: 'Museumsmaus',
        sprite: 'mouse',
        x: 14,
        y: 12,
        w: 7,
        h: 1,
        solid: false,
      },
    ],
  },

  'pirate-harbour': {
    ambience: ['gusts'],
    objects: [
      {
        id: 'fun-seagull',
        label: 'Möwe',
        sprite: 'seagull',
        x: 14,
        y: 9,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'KRÄÄÄH!' },
          {
            bubble: 'KRÄH KRÄH!',
            lines: [
              {
                text: 'Die Möwe dreht eine Runde und landet wieder. Sie schaut jetzt noch misstrauischer.',
              },
            ],
          },
          {
            bubble: 'Mööp?',
            lines: [{ speaker: ACTIVE_SPEAKER, text: 'Hat die Möwe gerade „Mööp“ gesagt?' }],
          },
        ),
      },
      {
        id: 'fun-buoy',
        label: 'Glockenboje',
        sprite: 'buoy',
        x: 6,
        y: 2.6,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Bimm-bomm!' },
          {
            bubble: 'DING!',
            lines: [{ speaker: 'leah', text: 'Die Boje zeigt den Schiffen, wo es flach ist.' }],
          },
        ),
      },
      {
        id: 'fun-crab',
        label: 'Krebs',
        sprite: 'crab',
        x: 18,
        y: 11,
        w: 3,
        h: 1,
        solid: false,
        interaction: poke(
          { bubble: 'Zwick zwack!' },
          {
            bubble: 'Klacker klacker!',
            lines: [
              { speaker: 'nino', text: 'Der Krebs läuft ja seitwärts!' },
              { speaker: 'maja', text: 'Vielleicht ist er auf Spurensuche. Wie wir.' },
            ],
          },
        ),
      },
      { id: 'fun-flag', label: 'Flagge', sprite: 'flag', x: 1, y: 4, w: 1, h: 1, solid: true },
      {
        id: 'fun-fish',
        label: 'Fische',
        sprite: 'jumpingFish',
        x: 1,
        y: 0,
        w: 13,
        h: 2,
        solid: false,
      },
    ],
  },

  'pralines-kita': {
    ambience: ['bubbles'],
    objects: [
      {
        id: 'fun-hamster',
        label: 'Hamster Flitzi',
        sprite: 'hamster',
        x: 5,
        y: 1,
        w: 2,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Quiek!' },
          {
            bubble: 'Ratter ratter!',
            lines: [{ text: 'Flitzi rennt so schnell im Laufrad, dass ihm schwindelig wird.' }],
          },
          {
            bubble: 'Quiek quiek!',
            lines: [{ speaker: 'nino', text: 'Ich will auch ein Laufrad!' }],
          },
        ),
      },
      {
        id: 'fun-xylophone',
        label: 'Xylofon',
        sprite: 'xylophone',
        x: 2,
        y: 6,
        w: 2,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Pling plang plong!' },
          {
            bubble: 'Dideldum!',
            lines: [{ speaker: 'maja', text: 'Das war „Alle meine Entchen“. Fast.' }],
          },
          { bubble: 'PLONG!' },
        ),
      },
    ],
  },

  'pralines-playground': {
    ambience: ['leaves'],
    objects: [
      {
        id: 'fun-pigeons',
        label: 'Tauben',
        sprite: 'pigeons',
        x: 15,
        y: 3,
        w: 2,
        h: 1,
        solid: false,
        interaction: poke(
          { bubble: 'Gurr gurr!' },
          { bubble: 'FLATTER!' },
          {
            bubble: 'Gurrrr …',
            lines: [
              { speaker: 'nino', text: 'Die picken Krümel! Sind das die Pralinendiebe?' },
              { speaker: 'leah', text: 'Nein, Nino. Tauben essen keine Pralinen.' },
              { speaker: 'maja', text: '… glaube ich.' },
            ],
          },
        ),
      },
      {
        id: 'fun-bike',
        label: 'Fahrrad',
        sprite: 'bicycle',
        x: 6,
        y: 2,
        w: 2,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'RING RING!' },
          {
            bubble: 'Ring!',
            lines: [
              { speaker: 'leah', text: 'Das ist nicht unser Fahrrad. Nur klingeln ist erlaubt.' },
            ],
          },
        ),
      },
      {
        id: 'fun-bees',
        label: 'Bienen',
        sprite: 'bees',
        x: 19,
        y: 11,
        w: 3,
        h: 1.01,
        solid: false,
        interaction: poke(
          {
            bubble: 'Summ summ!',
            lines: [{ speaker: 'leah', text: 'Bienen nicht ärgern. Die machen Honig.' }],
          },
          { bubble: 'SSSSUMM!' },
        ),
      },
      // Sits on the maple tree (drawn just in front of it)
      {
        id: 'fun-squirrel',
        label: 'Eichhörnchen',
        sprite: 'squirrel',
        x: 22,
        y: 8,
        w: 2,
        h: 1.01,
        solid: false,
      },
    ],
  },

  'pralines-factory': {
    objects: [
      {
        id: 'fun-whistle',
        label: 'Dampfpfeife',
        sprite: 'steamWhistle',
        x: 6,
        y: 0,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'TUUUUT!' },
          {
            bubble: 'TUUT TUUT!',
            lines: [
              {
                text: 'Alle machen kurz Feierabend. Dann merken sie, dass es nur die Detektive waren.',
              },
            ],
          },
        ),
      },
      {
        id: 'fun-fountain',
        label: 'Schokobrunnen',
        sprite: 'chocolateFountain',
        x: 21,
        y: 5,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          {
            bubble: 'Blubb!',
            lines: [
              { speaker: 'nino', text: 'Darf ich mal probieren?' },
              { speaker: 'leah', text: 'Nur einen Finger. … NINO! Nicht die ganze Hand!' },
            ],
          },
          { bubble: 'Schlürf!' },
          {
            bubble: 'Mmmmh!',
            lines: [
              { speaker: 'maja', text: 'Ein Schokoladenbrunnen. Der schönste Brunnen der Welt.' },
            ],
          },
        ),
      },
    ],
  },

  'pralines-office': {
    objects: [
      {
        id: 'fun-coffee',
        label: 'Kaffeemaschine',
        sprite: 'coffeeMachine',
        x: 10,
        y: 1,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Brrrzzzz!' },
          {
            bubble: 'Blubb … zisch!',
            lines: [{ text: 'An der Maschine klebt ein Zettel: „Ohne Kaffee kein Code.“' }],
          },
          {
            bubble: 'Röchel!',
            lines: [{ speaker: 'maja', text: 'Die Maschine klingt wie Opa beim Mittagsschlaf.' }],
          },
        ),
      },
      {
        id: 'fun-printer',
        label: 'Drucker',
        sprite: 'printer',
        x: 17,
        y: 5,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Ratter ratter!' },
          {
            bubble: 'Ratter!',
            lines: [
              { text: 'Der Drucker spuckt ein Blatt aus: „Fehler: Kein Papier.“' },
              { speaker: 'leah', text: 'Auf Papier.' },
            ],
          },
          { bubble: 'Piep piep!' },
        ),
      },
      {
        id: 'fun-fan',
        label: 'Ventilator',
        sprite: 'fan',
        x: 18,
        y: 8,
        w: 1,
        h: 1,
        solid: true,
        interaction: poke(
          { bubble: 'Surrrr!' },
          { bubble: 'WUSCH!', lines: [{ speaker: 'nino', text: 'Wind! Ich bin ein Pirat!' }] },
        ),
      },
    ],
  },
};
