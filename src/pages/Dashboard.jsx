import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';

import { FaUser, FaBook, FaBrain, FaBell, FaArrowRight, FaChevronDown, FaChevronUp, FaChartLine, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaGraduationCap } from 'react-icons/fa';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import SmartAdManager from '../components/ads/SmartAdManager';
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
    <div className={`min-h-screen ultra-smooth-scroll ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <main className="pt-2 sm:pt-4 pb-6 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r border-b-2 border-blue-500 rounded-xl from-blue-500 to-purple-600 text-white card-enhanced shadow-lg mt-2 sm:mt-4 mb-4">
            <div className="card-content">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mt-12 mb-2 p-4 leading-tight">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 text-sm md:text-base">Track your child's learning progress and stay connected</p>
            </div>
          </div>

          {/* Header Ad - Compact placement under welcome */}
          <SmartAdManager 
            position="header" 
            page="dashboard" 
            className="shadow-md rounded-lg overflow-hidden mb-3" 
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
            <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between gap-2 sm:gap-3 w-full mb-4">
              <div className={`card-content-compact rounded-xl shadow-lg text-center border-l-4 border-blue-500 card-enhanced touch-responsive smooth-animation hover-lift flex-1 min-w-0 sm:min-w-[140px] sm:max-w-[200px] ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-xl sm:text-2xl font-bold text-blue-500">{stats.children}</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children</div>
              </div>
              <div className={`card-content-compact rounded-xl shadow-lg text-center border-l-4 border-purple-500 card-enhanced touch-responsive smooth-animation hover-lift flex-1 min-w-0 sm:min-w-[140px] sm:max-w-[200px] ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-xl sm:text-2xl font-bold text-purple-500">{stats.homework}</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework Assigned</div>
              </div>
              <div className={`card-content-compact rounded-xl shadow-lg text-center border-l-4 border-green-500 card-enhanced touch-responsive smooth-animation hover-lift flex-1 min-w-0 sm:min-w-[140px] sm:max-w-[200px] ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-xl sm:text-2xl font-bold text-green-500">{stats.submitted}</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework Submitted</div>
              </div>
              <div className={`card-content-compact rounded-xl shadow-lg text-center border-l-4 card-enhanced touch-responsive smooth-animation hover-lift flex-1 min-w-0 sm:min-w-[140px] sm:max-w-[200px] ${stats.completionRate >= 80 ? 'border-green-500' : stats.completionRate >= 60 ? 'border-yellow-500' : 'border-orange-500'} ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className={`text-xl sm:text-2xl font-bold ${stats.completionRate >= 80 ? 'text-green-500' : stats.completionRate >= 60 ? 'text-yellow-500' : 'text-orange-500'}`}>{stats.completionRate}%</div>
                <div className={`text-xs mt-1 font-medium uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</div>
              </div>
            </div>
          )}



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
                <div className="mt-4 flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between gap-3 sm:gap-4 animate-in">
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-red-500 card-enhanced smooth-animation hover-lift ${
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
                  
                  <div className={`p-5 rounded-xl shadow-lg border-l-4 border-green-500 card-enhanced smooth-animation hover-lift ${
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
          
          {/* Content Ad - After detailed stats */}
          <SmartAdManager 
            position="content" 
            page="dashboard" 
            className="shadow-sm rounded-xl overflow-hidden mb-4" 
          />

          {/* Quick Actions for Parents */}
          {user?.role === 'parent' && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex items-center">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-3"></div>
                Quick Actions
              </h2>
              <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center sm:justify-between gap-3 sm:gap-4 w-full">
                <Link to="/children" className={`p-5 sm:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center card-enhanced smooth-animation hover-lift border-l-4 border-blue-500 group touch-responsive ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 smooth-animation">
                    <FaUser className="text-xl sm:text-2xl text-blue-500" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">My Children</span>
                </Link>
                <Link to="/homework" className={`p-5 sm:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center card-enhanced smooth-animation hover-lift border-l-4 border-purple-500 group touch-responsive ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 smooth-animation">
                    <FaBook className="text-xl sm:text-2xl text-purple-500" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">Homework</span>
                </Link>
                <Link to="/activities" className={`p-5 sm:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center card-enhanced smooth-animation hover-lift border-l-4 border-indigo-500 group touch-responsive ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 smooth-animation">
                    <FaGraduationCap className="text-xl sm:text-2xl text-indigo-500" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">Activities</span>
                </Link>
                <Link to="/notifications" className={`p-5 sm:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center card-enhanced smooth-animation hover-lift border-l-4 border-green-500 group touch-responsive ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 smooth-animation">
                    <FaBell className="text-xl sm:text-2xl text-green-500" />
                  </div>
                  <span className="font-semibold text-sm sm:text-base">Announcements</span>
                </Link>
              </div>
            </div>
          )}
          
          {/* Footer Ad - End of dashboard */}
          <SmartAdManager 
            position="footer" 
            page="dashboard" 
            className="shadow-sm rounded-xl overflow-hidden mt-6" 
          />

        </div>
      </main>
    </div>
  );
};

export default Dashboard; 