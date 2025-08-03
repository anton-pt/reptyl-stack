import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${sizeClasses[size]} ${className}`}
    />
  );
};

interface TypingIndicatorProps {
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="h-2 w-2 animate-pulse rounded-full bg-gray-400"></div>
      <div
        className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
        style={{ animationDelay: '0.2s' }}
      ></div>
      <div
        className="h-2 w-2 animate-pulse rounded-full bg-gray-400"
        style={{ animationDelay: '0.4s' }}
      ></div>
    </div>
  );
};
