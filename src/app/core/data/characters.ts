import { CharacterDefinition, CharacterId } from '../models/character.model';

const SKIN = '#f6d2b5';

export const CHARACTERS: readonly CharacterDefinition[] = [
  {
    id: 'leah',
    name: 'Leah',
    age: 8,
    gender: 'f',
    walkSpeedFactor: 1,
    appearance: {
      hairColor: '#ecc85e',
      hairStyle: 'long',
      accent: '#e2557a',
      skin: SKIN,
      shirt: '#e2557a',
      pants: '#36508f',
      shoes: '#3b2f2f',
      heightScale: 1,
    },
  },
  {
    id: 'maja',
    name: 'Maja',
    age: 6,
    gender: 'f',
    walkSpeedFactor: 1,
    appearance: {
      hairColor: '#b98a5a',
      hairStyle: 'pigtails',
      accent: '#f2d03b',
      skin: SKIN,
      shirt: '#5fb86a',
      pants: '#7a4fa3',
      shoes: '#3b2f2f',
      heightScale: 0.86,
    },
  },
  {
    id: 'nino',
    name: 'Nino',
    age: 3,
    walkSpeedFactor: 0.9,
    appearance: {
      hairColor: '#f5dc86',
      hairStyle: 'short',
      accent: '#3f78c9',
      skin: SKIN,
      shirt: '#f39c34',
      pants: '#3f78c9',
      shoes: '#c0392b',
      heightScale: 0.7,
    },
  },
];

/** Order of the siblings in the HUD and when cycling with Tab. */
export const PARTY_ORDER: readonly CharacterId[] = CHARACTERS.map((c) => c.id);

export function getCharacter(id: CharacterId): CharacterDefinition {
  const character = CHARACTERS.find((c) => c.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
}

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === 'string' && PARTY_ORDER.includes(value as CharacterId);
}
