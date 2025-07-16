import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { 
  FaUsers, 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaCog, 
  FaBook, 
  FaFileAlt, 
  FaChartBar, 
  FaBell,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaShieldAlt,
  FaDatabase,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaEye,
  FaUserShield,
  FaChartLine,
  FaAd,
  FaUserCog,
  FaUserCheck,
  FaArrowLeft
} from 'react-icons/fa';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import ParentManagement from '../components/admin/ParentManagement';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalParents: 0,
    totalStudents: 0,
    totalClasses: 0,
    totalHomework: 0,
    pendingPayments: 0,
    systemAlerts: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [pendingPaymentProofs, setPendingPaymentProofs] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    api: 'operational',
    database: 'operational', 
    storage: 'operational'
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showParentManagement, setShowParentManagement] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all admin-relevant data
        const [childrenResponse, classesResponse, usersResponse] = await Promise.all([
          apiService.children.getAll().catch(() => ({ data: { children: [] } })),
          apiService.classes.getAll().catch(() => ({ data: { classes: [] } })),
          apiService.users?.getAll?.().catch(() => ({ data: { users: [] } }))
        ]);
        
        const children = childrenResponse.data.children || [];
        const classes = classesResponse.data.classes || [];
        const users = usersResponse?.data?.users || [];
        
        // Calculate user counts by role
        const teachers = users.filter(user => user.role === 'teacher').length;
        const parents = users.filter(user => user.role === 'parent').length;

        // Get admin dashboard stats (includes pending approvals)
        let adminStats = null;
        try {
          const statsResponse = await apiService.users.getStats();
          adminStats = statsResponse.data.stats;
        } catch (error) {
          console.log('Admin stats API not available, using fallback calculations');
        }
        
        // Try to fetch payment proofs to get pending count (as a fallback)
        let pendingPayments = adminStats?.pendingApprovals || 0;
        try {
          const paymentProofsResponse = await apiService.payments?.getProofs?.();
          const proofs = paymentProofsResponse?.data?.proofs || [];
          // Use backend stats if available, otherwise calculate manually
          if (!adminStats) {
            pendingPayments = proofs.filter(proof => proof.status === 'pending').length;
          }
          setPendingPaymentProofs(proofs.filter(proof => proof.status === 'pending').slice(0, 5));
        } catch (error) {
          console.log('Payment proofs API not available');
        }
        // Try to fetch homework data
        let homeworkCount = 0;
        try {
          const homeworkResponse = await apiService.homework?.getAll?.();
          homeworkCount = homeworkResponse?.data?.homework?.length || 0;
        } catch (error) {
          console.log('Homework API not available');
        }
        
        setStats({
          totalUsers: adminStats?.totalUsers || users.length,
          totalTeachers: adminStats?.totalTeachers || teachers,
          totalParents: adminStats?.totalParents || parents,
          totalStudents: adminStats?.totalChildren || children.length,
          totalClasses: classes.length,
          totalHomework: homeworkCount,
          pendingPayments: pendingPayments,
          systemAlerts: pendingPayments > 0 ? 1 : 0
        });
        
        // Set recent users (last 5)
        setRecentUsers(users.slice(-5).reverse());
        
        // Mock recent activity - in real app this would come from an activity log
        setRecentActivity([
          { id: 1, type: 'user_registered', message: 'New parent registered', time: '2 hours ago', user: 'John Smith' },
          { id: 2, type: 'payment_submitted', message: 'Payment proof submitted', time: '4 hours ago', user: 'Mary Johnson' },
          { id: 3, type: 'class_created', message: 'New class created', time: '6 hours ago', user: 'Teacher Sarah' },
          { id: 4, type: 'homework_assigned', message: 'Homework assigned', time: '8 hours ago', user: 'Teacher Mike' },
          { id: 5, type: 'user_login', message: 'Admin login', time: '1 day ago', user: 'Admin User' }
        ]);
        
      } catch (error) {
        console.error('Error fetching admin data:', error);
        nativeNotificationService.error('Failed to load admin dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // Handle quick actions
  const handleQuickAction = (action) => {
    switch (action) {
    case 'approve_payment':
      // Navigate to admin payment review page
      navigate('/admin-payment-review');
      break;
    case 'create_user':
      // Navigate to user management
      navigate('/management');
      break;
    case 'view_analytics':
      nativeNotificationService.info('Advanced analytics coming soon!');
      break;
    case 'system_settings':
      navigate('/settings');
      break;
    default:
      break;
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaUserShield className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Access Denied</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  // Show ParentManagement if selected
  if (showParentManagement) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="pt-4 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <button
                onClick={() => setShowParentManagement(false)}
                className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <FaArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin Dashboard
              </button>
            </div>
            <ParentManagement />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Main Content Container */}
      <div className="pt-4 pb-8">
        {/* Welcome Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-gradient-to-r border-b-2 mb-8 border-blue-500 rounded-xl from-blue-600 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    <FaUserShield className="inline mr-3" />
                    Admin Dashboard
                  </h1>
                  <p className="text-blue-100 text-sm md:text-base">
                    System Administration - Manage your Young Eagles platform
                  </p>
                </div>
                <div className="hidden md:flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.totalUsers}</div>
                    <div className="text-sm text-blue-200">Total Users</div>
                  </div>
                  <div className="w-px h-12 bg-blue-300"></div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                    <div className="text-sm text-blue-200">Pending Approvals</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUsers className="text-3xl text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Users
                  </p>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalUsers}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {stats.totalParents} parents, {stats.totalTeachers} teachers
                  </p>
                </div>
              </div>
            </div>

            {/* Students */}
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaUserGraduate className="text-3xl text-green-500" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Students
                  </p>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.totalStudents}
                  </p>
                </div>
              </div>
            </div>

            {/* Pending Payments */}
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaMoneyBillWave className="text-3xl text-yellow-500" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Pending Payments
                  </p>
                  <p className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {stats.pendingPayments}
                  </p>
                  {stats.pendingPayments > 0 && (
                    <p className="text-xs text-yellow-500">Requires approval</p>
                  )}
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FaDatabase className="text-3xl text-green-500" />
                </div>
                <div className="ml-4">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    System Health
                  </p>
                  <div className="flex items-center space-x-2">
                    <FaCheckCircle className="text-green-500" />
                    <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      Operational
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="mb-8">
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => handleQuickAction('approve_payment')}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaMoneyBillWave className="text-2xl text-yellow-500 mx-auto mb-2" />
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Approve Payments</p>
              </button>
              
              <button
                onClick={() => handleQuickAction('create_user')}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaPlus className="text-2xl text-blue-500 mx-auto mb-2" />
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Create User</p>
              </button>
              
              <button
                onClick={() => handleQuickAction('view_analytics')}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaChartLine className="text-2xl text-purple-500 mx-auto mb-2" />
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Analytics</p>
              </button>
              
              <button
                onClick={() => handleQuickAction('system_settings')}
                className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                  isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <FaCog className="text-2xl text-gray-500 mx-auto mb-2" />
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</p>
              </button>
            </div>
          </div>

          {/* Ad Analytics Section - Moved to dedicated panel below */}

          {/* Admin Management Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* User Management */}
            <Link
              to="/management"
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <FaUsers className="text-3xl text-blue-500 mr-4" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    User Management
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage users, roles, and subscriptions
                  </p>
                </div>
              </div>
            </Link>

            {/* Payment Management */}
            <Link
              to="/admin-payment-review"
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <FaMoneyBillWave className="text-3xl text-green-500 mr-4" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Payment Management
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Review and approve payment proofs
                  </p>
                </div>
              </div>
              {stats.pendingPayments > 0 && (
                <div className="mt-3 flex items-center justify-between">
                  <span className={'text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800'}>
                    {stats.pendingPayments} pending
                  </span>
                </div>
              )}
            </Link>

            {/* Content Management */}
            <Link
              to="/curated-lessons"
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <FaBook className="text-3xl text-purple-500 mr-4" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Content Management
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage curriculum and lesson library
                  </p>
                </div>
              </div>
            </Link>

            {/* Class Management */}
            <Link
              to="/classes"
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <FaChalkboardTeacher className="text-3xl text-indigo-500 mr-4" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Class Management
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage classes and teacher assignments
                  </p>
                </div>
              </div>
            </Link>

            {/* Parent Management */}
            <button
              onClick={() => setShowParentManagement(true)}
              className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md hover:scale-105 text-left ${
                isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-4">
                <FaUserCog className="text-3xl text-orange-500 mr-4" />
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Parent Management
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Manage parent registrations and approvals
                  </p>
                </div>
              </div>
            </button>
          </div>

          {/* Admin Information Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaBell className="mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {activity.message}
                      </p>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {activity.time}
                      </span>
                    </div>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      by {activity.user}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Payment Proofs */}
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <FaMoneyBillWave className="mr-2 text-yellow-500" />
                Pending Payment Approvals
              </h3>
              {pendingPaymentProofs.length > 0 ? (
                <div className="space-y-3">
                  {pendingPaymentProofs.map((proof, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-yellow-50 border-yellow-200'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Payment Proof #{index + 1}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Amount: R{proof.amount || '150.00'}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 rounded text-green-600 hover:bg-green-100">
                            <FaCheckCircle className="w-4 h-4" />
                          </button>
                          <button className="p-1 rounded text-red-600 hover:bg-red-100">
                            <FaTimesCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FaCheckCircle className={`text-4xl mx-auto mb-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No pending payment approvals
                  </p>
                </div>
              )}
            </div>
          </div>


          {/* System Status */}
          <div className={`mt-6 p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <FaDatabase className="mr-2 text-green-500" />
              System Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-800">API Server</span>
                </div>
                <span className="text-xs text-green-600">Operational</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-800">Database</span>
                </div>
                <span className="text-xs text-green-600">Operational</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center">
                  <FaCheckCircle className="text-green-500 mr-2" />
                  <span className="text-sm font-medium text-green-800">Storage</span>
                </div>
                <span className="text-xs text-green-600">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
