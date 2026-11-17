# Conflict Resolution Feature - Implementation Summary

## What Was Implemented

I've added a **manual conflict resolution** feature to the Google Drive sync system. Now, when you connect to Google Drive from a device, if your local data differs from the data in Google Drive, you'll be presented with a modal that lets you choose which version to keep.

## The Problem It Solves

**Your Original Question:**
> "Say I run the app now and upload my save file. If I open the app on another device and connect my Google Drive, will the local information be overwritten, Google Drive be overwritten, something else?"

**Before this feature:**
- The app would automatically use "last-write-wins" based on timestamps
- Whichever data was modified most recently would silently overwrite the other
- This could cause accidental data loss if you didn't realize which version was newer

**After this feature:**
- A modal appears showing both versions side-by-side
- You can see timestamps, word counts, and which version is newer
- You choose explicitly: "Keep This Device" or "Keep Google Drive"
- No more silent overwrites or data loss

## Your Specific Use Case

**Your situation:** You have test data in Google Drive, and you want to overwrite it with your real device's data.

**How to do it:**
1. On your real device, go to Settings → Google Drive Sync
2. Click "Connect to Google Drive"
3. Authenticate
4. A conflict modal will appear showing:
   - Your device's data (your real words/progress)
   - Google Drive's data (test data)
5. Click **"Keep This Device"** (Upload to Drive)
6. Your real data will overwrite the test data in Drive ✅

## Files Created

### 1. `SyncConflictResolutionModal.tsx`
**Location:** `app/src/components/settings/`

A beautiful modal component that shows:
- Side-by-side comparison of local vs. remote data
- Timestamps formatted as human-readable dates
- Word counts and progress status
- Green "NEWER" badge on the most recent version
- Warning about data loss
- Three action buttons: Keep Local, Keep Remote, Cancel

**Visual Design:**
- Yellow warning banner at the top
- Two-column grid (responsive on mobile)
- Green border highlighting the newer version
- Red warning banner about permanent overwriting
- Loading states during resolution

### 2. `ConflictInfo` Type (SyncEngine.ts)
**Location:** `app/src/services/SyncEngine.ts`

New TypeScript interface for conflict data:
```typescript
interface ConflictInfo {
  localTimestamp: number;
  remoteTimestamp: number;
  fileId: string;
  localData: AppData;
  remoteData: AppData;
}
```

### 3. `CONFLICT_RESOLUTION_GUIDE.md`
**Location:** `app/`

Comprehensive testing and usage guide covering:
- How conflict resolution works
- 5 detailed testing scenarios
- Visual guide to the modal
- Best practices
- Troubleshooting
- FAQ

## Files Modified

### 1. `SyncEngine.ts`
**Changes:**
- Added `pendingConflict` state
- Added `conflictResolutionCallback` property
- New method: `setConflictResolutionCallback()`
- New method: `clearConflictResolutionCallback()`
- New method: `getPendingConflict()`
- Modified `resolveConflict()` to use callback when available
- Falls back to automatic last-write-wins if no callback is set

**How it works:**
```typescript
// When conflict is detected:
if (conflictResolutionCallback) {
  const choice = await conflictResolutionCallback(conflictInfo);

  if (choice === 'keep-local') {
    // Upload local data
  } else if (choice === 'keep-remote') {
    // Download remote data
  } else {
    // Cancel - do nothing
  }
}
```

### 2. `SyncContext.tsx`
**Changes:**
- Added `pendingConflict` state
- Added `conflictResolver` state (promise resolver)
- New function: `resolveConflict(choice)`
- New `useEffect` to set up the conflict callback with SyncEngine
- Exports `pendingConflict` and `resolveConflict` for components

**How it works:**
The context acts as a bridge between the SyncEngine (business logic) and UI components:
1. SyncEngine detects conflict → calls callback
2. Callback creates a Promise and stores the resolver in state
3. UI component sees `pendingConflict` is not null → shows modal
4. User clicks button → calls `resolveConflict(choice)`
5. Resolver is called → Promise resolves → SyncEngine continues

### 3. `SyncSettingsSection.tsx`
**Changes:**
- Imports `SyncConflictResolutionModal`
- Imports `pendingConflict` and `resolveConflict` from SyncContext
- Added `isResolvingConflict` state
- New handler: `handleResolveConflict(choice)`
- New handler: `handleCancelConflict()`
- Renders `SyncConflictResolutionModal` at the end
- Transforms `pendingConflict` data into modal-friendly format

**Data transformation:**
```typescript
conflictData={pendingConflict ? {
  local: {
    wordCount: pendingConflict.localData.data.words.length,
    lastModified: pendingConflict.localTimestamp,
    hasProgress: pendingConflict.localData.data.progress !== null,
  },
  remote: {
    wordCount: pendingConflict.remoteData.data.words.length,
    lastModified: pendingConflict.remoteTimestamp,
    hasProgress: pendingConflict.remoteData.data.progress !== null,
  }
} : null}
```

