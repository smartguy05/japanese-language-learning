export const STORAGE_KEYS = {
  WORDS: 'jp-learn-words',
  PROGRESS: 'jp-learn-progress',
  SETTINGS: 'jp-learn-settings',
  THEME: 'jp-learn-theme',
} as const;

export const DEFAULT_SETTINGS = {
  theme: 'dark' as const,
  reviewMode: 'sequential' as const,
  flashcardDirection: 'japaneseToEnglish' as const,
  showStudyModeByDefault: true,
  claudeApiKey: null,
  claudeModel: null,
  cachedModels: [],
  lastModelsFetch: null,
  lastExportDate: null,
  dataVersion: '1.0',
};

export const DEFAULT_PROGRESS = {
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
};
