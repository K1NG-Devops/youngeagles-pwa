import React, { useState, useEffect, useRef, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaGraduationCap, FaBell, FaRobot, FaBars, FaTimes, FaGripVertical } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

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
  const [dragStartTime, setDragStartTime] = useState(null);
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [isClickDetected, setIsClickDetected] = useState(false);
  const [dragDelayTimer, setDragDelayTimer] = useState(null);
  const [hasActuallyMoved, setHasActuallyMoved] = useState(false);
  const dragDelayMs = 50; // 50ms delay to differentiate between click and drag
  const dragThreshold = 5; // 5px movement threshold
  
  // Define navigation items based on user role
  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', icon: FaHome, label: 'Dashboard', color: 'bg-blue-500' }
    ];

    if (user?.role === 'parent' || user?.userType === 'parent') {
      return [
        ...baseItems,
        { path: '/homework', icon: FaGraduationCap, label: 'Homework', color: 'bg-green-500' },
        { path: '/activities', icon: FaRobot, label: 'Activities', color: 'bg-purple-500' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events', color: 'bg-orange-500' },
        { path: '/notifications', icon: FaBell, label: 'Updates', color: 'bg-red-500' }
      ];
    } else if (user?.role === 'teacher' || user?.userType === 'teacher') {
      // For teachers
      return [
        ...baseItems,
        { path: '/homework', icon: FaGraduationCap, label: 'Homework', color: 'bg-green-500' },
        { path: '/classes', icon: FaGraduationCap, label: 'Classes', color: 'bg-indigo-500' },
        { path: '/events', icon: FaCalendarAlt, label: 'Events', color: 'bg-orange-500' }
      ];
    } else if (user?.role === 'admin' || user?.userType === 'admin') {
      // For admin
      return [
        ...baseItems,
        { path: '/management', icon: FaGraduationCap, label: 'Management', color: 'bg-green-500' },
        { path: '/admin-payment-review', icon: FaRobot, label: 'Payments', color: 'bg-purple-500' },
        { path: '/classes', icon: FaCalendarAlt, label: 'Classes', color: 'bg-orange-500' }
      ];
    } else {
      // Default fallback
      return baseItems;
    }
  };

  const navItems = getNavItems();

  // Save position to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('floatingNavPosition', JSON.stringify(position));
  }, [position]);

  const toggleMenu = useCallback(() => setIsExpanded(prev => !prev), []);

  const handleMouseDown = (e) => {
    // Allow dragging on the main FAB button, but not on expanded nav items
    const navLink = e.target.closest('a[href]');
    if (navLink) return; // Don't drag when clicking nav links
    
    e.preventDefault();
    
    // Clear any existing timer
    if (dragDelayTimer) {
      clearTimeout(dragDelayTimer);
    }
    
    // Store initial mouse position and time
    setInitialMousePos({ x: e.clientX, y: e.clientY });
    setDragStartTime(Date.now());
    setIsClickDetected(true);
    setHasActuallyMoved(false);
    
    const rect = dragRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setDragOffset({
      x: e.clientX - centerX,
      y: e.clientY - centerY
    });
    
    // Set up delay timer to enable dragging after delay
    const timer = setTimeout(() => {
      setIsDragging(true);
      setIsClickDetected(false);
    }, dragDelayMs);
    
    setDragDelayTimer(timer);
  };

  const handleMouseMove = useCallback((e) => {
    // Check if we should start dragging based on movement threshold
    if (isClickDetected && !isDragging) {
      const deltaX = Math.abs(e.clientX - initialMousePos.x);
      const deltaY = Math.abs(e.clientY - initialMousePos.y);
      
      // If movement exceeds threshold, start dragging immediately
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        if (dragDelayTimer) {
          clearTimeout(dragDelayTimer);
          setDragDelayTimer(null);
        }
        setIsDragging(true);
        setIsClickDetected(false);
      }
      return;
    }
    
    if (!isDragging) return;
    e.preventDefault();
    
    // Mark that actual movement occurred
    setHasActuallyMoved(true);
    
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
  }, [isClickDetected, isDragging, initialMousePos.x, initialMousePos.y, dragThreshold, dragDelayTimer, dragOffset.x, dragOffset.y]);

  const handleMouseUp = useCallback(() => {
    // Clear the drag delay timer
    if (dragDelayTimer) {
      clearTimeout(dragDelayTimer);
      setDragDelayTimer(null);
    }
    
    // If it was a quick click (timer didn't activate drag mode), toggle menu
    if (isClickDetected && !isDragging) {
      toggleMenu();
    }
    // If drag mode was activated but no actual movement occurred, it's a long press
    // In this case, do nothing (don't toggle menu)
    // If drag mode was activated AND movement occurred, it was a successful drag
    // In this case, also do nothing (position was already updated during movement)
    
    setIsDragging(false);
    setIsClickDetected(false);
    setHasActuallyMoved(false);
  }, [dragDelayTimer, isClickDetected, isDragging, toggleMenu]);

  const handleTouchStart = (e) => {
    // Allow dragging on the main FAB button, but not on expanded nav items
    const navLink = e.target.closest('a[href]');
    if (navLink) return; // Don't drag when clicking nav links
    
    e.preventDefault();
    
    // Clear any existing timer
    if (dragDelayTimer) {
      clearTimeout(dragDelayTimer);
    }
    
    const touch = e.touches[0];
    // Store initial touch position and time
    setInitialMousePos({ x: touch.clientX, y: touch.clientY });
    setDragStartTime(Date.now());
    setIsClickDetected(true);
    setHasActuallyMoved(false);
    
    const rect = dragRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    setDragOffset({
      x: touch.clientX - centerX,
      y: touch.clientY - centerY
    });
    
    // Set up delay timer to enable dragging after delay
    const timer = setTimeout(() => {
      setIsDragging(true);
      setIsClickDetected(false);
    }, dragDelayMs);
    
    setDragDelayTimer(timer);
  };

  const handleTouchMove = useCallback((e) => {
    const touch = e.touches[0];
    
    // Check if we should start dragging based on movement threshold
    if (isClickDetected && !isDragging) {
      const deltaX = Math.abs(touch.clientX - initialMousePos.x);
      const deltaY = Math.abs(touch.clientY - initialMousePos.y);
      
      // If movement exceeds threshold, start dragging immediately
      if (deltaX > dragThreshold || deltaY > dragThreshold) {
        if (dragDelayTimer) {
          clearTimeout(dragDelayTimer);
          setDragDelayTimer(null);
        }
        setIsDragging(true);
        setIsClickDetected(false);
      }
      return;
    }
    
    if (!isDragging) return;
    e.preventDefault();
    
    // Mark that actual movement occurred
    setHasActuallyMoved(true);
    
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
  }, [isClickDetected, isDragging, initialMousePos.x, initialMousePos.y, dragThreshold, dragDelayTimer, dragOffset.x, dragOffset.y]);

  const handleTouchEnd = useCallback(() => {
    // Clear the drag delay timer
    if (dragDelayTimer) {
      clearTimeout(dragDelayTimer);
      setDragDelayTimer(null);
    }
    
    // If it was a quick tap (timer didn't activate drag mode), toggle menu
    if (isClickDetected && !isDragging) {
      toggleMenu();
    }
    // If drag mode was activated but no actual movement occurred, it's a long press
    // In this case, do nothing (don't toggle menu)
    // If drag mode was activated AND movement occurred, it was a successful drag
    // In this case, also do nothing (position was already updated during movement)
    
    setIsDragging(false);
    setIsClickDetected(false);
    setHasActuallyMoved(false);
  }, [dragDelayTimer, isClickDetected, isDragging, toggleMenu]);

  useEffect(() => {
    const handleClickOutside = event => {
      if (isExpanded && dragRef.current && !dragRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

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
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  return (
    <>
      {/* Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-50"
          onClick={toggleMenu}
          style={{ pointerEvents: isDragging ? 'none' : 'auto' }}
        />
      )}

      {/* Floating Navigation Items */}
      <div 
        ref={dragRef}
        className="fixed z-[60] select-none"
        style={{ 
          bottom: `${Math.max(20, position.bottom)}px`, 
          right: `${Math.max(20, position.right)}px`,
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
                : isDragging
                  ? 'bg-blue-700 scale-110'
                  : isDark 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-blue-500 hover:bg-blue-600'
            }`}
            style={{ pointerEvents: 'auto' }}
          >
            {isExpanded ? (
              <FaTimes className="text-white text-xl" />
            ) : (
              <div className="flex flex-col items-center">
                <FaBars className="text-white text-lg mb-0.5" />
                <FaGripVertical className={`text-white text-xs transition-opacity ${
                  isDragging ? 'opacity-100' : 'opacity-60'
                }`} />
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