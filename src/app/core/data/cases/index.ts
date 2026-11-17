import { CaseDefinition } from '../../models/case.model';

/**
 * All detective cases. Add new cases here (one file per case is recommended,
 * e.g. `cases/the-missing-cat.case.ts`). Their scenes are registered
 * automatically and they show up on the case board in the kids' room.
 */
export const CASES: readonly CaseDefinition[] = [];

export function findCase(id: string | null | undefined): CaseDefinition | undefined {
  return id ? CASES.find((c) => c.id === id) : undefined;
}
