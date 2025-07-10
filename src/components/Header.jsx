import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import UserDropdown from './UserDropdown';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getProfileImage = () => {
    return user?.avatar || user?.profile_picture || user?.profilePicture || user?.image || null;
  };

  return (
    <header className={`fixed top-0 left-0 right-0 px-4 sm:px-6 py-3 shadow-sm border-b z-50 ${
      isDark 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-blue-600 border-blue-700'
    }`}>
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className={`text-lg sm:text-xl font-bold truncate mr-4 ${
          isDark ? 'text-white' : 'text-white'
        }`}>
          Young Eagles PWA
        </h1>
        
        {isAuthenticated && user && (
          <div className="flex items-center space-x-3">
            {/* Settings Gear - UserDropdown */}
            <div className="flex-shrink-0">
              <UserDropdown onLogout={logout} />
            </div>
            
            {/* Profile Picture - Bigger and on the right */}
            <div className="flex items-center space-x-2">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden ${
                isDark ? 'bg-gray-600 text-white border-2 border-gray-500' : 'bg-white text-blue-600 border-2 border-blue-200'
              }`}>
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className={`w-full h-full flex items-center justify-center ${getProfileImage() ? 'hidden' : ''}`}>
                  {getUserInitials()}
                </div>
              </div>
              
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
    </header>
  );
};

export default Header; 