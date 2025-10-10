import { useState, useMemo } from 'react';
import { Card, Button, Select } from '../common';
import { useSettings } from '../../contexts/SettingsContext';
import { useWords } from '../../contexts/WordContext';
import { generateWordsWithClaude } from '../../utils/claudeApi';
import type { Word } from '../../types/word';

type CharacterType = 'both' | 'hiragana' | 'katakana';

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

  const [isExpanded, setIsExpanded] = useState(false);
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState(3);
  const [selectedDay, setSelectedDay] = useState(nextDay);
  const [characterType, setCharacterType] = useState<CharacterType>('both');
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
        characterType,
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-text-primary">
          Generate New {type === 'word' ? 'Words' : 'Sentences'} with AI
        </h2>
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          variant="secondary"
          size="small"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-4 mt-4">
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

        {/* Character Type Selection */}
        <div>
          <label htmlFor="character-type" className="block text-text-primary font-medium mb-2">
            Character Type
          </label>
          <Select
            id="character-type"
            value={characterType}
            onChange={(e) => setCharacterType(e.target.value as CharacterType)}
          >
            <option value="both">Both (Hiragana & Katakana)</option>
            <option value="hiragana">Hiragana Only</option>
            <option value="katakana">Katakana Only</option>
          </Select>
          <p className="text-xs text-text-secondary mt-1">
            Choose which Japanese script to use for generated words
          </p>
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
      )}
    </Card>
  );
}
