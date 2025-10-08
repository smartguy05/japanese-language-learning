import type { Word } from '../types/word';

export interface QuizOption {
  text: string;
  correct: boolean;
}

export interface QuizQuestion {
  sentence: Word;
  options: QuizOption[];
}

/**
 * Generates quiz options for a sentence, including the correct answer and distractors
 */
export function generateQuizQuestion(
  targetSentence: Word,
  allSentences: Word[],
  distractorCount: number = 3
): QuizQuestion {
  const distractors = generateDistractors(targetSentence, allSentences, distractorCount);

  // Create options array with correct answer and distractors
  const options: QuizOption[] = [
    { text: targetSentence.english, correct: true },
    ...distractors.map(d => ({ text: d, correct: false })),
  ];

  // Shuffle options so correct answer isn't always first
  const shuffledOptions = shuffleArray(options);

  return {
    sentence: targetSentence,
    options: shuffledOptions,
  };
}

/**
 * Generates plausible distractor answers based on similar sentences
 */
function generateDistractors(
  correctSentence: Word,
  allSentences: Word[],
  count: number
): string[] {
  const distractors: string[] = [];
  const correctAnswer = correctSentence.english;
  const correctLength = correctAnswer.length;

  // Filter out the correct sentence and already selected distractors
  const candidates = allSentences
    .filter(s => s.id !== correctSentence.id && s.type === 'sentence')
    .map(s => ({
      ...s,
      // Score based on similarity
      score: calculateSimilarityScore(correctAnswer, s.english, correctLength),
    }))
    .sort((a, b) => b.score - a.score); // Sort by similarity (higher is more similar)

  // Select top candidates as distractors
  for (let i = 0; i < Math.min(count, candidates.length); i++) {
    distractors.push(candidates[i].english);
  }

  // If we don't have enough distractors, generate fallback ones
  while (distractors.length < count) {
    distractors.push(generateFallbackDistractor(correctAnswer, distractors.length + 1));
  }

  return distractors;
}

/**
 * Calculates similarity score between two sentences
 * Higher score means more similar (better distractor)
 */
function calculateSimilarityScore(correct: string, candidate: string, correctLength: number): number {
  let score = 0;

  // Length similarity (prefer similar length, ±20%)
  const lengthDiff = Math.abs(candidate.length - correctLength);
  const lengthRatio = lengthDiff / correctLength;
  if (lengthRatio <= 0.2) {
    score += 30;
  } else if (lengthRatio <= 0.4) {
    score += 15;
  }

  // Word overlap (common words)
  const correctWords = new Set(correct.toLowerCase().split(/\s+/));
  const candidateWords = candidate.toLowerCase().split(/\s+/);
  const overlapCount = candidateWords.filter(w => correctWords.has(w)).length;
  score += overlapCount * 10;

  // Starting word similarity
  const correctFirstWord = correct.split(/\s+/)[0]?.toLowerCase();
  const candidateFirstWord = candidate.split(/\s+/)[0]?.toLowerCase();
  if (correctFirstWord === candidateFirstWord) {
    score += 20;
  }

  // Randomize slightly to avoid always getting the same distractors
  score += Math.random() * 5;

  return score;
}

/**
 * Generates a fallback distractor when not enough real sentences available
 */
function generateFallbackDistractor(_correctAnswer: string, index: number): string {
  const fallbackPhrases = [
    'This is a placeholder answer.',
    'Another option to consider.',
    'A different translation entirely.',
    'Not the correct meaning.',
  ];

  return fallbackPhrases[index % fallbackPhrases.length];
}

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Gets a random selection of sentences for a quiz
 */
export function getRandomQuizSentences(sentences: Word[], count: number): Word[] {
  const shuffled = shuffleArray(sentences);
  return shuffled.slice(0, Math.min(count, sentences.length));
}
