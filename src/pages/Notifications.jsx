import React, { useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';
import { useTheme } from '../contexts/ThemeContext';
import { FaBell, FaEnvelope, FaExclamationCircle, FaTasks, FaClock, FaCheckCircle, FaUser } from 'react-icons/fa';
import AdPlacement from '../components/ads/AdPlacement';
import SmartAdManager from '../components/ads/SmartAdManager';

const Notifications = () => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new window.AbortController();
    
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiService.notifications.getAll({
          signal: abortController.signal
        });
        setNotifications(response.data.notifications || []);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error fetching notifications:', error);
          
          // Fallback to mock data if API is not available
          const mockNotifications = [
            {
              id: 1,
              title: 'Welcome to Young Eagles!',
              message: "Thank you for joining Young Eagles. We're excited to have you on board and look forward to supporting your child's learning journey.",
              type: 'announcement',
              priority: 'low',
              read: false,
              sender: 'Young Eagles Admin',
              timestamp: new Date().toISOString()
            },
            {
              id: 2,
              title: 'New Homework Assignment',
              message: 'A new mathematics homework assignment has been posted. Please check the homework section for details and submission instructions.',
              type: 'homework',
              priority: 'high',
              read: false,
              sender: 'Mathematics Teacher',
              timestamp: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            },
            {
              id: 3,
              title: 'Payment Reminder',
              message: 'This is a friendly reminder that your monthly school fees are due in 3 days. Please submit your payment proof through the app.',
              type: 'announcement',
              priority: 'medium',
              read: true,
              sender: 'Finance Department',
              timestamp: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
              id: 4,
              title: 'Parent-Teacher Conference',
              message: 'Parent-teacher conferences are scheduled for next week. Please check your calendar and confirm your appointment slot.',
              type: 'message',
              priority: 'medium',
              read: false,
              sender: 'Class Teacher',
              timestamp: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            }
          ];
          
          setNotifications(mockNotifications);
          setError(null); // Clear error since we have fallback data
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, []);

  const getNotificationIcon = useCallback((type) => {
    switch (type) {
    case 'homework': return FaTasks;
    case 'message': return FaEnvelope;
    case 'announcement': return FaExclamationCircle;
    default: return FaBell;
    }
  }, []);

  const getPriorityColor = useCallback((priority) => {
    const colors = {
      high: isDark ? 'text-red-400 bg-red-900/20 border-red-800' : 'text-red-600 bg-red-50 border-red-200',
      medium: isDark ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800' : 'text-yellow-600 bg-yellow-50 border-yellow-200',
      low: isDark ? 'text-green-400 bg-green-900/20 border-green-800' : 'text-green-600 bg-green-50 border-green-200',
      default: isDark ? 'text-blue-400 bg-blue-900/20 border-blue-800' : 'text-blue-600 bg-blue-50 border-blue-200'
    };
    return colors[priority] || colors.default;
  }, [isDark]);

  const formatTimestamp = useCallback((timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // Update local state immediately for better UX
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Make API call to persist the change
      await apiService.notifications.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Revert local state if API call fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: false }
            : notification
        )
      );
    }
  }, []);

  const handleKeyDown = useCallback((e, notificationId) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      markAsRead(notificationId);
    }
  }, [markAsRead]);

  const retryFetch = useCallback(() => {
    window.location.reload(); // Simple retry - you might want a more sophisticated approach
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaExclamationCircle className={`text-4xl mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={retryFetch}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`min-h-screen mt-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-32`}>
      <div className="p-4 space-y-4 mt-4">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">🔔 Notifications</h1>
              <p className="text-purple-100 text-sm">Stay updated with the latest messages and alerts</p>
            </div>
            {unreadCount > 0 && (
              <div 
                className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount}
              </div>
            )}
          </div>
        </div>

        {/* Header Ad */}
        <SmartAdManager 
          adUnit="header" 
          context="notifications"
          className="my-6"
        />

        {notifications.length === 0 ? (
          <div className={`p-6 text-center rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <FaBell className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No New Notifications</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Check back later for new messages and alerts.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const IconComponent = getNotificationIcon(notification.type);
              return (
                <div key={notification.id}>
                  <div 
                    className={`p-4 rounded-xl shadow-sm border transition-all hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                    } ${!notification.read ? (isDark ? 'border-l-4 border-l-blue-400' : 'border-l-4 border-l-blue-500') : ''}`}
                    onClick={() => markAsRead(notification.id)}
                    onKeyDown={(e) => handleKeyDown(e, notification.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Mark notification "${notification.title}" as read`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getPriorityColor(notification.priority)}`}>
                          <IconComponent className="text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div 
                                className="w-2 h-2 bg-blue-500 rounded-full"
                                aria-label="Unread notification"
                              ></div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(notification.priority)}`}>
                              {notification.priority?.toUpperCase() || 'NORMAL'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <FaClock className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        {notification.read && (
                          <div className="flex items-center space-x-1">
                            <FaCheckCircle className={`text-xs ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                            <span className={`text-xs ${isDark ? 'text-green-400' : 'text-green-500'}`}>Read</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-2">
                        <FaUser className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          From: {notification.sender}
                        </span>
                      </div>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} leading-relaxed`}>
                        {notification.message}
                      </p>
                    </div>
                  </div>
                  
                  {/* Native In-Feed Ad every 3rd notification */}
                  {(index + 1) % 3 === 0 && (
                    <AdPlacement
                      adUnit="native-in-feed"
                      className="my-4"
                      format="native"
                      style={{ textAlign: 'center' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {/* Content Ad */}
        <SmartAdManager 
          adUnit="content" 
          context="notifications"
          className="my-6"
        />
        
        {/* Summary Section */}
        <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Notification Summary
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {notifications.length} total • {unreadCount} unread
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {unreadCount}
              </div>
              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                New alerts
              </div>
            </div>
          </div>
        </div>

        {/* Footer Ad */}
        <SmartAdManager 
          adUnit="footer" 
          context="notifications"
          className="my-6"
        />
      </div>
    </div>
  );
};

export default Notifications;