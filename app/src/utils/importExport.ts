import type { Word, ExportData, UserProgress, AppSettings } from '../types';
import { validateExportData } from './validation';

export function exportData(
  words: Word[],
  progress: UserProgress,
  settings: AppSettings
): ExportData {
  const { theme, ...settingsWithoutTheme } = settings;

  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      words,
      progress,
      settings: settingsWithoutTheme,
    },
  };
}

export function importData(jsonString: string): {
  success: boolean;
  data?: ExportData;
  errors?: string[];
} {
  const errors: string[] = [];

  try {
    const parsed = JSON.parse(jsonString);

    if (!validateExportData(parsed)) {
      errors.push('Invalid export data structure');
      return { success: false, errors };
    }

    // Check version compatibility
    if (parsed.version !== '1.0') {
      errors.push(`Unsupported version: ${parsed.version}. Expected 1.0`);
      return { success: false, errors };
    }

    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof SyntaxError) {
      errors.push('Invalid JSON format');
    } else {
      errors.push('Unknown error parsing import data');
    }
    return { success: false, errors };
  }
}

export function downloadJSON(data: ExportData, filename?: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const defaultFilename = `jp-learn-export-${new Date().toISOString().split('T')[0]}.json`;

  const a = document.createElement('a');
  a.href = url;
  a.download = filename || defaultFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
