import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { FaTimes, FaStar, FaGraduationCap, FaBookOpen, FaCalculator } from 'react-icons/fa';

const RectangleAd = ({ 
  context = {},
  dismissible = false,
  size = 'medium', // small, medium, large
  className = ''
}) => {
  const { isDark } = useTheme();
  const [isDismissed, setIsDismissed] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);

  // Educational ads with better targeting
  const ads = [
    {
      id: 'math-tutor',
      category: 'math',
      title: 'Math Made Easy',
      subtitle: 'Online Math Tutoring',
      description: 'One-on-one tutoring sessions with certified teachers. Boost your child\'s confidence in math!',
      features: ['Certified Teachers', 'Flexible Schedule', 'Progress Tracking'],
      price: 'From R299/month',
      cta: 'Start Free Trial',
      icon: FaCalculator,
      bgGradient: 'from-blue-500 to-blue-600',
      rating: 4.8,
      reviews: 1250
    },
    {
      id: 'reading-app',
      category: 'reading',
      title: 'Reading Adventures',
      subtitle: 'Interactive Reading App',
      description: 'Engaging stories and comprehension games that make reading fun for kids aged 4-12.',
      features: ['500+ Stories', 'Voice Recognition', 'Parent Dashboard'],
      price: 'Free with Premium R149/month',
      cta: 'Download Free',
      icon: FaBookOpen,
      bgGradient: 'from-green-500 to-green-600',
      rating: 4.9,
      reviews: 2100
    },
    {
      id: 'stem-kit',
      category: 'science',
      title: 'STEM Discovery Box',
      subtitle: 'Monthly Science Experiments',
      description: 'Hands-on science experiments delivered to your door. Perfect for curious young minds!',
      features: ['Age-Appropriate', 'Safe Materials', 'Video Instructions'],
      price: 'R399/month',
      cta: 'Order Now',
      icon: FaGraduationCap,
      bgGradient: 'from-purple-500 to-purple-600',
      rating: 4.7,
      reviews: 890
    }
  ];

  // Select relevant ad based on context
  useEffect(() => {
    let relevantAds = ads;
    
    // Filter based on context
    if (context.pageType === 'homework' && context.subject) {
      relevantAds = ads.filter(ad => ad.category === context.subject.toLowerCase());
    }
    
    if (relevantAds.length === 0) {
      relevantAds = ads;
    }
    
    // Select random ad from relevant ones
    const randomAd = relevantAds[Math.floor(Math.random() * relevantAds.length)];
    setSelectedAd(randomAd);
  }, [context]);

  if (isDismissed || !selectedAd) return null;

  const handleAdClick = () => {
    console.log('Rectangle ad clicked:', selectedAd.id);
    // Track click and handle navigation
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setIsDismissed(true);
    console.log('Rectangle ad dismissed:', selectedAd.id);
  };

  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg'
  };

  const IconComponent = selectedAd.icon;

  return (
    <div className={`
      ${sizeClasses[size]} w-full mx-auto relative
      ${className}
    `}>
      <div 
        onClick={handleAdClick}
        className={`
          relative p-6 rounded-xl shadow-lg border cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1
          ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
          overflow-hidden
        `}
      >
        {/* Background Gradient Overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-br ${selectedAd.bgGradient} opacity-5
        `} />

        {/* Dismiss Button */}
        {dismissible && (
          <button
            onClick={handleDismiss}
            className={`
              absolute top-3 right-3 p-1.5 rounded-full transition-colors z-10
              ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
              opacity-60 hover:opacity-100
            `}
          >
            <FaTimes className="text-xs" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`
              p-3 rounded-xl bg-gradient-to-br ${selectedAd.bgGradient} text-white
            `}>
              <IconComponent className="text-xl" />
            </div>
            <div>
              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedAd.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedAd.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {selectedAd.description}
        </p>

        {/* Features */}
        <div className="mb-4">
          <ul className="space-y-1">
            {selectedAd.features.map((feature, index) => (
              <li key={index} className={`text-xs flex items-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className={`w-1 h-1 rounded-full mr-2 bg-gradient-to-r ${selectedAd.bgGradient}`} />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <FaStar 
                key={i} 
                className={`text-xs ${
                  i < Math.floor(selectedAd.rating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`} 
              />
            ))}
          </div>
          <span className={`text-xs ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {selectedAd.rating} ({selectedAd.reviews.toLocaleString()} reviews)
          </span>
        </div>

        {/* Price and CTA */}
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {selectedAd.price}
            </p>
          </div>
          <button className={`
            px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors
            bg-gradient-to-r ${selectedAd.bgGradient} hover:shadow-lg
            transform hover:scale-105
          `}>
            {selectedAd.cta}
          </button>
        </div>

        {/* Ad Label */}
        <div className={`
          absolute bottom-2 left-2 px-2 py-1 rounded text-xs font-medium
          ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}
        `}>
          Sponsored
        </div>
      </div>
    </div>
  );
};

export default RectangleAd;
