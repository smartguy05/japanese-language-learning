import type { Word, ExportData } from '../types';

export function validateWord(word: unknown): word is Word {
  if (typeof word !== 'object' || word === null) {
    return false;
  }

  const w = word as Partial<Word>;

  return (
    typeof w.id === 'string' &&
    typeof w.japanese === 'string' &&
    w.japanese.length > 0 &&
    typeof w.romanji === 'string' &&
    w.romanji.length > 0 &&
    typeof w.english === 'string' &&
    w.english.length > 0 &&
    typeof w.day === 'number' &&
    w.day > 0 &&
    (w.type === 'word' || w.type === 'sentence') &&
    typeof w.mastered === 'boolean' &&
    typeof w.needsReview === 'boolean' &&
    typeof w.reviewCount === 'number' &&
    typeof w.correctCount === 'number' &&
    typeof w.incorrectCount === 'number' &&
    typeof w.lastReviewed === 'string' &&
    isValidDate(w.lastReviewed) &&
    typeof w.createdAt === 'string' &&
    isValidDate(w.createdAt)
  );
}

export function validateExportData(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) {
    return false;
  }

  const d = data as Partial<ExportData>;

  return (
    d.version === '1.0' &&
    typeof d.exportDate === 'string' &&
    isValidDate(d.exportDate) &&
    typeof d.data === 'object' &&
    d.data !== null &&
    Array.isArray(d.data.words) &&
    d.data.words.every(validateWord)
  );
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function sanitizeInput(input: string): string {
  return input.trim();
}

export function validateDayNumber(day: number): boolean {
  return Number.isInteger(day) && day > 0 && day < 1000;
}
