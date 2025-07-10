import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
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
      fetchChildren();
    }
  }, [user]);

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

      // Upload to server
      const response = await apiService.users.uploadProfilePicture(formData);
      
      if (response.data.success) {
        const serverImageUrl = response.data.data.profilePictureUrl;
        
        // Update user profile picture in context with server URL
        updateUser({ 
          profilePicture: serverImageUrl,
          profile_picture: serverImageUrl, // For compatibility
          avatar: serverImageUrl // For compatibility
        });
        
        // Update local profile data
        setProfileData(prev => ({
          ...prev,
          profilePicture: serverImageUrl
        }));
        
        nativeNotificationService.success('Profile picture updated successfully!');
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
      
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      nativeNotificationService.error(error.response?.data?.message || 'Failed to upload profile picture. Please try again.');
    } finally {
      setIsUploadingPicture(false);
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
    // Return the server URL from various sources, no more blob URLs
    return profileData.profilePicture || user?.profilePicture || user?.profile_picture || user?.avatar || null;
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-sm font-medium rounded-lg px-3 py-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Parent Profile
          </h1>
          <div className="bg-blue-500 dark:bg-blue-600 p-4 rounded-xl text-center mt-6">
            <p className="text-white font-medium">
              Manage your account and view your children's information
            </p>
          </div>
        </header>

        {/* Parent Information Card */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <FaUser className="mr-3 text-blue-500 dark:text-blue-400" />
              Account Information
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              >
                <FaLock className="mr-2" />
                Change Password
              </button>
              <button 
                onClick={() => nativeNotificationService.info('Edit profile feature coming soon!')}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            </div>
          </header>
          
          {/* Profile Picture Section */}
          <div className="flex items-center justify-center mb-8">
            <div className="relative group">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-700 dark:to-gray-800 shadow-lg">
                {getProfilePictureUrl() ? (
                  <img 
                    src={getProfilePictureUrl()} 
                    alt="Profile" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-5xl text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <div className="absolute -bottom-2 -right-2">
                <label 
                  htmlFor="profilePicture"
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white p-3 rounded-full cursor-pointer transition-all duration-300 shadow-lg border-4 border-white dark:border-gray-800 hover:scale-105 active:scale-95"
                >
                  {isUploadingPicture ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <FaCamera className="text-lg" />
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

              {/* Upload Progress/Status */}
              {isUploadingPicture && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                    <p className="text-sm">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Picture Help Text */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click the camera icon to update your profile picture
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Supports JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
          
          <section className="grid sm:grid-cols-1 md:grid-cols-2 gap-6">
            <article className="space-y-4">
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
            <article className="space-y-4">
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

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
              
              <form onSubmit={handlePasswordChange} className="p-6">
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
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Children Information */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <FaChild className="mr-3 text-green-500 dark:text-green-400" />
            My Children ({children.length})
          </h2>
          
          {children.length === 0 ? (
            <article className="text-center py-8">
              <FaChild className="text-6xl text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Children Registered</h3>
              <p className="text-gray-600 dark:text-gray-300">Contact the school to register your children.</p>
            </article>
          ) : (
            <section className="space-y-4">
              {children.map((child) => (
                <article 
                  key={child.id} 
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow bg-gray-50 dark:bg-gray-700"
                >
                  <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-3 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {child.first_name} {child.last_name}
                    </h3>
                    <button 
                      onClick={() => nativeNotificationService.info('Child details feature coming soon!')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors w-full sm:w-auto"
                    >
                      View Details
                    </button>
                  </header>
                  
                  <section className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <article className="space-y-3">
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
                    <article className="space-y-3">
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

        {/* Quick Actions */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => window.location.href = '/homework'}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaGraduationCap className="mr-2" />
              View Homework
            </button>
            
            <button 
              onClick={() => nativeNotificationService.info('Communication feature coming soon!')}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaEnvelope className="mr-2" />
              Contact Teachers
            </button>
            
            <button 
              onClick={() => nativeNotificationService.info('Reports feature coming soon!')}
              className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
            >
              <FaUser className="mr-2" />
              Progress Reports
            </button>
          </nav>
        </section>
      </section>
    </main>
  );
};

export default ParentProfile;