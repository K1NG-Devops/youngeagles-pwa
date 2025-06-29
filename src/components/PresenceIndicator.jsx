import React from 'react';

const PresenceIndicator = ({ status, size = 'sm', className = '' }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      case 'offline':
      default:
        return 'bg-gray-400';
    }
  };

  const getSizeClasses = (size) => {
    switch (size) {
      case 'xs':
        return 'w-2 h-2';
      case 'sm':
        return 'w-3 h-3';
      case 'md':
        return 'w-4 h-4';
      case 'lg':
        return 'w-5 h-5';
      default:
        return 'w-3 h-3';
    }
  };

  return (
    <div 
      className={`${getSizeClasses(size)} ${getStatusColor(status)} rounded-full border-2 border-white ${className}`}
      title={`Status: ${status}`}
    />
  );
};

export default PresenceIndicator; 