import { useState, useMemo, useEffect } from 'react';
import { useWords } from '../contexts/WordContext';
import { useProgress } from '../contexts/ProgressContext';
import { Card, Button, Select } from '../components/common';
import { Flashcard } from '../components/flashcard/Flashcard';

type FilterType = 'all' | 'day' | 'needsReview' | 'words' | 'sentences';
type Direction = 'japaneseToEnglish' | 'englishToJapanese' | 'random';

export function FlashcardMode() {
  const { words } = useWords();
  const { progress } = useProgress();

  const [view, setView] = useState<'selection' | 'study'>('selection');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedDay, setSelectedDay] = useState(progress.currentDay);
  const [direction, setDirection] = useState<Direction>('japaneseToEnglish');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get unique days
  const availableDays = useMemo(() => {
    const days = Array.from(new Set(words.map(w => w.day))).sort((a, b) => a - b);
    return days.length > 0 ? days : [1]; // Default to day 1 if no items
  }, [words]);

  // Filter items based on selection
  const filteredItems = useMemo(() => {
    let items = words;

    if (filterType === 'words') {
      items = words.filter(w => w.type === 'word');
    } else if (filterType === 'sentences') {
      items = words.filter(w => w.type === 'sentence');
    } else if (filterType === 'day') {
      items = words.filter(w => w.day === selectedDay);
    } else if (filterType === 'needsReview') {
      items = words.filter(w => w.needsReview);
    }

    return items;
  }, [words, filterType, selectedDay]);

  // Determine actual direction for current card
  const currentDirection = useMemo(() => {
    if (direction === 'random') {
      return Math.random() > 0.5 ? 'japaneseToEnglish' : 'englishToJapanese';
    }
    return direction;
  }, [direction, currentIndex]);

  const currentItem = filteredItems[currentIndex];

  const handleNext = () => {
    if (currentIndex < filteredItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleStartStudy = () => {
    setCurrentIndex(0);
    setView('study');
  };

  const handleBack = () => {
    setView('selection');
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (view !== 'study') return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [view, currentIndex, filteredItems.length]);

  // Selection view
  if (view === 'selection') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="elevated" padding="large">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Flashcard Mode</h1>
          <p className="text-text-secondary mb-6">
            Review words and sentences with traditional flashcards. Flip cards to see translations and use arrow keys or swipe to navigate.
          </p>

          {/* Filter options */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Content
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Button
                  variant={filterType === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('all')}
                  className="w-full"
                >
                  All
                </Button>
                <Button
                  variant={filterType === 'words' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('words')}
                  className="w-full"
                >
                  Words
                </Button>
                <Button
                  variant={filterType === 'sentences' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('sentences')}
                  className="w-full"
                >
                  Sentences
                </Button>
                <Button
                  variant={filterType === 'day' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('day')}
                  className="w-full"
                >
                  By Day
                </Button>
                <Button
                  variant={filterType === 'needsReview' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('needsReview')}
                  className="w-full"
                >
                  Review
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

            {/* Direction selection */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Study Direction
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button
                  variant={direction === 'japaneseToEnglish' ? 'primary' : 'secondary'}
                  onClick={() => setDirection('japaneseToEnglish')}
                  className="w-full"
                >
                  Japanese → English
                </Button>
                <Button
                  variant={direction === 'englishToJapanese' ? 'primary' : 'secondary'}
                  onClick={() => setDirection('englishToJapanese')}
                  className="w-full"
                >
                  English → Japanese
                </Button>
                <Button
                  variant={direction === 'random' ? 'primary' : 'secondary'}
                  onClick={() => setDirection('random')}
                  className="w-full"
                >
                  Random
                </Button>
              </div>
            </div>
          </div>

          {/* Item count and start button */}
          <Card variant="default" padding="medium" className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-tertiary">Cards Available</p>
                <p className="text-3xl font-bold text-text-primary">{filteredItems.length}</p>
              </div>
              {filteredItems.length > 0 && (
                <Button onClick={handleStartStudy} variant="primary">
                  Start Studying
                </Button>
              )}
            </div>
          </Card>

          {filteredItems.length === 0 && (
            <Card variant="default" padding="medium">
              <p className="text-text-secondary text-center">
                No items found for the selected criteria. Try a different filter or load sample data in Settings.
              </p>
            </Card>
          )}
        </Card>
      </div>
    );
  }

  // Study view
  if (view === 'study' && currentItem) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Progress and controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">
              Card {currentIndex + 1} of {filteredItems.length}
            </span>
            <Button onClick={handleBack} variant="ghost" size="small">
              Back to Selection
            </Button>
          </div>
          <div className="w-full bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-full h-2">
            <div
              className="bg-indigo h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / filteredItems.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-6">
          <Flashcard
            word={currentItem}
            direction={currentDirection}
            onSwipeLeft={handleNext}
            onSwipeRight={handlePrevious}
          />
        </div>

        {/* Navigation */}
        <div className="flex gap-4">
          <Button
            onClick={handlePrevious}
            variant="secondary"
            disabled={currentIndex === 0}
            className="flex-1"
          >
            ← Previous
          </Button>
          <Button
            onClick={handleNext}
            variant="primary"
            disabled={currentIndex === filteredItems.length - 1}
            className="flex-1"
          >
            Next →
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="mt-6">
          <p className="text-xs text-text-tertiary text-center">
            Keyboard: ← → to navigate | Swipe: Left for next, Right for previous
          </p>
        </div>
      </div>
    );
  }

  return null;
}
