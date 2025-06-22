import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FloatingBackButton = ({ 
  onClick, 
  position = 'top-left', 
  theme = 'dark',
  className = ''
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1); // Go back in history
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      default:
        return 'top-4 left-4';
    }
  };

  const getThemeClasses = () => {
    switch (theme) {
      case 'light':
        return 'bg-white text-gray-800 shadow-lg border border-gray-200 hover:bg-gray-50';
      case 'dark':
        return 'bg-gray-900 text-white shadow-lg hover:bg-gray-800';
      case 'primary':
        return 'bg-blue-600 text-white shadow-lg hover:bg-blue-700';
      case 'accent':
        return 'bg-green-500 text-white shadow-lg hover:bg-green-600';
      default:
        return 'bg-gray-900 text-white shadow-lg hover:bg-gray-800';
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        fixed z-50 p-3 rounded-full transition-all duration-200
        transform hover:scale-110 active:scale-95
        ${getPositionClasses()}
        ${getThemeClasses()}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)'
      }}
    >
      <FaArrowLeft size={18} />
    </button>
  );
};

export default FloatingBackButton; 