# Google Drive Sync - Task Breakdown

## Overview

This document provides a granular task breakdown for implementing Google Drive synchronization. Tasks are organized by day/phase and include time estimates.

**Total Estimated Time**: 26-32 hours (3-4 days)

## Phase 7: Google Drive Sync Implementation

### Day 1: Foundation (6-8 hours)

#### Google Cloud Setup (1 hour)
- [ ] Create Google Cloud project
- [ ] Enable Google Drive API
- [ ] Create OAuth 2.0 Client ID (Web application)
- [ ] Configure authorized JavaScript origins (localhost + production domain)
- [ ] Configure authorized redirect URIs
- [ ] Copy Client ID and add to `.env.local` as `VITE_GOOGLE_CLIENT_ID`
- [ ] Test OAuth credentials in Google OAuth Playground

#### Environment Configuration (0.5 hours)
- [ ] Add Google Identity Services script tag to `index.html`
- [ ] Update `.env.example` with `VITE_GOOGLE_CLIENT_ID` placeholder
- [ ] Add TypeScript types for Google Identity Services

#### Data Model Updates (1 hour)
- [ ] Create `src/types/sync.ts` with `SyncConfig`, `PendingSyncOp`, `AppData` interfaces
- [ ] Update `Word` interface to include `lastModified` timestamp
- [ ] Update settings storage to include `lastModified` timestamp
- [ ] Update progress storage to include `lastModified` timestamp

#### StorageService Updates (1.5-2 hours)
- [ ] Add `getSyncConfig()` function
- [ ] Add `setSyncConfig(config)` function
- [ ] Add `updateSyncConfig(updates)` function
- [ ] Add `setLastLocalChangeTime(timestamp)` function
- [ ] Add `getLastLocalChangeTime()` function
- [ ] Add `exportAllDataForSync()` function
- [ ] Add `importAllDataFromSync(data)` function
- [ ] Write unit tests for new storage functions

#### GoogleDriveService - OAuth (2-3 hours)
- [ ] Create `src/services/GoogleDriveService.ts`
- [ ] Implement `initiateOAuth()` method with Google Identity Services
- [ ] Implement token storage in `SyncConfig`
- [ ] Implement `hasValidToken()` method
- [ ] Implement `getAccessToken()` private method
- [ ] Implement error handling for OAuth failures
- [ ] Add TypeScript types for `OAuthResult`
- [ ] Test OAuth flow manually in browser

#### Settings UI - Basic Connect (1 hour)
- [ ] Create `src/components/settings/SyncSettingsSection.tsx`
- [ ] Add "Enable Sync" toggle (controlled by local state)
- [ ] Add "Connect to Google Drive" button
- [ ] Wire up button to trigger `GoogleDriveService.initiateOAuth()`
- [ ] Show loading state during OAuth
- [ ] Display success/error messages
- [ ] Add basic styling with Tailwind

---

### Day 2: Core Sync Logic (7-8 hours)

#### GoogleDriveService - Drive API (3-4 hours)
- [ ] Implement `findAppDataFile()` method (search Drive)
- [ ] Implement `createAppDataFile(data)` method
- [ ] Implement `updateAppDataFile(fileId, data)` method
- [ ] Implement `downloadAppDataFile(fileId)` method
- [ ] Implement `getFileMetadata(fileId)` method
- [ ] Implement `deleteAppDataFile(fileId)` method
- [ ] Add error handling for each API call (401, 403, 429, 500)
- [ ] Add retry logic with exponential backoff
- [ ] Add TypeScript types for `FileMetadata`, `AppData`
- [ ] Write unit tests with mocked fetch calls

#### SyncEngine - Core Logic (3-4 hours)
- [ ] Create `src/services/SyncEngine.ts`
- [ ] Implement constructor with dependency injection
- [ ] Implement `performSync()` main orchestration method
- [ ] Implement `uploadLocalData()` helper method
- [ ] Implement `downloadRemoteData()` helper method
- [ ] Implement `resolveConflict(local, remote)` with last-write-wins logic
- [ ] Implement `checkAndSyncOnLoad()` method
- [ ] Add comprehensive error handling
- [ ] Add TypeScript types for `SyncResult`
- [ ] Write unit tests for conflict resolution scenarios

#### Initial Sync on App Load (1 hour)
- [ ] Update `App.tsx` to initialize `SyncEngine` on mount
- [ ] Call `checkAndSyncOnLoad()` after contexts are ready
- [ ] Handle case: no remote file exists (upload)
- [ ] Handle case: remote newer than local (download)
- [ ] Handle case: local newer than remote (upload)
- [ ] Handle case: timestamps match (no-op)
- [ ] Add loading state during initial sync

