import React, { useState, useRef, useEffect } from 'react';
import { FaUser, FaCog, FaSignOutAlt, FaUserCircle, FaExternalLinkAlt, FaChevronDown, FaShieldAlt, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';

const UserDropdown = ({ user, onLogout, onSettings, onOpenWebsite }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const { isDark } = useTheme();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 150); // Match animation duration
  };

  const handleItemClick = (action) => {
    handleClose();
    setTimeout(() => action(), 150); // Small delay for smooth UX
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getUserRole = () => {
    return user?.role || localStorage.getItem('role') || 'User';
  };

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return isDark ? 'text-red-400' : 'text-red-600';
      case 'teacher':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'parent':
        return isDark ? 'text-blue-400' : 'text-blue-600';
      default:
        return isDark ? 'text-purple-400' : 'text-purple-600';
    }
  };

  const getUserEmail = () => {
    return user?.email || localStorage.getItem('userEmail') || 'user@youngeagles.org.za';
  };

  const menuItems = [
    {
      icon: FaUserCircle,
      label: 'Profile',
      description: 'View and edit your profile',
      action: () => {
        // TODO: Navigate to profile page
        console.log('Navigate to profile');
      },
      divider: false
    },
    {
      icon: FaCog,
      label: 'Settings',
      description: 'App preferences and configuration',
      action: onSettings,
      divider: true
    },
    {
      icon: FaExternalLinkAlt,
      label: 'Open Full Website',
      description: 'Access the complete Young Eagles platform',
      action: onOpenWebsite,
      divider: false
    },
    {
      icon: FaQuestionCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      action: () => {
        // TODO: Navigate to help page
        console.log('Navigate to help');
      },
      divider: false
    },
    {
      icon: FaInfoCircle,
      label: 'About',
      description: 'App version and information',
      action: () => {
        // TODO: Show about modal
        console.log('Show about modal');
      },
      divider: true
    },
    {
      icon: FaSignOutAlt,
      label: 'Sign Out',
      description: 'Log out of your account',
      action: onLogout,
      divider: false,
      danger: true
    }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* User Avatar Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-blue-500 text-white hover:text-white'
        } ${isOpen ? (isDark ? 'bg-gray-700' : 'bg-blue-500') : ''}`}
        title="User Menu"
      >
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          isDark ? 'bg-gray-600 text-white' : 'bg-white text-blue-600'
        }`}>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt="User avatar" 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            getUserInitials()
          )}
        </div>
        
        {/* Chevron - hidden on mobile */}
        <FaChevronDown 
          className={`hidden sm:block text-xs transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-80 rounded-lg shadow-xl border z-50 overflow-hidden transition-all duration-150 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          
          {/* User Info Header */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                isDark ? 'bg-gray-600 text-white' : 'bg-blue-100 text-blue-600'
              }`}>
                {user?.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="User avatar" 
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </h3>
                <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {getUserEmail()}
                </p>
                <p className={`text-xs font-medium capitalize ${getRoleColor(getUserRole())}`}>
                  {getUserRole()}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => handleItemClick(item.action)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors ${
                    item.danger
                      ? isDark
                        ? 'hover:bg-red-900/50 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                      : isDark
                        ? 'hover:bg-gray-700 text-gray-200'
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <item.icon className={`mr-3 text-lg ${
                    item.danger 
                      ? (isDark ? 'text-red-400' : 'text-red-500')
                      : (isDark ? 'text-gray-400' : 'text-gray-500')
                  }`} />
                  <div className="flex-1">
                    <div className={`font-medium ${
                      item.danger 
                        ? (isDark ? 'text-red-400' : 'text-red-600')
                        : (isDark ? 'text-white' : 'text-gray-900')
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${
                      item.danger
                        ? isDark ? 'text-red-500' : 'text-red-500'
                        : isDark ? 'text-gray-500' : 'text-gray-500'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
                {item.divider && (
                  <div className={`my-1 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Footer */}
          <div className={`px-4 py-2 border-t text-center ${isDark ? 'border-gray-700 bg-gray-750' : 'border-gray-100 bg-gray-50'}`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Young Eagles PWA v1.2.0
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown; 