import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { FaTimes, FaEdit, FaDownload, FaUpload, FaCamera, FaExpand, FaCompress } from 'react-icons/fa';
import apiService from '../../services/apiService';
import nativeNotificationService from '../../services/nativeNotificationService';

const ProfilePictureModal = ({ isOpen, onClose }) => {
  const { user, updateUser, refreshUserProfile } = useAuth();
  const { isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Get profile image with proper URL construction
  const getProfileImage = () => {
    const profilePic = user?.profilePicture || user?.profile_picture || user?.avatar || user?.image || null;
    
    // Handle base64 images (local storage fallback)
    if (profilePic && profilePic.startsWith('data:image/')) {
      return profilePic;
    }
    
    if (profilePic && profilePic.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const cacheKey = user?.updated_at || user?.id || Date.now();
      return `${baseUrl}${profilePic}?v=${cacheKey}`;
    }
    
    if (profilePic && (profilePic.startsWith('http://') || profilePic.startsWith('https://'))) {
      const cacheKey = user?.updated_at || user?.id || Date.now();
      const separator = profilePic.includes('?') ? '&' : '?';
      return `${profilePic}${separator}v=${cacheKey}`;
    }
    
    return profilePic;
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  // Reset modal state when opened/closed
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsEditing(false);
      document.body.style.overflow = 'hidden';
    } else {
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

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.5, Math.min(3, scale * delta));
    setScale(newScale);
  };

  // Handle double click zoom
  const handleDoubleClick = () => {
    if (scale > 1) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setScale(2);
    }
  };

  // Reset zoom
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Handle file upload
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Upload new profile picture
  const handleFileUpload = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      nativeNotificationService.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      nativeNotificationService.error('Image file size must be less than 5MB');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      formData.append('avatar', file); // Some APIs might expect 'avatar'
      formData.append('image', file); // Some APIs might expect 'image'

      // Try different possible endpoints for profile picture upload
      const possibleEndpoints = [
        '/api/users/profile-picture',
        '/api/users/avatar',
        '/api/auth/profile-picture',
        '/api/profile/picture',
        `/api/users/${user.id}/profile-picture`
      ];
      
      let response;
      let uploadError;
      
      for (const endpoint of possibleEndpoints) {
        try {
          response = await apiService.post(endpoint, formData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
          
          if (response.data.success || response.data.profilePicture || response.data.avatar) {
            break; // Success, exit loop
          }
        } catch (endpointError) {
          uploadError = endpointError;
          console.log(`Upload attempt failed for ${endpoint}:`, endpointError.response?.status);
          continue; // Try next endpoint
        }
      }

      if (response && (response.data.success || response.data.profilePicture || response.data.avatar)) {
        // Update user data with new profile picture
        const newProfilePic = response.data.profilePicture || response.data.avatar || response.data.image;
        updateUser({
          profilePicture: newProfilePic,
          profile_picture: newProfilePic,
          avatar: newProfilePic,
          image: newProfilePic
        });
        
        // Refresh user profile to ensure sync across devices
        await refreshUserProfile();
        
        nativeNotificationService.success('Profile picture updated successfully!');
        setIsEditing(false);
      } else {
        // Fallback: Store image locally as base64 for demo purposes
        console.log('📱 Using local storage fallback for profile picture');
        
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Image = e.target.result;
          
          // Update user data with base64 image
          updateUser({
            profilePicture: base64Image,
            profile_picture: base64Image,
            avatar: base64Image,
            image: base64Image
          });
          
          nativeNotificationService.success('Profile picture updated locally! (Demo mode)');
          setIsEditing(false);
        };
        
        reader.readAsDataURL(file);
        return; // Exit early for local storage flow
      }
    } catch (error) {
      console.error('Profile picture upload error:', error);
      
      // Show user-friendly error message
      if (error.message.includes('not available')) {
        nativeNotificationService.error(error.message);
      } else if (uploadError?.response?.status === 413) {
        nativeNotificationService.error('File too large. Please choose a smaller image.');
      } else if (uploadError?.response?.status === 415) {
        nativeNotificationService.error('Unsupported file type. Please choose a JPG, PNG, or GIF image.');
      } else {
        nativeNotificationService.error(
          uploadError?.response?.data?.error || 'Failed to upload profile picture. Please try again.'
        );
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Handle download
  const handleDownload = async () => {
    const imageUrl = getProfileImage();
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `profile-picture-${user?.name || 'user'}-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      nativeNotificationService.error('Failed to download image');
    }
  };

  if (!isOpen) return null;

  const profileImageUrl = getProfileImage();

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
            {profileImageUrl && (
              <>
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
                  {scale > 1 ? <FaCompress className="text-lg" /> : <FaExpand className="text-lg" />}
                </button>
                
                <button
                  onClick={handleDownload}
                  className="p-3 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-200 touch-responsive active:scale-95"
                  title="Download image"
                >
                  <FaDownload className="text-lg" />
                </button>
              </>
            )}
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-3 rounded-full bg-blue-500/80 text-white hover:bg-blue-600/80 transition-all duration-200 touch-responsive active:scale-95"
              title="Edit profile picture"
            >
              <FaEdit className="text-lg" />
            </button>
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
          onWheel={profileImageUrl ? handleWheel : undefined}
          onDoubleClick={profileImageUrl ? handleDoubleClick : undefined}
        >
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt={`${user?.name || 'User'}'s profile picture`}
              className="max-w-full max-h-full object-contain transition-transform duration-200 select-none rounded-lg"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                cursor: scale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
              }}
              draggable={false}
            />
          ) : (
            // No profile picture placeholder
            <div className={`w-64 h-64 rounded-full flex items-center justify-center text-6xl font-bold ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
              {getUserInitials()}
            </div>
          )}
        </div>

        {/* Edit Panel */}
        {isEditing && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-6 bg-gradient-to-t from-black/80 via-black/60 to-transparent">
            <div className="max-w-md mx-auto">
              <h3 className="text-white text-lg font-semibold mb-4 text-center">
                Update Profile Picture
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <FaUpload className="mr-2" />
                      Choose File
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    // TODO: Implement camera capture for mobile devices
                    nativeNotificationService.info('Camera feature coming soon!');
                  }}
                  className="flex-1 flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaCamera className="mr-2" />
                  Take Photo
                </button>
              </div>
              
              <p className="text-white/70 text-sm text-center mt-3">
                Supported formats: JPG, PNG, GIF (max 5MB)
              </p>
            </div>
            
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}

        {/* Instructions */}
        {!isEditing && (
          <div className="absolute bottom-0 left-0 right-0 z-10 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <div className="text-center text-white/80 text-sm">
              <p className="mb-1">
                {profileImageUrl && (
                  <>
                    <span className="hidden sm:inline">Double-click or scroll to zoom • </span>
                    <span className="sm:hidden">Double-tap to zoom • </span>
                  </>
                )}
                Tap <FaEdit className="inline mx-1" /> to update • Tap outside to close
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePictureModal;

