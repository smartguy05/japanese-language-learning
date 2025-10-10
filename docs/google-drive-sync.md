# Google Drive Sync Feature - Technical Design

## Overview

This document specifies the Google Drive synchronization feature for the Japanese Learning PWA. This feature allows users to automatically sync their learning data, settings, and progress to Google Drive, enabling cross-device usage while maintaining the app's offline-first philosophy.

## Design Principles

1. **Opt-in by default**: Sync is disabled until user explicitly enables it
2. **Offline-first**: App must function fully without sync enabled or when offline
3. **Transparent**: User always knows sync status and what data is being stored
4. **Automatic**: Once enabled, sync happens without user intervention
5. **Resilient**: Handle network failures, conflicts, and edge cases gracefully

## User Experience

### Initial Setup Flow

1. User navigates to Settings page
2. Sees "Google Drive Sync" section with toggle (OFF by default)
3. Clicks toggle to enable
4. Sees privacy message: "Your learning data will be synced to Google Drive. You can disconnect at any time. Learn more."
5. Clicks "Connect to Google Drive" button
6. Google OAuth popup appears
7. User grants permission (scope: `https://www.googleapis.com/auth/drive.file`)
8. Popup closes, sync initializes
9. If local data exists, uploads immediately
10. Shows "Synced just now" timestamp

### Ongoing Usage

**Visual Indicators:**
- Sync status badge in app header or settings:
  - ✓ "Synced 2 minutes ago" (success)
  - ↻ "Syncing..." (in progress)
  - ⚠ "Sync failed - will retry" (error)
  - ⊗ "Offline - will sync when online" (no connection)

**Auto-sync Triggers:**
- User creates/edits/deletes a word or sentence
- User completes a quiz (progress update)
- User changes settings (theme, review frequency, etc.)
- App loads and detects remote data is newer

**Connectivity Handling:**
- If offline when trigger occurs: Queue sync operation
- Background connectivity polling every 30 seconds when pending sync exists
- Automatic sync when connection detected

### Disconnect Flow

1. User goes to Settings > Google Drive Sync
2. Clicks "Disconnect" button
3. Sees confirmation dialog:
   - "Disconnect from Google Drive?"
   - "Your local data will remain, but will no longer sync."
   - Option: "Also delete data from Google Drive" checkbox
4. Confirms action
5. OAuth token revoked, local sync state cleared
6. Optional: Drive file deleted via API

## Technical Architecture

### New Dependencies

```json
{
  "dependencies": {
    "@types/gapi": "^0.0.47",
    "@types/gapi.auth2": "^0.0.57"
  }
}
```

**Note**: We'll use Google Identity Services (GIS), the modern replacement for deprecated Google Sign-In. No heavy client library needed - direct REST API calls via `fetch()`.

### Data Model Changes

#### New LocalStorage Keys

**`jp-learn-sync-config`**
```typescript
interface SyncConfig {
  enabled: boolean;
  googleAccessToken: string | null;
  googleTokenExpiry: number | null; // Unix timestamp
  googleRefreshToken: string | null;
  driveFileId: string | null;
  lastSyncTime: number | null; // Unix timestamp
  lastLocalChangeTime: number; // Unix timestamp
  pendingSyncOperations: PendingSyncOp[];
  syncFailureCount: number;
}

interface PendingSyncOp {
  id: string;
  type: 'word-change' | 'settings-change' | 'progress-change';
  timestamp: number;
  retryCount: number;
}
```

#### Modified Existing Models

**Update `Word` interface:**
```typescript
interface Word {
  // ... existing fields
  lastModified: number; // Unix timestamp - ADD THIS
}
```

**Update Settings/Progress storage:**
Add `lastModified` timestamp to all stored data for conflict detection.

### File Storage Structure on Google Drive

**File name**: `japanese-learning-app-data.json`

**File location**: Google Drive App Data folder (hidden from user, not in "My Drive")
- Alternative: Store in root "My Drive" for user visibility/backup

**File format**: Same as existing export format, with metadata wrapper:
```json
{
  "version": "1.0",
  "appVersion": "1.0.0",
  "lastModified": 1699564800000,
  "data": {
    "words": [ /* Word[] */ ],
    "settings": { /* settings object */ },
    "progress": { /* progress object */ }
  }
}
```

### Core Components

#### 1. SyncContext (React Context)

**File**: `src/contexts/SyncContext.tsx`

**Responsibilities:**
- Manage sync state and configuration
- Expose sync operations to app
- Handle OAuth flow
- Queue and execute sync operations