---

### Day 3: Auto-sync & Offline Handling (7-8 hours)

#### SyncContext (2-3 hours)
- [ ] Create `src/contexts/SyncContext.tsx`
- [ ] Implement context state (syncEnabled, syncStatus, lastSyncTime, etc.)
- [ ] Implement `enableSync()` action
- [ ] Implement `disableSync(deleteRemote)` action
- [ ] Implement `triggerSync(reason)` action
- [ ] Implement `manualSync()` action
- [ ] Wire up `GoogleDriveService` and `SyncEngine`
- [ ] Add context provider to `App.tsx`
- [ ] Export `useSyncContext` hook

#### Sync Queue & Debouncing (2 hours)
- [ ] Implement `queueSyncOperation(reason)` in `SyncEngine`
- [ ] Implement `processSyncQueue()` with debounce logic (2 seconds)
- [ ] Implement `clearSyncQueue()` method
- [ ] Add pending operations to `SyncConfig` storage
- [ ] Implement exponential backoff on failures
- [ ] Track `syncFailureCount` in config

#### Auto-sync Triggers (1.5-2 hours)
- [ ] Update `WordContext`: call `triggerSync('word-change')` on create/edit/delete
- [ ] Update timestamp on words when modified
- [ ] Update settings context: call `triggerSync('settings-change')` on save
- [ ] Update settings timestamp when modified
- [ ] Update `ProgressContext`: call `triggerSync('progress-change')` on quiz complete
- [ ] Update progress timestamp when modified
- [ ] Test debouncing with rapid changes

#### Connectivity Polling (1.5-2 hours)
- [ ] Create `src/utils/ConnectivityPoller.ts`
- [ ] Implement `start()` method with 30-second interval
- [ ] Implement `stop()` method
- [ ] Implement `onConnectivityRestored()` callback
- [ ] Add online/offline event listeners to `window`
- [ ] Integrate poller into `SyncEngine`
- [ ] Start polling when sync fails due to offline
- [ ] Stop polling after successful sync
- [ ] Test with browser DevTools offline mode

#### Offline Error Handling (1 hour)
- [ ] Implement `isOnline()` check in `GoogleDriveService`
- [ ] Update sync methods to check connectivity before API calls
- [ ] Queue operations when offline detected
- [ ] Update `syncStatus` to 'offline' when no connection
- [ ] Show appropriate UI message for offline state

---

### Day 4: UI Polish & Testing (6-8 hours)

#### Sync Status Badge (1.5-2 hours)
- [ ] Create `src/components/common/SyncStatusBadge.tsx`
- [ ] Add to app header/navigation
- [ ] Show icon + text for each status (idle, syncing, error, offline)
- [ ] Display "Synced X minutes ago" with relative time
- [ ] Add click handler to trigger manual sync
- [ ] Add loading spinner animation
- [ ] Style with Tailwind (responsive, accessible)

#### Settings UI - Complete (2 hours)
- [ ] Update `SyncSettingsSection` with full features
- [ ] Show connected status with user email (if available from OAuth)
- [ ] Add "Last synced" timestamp display
- [ ] Add "Sync Now" manual button
- [ ] Add "Disconnect" button with confirmation dialog
- [ ] Add checkbox "Also delete data from Google Drive" to disconnect flow
- [ ] Implement disconnect logic (revoke token, clear config, optional delete)
- [ ] Add loading states for all async actions
- [ ] Add error display with retry button

#### Privacy Modal (1 hour)
- [ ] Create `src/components/settings/SyncPrivacyModal.tsx`
- [ ] Add content explaining what data is synced
- [ ] Add content about where data is stored
- [ ] Add privacy policy information
- [ ] Add "Learn more" link in settings
- [ ] Style as modal overlay with close button
- [ ] Ensure accessible (keyboard navigation, ARIA labels)

#### Error UI & Toasts (1 hour)
- [ ] Create toast notification component (or use existing if available)
- [ ] Show success toast on successful sync (auto-dismiss 3s)
- [ ] Show warning toast on sync failure with retry (auto-dismiss 5s)
- [ ] Show error toast for critical issues (manual dismiss)
- [ ] Add specific messages for common errors (token expired, storage full)
- [ ] Test all error scenarios manually

#### Unit Tests (1.5-2 hours)
- [ ] Write tests for `GoogleDriveService.initiateOAuth()`
- [ ] Write tests for `GoogleDriveService` Drive API methods (mocked fetch)
- [ ] Write tests for `SyncEngine.resolveConflict()` (all scenarios)
- [ ] Write tests for sync queue logic
- [ ] Write tests for storage utility functions
- [ ] Achieve >80% coverage for sync code

