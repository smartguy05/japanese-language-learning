import { useState } from 'react';
import { Word } from '../../types/word';
import { Card } from '../common';

interface FlashcardProps {
  word: Word;
  direction: 'japaneseToEnglish' | 'englishToJapanese';
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function Flashcard({ word, direction, onSwipeLeft, onSwipeRight }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const frontContent = direction === 'japaneseToEnglish' ? word.japanese : word.english;
  const backContent = direction === 'japaneseToEnglish' ? word.english : word.japanese;
  const frontLabel = direction === 'japaneseToEnglish' ? 'Japanese' : 'English';
  const backLabel = direction === 'japaneseToEnglish' ? 'English' : 'Japanese';

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && onSwipeLeft) {
      onSwipeLeft();
    }
    if (isRightSwipe && onSwipeRight) {
      onSwipeRight();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="flashcard-container perspective-1000 w-full h-full min-h-[400px] cursor-pointer select-none"
      onClick={handleFlip}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`flashcard-inner relative w-full h-full transition-transform duration-600 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="flashcard-face flashcard-front absolute w-full h-full backface-hidden">
          <Card variant="elevated" padding="large" className="h-full flex flex-col items-center justify-center">
            <p className="text-xs text-text-tertiary mb-4 uppercase tracking-wide">{frontLabel}</p>
            <p className={`text-center ${
              direction === 'japaneseToEnglish'
                ? 'text-5xl md:text-6xl font-japanese'
                : 'text-3xl md:text-4xl'
            } text-text-primary mb-4`}>
              {frontContent}
            </p>
            {direction === 'japaneseToEnglish' && (
              <p className="text-xl text-text-secondary font-mono">{word.romanji}</p>
            )}
            <p className="text-xs text-text-tertiary mt-8">Click or tap to flip</p>
          </Card>
        </div>

        {/* Back of card */}
        <div className="flashcard-face flashcard-back absolute w-full h-full backface-hidden rotate-y-180">
          <Card variant="elevated" padding="large" className="h-full flex flex-col items-center justify-center bg-indigo bg-opacity-10">
            <p className="text-xs text-text-tertiary mb-4 uppercase tracking-wide">{backLabel}</p>
            <p className={`text-center ${
              direction === 'englishToJapanese'
                ? 'text-5xl md:text-6xl font-japanese'
                : 'text-3xl md:text-4xl'
            } text-text-primary mb-4`}>
              {backContent}
            </p>
            {direction === 'englishToJapanese' && (
              <p className="text-xl text-text-secondary font-mono">{word.romanji}</p>
            )}
            <p className="text-xs text-text-tertiary mt-8">Click or tap to flip back</p>
          </Card>
        </div>
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        .duration-600 {
          transition-duration: 600ms;
        }
      `}</style>
    </div>
  );
}
