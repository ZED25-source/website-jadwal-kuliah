const store: Record<string, string> = {};

const mockStorage: Storage = {
  get length(): number {
    return Object.keys(store).length;
  },
  clear(): void {
    Object.keys(store).forEach((k) => delete store[k]);
  },
  getItem(key: string): string | null {
    return store[key] ?? null;
  },
  key(index: number): string | null {
    return Object.keys(store)[index] ?? null;
  },
  removeItem(key: string): void {
    delete store[key];
  },
  setItem(key: string, value: string): void {
    store[key] = value;
  },
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockStorage,
  writable: true,
  configurable: true,
});
