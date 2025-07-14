// Enhanced Image Component with Memory Optimization
// Addresses profile picture loading issues and memory usage

/* eslint-env browser */
/* global IntersectionObserver, Image */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import memoryOptimizer from '../utils/memoryOptimizer';

const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  fallbackSrc = '/images/default-avatar.png',
  placeholder = null,
  maxWidth = 800,
  maxHeight = 600,
  quality = 0.8,
  loading = 'lazy',
  onLoad = null,
  onError = null,
  enableCompression = true,
  cacheKey = null,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);
  const canvasRef = useRef(null);

  // Create intersection observer for lazy loading
  useEffect(() => {
    if (loading === 'lazy' && imgRef.current && !isVisible) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observerRef.current?.disconnect();
            }
          });
        },
        { threshold: 0.1, rootMargin: '50px' }
      );

      observerRef.current.observe(imgRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loading, isVisible]);

  // Load and optimize image
  const loadImage = useCallback(async (imageSrc) => {
    if (!imageSrc || hasError) return;

    try {
      setIsLoading(true);
      setHasError(false);

      // Check cache first
      const cacheId = cacheKey || imageSrc;
      const cachedImage = memoryOptimizer.imageCache?.get(cacheId);
      
      if (cachedImage && cachedImage.dataUrl) {
        setImageSrc(cachedImage.dataUrl);
        setIsLoading(false);
        onLoad?.();
        return;
      }

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          let finalSrc = imageSrc;

          // Compress image if needed and compression is enabled
          if (enableCompression && (img.naturalWidth > maxWidth || img.naturalHeight > maxHeight)) {
            finalSrc = compressImage(img, maxWidth, maxHeight, quality);
            
            // Cache compressed image
            if (memoryOptimizer.imageCache) {
              memoryOptimizer.imageCache.set(cacheId, {
                dataUrl: finalSrc,
                timestamp: Date.now(),
                originalSize: img.naturalWidth * img.naturalHeight,
                compressedSize: maxWidth * maxHeight
              });
            }
          } else {
            // Cache original image reference
            if (memoryOptimizer.imageCache) {
              memoryOptimizer.imageCache.set(cacheId, {
                dataUrl: imageSrc,
                timestamp: Date.now(),
                originalSize: img.naturalWidth * img.naturalHeight
              });
            }
          }

          setImageSrc(finalSrc);
          setIsLoading(false);
          setHasError(false);
          onLoad?.();
        } catch (compressionError) {
          console.warn('Image compression failed, using original:', compressionError);
          setImageSrc(imageSrc);
          setIsLoading(false);
          onLoad?.();
        }
      };

      img.onerror = () => {
        handleImageError();
      };

      img.src = imageSrc;

    } catch (error) {
      console.error('Error loading image:', error);
      handleImageError();
    }
  }, [maxWidth, maxHeight, quality, enableCompression, cacheKey, hasError, onLoad]);

  // Handle image errors with fallback
  const handleImageError = useCallback(() => {
    if (!hasError && fallbackSrc && fallbackSrc !== src) {
      console.warn('Image failed to load, trying fallback:', src);
      setHasError(true);
      setIsLoading(true);
      
      // Try fallback
      const fallbackImg = new Image();
      fallbackImg.onload = () => {
        setImageSrc(fallbackSrc);
        setIsLoading(false);
        onError?.();
      };
      fallbackImg.onerror = () => {
        setImageSrc(placeholder || createPlaceholder());
        setIsLoading(false);
        onError?.();
      };
      fallbackImg.src = fallbackSrc;
    } else {
      // Final fallback to placeholder
      setImageSrc(placeholder || createPlaceholder());
      setIsLoading(false);
      setHasError(true);
      onError?.();
    }
  }, [hasError, fallbackSrc, src, placeholder, onError]);

  // Compress image using canvas
  const compressImage = useCallback((img, maxW, maxH, qual) => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Calculate new dimensions
    let { width, height } = img;
    const ratio = Math.min(maxW / width, maxH / height);

    if (ratio < 1) {
      width *= ratio;
      height *= ratio;
    }

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas and draw image
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // Return compressed data URL
    return canvas.toDataURL('image/jpeg', qual);
  }, []);

  // Create placeholder data URL
  const createPlaceholder = useCallback(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 300;
    canvas.height = 300;
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 300, 300);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 300);
    
    // Add icon or text
    ctx.fillStyle = '#9ca3af';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Image not available', 150, 150);
    
    return canvas.toDataURL('image/png');
  }, []);

  // Load image when visible or immediately if not lazy loading
  useEffect(() => {
    if ((loading !== 'lazy' || isVisible) && src && !imageSrc && !hasError) {
      loadImage(src);
    }
  }, [src, loading, isVisible, imageSrc, hasError, loadImage]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (canvasRef.current) {
        canvasRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`optimized-image-container ${className}`} ref={imgRef}>
      {isLoading && (
        <div className="image-loading-placeholder animate-pulse bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
          onLoad={() => {
            setIsLoading(false);
            onLoad?.();
          }}
          onError={handleImageError}
          loading={loading}
          {...props}
        />
      )}
      
      {hasError && !isLoading && (
        <div className="image-error-state bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center text-gray-500 dark:text-gray-400">
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Profile picture specific component
export const ProfilePicture = ({ 
  src, 
  alt = 'Profile picture', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32'
  };

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      fallbackSrc="/images/default-avatar.png"
      maxWidth={200}
      maxHeight={200}
      quality={0.9}
      enableCompression={true}
      {...props}
    />
  );
};

export default OptimizedImage;
