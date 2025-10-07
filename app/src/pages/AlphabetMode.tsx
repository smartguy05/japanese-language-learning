import { useState, useMemo } from 'react';
import { useWords } from '../contexts/WordContext';
import { useProgress } from '../contexts/ProgressContext';
import { useSettings } from '../contexts/SettingsContext';
import { Card, Button, Select } from '../components/common';
import { AlphabetStudyView } from '../components/alphabet/AlphabetStudyView';
import { AlphabetQuizView } from '../components/alphabet/AlphabetQuizView';
import { WordGenerator } from '../components/generate';

type View = 'selection' | 'study' | 'quiz';
type FilterType = 'all' | 'day' | 'needsReview';

export function AlphabetMode() {
  const { words } = useWords();
  const { progress } = useProgress();
  const { hasApiKey } = useSettings();

  const [view, setView] = useState<View>('selection');
  const [filterType, setFilterType] = useState<FilterType>('day');
  const [selectedDay, setSelectedDay] = useState(progress.currentDay);
  const [includeSentences, setIncludeSentences] = useState(false);

  // Get unique days from words
  const availableDays = useMemo(() => {
    const days = Array.from(new Set(words.filter(w => w.type === 'word').map(w => w.day))).sort((a, b) => a - b);
    return days.length > 0 ? days : [1]; // Default to day 1 if no words
  }, [words]);

  // Filter words based on selection
  const filteredWords = useMemo(() => {
    // Start with words, optionally include sentences
    const typeFilter = includeSentences
      ? words.filter(w => w.type === 'word' || w.type === 'sentence')
      : words.filter(w => w.type === 'word');

    let filtered;
    if (filterType === 'all') {
      filtered = typeFilter;
    } else if (filterType === 'day') {
      filtered = typeFilter.filter(w => w.day === selectedDay);
    } else if (filterType === 'needsReview') {
      filtered = typeFilter.filter(w => w.needsReview);
    } else {
      filtered = typeFilter;
    }

    // Shuffle the filtered words for random order
    return [...filtered].sort(() => Math.random() - 0.5);
  }, [words, filterType, selectedDay, includeSentences]);

  const handleStartStudy = () => {
    setView('study');
  };

  const handleStartQuiz = () => {
    setView('quiz');
  };

  const handleBack = () => {
    setView('selection');
  };

  const handleComplete = () => {
    setView('selection');
  };

  // Selection view
  if (view === 'selection') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Word Generator - Only visible if API key is set */}
        {hasApiKey && (
          <WordGenerator type="word" currentDay={selectedDay} />
        )}

        <Card variant="elevated" padding="large">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Alphabet Mode</h1>
          <p className="text-text-secondary mb-6">
            Click on Japanese characters to reveal their romanji pronunciation. Perfect for learning hiragana and katakana.
          </p>

          {/* Filter options */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Words
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant={filterType === 'day' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('day')}
                  className="w-full"
                >
                  By Day
                </Button>
                <Button
                  variant={filterType === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('all')}
                  className="w-full"
                >
                  All Words
                </Button>
                <Button
                  variant={filterType === 'needsReview' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('needsReview')}
                  className="w-full"
                >
                  Needs Review
                </Button>
              </div>
            </div>

            {filterType === 'day' && (
              <div>
                <label htmlFor="day-select" className="block text-sm font-medium text-text-primary mb-2">
                  Day
                </label>
                <Select
                  id="day-select"
                  value={selectedDay.toString()}
                  onChange={(e) => setSelectedDay(Number(e.target.value))}
                >
                  {availableDays.map((day) => (
                    <option key={day} value={day}>
                      Day {day}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Include Sentences Toggle */}
            <div className="flex items-center justify-between p-4 bg-bg-secondary dark:bg-bg-secondary-dark rounded-lg">
              <div>
                <label htmlFor="include-sentences" className="block text-sm font-medium text-text-primary mb-1">
                  Include Sentences
                </label>
                <p className="text-xs text-text-tertiary">
                  Practice reading sentences character by character
                </p>
              </div>
              <button
                id="include-sentences"
                role="switch"
                aria-checked={includeSentences}
                onClick={() => setIncludeSentences(!includeSentences)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2 ${
                  includeSentences ? 'bg-indigo' : 'bg-bg-tertiary dark:bg-bg-tertiary-dark'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    includeSentences ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Word count and actions */}
          <Card variant="default" padding="medium" className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-tertiary">Words Available</p>
                <p className="text-3xl font-bold text-text-primary">{filteredWords.length}</p>
              </div>
              {filteredWords.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-text-tertiary mb-2">Ready to practice?</p>
                  <div className="flex gap-2">
                    <Button onClick={handleStartStudy} variant="secondary" size="small">
                      Study First
                    </Button>
                    <Button onClick={handleStartQuiz} variant="primary" size="small">
                      Start Quiz
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {filteredWords.length === 0 && (
            <Card variant="default" padding="medium">
              <p className="text-text-secondary text-center">
                No words found for the selected criteria. Try selecting a different day or load some sample data in Settings.
              </p>
            </Card>
          )}
        </Card>
      </div>
    );
  }

  // Study view
  if (view === 'study') {
    return (
      <AlphabetStudyView
        words={filteredWords}
        onStartQuiz={handleStartQuiz}
        onBack={handleBack}
      />
    );
  }

  // Quiz view
  if (view === 'quiz') {
    return (
      <AlphabetQuizView
        words={filteredWords}
        onComplete={handleComplete}
        onBackToStudy={() => setView('study')}
      />
    );
  }

  return null;
}
