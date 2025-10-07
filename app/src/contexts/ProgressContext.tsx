import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { UserProgress, Mode } from '../types';
import { getItem, setItem } from '../utils/storage';
import { STORAGE_KEYS, DEFAULT_PROGRESS } from '../utils/constants';

interface ProgressContextValue {
  progress: UserProgress;
  incrementScore: (mode: Mode, correct: boolean) => void;
  resetSessionScore: () => void;
  markAsMastered: (wordId: string, mastered: boolean) => void;
  markNeedsReview: (wordId: string, needs: boolean) => void;
  recordReview: (wordId: string, correct: boolean) => void;
  getAccuracyRate: (mode?: Mode) => number;
  updateCurrentDay: (day: number) => void;
  updateStats: (stats: Partial<UserProgress>) => void;
  resetAllProgress: () => void;
}

const ProgressContext = createContext<ProgressContextValue | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<UserProgress>(() => {
    return getItem<UserProgress>(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
  });

  // Persist to localStorage whenever progress changes
  useEffect(() => {
    setItem(STORAGE_KEYS.PROGRESS, progress);
  }, [progress]);

  const incrementScore = useCallback((mode: Mode, correct: boolean) => {
    setProgress(prev => {
      const modeKey = `${mode}Mode` as keyof typeof prev.sessionScore;
      const field = correct ? 'correct' : 'incorrect';

      return {
        ...prev,
        sessionScore: {
          ...prev.sessionScore,
          [modeKey]: {
            ...prev.sessionScore[modeKey],
            [field]: prev.sessionScore[modeKey][field] + 1,
          },
        },
        lastStudyDate: new Date().toISOString(),
      };
    });
  }, []);

  const resetSessionScore = useCallback(() => {
    setProgress(prev => ({
      ...prev,
      sessionScore: {
        alphabetMode: { correct: 0, incorrect: 0 },
        sentenceMode: { correct: 0, incorrect: 0 },
        flashcardMode: { correct: 0, incorrect: 0 },
      },
    }));
  }, []);

  const markAsMastered = useCallback((wordId: string, mastered: boolean) => {
    setProgress(prev => ({
      ...prev,
      masteredWords: mastered ? prev.masteredWords + 1 : Math.max(0, prev.masteredWords - 1),
    }));
  }, []);

  const markNeedsReview = useCallback((wordId: string, needs: boolean) => {
    setProgress(prev => ({
      ...prev,
      wordsNeedingReview: needs ? prev.wordsNeedingReview + 1 : Math.max(0, prev.wordsNeedingReview - 1),
    }));
  }, []);

  const recordReview = useCallback((wordId: string, correct: boolean) => {
    // This is handled by Word updates in WordContext
    // But we update study date here
    setProgress(prev => ({
      ...prev,
      lastStudyDate: new Date().toISOString(),
    }));
  }, []);

  const getAccuracyRate = useCallback((mode?: Mode): number => {
    if (mode) {
      const modeKey = `${mode}Mode` as keyof typeof progress.sessionScore;
      const { correct, incorrect } = progress.sessionScore[modeKey];
      const total = correct + incorrect;
      return total === 0 ? 0 : Math.round((correct / total) * 100);
    }

    // Overall accuracy
    const totalCorrect = Object.values(progress.sessionScore).reduce(
      (sum, score) => sum + score.correct,
      0
    );
    const totalIncorrect = Object.values(progress.sessionScore).reduce(
      (sum, score) => sum + score.incorrect,
      0
    );
    const total = totalCorrect + totalIncorrect;
    return total === 0 ? 0 : Math.round((totalCorrect / total) * 100);
  }, [progress]);

  const updateCurrentDay = useCallback((day: number) => {
    setProgress(prev => ({
      ...prev,
      currentDay: day,
    }));
  }, []);

  const updateStats = useCallback((stats: Partial<UserProgress>) => {
    setProgress(prev => ({
      ...prev,
      ...stats,
    }));
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return (
    <ProgressContext.Provider
      value={{
        progress,
        incrementScore,
        resetSessionScore,
        markAsMastered,
        markNeedsReview,
        recordReview,
        getAccuracyRate,
        updateCurrentDay,
        updateStats,
        resetAllProgress,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgress must be used within ProgressProvider');
  }
  return context;
}
