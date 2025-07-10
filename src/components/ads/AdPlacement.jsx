import React from 'react';
import YoungEaglesMainDisplay from './YoungEaglesMainDisplay';

const AdPlacement = ({ 
  position = 'content', // 'content', 'sidebar', 'footer', 'header', 'inline'
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  style = {},
  disabled = false
}) => {
  const getAdType = () => {
    switch (position) {
    case 'sidebar':
      return 'sidebar';
    case 'footer':
      return 'footer';
    case 'header':
    case 'inline':
    case 'content':
    default:
      return 'banner';
    }
  };

  const getAdClasses = () => {
    const baseClasses = 'ad-placement';
    
    const sizeClasses = {
      small: 'max-w-sm',
      medium: 'max-w-2xl',
      large: 'max-w-4xl'
    };

    const positionClasses = {
      content: 'mx-auto my-6',
      sidebar: 'w-full',
      footer: 'w-full',
      header: 'mx-auto',
      inline: 'mx-auto my-4'
    };

    return `${baseClasses} ${sizeClasses[size]} ${positionClasses[position]} ${className}`;
  };

  if (disabled) {
    return null;
  }

  return (
    <div className={getAdClasses()} style={style}>
      <YoungEaglesMainDisplay 
        adType={getAdType()}
        disabled={disabled}
      />
    </div>
  );
};

export default AdPlacement; 