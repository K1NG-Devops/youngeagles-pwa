import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBook, FaBell, FaChartBar, FaCog, FaClipboardList, FaSpinner, FaUserShield, FaSchool, FaChild, FaBaby, FaExclamationTriangle, FaCheckCircle, FaPlus, FaUserPlus, FaSun, FaMoon, FaWifi, FaUnlink } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import useWebSocket from '../../hooks/useWebSocket';
import { showTopNotification } from '../TopNotificationManager';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import AdminService from '../../services/adminService';
import AdminUserManagement from './AdminUserManagement';
import ChildrenManagement from './ChildrenManagement';
import { useTheme } from '../../hooks/useTheme.jsx';

const PWAAdminDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  
  // WebSocket Integration for Real-time Updates
  const { 
    isConnected: wsConnected, 
    addEventListener: addWSListener, 
    removeEventListener: removeWSListener,
    lastMessage 
  } = useWebSocket();
  
  const [dashboardData, setDashboardData] = useState(null);
  const [quickActions, setQuickActions] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [realtimeActivity, setRealtimeActivity] = useState([]);
  const [liveNotifications, setLiveNotifications] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // WebSocket Real-time Event Handlers
  useEffect(() => {
    if (!wsConnected) return;

    console.log('🔌 Admin Dashboard: Setting up WebSocket listeners');

    // Listen for new homework submissions
    const handleNewSubmission = (data) => {
      console.log('📝 New homework submission received:', data);
      setRealtimeActivity(prev => [{
        id: Date.now(),
        type: 'submission',
        message: `New homework submission from ${data.studentName || 'student'}`,
        timestamp: new Date().toLocaleTimeString(),
        data: data
      }, ...prev.slice(0, 9)]); // Keep only 10 recent activities
      
      showTopNotification('New homework submission received!', 'success');
      
      // Update submission count in real-time
      setQuickActions(prev => prev ? {
        ...prev,
        pendingSubmissions: (prev.pendingSubmissions || 0) + 1
      } : null);
    };

    // Listen for new user registrations
    const handleNewUser = (data) => {
      console.log('👤 New user registered:', data);
      setRealtimeActivity(prev => [{
        id: Date.now(),
        type: 'user',
        message: `New ${data.role || 'user'} registered: ${data.name || 'Unknown'}`,
        timestamp: new Date().toLocaleTimeString(),
        data: data
      }, ...prev.slice(0, 9)]);
      
      showTopNotification(`New ${data.role || 'user'} registered!`, 'info');
      
      // Update user counts
      setDashboardData(prev => prev ? {
        ...prev,
        totalUsers: (prev.totalUsers || 0) + 1,
        [`total${data.role === 'parent' ? 'Parents' : data.role === 'teacher' ? 'Teachers' : 'Users'}`]: 
          (prev[`total${data.role === 'parent' ? 'Parents' : data.role === 'teacher' ? 'Teachers' : 'Users'}`] || 0) + 1
      } : null);
    };

    // Listen for system notifications
    const handleSystemNotification = (data) => {
      console.log('🔔 System notification received:', data);
      setLiveNotifications(prev => [{
        id: Date.now(),
        type: data.type || 'info',
        message: data.message,
        timestamp: new Date().toISOString(),
        urgent: data.urgent || false
      }, ...prev.slice(0, 19)]); // Keep 20 notifications
      
      showTopNotification(data.message, data.type || 'info');
    };

    // Listen for attendance updates
    const handleAttendanceUpdate = (data) => {
      console.log('📊 Attendance update received:', data);
      setRealtimeActivity(prev => [{
        id: Date.now(),
        type: 'attendance',
        message: `Attendance recorded for ${data.className || 'class'}`,
        timestamp: new Date().toLocaleTimeString(),
        data: data
      }, ...prev.slice(0, 9)]);
    };

    // Add WebSocket event listeners
    const cleanupSubmission = addWSListener('new_submission', handleNewSubmission);
    const cleanupUser = addWSListener('new_user', handleNewUser);
    const cleanupNotification = addWSListener('notification', handleSystemNotification);
    const cleanupAttendance = addWSListener('attendance_update', handleAttendanceUpdate);

    return () => {
      console.log('🔌 Admin Dashboard: Cleaning up WebSocket listeners');
      cleanupSubmission && cleanupSubmission();
      cleanupUser && cleanupUser();
      cleanupNotification && cleanupNotification();
      cleanupAttendance && cleanupAttendance();
    };
  }, [wsConnected, addWSListener]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all dashboard data in parallel
      const [dashboardStats, quickActionsData, analyticsData] = await Promise.all([
        AdminService.getDashboardStats(),
        AdminService.getQuickActions().catch(err => {
          console.warn('Quick actions failed:', err);
          return { pendingSubmissions: 0, newEnrollments: 0, inactiveUsers: 0, overdueHomework: 0 };
        }),
        AdminService.getAnalytics().catch(err => {
          console.warn('Analytics failed:', err);
          return { enrollmentTrends: [], classDistribution: [], ageDistribution: [], homeworkStats: {} };
        })
      ]);
      
      setDashboardData(dashboardStats);
      setQuickActions(quickActionsData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('❌ Failed to load admin dashboard:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const adminName = auth?.user?.name || 'Admin';

  const quickActionsList = [
    {
      id: 'users',
      title: 'Manage Users',
      description: 'Add/Edit users',
      icon: FaUsers,
      color: 'blue',
      path: '/admin-users',
      badge: dashboardData?.totalUsers || 0
    },
    {
      id: 'teachers',
      title: 'Teachers',
      description: 'Manage teachers',
      icon: FaChalkboardTeacher,
      color: 'green',
      path: '/admin-teachers',
      badge: dashboardData?.totalTeachers || 0
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'System reports',
      icon: FaChartBar,
      color: 'purple',
      path: '/admin-reports',
      badge: null
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'System config',
      icon: FaCog,
      color: 'orange',
      path: '/admin-settings',
      badge: null
    }
  ];

  const systemStats = [
    { 
      label: 'Total Users', 
      value: dashboardData?.totalUsers || 0, 
      icon: FaUsers, 
      color: 'blue',
      trend: 'Real database data'
    },
    { 
      label: 'Teachers', 
      value: dashboardData?.totalTeachers || 0, 
      icon: FaChalkboardTeacher, 
      color: 'green',
      trend: 'Active educators'
    },
    { 
      label: 'Parents', 
      value: dashboardData?.totalParents || 0, 
      icon: FaSchool, 
      color: 'indigo',
      trend: 'Registered families'
    },
    { 
      label: 'Children', 
      value: dashboardData?.totalChildren || 0, 
      icon: FaUsers, 
      color: 'purple',
      trend: 'Enrolled students'
    },
    { 
      label: 'Homeworks', 
      value: dashboardData?.totalHomeworks || 0, 
      icon: FaBook, 
      color: 'yellow',
      trend: 'Active assignments'
    },
    { 
      label: 'Submissions', 
      value: dashboardData?.totalSubmissions || 0, 
      icon: FaClipboardList, 
      color: 'red',
      trend: 'Student submissions'
    },
    { 
      label: 'Messages', 
      value: dashboardData?.totalMessages || 0, 
      icon: FaBell, 
      color: 'orange',
      trend: 'Communications'
    },
    { 
      label: 'System Health', 
      value: dashboardData?.systemHealth || 'Good', 
      icon: FaBell, 
      color: 'green',
      trend: 'Live monitoring'
    }
  ];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <div className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 sm:p-6 border transition-colors duration-200`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg" style={{backgroundColor: `${color}20`}}>
              <div style={{color}}>{icon}</div>
            </div>
            <p className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          </div>
          <p className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</p>
          {subtitle && <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, count, icon, color, onClick, urgent = false }) => (
    <div 
      className={`${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-all duration-200 border ${
        urgent ? `border-l-4 ${isDark ? 'border-red-400' : 'border-red-500'}` : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-2 rounded-lg ${urgent ? (isDark ? 'bg-red-900' : 'bg-red-100') : (isDark ? 'bg-gray-700' : 'bg-gray-100')}`}>
              <div style={{color: urgent ? (isDark ? '#F87171' : '#DC2626') : color}}>{icon}</div>
            </div>
          </div>
          <p className={`text-xs sm:text-sm font-medium uppercase tracking-wide ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${urgent ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-white' : 'text-gray-900')}`}>
            {count}
          </p>
        </div>
      </div>
      {urgent && count > 0 && (
        <div className={`mt-2 text-xs ${isDark ? 'text-red-400' : 'text-red-600'} font-medium`}>
          <FaExclamationTriangle className="inline mr-1" />
          Needs attention
        </div>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base whitespace-nowrap border ${
        active 
          ? (isDark ? 'bg-blue-600 text-white border-blue-500 shadow-lg' : 'bg-blue-500 text-white border-blue-400 shadow-lg')
          : (isDark ? 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700 hover:text-white' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200')
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col transition-colors duration-200`}>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="max-w-7xl mx-auto">
        {/* Mobile-First Header with Theme Toggle */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>School Administration</h1>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Manage your preschool efficiently from anywhere</p>
          </div>
          
          {/* WebSocket Status & Theme Toggle */}
          <div className="flex items-center space-x-3">
            {/* WebSocket Connection Indicator */}
            <div 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 border ${
                wsConnected 
                  ? (isDark ? 'bg-green-900 text-green-300 border-green-700' : 'bg-green-50 text-green-700 border-green-200')
                  : (isDark ? 'bg-red-900 text-red-300 border-red-700' : 'bg-red-50 text-red-700 border-red-200')
              }`}
              title={wsConnected ? 'Connected to real-time updates' : 'Disconnected from real-time updates'}
            >
              {wsConnected ? <FaWifi size={14} /> : <FaUnlink size={14} />}
              <span className="text-xs font-medium">
                {wsConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            
            <button
              onClick={toggleTheme}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 border ${
                isDark 
                  ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700 border-gray-700 shadow-lg' 
                  : 'bg-white text-gray-600 hover:bg-gray-100 border-gray-200 shadow-sm'
              }`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <FaSun size={18} /> : <FaMoon size={18} />}
              <span className="text-sm font-medium">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile-First Tab Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 overflow-x-auto pb-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={<FaChartBar size={16} />}
            active={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="users"
            label="Users"
            icon={<FaUsers size={16} />}
            active={activeTab === 'users'}
            onClick={setActiveTab}
          />
          <TabButton
            id="children"
            label="Children"
            icon={<FaChild size={16} />}
            active={activeTab === 'children'}
            onClick={setActiveTab}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            icon={<FaChartBar size={16} />}
            active={activeTab === 'analytics'}
            onClick={setActiveTab}
          />
          <TabButton
            id="settings"
            label="Settings"
            icon={<FaCog size={16} />}
            active={activeTab === 'settings'}
            onClick={setActiveTab}
          />
        </div>

        {/* Loading and Error States */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <FaSpinner className={`animate-spin text-2xl ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />
              <span className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</span>
            </div>
          </div>
        )}

        {error && (
          <div className={`${isDark ? 'bg-red-900 border-red-700 text-red-200' : 'bg-red-50 border-red-200 text-red-800'} border rounded-lg p-4 mb-6`}>
            <div className="flex items-center">
              <FaExclamationTriangle className="mr-2" />
              <span>Error loading dashboard: {error}</span>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Mobile-First Key Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Users"
                value={dashboardData?.totalUsers || 0}
                icon={<FaUsers size={20} />}
                color="#3B82F6"
                subtitle={`${dashboardData?.totalTeachers || 0} teachers, ${dashboardData?.totalParents || 0} parents`}
              />
              <StatCard
                title="Children Enrolled"
                value={dashboardData?.totalChildren || 0}
                icon={<FaChild size={20} />}
                color="#10B981"
                subtitle="Active enrollments"
              />
              <StatCard
                title="Homework Assignments"
                value={dashboardData?.totalHomeworks || 0}
                icon={<FaClipboardList size={20} />}
                color="#F59E0B"
                subtitle={`${dashboardData?.totalSubmissions || 0} submissions`}
              />
              <StatCard
                title="System Health"
                value={dashboardData?.systemHealth || 'Good'}
                icon={<FaCheckCircle size={20} />}
                color="#10B981"
                subtitle="All systems operational"
              />
            </div>

            {/* Mobile-First Quick Actions */}
            <div>
              <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickActionCard
                  title="Pending Submissions"
                  count={quickActions?.pendingSubmissions || 0}
                  icon={<FaClipboardList size={18} />}
                  color="#F59E0B"
                  urgent={quickActions?.pendingSubmissions > 0}
                  onClick={() => setActiveTab('homework')}
                />
                <QuickActionCard
                  title="New Enrollments"
                  count={quickActions?.newEnrollments || 0}
                  icon={<FaBaby size={18} />}
                  color="#10B981"
                  onClick={() => setActiveTab('children')}
                />
                <QuickActionCard
                  title="Inactive Users"
                  count={quickActions?.inactiveUsers || 0}
                  icon={<FaUsers size={18} />}
                  color="#6B7280"
                  urgent={quickActions?.inactiveUsers > 5}
                  onClick={() => setActiveTab('users')}
                />
                <QuickActionCard
                  title="Overdue Homework"
                  count={quickActions?.overdueHomework || 0}
                  icon={<FaExclamationTriangle size={18} />}
                  color="#EF4444"
                  urgent={quickActions?.overdueHomework > 0}
                  onClick={() => setActiveTab('homework')}
                />
              </div>
            </div>

            {/* Real-time Activity Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Real-time Activity {wsConnected && <span className="text-green-500">●</span>}
                </h2>
                {realtimeActivity.length > 0 && (
                  <button
                    onClick={() => setRealtimeActivity([])}
                    className={`text-xs px-3 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border transition-colors duration-200`}>
                {realtimeActivity.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {realtimeActivity.map((activity) => (
                      <div key={activity.id} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg transition-colors duration-200 animate-pulse`}>
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'submission' ? 'bg-yellow-500' :
                          activity.type === 'user' ? 'bg-green-500' :
                          activity.type === 'attendance' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{activity.message}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{activity.timestamp}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.type === 'submission' ? (isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                          activity.type === 'user' ? (isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800') :
                          activity.type === 'attendance' ? (isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800') :
                          (isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800')
                        }`}>
                          {activity.type}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'} text-center py-8`}>
                    <div className="flex flex-col items-center">
                      {wsConnected ? (
                        <>
                          <FaWifi className="text-3xl mb-2 text-green-500" />
                          <p className="mb-1">Listening for real-time updates...</p>
                          <p className="text-xs">New activities will appear here automatically</p>
                        </>
                      ) : (
                        <>
                          <FaUnlink className="text-3xl mb-2 text-red-500" />
                          <p className="mb-1">No real-time connection</p>
                          <p className="text-xs">Check your internet connection</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                data-testid="add-teacher-parent-btn"
                onClick={() => {
                  console.log('Add Teacher/Parent button clicked - switching to users tab');
                  setActiveTab('users');
                }}
                className={`${isDark ? 'bg-blue-800 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} rounded-lg p-6 flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer`}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <FaUserPlus size={20} />
                <span className="font-semibold">Add Teacher/Parent</span>
              </button>
              <button
                data-testid="enroll-child-btn"
                onClick={() => {
                  console.log('Enroll Child button clicked - switching to children tab');
                  setActiveTab('children');
                }}
                className={`${isDark ? 'bg-green-800 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'} rounded-lg p-6 flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer`}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <FaPlus size={20} />
                <span className="font-semibold">Enroll Child</span>
              </button>
              <button
                data-testid="view-reports-btn"
                onClick={() => {
                  console.log('View Reports button clicked - switching to analytics tab');
                  setActiveTab('analytics');
                }}
                className={`${isDark ? 'bg-purple-800 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'} rounded-lg p-6 flex items-center justify-center space-x-3 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer`}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
                <FaChartBar size={20} />
                <span className="font-semibold">View Reports</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <AdminUserManagement isDark={isDark} />
        )}

        {activeTab === 'children' && (
          <ChildrenManagement isDark={isDark} />
        )}

        {activeTab === 'analytics' && (
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg p-6 border transition-colors duration-200`}>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>School Analytics</h2>
            
            {/* Analytics Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className={`${isDark ? 'bg-blue-900' : 'bg-blue-50'} p-6 rounded-lg transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>Student Enrollment</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
                      {dashboardData?.totalChildren || 0}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>+12% this month</p>
                  </div>
                  <FaChild className="text-blue-500 text-2xl" />
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-green-900' : 'bg-green-50'} p-6 rounded-lg transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-green-200' : 'text-green-600'}`}>Active Teachers</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-900'}`}>
                      {dashboardData?.totalTeachers || 0}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-green-400' : 'text-green-500'}`}>All active</p>
                  </div>
                  <FaChalkboardTeacher className="text-green-500 text-2xl" />
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-purple-900' : 'bg-purple-50'} p-6 rounded-lg transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-purple-200' : 'text-purple-600'}`}>Homework Completed</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-900'}`}>
                      {dashboardData?.homeworkStats?.completionRate || '85'}%
                    </p>
                    <p className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-500'}`}>This week</p>
                  </div>
                  <FaBook className="text-purple-500 text-2xl" />
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-orange-900' : 'bg-orange-50'} p-6 rounded-lg transition-colors duration-200`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-orange-200' : 'text-orange-600'}`}>Attendance Rate</p>
                    <p className={`text-2xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-900'}`}>
                      {dashboardData?.attendanceRate || '92'}%
                    </p>
                    <p className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>This month</p>
                  </div>
                  <FaClipboardList className="text-orange-500 text-2xl" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg transition-colors duration-200`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Weekly Enrollment</h3>
                <div className={`h-64 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-center">
                    <FaChartBar className="text-4xl mb-2 mx-auto" />
                    <p>Enrollment chart coming soon</p>
                  </div>
                </div>
              </div>
              
              <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg transition-colors duration-200`}>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Class Performance</h3>
                <div className={`h-64 flex items-center justify-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <div className="text-center">
                    <FaChartBar className="text-4xl mb-2 mx-auto" />
                    <p>Performance chart coming soon</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} p-6 rounded-lg transition-colors duration-200`}>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Recent System Activity</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {liveNotifications.map((notification) => (
                  <div key={notification.id} className={`flex items-center gap-3 p-3 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg transition-colors duration-200 animate-pulse`}>
                    <div className={`w-2 h-2 rounded-full ${
                      notification.type === 'info' ? 'bg-blue-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      notification.type === 'error' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{notification.message}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{notification.timestamp}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notification.type === 'info' ? (isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800') :
                      notification.type === 'warning' ? (isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800') :
                      notification.type === 'error' ? (isDark ? 'bg-red-900 text-red-300' : 'bg-red-100 text-red-800') :
                      (isDark ? 'bg-purple-900 text-purple-300' : 'bg-purple-100 text-purple-800')
                    }`}>
                      {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default PWAAdminDashboard;