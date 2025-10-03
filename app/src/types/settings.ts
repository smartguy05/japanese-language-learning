export interface AppSettings {
  // Appearance
  theme: 'dark' | 'light';

  // Study Preferences
  reviewMode: 'sequential' | 'random' | 'needsReviewFirst';
  flashcardDirection: 'japaneseToEnglish' | 'englishToJapanese' | 'both';
  showStudyModeByDefault: boolean;

  // AI Integration
  claudeApiKey: string | null;

  // Data Management
  lastExportDate: string | null; // ISO 8601
  dataVersion: string; // For future migration compatibility
}
