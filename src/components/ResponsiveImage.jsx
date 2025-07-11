import React from 'react';

/**
 * Responsive Image Component
 * Uses picture element and srcset for adaptive images
 */
export const ResponsiveImage = ({ 
  src, 
  alt, 
  className = '', 
  sources = [],
  loading = 'lazy',
  ...props 
}) => {
  // Default sources if none provided
  const defaultSources = [
    { media: '(min-width: 1024px)', srcSet: `${src}?w=1200 1200w, ${src}?w=1600 1600w` },
    { media: '(min-width: 768px)', srcSet: `${src}?w=800 800w, ${src}?w=1200 1200w` },
    { media: '(min-width: 480px)', srcSet: `${src}?w=600 600w, ${src}?w=800 800w` },
  ];

  const imageSources = sources.length > 0 ? sources : defaultSources;

  return (
    <picture className={className}>
      {imageSources.map((source, index) => (
        <source 
          key={index} 
          media={source.media} 
          srcSet={source.srcSet}
          type={source.type}
        />
      ))}
      <img 
        src={src} 
        alt={alt} 
        loading={loading}
        className="w-full h-auto object-cover"
        {...props}
      />
    </picture>
  );
};

/**
 * Avatar Image Component with responsive sizing
 */
export const ResponsiveAvatar = ({ 
  src, 
  alt, 
  size = 'md',
  className = '',
  fallback = null,
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    '2xl': 'w-24 h-24'
  };

  return (
    <div className={`relative ${sizeClasses[size]} ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
          {...props}
        />
      ) : (
        fallback || (
          <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-sm">?</span>
          </div>
        )
      )}
    </div>
  );
};

export default ResponsiveImage;
