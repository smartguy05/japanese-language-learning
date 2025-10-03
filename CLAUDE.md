# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Japanese Learning Progressive Web Application (PWA)** designed to help users learn Japanese through three interactive study modes:
- **Alphabet Mode**: Character-by-character romanji reveal for hiragana/katakana
- **Sentence Mode**: Multiple-choice comprehension quizzes with celebratory animations
- **Flashcard Mode**: Traditional flashcard review with flip animations

The application is **offline-first**, **mobile-optimized**, and has **zero backend dependencies** - all data is stored locally using the browser's LocalStorage API.

## Technology Stack

- **Frontend**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite 5.0+
- **Styling**: Tailwind CSS 3.4+ with custom Japanese-inspired theme
- **PWA**: vite-plugin-pwa with Workbox service worker
- **Storage**: LocalStorage API (with future IndexedDB migration path)
- **Key Libraries**:
  - `wanakana` - Japanese text processing and romanji conversion
  - `react-router-dom` - Client-side routing
  - `framer-motion` - Animations (optional)
  - `date-fns` - Date utilities
  - `nanoid` - Unique ID generation

## Project Status

**Current Phase**: Planning/Pre-development
- No code has been implemented yet
- All planning documentation is complete in `/docs`
- Ready to begin Phase 1: Foundation & Infrastructure

## Architecture

### State Management
- **React Context API** for global state (no Redux/Zustand)
- Three main contexts:
  - `WordContext` - CRUD operations for words/sentences
  - `ThemeContext` - Dark/light theme management
  - `ProgressContext` - Learning progress and score tracking

### Data Model
```typescript
interface Word {
  id: string;
  japanese: string;
  romanji: string;
  english: string;
  day: number;
  type: 'word' | 'sentence';
  mastered: boolean;
  needsReview: boolean;
  // ... tracking fields
}
```

### Folder Structure (Planned)
```
src/
├── components/
│   ├── common/       # Reusable UI (Button, Card, Modal, Input)
│   ├── alphabet/     # Alphabet mode components
│   ├── sentence/     # Sentence mode components
│   ├── flashcard/    # Flashcard mode components
│   └── manage/       # Word management components
├── contexts/         # WordContext, ThemeContext, ProgressContext
├── hooks/            # Custom hooks (useWordSelection, useQuizGenerator)
├── pages/            # Route pages (Dashboard, modes, Settings)
├── types/            # TypeScript interfaces
├── utils/            # Storage, validation, Japanese text utilities
└── styles/           # Global CSS and theme variables
```

## Key Design Decisions

1. **Offline-First**: All features work without network after PWA install
2. **Mobile-First**: Optimized for smartphones, responsive up to desktop
3. **No Backend**: Complete client-side app using browser storage
4. **Dark Mode Default**: Traditional Japanese aesthetic with subtle patterns
5. **Accessibility**: WCAG 2.1 AA compliance with keyboard/screen reader support

## Development Guidelines

### TypeScript
- Strict mode enabled - no `any` types
- All interfaces in `/src/types`
- Prefer type inference where clear
- Use `interface` over `type` for object shapes

### React Patterns
- Functional components with hooks only
- Custom hooks for reusable logic
- React.memo for expensive components
- Code splitting with React.lazy for routes

### Styling
- Tailwind utility classes (no custom CSS unless necessary)
- Custom theme in `tailwind.config.js`
- CSS variables for dark/light theme switching
- Mobile-first responsive design (min 48px touch targets)

### Data Persistence
- All data stored in LocalStorage as JSON
- Storage keys: `jp-learn-words`, `jp-learn-progress`, `jp-learn-settings`
- Import/export via JSON download/upload
- Validate all imported data before applying

## Critical Implementation Notes

### Alphabet Mode Character Mapping
The most complex feature - mapping Japanese characters to romanji for reveal animation:
- Handle multi-byte characters (hiragana/katakana are 3 bytes in UTF-8)
- Account for compound characters (しゃ = "sha", きょ = "kyo")
- Handle small tsu (っ) for double consonants
- Use WanaKana library for character type detection
- See `docs/design.md` section 4.1 for detailed algorithm

