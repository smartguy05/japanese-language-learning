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

/**
 * Sync-specific storage functions
 */

import type { SyncConfig, AppData, Word, UserProgress, AppSettings } from '../types';

// LocalStorage keys for sync
const SYNC_CONFIG_KEY = 'jp-learn-sync-config';
const LAST_LOCAL_CHANGE_KEY = 'jp-learn-last-change';
const WORDS_KEY = 'jp-learn-words';
const PROGRESS_KEY = 'jp-learn-progress';
const SETTINGS_KEY = 'jp-learn-settings';

/**
 * Get sync configuration
 */
export function getSyncConfig(): SyncConfig {
  return getItem<SyncConfig>(SYNC_CONFIG_KEY, {
    enabled: false,
    googleAccessToken: null,
    googleTokenExpiry: null,
    googleRefreshToken: null,
    driveFileId: null,
    lastSyncTime: null,
    lastLocalChangeTime: Date.now(),
    pendingSyncOperations: [],
    syncFailureCount: 0,
    lastError: null,
  });
}

/**
 * Set sync configuration
 */
export function setSyncConfig(config: SyncConfig): void {
  setItem(SYNC_CONFIG_KEY, config);
}

/**
 * Update sync configuration (partial update)
 */
export function updateSyncConfig(updates: Partial<SyncConfig>): void {
  const current = getSyncConfig();
  setSyncConfig({ ...current, ...updates });
}

/**
 * Set last local change time
 */
export function setLastLocalChangeTime(timestamp: number): void {
  setItem(LAST_LOCAL_CHANGE_KEY, timestamp);
  updateSyncConfig({ lastLocalChangeTime: timestamp });
}

/**
 * Get last local change time
 */
export function getLastLocalChangeTime(): number {
  return getItem<number>(LAST_LOCAL_CHANGE_KEY, Date.now());
}

/**
 * Export all data for sync (bundled format)
 */
export function exportAllDataForSync(): AppData {
  const words = getItem<Word[]>(WORDS_KEY, []);
  const progress = getItem<UserProgress | null>(PROGRESS_KEY, null);
  const settings = getItem<AppSettings | null>(SETTINGS_KEY, null);

  // Remove theme from settings (device-specific)
  const settingsWithoutTheme = settings ? (() => {
    const { theme, ...rest } = settings;
    return rest;
  })() : {} as Omit<AppSettings, 'theme'>;

  // Get the latest modification time from all entities
  const wordTimestamps = words.map(w => w.lastModified || Date.now());
  const progressTimestamp = progress?.lastModified || Date.now();
  const settingsTimestamp = settings?.lastModified || Date.now();
  const allTimestamps = [...wordTimestamps, progressTimestamp, settingsTimestamp];
  const latestModified = Math.max(...allTimestamps, Date.now());

  return {
    version: '1.0',
    appVersion: '1.0.0', // TODO: Get from package.json
    lastModified: latestModified,
    data: {
      words,
      progress: progress || getDefaultProgress(),
      settings: settingsWithoutTheme,
    },
  };
}

/**
 * Import all data from sync
 */
export function importAllDataFromSync(data: AppData['data']): void {
  // Import words
  setItem(WORDS_KEY, data.words);

  // Import progress
  setItem(PROGRESS_KEY, data.progress);

  // Import settings (merge with current theme)
  const currentSettings = getItem<AppSettings | null>(SETTINGS_KEY, null);
  const currentTheme = currentSettings?.theme || 'dark';
  setItem(SETTINGS_KEY, { ...data.settings, theme: currentTheme });

  // Update last local change time
  setLastLocalChangeTime(Date.now());
}

/**
 * Clear sync configuration (for disconnect)
 */
export function clearSyncConfig(): void {
  removeItem(SYNC_CONFIG_KEY);
  removeItem(LAST_LOCAL_CHANGE_KEY);
}

/**
 * Get default progress object
 */
function getDefaultProgress(): UserProgress {
  return {
    totalWords: 0,
    totalSentences: 0,
    masteredWords: 0,
    masteredSentences: 0,
    wordsNeedingReview: 0,
    currentDay: 1,
    sessionScore: {
      wordMode: { correct: 0, incorrect: 0 },
      sentenceMode: { correct: 0, incorrect: 0 },
      flashcardMode: { correct: 0, incorrect: 0 },
    },
    dailyStreak: 0,
    lastStudyDate: new Date().toISOString(),
    totalStudyTime: 0,
    lastModified: Date.now(),
  };
}
