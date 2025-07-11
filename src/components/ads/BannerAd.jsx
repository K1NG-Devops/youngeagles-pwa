import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaTimes, FaExternalLinkAlt, FaAd } from 'react-icons/fa';

const BannerAd = ({ 
  position = 'top',
  context = {},
  dismissible = true,
  autoRotate = true,
  className = ''
}) => {
  const { isDark } = useTheme();
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  // Sample educational ads - replace with real ad network integration
  const ads = [
    {
      id: 'education-1',
      title: 'Boost Your Child\'s Math Skills',
      description: 'Interactive math games for ages 4-12. Free trial available!',
      image: '/api/placeholder/320/100',
      cta: 'Try Free',
      url: '#',
      bgColor: 'bg-blue-500',
      textColor: 'text-white'
    },
    {
      id: 'education-2', 
      title: 'Reading Comprehension Made Fun',
      description: 'Award-winning reading app trusted by teachers worldwide.',
      image: '/api/placeholder/320/100',
      cta: 'Learn More',
      url: '#',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    },
    {
      id: 'education-3',
      title: 'STEM Learning Adventures',
      description: 'Hands-on science experiments your kids will love.',
      image: '/api/placeholder/320/100', 
      cta: 'Explore',
      url: '#',
      bgColor: 'bg-purple-500',
      textColor: 'text-white'
    },
    {
      id: 'parent-1',
      title: 'Educational Tablets for Kids',
      description: 'Safe, kid-friendly tablets with parental controls. 20% off!',
      image: '/api/placeholder/320/100',
      cta: 'Shop Now',
      url: '#',
      bgColor: 'bg-orange-500',
      textColor: 'text-white'
    }
  ];

  // Auto-rotate ads every 30 seconds
  useEffect(() => {
    if (!autoRotate || ads.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRotate, ads.length]);

  // Don't render if dismissed
  if (isDismissed) return null;

  const currentAd = ads[currentAdIndex];
  
  const handleAdClick = () => {
    // Track ad click
    console.log('Ad clicked:', currentAd.id);
    // In real implementation, open ad URL
    window.open(currentAd.url, '_blank');
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    // Track dismissal
    console.log('Ad dismissed:', currentAd.id);
  };

  return (
    <div className={`
      w-full relative overflow-hidden rounded-lg shadow-sm border transition-all duration-300 hover:shadow-md cursor-pointer
      ${isDark ? 'border-gray-700' : 'border-gray-200'}
      ${className}
    `}>
      {/* Ad Content */}
      <div 
        onClick={handleAdClick}
        className={`
          relative p-3 min-h-[70px] flex items-center justify-between
          ${currentAd.bgColor} ${currentAd.textColor}
          bg-gradient-to-r from-opacity-90 to-opacity-80
        `}
      >
        {/* Left Content */}
        <div className="flex-1 pr-4">
          <h3 className="font-bold text-sm md:text-base mb-1 leading-tight">
            {currentAd.title}
          </h3>
          <p className="text-xs md:text-sm opacity-90 mb-3 leading-relaxed">
            {currentAd.description}
          </p>
          
          {/* CTA Button */}
          <button className={`
            inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors
            ${isDark ? 'bg-white bg-opacity-20 hover:bg-opacity-30' : 'bg-white bg-opacity-30 hover:bg-opacity-40'}
            backdrop-blur-sm
          `}>
            {currentAd.cta}
            <FaExternalLinkAlt className="ml-1.5 text-xs" />
          </button>
        </div>

        {/* Right Content - Image/Icon */}
        <div className="flex-shrink-0">
          <div className={`
            w-16 h-16 md:w-20 md:h-20 rounded-lg flex items-center justify-center
            ${isDark ? 'bg-white bg-opacity-20' : 'bg-white bg-opacity-30'}
            backdrop-blur-sm
          `}>
            <FaAd className="text-2xl opacity-80" />
          </div>
        </div>

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`
              absolute top-2 right-2 p-1.5 rounded-full transition-colors
              ${isDark ? 'hover:bg-white hover:bg-opacity-20' : 'hover:bg-white hover:bg-opacity-30'}
              opacity-60 hover:opacity-100
            `}
          >
            <FaTimes className="text-xs" />
          </button>
        )}
      </div>

      {/* Ad Indicator */}
      <div className={`
        absolute bottom-1 left-2 px-1.5 py-0.5 rounded text-xs font-medium
        ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'}
        bg-opacity-80 backdrop-blur-sm
      `}>
        Ad
      </div>

      {/* Progress Indicators */}
      {ads.length > 1 && autoRotate && (
        <div className="absolute bottom-2 right-2 flex space-x-1">
          {ads.map((_, index) => (
            <div
              key={index}
              className={`
                w-1.5 h-1.5 rounded-full transition-all duration-300
                ${index === currentAdIndex 
              ? 'bg-white bg-opacity-80' 
              : 'bg-white bg-opacity-30'
            }
              `}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerAd;