## How to Test

### Quick Test (Your Use Case)

1. **Start the dev server:**
   ```bash
   cd app
   npm run dev
   ```

2. **On your real device:**
   - Open the app
   - Go to Settings
   - Scroll to "Google Drive Sync"
   - Click "Connect to Google Drive"
   - Sign in with your Google account

3. **Conflict modal appears:**
   - You'll see your device's data vs. Drive's test data
   - Click **"Keep This Device"**
   - Wait for "Uploading..." to complete

4. **Verify:**
   - Status should show "Synced just now"
   - Your real data is now in Google Drive
   - Test data is gone

### Comprehensive Testing

See `CONFLICT_RESOLUTION_GUIDE.md` for 5 detailed scenarios:
1. First time sync with existing Drive data
2. Overwriting test data (your use case)
3. No conflict (same data)
4. Cross-device conflict
5. Cancel conflict resolution

## Key Features

### 1. **Visual Comparison**
- See both versions side-by-side
- Timestamps are formatted as readable dates (e.g., "Dec 3, 2:30 PM")
- Word counts clearly displayed
- "NEWER" badge on the most recent version

### 2. **Safety Warnings**
- Yellow warning about different data
- Shows time difference (e.g., "2 hours")
- Red warning about permanent overwriting
- Suggests exporting data first

### 3. **Flexible Choices**
- Keep This Device (upload)
- Keep Google Drive (download)
- Cancel (do nothing)
- No forced automatic decisions

### 4. **Loading States**
- "Uploading..." or "Downloading..." text
- Disabled buttons during resolution
- Smooth state transitions

### 5. **Mobile Responsive**
- Two-column layout on desktop
- Single-column on mobile
- Touch-friendly buttons
- Readable text sizes

## Technical Architecture

### State Flow

```
┌─────────────────┐
│   SyncEngine    │ Detects conflict
│  (Business)     │ └──> Creates ConflictInfo
└────────┬────────┘
         │
         │ Calls callback
         ▼
┌─────────────────┐
│  SyncContext    │ Creates Promise
│  (State Mgmt)   │ └──> Sets pendingConflict state
└────────┬────────┘
         │
         │ React re-render
         ▼
┌─────────────────┐
│ SyncSettings    │ Sees pendingConflict
│  (UI Component) │ └──> Shows modal
└────────┬────────┘
         │
         │ User clicks button
         ▼
┌─────────────────┐
│ Modal Component │ Calls onResolve('keep-local')
│  (UI Presenter) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ SyncSettings    │ Calls resolveConflict()
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SyncContext    │ Resolves Promise
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   SyncEngine    │ Receives choice
│                 │ └──> Uploads or downloads
└─────────────────┘
```

### Why This Architecture?

1. **Separation of Concerns:**
   - SyncEngine: Business logic (when to sync, how to resolve)
   - SyncContext: State management (React integration)
   - Components: UI presentation (showing data to user)

2. **Testability:**
   - SyncEngine can be tested without React
   - Context can be tested with mock engine
   - Components can be tested with mock context

3. **Flexibility:**
   - Easy to add automated resolution later (just don't set callback)
   - Easy to add more conflict strategies
   - Easy to show conflicts in different places

## Backward Compatibility

- **Existing sync still works:** If you're already connected, nothing changes
- **Automatic fallback:** If no callback is set, uses last-write-wins
- **No breaking changes:** All existing sync features work exactly as before

## Future Enhancements

Possible improvements (not implemented yet):
- Show actual word previews in the modal
- Three-way merge option (keep both, merge intelligently)
- Automatic backup before overwriting
- Conflict history/audit log
- "Always choose newer" preference
- Smart merge suggestions based on diff

## Troubleshooting

### Modal doesn't appear
- Timestamps might be within 1 second (no conflict detected)
- Check browser console for errors
- Verify you're authenticated (Settings shows green checkmark)

### Wrong data was chosen
1. If you still have the other device, export from there
2. Import the exported JSON
3. Reconnect and choose correctly this time
4. **Prevention:** Always export before resolving conflicts

### Sync fails after resolution
- Check error message in Settings
- Try disconnecting and reconnecting
- Verify internet connection
- Check browser console

## Summary

You now have **full control** over sync conflicts! Instead of the app silently overwriting your data, you'll always be asked which version to keep. This is especially important for your use case of overwriting test data with your real device's data.

**Next Steps:**
1. Read `CONFLICT_RESOLUTION_GUIDE.md` for detailed usage
2. Test on your real device following the "Quick Test" above
3. Keep the guide handy for future conflicts
4. Consider exporting data before major sync operations

**Questions?**
- See FAQ in `CONFLICT_RESOLUTION_GUIDE.md`
- Check troubleshooting section
- File a GitHub issue if you encounter bugs
