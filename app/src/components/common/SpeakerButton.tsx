import { useState } from 'react';
import { Button } from './Button';

interface SpeakerButtonProps {
  text: string;
  onSpeak: (text: string) => void;
  isSpeaking?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
  ariaLabel?: string;
}

/**
 * Speaker button component for text-to-speech
 * Shows animated speaker icon when speaking
 */
export function SpeakerButton({
  text,
  onSpeak,
  isSpeaking = false,
  size = 'medium',
  variant = 'ghost',
  className = '',
  ariaLabel,
}: SpeakerButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (text.trim()) {
      onSpeak(text);
    }
  };

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      size={size}
      className={`transition-all ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={ariaLabel || `Speak: ${text}`}
      disabled={!text.trim()}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`w-5 h-5 ${isSpeaking ? 'animate-pulse' : ''}`}
      >
        {/* Speaker cone */}
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />

        {/* Sound waves - animate when speaking or hovered */}
        {(isSpeaking || isHovered) && (
          <>
            <path
              d="M15.54 8.46a5 5 0 0 1 0 7.07"
              className={isSpeaking ? 'animate-pulse' : ''}
            />
            <path
              d="M19.07 4.93a10 10 0 0 1 0 14.14"
              className={isSpeaking ? 'animate-pulse' : ''}
              style={{ animationDelay: '0.1s' }}
            />
          </>
        )}
      </svg>
    </Button>
  );
}
