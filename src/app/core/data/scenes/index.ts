import { SceneDefinition } from '../../models/scene.model';
import { GARDEN_SCENE } from './garden.scene';
import { HOUSE_SCENE } from './house.scene';

/** Scenes that exist independently of any case (the siblings' home). */
export const BASE_SCENES: readonly SceneDefinition[] = [HOUSE_SCENE, GARDEN_SCENE];
