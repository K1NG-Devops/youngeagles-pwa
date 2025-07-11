import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import InlineGoogleAd from '../components/ads/InlineGoogleAd';

import { FaUser, FaBook, FaBrain, FaBell, FaArrowRight, FaChevronDown, FaChevronUp, FaChartLine, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaGraduationCap } from 'react-icons/fa';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';

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
      <main className="pt-0 pb-20 px-2 sm:px-3">
        <div className="w-full">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg mb-4 p-6">
            <h1 className="text-2xl font-bold mb-1">Welcome back, {user?.name}!</h1>
            <p className="text-blue-100 text-sm">Track your child's learning progress and stay connected</p>
          </div>

          {/* Inline Ad - Direct placement without container */}
          <InlineGoogleAd 
            adSlot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
            adFormat="horizontal"
            style={{ 
              width: '100%', 
              height: '90px',
              marginBottom: '1.5rem'
            }}
          />
          
          {/* Quick Stats for Parents - Color Scheme:
               Blue: Information/General stats
               Purple: Academic/Homework related  
               Green: Completed/Success/Positive metrics
               Yellow/Orange: Pending/In Progress
               Red: Urgent/Overdue/Issues
               Indigo: AI/Advanced features
          */}
          {user?.role === 'parent' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className={`p-4 rounded-lg shadow-md text-center border-l-4 border-blue-500 transition-all duration-200 active:scale-95 ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-3xl font-bold text-blue-500">{stats.children}</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children</div>
              </div>
              <div className={`p-4 rounded-lg shadow-md text-center border-l-4 border-purple-500 transition-all duration-200 active:scale-95 ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-3xl font-bold text-purple-500">{stats.homework}</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework</div>
              </div>
              <div className={`p-4 rounded-lg shadow-md text-center border-l-4 border-green-500 transition-all duration-200 active:scale-95 ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-3xl font-bold text-green-500">{stats.submitted}</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Submitted</div>
              </div>
              <div className={`p-4 rounded-lg shadow-md text-center border-l-4 transition-all duration-200 active:scale-95 ${stats.completionRate >= 80 ? 'border-green-500' : stats.completionRate >= 60 ? 'border-yellow-500' : 'border-orange-500'} ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className={`text-3xl font-bold ${stats.completionRate >= 80 ? 'text-green-500' : stats.completionRate >= 60 ? 'text-yellow-500' : 'text-orange-500'}`}>{stats.completionRate}%</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Complete</div>
              </div>
            </div>
          )}

          {/* Inline Rectangle Ad between stats */}
          <InlineGoogleAd 
            adSlot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE}
            adFormat="rectangle"
            className="mx-auto my-6"
            style={{ 
              maxWidth: '336px',
              height: '280px'
            }}
          />

          {/* Enhanced Stats Toggle */}
          {user?.role === 'parent' && (
            <div className="mb-4">
              <button
                onClick={() => setShowMoreStats(!showMoreStats)}
                className={`w-full p-4 sm:p-5 rounded-xl shadow-lg flex items-center justify-between smooth-animation hover-lift border-l-4 border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold flex items-center">
                  <FaChartLine className="mr-3 text-indigo-500" />
                  {showMoreStats ? 'Hide' : 'View'} Detailed Stats
                </span>
                <div className={`p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {showMoreStats ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown className="text-indigo-500" />}
                </div>
              </button>
              
              {showMoreStats && (
                <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-red-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</div>
                        <div className="text-xl sm:text-2xl font-bold text-red-500">{expandedStats.overdue}</div>
                      </div>
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-500 text-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-green-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Graded</div>
                        <div className="text-xl sm:text-2xl font-bold text-green-500">{expandedStats.graded}</div>
                      </div>
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-blue-500 card-enhanced smooth-animation hover-lift ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-500">{expandedStats.avgScore}%</div>
                      </div>
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                        <FaChartLine className="text-blue-500 text-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-purple-500 card-enhanced smooth-animation hover-lift ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Weekly Progress</div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-500">{expandedStats.weeklyProgress}</div>
                      </div>
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center">
                        <FaArrowRight className="text-purple-500 text-lg" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 card-enhanced smooth-animation hover-lift ${
                    expandedStats.paymentStatus === 'paid' ? 'border-green-500' : 'border-yellow-500'
                  } ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment Status</div>
                        <div className={`text-lg sm:text-xl font-bold ${
                          expandedStats.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {expandedStats.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        expandedStats.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'
                      }`}>
                        <FaCreditCard className={`text-lg ${
                          expandedStats.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                        }`} />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-indigo-500 card-enhanced smooth-animation hover-lift ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI Usage</div>
                        <div className="text-xl sm:text-2xl font-bold text-indigo-500">{expandedStats.aiUsage}</div>
                      </div>
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                        <FaBrain className="text-indigo-500 text-lg" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Actions for Parents */}
          {user?.role === 'parent' && (
            <div className="mb-4">
              {/* Quick Actions Native Ad - Place after actions */}
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/children" className={`p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-blue-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaUser className="text-2xl text-blue-500" />
                  </div>
                  <span className="font-semibold text-base">My Children</span>
                </Link>
                <Link to="/homework" className={`p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-purple-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaBook className="text-2xl text-purple-500" />
                  </div>
                  <span className="font-semibold text-base">Homework</span>
                </Link>
                <Link to="/activities" className={`p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-indigo-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaGraduationCap className="text-2xl text-indigo-500" />
                  </div>
                  <span className="font-semibold text-base">Activities</span>
                </Link>
                <Link to="/notifications" className={`p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-green-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FaBell className="text-2xl text-green-500" />
                  </div>
                <span className="font-semibold text-base">Announcements</span>
              </Link>
            </div>
            
            {/* Inline Native Ad - Blends with content */}
            <InlineGoogleAd 
              adSlot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE}
              adFormat="fluid"
              style={{ marginTop: '1.5rem' }}
              data-ad-layout-key="-fb+5w+4e-db+86"
            />
          </div>
          )}
          
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 