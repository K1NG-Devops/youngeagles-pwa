import React, { useState, useEffect, useRef } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaEdit, FaSave, FaTimes, FaSpinner, FaCamera, FaUpload } from 'react-icons/fa';
import { teacherService } from '../../services/teacherService';
import { showNotification } from '../../utils/notifications';
import { useTheme } from '../../contexts/ThemeContext';

const TeacherProfile = () => {
  const { isDark } = useTheme();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [formData, setFormData] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Debug current authentication state
    const debugAuth = () => {
      const token = localStorage.getItem('accessToken');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      console.log('🔍 TeacherProfile Auth Debug:', {
        hasToken: !!token,
        tokenLength: token?.length,
        user: user,
        userId: user.id,
        userRole: user.role,
        userEmail: user.email
      });
      
      // Try to decode JWT payload
      if (token) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(atob(parts[1]));
            console.log('📋 JWT Payload:', payload);
          }
        } catch (e) {
          console.log('⚠️ Failed to decode JWT:', e.message);
        }
      }
    };
    
    debugAuth();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getProfile();
      
      console.log('🔍 Profile response received:', response);
      
      // Check if response has the expected structure
      const responseData = response.data || response;
      console.log('📋 Full response data:', responseData);
      
      // Extract the actual teacher profile data from the nested structure
      const profileData = responseData.teacher || responseData.profile || responseData;
      
      if (profileData) {
        console.log('📋 Extracted profile data:', profileData);
        
        // Transform API data structure to match frontend expectations
        const transformedProfile = {
          ...profileData,
          // Handle name field - split into firstName and lastName if needed
          firstName: profileData.firstName || (profileData.name ? profileData.name.split(' ')[0] : ''),
          lastName: profileData.lastName || (profileData.name ? profileData.name.split(' ').slice(1).join(' ') : ''),
          // Keep original name field as well for API compatibility
          name: profileData.name || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
          email: profileData.email || '',
          phone: profileData.phone || '',
          createdAt: profileData.created_at || profileData.createdAt,
          // Add additional fields that might be in the API
          qualification: profileData.qualification || '',
          specialization: profileData.specialization || '',
          bio: profileData.bio || '',
          experience_years: profileData.experience_years || 0,
          emergency_contact_name: profileData.emergency_contact_name || '',
          emergency_contact_phone: profileData.emergency_contact_phone || '',
          // Also store the stats if available
          stats: responseData.stats || null
        };
        
        console.log('✅ Transformed profile:', transformedProfile);
        
        setProfile(transformedProfile);
        setFormData(transformedProfile);
      } else {
        console.error('No profile data received from API');
        showNotification('Failed to load profile data', 'error');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        showNotification('Authentication required. Please login again.', 'error');
        // Redirect to teacher login after a short delay
        setTimeout(() => {
          window.location.href = '/teacher-login';
        }, 2000);
      } else {
        showNotification('Failed to load profile. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await teacherService.updateProfile(formData);
      setProfile(response.data);
      setEditing(false);
      showNotification('Profile updated successfully', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile);
    setEditing(false);
  };

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('Please select a valid image file (JPEG, PNG, or GIF)', 'error');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showNotification('File size must be less than 5MB', 'error');
      return;
    }

    try {
      setUploadingPicture(true);
      const response = await teacherService.uploadProfilePicture(file);
      
      // Update profile with new picture URL
      const updatedProfile = {
        ...profile,
        profilePicture: response.profilePictureUrl || response.url
      };
      
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      showNotification('Profile picture updated successfully', 'success');
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      showNotification('Failed to upload profile picture', 'error');
    } finally {
      setUploadingPicture(false);
    }
  };

  const formatMemberSince = (dateString) => {
    if (!dateString) return 'Not available';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="flex items-center space-x-2">
          <FaSpinner className="animate-spin text-blue-600" />
          <span className={isDark ? 'text-white' : 'text-gray-900'}>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <h2 className="text-xl font-semibold mb-2">Profile Not Found</h2>
          <p>Unable to load your profile information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <div className="flex justify-between items-center mb-4">
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Teacher Profile
            </h1>
            <div className="flex space-x-2">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                  >
                    {saving ? <FaSpinner className="animate-spin" /> : <FaSave />}
                    <span>Save</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
                  >
                    <FaTimes />
                    <span>Cancel</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  <FaEdit />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Profile Avatar */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                {profile.profilePicture ? (
                  <img 
                    src={profile.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser className="text-white text-2xl" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPicture}
                className="absolute -bottom-1 -right-1 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg disabled:opacity-50"
                title="Upload profile picture"
              >
                {uploadingPicture ? (
                  <FaSpinner className="animate-spin text-xs" />
                ) : (
                  <FaCamera className="text-xs" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureUpload}
                className="hidden"
              />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {profile.firstName} {profile.lastName}
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Teacher</p>
              {profile.specialization && (
                <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {profile.specialization}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Personal Information
          </h3>

          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaUser className="inline mr-2" />
                First Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.firstName || 'Not specified'}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaUser className="inline mr-2" />
                Last Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.lastName || 'Not specified'}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaEnvelope className="inline mr-2" />
                Email
              </label>
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.email || 'Not specified'}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaPhone className="inline mr-2" />
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.phone || 'Not specified'}
                </p>
              )}
            </div>

            {/* Join Date */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaCalendarAlt className="inline mr-2" />
                Member Since
              </label>
              <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {formatMemberSince(profile.createdAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Professional Information */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6 mb-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Professional Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Qualification */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Qualification
              </label>
              {editing ? (
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Bachelor of Education"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.qualification || 'Not specified'}
                </p>
              )}
            </div>

            {/* Specialization */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Specialization
              </label>
              {editing ? (
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Mathematics, Science"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.specialization || 'Not specified'}
                </p>
              )}
            </div>

            {/* Experience Years */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Years of Experience
              </label>
              {editing ? (
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  placeholder="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.experience_years ? `${profile.experience_years} years` : 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Bio
            </label>
            {editing ? (
              <textarea
                name="bio"
                value={formData.bio || ''}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell us about yourself, your teaching philosophy, and interests..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            ) : (
              <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {profile.bio || 'No bio provided'}
              </p>
            )}
          </div>
        </div>

        {/* Emergency Contact Information */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg p-6`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Emergency Contact
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Emergency Contact Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact Name
              </label>
              {editing ? (
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={handleInputChange}
                  placeholder="Full name of emergency contact"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.emergency_contact_name || 'Not specified'}
                </p>
              )}
            </div>

            {/* Emergency Contact Phone */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Contact Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
              ) : (
                <p className={`px-3 py-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {profile.emergency_contact_phone || 'Not specified'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
