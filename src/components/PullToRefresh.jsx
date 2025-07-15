import React, { useState, useEffect, useCallback } from 'react';
import { FaSync } from 'react-icons/fa';

const PullToRefresh = ({ onRefresh, children, className = '' }) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const PULL_THRESHOLD = 80;
  const MAX_PULL_DISTANCE = 120;

  const handleTouchStart = useCallback((e) => {
    // Only allow pull-to-refresh when at the top of the page
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
    if (scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setCanPull(true);
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!canPull || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const deltaY = currentY - startY;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;

    if (deltaY > 0 && scrollTop === 0) {
      e.preventDefault();
      setIsPulling(true);
      const distance = Math.min(deltaY * 0.5, MAX_PULL_DISTANCE);
      setPullDistance(distance);
    }
  }, [canPull, startY, isRefreshing]);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      }
      
      // Small delay to show the refresh animation
      setTimeout(() => {
        setIsRefreshing(false);
        setIsPulling(false);
        setPullDistance(0);
        setCanPull(false);
      }, 1000);
    } else {
      setIsPulling(false);
      setPullDistance(0);
      setCanPull(false);
    }
  }, [isPulling, pullDistance, isRefreshing, onRefresh]);

  useEffect(() => {
    const container = document.body;
    
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const getIndicatorStyle = () => {
    const opacity = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const scale = Math.min(pullDistance / PULL_THRESHOLD, 1);
    
    return {
      transform: `translateY(${pullDistance}px) scale(${scale})`,
      opacity: opacity,
      transition: isPulling ? 'none' : 'all 0.3s ease-out'
    };
  };

  return (
    <div className={`relative ${className}`}>
      {/* Pull-to-refresh indicator */}
      <div
        className="absolute top-0 left-1/2 transform -translate-x-1/2 z-50"
        style={getIndicatorStyle()}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-3 border border-gray-200 dark:border-gray-700">
          <FaSync 
            className={`text-blue-500 text-lg ${isRefreshing ? 'animate-spin' : ''}`}
          />
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          transform: `translateY(${isPulling ? pullDistance : 0}px)`,
          transition: isPulling ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>

      {/* Refresh message */}
      {isPulling && (
        <div 
          className="absolute top-4 left-1/2 transform -translate-x-1/2 text-center z-40"
          style={{ transform: `translateX(-50%) translateY(${pullDistance}px)` }}
        >
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-16">
            {pullDistance >= PULL_THRESHOLD 
              ? 'Release to refresh' 
              : 'Pull down to refresh'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default PullToRefresh;
