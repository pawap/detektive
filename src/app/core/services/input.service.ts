import { Injectable } from '@angular/core';

export type InputAction =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'interact'
  | 'switch'
  | 'notebook'
  | 'menu'
  | 'select1'
  | 'select2'
  | 'select3';

const KEY_MAP: Record<string, InputAction> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
  KeyE: 'interact',
  Space: 'interact',
  Enter: 'interact',
  Tab: 'switch',
  KeyQ: 'switch',
  KeyN: 'notebook',
  Escape: 'menu',
  Digit1: 'select1',
  Digit2: 'select2',
  Digit3: 'select3',
};

/**
 * Keyboard state polled by the game loop. `held` covers continuous input
 * (walking); `pressed` covers one-shot actions and is cleared every frame.
 */
@Injectable({ providedIn: 'root' })
export class InputService {
  private readonly held = new Set<InputAction>();
  private readonly pressed = new Set<InputAction>();
  private enabled = false;

  private readonly onKeyDown = (event: KeyboardEvent) => {
    const action = KEY_MAP[event.code];
    if (!action || !this.enabled) return;
    if (action !== 'menu' && isFormControl(event.target)) return;
    event.preventDefault();
    if (!event.repeat) this.pressed.add(action);
    this.held.add(action);
  };

  private readonly onKeyUp = (event: KeyboardEvent) => {
    const action = KEY_MAP[event.code];
    if (action) this.held.delete(action);
  };

  private readonly onBlur = () => this.reset();

  /** Start listening (called when the game screen opens). */
  enable(): void {
    if (this.enabled) return;
    this.enabled = true;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onBlur);
  }

  disable(): void {
    this.enabled = false;
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onBlur);
    this.reset();
  }

  isHeld(action: InputAction): boolean {
    return this.held.has(action);
  }

  /** True once per key press; removes the press. */
  consume(action: InputAction): boolean {
    return this.pressed.delete(action);
  }

  /** For on-screen / touch controls. */
  setHeld(action: InputAction, down: boolean): void {
    if (down) this.held.add(action);
    else this.held.delete(action);
  }

  press(action: InputAction): void {
    this.pressed.add(action);
  }

  clearPressed(): void {
    this.pressed.clear();
  }

  private reset(): void {
    this.held.clear();
    this.pressed.clear();
  }
}

/** Let focused buttons/inputs (e.g. in overlays) handle their own keys. */
function isFormControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLButtonElement ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
