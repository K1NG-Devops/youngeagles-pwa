import React, { useState, useEffect } from 'react';
import { FaUser } from 'react-icons/fa';
import { getProfileImageUrl, getUserInitials } from '../../utils/imageUtils';

/**
 * ProfileImage component with CORS handling and fallback
 */
const ProfileImage = ({ 
  user, 
  size = 'medium', 
  className = '', 
  onClick = null,
  showInitials = true,
  alt = 'Profile'
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);

  // Size configurations
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-12 h-12 text-lg',
    xlarge: 'w-16 h-16 text-xl',
    xxlarge: 'w-24 h-24 text-2xl'
  };

  // Update image URL when user changes
  useEffect(() => {
    const url = getProfileImageUrl(user);
    setImageUrl(url);
    setImageError(false);
    setIsLoading(!!url);
  }, [user]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const handleImageError = (e) => {
    console.error('Profile image failed to load:', e.target.src);
    setIsLoading(false);
    setImageError(true);
  };

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  const baseClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    font-semibold 
    overflow-hidden 
    transition-all 
    duration-200 
    ${onClick ? 'cursor-pointer hover:scale-105' : ''}
    ${className}
  `;

  return (
    <div 
      className={baseClasses}
      onClick={handleClick}
      title={user?.name || 'User'}
    >
      {imageUrl && !imageError ? (
        <>
          <img
            src={imageUrl}
            alt={alt}
            className="w-full h-full object-cover rounded-full"
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ display: isLoading ? 'none' : 'block' }}
            crossOrigin="anonymous"
          />
          {/* Loading placeholder */}
          {isLoading && (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse rounded-full flex items-center justify-center">
              <FaUser className="text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </>
      ) : (
        // Fallback display
        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
          {showInitials ? (
            <span className="font-bold">
              {getUserInitials(user)}
            </span>
          ) : (
            <FaUser className="text-white opacity-80" />
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileImage;