### Sentence Mode Distractor Generation
Generate plausible wrong answers for multiple-choice:
- Find sentences with similar length (±20% characters)
- Prefer sentences from same/nearby days
- Ensure no duplicates and randomize correct answer position
- Handle edge case where < 4 total sentences exist

### Flashcard Flip Animation
CSS 3D transform approach:
- Use `perspective` on container
- `transform: rotateY(180deg)` for flip
- `backface-visibility: hidden` to prevent mirroring
- Smooth 600ms transition
- See `docs/design.md` lines 696-719 for CSS

### PWA Configuration
- Service worker via vite-plugin-pwa
- Network-first strategy for HTML, cache-first for assets
- Icons: 192px and 512px minimum
- Manifest must specify `display: standalone`
- HTTPS required for service worker registration

## Testing Approach

### Unit Tests (Vitest)
Focus on business logic:
- Word filtering/selection algorithms
- Quiz distractor generation
- Data validation and import/export
- LocalStorage utility functions

### Component Tests (React Testing Library)
Focus on user interactions:
- Button clicks and form submissions
- State changes via context
- Keyboard navigation
- Theme toggling

### Manual Testing Checklist
- PWA install on Android (Chrome) and iOS (Safari)
- Offline functionality (airplane mode)
- Responsive design at 320px, 768px, 1920px
- Dark/light mode toggle persistence
- Screen reader navigation (VoiceOver/TalkBack)

## Common Commands (Once Project Initialized)

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check

# Linting
npm run lint

# Run tests
npm run test
```

## Development Phases

The project follows a 6-phase plan (see `docs/plan.md`):
1. **Days 1-4**: Foundation (React setup, theme system, data layer, routing)
2. **Days 5-9**: Alphabet Mode (character mapping, reveal system)
3. **Days 10-13**: Sentence Mode (quiz generator, fireworks animation)
4. **Days 14-16**: Flashcard Mode (flip animation, swipe gestures)
5. **Days 17-18**: Word Management (CRUD UI, import/export)
6. **Days 19-21**: PWA & Polish (service worker, testing, deployment)

## Important Files to Reference

- **`docs/design.md`**: Complete technical specification with data models, algorithms, and component hierarchy
- **`docs/plan.md`**: Phased development roadmap with milestone validation
- **`docs/tasks.md`**: Granular task breakdown (93 tasks, ~126-158 hours)
- **`docs/goals.md`**: Success criteria and KPIs
- **`docs/progress.md`**: Progress tracking template (not started yet)

## Gotchas & Edge Cases

1. **LocalStorage Quota**: Typically 5-10MB limit
   - Warn user at 80% capacity
   - Document IndexedDB migration path for future

2. **Japanese Character Encoding**:
   - Hiragana/Katakana are multi-byte UTF-16
   - Use `Array.from(str)` not `str.split('')` for correct iteration
   - WanaKana handles most edge cases

3. **iOS PWA Limitations**:
   - Add to Home Screen is manual (no install prompt)
   - Provide clear installation instructions
   - Test thoroughly on actual iOS devices

4. **Theme Flash Prevention**:
   - Load theme preference before React renders
   - Apply class to `<html>` in index.html inline script

5. **Service Worker Caching**:
   - Development: Disable or use "update on reload"
   - Production: Cache-busting via versioned filenames

6. **Accessibility with Animations**:
   - Always check `prefers-reduced-motion`
   - Provide non-animated fallbacks (checkmark instead of fireworks)

## Performance Targets

- Lighthouse Performance: ≥ 90
- Lighthouse Accessibility: ≥ 90
- Lighthouse PWA: ≥ 90
- Bundle size: < 200KB gzipped
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s

## Contact & Resources

- Planning docs are comprehensive - refer to them first
- No external documentation links (all design is self-contained)
- No issue tracker yet (project not started)
- GitHub repo: (will be created in Phase 1)
