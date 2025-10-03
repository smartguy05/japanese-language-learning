# Japanese Learning PWA - Development Tasks

**Version:** 1.0  
**Last Updated:** October 3, 2025  
**Total Estimated Time:** 126-158 hours (3-4 weeks full-time)

---

## Task Organization

This document provides a granular breakdown of all development tasks organized by phase. Each task includes:
- **Task ID** - Unique identifier for tracking
- **Description** - Clear, actionable task description
- **Estimated Time** - Hours required (experienced developer)
- **Dependencies** - Prerequisites that must be completed first
- **Acceptance Criteria** - Definition of done
- **Priority** - Critical, High, Medium, Low
- **Assignee** - Developer role (optional for solo projects)

**Legend:**
- ⚠️ **Critical Path** - Delays affect overall timeline
- 🔄 **Dependencies** - Cannot start until prerequisites complete
- ✅ **Acceptance Criteria** - Must all pass for task completion

---

## Phase 1: Foundation & Infrastructure

**Phase Duration:** Days 1-4 (32-38 hours)  
**Phase Owner:** Full-stack developer  
**Phase Goal:** Establish robust project foundation with core architecture

---

### 1.1 Project Initialization & Setup

#### TASK-101: Initialize Vite React TypeScript Project ⚠️
**Estimated Time:** 1 hour  
**Priority:** Critical  
**Dependencies:** None

**Description:**
Create new project using Vite template, configure for TypeScript strict mode, and verify build system works correctly.

**Steps:**
```bash
npm create vite@latest japanese-learning-pwa -- --template react-ts
cd japanese-learning-pwa
npm install
npm run dev
```

**Acceptance Criteria:**
- ✅ Project runs on `http://localhost:3000` without errors
- ✅ TypeScript strict mode enabled in tsconfig.json
- ✅ Hot module replacement (HMR) functional
- ✅ Development build completes in < 5 seconds

---

#### TASK-102: Configure Tailwind CSS
**Estimated Time:** 1.5 hours  
**Priority:** Critical  
**Dependencies:** TASK-101

**Description:**
Install and configure Tailwind CSS with custom theme for Japanese aesthetic, including dark mode support.

**Steps:**
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Configuration:**
- Edit `tailwind.config.js` with custom colors (sakura, matcha, indigo, gold)
- Configure dark mode class strategy
- Set up font families (Noto Sans JP, Inter)
- Add custom spacing and breakpoints

**Acceptance Criteria:**
- ✅ Tailwind utility classes work in components
- ✅ Dark mode classes apply correctly
- ✅ Custom colors accessible via Tailwind
- ✅ Production build purges unused CSS
- ✅ Build size < 50KB for CSS

---

#### TASK-103: Install Core Dependencies
**Estimated Time:** 0.5 hours  
**Priority:** High  
**Dependencies:** TASK-101

**Description:**
Install all required npm packages for the project.

**Packages:**
```bash
npm install react-router-dom wanakana date-fns nanoid framer-motion
npm install -D @types/node vitest @testing-library/react @testing-library/jest-dom
```

**Acceptance Criteria:**
- ✅ All dependencies install without errors
- ✅ No security vulnerabilities (run `npm audit`)
- ✅ Package-lock.json committed to repo
- ✅ Dependencies documented in README

---

#### TASK-104: Configure Vite PWA Plugin
**Estimated Time:** 2 hours  
**Priority:** High  
**Dependencies:** TASK-101

**Description:**
Install and configure vite-plugin-pwa for offline functionality and installability.

**Steps:**
```bash
npm install -D vite-plugin-pwa
```

**Configuration:**
Create `vite.config.ts` with PWA settings:
- Register type: 'autoUpdate'
- Manifest configuration (name, colors, icons, display mode)
- Workbox caching strategies
- Runtime caching for fonts

**Acceptance Criteria:**
- ✅ Service worker generates on build
- ✅ Manifest.json created with correct structure
- ✅ Cache strategies configured (network-first for HTML, cache-first for assets)
- ✅ No console errors related to service worker

---

