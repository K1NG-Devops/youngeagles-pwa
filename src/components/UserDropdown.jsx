import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaUserCircle, FaChevronDown, FaQuestionCircle, FaInfoCircle, FaCreditCard, FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        handleClose();
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when dropdown is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleItemClick = (action) => {
    handleClose();
    setTimeout(() => action(), 150);
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  };

  const getProfileImage = () => {
    // Check multiple possible profile image fields
    return user?.avatar || user?.profile_picture || user?.profilePicture || user?.image || null;
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
    case 'admin':
      return 'text-red-600';
    case 'teacher':
      return 'text-green-600';
    case 'parent':
      return 'text-blue-600';
    default:
      return 'text-purple-600';
    }
  };

  const menuItems = [
    {
      icon: FaUserCircle,
      label: 'Profile',
      description: 'View and edit your profile',
      action: () => {
        if (user?.role === 'parent') {
          navigate('/children');
        } else {
          navigate('/profile');
        }
      },
      divider: false
    },
    {
      icon: FaCreditCard,
      label: 'Manage Account',
      description: 'Subscriptions, payments, and billing',
      action: () => {
        navigate('/manage');
      },
      divider: true
    },
    {
      icon: FaCog,
      label: 'Settings',
      description: 'App preferences and configuration',
      action: () => {
        navigate('/settings');
      },
      divider: false
    },
    {
      icon: FaQuestionCircle,
      label: 'Help & Support',
      description: 'Get help and contact support',
      action: () => {
        navigate('/help');
      },
      divider: false
    },
    {
      icon: FaInfoCircle,
      label: 'About',
      description: 'App version and information',
      action: () => {
        navigate('/about');
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
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold overflow-hidden ${
          isDark ? 'bg-gray-600 text-white border-2 border-gray-500' : 'bg-white text-blue-600 border-2 border-blue-200'
        }`}>
          {getProfileImage() ? (
            <img 
              src={getProfileImage()} 
              alt="User profile picture" 
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
        
        {/* Chevron - hidden on mobile */}
        <FaChevronDown 
          className={`hidden sm:block text-xs transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`fixed right-2 top-16 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-xl shadow-2xl border overflow-hidden transition-all duration-200 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } ${isAnimating ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        style={{ zIndex: 9999 }}>
          
          {/* User Info Header */}
          <div className={`p-4 border-b ${
            isDark 
              ? 'border-gray-700 bg-gray-750' 
              : 'border-gray-100 bg-gray-50'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold overflow-hidden border-2 ${
                isDark ? 'bg-gray-600 text-white border-gray-500' : 'bg-blue-100 text-blue-600 border-blue-200'
              }`}>
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt="User profile picture" 
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
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.name || 'User'}
                </h3>
                <p className={`text-sm truncate ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {user?.email || 'user@youngeagles.org.za'}
                </p>
                <p className={`text-xs font-medium capitalize ${getRoleColor(user?.role)}`}>
                  {user?.role || 'User'}
                </p>
              </div>
              
              {/* Quick Theme Toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTheme();
                }}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'hover:bg-gray-600 text-gray-300' 
                    : 'hover:bg-gray-200 text-gray-600'
                }`}
                title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              >
                {isDark ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-blue-600" />}
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <button
                  onClick={() => handleItemClick(item.action)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors group ${
                    item.danger
                      ? isDark
                        ? 'hover:bg-red-900/50 text-red-400'
                        : 'hover:bg-red-50 text-red-600'
                      : isDark
                        ? 'hover:bg-gray-700 text-gray-200'
                        : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <item.icon className={`mr-3 text-lg transition-colors ${
                    item.danger 
                      ? (isDark ? 'text-red-400 group-hover:text-red-300' : 'text-red-500 group-hover:text-red-600')
                      : (isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-500 group-hover:text-gray-600')
                  }`} />
                  <div className="flex-1">
                    <div className={`font-medium transition-colors ${
                      item.danger 
                        ? (isDark ? 'text-red-400 group-hover:text-red-300' : 'text-red-600 group-hover:text-red-700')
                        : (isDark ? 'text-white group-hover:text-gray-100' : 'text-gray-900 group-hover:text-gray-800')
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs transition-colors ${
                      item.danger
                        ? isDark ? 'text-red-500 group-hover:text-red-400' : 'text-red-500 group-hover:text-red-600'
                        : isDark ? 'text-gray-500 group-hover:text-gray-400' : 'text-gray-500 group-hover:text-gray-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
                {item.divider && (
                  <div className={`my-1 border-t ${
                    isDark ? 'border-gray-700' : 'border-gray-100'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Footer */}
          <div className={`px-4 py-3 border-t text-center ${
            isDark 
              ? 'border-gray-700 bg-gray-750' 
              : 'border-gray-100 bg-gray-50'
          }`}>
            <p className={`text-xs ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              Young Eagles PWA v2.0.0
            </p>
            <div className="flex items-center justify-center space-x-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${
                isDark ? 'bg-green-400' : 'bg-green-500'
              }`}></div>
              <span className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                Connected
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
