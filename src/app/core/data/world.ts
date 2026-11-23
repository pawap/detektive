import { SceneDefinition, SceneObject } from '../models/scene.model';
import { CASES } from './cases';
import { LIVELY_DETAILS } from './lively-details';
import { BASE_SCENES } from './scenes';

/**
 * Every scene of the game: the home scenes plus all case scenes, with each
 * case's `extraObjects` merged into the scenes they belong to. `event`
 * interactions of such objects are bound to the case that added them.
 * Finally the lively details (animals, gadgets, weather) are added.
 */
export function buildWorld(): SceneDefinition[] {
  const scenes = [...BASE_SCENES, ...CASES.flatMap((c) => c.scenes)];
  return scenes.map((scene) => {
    const extra: SceneObject[] = CASES.flatMap((c) =>
      (c.extraObjects?.[scene.id] ?? []).map((o) =>
        o.interaction?.kind === 'event' && !o.interaction.caseId
          ? { ...o, interaction: { ...o.interaction, caseId: c.id } }
          : o,
      ),
    );
    const lively = LIVELY_DETAILS[scene.id];
    if (!extra.length && !lively) return scene;
    return {
      ...scene,
      objects: [...scene.objects, ...extra, ...(lively?.objects ?? [])],
      ambience: [...(scene.ambience ?? []), ...(lively?.ambience ?? [])],
    };
  });
}
