import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { FaUser, FaBook, FaBrain, FaBell, FaArrowRight, FaChevronDown, FaChevronUp, FaChartLine, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaGraduationCap } from 'react-icons/fa';
import Header from '../components/Header';
import { useTheme } from '../contexts/ThemeContext';
import { YoungEaglesMainDisplay } from '../components/ads';
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
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} px-2 xs:px-4`}>
      <Header />
      <div className="pt-8 pb-4">
        {/* Welcome Section */}
        <div className="max-w-7xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-4 mt-6">
          <div className="bg-gradient-to-r border-b-2 mb-5 border-blue-500 rounded-xl from-blue-500 to-purple-600 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
              <p className="text-blue-100 text-sm md:text-base">Track your child's learning progress and stay connected</p>
            </div>
          </div>
          
          {/* Ad/Ad Placeholder */}
          <YoungEaglesMainDisplay 
            className="mb-6"
            style={{ maxWidth: '100%' }}
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 w-full box-border">
              <div className={`p-4 rounded-xl shadow-lg text-center border-l-4 border-blue-500 ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-2xl font-bold text-blue-500">{stats.children}</div>
                <div className={`text-xs mt-1 font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children</div>
              </div>
              <div className={`p-4 rounded-xl shadow-lg text-center border-l-4 border-purple-500 ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-2xl font-bold text-purple-500">{stats.homework}</div>
                <div className={`text-xs mt-1 font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework Assigned</div>
              </div>
              <div className={`p-4 rounded-xl shadow-lg text-center border-l-4 border-green-500 ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-2xl font-bold text-green-500">{stats.submitted}</div>
                <div className={`text-xs mt-1 font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework Submitted</div>
              </div>
              <div className={`p-4 rounded-xl shadow-lg text-center border-l-4 ${stats.completionRate >= 80 ? 'border-green-500' : stats.completionRate >= 60 ? 'border-yellow-500' : 'border-orange-500'} ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className={`text-2xl font-bold ${stats.completionRate >= 80 ? 'text-green-500' : stats.completionRate >= 60 ? 'text-yellow-500' : 'text-orange-500'}`}>{stats.completionRate}%</div>
                <div className={`text-xs mt-1 font-medium uppercase ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</div>
              </div>
            </div>
          )}

          {/* Enhanced Stats Toggle */}
          {user?.role === 'parent' && (
            <div className="mb-6">
              <button
                onClick={() => setShowMoreStats(!showMoreStats)}
                className={`w-full p-4 rounded-xl shadow-lg flex items-center justify-between transition-all border-l-4 border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold flex items-center">
                  <FaChartLine className="mr-2" />
                  {showMoreStats ? 'Hide' : 'View'} Detailed Stats
                </span>
                {showMoreStats ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              {showMoreStats && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4 animate-in">
                  <div className={`p-4 rounded-xl shadow-lg border-l-4 border-red-500 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</div>
                        <div className="text-2xl font-bold text-red-500">{expandedStats.overdue}</div>
                      </div>
                      <FaExclamationTriangle className="text-red-500 text-xl" />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl shadow-lg border-l-4 border-green-500 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Graded</div>
                        <div className="text-2xl font-bold text-green-500">{expandedStats.graded}</div>
                      </div>
                      <FaCheckCircle className="text-green-500 text-xl" />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl shadow-lg border-l-4 border-blue-500 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</div>
                        <div className="text-2xl font-bold text-blue-500">{expandedStats.avgScore}%</div>
                      </div>
                      <FaChartLine className="text-blue-500 text-xl" />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl shadow-lg border-l-4 border-purple-500 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Weekly Progress</div>
                        <div className="text-2xl font-bold text-purple-500">{expandedStats.weeklyProgress}</div>
                      </div>
                      <FaArrowRight className="text-purple-500 text-xl" />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl shadow-lg border-l-4 ${
                    expandedStats.paymentStatus === 'paid' ? 'border-green-500' : 'border-yellow-500'
                  } ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Payment Status</div>
                        <div className={`text-lg font-bold ${
                          expandedStats.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                        }`}>
                          {expandedStats.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                      <FaCreditCard className={`text-xl ${
                        expandedStats.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'
                      }`} />
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl shadow-lg border-l-4 border-indigo-500 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI Usage</div>
                        <div className="text-2xl font-bold text-indigo-500">{expandedStats.aiUsage}</div>
                      </div>
                      <FaBrain className="text-indigo-500 text-xl" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Actions for Parents */}
          {user?.role === 'parent' && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6 w-full box-border">
              <Link to="/children" className={`p-4 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all hover:shadow-xl hover:scale-105 border-l-4 border-blue-500 group ${
                isDark 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}> 
                <FaUser className="text-3xl mb-2 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">My Children</span>
              </Link>
              <Link to="/homework" className={`p-4 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all hover:shadow-xl hover:scale-105 border-l-4 border-purple-500 group ${
                isDark 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}> 
                <FaBook className="text-3xl mb-2 text-purple-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Homework</span>
              </Link>
              <Link to="/activities" className={`p-4 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all hover:shadow-xl hover:scale-105 border-l-4 border-indigo-500 group ${
                isDark 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}> 
                <FaGraduationCap className="text-3xl mb-2 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Activities</span>
              </Link>
              <Link to="/notifications" className={`p-4 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all hover:shadow-xl hover:scale-105 border-l-4 border-green-500 group ${
                isDark 
                  ? 'bg-gray-800 text-white hover:bg-gray-700' 
                  : 'bg-white text-gray-800 hover:bg-gray-50'
              }`}> 
                <FaBell className="text-3xl mb-2 text-green-500 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-sm">Announcements</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 