/**
 * Kana Data (Hiragana and Katakana)
 * Complete Japanese alphabets with romanji mappings
 */

export interface KanaCharacter {
  kana: string;
  romanji: string;
}

/**
 * Hiragana alphabet - Basic characters (gojūon)
 */
export const hiragana: KanaCharacter[] = [
  // Vowels
  { kana: 'あ', romanji: 'a' },
  { kana: 'い', romanji: 'i' },
  { kana: 'う', romanji: 'u' },
  { kana: 'え', romanji: 'e' },
  { kana: 'お', romanji: 'o' },

  // K-row
  { kana: 'か', romanji: 'ka' },
  { kana: 'き', romanji: 'ki' },
  { kana: 'く', romanji: 'ku' },
  { kana: 'け', romanji: 'ke' },
  { kana: 'こ', romanji: 'ko' },

  // S-row
  { kana: 'さ', romanji: 'sa' },
  { kana: 'し', romanji: 'shi' },
  { kana: 'す', romanji: 'su' },
  { kana: 'せ', romanji: 'se' },
  { kana: 'そ', romanji: 'so' },

  // T-row
  { kana: 'た', romanji: 'ta' },
  { kana: 'ち', romanji: 'chi' },
  { kana: 'つ', romanji: 'tsu' },
  { kana: 'て', romanji: 'te' },
  { kana: 'と', romanji: 'to' },

  // N-row
  { kana: 'な', romanji: 'na' },
  { kana: 'に', romanji: 'ni' },
  { kana: 'ぬ', romanji: 'nu' },
  { kana: 'ね', romanji: 'ne' },
  { kana: 'の', romanji: 'no' },

  // H-row
  { kana: 'は', romanji: 'ha' },
  { kana: 'ひ', romanji: 'hi' },
  { kana: 'ふ', romanji: 'fu' },
  { kana: 'へ', romanji: 'he' },
  { kana: 'ほ', romanji: 'ho' },

  // M-row
  { kana: 'ま', romanji: 'ma' },
  { kana: 'み', romanji: 'mi' },
  { kana: 'む', romanji: 'mu' },
  { kana: 'め', romanji: 'me' },
  { kana: 'も', romanji: 'mo' },

  // Y-row
  { kana: 'や', romanji: 'ya' },
  { kana: 'ゆ', romanji: 'yu' },
  { kana: 'よ', romanji: 'yo' },

  // R-row
  { kana: 'ら', romanji: 'ra' },
  { kana: 'り', romanji: 'ri' },
  { kana: 'る', romanji: 'ru' },
  { kana: 'れ', romanji: 're' },
  { kana: 'ろ', romanji: 'ro' },

  // W-row
  { kana: 'わ', romanji: 'wa' },
  { kana: 'を', romanji: 'wo' },

  // N
  { kana: 'ん', romanji: 'n' },

  // Dakuten (゛) - Voiced consonants
  { kana: 'が', romanji: 'ga' },
  { kana: 'ぎ', romanji: 'gi' },
  { kana: 'ぐ', romanji: 'gu' },
  { kana: 'げ', romanji: 'ge' },
  { kana: 'ご', romanji: 'go' },

  { kana: 'ざ', romanji: 'za' },
  { kana: 'じ', romanji: 'ji' },
  { kana: 'ず', romanji: 'zu' },
  { kana: 'ぜ', romanji: 'ze' },
  { kana: 'ぞ', romanji: 'zo' },

  { kana: 'だ', romanji: 'da' },
  { kana: 'ぢ', romanji: 'ji' },
  { kana: 'づ', romanji: 'zu' },
  { kana: 'で', romanji: 'de' },
  { kana: 'ど', romanji: 'do' },

  { kana: 'ば', romanji: 'ba' },
  { kana: 'び', romanji: 'bi' },
  { kana: 'ぶ', romanji: 'bu' },
  { kana: 'べ', romanji: 'be' },
  { kana: 'ぼ', romanji: 'bo' },

  // Handakuten (゜) - P-sounds
  { kana: 'ぱ', romanji: 'pa' },
  { kana: 'ぴ', romanji: 'pi' },
  { kana: 'ぷ', romanji: 'pu' },
  { kana: 'ぺ', romanji: 'pe' },
  { kana: 'ぽ', romanji: 'po' },
];