**API:**
```typescript
interface SyncContextValue {
  // State
  syncEnabled: boolean;
  syncStatus: 'idle' | 'syncing' | 'error' | 'offline';
  lastSyncTime: number | null;
  isAuthenticated: boolean;

  // Actions
  enableSync: () => Promise<void>; // Initiates OAuth
  disableSync: (deleteRemote: boolean) => Promise<void>;
  manualSync: () => Promise<void>; // Force sync now
  triggerSync: (reason: SyncReason) => void; // Queue auto-sync

  // Status
  pendingSyncCount: number;
  lastError: string | null;
}

type SyncReason = 'word-change' | 'settings-change' | 'progress-change' | 'app-load';
```

#### 2. GoogleDriveService

**File**: `src/services/GoogleDriveService.ts`

**Responsibilities:**
- OAuth token management
- Google Drive API REST calls
- File CRUD operations
- Error handling and retries

**Methods:**
```typescript
class GoogleDriveService {
  // OAuth
  async initiateOAuth(): Promise<OAuthResult>;
  async refreshAccessToken(): Promise<string>;
  async revokeToken(): Promise<void>;

  // Drive API
  async findAppDataFile(): Promise<string | null>; // Returns fileId
  async createAppDataFile(data: AppData): Promise<string>; // Returns fileId
  async updateAppDataFile(fileId: string, data: AppData): Promise<void>;
  async downloadAppDataFile(fileId: string): Promise<AppData>;
  async getFileMetadata(fileId: string): Promise<FileMetadata>;
  async deleteAppDataFile(fileId: string): Promise<void>;

  // Helpers
  isOnline(): boolean;
  hasValidToken(): boolean;
}

interface OAuthResult {
  accessToken: string;
  expiresIn: number; // seconds
  tokenType: string;
}

interface FileMetadata {
  id: string;
  name: string;
  modifiedTime: string; // ISO 8601
}

interface AppData {
  version: string;
  appVersion: string;
  lastModified: number;
  data: {
    words: Word[];
    settings: Settings;
    progress: Progress;
  };
}
```

#### 3. SyncEngine

**File**: `src/services/SyncEngine.ts`

**Responsibilities:**
- Orchestrate sync operations
- Implement last-write-wins logic
- Handle sync queue
- Manage connectivity polling

**Methods:**
```typescript
class SyncEngine {
  constructor(
    private driveService: GoogleDriveService,
    private storageService: StorageService
  ) {}

  // Main sync logic
  async performSync(): Promise<SyncResult>;

  // Queue management
  queueSyncOperation(reason: SyncReason): void;
  async processSyncQueue(): Promise<void>;
  clearSyncQueue(): void;

  // Conflict resolution (last-write-wins)
  async resolveConflict(
    localData: AppData,
    remoteData: AppData
  ): Promise<AppData>;

  // Connectivity
  startConnectivityPolling(): void;
  stopConnectivityPolling(): void;

  // App load sync
  async checkAndSyncOnLoad(): Promise<void>;
}

interface SyncResult {
  success: boolean;
  direction: 'upload' | 'download' | 'none';
  error?: string;
  timestamp: number;
}
```

#### 4. StorageService Updates

**File**: `src/utils/storage.ts` (existing file to be updated)

**Add methods:**
```typescript
// Sync configuration
export function getSyncConfig(): SyncConfig;
export function setSyncConfig(config: SyncConfig): void;
export function updateSyncConfig(updates: Partial<SyncConfig>): void;

// Timestamp tracking
export function setLastLocalChangeTime(timestamp: number): void;
export function getLastLocalChangeTime(): number;

// Bundled export/import for sync
export function exportAllDataForSync(): AppData;
export function importAllDataFromSync(data: AppData): void;
```

#### 5. UI Components

**SyncSettingsSection** (`src/components/settings/SyncSettingsSection.tsx`)
- Toggle to enable/disable sync
- "Connect to Google Drive" button
- Sync status display
- Last synced timestamp
- Manual sync button
- Disconnect button
- Privacy information link/modal

**SyncStatusBadge** (`src/components/common/SyncStatusBadge.tsx`)
- Small badge in app header
- Shows current sync status icon + text
- Click to view details or manual sync

**SyncPrivacyModal** (`src/components/settings/SyncPrivacyModal.tsx`)
- Explains what data is synced
- Links to Google's privacy policy
- Clear data storage location info

### OAuth Implementation Details