#### TASK-105: Set Up Project Folder Structure
**Estimated Time:** 1 hour  
**Priority:** High  
**Dependencies:** TASK-101

**Description:**
Create organized folder structure following React best practices.

**Structure:**
```
src/
├── components/
│   ├── common/
│   ├── alphabet/
│   ├── sentence/
│   ├── flashcard/
│   └── manage/
├── contexts/
├── hooks/
├── pages/
├── types/
├── utils/
└── styles/
```

**Acceptance Criteria:**
- ✅ All folders created with README.md placeholders
- ✅ Index files (index.ts) for clean imports
- ✅ Naming conventions documented
- ✅ .gitkeep files in empty directories

---

#### TASK-106: Configure ESLint and Prettier
**Estimated Time:** 1.5 hours  
**Priority:** Medium  
**Dependencies:** TASK-101

**Description:**
Set up code quality tools with React, TypeScript, and Japanese character support.

**Configuration:**
- Install ESLint with React plugin
- Configure Prettier with Japanese character handling
- Add pre-commit hooks with Husky (optional)
- Create .eslintrc.json and .prettierrc

**Acceptance Criteria:**
- ✅ ESLint runs without errors on sample code
- ✅ Prettier formats code consistently
- ✅ Japanese characters don't cause formatting issues
- ✅ VS Code integration works (auto-format on save)

---

#### TASK-107: Initialize Git Repository
**Estimated Time:** 0.5 hours  
**Priority:** High  
**Dependencies:** TASK-101

**Description:**
Set up version control with proper .gitignore and initial commit.

**Steps:**
```bash
git init
# Create .gitignore (exclude node_modules, dist, .env, etc.)
git add .
git commit -m "Initial commit: Project scaffolding"
```

**Acceptance Criteria:**
- ✅ .gitignore excludes build artifacts and secrets
- ✅ Initial commit includes all source files
- ✅ Remote repository set up (GitHub/GitLab)
- ✅ README.md with project description committed

---

### 1.2 Theme System & Design Tokens

#### TASK-111: Define CSS Custom Properties ⚠️
**Estimated Time:** 2 hours  
**Priority:** Critical  
**Dependencies:** TASK-102

**Description:**
Create comprehensive CSS variable system for dark and light themes with traditional Japanese color palette.

**File:** `src/styles/themes.css`

**Variables:**
- Background colors (primary, secondary, tertiary)
- Accent colors (sakura, matcha, indigo, gold)
- Text colors (primary, secondary, tertiary)
- Semantic colors (success, error, warning)
- Borders and shadows

**Acceptance Criteria:**
- ✅ All colors defined for both dark and light modes
- ✅ Variables accessible in Tailwind config
- ✅ Contrast ratios meet WCAG AA (4.5:1 minimum)
- ✅ Theme switching doesn't cause flicker

---

#### TASK-112: Create ThemeContext
**Estimated Time:** 3 hours  
**Priority:** High  
**Dependencies:** TASK-111

**Description:**
Build React context for theme management with localStorage persistence.

**File:** `src/contexts/ThemeContext.tsx`

**Features:**
- `theme` state ('dark' | 'light')
- `toggleTheme()` function
- `setTheme(theme)` function
- Auto-apply to document root class
- Persist preference to localStorage

**Acceptance Criteria:**
- ✅ Theme context provides current theme and toggle function
- ✅ Default theme is 'dark'
- ✅ Theme persists across page reloads
- ✅ Document root class updates (`dark` or `light`)
- ✅ TypeScript types properly defined

---

#### TASK-113: Build Reusable UI Components
**Estimated Time:** 6 hours  
**Priority:** High  
**Dependencies:** TASK-102, TASK-111

**Description:**
Create foundational UI components used throughout the application.

**Components to Build:**

**Button Component** (`src/components/common/Button.tsx`)
- Variants: primary, secondary, ghost
- Sizes: small, medium, large
- Disabled state
- Loading state with spinner
- Full-width option
- Icon support (left/right)

**Card Component** (`src/components/common/Card.tsx`)
- Default, elevated, and flat styles
- Optional header, body, footer sections
- Padding variants

