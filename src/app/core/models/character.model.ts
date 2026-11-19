export type CharacterId = 'leah' | 'maja' | 'nino';

export type Facing = 'up' | 'down' | 'left' | 'right';

/** `sparse`: very short, thin hair (the scalp shows through). */
export type HairStyle = 'long' | 'pigtails' | 'short' | 'sparse';

/** Everything the procedural sprite renderer needs to draw a character. */
export interface CharacterAppearance {
  hairColor: string;
  hairStyle: HairStyle;
  /** Accent colour, e.g. hair ties. */
  accent: string;
  skin: string;
  shirt: string;
  pants: string;
  shoes: string;
  /** Relative body height; 1 = tallest character. */
  heightScale: number;
}

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  age: number;
  /** Left unset where it has not been decided yet. */
  gender?: 'f' | 'm';
  appearance: CharacterAppearance;
  /** Multiplier on the base walking speed while this character leads. */
  walkSpeedFactor: number;
}
