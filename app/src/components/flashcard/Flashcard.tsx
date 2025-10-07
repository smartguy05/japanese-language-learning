import { useState, useEffect } from 'react';
import { Word } from '../../types/word';
import { Card, SpeakerButton } from '../common';
import { useSpeech } from '../../hooks/useSpeech';

interface FlashcardProps {
  word: Word;
  direction: 'japaneseToEnglish' | 'englishToJapanese';
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function Flashcard({ word, direction, onSwipeLeft, onSwipeRight }: FlashcardProps) {
  const { speak, isSpeaking } = useSpeech();
  const [isFlipped, setIsFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [displayWord, setDisplayWord] = useState(word);

  // Reset flip state and update word with proper timing
  useEffect(() => {
    if (isFlipped) {
      // If card is flipped, flip it back first
      setIsFlipped(false);
      // Wait for flip animation to complete before updating word
      const timer = setTimeout(() => {
        setDisplayWord(word);
      }, 600); // Match the flip animation duration
      return () => clearTimeout(timer);
    } else {
      // If card is not flipped, update immediately
      setDisplayWord(word);
    }
  }, [word.id]);

  const frontContent = direction === 'japaneseToEnglish' ? displayWord.japanese : displayWord.english;
  const backContent = direction === 'japaneseToEnglish' ? displayWord.english : displayWord.japanese;
  const frontLabel = direction === 'japaneseToEnglish' ? 'Japanese' : 'English';
  const backLabel = direction === 'japaneseToEnglish' ? 'English' : 'Japanese';

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleSpeakerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip when clicking speaker
    speak(displayWord.japanese);
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
      className="flashcard-container perspective-1000 w-full min-h-[500px] md:min-h-[600px] cursor-pointer select-none"
      onClick={handleFlip}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className={`flashcard-inner relative w-full min-h-[500px] md:min-h-[600px] transition-transform duration-600 preserve-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="flashcard-face flashcard-front absolute w-full min-h-[500px] md:min-h-[600px] backface-hidden">
          <Card variant="elevated" padding="large" className="h-full min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center relative">
            {direction === 'japaneseToEnglish' && (
              <div className="absolute top-4 right-4" onClick={handleSpeakerClick}>
                <SpeakerButton
                  text={displayWord.japanese}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  variant="ghost"
                  size="small"
                />
              </div>
            )}
            <p className="text-xs text-text-tertiary mb-4 uppercase tracking-wide">{frontLabel}</p>
            <p className={`text-center ${
              direction === 'japaneseToEnglish'
                ? 'text-5xl md:text-6xl font-japanese'
                : 'text-3xl md:text-4xl'
            } text-text-primary mb-4`}>
              {frontContent}
            </p>
            {direction === 'japaneseToEnglish' && (
              <p className="text-xl text-text-secondary font-mono">{displayWord.romanji}</p>
            )}
            <p className="text-xs text-text-tertiary mt-8">Click or tap to flip</p>
          </Card>
        </div>

        {/* Back of card */}
        <div className="flashcard-face flashcard-back absolute w-full min-h-[500px] md:min-h-[600px] backface-hidden rotate-y-180">
          <Card variant="elevated" padding="large" className="h-full min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center bg-indigo bg-opacity-10 relative">
            {direction === 'englishToJapanese' && (
              <div className="absolute top-4 right-4" onClick={handleSpeakerClick}>
                <SpeakerButton
                  text={displayWord.japanese}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  variant="ghost"
                  size="small"
                />
              </div>
            )}
            <p className="text-xs text-text-tertiary mb-4 uppercase tracking-wide">{backLabel}</p>
            <p className={`text-center ${
              direction === 'englishToJapanese'
                ? 'text-5xl md:text-6xl font-japanese'
                : 'text-3xl md:text-4xl'
            } text-text-primary mb-4`}>
              {backContent}
            </p>
            {direction === 'englishToJapanese' && (
              <p className="text-xl text-text-secondary font-mono">{displayWord.romanji}</p>
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
