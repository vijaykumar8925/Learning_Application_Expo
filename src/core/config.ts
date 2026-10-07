/**
 * Core runtime configuration and testable clock/delay abstraction.
 */

export type FakeApiMode = 'SUCCESS' | 'EMPTY' | 'FAILURE';

class DevConfigStore {
  private mode: FakeApiMode = 'SUCCESS';
  private listeners: Set<(mode: FakeApiMode) => void> = new Set();

  getFakeApiMode(): FakeApiMode {
    return this.mode;
  }

  setFakeApiMode(newMode: FakeApiMode): void {
    if (this.mode !== newMode) {
      this.mode = newMode;
      this.listeners.forEach((listener) => listener(this.mode));
    }
  }

  subscribe(listener: (mode: FakeApiMode) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const devConfig = new DevConfigStore();

export interface Clock {
  delay: (ms: number) => Promise<void>;
  now: () => number;
}

export const defaultClock: Clock = {
  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  now: () => Date.now(),
};

/**
 * Clock implementation for unit tests with zero wait time.
 */
export const instantClock: Clock = {
  delay: () => Promise.resolve(),
  now: () => 1700000000000,
};
