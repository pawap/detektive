import { ACTIVE_SPEAKER } from '../../models/dialogue.model';
import { SceneDefinition } from '../../models/scene.model';
import { TILESET } from '../tiles';

const LAWN = 'fggggggggggppggggggggggf';

/** The front garden. The gate at the bottom is where every case begins. */
export const GARDEN_SCENE: SceneDefinition = {
  id: 'garden',
  name: 'Garten',
  background: '#4f8a45',
  tiles: TILESET,
  map: [
    'HHHHHHHHHHHddHHHHHHHHHHH',
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    LAWN,
    'fffffffffffppfffffffffff',
  ],
  spawns: {
    start: { x: 12, y: 3, facing: 'down' },
    houseDoor: { x: 12, y: 2, facing: 'down' },
    gate: { x: 12, y: 12.2, facing: 'up' },
  },
  exits: [{ x: 11, y: 0, w: 2, h: 1, target: 'house', spawn: 'frontDoor' }],
  objects: [
    {
      id: 'mailbox',
      label: 'Briefkasten',
      sprite: 'mailbox',
      x: 14,
      y: 1,
      w: 1,
      h: 1,
      solid: true,
      interaction: { kind: 'dialogue', lines: [{ speaker: ACTIVE_SPEAKER, text: 'Leer. Vielleicht kommt bald ein Auftrag?' }] },
    },
    { id: 'tree-1', label: 'Apfelbaum', sprite: 'tree', x: 2, y: 2, w: 2, h: 1, solid: true },
    { id: 'tree-2', label: 'Kastanie', sprite: 'tree', x: 19, y: 4, w: 2, h: 1, solid: true },
    { id: 'tree-3', label: 'Birke', sprite: 'tree', x: 4, y: 10, w: 2, h: 1, solid: true },
    {
      id: 'sandbox',
      label: 'Sandkasten',
      sprite: 'sandbox',
      x: 3,
      y: 5,
      w: 3,
      h: 2,
      solid: true,
      interaction: { kind: 'dialogue', lines: [{ speaker: 'nino', text: 'Mein Sandkasten!' }] },
    },
    { id: 'flowers', label: 'Blumenbeet', sprite: 'flowers', x: 15, y: 8, w: 3, h: 1, solid: true },
    { id: 'bench', label: 'Gartenbank', sprite: 'bench', x: 18, y: 10, w: 2, h: 1, solid: true },
    {
      id: 'gate',
      label: 'Gartentor',
      sprite: 'gate',
      x: 11,
      y: 13,
      w: 2,
      h: 1,
      solid: true,
      interaction: { kind: 'departure' },
    },
  ],
};
