# Japanese Learning PWA - Technical Design Document

**Version:** 1.0  
**Last Updated:** October 3, 2025  
**Project Status:** Planning Phase

---

## Executive Summary

A Progressive Web Application (PWA) designed to help users learn Japanese through interactive study modes focused on hiragana/katakana recognition, sentence comprehension, and flashcard review. The application prioritizes offline functionality, cross-device compatibility, and a minimalist aesthetic with traditional Japanese design influences.

### Core Design Principles

1. **Offline-First Architecture** - All functionality available without network connectivity
2. **Mobile-First Responsive Design** - Optimized for smartphones with tablet/desktop support
3. **Zero Backend Dependency** - Complete client-side application using browser storage
4. **Progressive Enhancement** - Core features work everywhere, enhanced features where supported
5. **Aesthetic Balance** - Minimalist modern interface with traditional Japanese design elements

---

## Technology Stack

### Frontend Framework
- **React 18.2+** with TypeScript 5.0+
  - Functional components with hooks
  - Context API for global state management
  - No external state management library (Redux, Zustand) needed
  - Strict TypeScript mode for type safety

### Build Tooling
- **Vite 5.0+**
  - Lightning-fast HMR during development
  - Optimized production builds with code splitting
  - Built-in TypeScript support
  - PWA plugin integration

### Styling
- **Tailwind CSS 3.4+**
  - Utility-first CSS framework
  - Custom theme configuration for Japanese aesthetic
  - Dark mode support via class strategy
  - JIT compiler for optimal bundle size

### PWA Infrastructure
- **vite-plugin-pwa 0.19+**
  - Service worker generation with Workbox
  - Web app manifest configuration
  - Offline caching strategies
  - Install prompts and updates

### Data Persistence
- **LocalStorage API**
  - Primary storage for application data
  - JSON serialization for complex objects
  - 5-10MB typical storage limit (sufficient for use case)
  - Synchronous API for simplicity
  
- **IndexedDB** (fallback consideration)
  - Not implemented in MVP
  - Future enhancement if data exceeds LocalStorage limits

### Additional Libraries

#### UI & Animations
- **Framer Motion 11.0+** (optional)
  - Smooth page transitions
  - Flashcard flip animations
  - Fireworks celebration effects
  - Micro-interactions and gestures

#### Japanese Text Processing
- **WanaKana 5.3+**
  - Romanji to hiragana/katakana conversion
  - Character type detection (hiragana vs katakana)
  - Input method editor (IME) helpers
  - Lightweight (~20KB gzipped)

#### Utilities
- **date-fns 3.0+**
  - Date manipulation for tracking
  - Formatting and parsing
  - Timezone handling (minimal usage)
  
