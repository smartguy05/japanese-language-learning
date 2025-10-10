/**
 * Sync Context
 * Provides sync state and operations to the application
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { SyncStatus, SyncReason } from '../types';
import { googleDriveService } from '../services/GoogleDriveService';
import { syncEngine, type ConflictInfo } from '../services/SyncEngine';
import { getSyncConfig, updateSyncConfig, clearSyncConfig } from '../utils/storage';

interface SyncContextValue {
  // State
  syncEnabled: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: number | null;
  isAuthenticated: boolean;
  pendingSyncCount: number;
  lastError: string | null;
  pendingConflict: ConflictInfo | null;

  // Actions
  enableSync: () => Promise<void>;
  disableSync: (deleteRemote: boolean) => Promise<void>;
  manualSync: () => Promise<void>;
  triggerSync: (reason: SyncReason) => void;
  resolveConflict: (choice: 'keep-local' | 'keep-remote' | 'cancel') => void;

  // Utilities
  refreshStatus: () => void;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

interface SyncProviderProps {
  children: React.ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [lastError, setLastError] = useState<string | null>(null);
  const [pendingConflict, setPendingConflict] = useState<ConflictInfo | null>(null);
  const [conflictResolver, setConflictResolver] = useState<((choice: 'keep-local' | 'keep-remote' | 'cancel') => void) | null>(null);

  /**
   * Refresh sync status from storage and engine
   */
  const refreshStatus = useCallback(() => {
    const config = getSyncConfig();
    const status = syncEngine.getSyncStatus();

    setSyncEnabled(config.enabled);
    setIsAuthenticated(googleDriveService.hasValidToken());
    setLastSyncTime(config.lastSyncTime);
    setPendingSyncCount(status.pendingOperations);
    setLastError(status.lastError);

    // Determine sync status
    if (status.isSyncing) {
      setSyncStatus('syncing');
    } else if (status.hasError) {
      setSyncStatus('error');
    } else if (!navigator.onLine) {
      setSyncStatus('offline');
    } else {
      setSyncStatus('idle');
    }
  }, []);

  /**
   * Enable sync - initiates OAuth flow
   */
  const enableSync = useCallback(async () => {
    try {
      setSyncStatus('syncing');

      // Initiate OAuth
      await googleDriveService.initiateOAuth();

      // Perform initial sync
      await syncEngine.checkAndSyncOnLoad();

      refreshStatus();
    } catch (error) {
      console.error('Failed to enable sync:', error);
      setSyncStatus('error');
      setLastError(error instanceof Error ? error.message : 'Failed to enable sync');

      // Revert enabled status
      updateSyncConfig({ enabled: false });
      setSyncEnabled(false);

      throw error;
    }
  }, [refreshStatus]);

  /**
   * Disable sync - optionally delete remote data
   */
  const disableSync = useCallback(async (deleteRemote: boolean) => {
    try {
      const config = getSyncConfig();

      // Delete remote file if requested
      if (deleteRemote && config.driveFileId) {
        await googleDriveService.deleteAppDataFile(config.driveFileId);
      }

      // Revoke OAuth token
      await googleDriveService.revokeToken();

      // Clear sync configuration
      clearSyncConfig();

      // Cleanup sync engine
      syncEngine.cleanup();

      // Update state
      setSyncEnabled(false);
      setIsAuthenticated(false);
      setLastSyncTime(null);
      setPendingSyncCount(0);
      setLastError(null);
      setSyncStatus('idle');
    } catch (error) {
      console.error('Failed to disable sync:', error);
      throw error;
    }
  }, []);

  /**
   * Trigger manual sync
   */
  const manualSync = useCallback(async () => {
    if (!syncEnabled || !isAuthenticated) {
      throw new Error('Sync not enabled or not authenticated');
    }

    try {
      setSyncStatus('syncing');
      await syncEngine.manualSync();
      refreshStatus();
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('error');
      throw error;
    }
  }, [syncEnabled, isAuthenticated, refreshStatus]);

  /**
   * Trigger automatic sync (queued and debounced)
   */
  const triggerSync = useCallback((reason: SyncReason) => {
    if (!syncEnabled || !isAuthenticated) {
      return;
    }

    syncEngine.queueSyncOperation(reason);
    refreshStatus();
  }, [syncEnabled, isAuthenticated, refreshStatus]);

  /**
   * Resolve pending conflict
   */
  const resolveConflict = useCallback((choice: 'keep-local' | 'keep-remote' | 'cancel') => {
    if (conflictResolver) {
      conflictResolver(choice);
      setPendingConflict(null);
      setConflictResolver(null);
    }
  }, [conflictResolver]);

  /**
   * Setup conflict resolution callback for SyncEngine
   */
  useEffect(() => {
    const conflictCallback = async (conflict: ConflictInfo): Promise<'keep-local' | 'keep-remote' | 'cancel'> => {
      return new Promise((resolve) => {
        setPendingConflict(conflict);
        setConflictResolver(() => (choice: 'keep-local' | 'keep-remote' | 'cancel') => {
          resolve(choice);
        });
      });
    };

    syncEngine.setConflictResolutionCallback(conflictCallback);

    return () => {
      syncEngine.clearConflictResolutionCallback();
    };
  }, []);

  /**
   * Initialize: load sync status and perform app load sync
   */
  useEffect(() => {
    refreshStatus();

    // If sync is enabled, perform app load sync
    const config = getSyncConfig();
    if (config.enabled && googleDriveService.hasValidToken()) {
      syncEngine.checkAndSyncOnLoad().then(() => {
        refreshStatus();
      }).catch((error) => {
        console.error('App load sync failed:', error);
        refreshStatus();
      });
    }

    // Poll status periodically
    const intervalId = setInterval(refreshStatus, 5000); // Every 5 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, [refreshStatus]);

  /**
   * Listen for online/offline events
   */
  useEffect(() => {
    const handleOnline = () => {
      refreshStatus();

      // Retry pending syncs when coming online
      if (syncEnabled && pendingSyncCount > 0) {
        syncEngine.processSyncQueue();
      }
    };

    const handleOffline = () => {
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncEnabled, pendingSyncCount, refreshStatus]);

  const value: SyncContextValue = {
    syncEnabled,
    syncStatus,
    lastSyncTime,
    isAuthenticated,
    pendingSyncCount,
    lastError,
    pendingConflict,
    enableSync,
    disableSync,
    manualSync,
    triggerSync,
    resolveConflict,
    refreshStatus,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

/**
 * Hook to use sync context
 */
export function useSyncContext() {
  const context = useContext(SyncContext);

  if (context === undefined) {
    throw new Error('useSyncContext must be used within a SyncProvider');
  }

  return context;
}
