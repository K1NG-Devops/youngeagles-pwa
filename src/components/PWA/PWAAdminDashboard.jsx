import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUsers, FaChalkboardTeacher, FaBook, FaBell, FaChartBar, FaCog, FaClipboardList, FaSpinner, FaUserShield, FaSchool } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_CONFIG } from '../../config/api';

const PWAAdminDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalHomeworks: 0,
    totalSubmissions: 0,
    systemHealth: 'Good'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        if (import.meta.env.DEV) {
          // Mock data for development
      setTimeout(() => {
        setAdminStats({
          totalUsers: 150,
          totalTeachers: 12,
          totalParents: 138,
          totalHomeworks: 45,
          totalSubmissions: 234,
          systemHealth: 'Excellent'
        });
            setRecentActivity([
              { message: 'New parent registered: Sarah Johnson', timestamp: '2 hours ago' },
              { message: 'Teacher posted new homework', timestamp: '4 hours ago' },
              { message: 'System backup completed', timestamp: '6 hours ago' }
            ]);
            setIsLoading(false);
          }, 1000);
        } else {
          // Fetch real data from backend
          const token = localStorage.getItem('accessToken');
          const res = await axios.get(`${API_CONFIG.getApiUrl()}/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAdminStats({
            totalUsers: res.data.totalUsers || 0,
            totalTeachers: res.data.totalTeachers || 0,
            totalParents: res.data.totalParents || 0,
            totalHomeworks: res.data.totalHomeworks || 0,
            totalSubmissions: res.data.totalSubmissions || 0,
            systemHealth: res.data.systemHealth || 'Good'
          });
          setRecentActivity(res.data.recentActivity || []);
          setIsLoading(false);
        }
      } catch (error) {
        toast.error('Failed to load admin dashboard data');
        setIsLoading(false);
    }
    };
    fetchAdminStats();
  }, []);

  const adminName = auth?.user?.name || 'Admin';

  const quickActions = [
    {
      id: 'users',
      title: 'Manage Users',
      description: 'Add/Edit users',
      icon: FaUsers,
      color: 'blue',
      path: '/admin-users',
      badge: adminStats.totalUsers
    },
    {
      id: 'teachers',
      title: 'Teachers',
      description: 'Manage teachers',
      icon: FaChalkboardTeacher,
      color: 'green',
      path: '/admin-teachers',
      badge: adminStats.totalTeachers
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
      value: adminStats.totalUsers, 
      icon: FaUsers, 
      color: 'blue',
      trend: '+12 this month'
    },
    { 
      label: 'Teachers', 
      value: adminStats.totalTeachers, 
      icon: FaChalkboardTeacher, 
      color: 'green',
      trend: '+2 this month'
    },
    { 
      label: 'Parents', 
      value: adminStats.totalParents, 
      icon: FaSchool, 
      color: 'indigo',
      trend: '+10 this month'
    },
    { 
      label: 'Homeworks', 
      value: adminStats.totalHomeworks, 
      icon: FaBook, 
      color: 'yellow',
      trend: '+5 this week'
    },
    { 
      label: 'Submissions', 
      value: adminStats.totalSubmissions, 
      icon: FaClipboardList, 
      color: 'red',
      trend: '+23 this week'
    },
    { 
      label: 'System Health', 
      value: adminStats.systemHealth, 
      icon: FaBell, 
      color: 'green',
      trend: 'All systems operational'
    }
  ];

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-hidden pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-white bg-opacity-20 rounded-full">
            <FaUserShield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-1">Welcome, {adminName}!</h2>
            <p className="text-sm text-purple-100">System Administration Dashboard</p>
          </div>
        </div>
        
        {import.meta.env.DEV && (
          <div className="mt-3 bg-white bg-opacity-20 rounded-lg p-2">
            <p className="text-sm font-medium">🔧 Development Mode - Mock Data Active</p>
          </div>
        )}
      </div>

      {/* System Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {systemStats.map((stat, index) => {
          const IconComponent = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
            indigo: 'bg-indigo-100 text-indigo-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            red: 'bg-red-100 text-red-600',
            orange: 'bg-orange-100 text-orange-600'
          };

          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-full ${colorClasses[stat.color]}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                {isLoading && <FaSpinner className="animate-spin text-gray-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500 mt-1">{stat.trend}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-700',
              green: 'bg-green-50 border-green-200 text-green-700',
              purple: 'bg-purple-50 border-purple-200 text-purple-700',
              orange: 'bg-orange-50 border-orange-200 text-orange-700'
            };
            
            return (
              <Link
                key={action.id}
                to={action.path}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all min-h-[100px] ${colorClasses[action.color]} hover:shadow-md cursor-pointer`}
                onClick={(e) => {
                  if (import.meta.env.DEV && action.id !== 'teachers') {
                    e.preventDefault();
                    toast.info(`${action.title} feature coming soon!`);
                  }
                }}
              >
                <div className={`p-2 rounded-lg mb-2 bg-${action.color}-100`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs opacity-75">{action.description}</p>
                  {action.badge && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full mt-1">
                      {action.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">System Overview</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-700">System Status</span>
            </div>
            <span className="text-sm text-green-600 font-semibold">Online</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium text-blue-700">Database</span>
            </div>
            <span className="text-sm text-blue-600 font-semibold">Connected</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium text-purple-700">PWA Version</span>
            </div>
            <span className="text-sm text-purple-600 font-semibold">v1.0.0</span>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.length === 0 ? (
            <div className="text-gray-400 text-sm">No recent activity available.</div>
          ) : (
            recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-center space-x-3 p-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm text-gray-600">{activity.message}</p>
                <span className="text-xs text-gray-400">{activity.timestamp}</span>
          </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAAdminDashboard;