- **nanoid 5.0+**
  - Unique ID generation for words/sentences
  - Cryptographically secure
  - URL-safe, collision-resistant

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Environment                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              React Application Layer                   │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │                                                         │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │  │
│  │  │ Alphabet     │  │  Sentence    │  │  Flashcard  │ │  │
│  │  │ Mode         │  │  Mode        │  │  Mode       │ │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │  │
│  │         │                  │                  │         │  │
│  │  ┌──────┴──────────────────┴──────────────────┴──────┐ │  │
│  │  │         State Management (Context API)            │ │  │
│  │  │  • WordContext (CRUD operations)                  │ │  │
│  │  │  • ThemeContext (dark/light mode)                 │ │  │
│  │  │  • ProgressContext (scores, mastery tracking)     │ │  │
│  │  └───────────────────────────┬───────────────────────┘ │  │
│  │                               │                          │  │
│  │  ┌────────────────────────────┴──────────────────────┐ │  │
│  │  │          Business Logic Layer                     │ │  │
│  │  │  • Word filtering and selection algorithms        │ │  │
│  │  │  • Spaced repetition logic (needs review)         │ │  │
│  │  │  • Quiz generation (distractor selection)         │ │  │
│  │  │  • Score calculation and tracking                 │ │  │
│  │  └───────────────────────────┬───────────────────────┘ │  │
│  │                               │                          │  │
│  └───────────────────────────────┼──────────────────────────┘  │
│                                  │                             │
│  ┌───────────────────────────────┴──────────────────────────┐ │
│  │           Data Persistence Layer                         │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │  LocalStorage API                                        │ │
│  │  • words: Word[]                                         │ │
│  │  • settings: AppSettings                                 │ │
│  │  • progress: UserProgress                                │ │
│  │  • theme: 'dark' | 'light'                               │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │          Service Worker (PWA Layer)                    │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │  • Offline asset caching (HTML, CSS, JS)              │  │
│  │  • Network-first strategy for data                    │  │
│  │  • Background sync (future enhancement)               │  │
│  │  • Install prompt handling                            │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App (ThemeProvider, Router)
├── Navigation
│   ├── MainNav (Mode selection tabs)
│   └── SettingsMenu (Theme, Import/Export)
│
├── Routes
│   ├── DashboardPage
│   │   ├── DaySelector
│   │   ├── ProgressStats
│   │   └── QuickActions
│   │
│   ├── AlphabetModePage
│   │   ├── StudyView (optional review before quiz)
│   │   ├── QuizView
│   │   │   ├── WordDisplay (Japanese text)
│   │   │   ├── RomanjiReveal (obfuscated, click to reveal)
│   │   │   └── NavigationControls
│   │   └── ResultsView
│   │
│   ├── SentenceModePage
│   │   ├── StudyView (optional review before quiz)
│   │   ├── QuizView
│   │   │   ├── SentenceDisplay
│   │   │   ├── MultipleChoice (4 options)
│   │   │   ├── FireworksAnimation (on correct)
│   │   │   └── ScoreDisplay
│   │   └── ResultsView
│   │
│   ├── FlashcardModePage
│   │   ├── FlashcardContainer
│   │   │   ├── FlashcardFront (Japanese or English)
│   │   │   ├── FlashcardBack (translation)
│   │   │   └── FlipControls
│   │   ├── NavigationControls (prev/next)
│   │   └── DirectionToggle (JP→EN or EN→JP)
│   │
│   ├── ManageWordsPage
│   │   ├── WordList
│   │   │   ├── WordItem
│   │   │   │   ├── WordDisplay
│   │   │   │   ├── EditButton
│   │   │   │   └── DeleteButton
│   │   │   └── DayGroup
│   │   ├── AddWordForm
│   │   └── BulkActions
│   │
│   └── SettingsPage
│       ├── ThemeToggle
│       ├── DataManagement (Import/Export)
│       └── AboutSection
│
└── Common Components
    ├── Button (variants: primary, secondary, ghost)
    ├── Card (container component)
    ├── Modal (for forms and confirmations)
    ├── Input (text input with Japanese keyboard toggle)
    ├── Select (dropdown component)
    └── Toast (notifications)
```

---

## Data Models

### Core Entities

#### Word Entity
```typescript
interface Word {
  // Unique identifier
  id: string; // nanoid generated
  
  // Content
  japanese: string; // 漢字, ひらがな, or カタカナ
  romanji: string; // Latin alphabet transliteration
  english: string; // English translation
  
  // Organization
  day: number; // Which day this was added (1-indexed)
  type: 'word' | 'sentence'; // For filtering and display
  
  // Learning Progress
  mastered: boolean; // User marked as mastered
  needsReview: boolean; // Flagged for additional practice
  reviewCount: number; // Times this word has been reviewed
  correctCount: number; // Times answered correctly
  incorrectCount: number; // Times answered incorrectly
  
  // Metadata
  lastReviewed: string; // ISO 8601 date string
  createdAt: string; // ISO 8601 date string
}
```

#### User Progress Entity
```typescript
interface UserProgress {
  // Overall Statistics
  totalWords: number;
  totalSentences: number;
  masteredWords: number;
  masteredSentences: number;
  wordsNeedingReview: number;
  
  // Current Session
  currentDay: number; // Active day being studied
  sessionScore: {
    alphabetMode: { correct: number; incorrect: number };
    sentenceMode: { correct: number; incorrect: number };
    flashcardMode: { correct: number; incorrect: number };
  };
  