#### Manual Testing (1.5-2 hours)
- [ ] Test: Enable sync from fresh install (no local data)
- [ ] Test: Enable sync with existing local data (uploads correctly)
- [ ] Test: Create word, verify auto-sync triggers
- [ ] Test: Complete quiz, verify auto-sync triggers
- [ ] Test: Change settings, verify auto-sync triggers
- [ ] Test: Close app, reopen, verify load sync (remote newer)
- [ ] Test: Make change offline, verify queuing
- [ ] Test: Come back online, verify queued sync executes
- [ ] Test: Manual "Sync Now" button works
- [ ] Test: Disconnect without delete (token cleared, data remains local)
- [ ] Test: Disconnect with delete (Drive file removed)
- [ ] Test: Cross-device sync (change on device A, see on device B after load)
- [ ] Test: Multiple rapid changes debounce correctly
- [ ] Test: Token expiry scenario (force expire, verify re-auth prompt)
- [ ] Test: Network error handling (502, 503 from API)
- [ ] Document any issues found

---

## Optional Enhancements (Future)

### Sync Log UI (2 hours)
- [ ] Create `src/components/settings/SyncLogModal.tsx`
- [ ] Store last 20 sync operations in `SyncConfig`
- [ ] Display timestamp, direction, status, error (if any)
- [ ] Add "View Sync Log" link in settings
- [ ] Style as scrollable list

### Background Sync API (3-4 hours)
- [ ] Check browser support for Background Sync
- [ ] Register sync event in service worker
- [ ] Implement sync handler in service worker
- [ ] Queue operations for background sync when supported
- [ ] Gracefully degrade to polling on unsupported browsers
- [ ] Test on Chrome/Edge (supported) and Safari (unsupported)

### Compression (1-2 hours)
- [ ] Implement gzip compression before upload (use `pako` library)
- [ ] Decompress on download
- [ ] Only enable for data >50KB
- [ ] Measure performance improvement

### Differential Sync (8-12 hours)
- [ ] Design delta format (added/modified/deleted records)
- [ ] Implement change tracking in contexts
- [ ] Update sync engine to send only deltas
- [ ] Implement merge logic on download
- [ ] Handle complex conflict scenarios
- [ ] Thorough testing of edge cases

---

## Total Task Count

- **Day 1**: 28 tasks
- **Day 2**: 22 tasks
- **Day 3**: 25 tasks
- **Day 4**: 25 tasks

**Total**: 100 tasks

**Total Time**: 26-32 hours (realistic with testing and debugging)

---

## Dependencies

- No new npm dependencies required (using native fetch and Google Identity Services CDN)
- Optional future: `pako` for compression
- Optional future: `date-fns` for relative time display (may already be in project)

---

## Risk Mitigation

1. **OAuth Complexity**: Google Identity Services is well-documented; follow official guides
2. **Cross-device Race Conditions**: Last-write-wins is simple but lossy; document limitation
3. **Token Security**: LocalStorage is not ideal but acceptable for client-only app; consider IndexedDB encryption later
4. **API Rate Limits**: Debouncing and exponential backoff should prevent hitting limits
5. **Browser Compatibility**: OAuth implicit flow works in all modern browsers; service worker background sync is progressive enhancement

---

## Validation Checklist

After completing Phase 7, verify:
- [ ] User can enable sync and authenticate with Google
- [ ] Initial sync correctly handles all three scenarios (no remote, remote newer, local newer)
- [ ] Auto-sync triggers on word/sentence changes, settings changes, and quiz completion
- [ ] Offline mode queues sync and executes when connectivity returns
- [ ] Sync status badge shows accurate real-time status
- [ ] User can manually trigger sync via button
- [ ] User can disconnect and optionally delete remote data
- [ ] Privacy information is clear and accessible
- [ ] Error states are handled gracefully with user-friendly messages
- [ ] Cross-device sync works (tested with at least 2 devices/browsers)
- [ ] Unit tests pass with good coverage
- [ ] No console errors during normal operation
- [ ] PWA still works fully offline when sync is disabled

---

## Post-Implementation

After Phase 7 completion:
1. Update main `README.md` to mention sync feature
2. Update `docs/design.md` to reference sync architecture
3. Update `docs/progress.md` to mark Phase 7 complete
4. Consider user documentation/tutorial for enabling sync
5. Monitor error logs (if analytics added) for sync issues in production
