import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBook, FaBell, FaChartBar, FaCog, FaClipboardList, FaSpinner, FaUserShield, FaSchool, FaChild, FaBaby, FaExclamationTriangle, FaCheckCircle, FaPlus, FaUserPlus } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';
import AdminService from '../../services/adminService';
import AdminUserManagement from './AdminUserManagement';
import ChildrenManagement from './ChildrenManagement';

const PWAAdminDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [quickActions, setQuickActions] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

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
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 border-l-4" style={{borderLeftColor: color}}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 sm:p-3 rounded-full ml-2" style={{backgroundColor: `${color}20`}}>
          <div style={{color}}>{icon}</div>
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ title, count, icon, color, onClick, urgent = false }) => (
    <div 
      className={`bg-white rounded-lg shadow-lg p-4 cursor-pointer hover:shadow-xl transition-shadow min-h-[80px] sm:min-h-[auto] ${
        urgent ? 'border-l-4 border-red-500' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${urgent ? 'text-red-600' : 'text-gray-900'}`}>
            {count}
          </p>
        </div>
        <div className={`p-2 rounded-full ml-2 ${urgent ? 'bg-red-100' : 'bg-gray-100'}`}>
          <div style={{color: urgent ? '#DC2626' : color}}>{icon}</div>
        </div>
      </div>
      {urgent && count > 0 && (
        <div className="mt-2 text-xs text-red-600 font-medium">
          <FaExclamationTriangle className="inline mr-1" />
          Needs attention
        </div>
      )}
    </div>
  );

  const TabButton = ({ id, label, icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base whitespace-nowrap ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
    <div className="min-h-screen bg-gray-50 px-3 py-4">
      <div className="max-w-7xl mx-auto">
        {/* Mobile-First Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">School Administration</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your preschool efficiently from anywhere</p>
        </div>

        {/* Mobile-First Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton
            id="overview"
            label="Overview"
            icon={<FaChartBar className="text-sm" />}
            active={activeTab === 'overview'}
            onClick={setActiveTab}
          />
          <TabButton
            id="users"
            label="Users"
            icon={<FaUsers className="text-sm" />}
            active={activeTab === 'users'}
            onClick={setActiveTab}
          />
          <TabButton
            id="children"
            label="Children"
            icon={<FaChild className="text-sm" />}
            active={activeTab === 'children'}
            onClick={setActiveTab}
          />
          <TabButton
            id="analytics"
            label="Analytics"
            icon={<FaClipboardList className="text-sm" />}
            active={activeTab === 'analytics'}
            onClick={setActiveTab}
          />
          <TabButton
            id="settings"
            label="Settings"
            icon={<FaCog className="text-sm" />}
            active={activeTab === 'settings'}
            onClick={setActiveTab}
          />
        </div>

        {/* Tab Content */}
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
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
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

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
              <div className="bg-white rounded-lg shadow-lg p-6">
                {dashboardData?.recentActivity?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500">{activity.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            </div>

            {/* Quick Add Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('users')}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FaUserPlus size={20} />
                <div className="text-left">
                  <p className="font-medium">Add Teacher/Parent</p>
                  <p className="text-sm opacity-90">Create new user account</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('children')}
                className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FaBaby size={20} />
                <div className="text-left">
                  <p className="font-medium">Enroll Child</p>
                  <p className="text-sm opacity-90">Add new student</p>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
              >
                <FaChartBar size={20} />
                <div className="text-left">
                  <p className="font-medium">View Reports</p>
                  <p className="text-sm opacity-90">School analytics</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <AdminUserManagement />
        )}

        {activeTab === 'children' && (
          <ChildrenManagement />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">School Analytics</h2>
              
              {/* Class Distribution */}
              {analytics?.classDistribution?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Class Distribution</h3>
                  <div className="space-y-2">
                    {analytics.classDistribution.map((classData, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium">{classData.className || 'Unknown Class'}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                          {classData.count} children
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Age Distribution */}
              {analytics?.ageDistribution?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Age Distribution</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {analytics.ageDistribution.map((ageData, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{ageData.count}</p>
                        <p className="text-sm text-gray-600">{ageData.age_group}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Homework Stats */}
              {analytics?.homeworkStats && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Homework Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {Math.round(analytics.homeworkStats.completion_rate || 0)}%
                      </p>
                      <p className="text-sm text-gray-600">Completion Rate</p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {analytics.homeworkStats.total_assignments || 0}
                      </p>
                      <p className="text-sm text-gray-600">Total Assignments</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {analytics.homeworkStats.total_submissions || 0}
                      </p>
                      <p className="text-sm text-gray-600">Submissions</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">System Settings</h2>
            <p className="text-gray-600">System settings and configuration options coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAAdminDashboard;

