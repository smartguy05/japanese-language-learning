import { nanoid } from 'nanoid';
import type { Word } from '../types';

export function generateSeedData(): Word[] {
  const now = new Date().toISOString();

  const seedWords: Omit<Word, 'id' | 'createdAt' | 'lastReviewed' | 'mastered' | 'needsReview' | 'reviewCount' | 'correctCount' | 'incorrectCount'>[] = [
    // Day 1 - Basic Greetings (Words)
    { japanese: 'こんにちは', romanji: 'konnichiwa', english: 'Hello', day: 1, type: 'word' },
    { japanese: 'ありがとう', romanji: 'arigatou', english: 'Thank you', day: 1, type: 'word' },
    { japanese: 'さようなら', romanji: 'sayounara', english: 'Goodbye', day: 1, type: 'word' },
    { japanese: 'おはよう', romanji: 'ohayou', english: 'Good morning', day: 1, type: 'word' },
    { japanese: 'すみません', romanji: 'sumimasen', english: 'Excuse me', day: 1, type: 'word' },

    // Day 1 - Basic Sentences
    { japanese: 'はじめまして', romanji: 'hajimemashite', english: 'Nice to meet you', day: 1, type: 'sentence' },
    { japanese: 'げんきですか', romanji: 'genki desu ka', english: 'How are you?', day: 1, type: 'sentence' },
    { japanese: 'わたしはがくせいです', romanji: 'watashi wa gakusei desu', english: 'I am a student', day: 1, type: 'sentence' },

    // Day 2 - Numbers & Time
    { japanese: 'いち', romanji: 'ichi', english: 'One', day: 2, type: 'word' },
    { japanese: 'に', romanji: 'ni', english: 'Two', day: 2, type: 'word' },
    { japanese: 'さん', romanji: 'san', english: 'Three', day: 2, type: 'word' },
    { japanese: 'いま', romanji: 'ima', english: 'Now', day: 2, type: 'word' },
    { japanese: 'きょう', romanji: 'kyou', english: 'Today', day: 2, type: 'word' },

    // Day 2 - Sentences
    { japanese: 'いまなんじですか', romanji: 'ima nanji desu ka', english: 'What time is it now?', day: 2, type: 'sentence' },
    { japanese: 'きょうはげつようびです', romanji: 'kyou wa getsuyoubi desu', english: 'Today is Monday', day: 2, type: 'sentence' },

    // Day 3 - Food & Dining
    { japanese: 'たべる', romanji: 'taberu', english: 'To eat', day: 3, type: 'word' },
    { japanese: 'のむ', romanji: 'nomu', english: 'To drink', day: 3, type: 'word' },
    { japanese: 'みず', romanji: 'mizu', english: 'Water', day: 3, type: 'word' },
    { japanese: 'おいしい', romanji: 'oishii', english: 'Delicious', day: 3, type: 'word' },

    // Day 3 - Sentences
    { japanese: 'これをください', romanji: 'kore wo kudasai', english: 'Please give me this', day: 3, type: 'sentence' },
    { japanese: 'とてもおいしいです', romanji: 'totemo oishii desu', english: 'It is very delicious', day: 3, type: 'sentence' },

    // Day 4 - Directions & Places
    { japanese: 'みぎ', romanji: 'migi', english: 'Right', day: 4, type: 'word' },
    { japanese: 'ひだり', romanji: 'hidari', english: 'Left', day: 4, type: 'word' },
    { japanese: 'まっすぐ', romanji: 'massugu', english: 'Straight', day: 4, type: 'word' },

    // Day 4 - Sentences
    { japanese: 'えきはどこですか', romanji: 'eki wa doko desu ka', english: 'Where is the station?', day: 4, type: 'sentence' },
    { japanese: 'みぎにまがってください', romanji: 'migi ni magatte kudasai', english: 'Please turn right', day: 4, type: 'sentence' },
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
