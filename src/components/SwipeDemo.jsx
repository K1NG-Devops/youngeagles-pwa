import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeGestures, useTapGestures } from '../hooks/useGestures';
import { useTheme } from '../contexts/ThemeContext';

const SwipeDemo = () => {
  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  const items = [
    {
      id: 1,
      title: 'Swipe Left/Right',
      description: 'Navigate between items with horizontal swipes',
      color: 'bg-gradient-to-br from-blue-500 to-purple-600',
      icon: '👈👉'
    },
    {
      id: 2,
      title: 'Swipe Up/Down',
      description: 'Trigger actions with vertical swipes',
      color: 'bg-gradient-to-br from-green-500 to-teal-600',
      icon: '👆👇'
    },
    {
      id: 3,
      title: 'Tap Gestures',
      description: 'Single tap, double tap, and long press',
      color: 'bg-gradient-to-br from-orange-500 to-red-600',
      icon: '👆'
    },
    {
      id: 4,
      title: 'Haptic Feedback',
      description: 'Feel the vibration on supported devices',
      color: 'bg-gradient-to-br from-purple-500 to-pink-600',
      icon: '📳'
    }
  ];

  // Handle swipe gestures
  const handleSwipe = (direction) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    switch (direction) {
    case 'left':
      setCurrentIndex((prev) => (prev + 1) % items.length);
      setShowFeedback('Swiped Left → Next');
      break;
    case 'right':
      setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
      setShowFeedback('Swiped Right → Previous');
      break;
    case 'up':
      setShowFeedback('Swiped Up → Action Triggered');
      break;
    case 'down':
      setShowFeedback('Swiped Down → Menu Opened');
      break;
    }
  };

  // Handle tap gestures
  const handleTap = () => {
    setShowFeedback('Single Tap');
    if ('vibrate' in navigator) {
      navigator.vibrate(30);
    }
  };

  const handleDoubleTap = () => {
    setIsLiked(!isLiked);
    setShowFeedback('Double Tap → Liked!');
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 100, 30]);
    }
  };

  const handleLongPress = () => {
    setShowFeedback('Long Press → Context Menu');
    if ('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  };

  // Get refs for gesture handling
  const swipeRef = useSwipeGestures(handleSwipe);
  const tapRef = useTapGestures(handleTap, handleDoubleTap, handleLongPress);

  // Clear feedback after 2 seconds
  useEffect(() => {
    if (showFeedback) {
      const timer = setTimeout(() => {
        setShowFeedback('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showFeedback]);

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Mobile Gestures Demo
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Try swiping, tapping, and long pressing!
          </p>
        </div>

        {/* Feedback Display */}
        <AnimatePresence>
          {showFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`text-center p-3 rounded-lg ${
                isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
              } shadow-lg border-2 border-blue-500`}
            >
              {showFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Swipe Cards */}
        <div className="relative h-64 overflow-hidden">
          <div
            ref={swipeRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className={`w-full h-full rounded-xl p-6 text-white flex flex-col items-center justify-center text-center ${items[currentIndex].color}`}
              >
                <div className="text-4xl mb-4">{items[currentIndex].icon}</div>
                <h2 className="text-xl font-bold mb-2">{items[currentIndex].title}</h2>
                <p className="text-sm opacity-90">{items[currentIndex].description}</p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex
                  ? 'bg-blue-500'
                  : isDark
                    ? 'bg-gray-600'
                    : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Tap Gesture Demo */}
        <div
          ref={tapRef}
          className={`w-full p-6 rounded-xl text-center cursor-pointer transition-all duration-200 transform hover:scale-105 ${
            isDark
              ? 'bg-gray-800 text-white hover:bg-gray-700'
              : 'bg-white text-gray-900 hover:bg-gray-50'
          } shadow-lg border-2 ${isLiked ? 'border-red-500' : 'border-gray-300'}`}
        >
          <div className="text-3xl mb-2">{isLiked ? '❤️' : '🤍'}</div>
          <h3 className="font-bold mb-1">Tap Interaction Zone</h3>
          <p className="text-sm opacity-70">
            Single tap, double tap to like, long press for menu
          </p>
        </div>

        {/* Instructions */}
        <div className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="mb-2">
            <strong>Swipe:</strong> Left/Right to navigate, Up/Down for actions
          </p>
          <p className="mb-2">
            <strong>Tap:</strong> Single tap, double tap to like, long press for menu
          </p>
          <p>
            <strong>Haptic:</strong> Feel vibrations on supported devices
          </p>
        </div>
      </div>
    </div>
  );
};

export default SwipeDemo;
