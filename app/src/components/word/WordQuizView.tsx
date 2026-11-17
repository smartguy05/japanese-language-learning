import { useState, useEffect } from 'react';
import type { Word } from '../../types/word';
import type { CharacterMap } from '../../utils/characterMapping';
import { generateCharacterMap, revealCharacter, revealAll, areAllRevealed } from '../../utils/characterMapping';
import { Card, Button, SpeakerButton } from '../common';
import { useSpeech } from '../../hooks/useSpeech';
import { useWords } from '../../contexts/WordContext';

interface WordQuizViewProps {
  words: Word[];
  onComplete: () => void;
  onBackToStudy: () => void;
}

export function WordQuizView({ words, onComplete, onBackToStudy }: WordQuizViewProps) {
  const { speak, isSpeaking } = useSpeech();
  const { updateWord } = useWords();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [characterMaps, setCharacterMaps] = useState<CharacterMap[][]>([]);

  // Initialize character maps for all words
  useEffect(() => {
    const maps = words.map(word => generateCharacterMap(word));
    setCharacterMaps(maps);
  }, [words]);

  const currentWord = words[currentIndex];
  const currentCharMap = characterMaps[currentIndex] || [];

  const handleCharacterClick = (charIndex: number) => {
    if (!currentCharMap[charIndex].revealed) {
      const newCharMaps = [...characterMaps];
      newCharMaps[currentIndex] = revealCharacter(currentCharMap, charIndex);
      setCharacterMaps(newCharMaps);
    }
  };

  const handleRevealAll = () => {
    const newCharMaps = [...characterMaps];
    newCharMaps[currentIndex] = revealAll(currentCharMap);
    setCharacterMaps(newCharMaps);
  };

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleToggleMastered = () => {
    updateWord(currentWord.id, { mastered: !currentWord.mastered });
  };

  const allRevealed = areAllRevealed(currentCharMap);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && currentIndex < words.length - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentIndex > 0) {
        handlePrevious();
      } else if (e.key === ' ' && !allRevealed) {
        e.preventDefault();
        handleRevealAll();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, words.length, allRevealed]);

  if (!currentWord) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">
            Word {currentIndex + 1} of {words.length}
          </span>
          <Button onClick={onBackToStudy} variant="ghost" size="small">
            Back to Study
          </Button>
        </div>
        <div className="w-full bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-full h-2">
          <div
            className="bg-indigo h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Quiz card */}
      <Card variant="elevated" padding="large">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-sm text-text-tertiary">Click each Japanese character to reveal its romanji</p>
            <SpeakerButton
              text={currentWord.japanese}
              onSpeak={speak}
              isSpeaking={isSpeaking}
              variant="ghost"
              size="small"
              ariaLabel={`Listen to ${currentWord.japanese}`}
            />
          </div>

          {/* Japanese characters */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {currentCharMap.map((char, index) => (
              <button
                key={index}
                onClick={() => handleCharacterClick(index)}
                className={`min-w-[48px] min-h-[48px] px-2 flex flex-col items-center justify-center rounded-lg transition-all ${
                  char.japanese === ' '
                    ? 'cursor-default'
                    : char.revealed
                    ? 'bg-success bg-opacity-10 cursor-default'
                    : 'bg-bg-secondary dark:bg-bg-secondary-dark hover:bg-indigo hover:bg-opacity-20 cursor-pointer active:scale-95'
                }`}
                disabled={char.japanese === ' ' || char.revealed}
              >
                <span className="text-4xl md:text-5xl font-japanese text-text-primary mb-1">
                  {char.japanese}
                </span>
                <span
                  className={`text-lg md:text-xl font-mono text-text-secondary transition-all duration-200 ${
                    char.revealed ? 'opacity-100' : 'blur-md opacity-50'
                  }`}
                >
                  {char.romanji}
                </span>
              </button>
            ))}
          </div>

          {/* Complete Romanji when all characters revealed */}
          {allRevealed && (
            <div className="mb-6 p-4 bg-indigo bg-opacity-10 rounded-lg border border-indigo border-opacity-20">
              <p className="text-xs text-text-tertiary mb-2">Romanji (Complete)</p>
              <p className="text-2xl font-mono text-indigo">
                {currentWord.romanji}
              </p>
            </div>
          )}

          {/* English translation */}
          <div className="mt-8 p-4 bg-bg-secondary dark:bg-bg-secondary-dark rounded-lg">
            <p className="text-xs text-text-tertiary mb-1">English</p>
            <p className="text-xl text-text-primary">{currentWord.english}</p>
          </div>

          {/* Mastered toggle */}
          <div className="mt-4">
            <Button
              onClick={handleToggleMastered}
              variant={currentWord.mastered ? 'primary' : 'ghost'}
              size="small"
            >
              {currentWord.mastered ? '✓ Mastered' : 'Mark as Mastered'}
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <Button
            onClick={handlePrevious}
            variant="secondary"
            disabled={currentIndex === 0}
            className="flex-1"
          >
            ← Previous
          </Button>

          {!allRevealed && (
            <Button onClick={handleRevealAll} variant="ghost" className="flex-1">
              Reveal All
            </Button>
          )}

          <Button
            onClick={handleNext}
            variant="primary"
            className="flex-1"
          >
            {currentIndex === words.length - 1 ? 'Finish' : 'Next →'}
          </Button>
        </div>

        {/* Keyboard hints */}
        <div className="mt-6 pt-6 border-t border-border-subtle">
          <p className="text-xs text-text-tertiary text-center">
            Keyboard shortcuts: ← → to navigate, Space to reveal all
          </p>
        </div>
      </Card>
    </div>
  );
}
