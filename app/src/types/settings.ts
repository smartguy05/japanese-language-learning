import type { AnthropicModel } from '../utils/claudeApi';

export interface AppSettings {
  // Appearance
  theme: 'dark' | 'light';

  // Study Preferences
  reviewMode: 'sequential' | 'random' | 'needsReviewFirst';
  flashcardDirection: 'japaneseToEnglish' | 'englishToJapanese' | 'both';
  showStudyModeByDefault: boolean;

  // AI Integration
  claudeApiKey: string | null;
  claudeModel: string | null; // Model ID to use for generation
  cachedModels: AnthropicModel[]; // Cached list of available models
  lastModelsFetch: string | null; // ISO 8601 timestamp of last models fetch

  // Data Management
  lastExportDate: string | null; // ISO 8601
  dataVersion: string; // For future migration compatibility
}
