import React, { Suspense } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import ErrorBoundary from './ErrorBoundary';

// Loading spinner component
const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl'
  };

  return (
    <div className={`flex items-center justify-center p-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
      <div className="text-center">
        <FaSpinner className={`animate-spin mx-auto mb-2 ${sizeClasses[size]}`} />
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

// Enhanced loading fallback with skeleton
const SkeletonLoader = ({ type = 'default' }) => {
  const { isDark } = useTheme();
  
  const baseClasses = `animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`;
  
  if (type === 'page') {
    return (
      <div className="p-4 space-y-4">
        <div className={`h-8 w-1/3 ${baseClasses}`}></div>
        <div className={`h-4 w-full ${baseClasses}`}></div>
        <div className={`h-4 w-3/4 ${baseClasses}`}></div>
        <div className={`h-4 w-1/2 ${baseClasses}`}></div>
        <div className={`h-32 w-full ${baseClasses}`}></div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <div className="p-4 space-y-3">
        <div className={`h-6 w-2/3 ${baseClasses}`}></div>
        <div className={`h-4 w-full ${baseClasses}`}></div>
        <div className={`h-4 w-4/5 ${baseClasses}`}></div>
      </div>
    );
  }

  return <LoadingSpinner />;
};

// Higher-order component for lazy loading
const withLazyLoading = (
  Component, 
  fallback = <LoadingSpinner />
) => {
  return React.forwardRef((props, ref) => (
    <ErrorBoundary>
      <Suspense fallback={fallback}>
        <Component {...props} ref={ref} />
      </Suspense>
    </ErrorBoundary>
  ));
};

// Lazy loading wrapper component
const LazyLoader = ({ 
  children, 
  fallback = <LoadingSpinner />,
  skeleton = false,
  skeletonType = 'default',
  minLoadTime = 300 // Minimum loading time to prevent flash
}) => {
  const [showContent, setShowContent] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, minLoadTime);
    
    return () => clearTimeout(timer);
  }, [minLoadTime]);

  const loadingComponent = skeleton ? 
    <SkeletonLoader type={skeletonType} /> : 
    fallback;

  return (
    <ErrorBoundary>
      <Suspense fallback={loadingComponent}>
        {showContent ? children : loadingComponent}
      </Suspense>
    </ErrorBoundary>
  );
};

// Hook for lazy loading images
const useLazyImage = (src, placeholder = null) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (!src) return;

    // eslint-disable-next-line no-undef
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setHasError(true);
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src]);

  return { imageSrc, isLoading, hasError };
};

// Lazy image component
const LazyImage = ({ 
  src, 
  alt, 
  placeholder = null, 
  className = '',
  fallback = null,
  ...props 
}) => {
  const { imageSrc, isLoading, hasError } = useLazyImage(src, placeholder);
  const { isDark } = useTheme();

  if (hasError) {
    return fallback || (
      <div className={`flex items-center justify-center ${className} ${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'}`}>
        <span className="text-sm">Image not found</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className={`absolute inset-0 flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <FaSpinner className="animate-spin text-gray-500" />
        </div>
      )}
      <img
        src={imageSrc}
        alt={alt}
        className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        {...props}
      />
    </div>
  );
};

export default LazyLoader;
export { 
  LoadingSpinner, 
  SkeletonLoader, 
  withLazyLoading, 
  useLazyImage, 
  LazyImage 
}; 