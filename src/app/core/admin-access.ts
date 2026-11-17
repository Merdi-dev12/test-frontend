import { Service, signal } from '@angular/core';

@Service()
export class AdminAccess {
  readonly key = signal('');

  setKey(value: string): void {
    this.key.set(value.trim());
  }
}
