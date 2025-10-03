import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings } from '../types/settings';
import { getItem, setItem } from '../utils/storage';

const STORAGE_KEY = 'jp-learn-settings';

const defaultSettings: AppSettings = {
  theme: 'dark',
  reviewMode: 'sequential',
  flashcardDirection: 'japaneseToEnglish',
  showStudyModeByDefault: false,
  claudeApiKey: null,
  lastExportDate: null,
  dataVersion: '1.0',
};

interface SettingsContextValue {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  hasApiKey: boolean;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return getItem<AppSettings>(STORAGE_KEY, defaultSettings);
  });

  useEffect(() => {
    setItem(STORAGE_KEY, settings);
  }, [settings]);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const hasApiKey = Boolean(settings.claudeApiKey && settings.claudeApiKey.trim());

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, hasApiKey }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
