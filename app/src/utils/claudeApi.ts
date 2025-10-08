import type { Word } from '../types/word';

interface GenerateWordsParams {
  apiKey: string;
  count: number;
  difficulty: number; // 1-5 scale
  type: 'word' | 'sentence';
  existingWords: Word[];
  currentDay: number;
  model?: string;
}

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
}

export interface AnthropicModel {
  id: string;
  display_name: string;
  type: string;
  created_at: string;
}

interface ModelsResponse {
  data: AnthropicModel[];
  has_more: boolean;
  first_id: string | null;
  last_id: string | null;
}

export async function fetchAnthropicModels(apiKey: string): Promise<AnthropicModel[]> {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }

    const data: ModelsResponse = await response.json();

    // Filter to get only the 5 latest models with unique display_name
    const uniqueModels = new Map<string, AnthropicModel>();
    for (const model of data.data) {
      if (!uniqueModels.has(model.display_name)) {
        uniqueModels.set(model.display_name, model);
      }
    }

    return Array.from(uniqueModels.values()).slice(0, 5);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch models: ${error.message}`);
    }
    throw new Error('Failed to fetch models: Unknown error');
  }
}

export async function generateWordsWithClaude(params: GenerateWordsParams): Promise<Omit<Word, 'id' | 'createdAt'>[]> {
  const { apiKey, count, difficulty, type, existingWords, currentDay, model = 'claude-sonnet-4-20250514' } = params;

  // Build context from existing words to avoid duplicates
  const existingJapanese = existingWords.map(w => w.japanese).join(', ');

  const difficultyDescriptions = [
    'absolute beginner (common greetings and basic words)',
    'beginner (simple everyday words)',
    'elementary (common daily life vocabulary)',
    'intermediate (more varied vocabulary)',
    'advanced (complex words and expressions)'
  ];

  const difficultyLevel = difficultyDescriptions[difficulty - 1] || difficultyDescriptions[2];

  const prompt = type === 'word'
    ? `Generate ${count} Japanese ${type}s suitable for ${difficultyLevel} learners.

IMPORTANT RULES:
- Use ONLY hiragana (ひらがな) or katakana (カタカナ) - NO kanji
- Each word should be practical and commonly used
- Avoid duplicating these existing words: ${existingJapanese || 'none yet'}
- Provide accurate romanji (romaji) transliteration
- Give clear English translations

Return ONLY a JSON array with this exact format, no other text:
[
  {
    "japanese": "ひらがな or カタカナ only",
    "romanji": "accurate romaji",
    "english": "clear English translation"
  }
]

Example format:
[
  {"japanese": "こんにちは", "romanji": "konnichiwa", "english": "hello"},
  {"japanese": "ありがとう", "romanji": "arigatou", "english": "thank you"}
]`
    : `Generate ${count} Japanese ${type}s suitable for ${difficultyLevel} learners.

IMPORTANT RULES:
- Use ONLY hiragana (ひらがな) or katakana (カタカナ) - NO kanji
- Sentences should be natural and practical
- Avoid duplicating these existing sentences: ${existingJapanese || 'none yet'}
- Provide accurate romanji (romaji) transliteration
- Give clear English translations

Return ONLY a JSON array with this exact format, no other text:
[
  {
    "japanese": "ひらがな or カタカナ sentence",
    "romanji": "accurate romaji",
    "english": "clear English translation"
  }
]

Example format:
[
  {"japanese": "きょうは いい てんきですね", "romanji": "kyou wa ii tenki desu ne", "english": "It's nice weather today"},
  {"japanese": "わたしは がくせいです", "romanji": "watashi wa gakusei desu", "english": "I am a student"}
]`;

  try {
    // Direct API call with CORS support
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API request failed: ${response.statusText}`);
    }

    const data: ClaudeResponse = await response.json();
    const text = data.content[0]?.text || '';

    // Extract JSON from the response (Claude might add markdown formatting)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not parse response from Claude API');
    }

    const generatedItems = JSON.parse(jsonMatch[0]);

    // Transform to Word format
    return generatedItems.map((item: any) => ({
      japanese: item.japanese,
      romanji: item.romanji,
      english: item.english,
      day: currentDay,
      type,
      mastered: false,
      needsReview: false,
      reviewCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastReviewed: new Date().toISOString(),
    }));

  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate ${type}s: ${error.message}`);
    }
    throw new Error(`Failed to generate ${type}s: Unknown error`);
  }
}

export function validateApiKey(apiKey: string): boolean {
  return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
}
