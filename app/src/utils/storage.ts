/**
 * Type-safe LocalStorage wrapper with error handling
 */

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = window.localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    const serialized = JSON.stringify(value);
    window.localStorage.setItem(key, serialized);
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Consider exporting and clearing old data.');
      throw new Error('Storage quota exceeded');
    }
    console.error(`Error writing to localStorage key "${key}":`, error);
    throw error;
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage key "${key}":`, error);
  }
}

export function clear(): void {
  try {
    window.localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

export function hasItem(key: string): boolean {
  return window.localStorage.getItem(key) !== null;
}

export function getStorageSize(): number {
  let total = 0;
  for (const key in window.localStorage) {
    if (window.localStorage.hasOwnProperty(key)) {
      total += window.localStorage[key].length + key.length;
    }
  }
  return total * 2; // UTF-16 uses 2 bytes per character
}

export function getStorageSizeKB(): number {
  return Math.round(getStorageSize() / 1024);
}
