import React, { useState, useRef } from 'react';
import { FaCamera, FaUser, FaTimes, FaCheck, FaSpinner, FaExpand } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';
import ImageModal from './ImageModal';

/**
 * ProfilePictureUpload - Enhanced profile picture upload component
 * Features: Drag & drop, image preview, crop functionality, progress tracking
 */
const ProfilePictureUpload = ({ 
  currentProfilePicture = null, 
  onUploadSuccess = null,
  size = 'large' // 'small', 'medium', 'large'
}) => {
  const { user, updateUser } = useAuth();
  const { isDark } = useTheme();
  const fileInputRef = useRef(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Size configurations
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40'
  };

  const iconSizes = {
    small: 'text-lg',
    medium: 'text-2xl',
    large: 'text-4xl sm:text-5xl md:text-6xl'
  };

  const buttonSizes = {
    small: 'p-2',
    medium: 'p-2.5',
    large: 'p-3'
  };

  // Get profile picture URL with fallback
  const getProfilePictureUrl = () => {
    const profilePic = currentProfilePicture || 
                      user?.profilePicture || 
                      user?.profile_picture || 
                      user?.avatar || 
                      null;
    
    if (profilePic && profilePic.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      return `${baseUrl}${profilePic}`;
    }
    
    return profilePic;
  };

  // Validate file before upload
  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
    }

    if (file.size > maxSize) {
      throw new Error('Please select an image smaller than 5MB');
    }

    return true;
  };

  // Handle file selection
  const handleFileSelect = (file) => {
    try {
      validateFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Upload file
      uploadFile(file);
    } catch (error) {
      nativeNotificationService.error(error.message);
    }
  };

  // Upload file with progress tracking
  const uploadFile = async (file) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const formData = new FormData();
      formData.append('profilePicture', file);

      console.log('🚀 Starting profile picture upload:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type
      });

      // Create a custom axios config with progress tracking
      const response = await apiService.users.uploadProfilePicture(formData);
      
      if (response.data.success) {
        const serverImageUrl = response.data.data.profilePictureUrl;
        const updatedUserData = response.data.data.user;
        
        // Update user context
        const userUpdateData = {
          profilePicture: serverImageUrl,
          profile_picture: serverImageUrl,
          avatar: serverImageUrl,
          image: serverImageUrl
        };

        if (updatedUserData) {
          Object.assign(userUpdateData, updatedUserData);
        }

        updateUser(userUpdateData);
        
        // Clear preview
        setPreviewImage(null);
        
        // Callback for parent component
        if (onUploadSuccess) {
          onUploadSuccess(serverImageUrl, userUpdateData);
        }
        
        nativeNotificationService.success('Profile picture updated successfully!');
        
        console.log('✅ Profile picture updated:', {
          url: serverImageUrl,
          userUpdateData
        });
        
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setPreviewImage(null);
      
      // Handle specific error cases
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        nativeNotificationService.error('Upload timed out. Please check your connection and try a smaller image.');
      } else if (error.response?.data?.error === 'MISSING_COLUMN') {
        nativeNotificationService.error('Profile picture feature is being set up. Please contact your administrator.');
      } else if (error.response?.status === 413) {
        nativeNotificationService.error('Image file is too large. Please try a smaller image (max 5MB).');
      } else {
        nativeNotificationService.error(error.response?.data?.message || 'Failed to upload profile picture. Please try again.');
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Trigger file input
  const triggerFileInput = (e) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  // Handle image click to show modal
  const handleImageClick = (e) => {
    e.stopPropagation();
    const imageUrl = getProfilePictureUrl();
    if (imageUrl && !isUploading) {
      setShowImageModal(true);
    }
  };

  return (
    <div className="flex items-center justify-center component-spacing">
      <div className="profile-picture-container relative group">
        {/* Main profile picture container */}
        <div 
          className={`
            ${sizeClasses[size]} 
            rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-800 
            bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 
            shadow-xl smooth-animation hover-lift card-enhanced cursor-pointer relative group
            ${isDragOver ? 'border-blue-500 scale-105' : ''}
            ${isUploading ? 'opacity-75' : ''}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Loading skeleton */}
          {!getProfilePictureUrl() && !previewImage && (
            <div className="loading-skeleton w-full h-full absolute inset-0 rounded-full"></div>
          )}
          
          {/* Preview image (during upload) */}
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-full object-cover transition-all duration-300"
            />
          )}
          
          {/* Current profile picture */}
          {!previewImage && getProfilePictureUrl() && (
            <div className="relative w-full h-full group">
              <img 
                src={getProfilePictureUrl()} 
                alt="Profile" 
                className="w-full h-full object-cover transition-all duration-300 cursor-pointer"
                onClick={handleImageClick}
                onLoad={() => console.log('✅ Profile picture loaded successfully')}
                onError={(e) => {
                  console.error('❌ Profile picture failed to load:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextElementSibling.style.display = 'flex';
                }}
              />
              
              {/* View fullscreen overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <FaExpand className="text-white text-lg drop-shadow-lg" />
              </div>
            </div>
          )}
          
          {/* Fallback placeholder */}
          <div 
            className={`w-full h-full flex items-center justify-center ${getProfilePictureUrl() && !previewImage ? 'hidden' : 'flex'}`}
            style={{ display: getProfilePictureUrl() && !previewImage ? 'none' : 'flex' }}
            onClick={triggerFileInput}
          >
            <FaUser className={`${iconSizes[size]} text-gray-400 dark:text-gray-500`} />
          </div>

          {/* Drag overlay */}
          {isDragOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center rounded-full" onClick={triggerFileInput}>
              <FaCamera className="text-blue-500 text-2xl" />
            </div>
          )}

          {/* Upload progress overlay */}
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm">
              <div className="text-white text-center">
                <FaSpinner className="animate-spin text-2xl mx-auto mb-2" />
                <p className="text-xs font-medium">Uploading...</p>
                {uploadProgress > 0 && (
                  <p className="text-xs">{uploadProgress}%</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Upload button */}
        <div className="absolute -bottom-2 -right-2">
          <button
            onClick={triggerFileInput}
            disabled={isUploading}
            className={`
              ${buttonSizes[size]}
              bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 
              text-white rounded-full cursor-pointer transition-all duration-300 shadow-lg 
              border-4 border-white dark:border-gray-800 hover:scale-110 active:scale-95 
              flex items-center justify-center touch-responsive smooth-animation
              disabled:opacity-50 disabled:cursor-not-allowed
              ${isUploading ? 'animate-pulse' : ''}
            `}
          >
            {isUploading ? (
              <FaSpinner className="animate-spin text-lg" />
            ) : (
              <FaCamera className="text-lg" />
            )}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isUploading}
        />
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        imageUrl={getProfilePictureUrl()}
        imageAlt="Profile Picture"
        showDownload={true}
        showZoom={true}
      />
    </div>
  );
};

export default ProfilePictureUpload;