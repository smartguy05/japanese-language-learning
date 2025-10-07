import { useState, useMemo } from 'react';
import { useWords } from '../contexts/WordContext';
import { useProgress } from '../contexts/ProgressContext';
import { useSettings } from '../contexts/SettingsContext';
import { Card, Button, Select } from '../components/common';
import { SentenceStudyView } from '../components/sentence/SentenceStudyView';
import { SentenceQuizView } from '../components/sentence/SentenceQuizView';
import { WordGenerator } from '../components/generate';

type View = 'selection' | 'study' | 'quiz' | 'results';
type FilterType = 'all' | 'day' | 'needsReview';

export function SentenceMode() {
  const { words } = useWords();
  const { progress } = useProgress();
  const { hasApiKey } = useSettings();

  const [view, setView] = useState<View>('selection');
  const [filterType, setFilterType] = useState<FilterType>('day');
  const [selectedDay, setSelectedDay] = useState(progress.currentDay);
  const [quizResults, setQuizResults] = useState<{ correct: number; total: number } | null>(null);

  // Get unique days from sentences
  const availableDays = useMemo(() => {
    const days = Array.from(new Set(words.filter(w => w.type === 'sentence').map(w => w.day))).sort((a, b) => a - b);
    return days.length > 0 ? days : [1]; // Default to day 1 if no sentences
  }, [words]);

  // Filter sentences based on selection
  const filteredSentences = useMemo(() => {
    const sentenceTypeItems = words.filter(w => w.type === 'sentence');

    let filtered;
    if (filterType === 'all') {
      filtered = sentenceTypeItems;
    } else if (filterType === 'day') {
      filtered = sentenceTypeItems.filter(w => w.day === selectedDay);
    } else if (filterType === 'needsReview') {
      filtered = sentenceTypeItems.filter(w => w.needsReview);
    } else {
      filtered = sentenceTypeItems;
    }

    // Shuffle the filtered sentences for random order
    return [...filtered].sort(() => Math.random() - 0.5);
  }, [words, filterType, selectedDay]);

  // All sentences for distractor generation
  const allSentences = useMemo(() => words.filter(w => w.type === 'sentence'), [words]);

  const handleStartStudy = () => {
    setView('study');
  };

  const handleStartQuiz = () => {
    setView('quiz');
  };

  const handleBack = () => {
    setView('selection');
    setQuizResults(null);
  };

  const handleComplete = (score: { correct: number; total: number }) => {
    setQuizResults(score);
    setView('results');
  };

  // Selection view
  if (view === 'selection') {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Sentence Generator - Only visible if API key is set */}
        {hasApiKey && (
          <WordGenerator type="sentence" currentDay={selectedDay} />
        )}

        <Card variant="elevated" padding="large">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Sentence Mode</h1>
          <p className="text-text-secondary mb-6">
            Test your comprehension with multiple-choice questions. Choose the correct English translation for each Japanese sentence.
          </p>

          {/* Filter options */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Select Sentences
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
                  All Sentences
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
          </div>

          {/* Sentence count and actions */}
          <Card variant="default" padding="medium" className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-tertiary">Sentences Available</p>
                <p className="text-3xl font-bold text-text-primary">{filteredSentences.length}</p>
              </div>
              {filteredSentences.length > 0 && (
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

          {filteredSentences.length === 0 && (
            <Card variant="default" padding="medium">
              <p className="text-text-secondary text-center">
                No sentences found for the selected criteria. Try selecting a different day or load some sample data in Settings.
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
      <SentenceStudyView
        sentences={filteredSentences}
        onStartQuiz={handleStartQuiz}
        onBack={handleBack}
      />
    );
  }

  // Quiz view
  if (view === 'quiz') {
    return (
      <SentenceQuizView
        sentences={filteredSentences}
        allSentences={allSentences}
        onComplete={handleComplete}
        onBackToStudy={() => setView('study')}
      />
    );
  }

  // Results view
  if (view === 'results' && quizResults) {
    const accuracy = Math.round((quizResults.correct / quizResults.total) * 100);

    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="elevated" padding="large">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-text-primary mb-4">Quiz Complete!</h2>

            <div className="mb-8">
              <p className="text-6xl font-bold text-indigo mb-2">{accuracy}%</p>
              <p className="text-text-secondary">Accuracy</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card variant="default" padding="medium">
                <p className="text-sm text-text-tertiary mb-1">Correct</p>
                <p className="text-3xl font-bold text-success">{quizResults.correct}</p>
              </Card>
              <Card variant="default" padding="medium">
                <p className="text-sm text-text-tertiary mb-1">Incorrect</p>
                <p className="text-3xl font-bold text-error">
                  {quizResults.total - quizResults.correct}
                </p>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={handleStartQuiz} variant="secondary" className="flex-1">
                Try Again
              </Button>
              <Button onClick={handleBack} variant="primary" className="flex-1">
                Back to Selection
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return null;
}
