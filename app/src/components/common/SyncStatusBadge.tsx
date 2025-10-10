import { useSyncContext } from '../../contexts/SyncContext';

interface SyncStatusBadgeProps {
  onClick?: () => void;
  showText?: boolean;
}

export function SyncStatusBadge({ onClick, showText = true }: SyncStatusBadgeProps) {
  const { syncEnabled, syncStatus, lastSyncTime } = useSyncContext();

  // Don't show badge if sync is not enabled
  if (!syncEnabled) {
    return null;
  }

  const getRelativeTime = (timestamp: number | null): string => {
    if (!timestamp) return 'Never';

    const now = Date.now();
    const diff = now - timestamp;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 10) return 'now';
    if (seconds < 60) return `${seconds}s`;
    if (minutes < 60) return `${minutes}m`;
    return `${hours}h`;
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return (
          <svg className="w-4 h-4 animate-spin text-indigo" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );

      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );

      case 'offline':
        return (
          <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
          </svg>
        );

      default: // 'idle' - synced successfully
        return (
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync failed';
      case 'offline':
        return 'Offline';
      default:
        return `Synced ${getRelativeTime(lastSyncTime)}`;
    }
  };

  const getTitleText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing your data to Google Drive...';
      case 'error':
        return 'Sync failed. Click for details.';
      case 'offline':
        return 'Offline. Will sync when connection is restored.';
      default:
        return `Last synced ${getRelativeTime(lastSyncTime)} ago. Click to sync now.`;
    }
  };

  return (
    <button
      onClick={onClick}
      title={getTitleText()}
      className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-bg-tertiary-dark hover:bg-opacity-80 transition-colors text-sm text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-indigo focus:ring-offset-2"
    >
      {getStatusIcon()}
      {showText && (
        <span className="font-medium">{getStatusText()}</span>
      )}
    </button>
  );
}
