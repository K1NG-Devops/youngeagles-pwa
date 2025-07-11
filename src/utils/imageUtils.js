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
 * @param {Object} user - User object containing name
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
 * Handle image loading with fallback
 * @param {Event} event - Image load event
 * @param {Function} onSuccess - Success callback
 * @param {Function} onError - Error callback
 */
export const handleImageLoad = (event, onSuccess, onError) => {
  const img = event.target;
  
  // Check if image actually loaded successfully
  if (img.complete && img.naturalWidth > 0) {
    if (onSuccess) onSuccess(event);
  } else {
    if (onError) onError(event);
  }
};

/**
 * Handle image error with fallback
 * @param {Event} event - Image error event
 * @param {Function} onError - Error callback
 */
export const handleImageError = (event, onError) => {
  console.error('Image failed to load:', event.target.src);
  if (onError) onError(event);
};
