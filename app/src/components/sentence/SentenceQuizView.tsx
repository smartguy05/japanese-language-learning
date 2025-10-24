import { useState, useMemo } from 'react';
import type { Word } from '../../types/word';
import { useProgress } from '../../contexts/ProgressContext';
import type { QuizOption } from '../../utils/quizGenerator';
import { generateQuizQuestion } from '../../utils/quizGenerator';
import { Card, Button, SpeakerButton } from '../common';
import { useSpeech } from '../../hooks/useSpeech';
import { Fireworks } from './Fireworks';

interface SentenceQuizViewProps {
  sentences: Word[];
  allSentences: Word[];
  onComplete: (score: { correct: number; total: number }) => void;
  onBackToStudy: () => void;
}

export function SentenceQuizView({
  sentences,
  allSentences,
  onComplete,
  onBackToStudy,
}: SentenceQuizViewProps) {
  const { incrementScore } = useProgress();
  const { speak, isSpeaking } = useSpeech();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  // Generate quiz questions for all sentences
  const quizQuestions = useMemo(() => {
    return sentences.map(sentence =>
      generateQuizQuestion(sentence, allSentences, 3)
    );
  }, [sentences, allSentences]);

  const currentQuestion = quizQuestions[currentIndex];

  const handleAnswerSelect = (optionIndex: number) => {
    if (showFeedback) return; // Prevent changing answer after selection

    setSelectedAnswer(optionIndex);
    setShowFeedback(true);

    const isCorrect = currentQuestion.options[optionIndex].correct;

    if (isCorrect) {
      setScore(prev => ({ ...prev, correct: prev.correct + 1 }));
      incrementScore('sentence', true);
      setShowFireworks(true);

      // Hide fireworks after animation
      setTimeout(() => setShowFireworks(false), 1500);
    } else {
      setScore(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      incrementScore('sentence', false);
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      onComplete({
        correct: score.correct + (currentQuestion.options[selectedAnswer!]?.correct ? 1 : 0),
        total: sentences.length,
      });
    }
  };

  const getOptionClassName = (option: QuizOption, index: number) => {
    if (!showFeedback) {
      return 'bg-bg-secondary dark:bg-bg-secondary-dark hover:bg-indigo hover:bg-opacity-10 border-2 border-transparent hover:border-indigo transition-all cursor-pointer';
    }

    if (option.correct) {
      return 'bg-success bg-opacity-20 border-2 border-success';
    }

    if (index === selectedAnswer && !option.correct) {
      return 'bg-error bg-opacity-20 border-2 border-error';
    }

    return 'bg-bg-secondary dark:bg-bg-secondary-dark border-2 border-transparent opacity-50';
  };

  const currentScore = score.correct + score.incorrect;
  const accuracy = currentScore > 0 ? Math.round((score.correct / currentScore) * 100) : 0;

  // If no questions available, show completion message
  if (!currentQuestion || quizQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="elevated" padding="large">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-text-primary mb-4">Quiz Complete!</h2>
            <p className="text-text-secondary mb-6">
              You've completed all available sentences. Great work!
            </p>
            <div className="mb-6">
              <p className="text-sm text-text-tertiary mb-1">Final Score</p>
              <p className="text-4xl font-bold text-text-primary">{accuracy}%</p>
            </div>
            <Button onClick={() => onComplete({ correct: score.correct, total: score.correct + score.incorrect })} variant="primary">
              View Results
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <>
      {showFireworks && <Fireworks />}

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Progress and score */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">
              Question {currentIndex + 1} of {sentences.length}
            </span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-success">
                ✓ {score.correct}
              </span>
              <span className="text-sm text-error">
                ✗ {score.incorrect}
              </span>
              <span className="text-sm text-text-primary font-semibold">
                {accuracy}% Accuracy
              </span>
              <Button onClick={onBackToStudy} variant="ghost" size="small">
                Back to Study
              </Button>
            </div>
          </div>
          <div className="w-full bg-bg-tertiary dark:bg-bg-tertiary-dark rounded-full h-2">
            <div
              className="bg-indigo h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / sentences.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Quiz card */}
        <Card variant="elevated" padding="large">
          {/* Japanese sentence */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <p className="text-sm text-text-tertiary">
                What does this sentence mean in English?
              </p>
              <SpeakerButton
                text={currentQuestion.sentence.japanese}
                onSpeak={speak}
                isSpeaking={isSpeaking}
                variant="ghost"
                size="small"
                ariaLabel={`Listen to ${currentQuestion.sentence.japanese}`}
              />
            </div>
            <p className="text-3xl md:text-4xl font-japanese text-text-primary mb-2">
              {currentQuestion.sentence.japanese}
            </p>
            <p className="text-lg text-text-secondary font-mono">
              {currentQuestion.sentence.romanji}
            </p>
          </div>

          {/* Answer options */}
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
                className={`w-full min-h-[60px] p-4 rounded-lg text-left transition-all ${getOptionClassName(
                  option,
                  index
                )}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-base md:text-lg text-text-primary">
                    {option.text}
                  </span>
                  {showFeedback && option.correct && (
                    <span className="text-success text-xl">✓</span>
                  )}
                  {showFeedback && index === selectedAnswer && !option.correct && (
                    <span className="text-error text-xl">✗</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Feedback message */}
          {showFeedback && (
            <div className="mb-6">
              {currentQuestion.options[selectedAnswer!]?.correct ? (
                <Card variant="default" padding="medium" className="bg-success bg-opacity-10">
                  <p className="text-success font-semibold text-center">
                    🎉 Correct! Excellent work!
                  </p>
                </Card>
              ) : (
                <Card variant="default" padding="medium" className="bg-error bg-opacity-10">
                  <p className="text-error font-semibold text-center mb-2">
                    Not quite right. The correct answer is:
                  </p>
                  <p className="text-text-primary text-center">
                    "{currentQuestion.options.find(o => o.correct)?.text}"
                  </p>
                </Card>
              )}
            </div>
          )}

          {/* Next button */}
          {showFeedback && (
            <Button
              onClick={handleNext}
              variant="primary"
              className="w-full"
            >
              {currentIndex === sentences.length - 1 ? 'See Results' : 'Next Question →'}
            </Button>
          )}

          {/* Instruction hint */}
          {!showFeedback && (
            <p className="text-xs text-text-tertiary text-center mt-6">
              Select your answer from the options above
            </p>
          )}
        </Card>
      </div>
    </>
  );
}