  // Historical Data (optional, for future analytics)
  dailyStreak: number;
  lastStudyDate: string; // ISO 8601
  totalStudyTime: number; // Minutes (future enhancement)
}
```

#### App Settings Entity
```typescript
interface AppSettings {
  // Appearance
  theme: 'dark' | 'light';
  
  // Study Preferences
  reviewMode: 'sequential' | 'random' | 'needsReviewFirst';
  flashcardDirection: 'japaneseToEnglish' | 'englishToJapanese' | 'both';
  showStudyModeByDefault: boolean;
  
  // Data Management
  lastExportDate: string | null; // ISO 8601
  dataVersion: string; // For future migration compatibility
}
```

### LocalStorage Schema

```typescript
// Storage Keys
const STORAGE_KEYS = {
  WORDS: 'jp-learn-words',
  PROGRESS: 'jp-learn-progress',
  SETTINGS: 'jp-learn-settings',
  THEME: 'jp-learn-theme', // Separate for quick access
} as const;

// Example Stored Data
localStorage.getItem('jp-learn-words');
// Returns: JSON string of Word[]

localStorage.getItem('jp-learn-progress');
// Returns: JSON string of UserProgress

localStorage.getItem('jp-learn-settings');
// Returns: JSON string of AppSettings
```

### Import/Export Format

```typescript
// Export file structure (JSON)
interface ExportData {
  version: '1.0'; // Schema version for future compatibility
  exportDate: string; // ISO 8601
  data: {
    words: Word[];
    progress: UserProgress;
    settings: Omit<AppSettings, 'theme'>; // Theme is device-specific
  };
}

// Example export filename: jp-learn-export-2025-10-03.json
```

---

## State Management Strategy

### Context Providers

#### WordContext
Manages all word/sentence CRUD operations and provides filtered data.

```typescript
interface WordContextValue {
  // Data
  words: Word[];
  
  // Read Operations
  getWordsByDay: (day: number) => Word[];
  getWordsByType: (type: 'word' | 'sentence') => Word[];
  getWordsNeedingReview: () => Word[];
  getMasteredWords: () => Word[];
  getRandomWords: (count: number, filters?: Filters) => Word[];
  
  // Write Operations
  addWord: (word: Omit<Word, 'id' | 'createdAt'>) => void;
  updateWord: (id: string, updates: Partial<Word>) => void;
  deleteWord: (id: string) => void;
  bulkAddWords: (words: Omit<Word, 'id' | 'createdAt'>[]) => void;
  
  // Data Management
  importData: (data: ExportData) => Promise<void>;
  exportData: () => ExportData;
  clearAllData: () => void;
}
```

#### ThemeContext
Manages application theme and persists user preference.

```typescript
interface ThemeContextValue {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}
```

#### ProgressContext
Tracks user learning progress and session statistics.

```typescript
interface ProgressContextValue {
  progress: UserProgress;
  
  // Score Updates
  incrementScore: (mode: Mode, correct: boolean) => void;
  resetSessionScore: () => void;
  
  // Word Progress
  markAsMastered: (wordId: string, mastered: boolean) => void;
  markNeedsReview: (wordId: string, needs: boolean) => void;
  recordReview: (wordId: string, correct: boolean) => void;
  
  // Statistics
  getAccuracyRate: (mode?: Mode) => number;
  getStreakDays: () => number;
}
```

### Custom Hooks

```typescript
// useWordSelection.ts
// Intelligent word selection for study/quiz modes
function useWordSelection(params: {
  day?: number;
  type?: 'word' | 'sentence';
  mode: 'sequential' | 'random' | 'needsReviewFirst';
  count: number;
}): Word[];

// useQuizGenerator.ts
// Generates quiz questions with distractors for sentence mode
function useQuizGenerator(
  sentences: Word[],
  index: number
): {
  sentence: Word;
  options: { text: string; correct: boolean }[];
};

// useLocalStorage.ts
// Generic hook for typed localStorage operations
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void];

