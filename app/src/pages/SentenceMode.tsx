import { useState, useMemo } from 'react';
import { useWords } from '../contexts/WordContext';
import { useSettings } from '../contexts/SettingsContext';
import { Card, Button, Select } from '../components/common';
import { SentenceStudyView } from '../components/sentence/SentenceStudyView';
import { SentenceQuizView } from '../components/sentence/SentenceQuizView';
import { WordGenerator } from '../components/generate';

type View = 'selection' | 'study' | 'quiz' | 'results';
type FilterType = 'all' | 'category' | 'needsReview' | 'random';

export function SentenceMode() {
  const { words } = useWords();
  const { hasApiKey } = useSettings();

  const [view, setView] = useState<View>('selection');
  const [filterType, setFilterType] = useState<FilterType>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [quizResults, setQuizResults] = useState<{ correct: number; total: number } | null>(null);
  const [randomCount, setRandomCount] = useState(10);
  const [limitCount, setLimitCount] = useState(10);

  // Get unique categories from sentences
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(words.filter(w => w.type === 'sentence').map(w => w.category))).sort();
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0]);
    }
    return categories.length > 0 ? categories : ['Greetings'];
  }, [words]);

  // Initialize selectedCategory when availableCategories change
  useMemo(() => {
    if (availableCategories.length > 0 && !selectedCategory) {
      setSelectedCategory(availableCategories[0]);
    }
  }, [availableCategories, selectedCategory]);

  // Filter sentences based on selection
  const filteredSentences = useMemo(() => {
    const sentenceTypeItems = words.filter(w => w.type === 'sentence');

    let filtered;
    if (filterType === 'all') {
      filtered = sentenceTypeItems;
    } else if (filterType === 'category') {
      filtered = sentenceTypeItems.filter(w => w.category === selectedCategory);
    } else if (filterType === 'needsReview') {
      filtered = sentenceTypeItems.filter(w => w.needsReview);
    } else if (filterType === 'random') {
      filtered = sentenceTypeItems;
    } else {
      filtered = sentenceTypeItems;
    }

    // Shuffle the filtered sentences for random order
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);

    // Apply limit for random or category/all modes
    if (filterType === 'random') {
      return shuffled.slice(0, randomCount);
    } else if (filterType === 'category' || filterType === 'all') {
      return shuffled.slice(0, limitCount);
    }

    return shuffled;
  }, [words, filterType, selectedCategory, randomCount, limitCount]);

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
          <WordGenerator type="sentence" currentCategory={selectedCategory} />
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Button
                  variant={filterType === 'category' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('category')}
                  className="w-full"
                >
                  By Category
                </Button>
                <Button
                  variant={filterType === 'all' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('all')}
                  className="w-full"
                >
                  All Sentences
                </Button>
                <Button
                  variant={filterType === 'random' ? 'primary' : 'secondary'}
                  onClick={() => setFilterType('random')}
                  className="w-full"
                >
                  Random
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

            {filterType === 'category' && (
              <div>
                <label htmlFor="category-select" className="block text-sm font-medium text-text-primary mb-2">
                  Category
                </label>
                <Select
                  id="category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {filterType === 'random' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Number of Sentences: {randomCount}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={randomCount}
                  onChange={(e) => setRandomCount(Number(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>1</span>
                  <span>50</span>
                </div>
              </div>
            )}

            {(filterType === 'category' || filterType === 'all') && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Limit to: {limitCount} sentences
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={limitCount}
                  onChange={(e) => setLimitCount(Number(e.target.value))}
                  className="w-full h-2 bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between text-xs text-text-secondary mt-1">
                  <span>1</span>
                  <span>50</span>
                </div>
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
