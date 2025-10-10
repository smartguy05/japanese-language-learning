# Google Drive Sync - Conflict Resolution Testing Guide

This guide explains how the conflict resolution feature works and how to test it.

## Overview

When you connect to Google Drive from a device, the app compares your local data with the data stored in Google Drive. If they differ, a **Conflict Resolution Modal** will appear, allowing you to choose which data to keep.

## How Conflict Resolution Works

### Automatic Detection
The app automatically detects conflicts by comparing timestamps:
- **Local Data**: Last modification time on the current device
- **Remote Data**: Last modification time in Google Drive
- **Tolerance**: 1 second (to account for clock drift)

### Manual Choice
Instead of automatically overwriting data, the modal shows:
- Timestamp of each version (local vs. remote)
- Number of words in each version
- Which version is newer (highlighted with a green border)
- A warning about data loss

You can then choose:
1. **Keep This Device** - Upload your local data to Google Drive (overwrites remote)
2. **Keep Google Drive** - Download data from Google Drive (overwrites local)
3. **Cancel** - Do nothing (sync is aborted)

## Testing Scenarios

### Scenario 1: First Time Sync with Existing Drive Data

**Setup:**
1. Device A: Already connected to Google Drive with some words/progress
2. Device B: Has different local data, never connected to Drive

**Steps:**
1. On Device B, add 5 new words (different from Device A)
2. Go to Settings → Google Drive Sync
3. Click "Connect to Google Drive"
4. Authenticate with the same Google account used on Device A

**Expected Result:**
- Conflict modal appears
- Shows:
  - Device B's local data (newer timestamp, 5 words)
  - Google Drive's data (older timestamp, different word count)
  - "NEWER" badge on Device B's data
- **Choose "Keep This Device"**: Device B's data uploads to Drive, Device A will get it on next sync
- **Choose "Keep Google Drive"**: Device B downloads Drive data, loses its 5 local words

---

### Scenario 2: Overwriting Test Drive Data with Real Device

**Your Current Situation (from your question):**

**Setup:**
1. Google Drive: Contains test data you uploaded earlier
2. Your Real Device: Has your actual learning data (more words, real progress)

**Steps:**
1. On your real device, go to Settings → Google Drive Sync
2. Click "Connect to Google Drive"
3. Authenticate

**Expected Result:**
- Conflict modal appears
- Shows:
  - Your device's data (likely newer, more words)
  - Test data in Google Drive (older, fewer words)
  - "NEWER" badge on your device's data
- **Choose "Keep This Device"**: Your real data uploads to Drive, overwriting test data ✅
- **Choose "Keep Google Drive"**: Your device downloads test data (NOT what you want!)

**Recommendation:** Choose "Keep This Device" to preserve your real learning data.

---

### Scenario 3: No Conflict (Same Data)

**Setup:**
1. Device A: Connected and synced
2. Device A: No changes made since last sync

**Steps:**
1. On Device A, go to Settings
2. Click "Sync Now"

**Expected Result:**
- No conflict modal appears
- Sync completes silently
- Status shows "Synced just now"

---

### Scenario 4: Cross-Device Conflict

**Setup:**
1. Device A: Connected to Drive, has 10 words
2. Device B: Connected to same Drive account, has 15 words (offline for a while)

**Steps:**
1. On Device A: Add 3 more words → Auto-syncs to Drive (now 13 words in Drive)
2. On Device B: Go back online, trigger sync

**Expected Result:**
- Conflict modal appears on Device B
- Shows:
  - Device B's data (15 words, older timestamp)
  - Drive data (13 words, newer timestamp from Device A)
  - "NEWER" badge on Drive data
- **Choose "Keep This Device"**: Device B uploads its 15 words, Device A loses its 3 new words
- **Choose "Keep Google Drive"**: Device B downloads 13 words, loses its 5 extra words

**Note:** This demonstrates why the feature exists - to prevent silent data loss!

---

### Scenario 5: Cancel Conflict Resolution

**Setup:**
Any conflict situation

**Steps:**
1. Trigger a conflict
2. In the conflict modal, click "Cancel"

**Expected Result:**
- Modal closes
- Sync is aborted
- No data is changed (local stays local, remote stays remote)
- Sync status may show an error or idle state
- You can export your local data as a backup before trying again

---

## Visual Guide: Understanding the Modal

### Modal Components

```
┌─────────────────────────────────────────────────────┐
│ Sync Conflict Detected                          [X] │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ⚠️ Different data found                            │
│ Your local data and Google Drive data are          │
│ different. Time difference: 2 hours                │
│                                                     │
│ ┌───────────────┐      ┌───────────────┐          │
│ │ This Device   │      │ Google Drive  │          │
│ │ [NEWER]       │      │               │          │
│ │               │      │               │          │
│ │ Modified:     │      │ Modified:     │          │
│ │ Dec 3, 2pm    │      │ Dec 3, 12pm   │          │
│ │ Words: 25     │      │ Words: 20     │          │
│ │ Progress: Yes │      │ Progress: Yes │          │
│ └───────────────┘      └───────────────┘          │
│                                                     │
│ ⚠️ Warning: The data you don't choose will be     │
│ permanently overwritten. Consider exporting first. │
│                                                     │
│ [Keep This Device]  [Keep Google Drive]  [Cancel] │
│ Upload to Drive     Download to Device             │
└─────────────────────────────────────────────────────┘
```

