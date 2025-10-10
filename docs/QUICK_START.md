# Quick Start: Replace Test Data with Your Real Data

## Your Situation
- ✅ You have test data uploaded to Google Drive
- ✅ You have your real learning data on your actual device
- 🎯 **Goal:** Overwrite the test data in Drive with your real data

## Step-by-Step Instructions

### 1. Open the App on Your Real Device
```
http://localhost:5173
```
(or wherever your dev server is running)

### 2. Navigate to Settings
- Click the Settings icon/link in the navigation
- Scroll down to "Google Drive Sync" section

### 3. Connect to Google Drive
- Click the **"Connect to Google Drive"** button
- Sign in with the same Google account you used for the test data
- Wait for authentication to complete

### 4. Conflict Modal Appears 🎉

You'll see a modal that looks like this:

```
┌─────────────────────────────────────────────┐
│ Sync Conflict Detected                  [X] │
├─────────────────────────────────────────────┤
│                                             │
│ ⚠️ Different data found                    │
│ Time difference: X hours/days              │
│                                             │
│ ┌──────────────────┐  ┌─────────────────┐ │
│ │ This Device      │  │ Google Drive    │ │
│ │ [NEWER] ✨       │  │                 │ │
│ │                  │  │                 │ │
│ │ Modified: Today  │  │ Modified: Dec X │ │
│ │ Words: XX        │  │ Words: YY       │ │
│ │ Progress: Yes    │  │ Progress: Yes   │ │
│ └──────────────────┘  └─────────────────┘ │
│                                             │
│ ⚠️ Warning: One version will be lost!     │
│                                             │
│ [Keep This Device] [Keep Google Drive] ... │
│  Upload to Drive   Download to Device      │
└─────────────────────────────────────────────┘
```

### 5. Choose "Keep This Device" ✅

**Important:** Click the **"Keep This Device"** button (left button)

This will:
- Upload your real device's data to Google Drive
- Overwrite the test data in Google Drive
- Keep all your real words and progress

**DO NOT** click "Keep Google Drive" - that would download the test data and overwrite your real data!

### 6. Wait for Upload

You'll see:
- Button text changes to "Uploading..."
- Buttons become disabled
- Usually takes 1-5 seconds depending on data size

### 7. Verify Success ✓

After upload completes:
- Modal closes automatically
- Sync status shows: **"Synced just now"** with a green checkmark
- You should see "0 pending operations"

### 8. Double-Check (Optional)

To verify your data is correct:
1. Go to Dashboard
2. Check that your word count is correct
3. Spot-check a few words to ensure they're your real data
4. (Optional) Test on another device to confirm sync works

## Troubleshooting

### What if the modal doesn't appear?
- **Case 1:** Your local data and Drive data are identical (unlikely)
  - No conflict needed!
  - Sync status will show "Synced" immediately

- **Case 2:** Authentication failed
  - You'll see an error message
  - Try clicking "Connect" again
  - Check browser console for OAuth errors

### What if I accidentally clicked "Keep Google Drive"?
Don't panic! If you still have your real data on the device:

**Option 1: Re-import (Recommended)**
1. Disconnect from Google Drive (click "Disconnect" button)
2. Go to Settings → Import Data
3. Import your previously exported data (you did export, right? 😅)
4. Reconnect to Drive
5. Choose "Keep This Device" this time

**Option 2: If you didn't export**
- Your device might still have the data in browser storage
- Try refreshing the page and checking if your data is still there
- If it's gone, check if you have the data on another device

### What if upload fails?
Common issues:
1. **No internet connection**
   - Status will show "Offline"
   - Connect to internet and click "Sync Now"

2. **Token expired**
   - Status shows "Not authenticated"
   - Click "Disconnect" then "Connect" again

3. **Drive API error**
   - Check error message in red box
   - Try disconnecting and reconnecting
   - Check browser console for details

## Safety Tips 🛡️

### Before Connecting (Recommended)

**Export your real data as backup:**
1. Go to Settings
2. Click "Export Data" button
3. Save the JSON file somewhere safe (Downloads, Google Drive as file, etc.)
4. Now you have a backup if anything goes wrong!

### After Connecting

**Test on a second device (if you have one):**
1. Open the app on another device/browser
2. Connect to the same Google Drive account
3. The conflict modal should show Google Drive is newer
4. Choose "Keep Google Drive"
5. Verify your real data synced correctly

## Expected Timeline

| Step | Time |
|------|------|
| Navigate to Settings | 5 seconds |
| Click "Connect to Google Drive" | 2 seconds |
| Google OAuth sign-in | 10-30 seconds |
| Conflict modal appears | 1 second |
| Read and choose option | 10-60 seconds |
| Upload completes | 1-5 seconds |
| **Total** | **~30-120 seconds** |

## What Happens to Test Data?

Once you click "Keep This Device":
1. ❌ Test data in Google Drive is **permanently deleted**
2. ✅ Your real data is uploaded to Google Drive
3. 🔄 Future syncs will use your real data
4. 📱 Other devices will get your real data on next sync

**No undo!** This is why exporting first is recommended.

## Visual Reference

### What You'll See (Typical Scenario)

**This Device (Your Real Data):**
- ✅ Modified: December 3, 2024, 2:30 PM (today)
- ✅ Words: 47 (your real words)
- ✅ Progress: Yes (your real progress)
- ✅ **[NEWER]** badge (green highlight)

**Google Drive (Test Data):**
- ❌ Modified: December 1, 2024, 10:00 AM (2 days ago)
- ❌ Words: 12 (test words)
- ❌ Progress: Yes (test progress)
- ❌ No badge (gray)

**Time difference: 2 days**

### Button Meanings

| Button | What it does | When to use |
|--------|-------------|-------------|
| **Keep This Device** | Upload → | Use this for your case! Overwrites Drive with your real data |
| **Keep Google Drive** | ← Download | Don't use this! Would overwrite your real data with test data |
| **Cancel** | Do nothing | Use if unsure, export first, then reconnect |

## After First Sync

Good news! You'll rarely see the conflict modal again because:

1. **Auto-sync is enabled**
   - Every change syncs automatically (2-second delay)
   - Word additions, edits, quiz completions all sync

2. **App load sync**
   - When you open the app, it checks for newer data
   - If Drive is newer, downloads automatically (no modal)
   - If local is newer, uploads automatically (no modal)

3. **Conflicts only happen when:**
   - You make changes offline on Device A
   - Then make different changes on Device B
   - Then bring Device A back online
   - (Rare in normal usage!)

## Next Steps

After successfully syncing:

1. ✅ **Test the sync** by making a change and verifying it syncs
2. ✅ **Connect other devices** to access your data everywhere
3. ✅ **Set up regular exports** (weekly?) as backup
4. ✅ **Read full guide** (`CONFLICT_RESOLUTION_GUIDE.md`) for edge cases

## Need Help?

- 📖 Full guide: `CONFLICT_RESOLUTION_GUIDE.md`
- 🔍 Troubleshooting: See "Troubleshooting" section in the guide
- 🐛 Found a bug? File a GitHub issue
- ❓ Questions? Check the FAQ in the full guide

## Summary

**You asked:** "How do I overwrite the test data in Google Drive with my real device's data?"

**Answer:**
1. Connect to Google Drive from your real device
2. When the conflict modal appears, click **"Keep This Device"**
3. Done! Your real data is now in Drive, test data is gone

**Time required:** ~1-2 minutes

**Risk level:** Low (if you export first)

**One-time setup:** Yes (future syncs are automatic)

---

Good luck! 🚀
