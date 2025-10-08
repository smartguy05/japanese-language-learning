import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'elevated' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({
  children,
  className = '',
  variant = 'default',
  padding = 'medium',
}: CardProps) {
  const baseStyles = 'rounded-lg';

  const variantStyles = {
    default: 'bg-bg-secondary dark:bg-bg-secondary-dark border border-border-subtle',
    elevated: 'bg-bg-secondary dark:bg-bg-secondary-dark card-shadow-lg',
    flat: 'bg-bg-tertiary dark:bg-bg-tertiary-dark',
  };

  const paddingStyles = {
    none: '',
    small: 'p-3',
    medium: 'p-4 md:p-6',
    large: 'p-6 md:p-8',
  };

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${className}`}>
      {children}
    </div>
  );
}