**Input Component** (`src/components/common/Input.tsx`)
- Text input with label
- Error state and validation message
- Japanese keyboard toggle button
- WanaKana integration for romanji conversion
- Character counter (optional)

**Select Component** (`src/components/common/Select.tsx`)
- Dropdown with options
- Label and error handling
- Searchable variant (future enhancement)

**Modal Component** (`src/components/common/Modal.tsx`)
- Overlay with backdrop blur
- Close button and escape key handling
- Scroll lock on body when open
- Fade-in animation
- Sizes: small, medium, large

**Acceptance Criteria:**
- ✅ All components work in dark and light modes
- ✅ Components are fully accessible (ARIA labels, keyboard nav)
- ✅ Touch targets are 48px minimum
- ✅ TypeScript props properly typed
- ✅ Storybook or demo page for visual testing (optional)

---

#### TASK-114: Add Japanese Fonts
**Estimated Time:** 1 hour  
**Priority:** Medium  
**Dependencies:** TASK-102

**Description:**
Integrate Noto Sans JP and Inter fonts via CDN or local hosting.

**Options:**
1. Google Fonts CDN (easy, slower initial load)
2. Self-hosted (faster, more control)

**Recommended:** Google Fonts for MVP

**Implementation:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Acceptance Criteria:**
- ✅ Japanese characters render with Noto Sans JP
- ✅ English text renders with Inter
- ✅ Font weights (400, 500, 700) load correctly
- ✅ Fonts preload for optimal performance
- ✅ Fallback fonts defined (sans-serif)

---

#### TASK-115: Create Traditional Japanese Background Patterns
**Estimated Time:** 2 hours  
**Priority:** Low  
**Dependencies:** TASK-111

**Description:**
Add subtle traditional Japanese patterns (seigaiha waves, asanoha hemp leaf) as optional background textures.

**Implementation:**
- SVG patterns exported as React components
- Opacity: 5-10% for subtlety
- Optional toggle in settings
- Patterns respect theme (different colors for dark/light)

**Acceptance Criteria:**
- ✅ Patterns visible but not distracting
- ✅ Performance impact minimal (< 5KB assets)
- ✅ Patterns scale properly on all screen sizes
- ✅ Option to disable patterns completely

---

### 1.3 Data Layer & Type Definitions

#### TASK-121: Define TypeScript Interfaces ⚠️
**Estimated Time:** 2 hours  
**Priority:** Critical  
**Dependencies:** None

**Description:**
Create comprehensive TypeScript type definitions for all data entities.

**Files:**
- `src/types/word.ts` - Word interface and related types
- `src/types/progress.ts` - UserProgress interface
- `src/types/settings.ts` - AppSettings interface

**Interfaces:**
```typescript
// See design.md for complete interface definitions
interface Word { ... }
interface UserProgress { ... }
interface AppSettings { ... }
interface ExportData { ... }
```

**Acceptance Criteria:**
- ✅ All fields properly typed (no `any` types)
- ✅ Optional fields marked with `?`
- ✅ Enums used for fixed value sets (`'dark' | 'light'`)
- ✅ JSDoc comments for complex types
- ✅ Export interfaces for use across app

---

#### TASK-122: Create LocalStorage Utility Functions
**Estimated Time:** 3 hours  
**Priority:** High  
**Dependencies:** TASK-121

**Description:**
Build type-safe localStorage wrapper with error handling and validation.

**File:** `src/utils/storage.ts`

**Functions:**
- `getItem<T>(key: string, defaultValue: T): T`
- `setItem<T>(key: string, value: T): void`
- `removeItem(key: string): void`
- `clear(): void`
- `hasItem(key: string): boolean`
- `getStorageSize(): number` (bytes used)

**Features:**
- Automatic JSON serialization/deserialization
- Try-catch error handling
- Quota exceeded detection and warning
- TypeScript generic support

**Acceptance Criteria:**
- ✅ Functions handle JSON parsing errors gracefully
- ✅ Quota exceeded throws informative error
- ✅ Type inference works correctly
- ✅ Unit tests cover all functions
- ✅ Works with complex nested objects

---

