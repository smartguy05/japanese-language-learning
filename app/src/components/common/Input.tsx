import { InputHTMLAttributes, forwardRef, useState } from 'react';
import * as wanakana from 'wanakana';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  enableJapaneseInput?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, enableJapaneseInput = false, className = '', ...props }, ref) => {
    const [isJapaneseMode, setIsJapaneseMode] = useState(false);

    const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
      if (isJapaneseMode && enableJapaneseInput) {
        const input = e.currentTarget;
        wanakana.bind(input);
      }
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            className={`w-full px-4 py-2 min-h-[48px] rounded-lg bg-bg-tertiary dark:bg-bg-tertiary-dark text-text-primary border ${
              error ? 'border-error' : 'border-border-medium'
            } focus:outline-none focus:ring-2 focus:ring-indigo focus:border-transparent transition-colors ${className}`}
            onInput={handleInput}
            {...props}
          />
          {enableJapaneseInput && (
            <button
              type="button"
              onClick={() => setIsJapaneseMode(!isJapaneseMode)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs rounded bg-bg-secondary dark:bg-bg-secondary-dark hover:bg-opacity-80 transition-colors"
              title="Toggle Japanese input"
            >
              {isJapaneseMode ? 'あ' : 'A'}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
