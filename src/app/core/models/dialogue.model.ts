import { CharacterId } from './character.model';

/** Placeholder speaker that resolves to whichever sibling is currently leading. */
export const ACTIVE_SPEAKER = '@active';

export interface DialogueLine {
  /**
   * A sibling id (shows portrait + name), {@link ACTIVE_SPEAKER},
   * any other display name, or undefined for narration.
   */
  speaker?: CharacterId | typeof ACTIVE_SPEAKER | (string & {});
  text: string;
}