#### Using Google Identity Services (GIS)

**Setup in `index.html`:**
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

**Initialize in `GoogleDriveService`:**
```typescript
async initiateOAuth(): Promise<OAuthResult> {
  return new Promise((resolve, reject) => {
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file',
      callback: (response) => {
        if (response.error) {
          reject(response.error);
        } else {
          resolve({
            accessToken: response.access_token,
            expiresIn: response.expires_in,
            tokenType: response.token_type
          });
        }
      }
    });

    client.requestAccessToken();
  });
}
```

**Environment Variable:**
- Add `VITE_GOOGLE_CLIENT_ID` to `.env` file
- Obtain from Google Cloud Console (OAuth 2.0 Client ID)

#### Google Cloud Console Setup Steps

1. Create project at console.cloud.google.com
2. Enable Google Drive API
3. Create OAuth 2.0 Client ID (Web application)
4. Add authorized JavaScript origins:
   - `http://localhost:5173` (dev)
   - Your production domain
5. Add authorized redirect URIs: (same as origins for implicit flow)
6. Copy Client ID to `.env.local`

### Google Drive API Calls

All API calls use REST endpoints via `fetch()`:

**Base URL**: `https://www.googleapis.com/drive/v3`

**Find existing file:**
```typescript
GET /files?q=name='japanese-learning-app-data.json' and trashed=false&spaces=appDataFolder
Headers: Authorization: Bearer {accessToken}
```

**Create file:**
```typescript
POST /files
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
Body: {
  name: 'japanese-learning-app-data.json',
  parents: ['appDataFolder'],
  mimeType: 'application/json'
}

// Then upload content with file ID from response
```

**Update file content:**
```typescript
PATCH /upload/drive/v3/files/{fileId}?uploadType=media
Headers:
  Authorization: Bearer {accessToken}
  Content-Type: application/json
Body: {JSON data}
```

**Download file:**
```typescript
GET /files/{fileId}?alt=media
Headers: Authorization: Bearer {accessToken}
```

**Get metadata:**
```typescript
GET /files/{fileId}?fields=id,name,modifiedTime
Headers: Authorization: Bearer {accessToken}
```

**Delete file:**
```typescript
DELETE /files/{fileId}
Headers: Authorization: Bearer {accessToken}
```

### Sync Algorithm (Last-Write-Wins)

#### On App Load

```typescript
async function checkAndSyncOnLoad() {
  if (!syncEnabled || !isAuthenticated) return;

  try {
    // 1. Get remote file metadata
    const fileId = await findAppDataFile();
    if (!fileId) {
      // No remote file exists - upload local data
      await uploadLocalData();
      return;
    }

    const metadata = await getFileMetadata(fileId);
    const remoteModifiedTime = new Date(metadata.modifiedTime).getTime();
    const localModifiedTime = getLastLocalChangeTime();

    // 2. Compare timestamps
    if (remoteModifiedTime > localModifiedTime) {
      // Remote is newer - download and overwrite local
      const remoteData = await downloadAppDataFile(fileId);
      importAllDataFromSync(remoteData.data);
      setLastLocalChangeTime(remoteModifiedTime);
      updateSyncConfig({ lastSyncTime: Date.now() });
    } else if (localModifiedTime > remoteModifiedTime) {
      // Local is newer - upload
      await uploadLocalData();
    } else {
      // Same timestamp - no sync needed
      updateSyncConfig({ lastSyncTime: Date.now() });
    }
  } catch (error) {
    // Handle offline or API errors
    if (!isOnline()) {
      // Queue for later
      startConnectivityPolling();
    } else {
      // Log error, show user notification
    }
  }
}
```

#### On Local Change

```typescript
function triggerSync(reason: SyncReason) {
  if (!syncEnabled || !isAuthenticated) return;

  // Update local change timestamp
  setLastLocalChangeTime(Date.now());

  // Queue sync operation
  queueSyncOperation(reason);

  // Debounced execution (wait 2 seconds for more changes)
  debouncedProcessSyncQueue();
}

async function processSyncQueue() {
  if (pendingSyncOperations.length === 0) return;
  if (!isOnline()) {
    startConnectivityPolling();
    return;
  }

  try {
    // Upload current local data
    await uploadLocalData();

    // Clear queue on success
    clearSyncQueue();
    updateSyncConfig({
      lastSyncTime: Date.now(),
      syncFailureCount: 0
    });
  } catch (error) {
    // Increment failure count, retry with exponential backoff
    const failureCount = getSyncConfig().syncFailureCount + 1;
    updateSyncConfig({ syncFailureCount: failureCount });

    const retryDelay = Math.min(1000 * Math.pow(2, failureCount), 60000);
    setTimeout(() => processSyncQueue(), retryDelay);
  }
}
```

