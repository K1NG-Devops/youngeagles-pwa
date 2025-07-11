import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserDropdown from './UserDropdown';
import ProfileImage from './common/ProfileImage';
import ProfilePictureModal from './common/ProfilePictureModal';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

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
            
            {/* Profile Picture - Using ProfileImage component */}
            <div className="flex items-center mobile-gap-sm touch-responsive">
              <ProfileImage 
                user={user}
                size="large"
                onClick={() => setIsProfileModalOpen(true)}
                className="border-2 border-white/20 hover:border-white/50 hover:ring-2 hover:ring-white/50"
              />
              
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
