import { Modal, Button } from '../common';

interface ConflictData {
  local: {
    wordCount: number;
    lastModified: number;
    hasProgress: boolean;
  };
  remote: {
    wordCount: number;
    lastModified: number;
    hasProgress: boolean;
  };
}

interface SyncConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflictData: ConflictData | null;
  onResolve: (choice: 'keep-local' | 'keep-remote') => void;
  isResolving: boolean;
}

export function SyncConflictResolutionModal({
  isOpen,
  onClose,
  conflictData,
  onResolve,
  isResolving,
}: SyncConflictResolutionModalProps) {
  if (!conflictData) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getTimeDifference = () => {
    const diff = Math.abs(conflictData.local.lastModified - conflictData.remote.lastModified);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    return 'less than a minute';
  };

  const isLocalNewer = conflictData.local.lastModified > conflictData.remote.lastModified;
  const timeDiff = Math.abs(conflictData.local.lastModified - conflictData.remote.lastModified);
  const isSignificantDifference = timeDiff > 1000; // More than 1 second difference

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Sync Conflict Detected">
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-500 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                Different data found
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-400">
                Your local data and Google Drive data are different. Choose which version to keep.
                {isSignificantDifference && (
                  <span className="block mt-1 font-medium">
                    Time difference: {getTimeDifference()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Data Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Local Data */}
          <div className={`border-2 rounded-lg p-4 ${
            isLocalNewer
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-border-secondary bg-bg-tertiary'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary">This Device</h3>
              {isLocalNewer && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                  NEWER
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-text-secondary">Last modified:</span>
                <div className="text-text-primary font-medium">
                  {formatDate(conflictData.local.lastModified)}
                </div>
              </div>

              <div>
                <span className="text-text-secondary">Words:</span>
                <span className="text-text-primary font-medium ml-2">
                  {conflictData.local.wordCount}
                </span>
              </div>

              <div>
                <span className="text-text-secondary">Progress:</span>
                <span className="text-text-primary font-medium ml-2">
                  {conflictData.local.hasProgress ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Remote Data */}
          <div className={`border-2 rounded-lg p-4 ${
            !isLocalNewer
              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
              : 'border-border-secondary bg-bg-tertiary'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-text-primary">Google Drive</h3>
              {!isLocalNewer && (
                <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-2 py-1 rounded">
                  NEWER
                </span>
              )}
            </div>

            <div className="space-y-2 text-sm">
              <div>
                <span className="text-text-secondary">Last modified:</span>
                <div className="text-text-primary font-medium">
                  {formatDate(conflictData.remote.lastModified)}
                </div>
              </div>

              <div>
                <span className="text-text-secondary">Words:</span>
                <span className="text-text-primary font-medium ml-2">
                  {conflictData.remote.wordCount}
                </span>
              </div>

              <div>
                <span className="text-text-secondary">Progress:</span>
                <span className="text-text-primary font-medium ml-2">
                  {conflictData.remote.hasProgress ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Warning about data loss */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <p className="text-sm text-red-700 dark:text-red-400">
            <strong>⚠️ Warning:</strong> The data you don't choose will be permanently overwritten.
            Consider exporting your local data first if you're unsure.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={() => onResolve('keep-local')}
            variant="primary"
            disabled={isResolving}
            className="w-full"
          >
            {isResolving ? 'Uploading...' : 'Keep This Device'}
            <div className="text-xs opacity-80 mt-1">Upload to Drive</div>
          </Button>

          <Button
            onClick={() => onResolve('keep-remote')}
            variant="primary"
            disabled={isResolving}
            className="w-full"
          >
            {isResolving ? 'Downloading...' : 'Keep Google Drive'}
            <div className="text-xs opacity-80 mt-1">Download to Device</div>
          </Button>

          <Button
            onClick={onClose}
            variant="secondary"
            disabled={isResolving}
            className="w-full"
          >
            Cancel
          </Button>
        </div>

        {/* Helper Text */}
        <div className="text-xs text-text-tertiary text-center border-t border-border-primary pt-4">
          Tip: The data marked as "NEWER" is recommended, but you can choose either version.
        </div>
      </div>
    </Modal>
  );
}