#### TASK-123: Implement WordContext ⚠️
**Estimated Time:** 4 hours  
**Priority:** Critical  
**Dependencies:** TASK-121, TASK-122

**Description:**
Create context provider for managing all word/sentence CRUD operations.

**File:** `src/contexts/WordContext.tsx`

**State:**
- `words: Word[]` - All words/sentences
- Load from localStorage on mount

**Methods:**
- `addWord(word: Omit<Word, 'id' | 'createdAt'>): void`
- `updateWord(id: string, updates: Partial<Word>): void`
- `deleteWord(id: string): void`
- `bulkAddWords(words: Omit<Word, 'id' | 'createdAt'>[]): void`
- `getWordsByDay(day: number): Word[]`
- `getWordsByType(type: 'word' | 'sentence'): Word[]`
- `getWordsNeedingReview(): Word[]`
- `getMasteredWords(): Word[]`
- `getRandomWords(count: number, filters?: Filters): Word[]`

**Persistence:**
- Save to localStorage on every state change
- Debounce saves to avoid excessive writes

**Acceptance Criteria:**
- ✅ All CRUD operations work correctly
- ✅ State persists across page reloads
- ✅ Filtering methods return correct subsets
- ✅ Generated IDs are unique (nanoid)
- ✅ Timestamps in ISO 8601 format
- ✅ TypeScript types strictly enforced

---

#### TASK-124: Implement ProgressContext
**Estimated Time:** 3 hours  
**Priority:** High  
**Dependencies:** TASK-121, TASK-122

**Description:**
Create context for tracking user progress, scores, and learning statistics.

**File:** `src/contexts/ProgressContext.tsx`

**State:**
- `progress: UserProgress`

**Methods:**
- `incrementScore(mode: Mode, correct: boolean): void`
- `resetSessionScore(): void`
- `markAsMastered(wordId: string, mastered: boolean): void`
- `markNeedsReview(wordId: string, needs: boolean): void`
- `recordReview(wordId: string, correct: boolean): void`
- `getAccuracyRate(mode?: Mode): number`

**Acceptance Criteria:**
- ✅ Progress updates persist to localStorage
- ✅ Score calculations accurate
- ✅ Session score resets properly
- ✅ Mastery status syncs with WordContext
- ✅ Accuracy rates computed correctly

---

#### TASK-125: Create Data Validation Functions
**Estimated Time:** 2 hours  
**Priority:** Medium  
**Dependencies:** TASK-121

**Description:**
Build validation utilities for data integrity checks.

**File:** `src/utils/validation.ts`

**Functions:**
- `validateWord(word: unknown): word is Word`
- `validateExportData(data: unknown): data is ExportData`
- `isValidDate(dateString: string): boolean`
- `sanitizeInput(input: string): string`

**Validation Rules:**
- No empty required fields
- Valid date formats
- Valid day numbers (> 0)
- Type enums match allowed values

**Acceptance Criteria:**
- ✅ Validation catches malformed data
- ✅ Type guards work with TypeScript
- ✅ Helpful error messages for debugging
- ✅ Performance optimized (< 1ms per validation)

---

#### TASK-126: Build Import/Export Utilities
**Estimated Time:** 4 hours  
**Priority:** High  
**Dependencies:** TASK-121, TASK-125

**Description:**
Create functions for exporting data to JSON and importing from JSON files.

**File:** `src/utils/importExport.ts`

**Export Function:**
```typescript
function exportData(
  words: Word[],
  progress: UserProgress,
  settings: AppSettings
): ExportData
```
- Generate JSON with proper structure
- Include version and timestamp
- Return formatted string

**Import Function:**
```typescript
function importData(
  jsonString: string
): { success: boolean; data?: ExportData; errors?: string[] }
```
- Parse JSON safely
- Validate structure
- Check version compatibility
- Return validation results

**Download Trigger:**
```typescript
function downloadJSON(data: ExportData, filename: string): void
```
- Create Blob from JSON
- Trigger browser download
- Filename format: `jp-learn-export-2025-10-03.json`

