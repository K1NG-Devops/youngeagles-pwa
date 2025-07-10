import React, { useEffect, useState } from 'react';
import { FaTimes, FaDownload, FaExpand, FaCompress } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ImageModal - Full-screen image viewer with zoom and download capabilities
 * Features: Pinch to zoom, double-tap zoom, download, touch gestures
 */
const ImageModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  imageAlt = 'Image',
  showDownload = true,
  showZoom = true 
}) => {
  const { isDark } = useTheme();
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);

  // Reset zoom and position when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomed(false);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  // Calculate distance between two touch points
  const getTouchDistance = (touches) => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Handle wheel zoom (desktop)
  const handleWheel = (e) => {
    if (!showZoom) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
    setIsZoomed(newScale > 1);
  };

  // Handle double click/tap zoom
  const handleDoubleClick = () => {
    if (!showZoom) return;
    
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomed(false);
    } else {
      setScale(2);
      setIsZoomed(true);
    }
  };

  // Handle touch start
  const handleTouchStart = (e) => {
    const now = Date.now();
    const touches = e.touches;

    if (touches.length === 1) {
      // Single touch - check for double tap
      if (now - lastTouchTime < 300) {
        handleDoubleClick();
      }
      setLastTouchTime(now);
      setIsDragging(true);
    } else if (touches.length === 2 && showZoom) {
      // Two fingers - prepare for pinch zoom
      const distance = getTouchDistance(touches);
      setLastTouchDistance(distance);
    }
  };

  // Handle touch move
  const handleTouchMove = (e) => {
    e.preventDefault();
    const touches = e.touches;

    if (touches.length === 1 && isDragging && scale > 1) {
      // Single finger drag when zoomed
      const touch = touches[0];
      const deltaX = touch.clientX - (position.x || touch.clientX);
      const deltaY = touch.clientY - (position.y || touch.clientY);
      
      setPosition(prev => ({
        x: prev.x + deltaX * 0.5,
        y: prev.y + deltaY * 0.5
      }));
    } else if (touches.length === 2 && showZoom) {
      // Two finger pinch zoom
      const distance = getTouchDistance(touches);
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        const newScale = Math.max(0.5, Math.min(3, scale * scaleChange));
        setScale(newScale);
        setIsZoomed(newScale > 1);
      }
      setLastTouchDistance(distance);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  // Handle download
  const handleDownload = async () => {
    if (!showDownload || !imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile-picture-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  // Reset zoom
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setIsZoomed(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center space-x-3">
            {showZoom && (
              <button
                onClick={resetZoom}
                disabled={scale === 1}
                className={`p-3 rounded-full transition-all duration-200 touch-responsive ${
                  scale === 1 
                    ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed' 
                    : 'bg-white/20 text-white hover:bg-white/30 active:scale-95'
                }`}
                title="Reset zoom"
              >
                {isZoomed ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />}
              </button>
            )}
            
            {showDownload && (
              <button
                onClick={handleDownload}
                className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200 touch-responsive active:scale-95"
                title="Download image"
              >
                <FaDownload className="text-lg" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200 touch-responsive active:scale-95"
            title="Close"
          >
            <FaTimes className="text-lg" />
          </button>
        </div>

        {/* Image Container */}
        <div 
          className="flex-1 flex items-center justify-center p-4 overflow-hidden"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={imageUrl}
            alt={imageAlt}
            className="max-w-full max-h-full object-contain transition-transform duration-200 select-none"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
            }}
            draggable={false}
          />
        </div>

        {/* Instructions */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
          <div className="text-center text-white/80 text-sm">
            <p className="mb-1">
              {showZoom && (
                <>
                  <span className="hidden sm:inline">Double-click or scroll to zoom • </span>
                  <span className="sm:hidden">Double-tap or pinch to zoom • </span>
                </>
              )}
              Tap outside to close
            </p>
            {isZoomed && (
              <p className="text-xs text-white/60">
                <span className="hidden sm:inline">Drag to pan when zoomed</span>
                <span className="sm:hidden">Drag to move when zoomed</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;