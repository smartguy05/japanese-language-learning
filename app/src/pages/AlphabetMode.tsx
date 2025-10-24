import { useState, useMemo } from 'react';
import { useWords } from '../contexts/WordContext';
import { useSettings } from '../contexts/SettingsContext';
import { Card, Button, Select } from '../components/common';
import { AlphabetStudyView } from '../components/alphabet/AlphabetStudyView';
import { AlphabetQuizView } from '../components/alphabet/AlphabetQuizView';
import { WordGenerator } from '../components/generate';

type View = 'selection' | 'study' | 'quiz';
type FilterType = 'all' | 'category' | 'needsReview' | 'random';

export function AlphabetMode() {
  const { words } = useWords();
  const { hasApiKey } = useSettings();

  const [view, setView] = useState<View>('selection');
  const [filterType, setFilterType] = useState<FilterType>('category');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [includeSentences, setIncludeSentences] = useState(false);
  const [randomCount, setRandomCount] = useState(10);
  const [limitCount, setLimitCount] = useState(10);

  // Get unique categories from words
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(words.filter(w => w.type === 'word').map(w => w.category))).sort();
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

  // Filter words based on selection
  const filteredWords = useMemo(() => {
    // Start with words, optionally include sentences
    const typeFilter = includeSentences
      ? words.filter(w => w.type === 'word' || w.type === 'sentence')
      : words.filter(w => w.type === 'word');

    let filtered;
    if (filterType === 'all') {
      filtered = typeFilter;
    } else if (filterType === 'category') {
      filtered = typeFilter.filter(w => w.category === selectedCategory);
    } else if (filterType === 'needsReview') {
      filtered = typeFilter.filter(w => w.needsReview);
    } else if (filterType === 'random') {
      filtered = typeFilter;
    } else {
      filtered = typeFilter;
    }

    // Weighted shuffle: mastered words appear less frequently (20% weight vs 100%)
    const MASTERED_WEIGHT = 0.2;
    const NORMAL_WEIGHT = 1.0;

    // Create weighted array where each word appears based on its weight
    const weighted: typeof filtered = [];
    filtered.forEach(word => {
      const weight = word.mastered ? MASTERED_WEIGHT : NORMAL_WEIGHT;
      // Add word probabilistically: mastered 20% chance, non-mastered 100% chance
      if (Math.random() < weight) {
        weighted.push(word);
      }
    });

    // Ensure we have at least some words - if weighted selection filtered too much, add some mastered words back
    if (weighted.length === 0 && filtered.length > 0) {
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);
      // Apply limit for random or category modes
      if (filterType === 'random') {
        return shuffled.slice(0, randomCount);
      } else if (filterType === 'category' || filterType === 'all') {
        return shuffled.slice(0, limitCount);
      }
      return shuffled;
    }

    // Shuffle the weighted selection for random order
    const shuffled = [...weighted].sort(() => Math.random() - 0.5);

    // Apply limit for random or category modes
    if (filterType === 'random') {
      return shuffled.slice(0, randomCount);
    } else if (filterType === 'category' || filterType === 'all') {
      return shuffled.slice(0, limitCount);
    }

    return shuffled;
  }, [words, filterType, selectedCategory, includeSentences, randomCount, limitCount]);

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
          <WordGenerator type="word" currentCategory={selectedCategory} />
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
                  All Words
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
                  Number of Words: {randomCount}
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
                  Limit to: {limitCount} words
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
