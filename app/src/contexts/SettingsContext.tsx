import type { ReactNode } from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import type { AppSettings, SyncReason } from '../types';
import { getItem, setItem } from '../utils/storage';

const STORAGE_KEY = 'jp-learn-settings';

const defaultSettings: AppSettings = {
  theme: 'dark',
  reviewMode: 'sequential',
  flashcardDirection: 'japaneseToEnglish',
  showStudyModeByDefault: false,
  claudeApiKey: null,
  claudeModel: null,
  cachedModels: [],
  lastModelsFetch: null,
  lastExportDate: null,
  dataVersion: '1.0',
  lastModified: Date.now(),
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

  // Import sync context dynamically to avoid circular dependency
  const [triggerSync, setTriggerSync] = useState<((reason: SyncReason) => void) | null>(null);

  useEffect(() => {
    import('./SyncContext').then(module => {
      try {
        const sync = module.useSyncContext();
        setTriggerSync(() => sync.triggerSync);
      } catch {
        // SyncContext not available or not wrapped in provider
      }
    }).catch(() => {
      // Module not available
    });
  }, []);

  useEffect(() => {
    setItem(STORAGE_KEY, settings);

    // Trigger sync after saving to localStorage (except for theme changes which are device-specific)
    if (triggerSync) {
      triggerSync('settings-change');
    }
  }, [settings, triggerSync]);

  // Listen for settings import events
  useEffect(() => {
    const handleSettingsImport = () => {
      const importedSettings = getItem<AppSettings>(STORAGE_KEY, defaultSettings);
      setSettings(importedSettings);
    };

    window.addEventListener('settings-imported', handleSettingsImport);
    return () => window.removeEventListener('settings-imported', handleSettingsImport);
  }, []);

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates, lastModified: Date.now() }));
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
