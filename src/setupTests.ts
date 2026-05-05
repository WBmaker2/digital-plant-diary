import '@testing-library/jest-dom/vitest';

const createMemoryStorage = (): Storage => {
  const values = new Map<string, string>();

  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => {
      values.delete(key);
    },
    setItem: (key: string, value: string) => {
      values.set(key, String(value));
    }
  };
};

const installLocalStorageShim = () => {
  if (
    typeof globalThis.localStorage !== 'undefined' &&
    typeof globalThis.localStorage.clear === 'function' &&
    typeof globalThis.localStorage.getItem === 'function'
  ) {
    return;
  }

  const storage = createMemoryStorage();
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: storage
  });

  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage
    });
  }
};

installLocalStorageShim();
