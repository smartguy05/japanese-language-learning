/**
 * Sync Engine
 * Orchestrates sync operations, conflict resolution, and queue management
 */

import { nanoid } from 'nanoid';
import type { SyncResult, SyncReason, PendingSyncOperation, AppData } from '../types';
import { GoogleDriveService } from './GoogleDriveService';
import {
  getSyncConfig,
  updateSyncConfig,
  exportAllDataForSync,
  importAllDataFromSync,
  setLastLocalChangeTime,
  getLastLocalChangeTime,
} from '../utils/storage';

export interface ConflictInfo {
  localTimestamp: number;
  remoteTimestamp: number;
  fileId: string;
  localData: AppData;
  remoteData: AppData;
}

export class SyncEngine {
  private driveService: GoogleDriveService;
  private syncInProgress: boolean = false;
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private connectivityPollInterval: ReturnType<typeof setInterval> | null = null;
  private readonly DEBOUNCE_DELAY = 2000; // 2 seconds
  private readonly CONNECTIVITY_POLL_INTERVAL = 30000; // 30 seconds
  private pendingConflict: ConflictInfo | null = null;
  private conflictResolutionCallback: ((conflict: ConflictInfo) => Promise<'keep-local' | 'keep-remote' | 'cancel'>) | null = null;

  constructor(driveService: GoogleDriveService) {
    this.driveService = driveService;
  }

  /**
   * Set callback for manual conflict resolution
   */
  setConflictResolutionCallback(
    callback: (conflict: ConflictInfo) => Promise<'keep-local' | 'keep-remote' | 'cancel'>
  ): void {
    this.conflictResolutionCallback = callback;
  }

  /**
   * Clear the conflict resolution callback (use automatic resolution)
   */
  clearConflictResolutionCallback(): void {
    this.conflictResolutionCallback = null;
  }

  /**
   * Get pending conflict (if any)
   */
  getPendingConflict(): ConflictInfo | null {
    return this.pendingConflict;
  }

  /**
   * Queue a sync operation
   */
  queueSyncOperation(reason: SyncReason): void {
    const config = getSyncConfig();

    if (!config.enabled) {
      return; // Sync not enabled
    }

    // Update last local change time
    setLastLocalChangeTime(Date.now());

    // Add to pending operations
    const operation: PendingSyncOperation = {
      id: nanoid(),
      type: reason,
      timestamp: Date.now(),
      retryCount: 0,
    };

    const pendingOps = [...config.pendingSyncOperations, operation];
    updateSyncConfig({ pendingSyncOperations: pendingOps });

    // Trigger debounced sync
    this.debouncedProcessSyncQueue();
  }

