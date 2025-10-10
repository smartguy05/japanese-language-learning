/**
 * Google Drive Service
 * Handles OAuth authentication and Google Drive API interactions
 */

import type {
  OAuthResult,
  GoogleTokenResponse,
  DriveFileMetadata,
  AppData,
} from '../types';
import { getSyncConfig, updateSyncConfig } from '../utils/storage';

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const UPLOAD_API_BASE = 'https://www.googleapis.com/upload/drive/v3';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const APP_DATA_FILE_NAME = 'japanese-learning-app-data.json';

export class GoogleDriveService {
  private clientId: string;

  constructor() {
    // Get client ID from environment variable
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

    if (!this.clientId) {
      console.warn('Google Client ID not found. Please set VITE_GOOGLE_CLIENT_ID in .env.local');
    }
  }

  /**
   * Check if Google Identity Services is loaded
   */
  private isGISLoaded(): boolean {
    return typeof window.google !== 'undefined' &&
           typeof window.google.accounts !== 'undefined';
  }

  /**
   * Initiate OAuth flow using Google Identity Services
   */
  async initiateOAuth(): Promise<OAuthResult> {
    if (!this.clientId) {
      throw new Error('Google Client ID is not configured');
    }

    if (!this.isGISLoaded()) {
      throw new Error('Google Identity Services not loaded. Please check that the script tag is in index.html');
    }

    return new Promise((resolve, reject) => {
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: this.clientId,
        scope: DRIVE_SCOPE,
        callback: (response: GoogleTokenResponse) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
          } else {
            // Calculate expiry timestamp
            const expiresIn = response.expires_in;
            const expiryTimestamp = Date.now() + (expiresIn * 1000);

            // Save token to sync config
            updateSyncConfig({
              googleAccessToken: response.access_token,
              googleTokenExpiry: expiryTimestamp,
              enabled: true,
            });

            resolve({
              accessToken: response.access_token,
              expiresIn: expiresIn,
              tokenType: response.token_type,
              scope: response.scope,
            });
          }
        },
      });

      client.requestAccessToken();
    });
  }

  /**
   * Revoke OAuth token
   */
  async revokeToken(): Promise<void> {
    const config = getSyncConfig();

    if (!config.googleAccessToken) {
      return; // No token to revoke
    }

    if (!this.isGISLoaded()) {
      throw new Error('Google Identity Services not loaded');
    }

    return new Promise((resolve) => {
      window.google!.accounts.oauth2.revoke(config.googleAccessToken!, () => {
        // Clear token from config
        updateSyncConfig({
          googleAccessToken: null,
          googleTokenExpiry: null,
          enabled: false,
        });
        resolve();
      });
    });
  }

  /**
   * Check if we have a valid access token
   */
  hasValidToken(): boolean {
    const config = getSyncConfig();

    if (!config.googleAccessToken || !config.googleTokenExpiry) {
      return false;
    }

    // Check if token is expired (with 5-minute buffer)
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes
    return config.googleTokenExpiry > (now + buffer);
  }

  /**
   * Get current access token
   */
  private getAccessToken(): string {
    const config = getSyncConfig();

    if (!config.googleAccessToken) {
      throw new Error('No access token available. Please authenticate first.');
    }

    if (!this.hasValidToken()) {
      throw new Error('Access token expired. Please re-authenticate.');
    }

    return config.googleAccessToken;
  }

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  }

  /**
   * Find the app data file in Drive
   */
  async findAppDataFile(): Promise<string | null> {
    const accessToken = this.getAccessToken();

    const query = `name='${APP_DATA_FILE_NAME}' and trashed=false`;
    const url = `${DRIVE_API_BASE}/files?q=${encodeURIComponent(query)}&spaces=drive&fields=files(id,name)`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to search for file: ${response.statusText}`);
    }

    const data = await response.json();

    if (data.files && data.files.length > 0) {
      return data.files[0].id;
    }

    return null;
  }

  /**
   * Create app data file in Drive
   */
  async createAppDataFile(appData: AppData): Promise<string> {
    const accessToken = this.getAccessToken();

    // Step 1: Create the file metadata
    const metadata = {
      name: APP_DATA_FILE_NAME,
      mimeType: 'application/json',
    };

    const metadataResponse = await fetch(`${DRIVE_API_BASE}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metadata),
    });

    if (!metadataResponse.ok) {
      throw new Error(`Failed to create file: ${metadataResponse.statusText}`);
    }

    const fileMetadata = await metadataResponse.json();
    const fileId = fileMetadata.id;

    // Step 2: Upload the content
    await this.updateAppDataFile(fileId, appData);

    // Save file ID to config
    updateSyncConfig({ driveFileId: fileId });

    return fileId;
  }

  /**
   * Update app data file content
   */
  async updateAppDataFile(fileId: string, appData: AppData): Promise<void> {
    const accessToken = this.getAccessToken();

    const url = `${UPLOAD_API_BASE}/files/${fileId}?uploadType=media`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update file: ${response.statusText}`);
    }
  }

  /**
   * Download app data file content
   */
  async downloadAppDataFile(fileId: string): Promise<AppData> {
    const accessToken = this.getAccessToken();

    const url = `${DRIVE_API_BASE}/files/${fileId}?alt=media`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    const data = await response.json();
    return data as AppData;
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<DriveFileMetadata> {
    const accessToken = this.getAccessToken();

    const url = `${DRIVE_API_BASE}/files/${fileId}?fields=id,name,modifiedTime,size,mimeType`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get file metadata: ${response.statusText}`);
    }

    const metadata = await response.json();
    return metadata as DriveFileMetadata;
  }

  /**
   * Delete app data file
   */
  async deleteAppDataFile(fileId: string): Promise<void> {
    const accessToken = this.getAccessToken();

    const url = `${DRIVE_API_BASE}/files/${fileId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete file: ${response.statusText}`);
    }

    // Clear file ID from config
    updateSyncConfig({ driveFileId: null });
  }

  /**
   * Handle API errors with retry logic
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on auth errors
        if (error instanceof Error && error.message.includes('authenticate')) {
          throw error;
        }

        // Check if it's a rate limit error (429)
        if (error instanceof Error && error.message.includes('429')) {
          // Exponential backoff
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // For other errors, wait before retry
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * (attempt + 1);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }
}

// Export singleton instance
export const googleDriveService = new GoogleDriveService();
