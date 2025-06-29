import React, { useState, useEffect } from 'react';
import { FaBell, FaPlus, FaUser, FaUsers, FaChalkboardTeacher, FaSchool, FaPaperPlane, FaTrash, FaSpinner, FaCheck, FaExclamationTriangle, FaInfoCircle, FaBook, FaCalendar, FaClock } from 'react-icons/fa';
import { showTopNotification } from '../../utils/notifications';
import httpClient from '../../services/httpClient';

const AdminNotifications = ({ isDark }) => {
  const [activeTab, setActiveTab] = useState('send');
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Form state for sending notifications
  const [notificationForm, setNotificationForm] = useState({
    type: 'announcement',
    title: '',
    message: '',
    priority: 'normal',
    recipientType: 'all', // all, parents, teachers, specific
    specificUserId: '',
    userType: 'parent'
  });

  const [users, setUsers] = useState({
    parents: [],
    teachers: []
  });

  useEffect(() => {
    if (activeTab === 'history') {
      loadNotifications();
    }
    if (activeTab === 'send') {
      loadUsers();
    }
  }, [activeTab]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await httpClient.get('/api/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      showTopNotification('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Load parents and teachers for recipient selection
      const [parentsResponse, teachersResponse] = await Promise.all([
        httpClient.get('/api/admin/parents').catch(() => ({ data: [] })),
        httpClient.get('/api/admin/teachers').catch(() => ({ data: [] }))
      ]);
      
      setUsers({
        parents: parentsResponse.data || [],
        teachers: teachersResponse.data || []
      });
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setNotificationForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const sendNotification = async () => {
    if (!notificationForm.title || !notificationForm.message) {
      showTopNotification('Please fill in title and message', 'error');
      return;
    }

    try {
      setSending(true);
      
      if (notificationForm.recipientType === 'all') {
        // Send to all parents and teachers
        const allParents = users.parents.map(parent => ({
          userId: parent.id,
          userType: 'parent'
        }));
        const allTeachers = users.teachers.map(teacher => ({
          userId: teacher.id,
          userType: 'teacher'
        }));
        
        const allRecipients = [...allParents, ...allTeachers];
        
        for (const recipient of allRecipients) {
          await httpClient.post('/api/notifications', {
            userId: recipient.userId,
            userType: recipient.userType,
            type: notificationForm.type,
            title: notificationForm.title,
            message: notificationForm.message,
            priority: notificationForm.priority
          });
        }
        
        showTopNotification(`Notification sent to ${allRecipients.length} users`, 'success');
      } else if (notificationForm.recipientType === 'parents') {
        // Send to all parents
        for (const parent of users.parents) {
          await httpClient.post('/api/notifications', {
            userId: parent.id,
            userType: 'parent',
            type: notificationForm.type,
            title: notificationForm.title,
            message: notificationForm.message,
            priority: notificationForm.priority
          });
        }
        
        showTopNotification(`Notification sent to ${users.parents.length} parents`, 'success');
      } else if (notificationForm.recipientType === 'teachers') {
        // Send to all teachers
        for (const teacher of users.teachers) {
          await httpClient.post('/api/notifications', {
            userId: teacher.id,
            userType: 'teacher',
            type: notificationForm.type,
            title: notificationForm.title,
            message: notificationForm.message,
            priority: notificationForm.priority
          });
        }
        
        showTopNotification(`Notification sent to ${users.teachers.length} teachers`, 'success');
      } else if (notificationForm.recipientType === 'specific') {
        // Send to specific user
        await httpClient.post('/api/notifications', {
          userId: parseInt(notificationForm.specificUserId),
          userType: notificationForm.userType,
          type: notificationForm.type,
          title: notificationForm.title,
          message: notificationForm.message,
          priority: notificationForm.priority
        });
        
        showTopNotification('Notification sent successfully', 'success');
      }

      // Reset form
      setNotificationForm({
        type: 'announcement',
        title: '',
        message: '',
        priority: 'normal',
        recipientType: 'all',
        specificUserId: '',
        userType: 'parent'
      });

    } catch (error) {
      console.error('Failed to send notification:', error);
      showTopNotification('Failed to send notification', 'error');
    } finally {
      setSending(false);
    }
  };

  const createSampleNotifications = async () => {
    try {
      setLoading(true);
      const response = await httpClient.post('/api/admin/notifications/sample');
      if (response.data.success) {
        showTopNotification('Sample notifications created successfully', 'success');
        loadNotifications();
      } else {
        showTopNotification('Failed to create sample notifications', 'error');
      }
    } catch (error) {
      console.error('Failed to create sample notifications:', error);
      showTopNotification('Failed to create sample notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const clearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await httpClient.delete('/api/admin/notifications/clear');
      if (response.data.success) {
        showTopNotification('All notifications cleared successfully', 'success');
        setNotifications([]);
      } else {
        showTopNotification('Failed to clear notifications', 'error');
      }
    } catch (error) {
      console.error('Failed to clear notifications:', error);
      showTopNotification('Failed to clear notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        active 
          ? (isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white')
          : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
      }`}
    >
      {icon}
      {label}
    </button>
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'announcement': return <FaBell className="text-blue-500" />;
      case 'homework': return <FaBook className="text-orange-500" />;
      case 'event': return <FaCalendar className="text-purple-500" />;
      case 'reminder': return <FaClock className="text-yellow-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800';
      case 'normal': return isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800';
      case 'low': return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
      default: return isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border transition-colors duration-200`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          <FaBell className="inline mr-2" />
          Notification Management
        </h2>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6">
        <TabButton
          id="send"
          label="Send Notification"
          icon={<FaPaperPlane size={16} />}
          active={activeTab === 'send'}
          onClick={setActiveTab}
        />
        <TabButton
          id="history"
          label="Notification History"
          icon={<FaBell size={16} />}
          active={activeTab === 'history'}
          onClick={setActiveTab}
        />
      </div>

      {/* Send Notification Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Notification Type */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Notification Type
            </label>
            <select
              value={notificationForm.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="announcement">Announcement</option>
              <option value="homework">Homework</option>
              <option value="event">Event</option>
              <option value="reminder">Reminder</option>
              <option value="general">General</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Priority
            </label>
            <select
              value={notificationForm.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Recipients */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Recipients
            </label>
            <select
              value={notificationForm.recipientType}
              onChange={(e) => handleInputChange('recipientType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="all">All Users (Parents & Teachers)</option>
              <option value="parents">All Parents</option>
              <option value="teachers">All Teachers</option>
              <option value="specific">Specific User</option>
            </select>
          </div>

          {/* Specific User Selection */}
          {notificationForm.recipientType === 'specific' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  User Type
                </label>
                <select
                  value={notificationForm.userType}
                  onChange={(e) => handleInputChange('userType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="parent">Parent</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                  Select User
                </label>
                <select
                  value={notificationForm.specificUserId}
                  onChange={(e) => handleInputChange('specificUserId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Select User</option>
                  {notificationForm.userType === 'parent' 
                    ? users.parents.map(parent => (
                        <option key={parent.id} value={parent.id}>{parent.name} ({parent.email})</option>
                      ))
                    : users.teachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>{teacher.name} ({teacher.email})</option>
                      ))
                  }
                </select>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Title
            </label>
            <input
              type="text"
              value={notificationForm.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter notification title..."
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Message */}
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Message
            </label>
            <textarea
              value={notificationForm.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              placeholder="Enter your announcement message..."
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end">
            <button
              onClick={sendNotification}
              disabled={sending || !notificationForm.title || !notificationForm.message}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                sending || !notificationForm.title || !notificationForm.message
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {sending ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      )}

      {/* Notification History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={createSampleNotifications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            >
              {loading ? <FaSpinner className="animate-spin" /> : <FaPlus />}
              Create Sample Notifications
            </button>
            <button
              onClick={clearAllNotifications}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <FaTrash />
              Clear All
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <FaSpinner className="animate-spin text-2xl" />
              <span className="ml-2">Loading notifications...</span>
            </div>
          ) : notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getNotificationIcon(notification.type)}
                      <div>
                        <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {notification.title}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            isDark ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'
                          }`}>
                            {notification.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(notification.date).toLocaleDateString()}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {new Date(notification.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <FaBell className="text-4xl mx-auto mb-2" />
              <p>No notifications found</p>
              <p className="text-sm">Create some sample notifications to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
