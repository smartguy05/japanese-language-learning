import { Word } from '../../types/word';
import { Card, Button, SpeakerButton } from '../common';
import { useSpeech } from '../../hooks/useSpeech';

interface SentenceStudyViewProps {
  sentences: Word[];
  onStartQuiz: () => void;
  onBack: () => void;
}

export function SentenceStudyView({ sentences, onStartQuiz, onBack }: SentenceStudyViewProps) {
  const { speak, isSpeaking } = useSpeech();

  if (sentences.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="default" padding="large">
          <h2 className="text-xl font-semibold text-text-primary mb-4">No Sentences Found</h2>
          <p className="text-text-secondary mb-6">
            There are no sentences available for the selected criteria. Try selecting a different day or add some sentences first.
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
          <h2 className="text-2xl font-bold text-text-primary">Study - Sentence Mode</h2>
          <Button onClick={onStartQuiz} variant="primary">
            Start Quiz
          </Button>
        </div>

        <p className="text-text-secondary mb-6">
          Review these {sentences.length} sentence{sentences.length !== 1 ? 's' : ''} before starting the quiz.
          In the quiz, you'll choose the correct English translation for each Japanese sentence.
        </p>

        <div className="space-y-4">
          {sentences.map((sentence) => (
            <Card
              key={sentence.id}
              variant="elevated"
              padding="medium"
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start gap-3">
                <SpeakerButton
                  text={sentence.japanese}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  variant="ghost"
                  size="small"
                  className="mt-1"
                />

                <div className="space-y-3 flex-1">
                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Japanese</p>
                    <p className="text-2xl md:text-3xl font-japanese text-text-primary">
                      {sentence.japanese}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-tertiary mb-1">Romanji</p>
                    <p className="text-base md:text-lg text-text-secondary font-mono">
                      {sentence.romanji}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-text-tertiary mb-1">English</p>
                    <p className="text-base md:text-lg text-text-primary">
                      {sentence.english}
                    </p>
                  </div>
                </div>
              </div>

              {(sentence.mastered || sentence.needsReview) && (
                <div className="mt-3 pt-3 border-t border-border-subtle flex gap-3">
                  {sentence.mastered && (
                    <span className="text-xs text-success">✓ Mastered</span>
                  )}
                  {sentence.needsReview && (
                    <span className="text-xs text-warning">⚠ Needs Review</span>
                  )}
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
            Start Quiz ({sentences.length} sentences)
          </Button>
        </div>
      </Card>
    </div>
  );
}