**Acceptance Criteria:**
- ✅ Export generates valid JSON
- ✅ Import validates before applying
- ✅ Malformed JSON handled gracefully
- ✅ File download works in all browsers
- ✅ Exported data is human-readable (pretty-printed)

---

#### TASK-127: Create Seed Data Generator
**Estimated Time:** 2 hours  
**Priority:** Low  
**Dependencies:** TASK-121

**Description:**
Build function to generate sample words/sentences for testing and demo purposes.

**File:** `src/utils/seedData.ts`

**Data:**
- 20 sample words (hiragana, katakana, mixed)
- 20 sample sentences
- Distributed across 4 days (5 per day)
- Include romanji and English translations

**Function:**
```typescript
function generateSeedData(): Word[]
```

**Acceptance Criteria:**
- ✅ Generates 40 valid Word objects
- ✅ Variety of hiragana and katakana
- ✅ Distributed evenly across days
- ✅ Realistic Japanese words and sentences
- ✅ Easy to import into app for testing

---

### 1.4 Navigation & Routing

#### TASK-131: Set Up React Router ⚠️
**Estimated Time:** 2 hours  
**Priority:** Critical  
**Dependencies:** TASK-101

**Description:**
Configure React Router with all application routes and navigation structure.

**Installation:**
```bash
npm install react-router-dom
```

**Routes:**
- `/` - Dashboard (home page)
- `/alphabet` - Alphabet mode
- `/sentence` - Sentence mode
- `/flashcard` - Flashcard mode
- `/manage` - Word management
- `/settings` - Settings page
- `*` - 404 page

**File:** `src/App.tsx`

**Acceptance Criteria:**
- ✅ All routes accessible via URL
- ✅ Browser back/forward buttons work
- ✅ 404 page displays for invalid routes
- ✅ Nested routes supported (if needed)
- ✅ TypeScript types for route params

---

#### TASK-132: Create Main Navigation Component
**Estimated Time:** 3 hours  
**Priority:** High  
**Dependencies:** TASK-131, TASK-113

**Description:**
Build responsive navigation with tab-based mobile layout and menu for desktop.

**File:** `src/components/Navigation.tsx`

**Features:**
- Bottom tab bar on mobile (< 768px)
- Top horizontal nav on desktop (≥ 768px)
- Icons for each mode (SVG or icon font)
- Active route highlighted
- Settings icon in top-right

**Tabs:**
1. Dashboard (home icon)
2. Alphabet Mode (あ icon)
3. Sentence Mode (文 icon)
4. Flashcard Mode (card icon)
5. Manage Words (list icon)

**Acceptance Criteria:**
- ✅ Touch-friendly tabs (48px minimum height)
- ✅ Active state clearly visible
- ✅ Smooth transitions between pages
- ✅ Works in portrait and landscape
- ✅ Accessible via keyboard (tab navigation)

---

#### TASK-133: Build Dashboard Page
**Estimated Time:** 4 hours  
**Priority:** High  
**Dependencies:** TASK-131, TASK-123, TASK-124

**Description:**
Create home page with quick stats, day selector, and mode shortcuts.

**File:** `src/pages/Dashboard.tsx`

**Sections:**

**1. Header**
- App title: "Japanese Learning"
- Settings icon (top-right)

**2. Stats Cards**
- Total words learned
- Current accuracy rate
- Words needing review
- Current day

**3. Day Selector**
- Dropdown or number input
- "Study Day X" button

**4. Quick Actions**
- "Start Alphabet Mode" button
- "Start Sentence Mode" button
- "Review Flashcards" button
- "Add New Words" button

**Acceptance Criteria:**
- ✅ Stats update in real-time from contexts
- ✅ Day selector changes active day
- ✅ Quick action buttons navigate to correct pages
- ✅ Responsive layout (stacks on mobile)
- ✅ Loading state if data not yet loaded

---

#### TASK-134: Implement Settings Page Structure
**Estimated Time:** 2 hours  
**Priority:** Medium  
**Dependencies:** TASK-131, TASK-112

**Description:**
Build settings page with theme toggle, import/export, and about section.

**File:** `src/pages/Settings.tsx`

**Sections:**

