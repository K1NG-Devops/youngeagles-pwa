import React, { useState, useRef, useEffect } from 'react';
import { FaCog, FaSignOutAlt, FaUserCircle, FaChevronDown, FaQuestionCircle, FaInfoCircle, FaCreditCard, FaMoon, FaSun, FaReceipt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getProfileImageUrl, getUserInitials } from '../utils/imageUtils';
import ProfilePictureModal from './common/ProfilePictureModal';

const UserDropdown = ({ onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Update profile image URL when user changes
  useEffect(() => {
    const newUrl = getProfileImageUrl(user);
    setProfileImageUrl(newUrl);
  }, [user?.profilePicture, user?.profile_picture, user?.avatar, user?.image, user?.updated_at, forceUpdate]);

  // Listen for profile picture updates
  useEffect(() => {
    const handleProfilePictureUpdate = (event) => {
      const { user: updatedUser, imageUrl } = event.detail;
      if (updatedUser?.id === user?.id) {
        setProfileImageUrl(imageUrl);
        setForceUpdate(prev => prev + 1);
      }
    };

    window.addEventListener('profilePictureUpdated', handleProfilePictureUpdate);
    return () => window.removeEventListener('profilePictureUpdated', handleProfilePictureUpdate);
  }, [user?.id]);

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
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setIsAnimating(true);
  };

  const handleClose = () => {
    setIsAnimating(false);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (isOpen) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleItemClick = (action) => {
    handleClose();
    setTimeout(() => action(), 150);
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
      label: 'Edit Profile Picture',
      description: 'Change your profile photo',
      action: () => setIsProfileModalOpen(true),
      divider: false
    },
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
        navigate('/management');
      },
      divider: false
    },
    {
      icon: FaReceipt,
      label: 'Payment Proofs',
      description: 'View and upload payment receipts',
      action: () => {
        navigate('/payment-proofs');
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
        navigate('/contact');
      },
      divider: false
    },
    {
      icon: FaInfoCircle,
      label: 'About',
      description: 'App version and information',
      action: () => {
        navigate('/settings');
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
      {/* Profile Button */}
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 p-2 rounded-lg transition-all duration-200 ${
          isDark 
            ? 'bg-gray-800 hover:bg-gray-700 text-white' 
            : 'bg-white hover:bg-gray-50 text-gray-900'
        } shadow-sm border ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
        aria-label="User menu"
      >
        {/* Profile Picture */}
        <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
          {profileImageUrl ? (
            <img
              src={profileImageUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              key={`dropdown-profile-${forceUpdate}`}
              onError={(e) => {
                console.error('❌ UserDropdown profile picture failed to load:', e.target.src);
                e.target.style.display = 'none';
                e.target.nextElementSibling.style.display = 'flex';
              }}
            />
          ) : null}
          {/* Fallback */}
          <div 
            className={`w-full h-full flex items-center justify-center text-white font-bold text-sm ${
              profileImageUrl ? 'hidden' : 'flex'
            }`}
            style={{ display: profileImageUrl ? 'none' : 'flex' }}
          >
            {getUserInitials(user)}
          </div>
        </div>
        
        {/* User Name - Hidden on mobile for space */}
        <span className="hidden md:block text-sm font-medium truncate max-w-24">
          {user?.name || 'User'}
        </span>
        
        {/* Dropdown Arrow */}
        <FaChevronDown 
          className={`text-xs transition-transform duration-200 ${
            isAnimating ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute right-0 top-full mt-2 w-72 max-h-[80vh] rounded-xl shadow-xl border z-[60] overflow-hidden ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        } ${isAnimating ? 'animate-slideDown' : ''}`}>
          
          {/* User Info Header */}
          <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleItemClick(() => setIsProfileModalOpen(true))}
                className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center hover:scale-105 transition-transform duration-200 cursor-pointer"
                title="Edit profile picture"
              >
                {profileImageUrl ? (
                  <img 
                    src={profileImageUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    key={`dropdown-profile-${forceUpdate}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold">
                    {getUserInitials(user)}
                  </div>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {user?.name || 'User'}
                </h3>
                <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email || 'user@example.com'}
                </p>
                <div className="flex items-center mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user?.role)}`}>
                    {user?.role || 'User'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-700">
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
