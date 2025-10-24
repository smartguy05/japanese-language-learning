import { nanoid } from 'nanoid';
import type { Word } from '../types';

export function generateSeedData(): Word[] {
  const now = new Date().toISOString();

  const seedWords: Omit<Word, 'id' | 'createdAt' | 'lastReviewed' | 'mastered' | 'needsReview' | 'reviewCount' | 'correctCount' | 'incorrectCount'>[] = [
    // Greetings
    { japanese: 'こんにちは', romanji: 'konnichiwa', english: 'Hello', category: 'Greetings', type: 'word' },
    { japanese: 'ありがとう', romanji: 'arigatou', english: 'Thank you', category: 'Greetings', type: 'word' },
    { japanese: 'さようなら', romanji: 'sayounara', english: 'Goodbye', category: 'Greetings', type: 'word' },
    { japanese: 'おはよう', romanji: 'ohayou', english: 'Good morning', category: 'Greetings', type: 'word' },
    { japanese: 'すみません', romanji: 'sumimasen', english: 'Excuse me', category: 'Greetings', type: 'word' },
    { japanese: 'はじめまして', romanji: 'hajimemashite', english: 'Nice to meet you', category: 'Greetings', type: 'sentence' },
    { japanese: 'げんきですか', romanji: 'genki desu ka', english: 'How are you?', category: 'Greetings', type: 'sentence' },
    { japanese: 'わたしはがくせいです', romanji: 'watashi wa gakusei desu', english: 'I am a student', category: 'Greetings', type: 'sentence' },

    // Numbers & Time
    { japanese: 'いち', romanji: 'ichi', english: 'One', category: 'Numbers & Time', type: 'word' },
    { japanese: 'に', romanji: 'ni', english: 'Two', category: 'Numbers & Time', type: 'word' },
    { japanese: 'さん', romanji: 'san', english: 'Three', category: 'Numbers & Time', type: 'word' },
    { japanese: 'いま', romanji: 'ima', english: 'Now', category: 'Numbers & Time', type: 'word' },
    { japanese: 'きょう', romanji: 'kyou', english: 'Today', category: 'Numbers & Time', type: 'word' },
    { japanese: 'いまなんじですか', romanji: 'ima nanji desu ka', english: 'What time is it now?', category: 'Numbers & Time', type: 'sentence' },
    { japanese: 'きょうはげつようびです', romanji: 'kyou wa getsuyoubi desu', english: 'Today is Monday', category: 'Numbers & Time', type: 'sentence' },

    // Food & Dining
    { japanese: 'たべる', romanji: 'taberu', english: 'To eat', category: 'Food & Dining', type: 'word' },
    { japanese: 'のむ', romanji: 'nomu', english: 'To drink', category: 'Food & Dining', type: 'word' },
    { japanese: 'みず', romanji: 'mizu', english: 'Water', category: 'Food & Dining', type: 'word' },
    { japanese: 'おいしい', romanji: 'oishii', english: 'Delicious', category: 'Food & Dining', type: 'word' },
    { japanese: 'これをください', romanji: 'kore wo kudasai', english: 'Please give me this', category: 'Food & Dining', type: 'sentence' },
    { japanese: 'とてもおいしいです', romanji: 'totemo oishii desu', english: 'It is very delicious', category: 'Food & Dining', type: 'sentence' },

    // Directions & Places
    { japanese: 'みぎ', romanji: 'migi', english: 'Right', category: 'Directions & Places', type: 'word' },
    { japanese: 'ひだり', romanji: 'hidari', english: 'Left', category: 'Directions & Places', type: 'word' },
    { japanese: 'まっすぐ', romanji: 'massugu', english: 'Straight', category: 'Directions & Places', type: 'word' },
    { japanese: 'えきはどこですか', romanji: 'eki wa doko desu ka', english: 'Where is the station?', category: 'Directions & Places', type: 'sentence' },
    { japanese: 'みぎにまがってください', romanji: 'migi ni magatte kudasai', english: 'Please turn right', category: 'Directions & Places', type: 'sentence' },
  ];

  return seedWords.map(word => ({
    ...word,
    id: nanoid(),
    createdAt: now,
    lastReviewed: now,
    mastered: false,
    needsReview: false,
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
  }));
}
