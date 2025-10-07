import { useState, useRef, useEffect } from 'react';
import { Card, Button, Input, Toast, ToastType, Select } from '../components/common';
import { useTheme } from '../contexts/ThemeContext';
import { useWords } from '../contexts/WordContext';
import { useProgress } from '../contexts/ProgressContext';
import { useSettings } from '../contexts/SettingsContext';
import { downloadJSON, importData } from '../utils/importExport';
import { generateSeedData } from '../utils/seedData';
import { validateApiKey, fetchAnthropicModels, AnthropicModel } from '../utils/claudeApi';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { exportData, clearAllData, bulkAddWords, words, importData: importWordData } = useWords();
  const { resetAllProgress } = useProgress();
  const { settings, updateSettings } = useSettings();

  const [apiKeyInput, setApiKeyInput] = useState(settings.claudeApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportData();
    downloadJSON(data);
  };

  const handleLoadSampleData = () => {
    if (confirm('This will add sample Japanese words and sentences. Continue?')) {
      const sampleData = generateSeedData();
      bulkAddWords(sampleData);
    }
  };

  const handleClearAll = () => {
    if (confirm('This will delete ALL data. This cannot be undone. Are you sure?')) {
      if (confirm('Really delete everything? This is your last chance to cancel.')) {
        clearAllData();
        resetAllProgress();
      }
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) {
      updateSettings({ claudeApiKey: null, claudeModel: null, cachedModels: [] });
      setApiKeyError('');
      return;
    }

    if (!validateApiKey(apiKeyInput)) {
      setApiKeyError('Invalid API key format. Must start with "sk-ant-" and be at least 20 characters.');
      return;
    }

    // Fetch models when saving a new API key
    setIsLoadingModels(true);
    try {
      const models = await fetchAnthropicModels(apiKeyInput);
      const defaultModel = models.length > 0 ? models[0].id : null;
      updateSettings({
        claudeApiKey: apiKeyInput,
        claudeModel: defaultModel,
        cachedModels: models,
        lastModelsFetch: new Date().toISOString()
      });
      setApiKeyError('');
      setToast({ message: `API key saved! ${models.length} models loaded.`, type: 'success' });
    } catch (error) {
      setApiKeyError(error instanceof Error ? error.message : 'Failed to fetch models');
      setToast({ message: 'API key saved but failed to load models', type: 'error' });
      // Still save the API key even if model fetch fails
      updateSettings({ claudeApiKey: apiKeyInput });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleClearApiKey = () => {
    if (confirm('Remove Claude API key from settings?')) {
      setApiKeyInput('');
      updateSettings({ claudeApiKey: null, claudeModel: null, cachedModels: [], lastModelsFetch: null });
      setApiKeyError('');
    }
  };

  const shouldRefreshModels = (): boolean => {
    if (!settings.lastModelsFetch) return true;

    const lastFetch = new Date(settings.lastModelsFetch);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return lastFetch < oneWeekAgo;
  };

  const handleModelDropdownClick = async () => {
    if (!settings.claudeApiKey || !shouldRefreshModels()) return;

    setIsLoadingModels(true);
    try {
      const models = await fetchAnthropicModels(settings.claudeApiKey);
      updateSettings({
        cachedModels: models,
        lastModelsFetch: new Date().toISOString()
      });
    } catch (error) {
      setToast({ message: 'Failed to refresh models', type: 'error' });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleRefreshModels = async () => {
    if (!settings.claudeApiKey) return;

    setIsLoadingModels(true);
    try {
      const models = await fetchAnthropicModels(settings.claudeApiKey);
      updateSettings({
        cachedModels: models,
        lastModelsFetch: new Date().toISOString()
      });
      setToast({ message: `Models refreshed! ${models.length} models loaded.`, type: 'success' });
    } catch (error) {
      setToast({ message: 'Failed to refresh models', type: 'error' });
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleModelChange = (modelId: string) => {
    updateSettings({ claudeModel: modelId });
  };

  const handleImportClick = () => {
    setImportError('');
    setImportSuccess(false);
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    let text: string;

    // Step 1: Read file
    try {
      text = await file.text();
    } catch (error) {
      setImportError('Failed to read file');
      setImportSuccess(false);
      setToast({ message: 'Failed to read file', type: 'error' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Step 2: Parse and validate
    const result = importData(text);

    if (!result.success) {
      setImportError(result.errors?.join(', ') || 'Import failed');
      setImportSuccess(false);
      setToast({ message: `Import failed: ${result.errors?.join(', ')}`, type: 'error' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Step 3: Import data
    if (!result.data) {
      setImportError('No data to import');
      setImportSuccess(false);
      setToast({ message: 'No data to import', type: 'error' });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    try {
      const wordCount = result.data.data.words.length;

      importWordData(result.data);
      setImportSuccess(true);
      setImportError('');

      // Show success toast
      setToast({
        message: `Successfully imported ${wordCount} word${wordCount !== 1 ? 's' : ''} and settings!`,
        type: 'success'
      });

      // Update API key input to reflect imported settings
      setTimeout(() => {
        setApiKeyInput(settings.claudeApiKey || '');
      }, 100);
    } catch (error) {
      setImportError('Failed to import data');
      setImportSuccess(false);
      setToast({ message: `Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">Settings</h1>

      {/* Appearance */}
      <Card variant="default" padding="large" className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-primary font-medium">Theme</p>
            <p className="text-text-secondary text-sm">Current: {theme === 'dark' ? 'Dark' : 'Light'}</p>
          </div>
          <Button onClick={toggleTheme} variant="secondary">
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>
      </Card>

      {/* AI Integration */}
      <Card variant="default" padding="large" className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">AI Integration</h2>
        <div className="space-y-4">
          <div>
            <p className="text-text-primary font-medium mb-2">Claude API Key</p>
            <p className="text-text-secondary text-sm mb-3">
              Add your Claude API key to generate new Japanese words and sentences on-demand
            </p>
            <div className="flex gap-2 mb-2">
              <Input
                type={showApiKey ? 'text' : 'password'}
                placeholder="sk-ant-api03-..."
                value={apiKeyInput}
                onChange={(e) => {
                  setApiKeyInput(e.target.value);
                  setApiKeyError('');
                }}
                className="flex-1"
              />
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                variant="secondary"
                size="small"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </div>
            {apiKeyError && (
              <p className="text-error text-sm mb-2">{apiKeyError}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleSaveApiKey} variant="primary" size="small">
                Save API Key
              </Button>
              {settings.claudeApiKey && (
                <Button onClick={handleClearApiKey} variant="secondary" size="small">
                  Clear API Key
                </Button>
              )}
            </div>
            {settings.claudeApiKey && !apiKeyError && (
              <p className="text-success text-sm mt-2">✓ API key saved</p>
            )}
          </div>

          {/* Model Selection - Only show if API key is saved */}
          {settings.claudeApiKey && (
            <div>
              <p className="text-text-primary font-medium mb-2">Claude Model</p>
              <p className="text-text-secondary text-sm mb-3">
                Select which Claude model to use for generating words and sentences
              </p>
              <div className="flex gap-2">
                <Select
                  value={settings.claudeModel || ''}
                  onChange={(e) => handleModelChange(e.target.value)}
                  onClick={handleModelDropdownClick}
                  disabled={isLoadingModels}
                  className="flex-1"
                >
                  {isLoadingModels ? (
                    <option>Loading models...</option>
                  ) : settings.cachedModels && settings.cachedModels.length > 0 ? (
                    settings.cachedModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.display_name}
                      </option>
                    ))
                  ) : (
                    <option value="">No models available</option>
                  )}
                </Select>
                <Button
                  onClick={handleRefreshModels}
                  variant="secondary"
                  size="small"
                  disabled={isLoadingModels}
                  title="Refresh model list"
                >
                  ↻
                </Button>
              </div>
              {settings.claudeModel && (
                <p className="text-text-secondary text-xs mt-2">
                  Selected: {settings.cachedModels?.find(m => m.id === settings.claudeModel)?.display_name || settings.claudeModel}
                </p>
              )}
              {settings.lastModelsFetch && (
                <p className="text-text-tertiary text-xs mt-1">
                  Last updated: {new Date(settings.lastModelsFetch).toLocaleDateString()}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Data Management */}
      <Card variant="default" padding="large" className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Export Data</p>
              <p className="text-text-secondary text-sm">Download your words, progress, and settings as JSON</p>
            </div>
            <Button onClick={handleExport} variant="secondary">
              Export
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-primary font-medium">Import Data</p>
                <p className="text-text-secondary text-sm">Restore from a previously exported JSON file</p>
              </div>
              <Button onClick={handleImportClick} variant="secondary">
                Import
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />
            {importError && (
              <p className="text-error text-sm mt-2">✗ {importError}</p>
            )}
            {importSuccess && (
              <p className="text-success text-sm mt-2">✓ Data imported successfully</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Load Sample Data</p>
              <p className="text-text-secondary text-sm">Add {words.length > 0 ? 'more' : ''} example words and sentences</p>
            </div>
            <Button onClick={handleLoadSampleData} variant="secondary">
              Load Samples
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Clear All Data</p>
              <p className="text-text-secondary text-sm text-error">Warning: This cannot be undone</p>
            </div>
            <Button onClick={handleClearAll} variant="secondary" className="text-error">
              Clear All
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card variant="default" padding="large">
        <h2 className="text-xl font-semibold text-text-primary mb-4">About</h2>
        <p className="text-text-secondary mb-2">
          <strong className="text-text-primary">Japanese Learning PWA</strong> - Version 1.0
        </p>
        <p className="text-text-secondary text-sm">
          A Progressive Web Application for learning Japanese through interactive study modes.
        </p>
        <p className="text-text-secondary text-sm mt-4">
          • Alphabet Mode - Character reveal system<br />
          • Sentence Mode - Comprehension quizzes<br />
          • Flashcard Mode - Traditional review<br />
          • Completely offline-first with no backend
        </p>
      </Card>

      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
