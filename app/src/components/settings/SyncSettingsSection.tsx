import { useState } from 'react';
import { useSyncContext } from '../../contexts/SyncContext';
import { Button } from '../common/Button';
import { Card } from '../common/Card';
import { SyncPrivacyModal } from './SyncPrivacyModal';
import { SyncConflictResolutionModal } from './SyncConflictResolutionModal';

export function SyncSettingsSection() {
  const {
    syncEnabled,
    syncStatus,
    lastSyncTime,
    isAuthenticated,
    enableSync,
    disableSync,
    manualSync,
    lastError,
    pendingSyncCount,
    pendingConflict,
    resolveConflict,
  } = useSyncContext();

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const [deleteRemoteData, setDeleteRemoteData] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isResolvingConflict, setIsResolvingConflict] = useState(false);

  const handleEnableSync = async () => {
    try {
      setIsConnecting(true);
      await enableSync();
    } catch (error) {
      console.error('Failed to enable sync:', error);
      // Error is already shown in sync context
    } finally {
      setIsConnecting(false);
    }
  };

  const handleManualSync = async () => {
    try {
      setIsSyncing(true);
      await manualSync();
    } catch (error) {
      console.error('Manual sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true);
      await disableSync(deleteRemoteData);
      setShowDisconnectDialog(false);
      setDeleteRemoteData(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleResolveConflict = async (choice: 'keep-local' | 'keep-remote') => {
    try {
      setIsResolvingConflict(true);
      resolveConflict(choice);
      // Wait a bit for the sync to complete
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolvingConflict(false);
    }
  };

  const handleCancelConflict = () => {
    resolveConflict('cancel');
  };

  const getRelativeTime = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSyncStatusDisplay = () => {
    if (!syncEnabled) {
      return (
        <div className="flex items-center text-text-secondary">
          <span className="w-2 h-2 rounded-full bg-gray-400 mr-2" />
          <span>Sync disabled</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      return (
        <div className="flex items-center text-yellow-500">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Not authenticated</span>
        </div>
      );
    }

    switch (syncStatus) {
      case 'syncing':
        return (
          <div className="flex items-center text-indigo">
            <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Syncing...</span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center text-red-500">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>Sync failed</span>
          </div>
        );

      case 'offline':
        return (
          <div className="flex items-center text-yellow-600">
            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
            </svg>
            <span>Offline - will sync when online</span>
          </div>
        );

      default: // 'idle'
        return (
          <div className="flex items-center text-green-500">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Synced {getRelativeTime(lastSyncTime)}</span>
          </div>
        );
    }
  };

  return (
    <>
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Google Drive Sync
            </h2>
            <p className="text-text-secondary">
              Automatically sync your learning data across devices using Google Drive.
            </p>
          </div>

          {/* Not Connected State */}
          {!syncEnabled && (
            <div className="space-y-4">
              <div className="p-4 bg-bg-tertiary-dark rounded-lg border border-border-subtle">
                <p className="text-text-secondary mb-3">
                  Enable sync to backup your data and access it from any device.
                  Your data will be stored securely in your Google Drive.
                </p>
                <Button
                  variant="primary"
                  onClick={handleEnableSync}
                  isLoading={isConnecting}
                  disabled={isConnecting}
                >
                  Connect to Google Drive
                </Button>
              </div>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-indigo hover:underline text-sm"
              >
                What data is synced?
              </button>
            </div>
          )}

          {/* Connected State */}
          {syncEnabled && (
            <div className="space-y-4">
              {/* Status Display */}
              <div className="p-4 bg-bg-tertiary-dark rounded-lg border border-border-subtle space-y-3">
                {getSyncStatusDisplay()}

                {pendingSyncCount > 0 && (
                  <p className="text-sm text-text-secondary">
                    {pendingSyncCount} pending {pendingSyncCount === 1 ? 'operation' : 'operations'}
                  </p>
                )}

                {lastError && (
                  <div className="p-3 bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded text-red-500 text-sm">
                    <p className="font-semibold">Error:</p>
                    <p>{lastError}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={handleManualSync}
                  isLoading={isSyncing}
                  disabled={!isAuthenticated || isSyncing || syncStatus === 'syncing'}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sync Now
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => setShowDisconnectDialog(true)}
                  className="text-red-500 hover:bg-red-500 hover:bg-opacity-10"
                >
                  Disconnect
                </Button>
              </div>

              {/* Privacy Link */}
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-indigo hover:underline text-sm"
              >
                Privacy & data information
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* Disconnect Confirmation Dialog */}
      {showDisconnectDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setShowDisconnectDialog(false)}
          />
          <div className="relative w-full max-w-md bg-bg-secondary dark:bg-bg-secondary-dark rounded-lg card-shadow-lg p-6 space-y-4">
            <h3 className="text-xl font-semibold text-text-primary">
              Disconnect from Google Drive?
            </h3>
            <p className="text-text-secondary">
              Your local data will remain on this device, but will no longer sync to Google Drive.
            </p>

            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={deleteRemoteData}
                onChange={(e) => setDeleteRemoteData(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo border-gray-300 rounded focus:ring-indigo"
              />
              <span className="text-sm text-text-secondary">
                Also delete data from Google Drive
              </span>
            </label>

            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDisconnectDialog(false);
                  setDeleteRemoteData(false);
                }}
                fullWidth
                disabled={isDisconnecting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDisconnect}
                isLoading={isDisconnecting}
                disabled={isDisconnecting}
                fullWidth
                className="bg-red-500 hover:bg-red-600"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      <SyncPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Conflict Resolution Modal */}
      <SyncConflictResolutionModal
        isOpen={!!pendingConflict}
        onClose={handleCancelConflict}
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
        onResolve={handleResolveConflict}
        isResolving={isResolvingConflict}
      />
    </>
  );
}
