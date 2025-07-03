import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import UserDropdown from './UserDropdown';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark } = useTheme();

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
          <div className="flex-shrink-0">
            <UserDropdown onLogout={logout} />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 