// useKeyboardShortcuts.ts
// Keyboard navigation for quiz modes
function useKeyboardShortcuts(
  handlers: Record<string, () => void>
): void;
```

---

## User Interface Design

### Design System

#### Color Palette

**Dark Mode (Default)**
```css
:root[data-theme='dark'] {
  /* Primary Background */
  --bg-primary: #0f0f1a; /* Deep navy-black */
  --bg-secondary: #1a1a2e; /* Slightly lighter navy */
  --bg-tertiary: #25253d; /* Card backgrounds */
  
  /* Traditional Japanese Accents */
  --accent-sakura: #ffc0d3; /* Soft cherry blossom pink */
  --accent-matcha: #b8d4a8; /* Gentle matcha green */
  --accent-indigo: #7986cb; /* Traditional indigo dye */
  --accent-gold: #e8c547; /* Gold leaf accent */
  
  /* Text */
  --text-primary: #f5f5f7; /* High contrast white */
  --text-secondary: #b8b8c8; /* Muted gray */
  --text-tertiary: #8585a0; /* Subtle gray */
  
  /* Semantic Colors */
  --success: #4caf7d; /* Correct answers */
  --error: #f44336; /* Incorrect answers */
  --warning: #ff9800; /* Needs review */
  
  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.15);
}
```

**Light Mode**
```css
:root[data-theme='light'] {
  /* Primary Background */
  --bg-primary: #fafafa; /* Off-white paper */
  --bg-secondary: #ffffff; /* Pure white */
  --bg-tertiary: #f0f0f5; /* Light gray */
  
  /* Traditional Japanese Accents */
  --accent-sakura: #ff4081; /* Vibrant cherry blossom */
  --accent-matcha: #689f38; /* Rich matcha */
  --accent-indigo: #3f51b5; /* Deep indigo */
  --accent-gold: #ffc107; /* Warm gold */
  
  /* Text */
  --text-primary: #1a1a1a; /* Near black */
  --text-secondary: #4a4a4a; /* Dark gray */
  --text-tertiary: #757575; /* Medium gray */
  
  /* Semantic Colors */
  --success: #2e7d32;
  --error: #d32f2f;
  --warning: #f57c00;
  
  /* Borders & Dividers */
  --border-subtle: rgba(0, 0, 0, 0.08);
  --border-medium: rgba(0, 0, 0, 0.15);
}
```

#### Typography

```css
/* Japanese Text Hierarchy */
--font-japanese: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
--font-english: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace;

/* Size Scale */
--text-xs: 0.75rem;   /* 12px */
--text-sm: 0.875rem;  /* 14px */
--text-base: 1rem;    /* 16px */
--text-lg: 1.125rem;  /* 18px */
--text-xl: 1.25rem;   /* 20px */
--text-2xl: 1.5rem;   /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem;  /* 36px - Large Japanese characters */
--text-5xl: 3rem;     /* 48px - Sentence mode */
```

#### Spacing & Layout

```css
/* Spacing Scale (Tailwind-inspired) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */

/* Container Constraints */
--container-sm: 640px;  /* Mobile-first */
--container-md: 768px;  /* Tablet */
--container-lg: 1024px; /* Desktop */
```

#### Visual Elements

**Traditional Japanese Patterns (Subtle Background Textures)**
- Seigaiha (波文) - Wave pattern for backgrounds
- Asanoha (麻の葉) - Hemp leaf geometric pattern
- Minimalist ink brush stroke accents

**Component Styling Principles**
- Rounded corners: 0.5rem (8px) for cards
- Box shadows: Soft, multi-layer shadows for depth
- Transitions: 200ms ease-in-out for interactions
- Focus states: 2px accent-colored outline
- Hover states: Subtle background color shift

### Responsive Breakpoints

```typescript
const breakpoints = {
  sm: '640px',  // Large phones (portrait)
  md: '768px',  // Tablets (portrait)
  lg: '1024px', // Tablets (landscape) / Small laptops
  xl: '1280px', // Desktop
};
```

### Touch Target Guidelines

All interactive elements must meet minimum touch target size:
- Buttons: 48px × 48px minimum
- Links: 44px × 44px minimum
- Tap areas: Extend beyond visual size with padding

---

## Core Feature Specifications

### 1. Alphabet Mode

**Purpose:** Learn hiragana/katakana by reading complete words with character-by-character romanji reveal.

#### User Flow
1. Select day/section or random mode
2. Optional: Study view (see all words with translations)
3. Quiz view: Japanese word displayed with obfuscated romanji below
4. User clicks individual Japanese characters to reveal corresponding romanji
5. Navigate to next word
6. Review results at end

#### Technical Implementation

**Romanji Obfuscation**
```typescript
// Character-level blur effect
// Each romanji character mapped to its Japanese character position