  /**
   * Process sync queue with debouncing
   */
  private debouncedProcessSyncQueue(): void {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      this.processSyncQueue();
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Process pending sync operations
   */
  async processSyncQueue(): Promise<void> {
    if (this.syncInProgress) {
      return; // Already syncing
    }

    const config = getSyncConfig();

    if (!config.enabled || config.pendingSyncOperations.length === 0) {
      return;
    }

    // Check connectivity
    if (!this.driveService.isOnline()) {
      this.startConnectivityPolling();
      return;
    }

    // Check token validity
    if (!this.driveService.hasValidToken()) {
      updateSyncConfig({
        lastError: 'Authentication expired. Please re-authenticate.',
      });
      return;
    }

    try {
      this.syncInProgress = true;

      // Perform sync
      const result = await this.performSync();

      if (result.success) {
        // Clear queue on success
        this.clearSyncQueue();

        // Reset failure count
        updateSyncConfig({
          syncFailureCount: 0,
          lastError: null,
          lastSyncTime: Date.now(),
        });
      } else {
        // Increment failure count
        const failureCount = config.syncFailureCount + 1;
        updateSyncConfig({
          syncFailureCount: failureCount,
          lastError: result.error || 'Unknown sync error',
        });

        // Retry with exponential backoff
        const retryDelay = Math.min(1000 * Math.pow(2, failureCount), 60000);
        setTimeout(() => this.processSyncQueue(), retryDelay);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      updateSyncConfig({
        syncFailureCount: config.syncFailureCount + 1,
        lastError: errorMessage,
      });
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Main sync logic
   */
  async performSync(): Promise<SyncResult> {
    try {
      const config = getSyncConfig();

      // Find or create Drive file
      let fileId = config.driveFileId;

      if (!fileId) {
        fileId = await this.driveService.findAppDataFile();
      }

      if (!fileId) {
        // No remote file exists - upload local data
        const localData = exportAllDataForSync();
        fileId = await this.driveService.createAppDataFile(localData);

        return {
          success: true,
          direction: 'upload',
          timestamp: Date.now(),
        };
      }

      // Get remote file metadata
      const metadata = await this.driveService.getFileMetadata(fileId);
      const remoteModifiedTime = new Date(metadata.modifiedTime).getTime();
      const localModifiedTime = getLastLocalChangeTime();

      // Resolve conflict using last-write-wins
      const resolution = await this.resolveConflict(
        localModifiedTime,
        remoteModifiedTime,
        fileId
      );

      return {
        success: true,
        direction: resolution.direction,
        timestamp: Date.now(),
        conflictResolution: resolution.type,
      };
    } catch (error) {
      console.error('Sync error:', error);
      return {
        success: false,
        direction: 'none',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Resolve conflict using last-write-wins strategy or manual resolution
   */
  private async resolveConflict(
    localTimestamp: number,
    remoteTimestamp: number,
    fileId: string
  ): Promise<{ direction: 'upload' | 'download' | 'none'; type: 'local-newer' | 'remote-newer' | 'same' | 'manual' | 'cancelled' }> {
    const timeDiff = Math.abs(localTimestamp - remoteTimestamp);
    const TOLERANCE = 1000; // 1 second tolerance for clock drift

    if (timeDiff < TOLERANCE) {
      // Timestamps are essentially the same
      return { direction: 'none', type: 'same' };
    }

    // If we have a conflict resolution callback, use manual resolution
    if (this.conflictResolutionCallback) {
      const localData = exportAllDataForSync();
      const remoteData = await this.driveService.downloadAppDataFile(fileId);

      const conflictInfo: ConflictInfo = {
        localTimestamp,
        remoteTimestamp,
        fileId,
        localData,
        remoteData,
      };

      const choice = await this.conflictResolutionCallback(conflictInfo);

      if (choice === 'cancel') {
        return { direction: 'none', type: 'cancelled' };
      }

      if (choice === 'keep-local') {
        // Upload local data
        await this.driveService.updateAppDataFile(fileId, localData);
        return { direction: 'upload', type: 'manual' };
      } else {
        // Download remote data
        importAllDataFromSync(remoteData.data);
        setLastLocalChangeTime(remoteTimestamp);
        return { direction: 'download', type: 'manual' };
      }
    }

    // Automatic last-write-wins resolution
    if (localTimestamp > remoteTimestamp) {
      // Local is newer - upload
      const localData = exportAllDataForSync();
      await this.driveService.updateAppDataFile(fileId, localData);
      return { direction: 'upload', type: 'local-newer' };
    } else {
      // Remote is newer - download
      const remoteData = await this.driveService.downloadAppDataFile(fileId);
      importAllDataFromSync(remoteData.data);
      setLastLocalChangeTime(remoteTimestamp);
      return { direction: 'download', type: 'remote-newer' };
    }
  }

  /**
   * Check and sync on app load
   */
  async checkAndSyncOnLoad(): Promise<void> {
    const config = getSyncConfig();

    if (!config.enabled || !this.driveService.hasValidToken()) {
      return;
    }

    try {
      await this.performSync();
    } catch (error) {
      console.error('App load sync failed:', error);

      // If offline, start polling
      if (!this.driveService.isOnline()) {
        this.startConnectivityPolling();
      }
    }
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    updateSyncConfig({ pendingSyncOperations: [] });
  }

  /**
   * Start connectivity polling
   */
  startConnectivityPolling(): void {
    if (this.connectivityPollInterval) {
      return; // Already polling
    }

    this.connectivityPollInterval = setInterval(() => {
      if (navigator.onLine && this.driveService.hasValidToken()) {
        this.onConnectivityRestored();
      }
    }, this.CONNECTIVITY_POLL_INTERVAL);
  }

  /**
   * Stop connectivity polling
   */
  stopConnectivityPolling(): void {
    if (this.connectivityPollInterval) {
      clearInterval(this.connectivityPollInterval);
      this.connectivityPollInterval = null;
    }
  }

  /**
   * Handle connectivity restoration
   */
  private async onConnectivityRestored() {
    try {
      // Verify connectivity with actual API call
      const config = getSyncConfig();

      if (config.driveFileId) {
        await this.driveService.getFileMetadata(config.driveFileId);
      }

      // Connectivity confirmed - stop polling and process queue
      this.stopConnectivityPolling();
      await this.processSyncQueue();
    } catch {
      // Still offline or API unavailable
    }
  }

  /**
   * Manual sync trigger
   */
  async manualSync(): Promise<SyncResult> {
    if (this.syncInProgress) {
      return {
        success: false,
        direction: 'none',
        timestamp: Date.now(),
        error: 'Sync already in progress',
      };
    }

    this.queueSyncOperation('manual');
    await this.processSyncQueue();

    const config = getSyncConfig();
    return {
      success: config.lastSyncTime !== null,
      direction: 'none', // Direction determined during sync
      timestamp: Date.now(),
    };
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isSyncing: boolean;
    hasError: boolean;
    lastError: string | null;
    lastSyncTime: number | null;
    pendingOperations: number;
  } {
    const config = getSyncConfig();

    return {
      isSyncing: this.syncInProgress,
      hasError: config.lastError !== null,
      lastError: config.lastError,
      lastSyncTime: config.lastSyncTime,
      pendingOperations: config.pendingSyncOperations.length,
    };
  }

  /**
   * Cleanup (for disconnecting sync)
   */
  cleanup(): void {
    this.stopConnectivityPolling();

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.syncInProgress = false;
  }
}

// Export singleton instance
import { googleDriveService } from './GoogleDriveService';
export const syncEngine = new SyncEngine(googleDriveService);
