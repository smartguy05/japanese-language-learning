# Google Cloud Setup Guide for Drive Sync

This guide walks you through setting up Google Cloud credentials to enable Google Drive synchronization.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)

## Step-by-Step Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click "New Project"
4. Enter project name: `Japanese Learning App` (or your preferred name)
5. Click "Create"
6. Wait for the project to be created and select it

### 2. Enable Google Drive API

1. In your project, go to **APIs & Services** > **Library**
2. Search for "Google Drive API"
3. Click on "Google Drive API"
4. Click **Enable**
5. Wait for the API to be enabled

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Select **External** (unless you have a Google Workspace account)
3. Click **Create**
4. Fill in the required fields:
   - **App name**: Japanese Learning PWA
   - **User support email**: Your email
   - **Developer contact information**: Your email
5. Click **Save and Continue**
6. On the "Scopes" page, click **Add or Remove Scopes**
7. Search for and select: `https://www.googleapis.com/auth/drive.file`
   - This scope allows the app to only access files it creates (not the user's entire Drive)
8. Click **Update** and then **Save and Continue**
9. On "Test users" page, click **Save and Continue** (you can add test users if needed)
10. Click **Back to Dashboard**

### 4. Create OAuth 2.0 Client ID

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth client ID**
3. Select **Application type**: Web application
4. Enter **Name**: Japanese Learning PWA
5. Under **Authorized JavaScript origins**, click **Add URI** and add:
   - `http://localhost:5173` (for development)
   - Your production domain (e.g., `https://your-app.netlify.app`)
6. Under **Authorized redirect URIs**, add the same URIs as above
7. Click **Create**
8. A dialog will appear with your credentials - **Copy the Client ID**
9. Click **OK**

### 5. Add Client ID to Your Project

1. In your project root, create a file named `.env.local` (this file is gitignored)
2. Add your Client ID:
   ```
   VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
   ```
3. Replace `your-client-id-here.apps.googleusercontent.com` with the actual Client ID you copied

### 6. Add Google Identity Services Script

The script tag has already been added to `index.html`. Verify it's present:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

### 7. Test the Setup

1. Start your development server: `npm run dev`
2. Navigate to Settings
3. Click "Enable Google Drive Sync"
4. Click "Connect to Google Drive"
5. You should see the Google OAuth popup
6. Grant permissions
7. Sync should initialize

## Troubleshooting

### "Redirect URI mismatch" Error

- Make sure you added the exact URI (including `http://` vs `https://`) to the authorized JavaScript origins
- Check that your dev server is running on the port you specified (default: 5173)

### "Access blocked: This app's request is invalid"

- Make sure you've enabled the Google Drive API
- Verify the OAuth consent screen is configured correctly
- Check that you've added the correct scope: `https://www.googleapis.com/auth/drive.file`

### OAuth Popup Blocked

- Allow popups for localhost in your browser
- Or use the redirect flow instead (requires code changes)

### "Invalid Client ID"

- Double-check that the Client ID in `.env.local` matches exactly what's in Google Cloud Console
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing `.env.local`

## Security Notes

1. **Never commit `.env.local` to Git** - it's already in `.gitignore`
2. The `drive.file` scope is safe - it only allows access to files created by your app
3. Users can revoke access at any time via [Google Account Permissions](https://myaccount.google.com/permissions)
4. For production, ensure your domain is using HTTPS

## Production Deployment

When deploying to production:

1. Add your production domain to **Authorized JavaScript origins** in Google Cloud Console
2. Add the Client ID as an environment variable in your hosting service (Netlify, Vercel, etc.)
   - Variable name: `VITE_GOOGLE_CLIENT_ID`
   - Value: Your Client ID
3. Test the OAuth flow on production before announcing the feature

## Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/reference)
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Scopes for Google APIs](https://developers.google.com/identity/protocols/oauth2/scopes#drive)
