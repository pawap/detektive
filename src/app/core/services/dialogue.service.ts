import { Injectable, computed, signal } from '@angular/core';
import { DialogueLine } from '../models/dialogue.model';

/** Queue of dialogue lines shown one after another in the dialogue box. */
@Injectable({ providedIn: 'root' })
export class DialogueService {
  readonly current = signal<DialogueLine | null>(null);
  readonly isOpen = computed(() => this.current() !== null);

  private queue: DialogueLine[] = [];
  private onDone?: () => void;

  open(lines: DialogueLine[], onDone?: () => void): void {
    if (lines.length === 0) {
      onDone?.();
      return;
    }
    this.queue = lines.slice(1);
    this.onDone = onDone;
    this.current.set(lines[0]);
  }

  advance(): void {
    const next = this.queue.shift();
    if (next) {
      this.current.set(next);
      return;
    }
    const done = this.onDone;
    this.close();
    done?.();
  }

  close(): void {
    this.queue = [];
    this.onDone = undefined;
    this.current.set(null);
  }
}