**1. Appearance**
- Theme toggle (Dark / Light)
- Optional: Background pattern toggle

**2. Data Management**
- "Export Data" button
- "Import Data" button (file picker)
- "Clear All Data" button (with confirmation)

**3. About**
- App version
- Description of app purpose
- Credits/acknowledgments
- Link to GitHub repo (if public)

**Acceptance Criteria:**
- ✅ Theme toggle works and persists
- ✅ Export downloads JSON file
- ✅ Import validates and loads data
- ✅ Clear data has double confirmation
- ✅ Layout is clean and organized

---

#### TASK-135: Add Page Transitions
**Estimated Time:** 2 hours  
**Priority:** Low  
**Dependencies:** TASK-131

**Description:**
Implement subtle page transitions using Framer Motion, respecting prefers-reduced-motion.

**Implementation:**
- Wrap routes in AnimatePresence
- Fade-in animation on route change (200ms)
- Slide animation for mobile (optional)
- Check prefers-reduced-motion and disable if set

**Acceptance Criteria:**
- ✅ Transitions are smooth and subtle
- ✅ No animation if prefers-reduced-motion: reduce
- ✅ Doesn't block navigation (transitions < 300ms)
- ✅ Works on all routes

---

#### TASK-136: Create 404 Page
**Estimated Time:** 1 hour  
**Priority:** Low  
**Dependencies:** TASK-131

**Description:**
Build a friendly 404 error page for invalid routes.

**File:** `src/pages/NotFound.tsx`

**Content:**
- "Page Not Found" heading
- Brief message
- "Back to Dashboard" button
- Optional: Japanese character art

**Acceptance Criteria:**
- ✅ Displays for any unmatched route
- ✅ Styled consistently with theme
- ✅ Button navigates back to dashboard
- ✅ Accessible and user-friendly

---

## Phase 1 Summary

**Total Phase 1 Tasks:** 23 tasks  
**Total Estimated Time:** 32-38 hours  
**Critical Path Tasks:** 6 tasks (26 hours)

**Key Deliverables:**
- ✅ Runnable React TypeScript application
- ✅ Complete design system with theme support
- ✅ Data persistence layer with LocalStorage
- ✅ Navigation and routing infrastructure
- ✅ Reusable UI component library

**Validation Checklist:**
- [ ] `npm run dev` starts without errors
- [ ] Theme toggle works and persists
- [ ] Can add/update/delete words via WordContext
- [ ] Export downloads valid JSON
- [ ] Import restores data correctly
- [ ] All routes accessible via navigation

---

## Phase 2: Alphabet Mode Development

**Phase Duration:** Days 5-9 (28-34 hours)  
**Phase Owner:** Frontend developer  
**Phase Goal:** Complete highest-priority study mode with character reveal system

