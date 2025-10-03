import { Word } from '../types/word';

export interface CharacterMap {
  japanese: string;
  romanji: string;
  revealed: boolean;
  index: number;
}

/**
 * Maps each Japanese character to its romanji equivalent for the alphabet mode reveal system
 */
export function generateCharacterMap(word: Word): CharacterMap[] {
  const japaneseChars = Array.from(word.japanese);
  const romanjiParts = word.romanji.split(' ');

  // Handle case where romanji might not have spaces (single word)
  if (romanjiParts.length === 1 && japaneseChars.length > 1) {
    // Try to split romanji by character boundaries
    return splitRomanjiByCharacter(japaneseChars, word.romanji);
  }

  // If we have multiple words, split by spaces
  if (romanjiParts.length > 1) {
    return mapMultipleWords(japaneseChars, romanjiParts, word.japanese);
  }

  // Single character or simple word
  return japaneseChars.map((char, index) => ({
    japanese: char,
    romanji: word.romanji,
    revealed: false,
    index,
  }));
}

/**
 * Splits romanji by character for continuous romanji strings
 * Uses common patterns for hiragana/katakana romanization
 */
function splitRomanjiByCharacter(japaneseChars: string[], romanji: string): CharacterMap[] {
  const result: CharacterMap[] = [];
  let romanjiIndex = 0;

  japaneseChars.forEach((char, index) => {
    // Detect compound characters (digraphs like きゃ, しょ, etc.)
    const isSmallKana = ['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ', 'ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ'].includes(char);

    if (isSmallKana && result.length > 0) {
      // Combine with previous character
      const prevChar = result[result.length - 1];
      const combinedRomanji = extractNextRomanjiPart(romanji, romanjiIndex, true);
      result[result.length - 1] = {
        ...prevChar,
        japanese: prevChar.japanese + char,
        romanji: combinedRomanji,
      };
      romanjiIndex += combinedRomanji.length;
    } else {
      // Regular character
      const romanjiPart = extractNextRomanjiPart(romanji, romanjiIndex, false);
      result.push({
        japanese: char,
        romanji: romanjiPart,
        revealed: false,
        index,
      });
      romanjiIndex += romanjiPart.length;
    }
  });

  return result;
}

/**
 * Extracts the next romanji segment from the romanji string
 */
function extractNextRomanjiPart(romanji: string, startIndex: number, isCompound: boolean): string {
  if (startIndex >= romanji.length) return '';

  // Common romanji patterns
  const remaining = romanji.substring(startIndex);

  // Two-character romanji (chi, shi, tsu, etc.)
  const twoCharPatterns = /^(ch|sh|ts|ky|gy|ny|hy|by|py|my|ry)/i;
  const twoCharMatch = remaining.match(twoCharPatterns);
  if (twoCharMatch) {
    // For compounds, might need an additional vowel
    if (isCompound && remaining.length > 2) {
      const vowel = remaining[2];
      if (['a', 'i', 'u', 'e', 'o'].includes(vowel.toLowerCase())) {
        return twoCharMatch[0] + vowel;
      }
    }
    return twoCharMatch[0];
  }

  // Single consonant + vowel (ka, ki, ku, etc.)
  const singleCharWithVowel = /^[a-z][aeiou]/i;
  const singleMatch = remaining.match(singleCharWithVowel);
  if (singleMatch) {
    return singleMatch[0];
  }

  // Single vowel
  if (['a', 'i', 'u', 'e', 'o'].includes(remaining[0].toLowerCase())) {
    return remaining[0];
  }

  // Single consonant 'n'
  if (remaining[0].toLowerCase() === 'n') {
    return 'n';
  }

  // Fallback to single character
  return remaining[0];
}

/**
 * Maps multiple Japanese words to their romanji equivalents
 */
function mapMultipleWords(
  japaneseChars: string[],
  romanjiParts: string[],
  fullJapanese: string
): CharacterMap[] {
  const result: CharacterMap[] = [];
  const words = fullJapanese.split(/\s+/);

  let charIndex = 0;
  words.forEach((word, wordIndex) => {
    const wordChars = Array.from(word);
    const romanjiPart = romanjiParts[wordIndex] || '';

    // For each word, create character maps
    const wordMap = splitRomanjiByCharacter(wordChars, romanjiPart);

    wordMap.forEach((charMap) => {
      result.push({
        ...charMap,
        index: charIndex++,
      });
    });

    // Add space character if not last word
    if (wordIndex < words.length - 1) {
      result.push({
        japanese: ' ',
        romanji: ' ',
        revealed: true, // Spaces are always revealed
        index: charIndex++,
      });
    }
  });

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
