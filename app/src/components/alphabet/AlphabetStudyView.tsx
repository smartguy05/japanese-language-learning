import { Word } from '../../types/word';
import { Card, Button, SpeakerButton } from '../common';
import { useSpeech } from '../../hooks/useSpeech';

interface AlphabetStudyViewProps {
  words: Word[];
  onStartQuiz: () => void;
  onBack: () => void;
}

export function AlphabetStudyView({ words, onStartQuiz, onBack }: AlphabetStudyViewProps) {
  const { speak, isSpeaking } = useSpeech();

  if (words.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="default" padding="large">
          <h2 className="text-xl font-semibold text-text-primary mb-4">No Words Found</h2>
          <p className="text-text-secondary mb-6">
            There are no words available for the selected criteria. Try selecting a different day or add some words first.
          </p>
          <Button onClick={onBack} variant="secondary">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <Card variant="default" padding="large" className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-text-primary">Study - Alphabet Mode</h2>
          <Button onClick={onStartQuiz} variant="primary">
            Start Quiz
          </Button>
        </div>

        <p className="text-text-secondary mb-6">
          Review these {words.length} word{words.length !== 1 ? 's' : ''} before starting the quiz.
          In the quiz, you'll click on Japanese characters to reveal their romanji.
        </p>

        <div className="space-y-4">
          {words.map((word) => (
            <Card
              key={word.id}
              variant="elevated"
              padding="medium"
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <SpeakerButton
                  text={word.japanese}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  variant="ghost"
                  size="small"
                  className="mt-1"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Japanese</p>
                    <p className="text-2xl font-japanese text-text-primary">{word.japanese}</p>
                  </div>

                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Romanji</p>
                    <p className="text-lg text-text-secondary font-mono">{word.romanji}</p>
                  </div>

                  <div>
                    <p className="text-xs text-text-tertiary mb-1">English</p>
                    <p className="text-lg text-text-primary">{word.english}</p>
                  </div>
                </div>
              </div>

              {word.mastered && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <span className="text-xs text-success">✓ Mastered</span>
                </div>
              )}
              {word.needsReview && (
                <div className="mt-3 pt-3 border-t border-border-subtle">
                  <span className="text-xs text-warning">⚠ Needs Review</span>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-6 flex gap-4">
          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
          <Button onClick={onStartQuiz} variant="primary" className="flex-1">
            Start Quiz ({words.length} words)
          </Button>
        </div>
      </Card>
    </div>
  );
}
