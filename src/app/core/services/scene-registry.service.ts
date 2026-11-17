import { Injectable } from '@angular/core';
import { CASES } from '../data/cases';
import { BASE_SCENES } from '../data/scenes';
import { SceneDefinition } from '../models/scene.model';

/** Looks up scenes: the home scenes plus all scenes contributed by cases. */
@Injectable({ providedIn: 'root' })
export class SceneRegistry {
  private readonly scenes = new Map<string, SceneDefinition>();

  constructor() {
    for (const scene of [...BASE_SCENES, ...CASES.flatMap((c) => c.scenes)]) {
      if (this.scenes.has(scene.id)) throw new Error(`Duplicate scene id: ${scene.id}`);
      this.scenes.set(scene.id, scene);
    }
  }

  get(id: string): SceneDefinition | undefined {
    return this.scenes.get(id);
  }

  all(): SceneDefinition[] {
    return [...this.scenes.values()];
  }
}
