import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaGraduationCap, FaSpinner, FaWifi } from 'react-icons/fa';

const AdaptiveLoader = ({ 
  isLoading, 
  loadingText = 'Loading...', 
  children,
  showProgress = false,
  progress = 0,
  delay = 0
}) => {
  const { isDark } = useTheme();
  const [showLoader, setShowLoader] = useState(false);
  const [dots, setDots] = useState('');

  // Delay showing loader to prevent flashing
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowLoader(false);
    }
  }, [isLoading, delay]);

  // Animated dots for loading text
  useEffect(() => {
    if (showLoader) {
      const interval = setInterval(() => {
        setDots(prev => prev.length >= 3 ? '' : prev + '.');
      }, 500);
      return () => clearInterval(interval);
    }
  }, [showLoader]);

  if (!showLoader) {
    return children;
  }

  return (
    <div className={`
      flex flex-col items-center justify-center min-h-screen p-6
      ${isDark ? 'bg-gray-900' : 'bg-gray-50'}
      transition-colors duration-300
    `}>
      {/* Young Eagles Logo Animation */}
      <div className="relative mb-8">
        <div className={`
          w-20 h-20 rounded-full flex items-center justify-center
          ${isDark ? 'bg-blue-600' : 'bg-blue-500'}
          animate-pulse
        `}>
          <FaGraduationCap className="text-3xl text-white" />
        </div>
        
        {/* Spinning border */}
        <div className={`
          absolute inset-0 w-20 h-20 border-4 border-transparent
          ${isDark ? 'border-t-blue-400' : 'border-t-blue-300'}
          rounded-full animate-spin
        `}></div>
      </div>

      {/* Loading Text */}
      <div className="text-center mb-6">
        <h2 className={`
          text-xl font-semibold mb-2
          ${isDark ? 'text-white' : 'text-gray-900'}
        `}>
          Young Eagles
        </h2>
        <p className={`
          text-sm
          ${isDark ? 'text-gray-400' : 'text-gray-600'}
        `}>
          {loadingText}{dots}
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="w-full max-w-xs mb-6">
          <div className={`
            w-full h-2 rounded-full
            ${isDark ? 'bg-gray-700' : 'bg-gray-200'}
          `}>
            <div 
              className={`
                h-full rounded-full transition-all duration-300 ease-out
                ${isDark ? 'bg-blue-500' : 'bg-blue-600'}
              `}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className={`
            text-xs mt-2 text-center
            ${isDark ? 'text-gray-500' : 'text-gray-400'}
          `}>
            {Math.round(progress)}% complete
          </p>
        </div>
      )}

      {/* Connection Status */}
      <div className={`
        flex items-center space-x-2 text-xs
        ${isDark ? 'text-gray-500' : 'text-gray-400'}
      `}>
        <FaWifi className="w-3 h-3" />
        <span>Connecting to Young Eagles...</span>
      </div>

      {/* Subtle animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AdaptiveLoader;
