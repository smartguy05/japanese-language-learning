import type { Word } from '../../types/word';
import { Button, Card } from '../common';

interface WordListItemProps {
  word: Word;
  onEdit: (word: Word) => void;
  onDelete: (word: Word) => void;
}

export function WordListItem({ word, onEdit, onDelete }: WordListItemProps) {
  return (
    <Card variant="default" padding="medium" className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Japanese text */}
          <div className="mb-2">
            <p className="text-2xl font-japanese text-text-primary break-words">
              {word.japanese}
            </p>
          </div>

          {/* Romanji and English */}
          <div className="space-y-1">
            <p className="text-sm text-text-secondary font-mono">
              {word.romanji}
            </p>
            <p className="text-base text-text-primary">
              {word.english}
            </p>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="px-2 py-1 text-xs rounded-full bg-indigo bg-opacity-20 text-indigo">
              Day {word.day}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              word.type === 'word'
                ? 'bg-matcha bg-opacity-20 text-matcha'
                : 'bg-sakura bg-opacity-20 text-sakura'
            }`}>
              {word.type === 'word' ? 'Word' : 'Sentence'}
            </span>
            {word.mastered && (
              <span className="px-2 py-1 text-xs rounded-full bg-success bg-opacity-20 text-success">
                ✓ Mastered
              </span>
            )}
            {word.needsReview && (
              <span className="px-2 py-1 text-xs rounded-full bg-warning bg-opacity-20 text-warning">
                ⚠ Needs Review
              </span>
            )}
          </div>

          {/* Stats */}
          {word.reviewCount > 0 && (
            <div className="flex gap-4 mt-2 text-xs text-text-tertiary">
              <span>Reviews: {word.reviewCount}</span>
              <span className="text-success">Correct: {word.correctCount}</span>
              <span className="text-error">Incorrect: {word.incorrectCount}</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <Button
            onClick={() => onEdit(word)}
            variant="secondary"
            size="small"
            className="min-w-[80px]"
          >
            Edit
          </Button>
          <Button
            onClick={() => onDelete(word)}
            variant="ghost"
            size="small"
            className="text-error hover:bg-error hover:bg-opacity-10 min-w-[80px]"
          >
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