/**
 * Katakana alphabet - Basic characters (gojūon)
 */
export const katakana: KanaCharacter[] = [
  // Vowels
  { kana: 'ア', romanji: 'a' },
  { kana: 'イ', romanji: 'i' },
  { kana: 'ウ', romanji: 'u' },
  { kana: 'エ', romanji: 'e' },
  { kana: 'オ', romanji: 'o' },

  // K-row
  { kana: 'カ', romanji: 'ka' },
  { kana: 'キ', romanji: 'ki' },
  { kana: 'ク', romanji: 'ku' },
  { kana: 'ケ', romanji: 'ke' },
  { kana: 'コ', romanji: 'ko' },

  // S-row
  { kana: 'サ', romanji: 'sa' },
  { kana: 'シ', romanji: 'shi' },
  { kana: 'ス', romanji: 'su' },
  { kana: 'セ', romanji: 'se' },
  { kana: 'ソ', romanji: 'so' },

  // T-row
  { kana: 'タ', romanji: 'ta' },
  { kana: 'チ', romanji: 'chi' },
  { kana: 'ツ', romanji: 'tsu' },
  { kana: 'テ', romanji: 'te' },
  { kana: 'ト', romanji: 'to' },

  // N-row
  { kana: 'ナ', romanji: 'na' },
  { kana: 'ニ', romanji: 'ni' },
  { kana: 'ヌ', romanji: 'nu' },
  { kana: 'ネ', romanji: 'ne' },
  { kana: 'ノ', romanji: 'no' },

  // H-row
  { kana: 'ハ', romanji: 'ha' },
  { kana: 'ヒ', romanji: 'hi' },
  { kana: 'フ', romanji: 'fu' },
  { kana: 'ヘ', romanji: 'he' },
  { kana: 'ホ', romanji: 'ho' },

  // M-row
  { kana: 'マ', romanji: 'ma' },
  { kana: 'ミ', romanji: 'mi' },
  { kana: 'ム', romanji: 'mu' },
  { kana: 'メ', romanji: 'me' },
  { kana: 'モ', romanji: 'mo' },

  // Y-row
  { kana: 'ヤ', romanji: 'ya' },
  { kana: 'ユ', romanji: 'yu' },
  { kana: 'ヨ', romanji: 'yo' },

  // R-row
  { kana: 'ラ', romanji: 'ra' },
  { kana: 'リ', romanji: 'ri' },
  { kana: 'ル', romanji: 'ru' },
  { kana: 'レ', romanji: 're' },
  { kana: 'ロ', romanji: 'ro' },

  // W-row
  { kana: 'ワ', romanji: 'wa' },
  { kana: 'ヲ', romanji: 'wo' },

  // N
  { kana: 'ン', romanji: 'n' },

  // Dakuten (゛) - Voiced consonants
  { kana: 'ガ', romanji: 'ga' },
  { kana: 'ギ', romanji: 'gi' },
  { kana: 'グ', romanji: 'gu' },
  { kana: 'ゲ', romanji: 'ge' },
  { kana: 'ゴ', romanji: 'go' },

  { kana: 'ザ', romanji: 'za' },
  { kana: 'ジ', romanji: 'ji' },
  { kana: 'ズ', romanji: 'zu' },
  { kana: 'ゼ', romanji: 'ze' },
  { kana: 'ゾ', romanji: 'zo' },

  { kana: 'ダ', romanji: 'da' },
  { kana: 'ヂ', romanji: 'ji' },
  { kana: 'ヅ', romanji: 'zu' },
  { kana: 'デ', romanji: 'de' },
  { kana: 'ド', romanji: 'do' },

  { kana: 'バ', romanji: 'ba' },
  { kana: 'ビ', romanji: 'bi' },
  { kana: 'ブ', romanji: 'bu' },
  { kana: 'ベ', romanji: 'be' },
  { kana: 'ボ', romanji: 'bo' },

  // Handakuten (゜) - P-sounds
  { kana: 'パ', romanji: 'pa' },
  { kana: 'ピ', romanji: 'pi' },
  { kana: 'プ', romanji: 'pu' },
  { kana: 'ペ', romanji: 'pe' },
  { kana: 'ポ', romanji: 'po' },
];
