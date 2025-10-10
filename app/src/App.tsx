import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { SyncProvider } from './contexts/SyncContext';
import { WordProvider } from './contexts/WordContext';
import { ProgressProvider } from './contexts/ProgressContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { Navigation } from './components/Navigation';
import { Dashboard } from './pages/Dashboard';
import { AlphabetMode } from './pages/AlphabetMode';
import { SentenceMode } from './pages/SentenceMode';
import { FlashcardMode } from './pages/FlashcardMode';
import { ManageWords } from './pages/ManageWords';
import { Settings } from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <SyncProvider>
        <SettingsProvider>
          <WordProvider>
            <ProgressProvider>
              <Router>
                <div className="min-h-screen bg-bg-primary pb-20 md:pb-0">
                  <Navigation />
                  <main className="pt-4 md:pt-8">
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/alphabet" element={<AlphabetMode />} />
                      <Route path="/sentence" element={<SentenceMode />} />
                      <Route path="/flashcard" element={<FlashcardMode />} />
                      <Route path="/manage" element={<ManageWords />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={
                        <div className="max-w-4xl mx-auto p-4 md:p-6 text-center">
                          <h1 className="text-4xl font-bold text-text-primary mb-4">404</h1>
                          <p className="text-text-secondary">Page not found</p>
                        </div>
                      } />
                    </Routes>
                  </main>
                </div>
              </Router>
            </ProgressProvider>
          </WordProvider>
        </SettingsProvider>
      </SyncProvider>
    </ThemeProvider>
  );
}

export default App;
