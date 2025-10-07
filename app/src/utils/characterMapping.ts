import { Word } from '../types/word';
import * as wanakana from 'wanakana';

export interface CharacterMap {
  japanese: string;
  romanji: string;
  revealed: boolean;
  index: number;
}

/**
 * Maps each Japanese character to its romanji equivalent for the alphabet mode reveal system
 * Uses WanaKana to intelligently map Japanese characters (including compounds like きょ)
 */
export function generateCharacterMap(word: Word): CharacterMap[] {
  const result: CharacterMap[] = [];
  const japanese = word.japanese;
  let charIndex = 0;

  // Process character by character, detecting compounds
  for (let i = 0; i < japanese.length; i++) {
    const char = japanese[i];

    // Handle spaces
    if (char === ' ' || char === '　') {
      result.push({
        japanese: ' ',
        romanji: ' ',
        revealed: true,
        index: charIndex++,
      });
      continue;
    }

    // Check if next character is a small kana (compound character)
    const nextChar = i < japanese.length - 1 ? japanese[i + 1] : null;
    const smallKana = ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ', 'っ', 'ッ'];
    const isNextSmallKana = nextChar && smallKana.includes(nextChar);

    // If next is small kana, combine them
    let japaneseChar = char;
    if (isNextSmallKana) {
      japaneseChar = char + nextChar;
      i++; // Skip next character
    }

    // Use WanaKana to convert to romanji
    const romanji = wanakana.toRomaji(japaneseChar);

    result.push({
      japanese: japaneseChar,
      romanji: romanji,
      revealed: false,
      index: charIndex++,
    });
  }

  return result;
}

/**
 * Reveals a character at the specified index
 */
export function revealCharacter(charMap: CharacterMap[], index: number): CharacterMap[] {
  return charMap.map((char, i) =>
    i === index ? { ...char, revealed: true } : char
  );
}

/**
 * Reveals all characters in the map
 */
export function revealAll(charMap: CharacterMap[]): CharacterMap[] {
  return charMap.map(char => ({ ...char, revealed: true }));
}

/**
 * Checks if all characters (except spaces) have been revealed
 */
export function areAllRevealed(charMap: CharacterMap[]): boolean {
  return charMap.filter(c => c.japanese !== ' ').every(c => c.revealed);
}
