import { Injectable, computed, signal } from '@angular/core';

export type OverlayKind = 'caseBoard' | 'notebook' | 'menu';

/** Which full-screen panel (if any) is open on top of the game. */
@Injectable({ providedIn: 'root' })
export class OverlayService {
  readonly active = signal<OverlayKind | null>(null);
  readonly isOpen = computed(() => this.active() !== null);

  open(kind: OverlayKind): void {
    this.active.set(kind);
  }

  close(): void {
    this.active.set(null);
  }
}
