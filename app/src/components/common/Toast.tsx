import { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

/**
 * Toast notification component
 * Auto-dismisses after duration (default 3000ms)
 */
export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-success text-white border-success',
    error: 'bg-error text-white border-error',
    warning: 'bg-warning text-white border-warning',
    info: 'bg-indigo text-white border-indigo',
  };

  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 min-w-[300px] max-w-md p-4 rounded-lg shadow-lg border-2 ${typeStyles[type]} animate-slide-in-up`}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{icons[type]}</span>
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close notification"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes slide-in-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in-up {
          animation: slide-in-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
