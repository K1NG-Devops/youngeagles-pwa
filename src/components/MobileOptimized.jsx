import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Mobile-Optimized Container Component
 * Provides consistent mobile responsiveness across the app
 */
export const MobileContainer = ({ children, className = '', fullHeight = true }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      ${fullHeight ? 'min-h-screen' : ''}
      flex items-center justify-center 
      py-4 sm:py-8 md:py-12 
      px-2 xs:px-4 sm:px-6 lg:px-8 
      transition-all duration-500
      ${className}
    `}>
      {children}
    </div>
  );
};

/**
 * Mobile-Optimized Form Container
 */
export const MobileFormContainer = ({ children, className = '' }) => {
  const { isDark } = useTheme();
  
  return (
    <div className={`
      w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-lg
      space-y-6 sm:space-y-8
      relative z-10
      ${className}
    `}>
      <div className={`
        rounded-2xl sm:rounded-3xl 
        shadow-xl sm:shadow-2xl 
        p-2 xs:p-4 sm:p-6 md:p-8 
        space-y-4 xs:space-y-6 sm:space-y-8
        backdrop-blur-xl 
        border-2 
        transition-all duration-500
        ${isDark 
      ? 'bg-gray-800/30 border-gray-700/50' 
      : 'bg-white/70 border-white/50'
    }
      `}>
        {children}
      </div>
    </div>
  );
};

/**
 * Mobile-Optimized Input Field
 */
export const MobileInput = ({ 
  icon: Icon, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  required = false,
  disabled = false,
  hasRightIcon = false,
  rightIcon = null,
  ...props 
}) => {
  const { isDark } = useTheme();
  
  return (
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
          <Icon className={`text-base sm:text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`} />
        </div>
      )}
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`
          block w-full 
          ${Icon ? 'pl-12 sm:pl-14' : 'pl-4 sm:pl-5'} 
          ${hasRightIcon ? 'pr-12 sm:pr-14' : 'pr-4 sm:pr-5'}
          py-3 sm:py-4 
          border-2 rounded-xl 
          focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 
          transition-all duration-200 
          text-base sm:text-lg
          min-h-[48px] sm:min-h-[56px]
          ${isDark 
      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400' 
      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500'
    }
          backdrop-blur-sm
        `}
        placeholder={placeholder}
        {...props}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-4 sm:pr-5 flex items-center">
          {rightIcon}
        </div>
      )}
    </div>
  );
};

/**
 * Mobile-Optimized Button
 */
export const MobileButton = ({ 
  children, 
  onClick, 
  disabled = false, 
  loading = false,
  variant = 'primary',
  size = 'large',
  className = '',
  ...props 
}) => {
  const { isDark } = useTheme();
  
  const baseClasses = `
    w-full flex justify-center items-center
    border-2 border-transparent
    font-semibold sm:font-bold
    rounded-xl
    transition-all duration-300
    transform hover:scale-105 hover:shadow-2xl
    focus:outline-none focus:ring-4 focus:ring-blue-500/20
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    min-h-[48px] sm:min-h-[56px]
  `;
  
  const sizeClasses = {
    small: 'py-2 px-4 text-sm',
    medium: 'py-3 px-6 text-base',
    large: 'py-3 sm:py-4 px-6 sm:px-8 text-base sm:text-lg'
  };
  
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-blue-600 to-purple-600
      text-white shadow-xl
      hover:shadow-blue-500/25
    `,
    secondary: `
      ${isDark 
    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
}
    `,
    outline: `
      border-2 border-blue-600 text-blue-600
      hover:bg-blue-600 hover:text-white
    `
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Loading...
        </div>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Mobile-Optimized Selection Buttons
 */
export const MobileSelectionGroup = ({ options, selected, onSelect, disabled = false }) => {
  const { isDark } = useTheme();
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          disabled={disabled}
          className={`
            px-3 sm:px-4 py-3 sm:py-3
            text-sm sm:text-base font-medium sm:font-semibold
            rounded-lg sm:rounded-xl
            transition-all duration-200
            transform hover:scale-105
            min-h-[44px] sm:min-h-[48px]
            ${selected === option.value
          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
          : isDark
            ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-2 border-gray-600'
            : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-2 border-gray-200'
        }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default {
  MobileContainer,
  MobileFormContainer,
  MobileInput,
  MobileButton,
  MobileSelectionGroup
}; 