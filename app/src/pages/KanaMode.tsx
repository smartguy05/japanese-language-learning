import { useState, useMemo } from 'react';
import { Card, Button } from '../components/common';
import { KanaStudyView } from '../components/kana/KanaStudyView';
import { Flashcard } from '../components/flashcard/Flashcard';
import { hiragana, katakana, type KanaCharacter } from '../utils/kanaData';
import type { Word } from '../types/word';

type View = 'selection' | 'study' | 'flashcard';
type KanaType = 'hiragana' | 'katakana' | 'both';
type Direction = 'kanaToRomanji' | 'romanjiToKana' | 'random';

export function KanaMode() {
  const [view, setView] = useState<View>('selection');
  const [studyKanaType, setStudyKanaType] = useState<KanaType>('hiragana');
  const [flashcardKanaType, setFlashcardKanaType] = useState<KanaType>('both');
  const [direction, setDirection] = useState<Direction>('kanaToRomanji');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get characters for study view
  const studyCharacters = useMemo(() => {
    if (studyKanaType === 'hiragana') {
      return hiragana;
    } else if (studyKanaType === 'katakana') {
      return katakana;
    } else {
      return [...hiragana, ...katakana];
    }
  }, [studyKanaType]);

  // Get characters for flashcard mode
  const flashcardCharacters = useMemo(() => {
    let chars: KanaCharacter[] = [];

    if (flashcardKanaType === 'hiragana') {
      chars = hiragana;
    } else if (flashcardKanaType === 'katakana') {
      chars = katakana;
    } else {
      chars = [...hiragana, ...katakana];
    }

    // Shuffle the characters for random practice
    return [...chars].sort(() => Math.random() - 0.5);
  }, [flashcardKanaType]);

  // Convert kana to Word format for flashcard component
  const flashcardWords: Word[] = useMemo(() => {
    return flashcardCharacters.map((char, index) => ({
      id: `kana-${index}`,
      japanese: char.kana,
      romanji: char.romanji,
      english: char.romanji, // Use romanji as "english" for kana
      day: 1,
      type: 'word' as const,
      mastered: false,
      needsReview: false,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      createdAt: new Date().toISOString(),
      lastReviewed: new Date().toISOString(),
      lastModified: Date.now(),
    }));
  }, [flashcardCharacters]);

  const currentFlashcard = flashcardWords[currentIndex];

  // Determine actual direction for current card
  const currentDirection = useMemo(() => {
    if (direction === 'random') {
      return Math.random() > 0.5 ? 'japaneseToEnglish' : 'englishToJapanese';
    }
    return direction === 'kanaToRomanji' ? 'japaneseToEnglish' : 'englishToJapanese';
  }, [direction, currentIndex]);

  const handleStartStudy = (type: KanaType) => {
    setStudyKanaType(type);
    setView('study');
  };

  const handleStartFlashcard = () => {
    setCurrentIndex(0);
    setView('flashcard');
  };

  const handleNext = () => {
    if (currentIndex < flashcardWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleBack = () => {
    setView('selection');
  };

  const getStudyTitle = () => {
    if (studyKanaType === 'hiragana') return 'Hiragana Characters';
    if (studyKanaType === 'katakana') return 'Katakana Characters';
    return 'All Kana Characters';
  };

  // Study view
  if (view === 'study') {
    return (
      <KanaStudyView
        characters={studyCharacters}
        title={getStudyTitle()}
        onBack={handleBack}
      />
    );
  }

  // Flashcard view
  if (view === 'flashcard' && currentFlashcard) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Progress and controls */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">
              Card {currentIndex + 1} of {flashcardWords.length}
            </span>
            <Button onClick={handleBack} variant="ghost" size="small">
              Back to Selection
            </Button>
          </div>
          <div className="w-full bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-full h-2">
            <div
              className="bg-indigo h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / flashcardWords.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="mb-6">
          <Flashcard
            word={currentFlashcard}
            direction={currentDirection}
            onSwipeLeft={handleNext}
            onSwipeRight={handlePrevious}
            hideRomanji={true}
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
            disabled={currentIndex === flashcardWords.length - 1}
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

  // Selection view (default)
  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Learn Kana Section */}
      <Card variant="elevated" padding="large">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Learn Kana</h2>
        <p className="text-text-secondary mb-6">
          View the complete hiragana or katakana alphabet with romanji pronunciation.
          Click the speaker button to hear each character.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button
            variant="primary"
            onClick={() => handleStartStudy('hiragana')}
            className="w-full py-6 text-lg"
          >
            <span className="text-2xl mr-2">あ</span>
            Hiragana ({hiragana.length} characters)
          </Button>
          <Button
            variant="primary"
            onClick={() => handleStartStudy('katakana')}
            className="w-full py-6 text-lg"
          >
            <span className="text-2xl mr-2">ア</span>
            Katakana ({katakana.length} characters)
          </Button>
        </div>
      </Card>

      {/* Study Mode Section */}
      <Card variant="elevated" padding="large">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Study Mode</h2>
        <p className="text-text-secondary mb-6">
          Practice kana recognition with flashcards. Test your knowledge by identifying
          characters or their romanji pronunciation.
        </p>

        {/* Kana Type Selection */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Select Kana
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant={flashcardKanaType === 'hiragana' ? 'primary' : 'secondary'}
                onClick={() => setFlashcardKanaType('hiragana')}
                className="w-full"
              >
                Hiragana
              </Button>
              <Button
                variant={flashcardKanaType === 'katakana' ? 'primary' : 'secondary'}
                onClick={() => setFlashcardKanaType('katakana')}
                className="w-full"
              >
                Katakana
              </Button>
              <Button
                variant={flashcardKanaType === 'both' ? 'primary' : 'secondary'}
                onClick={() => setFlashcardKanaType('both')}
                className="w-full"
              >
                Both
              </Button>
            </div>
          </div>

          {/* Direction Selection */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Study Direction
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant={direction === 'kanaToRomanji' ? 'primary' : 'secondary'}
                onClick={() => setDirection('kanaToRomanji')}
                className="w-full"
              >
                Kana → Romanji
              </Button>
              <Button
                variant={direction === 'romanjiToKana' ? 'primary' : 'secondary'}
                onClick={() => setDirection('romanjiToKana')}
                className="w-full"
              >
                Romanji → Kana
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

        {/* Character count and start button */}
        <Card variant="default" padding="medium">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-tertiary">Cards Available</p>
              <p className="text-3xl font-bold text-text-primary">{flashcardCharacters.length}</p>
            </div>
            <Button onClick={handleStartFlashcard} variant="primary" size="large">
              Start Studying
            </Button>
          </div>
        </Card>
      </Card>
    </div>
  );
}