#### Upload Helper

```typescript
async function uploadLocalData() {
  const localData = exportAllDataForSync();
  const config = getSyncConfig();

  if (config.driveFileId) {
    // Update existing file
    await updateAppDataFile(config.driveFileId, localData);
  } else {
    // Create new file
    const fileId = await createAppDataFile(localData);
    updateSyncConfig({ driveFileId: fileId });
  }
}
```

### Connectivity Polling

```typescript
class ConnectivityPoller {
  private intervalId: number | null = null;
  private readonly POLL_INTERVAL = 30000; // 30 seconds

  start() {
    if (this.intervalId) return; // Already running

    this.intervalId = setInterval(() => {
      if (navigator.onLine) {
        this.onConnectivityRestored();
      }
    }, this.POLL_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async onConnectivityRestored() {
    // Verify connectivity with actual API call
    try {
      const response = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
        headers: { Authorization: `Bearer ${getAccessToken()}` }
      });

      if (response.ok) {
        // True connectivity confirmed
        this.stop();
        await processSyncQueue();
      }
    } catch {
      // Still offline or API unavailable
    }
  }
}
```

### Error Handling

#### Common Error Scenarios

1. **Network Offline**
   - Detect via `navigator.onLine` or failed fetch
   - Queue operation, start polling
   - Show "Offline - will sync when online" status

2. **OAuth Token Expired**
   - Detect via 401 response from Drive API
   - Attempt token refresh (if refresh token available)
   - If refresh fails, prompt user to re-authenticate

3. **Drive API Rate Limit (429)**
   - Extract `Retry-After` header
   - Use exponential backoff
   - Max retry attempts: 5

4. **Insufficient Drive Storage (403)**
   - Show user notification: "Google Drive storage full"
   - Disable auto-sync
   - Offer manual sync after they free space

5. **File Deleted by User on Drive**
   - Detect when file not found
   - Create new file with local data
   - Update stored fileId

6. **Corrupted Remote Data**
   - Validate JSON structure before importing
   - If invalid, show error and keep local data
   - Offer to overwrite corrupted remote data

#### Error UI Patterns

**Toast Notifications:**
- "Synced successfully" (success, auto-dismiss 3s)
- "Sync failed - will retry" (warning, auto-dismiss 5s)
- "Google Drive storage full" (error, manual dismiss)

**Settings Page Status:**
- Persistent error message with details
- "Retry Now" button
- "View Sync Log" link (shows last 10 sync attempts)

### Security Considerations

1. **Token Storage**: Store OAuth tokens in LocalStorage (not ideal, but acceptable for client-side app)
   - Alternative: Consider using IndexedDB with encryption for better security
   - Tokens are scoped to only app-created files

2. **HTTPS Required**: PWA service worker requires HTTPS (already planned)

3. **Token Refresh**: Implement refresh token flow to avoid frequent re-authentication
   - Note: Implicit flow doesn't provide refresh tokens
   - Use Authorization Code Flow with PKCE instead

4. **Scope Minimization**: Use `drive.file` scope (not `drive` full access)

5. **User Control**: Allow user to revoke access and delete remote data

### Testing Strategy

#### Unit Tests

- `GoogleDriveService`: Mock fetch calls, test OAuth flow
- `SyncEngine`: Test conflict resolution logic, queue management
- `StorageService`: Test sync config CRUD operations

#### Integration Tests

