import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserDropdown from './UserDropdown';
import ProfilePictureModal from './common/ProfilePictureModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getProfileImage = () => {
    const profilePic = user?.profilePicture || user?.profile_picture || user?.avatar || user?.image || null;
    
    console.log('🖼️ Header profile picture debug:', {
      profilePic: profilePic ? (profilePic.startsWith('data:') ? 'base64-image' : profilePic) : null,
      user,
      hasImage: !!profilePic,
      env: {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL
      }
    });
    
    // Handle base64 images (local storage fallback)
    if (profilePic && profilePic.startsWith('data:image/')) {
      return profilePic;
    }
    
    if (profilePic && profilePic.startsWith('/uploads/')) {
      // Use the correct API URL from environment
      const baseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      // Use user ID and update timestamp for better cache control
      const cacheKey = user?.updated_at || user?.id || Date.now();
      const fullUrl = `${baseUrl}${profilePic}?v=${cacheKey}`;
      console.log('🔗 Header full profile picture URL:', fullUrl);
      return fullUrl;
    }
    
    // If it's already a full URL, add version cache key
    if (profilePic && (profilePic.startsWith('http://') || profilePic.startsWith('https://'))) {
      const cacheKey = user?.updated_at || user?.id || Date.now();
      const separator = profilePic.includes('?') ? '&' : '?';
      return `${profilePic}${separator}v=${cacheKey}`;
    }
    
    return profilePic;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 container-perfect py-4 shadow-sm border-b z-50 safe-area-padding ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-blue-600 border-blue-700'
    }`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mobile-gap-md">
        <h1 className={`text-lg sm:text-xl font-bold truncate mr-4 ${
          isDark ? 'text-white' : 'text-white'
        }`}>
          Young Eagles PWA
        </h1>
        
        {isAuthenticated && user && (
          <div className="flex items-center mobile-gap-md">
            {/* Settings Gear - UserDropdown */}
            <div className="flex-shrink-0">
              <UserDropdown onLogout={logout} />
            </div>
            
            {/* Profile Picture - Bigger and on the right */}
            <div className="flex items-center mobile-gap-sm touch-responsive">
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-white/50 cursor-pointer ${
                  isDark ? 'bg-gray-600 text-white border-2 border-gray-500' : 'bg-white text-blue-600 border-2 border-blue-200'
                }`}
                title="View and edit profile picture"
              >
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    key={`header-profile-${Date.now()}`} // Force re-render
                    onLoad={(e) => {
                      console.log('✅ Header profile picture loaded:', e.target.src);
                      e.target.style.display = 'block';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder) placeholder.style.display = 'none';
                    }}
                    onError={(e) => {
                      console.error('❌ Header profile picture failed to load:', e.target.src);
                      console.error('Error details:', e);
                      e.target.style.display = 'none';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder) placeholder.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${getProfileImage() ? 'hidden' : ''}`}>
                  {getUserInitials()}
                </div>
              </button>
              
              {/* User Name - Hidden on small screens */}
              <span className={`hidden sm:inline-block text-sm font-medium ${
                isDark ? 'text-white' : 'text-white'
              }`}>
                {user.name}
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Profile Picture Modal */}
      <ProfilePictureModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};

export default Header;
