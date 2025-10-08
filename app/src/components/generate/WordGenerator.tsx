import { useState, useMemo } from 'react';
import { Card, Button, Select } from '../common';
import { useSettings } from '../../contexts/SettingsContext';
import { useWords } from '../../contexts/WordContext';
import { generateWordsWithClaude } from '../../utils/claudeApi';
import type { Word } from '../../types/word';

interface WordGeneratorProps {
  type: 'word' | 'sentence';
  currentDay: number;
}

export function WordGenerator({ type }: WordGeneratorProps) {
  const { settings } = useSettings();
  const { words, bulkAddWords } = useWords();

  // Calculate available days and next day
  const { availableDays, nextDay } = useMemo(() => {
    const days = Array.from(new Set(words.map(w => w.day))).sort((a, b) => a - b);
    const maxDay = days.length > 0 ? Math.max(...days) : 0;
    return {
      availableDays: days,
      nextDay: maxDay + 1
    };
  }, [words]);

  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [selectedDay, setSelectedDay] = useState(nextDay);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Update selectedDay when nextDay changes
  useMemo(() => {
    setSelectedDay(nextDay);
  }, [nextDay]);

  const difficultyLabels = [
    'Absolute Beginner',
    'Beginner',
    'Elementary',
    'Intermediate',
    'Advanced'
  ];

  const handleGenerate = async () => {
    if (!settings.claudeApiKey) {
      setError('No API key configured. Please add your Claude API key in Settings.');
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccessMessage('');

    try {
      const generatedWords = await generateWordsWithClaude({
        apiKey: settings.claudeApiKey,
        count,
        difficulty,
        type,
        existingWords: words,
        currentDay: selectedDay,
        model: settings.claudeModel || undefined,
      });

      bulkAddWords(generatedWords as Word[]);
      setSuccessMessage(`Successfully generated ${generatedWords.length} ${type}${generatedWords.length !== 1 ? 's' : ''} for Day ${selectedDay}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate words');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card variant="default" padding="large" className="mb-6">
      <h2 className="text-xl font-semibold text-text-primary mb-4">
        Generate New {type === 'word' ? 'Words' : 'Sentences'} with AI
      </h2>

      <div className="space-y-4">
        {/* Day Selection */}
        <div>
          <label className="block text-text-primary font-medium mb-2">
            Add to Day
          </label>
          <Select
            value={selectedDay.toString()}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
          >
            <option value={nextDay.toString()}>Day {nextDay} (New Day)</option>
            {availableDays.length > 0 && (
              <optgroup label="Existing Days">
                {availableDays.map(day => (
                  <option key={day} value={day.toString()}>
                    Day {day}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>
          <p className="text-xs text-text-secondary mt-1">
            {selectedDay === nextDay
              ? 'Generated items will be added to a new day'
              : `Generated items will be added to existing Day ${selectedDay}`
            }
          </p>
        </div>

        {/* Count Input */}
        <div>
          <label className="block text-text-primary font-medium mb-2">
            Number to Generate: {count}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-2 bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* Difficulty Slider */}
        <div>
          <label className="block text-text-primary font-medium mb-2">
            Difficulty: {difficultyLabels[difficulty - 1]}
          </label>
          <input
            type="range"
            min="1"
            max="5"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
            className="w-full h-2 bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>Easiest</span>
            <span>Hardest</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          variant="primary"
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? `Generating ${type}s...` : `Generate ${count} ${type}${count !== 1 ? 's' : ''}`}
        </Button>

        {/* Error Message */}
        {error && (
          <p className="text-error text-sm">{error}</p>
        )}

        {/* Success Message */}
        {successMessage && (
          <p className="text-success text-sm">{successMessage}</p>
        )}

        <p className="text-text-secondary text-xs">
          Note: Generated {type}s will use only hiragana (ひらがな) or katakana (カタカナ) - no kanji.
        </p>
      </div>
    </Card>
  );
}
