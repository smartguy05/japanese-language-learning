import { useState } from 'react';
import { Word } from '../../types/word';
import { Button, Input, Select, Card } from '../common';

interface WordFormProps {
  word?: Word;
  onSubmit: (wordData: Omit<Word, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function WordForm({ word, onSubmit, onCancel }: WordFormProps) {
  const [formData, setFormData] = useState({
    japanese: word?.japanese || '',
    romanji: word?.romanji || '',
    english: word?.english || '',
    day: word?.day || 1,
    type: word?.type || 'word' as 'word' | 'sentence',
    mastered: word?.mastered || false,
    needsReview: word?.needsReview || false,
    reviewCount: word?.reviewCount || 0,
    correctCount: word?.correctCount || 0,
    incorrectCount: word?.incorrectCount || 0,
    lastReviewed: word?.lastReviewed || new Date().toISOString(),
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.japanese.trim()) {
      newErrors.japanese = 'Japanese text is required';
    }
    if (!formData.romanji.trim()) {
      newErrors.romanji = 'Romanji is required';
    }
    if (!formData.english.trim()) {
      newErrors.english = 'English translation is required';
    }
    if (formData.day < 1) {
      newErrors.day = 'Day must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <Card variant="elevated" padding="large">
      <h2 className="text-xl font-bold text-text-primary mb-6">
        {word ? 'Edit' : 'Add'} {formData.type === 'word' ? 'Word' : 'Sentence'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selection */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">Type</label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={formData.type === 'word' ? 'primary' : 'secondary'}
              onClick={() => setFormData({ ...formData, type: 'word' })}
              className="flex-1"
            >
              Word
            </Button>
            <Button
              type="button"
              variant={formData.type === 'sentence' ? 'primary' : 'secondary'}
              onClick={() => setFormData({ ...formData, type: 'sentence' })}
              className="flex-1"
            >
              Sentence
            </Button>
          </div>
        </div>

        {/* Japanese input */}
        <Input
          label="Japanese"
          value={formData.japanese}
          onChange={(e) => setFormData({ ...formData, japanese: e.target.value })}
          error={errors.japanese}
          placeholder={formData.type === 'word' ? 'こんにちは' : '今日はいい天気ですね'}
          className="font-japanese text-xl"
        />

        {/* Romanji input */}
        <Input
          label="Romanji"
          value={formData.romanji}
          onChange={(e) => setFormData({ ...formData, romanji: e.target.value })}
          error={errors.romanji}
          placeholder={formData.type === 'word' ? 'konnichiwa' : 'kyou wa ii tenki desu ne'}
          className="font-mono"
        />

        {/* English input */}
        <Input
          label="English Translation"
          value={formData.english}
          onChange={(e) => setFormData({ ...formData, english: e.target.value })}
          error={errors.english}
          placeholder={formData.type === 'word' ? 'hello' : "It's nice weather today"}
        />

        {/* Day input */}
        <div>
          <label htmlFor="day-input" className="block text-sm font-medium text-text-primary mb-2">
            Day
          </label>
          <input
            id="day-input"
            type="number"
            min="1"
            value={formData.day}
            onChange={(e) => setFormData({ ...formData, day: parseInt(e.target.value) || 1 })}
            className="w-full px-4 py-2 min-h-[48px] rounded-lg bg-bg-tertiary dark:bg-bg-tertiary-dark text-text-primary border border-border-medium focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent transition-colors"
          />
          {errors.day && <p className="mt-1 text-sm text-error">{errors.day}</p>}
        </div>

        {/* Flags */}
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.mastered}
              onChange={(e) => setFormData({ ...formData, mastered: e.target.checked })}
              className="w-5 h-5 rounded border-border-medium text-indigo focus:ring-indigo"
            />
            <span className="text-sm text-text-primary">Mastered</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.needsReview}
              onChange={(e) => setFormData({ ...formData, needsReview: e.target.checked })}
              className="w-5 h-5 rounded border-border-medium text-warning focus:ring-warning"
            />
            <span className="text-sm text-text-primary">Needs Review</span>
          </label>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={onCancel} variant="secondary" className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {word ? 'Save Changes' : 'Add'} {formData.type === 'word' ? 'Word' : 'Sentence'}
          </Button>
        </div>
      </form>
    </Card>
  );
}
