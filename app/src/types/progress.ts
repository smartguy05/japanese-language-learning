export type Mode = 'alphabet' | 'sentence' | 'flashcard';

export interface UserProgress {
  // Overall Statistics
  totalWords: number;
  totalSentences: number;
  masteredWords: number;
  masteredSentences: number;
  wordsNeedingReview: number;

  // Current Session
  currentDay: number; // Active day being studied
  sessionScore: {
    alphabetMode: { correct: number; incorrect: number };
    sentenceMode: { correct: number; incorrect: number };
    flashcardMode: { correct: number; incorrect: number };
  };

  // Historical Data (optional, for future analytics)
  dailyStreak: number;
  lastStudyDate: string; // ISO 8601
  totalStudyTime: number; // Minutes (future enhancement)
}
