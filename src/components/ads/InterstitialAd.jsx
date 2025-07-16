import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const InterstitialAd = ({ 
  isOpen, 
  onClose, 
  type = 'educational',
  autoCloseAfter = 5000,
  allowEarlyClose = true 
}) => {
  const { isDark } = useTheme();
  const [countdown, setCountdown] = useState(autoCloseAfter ? Math.ceil(autoCloseAfter / 1000) : 0);
  const [canClose, setCanClose] = useState(!autoCloseAfter || allowEarlyClose);

  useEffect(() => {
    if (!isOpen) return;

    // Auto-close timer
    let autoCloseTimer;
    if (autoCloseAfter) {
      autoCloseTimer = setTimeout(() => {
        onClose();
      }, autoCloseAfter);
    }

    // Countdown timer
    let countdownTimer;
    if (autoCloseAfter && countdown > 0) {
      countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            setCanClose(true);
            clearInterval(countdownTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      if (countdownTimer) clearInterval(countdownTimer);
    };
  }, [isOpen, autoCloseAfter, countdown, onClose]);

  // Reset countdown when ad opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(autoCloseAfter ? Math.ceil(autoCloseAfter / 1000) : 0);
      setCanClose(!autoCloseAfter || allowEarlyClose);
    }
  }, [isOpen, autoCloseAfter, allowEarlyClose]);

  const getAdContent = () => {
    switch (type) {
      case 'educational':
        return {
          title: 'Educational Excellence',
          subtitle: 'Discover premium learning resources',
          content: 'Unlock your child\'s potential with our comprehensive educational platform. Interactive lessons, engaging activities, and personalized learning paths.',
          ctaText: 'Start Learning',
          bgColor: 'from-blue-600 to-purple-700',
          icon: '📚'
        };
      case 'games':
        return {
          title: 'Fun Learning Games',
          subtitle: 'Educational games that make learning enjoyable',
          content: 'Join thousands of students having fun while learning. Math, science, language arts, and more - all in engaging game formats.',
          ctaText: 'Play Now',
          bgColor: 'from-green-500 to-teal-600',
          icon: '🎮'
        };
      case 'reading':
        return {
          title: 'Reading Adventures',
          subtitle: 'Build strong reading skills',
          content: 'Interactive stories, phonics games, and reading comprehension activities designed to boost your child\'s literacy skills.',
          ctaText: 'Read More',
          bgColor: 'from-orange-500 to-red-600',
          icon: '📖'
        };
      case 'math':
        return {
          title: 'Math Mastery',
          subtitle: 'Make math fun and engaging',
          content: 'From basic arithmetic to advanced concepts, our interactive math lessons help students build confidence and excel in mathematics.',
          ctaText: 'Practice Now',
          bgColor: 'from-purple-600 to-pink-600',
          icon: '🔢'
        };
      default:
        return {
          title: 'Young Eagles Learning',
          subtitle: 'Enhance your educational journey',
          content: 'Discover amazing educational content and tools to support your child\'s learning adventure.',
          ctaText: 'Explore',
          bgColor: 'from-indigo-600 to-blue-700',
          icon: '🦅'
        };
    }
  };

  const adContent = getAdContent();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={canClose ? onClose : undefined}
      />
      
      {/* Ad Content */}
      <div className={`relative w-full max-w-lg mx-auto ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100`}>
        {/* Close Button */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black bg-opacity-20 hover:bg-opacity-40 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Countdown Timer */}
        {countdown > 0 && !canClose && (
          <div className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black bg-opacity-20 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{countdown}</span>
          </div>
        )}

        {/* Ad Header */}
        <div className={`bg-gradient-to-r ${adContent.bgColor} p-6 text-white`}>
          <div className="flex items-center justify-center mb-4">
            <div className="text-4xl mb-2">{adContent.icon}</div>
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">{adContent.title}</h2>
          <p className="text-center text-white/90 text-sm">{adContent.subtitle}</p>
        </div>

        {/* Ad Body */}
        <div className="p-6">
          <p className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-6 leading-relaxed`}>
            {adContent.content}
          </p>

          {/* CTA Button */}
          <div className="flex flex-col space-y-3">
            <button className={`w-full bg-gradient-to-r ${adContent.bgColor} text-white py-3 px-6 rounded-lg font-semibold text-lg transition-all duration-200 hover:shadow-lg transform hover:scale-105`}>
              {adContent.ctaText}
            </button>
            
            {/* Skip/Close Button */}
            <button
              onClick={onClose}
              className={`w-full ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} py-2 text-sm transition-colors duration-200`}
            >
              {canClose ? 'Skip Ad' : `Skip in ${countdown}s`}
            </button>
          </div>
        </div>

        {/* Ad Label */}
        <div className="absolute top-2 left-2">
          <span className={`text-xs px-2 py-1 rounded ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>
            Advertisement
          </span>
        </div>
      </div>
    </div>
  );
};

export default InterstitialAd;
