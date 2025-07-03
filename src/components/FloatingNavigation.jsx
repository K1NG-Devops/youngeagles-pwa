import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaGraduationCap, FaBell, FaRobot, FaBars, FaTimes, FaGripVertical } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';

const FloatingNavigation = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(() => {
    // Load saved position from localStorage or use default
    const saved = localStorage.getItem('floatingNavPosition');
    return saved ? JSON.parse(saved) : { bottom: 24, right: 24 };
  });
  const dragRef = useRef(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'bg-blue-500' }
    ];

    if (user?.role === 'parent') {
      return [
        ...baseItems,
        { path: '/homework', icon: FaGraduationCap, label: 'Homework', color: 'bg-green-500' },
        { path: '/activities', icon: FaRobot, label: 'Activities', color: 'bg-purple-500' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events', color: 'bg-orange-500' },
        { path: '/notifications', icon: FaBell, label: 'Updates', color: 'bg-red-500' }
      ];
    } else {
      // For teachers and admin
      return [
        ...baseItems,
        { path: '/homework', icon: FaGraduationCap, label: 'Homework', color: 'bg-green-500' },
        { path: '/activities', icon: FaRobot, label: 'Activities', color: 'bg-purple-500' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events', color: 'bg-orange-500' }
      ];
    }
  };

  const navItems = getNavItems();

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('floatingNavPosition', JSON.stringify(position));
  }, [position]);

  const toggleMenu = () => setIsExpanded(!isExpanded);

  const handleMouseDown = (e) => {
    if (e.target.closest('.nav-item-button')) return; // Don't drag when clicking nav items
    e.preventDefault();
    setIsDragging(true);
    
    const rect = dragRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setDragOffset({
      x: e.clientX - centerX,
      y: e.clientY - centerY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonSize = 56; // 14 * 4 = 56px (w-14 h-14)
    
    // Calculate new position
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    
    // Constrain to viewport bounds
    const left = Math.max(buttonSize / 2, Math.min(viewportWidth - buttonSize / 2, newX));
    const top = Math.max(buttonSize / 2, Math.min(viewportHeight - buttonSize / 2, newY));
    
    // Convert to bottom/right for CSS positioning
    const bottom = viewportHeight - top - buttonSize / 2;
    const right = viewportWidth - left - buttonSize / 2;
    
    setPosition({ bottom, right });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.target.closest('.nav-item-button')) return;
    e.preventDefault();
    setIsDragging(true);
    
    const touch = e.touches[0];
    const rect = dragRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setDragOffset({
      x: touch.clientX - centerX,
      y: touch.clientY - centerY
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const buttonSize = 56;
    
    const newX = touch.clientX - dragOffset.x;
    const newY = touch.clientY - dragOffset.y;
    
    const left = Math.max(buttonSize / 2, Math.min(viewportWidth - buttonSize / 2, newX));
    const top = Math.max(buttonSize / 2, Math.min(viewportHeight - buttonSize / 2, newY));
    
    const bottom = viewportHeight - top - buttonSize / 2;
    const right = viewportWidth - left - buttonSize / 2;
    
    setPosition({ bottom, right });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Add event listeners for drag functionality
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={toggleMenu}
        />
      )}

      {/* Floating Navigation Items */}
      <div 
        ref={dragRef}
        className="fixed z-50 select-none"
        style={{ 
          bottom: `${position.bottom}px`, 
          right: `${position.right}px`,
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div className="flex flex-col-reverse items-end space-y-reverse space-y-3">
          
          {/* Navigation Items */}
          {isExpanded && navItems.map(({ path, icon: Icon, label, color }, index) => (
            <div
              key={path}
              className="flex items-center space-x-3"
              style={{
                animation: `slideUp 0.3s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Label */}
              <div className={`px-3 py-2 rounded-lg shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <span className={`text-sm font-medium whitespace-nowrap ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {label}
                </span>
              </div>
              
              {/* Icon Button */}
              <NavLink
                to={path}
                onClick={toggleMenu}
                className={({ isActive }) => 
                  `nav-item-button w-12 h-12 rounded-full ${color} flex items-center justify-center shadow-lg transition-all hover:scale-110 ${
                    isActive ? 'ring-4 ring-white ring-opacity-40' : ''
                  }`
                }
              >
                <Icon className="text-white text-lg" />
              </NavLink>
            </div>
          ))}

          {/* Main FAB Button */}
          <button
            onClick={toggleMenu}
            className={`nav-item-button w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 relative ${
              isExpanded 
                ? 'bg-red-500 rotate-45' 
                : isDark 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isExpanded ? (
              <FaTimes className="text-white text-xl" />
            ) : (
              <div className="flex flex-col items-center">
                <FaBars className="text-white text-lg mb-0.5" />
                <FaGripVertical className="text-white text-xs opacity-60" />
              </div>
            )}
          </button>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default FloatingNavigation; 