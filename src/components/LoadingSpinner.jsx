import React, { memo } from 'react';

const LoadingSpinner = memo(({ size = 'large', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-blue-500 ${sizeClasses[size]}`}></div>
      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{text}</p>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner;
