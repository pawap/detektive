import { SceneDefinition, SceneObject } from '../models/scene.model';
import { CASES } from './cases';
import { BASE_SCENES } from './scenes';

/**
 * Every scene of the game: the home scenes plus all case scenes, with each
 * case's `extraObjects` merged into the scenes they belong to. `event`
 * interactions of such objects are bound to the case that added them.
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
    return extra.length ? { ...scene, objects: [...scene.objects, ...extra] } : scene;
  });
}