- End-to-end OAuth flow (use Google's OAuth playground)
- Upload/download cycle with real Drive API
- Offline queue and connectivity polling
- Conflict scenarios (local newer, remote newer, same timestamp)

#### Manual Testing Checklist

- [ ] Enable sync from fresh install (no local data)
- [ ] Enable sync with existing local data
- [ ] Sync triggers on word creation
- [ ] Sync triggers on settings change
- [ ] Sync triggers on quiz completion
- [ ] App load downloads newer remote data
- [ ] App load uploads newer local data
- [ ] Offline mode queues sync operations
- [ ] Connectivity restoration executes queued sync
- [ ] Token expiry triggers re-authentication
- [ ] Disconnect removes local tokens
- [ ] Disconnect with "delete remote" removes Drive file
- [ ] Cross-device sync (change on device A, see on device B)
- [ ] Multiple rapid changes debounce correctly
- [ ] Error states show appropriate UI

### Performance Considerations

1. **Debouncing**: Wait 2 seconds after last change before syncing (avoid excessive API calls)

2. **Compression**: Consider gzipping JSON before upload for large datasets
   - Only needed if data exceeds ~100KB

3. **Incremental Sync**: For future optimization, consider delta sync (only changed records)
   - MVP uses full data replacement (simpler)

4. **Bundle Size**: Using REST API directly (no heavy SDK) keeps bundle small

5. **Background Sync API**: Consider using Service Worker Background Sync for more reliable offline sync
   - Browser support: Chrome, Edge (not Safari)
   - Gracefully degrade on unsupported browsers

### Privacy & Data Transparency

#### Privacy Modal Content

```
What data is synced?
- Your word/sentence list (Japanese, romanji, English)
- Your learning progress (scores, mastery levels, review history)
- Your app settings (theme, notification preferences)

Where is data stored?
- Your Google Drive account, in a hidden app data folder
- Only this app can access the synced file
- You can disconnect and delete the data at any time

What about privacy?
- Data is transmitted over HTTPS
- Google's privacy policy applies to Drive storage
- We never send data to our servers (we don't have any!)
- You can export your data anytime from Settings

Learn more: [Link to privacy policy page]
```

#### Settings UI Copy

```
Google Drive Sync (Optional)
Automatically sync your learning data across devices.

[Toggle Switch] Enable Sync

Status: ✓ Synced 2 minutes ago
Last sync: [timestamp]

[Button] Sync Now
[Button] Disconnect from Google Drive

[Link] What data is synced?
[Link] Manage Google account permissions
```

## Implementation Phases

This feature should be implemented as **Phase 7** (after core app completion), or integrated into existing phases:

### Phase 7: Google Drive Sync (3-4 days)

**Day 1: Foundation**
- Set up Google Cloud project and OAuth credentials
- Implement `GoogleDriveService` with OAuth flow
- Add sync configuration to LocalStorage
- Basic UI: Settings toggle and connect button

**Day 2: Core Sync Logic**
- Implement `SyncEngine` with upload/download
- Last-write-wins conflict resolution
- App load sync check
- Update `StorageService` with sync helpers

**Day 3: Auto-sync & Offline**
- Hook sync triggers into WordContext, ProgressContext, SettingsContext
- Implement sync queue and debouncing
- Connectivity polling
- Error handling and retry logic

**Day 4: UI & Testing**
- Sync status badge component
- Privacy modal and messaging
- Disconnect flow with optional delete
- Manual testing across devices
- Unit tests for sync logic

### Tasks Breakdown (Detailed)

See companion `tasks-google-drive-sync.md` for granular task list.

## Future Enhancements

1. **Differential Sync**: Only upload changed records, not full dataset
2. **Conflict UI**: Show user when conflicts occur, allow manual resolution
3. **Sync Log**: Detailed history of sync operations for debugging
4. **Multiple Device Management**: Show list of devices synced
5. **Backup/Restore**: Allow manual backup to Drive separate from auto-sync
6. **Other Cloud Providers**: Add Dropbox, OneDrive support
7. **End-to-End Encryption**: Encrypt data before uploading (user-controlled key)
8. **Background Sync API**: Use Service Worker for more reliable offline sync

## Open Questions

1. **App Data Folder vs. My Drive**: Should file be hidden or visible to user?
   - **Recommendation**: Start with App Data (hidden), add export to My Drive as separate feature

2. **Token Refresh Strategy**: Implicit flow or Auth Code with PKCE?
   - **Recommendation**: Use Auth Code with PKCE for refresh token support

3. **Max Sync Frequency**: Should we rate-limit sync attempts?
   - **Recommendation**: Debounce at 2 seconds, max 1 sync per 5 seconds

4. **Sync During Quiz**: Should quiz completion sync immediately or wait until end?
   - **Recommendation**: Debounce after quiz, don't sync mid-quiz

5. **Multi-device Race Condition**: What if user edits on two devices simultaneously?
   - **Accepted Risk**: Last-write-wins will prefer whichever device syncs last
   - **Future**: Add conflict detection with timestamp granularity check

## References

- Google Drive API v3: https://developers.google.com/drive/api/v3/reference
- Google Identity Services: https://developers.google.com/identity/gsi/web
- OAuth 2.0 PKCE: https://oauth.net/2/pkce/
- Background Sync API: https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API