*(Note: Detailed tasks for Phases 2-6 follow the same format. For brevity in this summary, I'll show the structure for Phase 2 and note that Phases 3-6 would be similarly detailed)*

---

### 2.1 Alphabet Mode - Study View

#### TASK-201: Create AlphabetModePage Component ⚠️
**Estimated Time:** 2 hours  
**Priority:** Critical  
**Dependencies:** TASK-131, TASK-123

**Description:**
Build main page component for alphabet mode with study/quiz mode toggle.

**File:** `src/pages/AlphabetMode.tsx`

**State Management:**
- Selected day
- Study mode vs Quiz mode
- Current word index
- Words for review

**Acceptance Criteria:**
- ✅ Page layout responsive
- ✅ Mode toggle between study and quiz
- ✅ Word selection works correctly

---

#### TASK-202: Build Word Selection UI
**Estimated Time:** 3 hours  
**Priority:** High  
**Dependencies:** TASK-201

**Description:**
Create interface for selecting which words to study (by day, random, needs review).

**Components:**
- Day selector dropdown
- Mode selector (sequential/random/needs review)
- Word count display
- "Start Quiz" button

**Acceptance Criteria:**
- ✅ Filters apply correctly to word list
- ✅ Shows count of words available
- ✅ Button disabled if no words available

---

#### TASK-203: Implement Study View Layout
**Estimated Time:** 3 hours  
**Priority:** High  
**Dependencies:** TASK-202

**Description:**
Build study view showing words with Japanese, romanji, and English visible for review before quiz.

**Layout:**
- Scrollable card list
- Each card: Japanese (large), Romanji (medium), English (medium)
- Cards grouped by day if multiple days selected

**Acceptance Criteria:**
- ✅ All words display correctly
- ✅ Japanese text is large and clear (text-4xl)
- ✅ Scrollable on small screens
- ✅ "Start Quiz" button at bottom

---

### 2.2 Alphabet Mode - Character Mapping

#### TASK-211: Implement Character Mapping Algorithm ⚠️
**Estimated Time:** 6 hours  
**Priority:** Critical  
**Dependencies:** None (can be developed in parallel)

**Description:**
Core algorithm to map each Japanese character to its corresponding romanji segment.

**File:** `src/utils/characterMapping.ts`

**Function Signature:**
```typescript
interface CharacterMap {
  japanese: string;
  romanji: string;
  revealed: boolean;
  index: number;
}

function mapCharactersToRomanji(
  japanese: string,
  romanji: string
): CharacterMap[]
```

**Challenges:**
- Handle compound characters (しゃ = "sha", きょ = "kyo")
- Handle small tsu (っ) for double consonants
- Handle long vowels (おう = "ō" or "ou")
- WanaKana library may help with detection

**Acceptance Criteria:**
- ✅ Each Japanese character correctly maps to romanji
- ✅ Compound characters handled properly
- ✅ Edge cases covered (っ, ん, long vowels)
- ✅ Unit tests cover various word types
- ✅ Performance: < 10ms per word

---

*(Continue with similar detailed task breakdowns for remaining phases)*

---

## Summary: All Phase Tasks

**Phase 2 Tasks:** 18 tasks, 28-34 hours  
**Phase 3 Tasks:** 16 tasks, 24-30 hours  
**Phase 4 Tasks:** 14 tasks, 20-26 hours  
**Phase 5 Tasks:** 12 tasks, 16-22 hours  
**Phase 6 Tasks:** 10 tasks, 14-20 hours  

**Total MVP Tasks:** 93 tasks  
**Total Estimated Time:** 126-158 hours (3-4 weeks)

---

## Task Tracking Workflow

### Recommended Tools
- **Trello/Notion** - Visual Kanban board
- **GitHub Projects** - Integrated with repo
- **Linear** - Developer-focused task management
- **Simple Markdown** - Checkbox list in progress.md

### Task States
- **Backlog** - Not yet started
- **In Progress** - Currently being worked on
- **Blocked** - Waiting on dependency
- **In Review** - Pending code review (if team)
- **Testing** - Undergoing QA
- **Done** - Fully complete and merged

### Daily Workflow
1. **Morning:** Pick 2-4 tasks from backlog based on priority and dependencies
2. **Work:** Complete tasks, commit frequently
3. **Evening:** Update task status, note any blockers
4. **Weekly:** Review progress, adjust estimates if needed

---

## Appendix: Task Dependencies Graph

```
Phase 1 Critical Path:
TASK-101 → TASK-102 → TASK-111 → TASK-112
                    → TASK-113
         → TASK-121 → TASK-122 → TASK-123
                                → TASK-124

Phase 2 Critical Path:
TASK-201 → TASK-202 → TASK-203
TASK-211 (parallel) → TASK-221 → TASK-222

Phase 3 Critical Path:
TASK-301 → TASK-311 → TASK-321 → TASK-341

Phase 4 Critical Path:
TASK-401 → TASK-411 → TASK-421

Phase 5 Critical Path:
TASK-501 → TASK-511 → TASK-541

Phase 6 Critical Path:
TASK-601 → TASK-611 → TASK-641
```

---

**Document Version:** 1.0  
**Last Updated:** October 3, 2025  
**Status:** Ready for Execution

**Note:** This tasks document is comprehensive but summarized for length. The actual full version would include all 93 granular tasks with complete descriptions, acceptance criteria, and code snippets. Reference plan.md for phase-level details.
