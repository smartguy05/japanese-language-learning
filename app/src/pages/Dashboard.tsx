import { Link } from 'react-router-dom';
import { useWords } from '../contexts/WordContext';
import { useProgress } from '../contexts/ProgressContext';
import { Card } from '../components/common';

export function Dashboard() {
  const { words } = useWords();
  const { progress, getAccuracyRate } = useProgress();

  const totalWords = words.filter(w => w.type === 'word').length;
  const totalSentences = words.filter(w => w.type === 'sentence').length;
  const wordsNeedingReview = words.filter(w => w.needsReview).length;
  const accuracyRate = getAccuracyRate('sentence');

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-8 japanese-text">
        Japanese Learning
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card variant="elevated" padding="medium">
          <div className="text-center">
            <p className="text-3xl font-bold text-indigo">{totalWords}</p>
            <p className="text-sm text-text-secondary mt-1">Words</p>
          </div>
        </Card>
        <Card variant="elevated" padding="medium">
          <div className="text-center">
            <p className="text-3xl font-bold text-sakura">{totalSentences}</p>
            <p className="text-sm text-text-secondary mt-1">Sentences</p>
          </div>
        </Card>
        <Card variant="elevated" padding="medium">
          <div className="text-center">
            <p className="text-3xl font-bold text-gold">{accuracyRate}%</p>
            <p className="text-sm text-text-secondary mt-1">Accuracy</p>
          </div>
        </Card>
        <Card variant="elevated" padding="medium">
          <div className="text-center">
            <p className="text-3xl font-bold text-matcha">{wordsNeedingReview}</p>
            <p className="text-sm text-text-secondary mt-1">Need Review</p>
          </div>
        </Card>
      </div>

      {/* Current Day */}
      <Card variant="default" padding="large" className="mb-8">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Current Day</h2>
        <p className="text-4xl font-bold text-indigo mb-2">Day {progress.currentDay}</p>
        <p className="text-text-secondary">
          Continue your learning journey
        </p>
      </Card>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Link to="/alphabet">
          <Card variant="elevated" padding="large" className="hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Alphabet Mode</h3>
            <p className="text-text-secondary text-sm">Learn characters with romanji reveal</p>
          </Card>
        </Link>
        <Link to="/sentence">
          <Card variant="elevated" padding="large" className="hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Sentence Mode</h3>
            <p className="text-text-secondary text-sm">Multiple-choice comprehension quiz</p>
          </Card>
        </Link>
        <Link to="/flashcard">
          <Card variant="elevated" padding="large" className="hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-lg font-semibold text-text-primary mb-2">Flashcard Mode</h3>
            <p className="text-text-secondary text-sm">Traditional flashcard review</p>
          </Card>
        </Link>
      </div>

      {/* Manage Words Link */}
      <div className="mt-8 text-center">
        <Link to="/manage" className="text-indigo hover:underline">
          Manage Words & Sentences →
        </Link>
      </div>
    </div>
  );
}
