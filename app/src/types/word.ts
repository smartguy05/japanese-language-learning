export interface Word {
  // Unique identifier
  id: string; // nanoid generated

  // Content
  japanese: string; // 漢字, ひらがな, or カタカナ
  romanji: string; // Latin alphabet transliteration
  english: string; // English translation

  // Organization
  day: number; // Which day this was added (1-indexed)
  type: 'word' | 'sentence'; // For filtering and display

  // Learning Progress
  mastered: boolean; // User marked as mastered
  needsReview: boolean; // Flagged for additional practice
  reviewCount: number; // Times this word has been reviewed
  correctCount: number; // Times answered correctly
  incorrectCount: number; // Times answered incorrectly

  // Metadata
  lastReviewed: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
}

export interface ExportData {
  version: '1.0'; // Schema version for future compatibility
  exportDate: string; // ISO 8601
  data: {
    words: Word[];
    progress: UserProgress;
    settings: Omit<AppSettings, 'theme'>; // Theme is device-specific
  };
}

// Import for convenience
import type { UserProgress } from './progress';
import type { AppSettings } from './settings';
