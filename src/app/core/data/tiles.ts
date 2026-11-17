import { TileDefinition } from '../models/scene.model';

/**
 * Shared tile set. Scenes reference tiles by these single characters in
 * their `map` rows.
 */
export const TILESET: Record<string, TileDefinition> = {
  // Indoors
  '#': { solid: true, pattern: 'wall', base: '#4a3a4f', detail: '#efe0bd' },
  '.': { solid: false, pattern: 'wood', base: '#c99a62', detail: '#b0844f' },
  ',': { solid: false, pattern: 'checker', base: '#ece8de', detail: '#c9d6e3' },
  '~': { solid: false, pattern: 'carpet', base: '#8fb8de', detail: '#7aa5cc' },
  // Outdoors
  g: { solid: false, pattern: 'grass', base: '#7cc06a', detail: '#68a958' },
  p: { solid: false, pattern: 'path', base: '#dcc79c', detail: '#bfa878' },
  f: { solid: true, pattern: 'fence', base: '#7cc06a', detail: '#f4f1e6' },
  H: { solid: true, pattern: 'brick', base: '#b5654a', detail: '#94503a' },
  d: { solid: false, pattern: 'door', base: '#7a4b2a', detail: '#5c361d' },
};