interface CharacterMap {
  japanese: string; // Single character
  romanji: string; // Corresponding romanji (may be multiple chars)
  revealed: boolean;
  x: number; // Position for click detection
  y: number;
}

function generateCharacterMap(word: Word): CharacterMap[] {
  // Split Japanese and romanji with proper Unicode handling
  // Account for multi-byte characters (hiragana/katakana)
  // Map each Japanese char to its romanji equivalent
}
```

**Visual Design**
- Japanese characters: Large, clear (text-4xl or text-5xl)
- Romanji: Smaller beneath each character (text-xl)
- Blur filter on unrevealed romanji: `filter: blur(8px)`
- Click/tap highlights Japanese character briefly
- Smooth reveal transition: 200ms ease-out

#### Edge Cases
- Long words: Horizontal scroll on small screens
- Compound characters: Handle properly (しゃ, きょ, etc.)
- Multiple words: Space between words preserved
- Katakana vs Hiragana: Visual distinction via font-weight

### 2. Sentence Mode

**Purpose:** Test comprehension through multiple-choice questions with celebratory feedback.

#### User Flow
1. Select day/section or random mode
2. Optional: Study view (see all sentences with translations)
3. Quiz view: Japanese sentence displayed
4. Four English translation options presented
5. Select an answer
6. Immediate feedback: Correct triggers fireworks, incorrect shows correct answer
7. Score tracked (X correct / Y total)
8. Navigate to next question
9. Review results with accuracy percentage

#### Technical Implementation

**Distractor Generation**
```typescript
function generateDistractors(
  correctAnswer: string,
  allSentences: Word[],
  count: number = 3
): string[] {
  // Strategy:
  // 1. Find sentences with similar length (±20% characters)
  // 2. Prefer sentences with overlapping keywords
  // 3. Ensure no duplicates
  // 4. Randomize order so correct answer isn't always in same position
}
```

**Fireworks Animation**
```typescript
// Canvas-based particle system
interface Particle {
  x: number;
  y: number;
  vx: number; // Velocity X
  vy: number; // Velocity Y
  color: string;
  life: number; // 0-1, decreases over time
  size: number;
}

function createFireworks(centerX: number, centerY: number) {
  // Generate 20-30 particles radiating from center
  // Colors: accent-sakura, accent-gold, accent-indigo
  // Duration: 1.5 seconds
  // Physics: Gravity and velocity decay
}
```

**Visual Design**
- Sentence: Large, centered (text-3xl or text-4xl)
- Options: Clear buttons with full-width tap targets
- Correct: Green background with fireworks overlay
- Incorrect: Red flash, then show correct answer highlighted
- Score: Top-right corner, updates in real-time

### 3. Flashcard Mode

**Purpose:** Traditional flashcard review with flip animation in both directions.

#### User Flow
1. Select day/section or random mode
2. Choose direction: Japanese→English, English→Japanese, or Both (random)
3. View card front
4. Click/tap to flip and reveal back
5. Navigate: Previous, Next buttons or swipe gestures
6. Optional: Mark as "Got it" vs "Need Review"

#### Technical Implementation

**Flip Animation**
```typescript
// CSS 3D transform approach
.flashcard-container {
  perspective: 1000px;
}

