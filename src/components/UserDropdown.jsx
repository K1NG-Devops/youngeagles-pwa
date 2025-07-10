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
    const profilePic = user?.avatar || user?.profile_picture || user?.profilePicture || user?.image || null;
    
    if (profilePic && profilePic.startsWith('/uploads/')) {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
      // Add cache buster for development
      const cacheBuster = import.meta.env.DEV ? `?t=${Date.now()}` : '';
      return `${baseUrl}${profilePic}${cacheBuster}`;
    }
    
    return profilePic;
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
      {/* Settings Gear Button */}
      <button
        onClick={isOpen ? handleClose : handleOpen}
        className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-blue-500 text-white hover:text-white'
        } ${isOpen ? (isDark ? 'bg-gray-700' : 'bg-blue-500') : ''}`}
        title="Settings & Menu"
      >
        <FaCog className={`text-lg transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
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
              {/* Profile Picture in Dropdown */}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold overflow-hidden ${
                isDark ? 'bg-gray-600 text-white border-2 border-gray-500' : 'bg-blue-500 text-white border-2 border-blue-400'
              }`}>
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    onLoad={() => console.log('✅ Dropdown profile picture loaded:', getProfileImage())}
                    onError={(e) => {
                      console.error('❌ Dropdown profile picture failed to load:', e.target.src);
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
                <p className={`text-sm ${getRoleColor(user?.role)} capitalize`}>
                  {user?.role || 'User'}
                </p>
                {user?.email && (
                  <p className={`text-xs truncate ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {user.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item, index) => (
              <div key={index}>
                <button
                  onClick={() => handleItemClick(item.action)}
                  className={`w-full px-4 py-3 text-left flex items-center space-x-3 transition-colors ${
                    isDark 
                      ? 'hover:bg-gray-700 text-gray-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${item.danger ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
                >
                  <item.icon className={`text-lg ${
                    item.danger ? 'text-red-500' : (isDark ? 'text-gray-400' : 'text-gray-500')
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${
                      item.danger ? 'text-red-600' : (isDark ? 'text-white' : 'text-gray-900')
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${
                      item.danger ? 'text-red-500' : (isDark ? 'text-gray-400' : 'text-gray-500')
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </button>
                {item.divider && <hr className={`${isDark ? 'border-gray-700' : 'border-gray-200'}`} />}
              </div>
            ))}
          </div>

          {/* Theme Toggle */}
          <div className={`p-4 border-t ${
            isDark 
              ? 'border-gray-700 bg-gray-750' 
              : 'border-gray-100 bg-gray-50'
          }`}>
            <button
              onClick={() => handleItemClick(toggleTheme)}
              className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-700 text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                {isDark ? (
                  <FaSun className="text-yellow-500" />
                ) : (
                  <FaMoon className="text-blue-500" />
                )}
                <span className="font-medium">
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </span>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors ${
                isDark ? 'bg-blue-600' : 'bg-gray-300'
              }`}>
                <div className={`w-4 h-4 mt-1 rounded-full bg-white transition-transform ${
                  isDark ? 'translate-x-5' : 'translate-x-1'
                }`} />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDropdown;
