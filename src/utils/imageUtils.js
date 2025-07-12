import React from 'react';

/**
 * Image utility functions for handling profile pictures and CORS issues
 */

/**
 * Get properly formatted profile image URL with CORS handling
 * @param {Object} user - User object containing profile image data
 * @returns {string|null} - Formatted image URL or null
 */
export const getProfileImageUrl = (user) => {
  if (!user) return null;
  
  // Check multiple possible profile image fields
  let profilePic = user.profilePicture || user.profile_picture || user.avatar || user.image || null;
  
  if (!profilePic) return null;
  
  // Handle base64 images (local storage fallback)
  if (profilePic.startsWith('data:image/')) {
    return profilePic;
  }
  
  // Handle server upload paths
  if (profilePic.startsWith('/uploads/')) {
    const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
    // Add cache buster with user update timestamp or current time
    const cacheKey = user.updated_at || user.id || Date.now();
    return `${apiUrl}${profilePic}?v=${cacheKey}`;
  }
  
  // Handle full URLs
  if (profilePic.startsWith('http://') || profilePic.startsWith('https://')) {
    const cacheKey = user.updated_at || user.id || Date.now();
    const separator = profilePic.includes('?') ? '&' : '?';
    return `${profilePic}${separator}v=${cacheKey}`;
  }
  
  return profilePic;
};

/**
 * Get user initials for fallback display
 * @param {Object} user - User object
 * @returns {string} - User initials
 */
export const getUserInitials = (user) => {
  if (!user?.name) return 'U';
  const names = user.name.split(' ');
  if (names.length >= 2) {
    return `${names[0][0]}${names[1][0]}`.toUpperCase();
  }
  return user.name.substring(0, 2).toUpperCase();
};

/**
 * Profile picture hook for real-time updates
 * @param {Object} user - User object
 * @param {Function} forceUpdate - Function to force component re-render
 */
export const useProfilePicture = (user, forceUpdate) => {
  const [profileImageUrl, setProfileImageUrl] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Update profile image URL when user changes
  React.useEffect(() => {
    const newUrl = getProfileImageUrl(user);
    setProfileImageUrl(newUrl);
    setError(null);
  }, [user?.profilePicture, user?.profile_picture, user?.avatar, user?.image, user?.updated_at]);

  // Listen for profile picture updates
  React.useEffect(() => {
    const handleProfilePictureUpdate = (event) => {
      const { user: updatedUser, imageUrl } = event.detail;
      if (updatedUser?.id === user?.id) {
        setProfileImageUrl(imageUrl);
        setError(null);
        if (forceUpdate) forceUpdate();
      }
    };

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    return () => window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
  }, [user?.id, forceUpdate]);

  const handleImageLoad = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError(true);
  };

  return {
    profileImageUrl,
    isLoading,
    error,
    handleImageLoad,
    handleImageError,
    userInitials: getUserInitials(user)
  };
};

/**
 * Validate image file for upload
 * @param {File} file - Image file to validate
 * @returns {Object} - Validation result
 */
export const validateImageFile = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' 
    };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'Please select an image smaller than 5MB' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Create a blob URL for local image preview
 * @param {File} file - Image file
 * @returns {Promise<string>} - Blob URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Download image from URL
 * @param {string} imageUrl - Image URL
 * @param {string} fileName - Download file name
 */
export const downloadImage = async (imageUrl, fileName = 'image.jpg') => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download image');
  }
};