.flashcard-inner {
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard-inner.flipped {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  backface-visibility: hidden;
}

.flashcard-back {
  transform: rotateY(180deg);
}
```

**Swipe Gestures** (Touch Devices)
- Swipe left: Previous card
- Swipe right: Next card
- Tap card: Flip
- Threshold: 50px horizontal movement

**Visual Design**
- Card: Large, centered with subtle shadow
- Text: Very large (text-5xl) for readability
- Indicator: Small text showing "Japanese" or "English" side
- Navigation: Left/right arrows at bottom
- Progress: Card X of Y total

### 4. Word Management

**Purpose:** Add, edit, and organize vocabulary/sentences.

#### Features

**Add Single Word**
```typescript
interface AddWordForm {
  japanese: string;
  romanji: string;
  english: string;
  day: number;
  type: 'word' | 'sentence';
}
```

**Add Multiple Words (Bulk Import)**
- CSV/TSV paste
- JSON upload
- Format: japanese,romanji,english,day,type

**Edit Word**
- Inline editing in list view
- Modal form for detailed edits
- Validation: Ensure no empty fields

**Delete Word**
- Confirmation modal
- Option to undo (keep in memory for 5 seconds)

**Organize by Day**
- Visual grouping by day number
- Collapsible sections
- Move words between days (drag-and-drop on desktop)

**Visual Design**
- List view: Scrollable with day separators
- Each item: Japanese (large), English (medium), Romanji (small, muted)
- Actions: Edit icon, Delete icon (right side)
- Add button: Floating action button (FAB) bottom-right

### 5. Data Import/Export

**Purpose:** Enable cross-device synchronization and backup.

#### Import Flow
1. Click "Import Data" in settings
2. File picker or drag-and-drop zone
3. Validate JSON structure and version
4. Option: Merge with existing data or Replace all data
5. Confirmation: "X words imported successfully"
6. Redirect to dashboard

#### Export Flow
1. Click "Export Data" in settings
2. Generate JSON file with timestamp
3. Trigger browser download: `jp-learn-export-2025-10-03.json`
4. Success message: "Data exported successfully"

#### Data Validation
```typescript
function validateImportData(data: unknown): data is ExportData {
  // Check version compatibility
  // Validate Word[] structure
  // Ensure no malformed dates
  // Check for required fields
  // Return validation errors to user
}
```

#### Conflict Resolution
- If importing data with same word IDs: Use most recent `lastReviewed` date
- Merge progress statistics (sum scores, keep higher mastery counts)
- Settings: Prefer imported settings with user confirmation

---

## Performance Optimization

### Code Splitting
```typescript
// Lazy load mode components
const AlphabetMode = lazy(() => import('./pages/AlphabetMode'));
const SentenceMode = lazy(() => import('./pages/SentenceMode'));
const FlashcardMode = lazy(() => import('./pages/FlashcardMode'));
const ManageWords = lazy(() => import('./pages/ManageWords'));
```

### Memoization Strategy
```typescript
// Expensive computations cached
const filteredWords = useMemo(
  () => words.filter(w => w.day === selectedDay),
  [words, selectedDay]
);

// Prevent unnecessary re-renders
const MemoizedWordItem = memo(WordItem);
```

### Virtual Scrolling (Future Enhancement)
- For word lists exceeding 100 items
- Library: `react-window` or `react-virtual`

### Asset Optimization
- Image formats: WebP with PNG fallback
- Font subsetting: Only include Japanese glyphs needed
- Icon sprites: SVG sprite sheet or icon font

---

## Security & Privacy

### Data Security
- **No server-side storage**: All data stays on device
- **No authentication**: No user accounts or passwords
- **No telemetry**: No analytics or tracking
- **LocalStorage only**: Not accessible by other origins (same-origin policy)

### Privacy Considerations
- **No PII collected**: Application doesn't know who you are
- **No network requests**: Except CDN for initial load
- **Offline-first**: Works completely without internet after install
- **User control**: Full data export/delete capabilities

### Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               style-src 'self' 'unsafe-inline'; 
               script-src 'self'; 
               img-src 'self' data:; 
               font-src 'self' data:;">
```

---

## Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- All interactive elements: Tab-accessible
- Quiz modes: Arrow keys for navigation
- Flashcards: Space to flip, arrows to navigate
- Escape key: Close modals

### Screen Reader Support
- Semantic HTML5 elements
- ARIA labels for interactive components
- Announced state changes (score updates, correct/incorrect)
- Skip navigation links

### Visual Accessibility
- Color contrast: Minimum 4.5:1 for text
- Focus indicators: Visible on all interactive elements
- Text sizing: Respects browser zoom (up to 200%)
- No essential information conveyed by color alone

### Motion Preferences
```typescript
// Respect prefers-reduced-motion
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Disable animations if user prefers
if (prefersReducedMotion) {
  // Skip fireworks, use simple checkmark
  // Disable flashcard flip, use fade
  // Reduce transition durations
}
```

---

## Browser Compatibility

### Target Browsers
- **Chrome/Edge:** 100+ (Chromium)
- **Firefox:** 100+
- **Safari:** 15+ (iOS 15+)
- **Samsung Internet:** 18+

### Required Features
- ES2020 JavaScript features
- CSS Grid and Flexbox
- LocalStorage API
- Service Workers (PWA)
- CSS Custom Properties
- Touch Events API

### Polyfills & Fallbacks
- None required for target browsers
- Graceful degradation if service worker unavailable

---

## Development Environment Setup

### Prerequisites
```bash
Node.js: 18.x or 20.x LTS
npm: 9.x+ or yarn: 1.22.x+
Git: 2.x+
```

### Project Structure
```
japanese-learning-pwa/
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── common/        # Reusable UI components
│   │   ├── alphabet/      # Alphabet mode components
│   │   ├── sentence/      # Sentence mode components
│   │   ├── flashcard/     # Flashcard mode components
│   │   └── manage/        # Word management components
│   │
│   ├── contexts/
│   │   ├── WordContext.tsx
│   │   ├── ThemeContext.tsx
│   │   └── ProgressContext.tsx
│   │
│   ├── hooks/
│   │   ├── useLocalStorage.ts
│   │   ├── useWordSelection.ts
│   │   ├── useQuizGenerator.ts
│   │   └── useKeyboardShortcuts.ts
│   │
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── AlphabetMode.tsx
│   │   ├── SentenceMode.tsx
│   │   ├── FlashcardMode.tsx
│   │   ├── ManageWords.tsx
│   │   └── Settings.tsx
│   │
│   ├── utils/
│   │   ├── storage.ts         # LocalStorage helpers
│   │   ├── validation.ts      # Data validation
│   │   ├── japanese.ts        # Japanese text utilities
│   │   └── constants.ts       # App constants
│   │
│   ├── types/
│   │   ├── word.ts
│   │   ├── progress.ts
│   │   └── settings.ts
│   │
│   ├── styles/
│   │   ├── globals.css        # Tailwind imports
│   │   └── themes.css         # Theme variables
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── planning/                   # This directory
│   ├── design.md
│   ├── plan.md
│   ├── tasks.md
│   ├── progress.md
│   ├── goals.md
│   ├── CODE_HELP.md
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   ├── DEPLOYMENT.md
│   └── CLAUDE.md
│
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

### Configuration Files

**vite.config.ts**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'fonts/*.woff2'],
      manifest: {
        name: 'Japanese Learning PWA',
        short_name: 'JP Learn',
        description: 'Learn Japanese characters and sentences',
        theme_color: '#7986cb',
        background_color: '#0f0f1a',
        display: 'standalone',
        orientation: 'any',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
  },
});
```

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode palette
        'bg-primary-dark': '#0f0f1a',
        'bg-secondary-dark': '#1a1a2e',
        'bg-tertiary-dark': '#25253d',
        
        // Light mode palette
        'bg-primary-light': '#fafafa',
        'bg-secondary-light': '#ffffff',
        'bg-tertiary-light': '#f0f0f5',
        
        // Japanese accents
        'sakura': '#ffc0d3',
        'matcha': '#b8d4a8',
        'indigo': '#7986cb',
        'gold': '#e8c547',
      },
      fontFamily: {
        japanese: ['"Noto Sans JP"', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
```

---

## Testing Strategy

### Unit Testing
- **Framework:** Vitest
- **Coverage target:** 80% for business logic
- **Focus areas:**
  - Word filtering and selection algorithms
  - Quiz distractor generation
  - Data validation and import/export
  - LocalStorage utilities

### Component Testing
- **Framework:** React Testing Library
- **Coverage target:** 70% for components
- **Focus areas:**
  - User interactions (clicks, keyboard)
  - State changes and context updates
  - Form validation and submissions

### End-to-End Testing
- **Framework:** Playwright (optional for MVP)
- **Critical paths:**
  - Add word → Study in alphabet mode → Mark as mastered
  - Import data → Take sentence quiz → Export data
  - Toggle theme → Persist across page reload

### Manual Testing Checklist
- [ ] Install as PWA on Android device
- [ ] Install as PWA on iOS device
- [ ] Offline functionality (airplane mode)
- [ ] Dark/light mode toggle
- [ ] Import/export data cycle
- [ ] All three study modes (alphabet, sentence, flashcard)
- [ ] Touch gestures (flashcard swipe)
- [ ] Keyboard navigation
- [ ] Screen reader compatibility (VoiceOver/TalkBack)

---

## Deployment Strategy

### Static Hosting Options
1. **GitHub Pages** (Free, simple)
2. **Netlify** (Free tier, automatic SSL, form handling)
3. **Vercel** (Free tier, optimized for React)
4. **Your tiny server** (Self-hosted, full control)

### Build Process
```bash
# Development
npm run dev

# Production build
npm run build
# Outputs to /dist directory

# Preview production build locally
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint
```

### PWA Deployment Checklist
- [ ] HTTPS enabled (required for service workers)
- [ ] manifest.json served with correct MIME type
- [ ] Icons in multiple sizes (192px, 512px minimum)
- [ ] Service worker registered successfully
- [ ] Lighthouse PWA score: 90+ (installability, offline support)
- [ ] Test install prompt on mobile devices
- [ ] Verify offline functionality after install

### Self-Hosting on Your Tiny Server
```nginx
# Nginx configuration example
server {
    listen 80;
    server_name jp-learn.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name jp-learn.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    root /var/www/japanese-learning-pwa/dist;
    index index.html;
    
    # SPA routing: Serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

---

## Maintenance & Updates

### Versioning Strategy
- Semantic versioning: v1.0.0
- Major: Breaking data format changes
- Minor: New features (non-breaking)
- Patch: Bug fixes

### Service Worker Update Flow
1. New version deployed
2. Service worker detects update
3. User notification: "New version available"
4. User clicks "Update" → Reload page
5. New assets cached, old cache cleared

### Data Migration
```typescript
// Future data format changes
interface MigrationStrategy {
  fromVersion: string;
  toVersion: string;
  migrate: (oldData: any) => ExportData;
}

const migrations: MigrationStrategy[] = [
  // Example: v1.0 to v1.1
  {
    fromVersion: '1.0',
    toVersion: '1.1',
    migrate: (oldData) => {
      // Add new field, transform data, etc.
      return transformedData;
    },
  },
];
```

---

## Future Enhancements (Post-MVP)

### Phase 2 Features
- Spaced repetition algorithm (SRS) for optimal review timing
- Audio pronunciation (text-to-speech API)
- Handwriting recognition for character practice
- Grammar explanations and example sentences
- Community-shared word packs

### Phase 3 Features
- Multiplayer quiz competitions
- Leaderboards and achievements
- Custom themes and UI personalization
- Advanced analytics dashboard
- Integration with Japanese dictionary APIs

### Technical Debt Considerations
- Migrate to IndexedDB if LocalStorage limits reached
- Implement proper state management (Zustand/Redux) if complexity grows
- Add backend API for cloud sync (optional)
- Comprehensive unit test suite (if not completed in MVP)

---

## Conclusion

This design document provides a comprehensive technical blueprint for building the Japanese Learning PWA. The architecture prioritizes:

1. **Simplicity** - Minimal dependencies, straightforward React patterns
2. **Offline-first** - Complete functionality without network
3. **Mobile-optimized** - Touch-friendly, installable PWA
4. **User control** - Full data ownership and portability
5. **Aesthetic harmony** - Traditional Japanese meets modern minimalism

The design balances feature completeness with implementation simplicity, ensuring the MVP is achievable within the estimated 3-week timeline for an experienced developer.

**Next Steps:**
1. Review this design document for approval
2. Proceed to plan.md for detailed development phases
3. Reference tasks.md for granular implementation checklist
4. Use CODE_HELP.md for technical implementation guidance

---

**Document Version:** 1.0  
**Last Updated:** October 3, 2025  
**Status:** Approved for Development
