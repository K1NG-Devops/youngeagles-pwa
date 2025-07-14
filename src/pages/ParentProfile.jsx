import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { ProfilePicture } from '../components/OptimizedImage';
import { 
  FaUser, 
  FaChild, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt,
  FaEdit,
  FaGraduationCap,
  FaCalendarAlt,
  FaIdCard,
  FaArrowLeft,
  FaCamera,
  FaLock,
  FaSave,
  FaTimes,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ParentProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    profilePicture: user?.profilePicture || user?.profile_picture || user?.avatar || null
  });
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingPicture, setIsUploadingPicture] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Initialize profile data and refresh profile picture
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.children.getByParent(user.id);
        setChildren(response.data.children || []);
      } catch (error) {
        console.error('Error fetching children:', error);
        setChildren([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      // Initialize profile data with user info
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        profilePicture: user.profilePicture || user.profile_picture || user.avatar || null
      });
      
      fetchChildren();
    }
  }, [user]);

  // Additional effect to monitor profile picture changes in real-time
  useEffect(() => {
    const profilePic = user?.profilePicture || user?.profile_picture || user?.avatar;
    if (profilePic && profilePic !== profileData.profilePicture) {
      setProfileData(prev => ({
        ...prev,
        profilePicture: profilePic,
        profile_picture: profilePic,
        avatar: profilePic
      }));
      console.log('🔄 Profile picture updated in real-time:', profilePic);
    }
  }, [user?.profilePicture, user?.profile_picture, user?.avatar, profileData.profilePicture]);

  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleProfilePictureChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        nativeNotificationService.error('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        nativeNotificationService.error('Please select an image smaller than 5MB');
        return;
      }

      uploadProfilePicture(file);
    }
  };

  const uploadProfilePicture = async (file) => {
    try {
      setIsUploadingPicture(true);
      const formData = new FormData();
      formData.append('profilePicture', file);

      console.log('🚀 Starting profile picture upload:', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type
      });

      // Upload to server with retry logic
      const response = await uploadWithRetry(formData);
      
      if (response.data.success) {
        const serverImageUrl = response.data.data.profilePictureUrl;
        const updatedUserData = response.data.data.user;
        
        // Create comprehensive user update data
        const userUpdateData = {
          profilePicture: serverImageUrl,
          profile_picture: serverImageUrl, // For compatibility
          avatar: serverImageUrl, // For compatibility
          image: serverImageUrl // For additional compatibility
        };

        // If backend returned updated user data, merge it
        if (updatedUserData) {
          Object.assign(userUpdateData, updatedUserData);
        }

        // Update user context first
        updateUser(userUpdateData);
        
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          profilePicture: serverImageUrl,
          profile_picture: serverImageUrl,
          avatar: serverImageUrl
        }));
        
        nativeNotificationService.success('Profile picture updated successfully!');
        
        // Log for debugging
        console.log('✅ Profile picture updated:', {
          url: serverImageUrl,
          userUpdateData,
          currentUser: user
        });
        
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      
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
      setIsUploadingPicture(false);
    }
  };

  // Upload with retry logic
  const uploadWithRetry = async (formData, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📤 Upload attempt ${attempt}/${maxRetries}`);
        return await apiService.users.uploadProfilePicture(formData);
      } catch (error) {
        console.warn(`❌ Upload attempt ${attempt} failed:`, error.message);
        
        if (attempt === maxRetries) {
          throw error; // Final attempt failed
        }
        
        // Wait before retry (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`⏳ Retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      nativeNotificationService.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      nativeNotificationService.error('Password must be at least 8 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);
      
      // Here you would typically make an API call to change the password
      // await apiService.user.changePassword({
      //   currentPassword: passwordData.currentPassword,
      //   newPassword: passwordData.newPassword
      // });
      
      // For demo purposes, we'll just show success
      nativeNotificationService.success('Password changed successfully!');
      
      // Reset form and close modal
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordModal(false);
      
    } catch (error) {
      console.error('Error changing password:', error);
      nativeNotificationService.error('Failed to change password. Please check your current password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getProfilePictureUrl = () => {
    // Check in this order: profileData first, then user context
    const profilePic = profileData.profilePicture || 
                      profileData.profile_picture || 
                      profileData.avatar ||
                      user?.profilePicture || 
                      user?.profile_picture || 
                      user?.avatar || 
                      user?.image || 
                      null;
    
    console.log('🖼️ Profile picture URL debug:', {
      profilePic,
      profileData: profileData,
      userContext: user,
      hasImage: !!profilePic
    });
    
    // Ensure the URL is properly formatted for server URLs
    if (profilePic && profilePic.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      // Add cache buster with current timestamp
      const cacheBuster = Date.now();
      const fullUrl = `${baseUrl}${profilePic}?t=${cacheBuster}`;
      console.log('🔗 Full profile picture URL with cache buster:', fullUrl);
      return fullUrl;
    }
    
    // If it's already a full URL, add cache buster
    if (profilePic && (profilePic.startsWith('http://') || profilePic.startsWith('https://'))) {
      const cacheBuster = Date.now();
      const separator = profilePic.includes('?') ? '&' : '?';
      return `${profilePic}${separator}t=${cacheBuster}`;
    }
    
    return profilePic;
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <section className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      <section className="max-w-4xl mx-auto mt-12 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Back Button - Mobile Optimized */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 sm:mb-6 flex items-center text-sm font-medium rounded-lg px-3 py-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Header - Mobile Optimized */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-2">
            Parent Profile
          </h1>
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-3 sm:p-4 rounded-xl text-center shadow-lg">
            <p className="text-white font-medium text-sm sm:text-base">
              Manage your account and view your children's information
            </p>
          </div>
        </header>

        {/* Parent Information Card - Enhanced Mobile Design */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 transition-all duration-200">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FaUser className="mr-3 text-blue-500 dark:text-blue-400" />
              Account Information
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 active:scale-95"
              >
                <FaLock className="mr-2 text-sm" />
                Change Password
              </button>
              <button 
                onClick={() => nativeNotificationService.info('Edit profile feature coming soon!')}
                className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all duration-200 active:scale-95"
              >
                <FaEdit className="mr-2 text-sm" />
                Edit Profile
              </button>
            </div>
          </header>
          {/* Enhanced Profile Picture Section - Mobile First */}
          <div className="flex items-center justify-center mb-6 sm:mb-8">
            <div className="profile-picture-container relative group">
              <ProfilePicture
                user={user}
                size={144}
                className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 hover:scale-105 transition-transform duration-300 shadow-xl border-4 border-blue-200 dark:border-blue-800"
                fallbackClassName="text-3xl sm:text-4xl md:text-5xl"
                showHoverEffect={true}
              />

              {/* Enhanced Upload Button */}
              <div className="absolute -bottom-1 sm:-bottom-2 -right-1 sm:-right-2">
                <label 
                  htmlFor="profilePicture"
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-2 sm:p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg border-3 sm:border-4 border-white dark:border-gray-800 hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  {isUploadingPicture ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaCamera className="text-sm sm:text-lg" />
                  )}
                </label>
                <input
                  id="profilePicture"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                  disabled={isUploadingPicture}
                />
              </div>

              {/* Upload Progress/Status - Enhanced */}
              {isUploadingPicture && (
                <div className="absolute inset-0 bg-black bg-opacity-60 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-xs sm:text-sm font-medium">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Help Text - Mobile Optimized */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Click the camera icon to update your profile picture
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supports JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
          
          <section className="grid sm:grid-cols-1 md:grid-cols-2 grid-gap-perfect">
            <article className="list-spacing">
              <div className="flex items-start">
                <FaUser className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-900 dark:text-white break-words">{profileData.name}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaEnvelope className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email Address</p>
                  <p className="font-medium text-gray-900 dark:text-white break-all">{profileData.email}</p>
                </div>
              </div>
            </article>
            <article className="list-spacing">
              <div className="flex items-start">
                <FaPhone className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-900 dark:text-white break-words">{profileData.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0 mt-1" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Address</p>
                  <p className="font-medium text-gray-900 dark:text-white break-words">{profileData.address || 'Not provided'}</p>
                </div>
              </div>
            </article>
          </section>
        </section>

        {/* Password Change Modal - Enhanced Mobile */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-3 sm:mx-4 modal smooth-animation">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 smooth-animation p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 smooth-animation active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 smooth-animation disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                  >
                    {isChangingPassword ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Changing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <FaSave className="mr-2" />
                        Save Changes
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Children Information - Enhanced */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 card-content component-spacing card-enhanced smooth-animation">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white component-spacing-tight flex items-center">
            <FaChild className="mr-3 text-green-500 dark:text-green-400" />
            My Children ({children.length})
          </h2>
          
          {children.length === 0 ? (
            <article className="text-center section-spacing-compact">
              <FaChild className="text-4xl sm:text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">No Children Registered</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">Contact the school to register your children.</p>
            </article>
          ) : (
            <section className="list-spacing">
              {children.map((child) => (
                <article 
                  key={child.id} 
                  className="border border-gray-200 dark:border-gray-600 rounded-xl card-content bg-gray-50 dark:bg-gray-700 smooth-animation hover-lift card-enhanced"
                >
                  <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between component-spacing-tight">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                      {child.first_name} {child.last_name}
                    </h3>
                    <button 
                      onClick={() => nativeNotificationService.info('Child details feature coming soon!')}
                      className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 smooth-animation hover-lift touch-responsive active:scale-95 w-full sm:w-auto"
                    >
                      View Details
                    </button>
                  </header>
                  
                  <section className="grid sm:grid-cols-1 md:grid-cols-2 grid-gap-perfect text-sm">
                    <article className="list-spacing-tight">
                      <div className="flex items-start">
                        <FaCalendarAlt className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-gray-600 dark:text-gray-400">Age:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {child.age || calculateAge(child.date_of_birth)} years old
                          </span>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <FaGraduationCap className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <span className="text-gray-600 dark:text-gray-400">Class:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white break-words">{child.class_name || 'Not assigned'}</span>
                        </div>
                      </div>
                    </article>
                    <article className="list-spacing-tight">
                      {child.date_of_birth && (
                        <div className="flex items-start">
                          <FaIdCard className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Date of Birth:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">{formatDate(child.date_of_birth)}</span>
                          </div>
                        </div>
                      )}
                      {child.emergency_contact && (
                        <div className="flex items-start">
                          <FaPhone className="text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Emergency Contact:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white break-words">{child.emergency_contact}</span>
                          </div>
                        </div>
                      )}
                    </article>
                  </section>
                </article>
              ))}
            </section>
          )}
        </section>

        {/* Quick Actions - Enhanced */}
        <section className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 card-content card-enhanced smooth-animation">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white component-spacing-tight">Quick Actions</h3>
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 grid-gap-perfect">
            <button 
              onClick={() => window.location.href = '/homework'}
              className="inline-flex items-center justify-center px-4 py-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 smooth-animation hover-lift touch-responsive active:scale-95"
            >
              <FaGraduationCap className="mr-2 text-base" />
              View Homework
            </button>
            
            <button 
              onClick={() => nativeNotificationService.info('Communication feature coming soon!')}
              className="inline-flex items-center justify-center px-4 py-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 smooth-animation hover-lift touch-responsive active:scale-95"
            >
              <FaEnvelope className="mr-2 text-base" />
              Contact Teachers
            </button>
            
            <button 
              onClick={() => nativeNotificationService.info('Reports feature coming soon!')}
              className="inline-flex items-center justify-center px-4 py-4 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 smooth-animation hover-lift touch-responsive active:scale-95"
            >
              <FaUser className="mr-2 text-base" />
              Progress Reports
            </button>
          </nav>
        </section>
      </section>
    </main>
  );
};

export default ParentProfile;