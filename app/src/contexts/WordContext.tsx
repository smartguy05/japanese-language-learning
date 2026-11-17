import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { nanoid } from 'nanoid';
import type { Word, ExportData, AppSettings, SyncReason } from '../types';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS, DEFAULT_SETTINGS, DEFAULT_PROGRESS } from '../utils/constants';
import { validateWord } from '../utils/validation';

interface WordContextValue {
  words: Word[];
  getWordsByDay: (day: number) => Word[];
  getWordsByType: (type: 'word' | 'sentence') => Word[];
  getWordsNeedingReview: () => Word[];
  getMasteredWords: () => Word[];
  getRandomWords: (count: number, filters?: Partial<Word>) => Word[];
  addWord: (word: Omit<Word, 'id' | 'createdAt'>) => void;
  updateWord: (id: string, updates: Partial<Word>) => void;
  deleteWord: (id: string) => void;
  bulkAddWords: (words: Omit<Word, 'id' | 'createdAt'>[]) => void;
  importData: (data: ExportData) => void;
  exportData: () => ExportData;
  clearAllData: () => void;
}

const WordContext = createContext<WordContextValue | undefined>(undefined);

export function WordProvider({ children }: { children: ReactNode }) {
  const [words, setWords] = useState<Word[]>(() => {
    const saved = getItem<Word[]>(STORAGE_KEYS.WORDS, []);
    return saved.filter(validateWord);
  });

  // Import sync context dynamically to avoid circular dependency
  const [triggerSync, setTriggerSync] = useState<((reason: SyncReason) => void) | null>(null);

  useEffect(() => {
    import('./SyncContext').then(module => {
      try {
        const sync = module.useSyncContext();
        setTriggerSync(() => sync.triggerSync);
      } catch {
        // SyncContext not available or not wrapped in provider
      }
    }).catch(() => {
      // Module not available
    });
  }, []);

  // Persist to localStorage whenever words change
  useEffect(() => {
    setItem(STORAGE_KEYS.WORDS, words);

    // Trigger sync after saving to localStorage
    if (triggerSync) {
      triggerSync('word-change');
    }
  }, [words, triggerSync]);

  const getWordsByDay = useCallback((day: number): Word[] => {
    return words.filter(word => word.day === day);
  }, [words]);

  const getWordsByType = useCallback((type: 'word' | 'sentence'): Word[] => {
    return words.filter(word => word.type === type);
  }, [words]);

  const getWordsNeedingReview = useCallback((): Word[] => {
    return words.filter(word => word.needsReview);
  }, [words]);

  const getMasteredWords = useCallback((): Word[] => {
    return words.filter(word => word.mastered);
  }, [words]);

  const getRandomWords = useCallback((count: number, filters?: Partial<Word>): Word[] => {
    let filtered = words;

    if (filters) {
      if (filters.day !== undefined) {
        filtered = filtered.filter(w => w.day === filters.day);
      }
      if (filters.type !== undefined) {
        filtered = filtered.filter(w => w.type === filters.type);
      }
      if (filters.needsReview !== undefined) {
        filtered = filtered.filter(w => w.needsReview === filters.needsReview);
      }
      if (filters.mastered !== undefined) {
        filtered = filtered.filter(w => w.mastered === filters.mastered);
      }
    }

    // Shuffle and take count
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }, [words]);

  const addWord = useCallback((word: Omit<Word, 'id' | 'createdAt' | 'lastModified'>) => {
    const now = Date.now();
    const newWord: Word = {
      ...word,
      id: nanoid(),
      createdAt: new Date().toISOString(),
      lastModified: now,
    };
    setWords(prev => [...prev, newWord]);
  }, []);

  const updateWord = useCallback((id: string, updates: Partial<Word>) => {
    const now = Date.now();
    setWords(prev =>
      prev.map(word =>
        word.id === id ? { ...word, ...updates, lastModified: now } : word
      )
    );
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords(prev => prev.filter(word => word.id !== id));
  }, []);

  const bulkAddWords = useCallback((newWords: Omit<Word, 'id' | 'createdAt' | 'lastModified'>[]) => {
    const nowISO = new Date().toISOString();
    const nowTimestamp = Date.now();
    const wordsWithIds: Word[] = newWords.map(word => ({
      ...word,
      id: nanoid(),
      createdAt: nowISO,
      lastModified: nowTimestamp,
    }));
    setWords(prev => [...prev, ...wordsWithIds]);
  }, []);

  const importData = useCallback((data: ExportData) => {
    // Import words
    setWords(data.data.words);

    // Import progress if available
    if (data.data.progress) {
      setItem(STORAGE_KEYS.PROGRESS, data.data.progress);
    }

    // Import settings if available (excluding theme which is managed separately)
    if (data.data.settings) {
      const currentSettings = getItem<AppSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
      const { theme: currentTheme } = currentSettings;

      // Merge imported settings while preserving current theme
      const mergedSettings = {
        ...data.data.settings,
        theme: currentTheme || 'dark',
        lastModified: Date.now(),
      };

      setItem(STORAGE_KEYS.SETTINGS, mergedSettings);

      // Dispatch custom event to notify SettingsContext of the change
      window.dispatchEvent(new CustomEvent('settings-imported'));
    }
  }, []);

  const exportData = useCallback((): ExportData => {
    const progress = getItem(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
    const settings = getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);

    const { theme, ...settingsWithoutTheme } = settings;

    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      data: {
        words,
        progress,
        settings: settingsWithoutTheme,
      },
    };
  }, [words]);

  const clearAllData = useCallback(() => {
    setWords([]);
  }, []);

  return (
    <WordContext.Provider
      value={{
        words,
        getWordsByDay,
        getWordsByType,
        getWordsNeedingReview,
        getMasteredWords,
        getRandomWords,
        addWord,
        updateWord,
        deleteWord,
        bulkAddWords,
        importData,
        exportData,
        clearAllData,
      }}
    >
      {children}
    </WordContext.Provider>
  );
}

export function useWords() {
  const context = useContext(WordContext);
  if (!context) {
    throw new Error('useWords must be used within WordProvider');
  }
  return context;
}
