import type { KanaCharacter } from '../../utils/kanaData';
import { Card, Button, SpeakerButton } from '../common';
import { useSpeech } from '../../hooks/useSpeech';

interface KanaStudyViewProps {
  characters: KanaCharacter[];
  title: string;
  onBack: () => void;
}

export function KanaStudyView({ characters, title, onBack }: KanaStudyViewProps) {
  const { speak, isSpeaking } = useSpeech();

  if (characters.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <Card variant="default" padding="large">
          <h2 className="text-xl font-semibold text-text-primary mb-4">No Characters Found</h2>
          <p className="text-text-secondary mb-6">
            There are no characters available to display.
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
          <h2 className="text-2xl font-bold text-text-primary">{title}</h2>
          <Button onClick={onBack} variant="secondary">
            Back
          </Button>
        </div>

        <p className="text-text-secondary mb-6">
          Review all {characters.length} {title.toLowerCase()} characters with their romanji pronunciation.
          Click the speaker button to hear each character pronounced.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {characters.map((char, index) => (
            <Card
              key={`${char.kana}-${index}`}
              variant="elevated"
              padding="medium"
              className="hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center gap-2">
                <SpeakerButton
                  text={char.kana}
                  onSpeak={speak}
                  isSpeaking={isSpeaking}
                  variant="ghost"
                  size="small"
                  className="self-end"
                />

                <div className="text-center">
                  <p className="text-4xl font-japanese text-text-primary mb-2">{char.kana}</p>
                  <p className="text-lg text-text-secondary font-mono">{char.romanji}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-6">
          <Button onClick={onBack} variant="secondary" className="w-full md:w-auto">
            Back to Kana Page
          </Button>
        </div>
      </Card>
    </div>
  );
}
