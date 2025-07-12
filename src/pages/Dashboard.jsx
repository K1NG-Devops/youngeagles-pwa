import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
// Remove excessive inline ads
// import InlineGoogleAd from '../components/ads/InlineGoogleAd';

import { FaUser, FaBook, FaBrain, FaBell, FaArrowRight, FaChevronDown, FaChevronUp, FaChartLine, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaGraduationCap } from 'react-icons/fa';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import LocalAdTester from '../components/ads/LocalAdTester';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    children: 0,
    classes: 0,
    homework: 0,
    pending: 0,
    submitted: 0,
    completionRate: 0
  });
  const [expandedStats, setExpandedStats] = useState({
    totalAssignments: 0,
    overdue: 0,
    graded: 0,
    avgScore: 0,
    weeklyProgress: 0,
    monthlyProgress: 0,
    paymentStatus: 'pending',
    aiUsage: 0,
    lastLogin: new Date()
  });
  const [showMoreStats, setShowMoreStats] = useState(false);
  const [, setChildren] = useState([]);
  const [, setHomeworkData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch different data based on user role
        if (user?.role === 'parent') {
          // For parents, get their children and homework data
          const childrenResponse = await apiService.children.getByParent(user.id);
          const childrenData = childrenResponse.data.children || [];
          setChildren(childrenData);
          
          // Fetch homework data for the parent
          try {
            const homeworkResponse = await apiService.homework.getByParent(user.id);
            const homework = homeworkResponse.data.homework || [];
            setHomeworkData(homework);
            
            // Calculate homework stats
            const totalHomework = homework.length;
            const submittedHomework = homework.filter(hw => hw.status === 'submitted' || hw.status === 'graded').length;
            const completionRate = totalHomework > 0 ? Math.round((submittedHomework / totalHomework) * 100) : 0;
            const graded = homework.filter(hw => hw.status === 'graded').length;
            const overdue = homework.filter(hw => hw.status === 'overdue').length;
            
            setStats({
              children: childrenData.length,
              classes: 0,
              homework: totalHomework,
              pending: totalHomework - submittedHomework,
              submitted: submittedHomework,
              completionRate
            });

            // Set expanded stats
            setExpandedStats({
              totalAssignments: totalHomework,
              overdue: overdue,
              graded: graded,
              avgScore: 85, // Mock data
              weeklyProgress: 12,
              monthlyProgress: 45,
              paymentStatus: 'paid',
              aiUsage: 8,
              lastLogin: new Date()
            });
          } catch {
            console.log('Homework API not available, using empty state');
            setStats({
              children: childrenData.length,
              classes: 0,
              homework: 0,
              pending: 0,
              submitted: 0,
              completionRate: 0
            });
          }
        } else {
          // For teachers/admin, get all children and classes
          const [childrenResponse, classesResponse] = await Promise.all([
            apiService.children.getAll(),
            apiService.classes.getAll()
          ]);
          
          // Try to fetch homework data for teachers
          try {
            const homeworkResponse = await apiService.homework.getByTeacher(user.id);
            const homework = homeworkResponse.data.homework || [];
            setHomeworkData(homework);
            
            setStats({
              children: childrenResponse.data.children?.length || 0,
              classes: classesResponse.data.classes?.length || 0,
              homework: homework.length,
              pending: homework.filter(hw => hw.status === 'assigned').length,
              submitted: 0,
              completionRate: 0
            });
          } catch {
            console.log('Homework API not available for teachers');
            setStats({
              children: childrenResponse.data.children?.length || 0,
              classes: classesResponse.data.classes?.length || 0,
              homework: 0,
              pending: 0,
              submitted: 0,
              completionRate: 0
            });
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Use empty stats when API is not available
        setStats({
          children: 0,
          classes: 0,
          homework: 0,
          pending: 0,
          submitted: 0,
          completionRate: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Route teachers to TeacherDashboard
  if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  }

  // Route admins to AdminDashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className={`min-h-screen mt-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="pt-0 pb-4 px-2 sm:px-3">
        <div className="w-full">
          {/* Top Banner Ad - Only at page start (30% chance) */}
          <LocalAdTester format="banner" className="mb-6" />

          {/* Welcome Section - Enhanced */}
          <div className="bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 text-white rounded-2xl shadow-xl mb-6 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/20"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white/10"></div>
              <div className="absolute top-1/2 right-8 w-12 h-12 rounded-full bg-white/15"></div>
            </div>
            
            <div className="relative z-10 p-6 sm:p-8">
              {/* Header Section */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                      <FaGraduationCap className="text-2xl text-white" />
                    </div>
                    <div>
                      <h1 className="text-lg sm:text-3xl font-bold mb-1">
                        Welcome back, {user?.name}!
                      </h1>
                      <p className="text-blue-100 text-sm sm:text-base opacity-90">
                        Track your child's learning progress and stay connected
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Stats Preview */}
                <div className="hidden sm:flex flex-col items-end space-y-2">
                  <div className="bg-white/20 rounded-lg px-3 py-2 text-center backdrop-blur-sm">
                    <div className="text-xl font-bold">{stats.children}</div>
                    <div className="text-xs text-blue-100">Children</div>
                  </div>
                  <div className="bg-white/20 rounded-lg px-3 py-2 text-center backdrop-blur-sm">
                    <div className="text-xl font-bold">{stats.pending}</div>
                    <div className="text-xs text-blue-100">Pending</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <Link 
                  to="/homework" 
                  className="group bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-center mb-2">
                    <FaBook className="text-lg mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm sm:text-base">Homework</span>
                  </div>
                  <p className="text-xs text-blue-100 opacity-80">View assignments</p>
                </Link>
                
                <Link 
                  to="/children" 
                  className="group bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <div className="flex items-center mb-2">
                    <FaUser className="text-lg mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm sm:text-base">My Children</span>
                  </div>
                  <p className="text-xs text-blue-100 opacity-80">Manage profiles</p>
                </Link>
                
                <Link 
                  to="/activities" 
                  className="group bg-white/15 hover:bg-white/25 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg col-span-2 sm:col-span-1"
                >
                  <div className="flex items-center mb-2">
                    <FaBrain className="text-lg mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-semibold text-sm sm:text-base">Activities</span>
                  </div>
                  <p className="text-xs text-blue-100 opacity-80">Learning games</p>
                </Link>
              </div>
              
              {/* Progress Indicator */}
              <div className="mt-6 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm font-bold">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats for Parents - Enhanced */}
          {user?.role === 'parent' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className={`p-6 rounded-lg shadow-md text-center border-l-4 border-blue-500 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-4xl font-bold text-blue-500 mb-2">{stats.children}</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children</div>
              </div>
              <div className={`p-6 rounded-lg shadow-md text-center border-l-4 border-purple-500 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-4xl font-bold text-purple-500 mb-2">{stats.homework}</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework</div>
              </div>
              <div className={`p-6 rounded-lg shadow-md text-center border-l-4 border-green-500 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-4xl font-bold text-green-500 mb-2">{stats.submitted}</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Submitted</div>
              </div>
              <div className={`p-6 rounded-lg shadow-md text-center border-l-4 transition-all duration-200 hover:shadow-lg ${stats.completionRate >= 80 ? 'border-green-500' : stats.completionRate >= 60 ? 'border-yellow-500' : 'border-orange-500'} ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className={`text-4xl font-bold mb-2 ${stats.completionRate >= 80 ? 'text-green-500' : stats.completionRate >= 60 ? 'text-yellow-500' : 'text-orange-500'}`}>{stats.completionRate}%</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Complete</div>
              </div>
            </div>
          )}

          {/* Sidebar Rectangle Ad - Only in desktop sidebar (30% chance) */}
          <div className="hidden lg:block mb-6">
            <LocalAdTester format="rectangle" className="max-w-sm mx-auto" />
          </div>

          {/* Native Ad - Only between major content sections (30% chance) */}
          <LocalAdTester format="native-article" className="my-8" />

          {/* Enhanced Stats Toggle */}
          {user?.role === 'parent' && (
            <div className="mb-6">
              <button
                onClick={() => setShowMoreStats(!showMoreStats)}
                className={`w-full p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-200 hover:shadow-xl border-l-4 border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold flex items-center text-lg">
                  <FaChartLine className="mr-3 text-indigo-500" />
                  {showMoreStats ? 'Hide' : 'View'} Detailed Stats
                </span>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {showMoreStats ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown className="text-indigo-500" />}
                </div>
              </button>
              
              {showMoreStats && (
                <div className="mt-6 grid grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Enhanced detailed stats with better spacing */}
                  <div className={`p-6 rounded-xl shadow-lg border-l-4 border-red-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</div>
                        <div className="text-3xl font-bold text-red-500">{expandedStats.overdue}</div>
                      </div>
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-500 text-xl" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Add more enhanced stats cards */}
                  <div className={`p-6 rounded-xl shadow-lg border-l-4 border-green-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Graded</div>
                        <div className="text-3xl font-bold text-green-500">{expandedStats.graded}</div>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-xl" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI Usage</div>
                        <div className="text-3xl font-bold text-indigo-500">{expandedStats.aiUsage}</div>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                        <FaBrain className="text-indigo-500 text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Actions for Parents - Enhanced */}
          {user?.role === 'parent' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <Link to="/children" className={`p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-blue-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaUser className="text-3xl text-blue-500" />
                  </div>
                  <span className="font-semibold text-lg">My Children</span>
                </Link>

                <Link to="/homework" className={`p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-purple-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaBook className="text-3xl text-purple-500" />
                  </div>
                  <span className="font-semibold text-lg">Homework</span>
                </Link>

                <Link to="/activities" className={`p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-orange-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaBrain className="text-3xl text-orange-500" />
                  </div>
                  <span className="font-semibold text-lg">Activities</span>
                </Link>

                <Link to="/notifications" className={`p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-green-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaBell className="text-3xl text-green-500" />
                  </div>
                  <span className="font-semibold text-lg">Updates</span>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Banner - Only at natural end point (30% chance) */}
          <LocalAdTester format="banner" className="mt-8" />
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 