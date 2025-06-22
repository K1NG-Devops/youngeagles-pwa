import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTrash, FaEye, FaClock, FaExclamationTriangle, FaInfo, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { showTopNotification } from '../components/TopNotificationManager';
import useAuth from '../hooks/useAuth';
import parentService from '../services/parentService';
import FloatingBackButton from '../components/FloatingBackButton';

const Notifications = () => {
  const { auth } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications from backend
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await parentService.getNotifications();
        setNotifications(Array.isArray(res) ? res : res.notifications || []);
      } catch (err) {
        setError('Failed to load notifications');
        showTopNotification('Failed to load notifications', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  // Filter notifications based on selected filter
  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'read':
        return notification.read;
      default:
        return true;
    }
  });

  const markAsRead = async (notificationId) => {
    setIsUpdating(true);
    try {
      await parentService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
      showTopNotification('Notification marked as read', 'success');
    } catch (err) {
      showTopNotification('Failed to update notification', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const markAllAsRead = async () => {
    setIsUpdating(true);
    try {
      await Promise.all(
        notifications.filter(n => !n.read).map(n => parentService.markNotificationAsRead(n.id))
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showTopNotification('All notifications marked as read', 'success');
    } catch (err) {
      showTopNotification('Failed to update notifications', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteNotification = async (notificationId) => {
    setIsUpdating(true);
    try {
      // No backend delete, just remove locally
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
      showTopNotification('Notification deleted', 'success');
    } catch (err) {
      showTopNotification('Failed to delete notification', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconClass = priority === 'high' ? 'text-red-500' : 
                     priority === 'medium' ? 'text-yellow-500' : 
                     'text-blue-500';
    switch (type) {
      case 'homework':
      case 'assignment':
        return <FaBell className={iconClass} />;
      case 'submission':
        return <FaCheckCircle className={iconClass} />;
      case 'reminder':
        return <FaClock className={iconClass} />;
      case 'grade':
        return <FaCheck className={iconClass} />;
      case 'announcement':
        return <FaExclamationTriangle className={iconClass} />;
      default:
        return <FaBell className={iconClass} />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'homework':
      case 'assignment':
        return 'bg-blue-100 text-blue-800';
      case 'submission':
        return 'bg-green-100 text-green-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800';
      case 'grade':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <FloatingBackButton theme="primary" />
      <div className="p-4 space-y-4 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
        <h1 className="text-xl font-bold mb-1">Notifications</h1>
        <p className="text-sm text-purple-100">
          {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
        </p>
      </div>
      {/* Filter and Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex space-x-2">
          <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Unread</button>
          <button onClick={() => setFilter('read')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === 'read' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Read</button>
        </div>
        <button onClick={markAllAsRead} disabled={isUpdating || unreadCount === 0} className="px-4 py-2 rounded-lg text-sm font-medium bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">Mark All as Read</button>
      </div>
      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-gray-400 text-2xl" />
            <span className="ml-2 text-gray-500">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className={`p-4 hover:bg-gray-50 transition-colors ${notification.read ? '' : 'bg-blue-50/50'}`}>
                <div className="flex items-center space-x-3">
                      {getNotificationIcon(notification.type, notification.priority)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(notification.type)}`}>{notification.type}</span>
                        {!notification.read && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">New</span>
                        )}
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <span className="text-xs text-gray-400">{formatTimeAgo(notification.date || notification.created_at)}</span>
                  </div>
                  <div className="flex flex-col space-y-2 items-end">
                    {!notification.read && (
                      <button onClick={() => markAsRead(notification.id)} disabled={isUpdating} className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50">Mark as Read</button>
                    )}
                    <button onClick={() => deleteNotification(notification.id)} disabled={isUpdating} className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FaBell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No notifications</p>
            <p className="text-gray-500">You're all caught up! No notifications to display.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Notifications;
