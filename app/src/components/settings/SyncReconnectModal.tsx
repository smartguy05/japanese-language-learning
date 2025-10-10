import { useState } from 'react';
import { Button } from '../common/Button';

interface SyncReconnectModalProps {
  isOpen: boolean;
  onReconnect: () => Promise<void>;
  onDismiss: () => void;
}

export function SyncReconnectModal({ isOpen, onReconnect, onDismiss }: SyncReconnectModalProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleReconnect = async () => {
    try {
      setIsReconnecting(true);
      await onReconnect();
    } catch (error) {
      console.error('Reconnect failed:', error);
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onDismiss}
      />
      <div className="relative w-full max-w-md bg-bg-secondary dark:bg-bg-secondary-dark rounded-lg card-shadow-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg
              className="w-6 h-6 text-yellow-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Reconnect to Google Drive
            </h3>
            <p className="text-text-secondary mb-4">
              Your Google Drive session has expired. Reconnect to continue syncing your data.
            </p>
            <div className="p-3 bg-bg-tertiary-light dark:bg-bg-tertiary-dark rounded-lg border border-border-subtle">
              <p className="text-sm text-text-secondary">
                You'll be asked to sign in to your Google account to grant access again. Your data is safe and will sync once reconnected.
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            variant="secondary"
            onClick={onDismiss}
            fullWidth
            disabled={isReconnecting}
          >
            Not Now
          </Button>
          <Button
            variant="primary"
            onClick={handleReconnect}
            isLoading={isReconnecting}
            disabled={isReconnecting}
            fullWidth
          >
            Reconnect
          </Button>
        </div>
      </div>
    </div>
  );
}
