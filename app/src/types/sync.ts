/**
 * Google Drive Sync Type Definitions
 */

import type { Word } from './word';
import type { UserProgress } from './progress';
import type { AppSettings } from './settings';

/**
 * Sync configuration stored in LocalStorage
 */
export interface SyncConfig {
  // Sync enabled state
  enabled: boolean;

  // OAuth tokens
  googleAccessToken: string | null;
  googleTokenExpiry: number | null; // Unix timestamp (milliseconds)
  googleRefreshToken: string | null;

  // Drive file tracking
  driveFileId: string | null;

  // Sync timestamps
  lastSyncTime: number | null; // Unix timestamp (milliseconds)
  lastLocalChangeTime: number; // Unix timestamp (milliseconds)

  // Pending operations queue
  pendingSyncOperations: PendingSyncOperation[];

  // Error tracking
  syncFailureCount: number;
  lastError: string | null;
}

/**
 * Queued sync operation
 */
export interface PendingSyncOperation {
  id: string; // nanoid
  type: SyncReason;
  timestamp: number; // Unix timestamp (milliseconds)
  retryCount: number;
}

/**
 * Reasons for triggering a sync
 */
export type SyncReason = 'word-change' | 'settings-change' | 'progress-change' | 'app-load' | 'manual';

/**
 * Sync status
 */
export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

/**
 * App data structure for Drive storage
 * This wraps the export data with sync metadata
 */
export interface AppData {
  version: string; // Schema version (e.g., "1.0")
  appVersion: string; // App version (e.g., "1.0.0")
  lastModified: number; // Unix timestamp (milliseconds)
  data: {
    words: Word[];
    progress: UserProgress;
    settings: Omit<AppSettings, 'theme'>; // Theme is device-specific
  };
}

/**
 * OAuth result from Google Identity Services
 */
export interface OAuthResult {
  accessToken: string;
  expiresIn: number; // Seconds until expiry
  tokenType: string; // Usually "Bearer"
  scope: string;
}

/**
 * Google Drive file metadata
 */
export interface DriveFileMetadata {
  id: string;
  name: string;
  modifiedTime: string; // ISO 8601 format
  size: string; // File size in bytes (as string)
  mimeType: string;
}

/**
 * Result of a sync operation
 */
export interface SyncResult {
  success: boolean;
  direction: 'upload' | 'download' | 'none'; // What happened
  timestamp: number; // Unix timestamp (milliseconds)
  error?: string;
  conflictResolution?: 'local-newer' | 'remote-newer' | 'same';
}

/**
 * Google Identity Services client configuration
 * (for TypeScript autocomplete)
 */
export interface GoogleIdentityServicesClient {
  requestAccessToken: () => void;
}

/**
 * Google Identity Services callback response
 */
export interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
  error_uri?: string;
}

/**
 * Declare global google object from GIS script
 */
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: GoogleTokenResponse) => void;
          }) => GoogleIdentityServicesClient;
          revoke: (accessToken: string, callback?: () => void) => void;
        };
      };
    };
  }
}

export {};