### Key Elements

1. **Warning Banner** (Yellow):
   - Shows that different data was found
   - Shows time difference between versions

2. **Data Comparison** (Two Columns):
   - Left: Your current device's data
   - Right: Google Drive's data
   - Green border + "NEWER" badge on the most recent version

3. **Data Metrics**:
   - Last modified timestamp (formatted as human-readable date/time)
   - Word count
   - Whether progress data exists

4. **Warning (Red)**:
   - Reminds you that one version will be permanently lost
   - Suggests exporting as a backup

5. **Action Buttons**:
   - "Keep This Device" - Uploads local data
   - "Keep Google Drive" - Downloads remote data
   - "Cancel" - Aborts sync

---

## Best Practices

### Before Connecting to Drive

1. **Export your local data** (Settings → Export Data)
   - This creates a backup JSON file
   - You can re-import it if something goes wrong

2. **Check your word count**
   - Go to Dashboard to see how many words you have
   - This helps you verify which version to keep

### During Conflict Resolution

1. **Read the timestamps carefully**
   - The "NEWER" badge shows the most recent version
   - But newer isn't always better! You might have deleted bad data recently

2. **Compare word counts**
   - If one version has significantly more words, that's often the one you want
   - Unless you intentionally deleted words

3. **When in doubt, export first**
   - Cancel the conflict
   - Export your local data
   - Then reconnect and make your choice

### After Resolution

1. **Verify the sync completed**
   - Check the sync status (should show "Synced just now")
   - Look for green checkmark icon

2. **Check your data**
   - Go to Dashboard to verify word count
   - Spot-check a few words to ensure they're correct

3. **Test on other devices**
   - Connect other devices to verify they get the correct data

---

## Troubleshooting

### Modal doesn't appear when expected
- Check if timestamps are within 1 second (no conflict)
- Ensure you're authenticated (check Settings)
- Look for error messages in the sync status

### Can't connect to Google Drive
- Verify your Google Client ID is set in `.env`
- Check browser console for OAuth errors
- Try revoking and re-granting permissions

### Wrong data was chosen
1. **If you can still access the other device:**
   - Go to that device
   - Export the correct data
   - Import it on the device with wrong data
   - Reconnect to Drive and choose "Keep This Device"

2. **If you lost data permanently:**
   - Unfortunately, there's no undo
   - This is why exporting first is recommended
   - Future improvement: Add automatic backups before conflicts

### Sync fails after conflict resolution
- Check the error message in Settings
- Try disconnecting and reconnecting to Drive
- Verify you're online
- Check browser console for errors

---

## Technical Details

### When Conflicts Are Detected

Conflicts are checked during:
1. **Initial connection** (`enableSync()`)
2. **App load** (if already connected)
3. **Manual sync** (via "Sync Now" button)
4. **Coming back online** (after being offline with pending changes)

### Conflict Resolution Flow

```
User clicks "Connect to Google Drive"
         ↓
    Authenticate with Google OAuth
         ↓
    Find Drive file (or create if doesn't exist)
         ↓
    Compare timestamps
         ↓
   Difference > 1 second?
         ↓
  YES: Show conflict modal
         ↓
    User chooses option
         ↓
  "Keep Local": Upload to Drive
  "Keep Remote": Download from Drive
  "Cancel": Abort sync
         ↓
    Update sync status
         ↓
       Complete
```

### Data Stored in Conflicts

The `ConflictInfo` object contains:
- `localTimestamp`: Last modified time on device (milliseconds)
- `remoteTimestamp`: Last modified time in Drive
- `fileId`: Google Drive file ID
- `localData`: Complete AppData structure (words, progress, settings)
- `remoteData`: Complete AppData from Drive

---

## FAQ

**Q: What happens if I close the browser during conflict resolution?**
A: The sync is aborted (same as clicking Cancel). No data is changed. You can retry later.

**Q: Can I see the actual words before choosing?**
A: Not in the modal currently. Export both versions first if you need to compare word-by-word.

**Q: What if both versions have important data?**
A:
1. Choose one to upload to Drive
2. Export the other version as JSON
3. Manually merge them using a text editor
4. Import the merged JSON
5. Sync again (choose "Keep This Device")

**Q: Why can't the app automatically merge conflicts?**
A: Merging is complex - what if the same word was edited differently on both devices? The app uses a simple "last-write-wins" strategy with manual choice to keep it reliable and understandable.

**Q: How often should I sync?**
A: The app auto-syncs after every change (with 2-second debounce). You rarely need to click "Sync Now" unless you suspect an issue.

**Q: Can I disable conflict resolution and use automatic last-write-wins?**
A: Not currently. This feature was added specifically to prevent accidental data loss. You can file a GitHub issue if you need this.

---

## Future Enhancements

Planned improvements:
- [ ] Show word count difference (+5, -3, etc.)
- [ ] Preview actual words in the modal
- [ ] Automatic backup before overwriting
- [ ] Three-way merge option
- [ ] Conflict history log
- [ ] "Always choose newer" preference

---

## Getting Help

If you encounter issues:
1. Check the browser console for errors
2. Export your data as a backup
3. File an issue at: [GitHub repo URL]
4. Include:
   - Steps to reproduce
   - Screenshots of the conflict modal
   - Browser console errors
   - Expected vs. actual behavior
