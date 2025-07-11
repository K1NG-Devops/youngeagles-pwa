import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaUserCircle, FaChevronDown, FaQuestionCircle, FaInfoCircle, FaCreditCard, FaMoon, FaSun } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import ProfilePictureModal from './common/ProfilePictureModal';

const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
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
    const profilePic = user?.profilePicture || user?.profile_picture || user?.avatar || user?.image || null;
    
    console.log('🖼️ UserDropdown profile picture debug:', {
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
      console.log('🔗 UserDropdown full profile picture URL:', fullUrl);
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
        className={`flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'hover:bg-gray-700 text-white' 
            : 'hover:bg-blue-500 text-white hover:text-white'
        } ${isOpen ? (isDark ? 'bg-gray-700' : 'bg-blue-500') : ''}`}
        title="Settings & Menu"
      >
        <FaCog className={`text-xl transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
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
              <button
                onClick={() => {
                  setIsProfileModalOpen(true);
                  handleClose();
                }}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold overflow-hidden transition-all duration-200 hover:scale-105 hover:ring-2 hover:ring-blue-500/50 cursor-pointer ${
                  isDark ? 'bg-gray-600 text-white border-2 border-gray-500' : 'bg-blue-500 text-white border-2 border-blue-400'
                }`}
                title="View and edit profile picture"
              >
                {getProfileImage() ? (
                  <img 
                    src={getProfileImage()} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover"
                    key={`dropdown-profile-${Date.now()}`} // Force re-render
                    onLoad={(e) => {
                      console.log('✅ Dropdown profile picture loaded:', e.target.src);
                      e.target.style.display = 'block';
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder) placeholder.style.display = 'none';
                    }}
                    onError={(e) => {
                      console.error('❌ Dropdown profile picture failed to load:', e.target.src);
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
      
      {/* Profile Picture Modal */}
      <ProfilePictureModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};

export default UserDropdown;
