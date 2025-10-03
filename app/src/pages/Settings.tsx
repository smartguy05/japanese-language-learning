import { Card, Button } from '../components/common';
import { useTheme } from '../contexts/ThemeContext';
import { useWords } from '../contexts/WordContext';
import { downloadJSON } from '../utils/importExport';
import { generateSeedData } from '../utils/seedData';

export function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { exportData, clearAllData, bulkAddWords, words } = useWords();

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
      }
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

      {/* Data Management */}
      <Card variant="default" padding="large" className="mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-text-primary font-medium">Export Data</p>
              <p className="text-text-secondary text-sm">Download your words and progress as JSON</p>
            </div>
            <Button onClick={handleExport} variant="secondary">
              Export
            </Button>
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
    </div>
  );
}
