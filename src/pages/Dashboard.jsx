import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useSwipeGestures } from '../hooks/useGestures';

import { FaUser, FaBook, FaBrain, FaBell, FaArrowRight, FaChevronDown, FaChevronUp, FaChartLine, FaCreditCard, FaCheckCircle, FaExclamationTriangle, FaGraduationCap, FaPlus } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import Header from '../components/Header';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import AdaptiveLoader from '../components/loading/AdaptiveLoader';
import NativeAppEnhancements from '../components/NativeAppEnhancements';
import ChildRegistration from '../components/ChildRegistration';
// Simplified Ad Components
import { HeaderAd, ContentAd, NativeAd } from '../components/ads/AdComponents';
// import AdDiagnostic from '../components/ads/AdDiagnostic';

import useAdFrequency from '../hooks/useAdFrequency';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const swipeRef = useRef(null);
  
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
  const [showChildRegistration, setShowChildRegistration] = useState(false);
  
  // Ad frequency management
  const { shouldShowAd, recordAdShown, canShowMoreAds } = useAdFrequency('dashboard');

  // Swipe gesture handlers
  const handleSwipe = (direction) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    switch (direction) {
    case 'left':
      // Navigate to homework page
      navigate('/homework');
      break;
    case 'right':
      // Navigate to activities page
      navigate('/activities');
      break;
    case 'up':
      // Expand stats view
      setShowMoreStats(true);
      break;
    case 'down':
      // Collapse stats or navigate to profile
      if (showMoreStats) {
        setShowMoreStats(false);
      } else {
        navigate('/profile');
      }
      break;
    }
  };

  // Hook up swipe gestures
  useSwipeGestures(swipeRef, handleSwipe);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch different data based on user role (handle both 'role' and 'userType' fields)
        const userRole = user?.role || user?.userType;
        if (userRole === 'parent') {
          // For parents, get their children and homework data
          try {
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
            } catch (hwError) {
              console.log('Homework API error:', hwError);
              // Set stats with children count but empty homework
              setStats({
                children: childrenData.length,
                classes: 0,
                homework: 0,
                pending: 0,
                submitted: 0,
                completionRate: 0
              });
            }
          } catch (childrenError) {
            console.error('Error fetching children:', childrenError);
            // If children API fails, set everything to defaults
            setStats({
              children: 0,
              classes: 0,
              homework: 0,
              pending: 0,
              submitted: 0,
              completionRate: 0
            });
            
            // Set default expanded stats
            setExpandedStats({
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
      <AdaptiveLoader 
        isLoading={true}
        loadingText="Loading your dashboard"
        showProgress={false}
        delay={100}
      />
    );
  }

  // Get user role (handle both 'role' and 'userType' fields)
  const userRole = user?.role || user?.userType;
  
  // Route teachers to TeacherDashboard
  if (userRole === 'teacher') {
    return <TeacherDashboard />;
  }

  // Route admins to AdminDashboard
  if (userRole === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div ref={swipeRef} className={`min-h-screen mt-0 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} touch-none`}>
      <Header />
      <NativeAppEnhancements />
      
      {/* Swipe Instructions - Mobile Only */}
      <div className="md:hidden bg-blue-100 dark:bg-blue-900/20 border-l-4 border-blue-500 p-3 mx-4 sm:mx-6 lg:mx-8 mb-4 rounded-r">
        <p className="text-xs text-blue-700 dark:text-blue-300">
          💡 Swipe: ← Homework | → Activities | ↑ More Stats | ↓ Profile
        </p>
      </div>
      
      <main className="pt-0 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Strategic Native Ad - Seamless integration */}
          <div className="mb-6">
            <NativeAd />
          </div>

          {/* Welcome Section - Enhanced Light Blue Gradient */}
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 text-white rounded-2xl shadow-xl mb-6 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/30"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white/20"></div>
              <div className="absolute top-1/2 right-8 w-12 h-12 rounded-full bg-white/25"></div>
            </div>
            
            <div className="relative z-10 p-4 sm:p-6">
              {/* Header Section - Graduation cap centered on top */}
              <div className="text-center mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <FaGraduationCap className="text-2xl sm:text-4xl text-white" />
                </div>
                <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-2 leading-tight text-white">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-white/90 text-xs sm:text-sm md:text-base opacity-90">
                  Track your child's learning progress
                </p>
              </div>

              {/* Stats Preview - Consistent styling with darker gradient */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/25 rounded-lg px-3 py-2 text-center backdrop-blur-sm shadow-md border border-white/30">
                  <div className="flex items-center justify-center mb-1">
                    <FaUser className="text-sm mr-1 text-white" />
                    <div className="text-xl sm:text-2xl font-bold text-white">{stats.children}</div>
                  </div>
                  <div className="text-xs text-white/80 font-medium">Children</div>
                </div>
                <div className="bg-white/25 rounded-lg px-3 py-2 text-center backdrop-blur-sm shadow-md border border-white/30">
                  <div className="flex items-center justify-center mb-1">
                    <FaBell className="text-sm mr-1 text-white" />
                    <div className="text-xl sm:text-2xl font-bold text-white">{stats.pending}</div>
                  </div>
                  <div className="text-xs text-white/80 font-medium">Pending</div>
                </div>
              </div>
              
              {/* Quick Actions Grid - Consistent White Styling */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Link 
                  to="/homework" 
                  className="group bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30"
                >
                  <div className="flex items-center mb-2">
                    <FaBook className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                    <span className="font-semibold text-sm sm:text-base text-white">Homework</span>
                  </div>
                  <p className="text-xs text-white/80">View assignments</p>
                </Link>
                
                <Link 
                  to="/children" 
                  className="group bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30"
                >
                  <div className="flex items-center mb-2">
                    <FaUser className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                    <span className="font-semibold text-sm sm:text-base text-white">Children</span>
                  </div>
                  <p className="text-xs text-white/80">Manage profiles</p>
                </Link>
                
                <Link 
                  to="/activities" 
                  className="group bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg col-span-2 sm:col-span-1 border border-white/30"
                >
                  <div className="flex items-center mb-2">
                    <FaBrain className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                    <span className="font-semibold text-sm sm:text-base text-white">Activities</span>
                  </div>
                  <p className="text-xs text-white/80">Learning games</p>
                </Link>
              </div>
              
              {/* Register Child Button - Prominent placement */}
              <div className="mt-4">
                <button
                  onClick={() => setShowChildRegistration(true)}
                  className="w-full group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <FaPlus className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                        <span className="font-semibold text-sm sm:text-base text-white">Register Child</span>
                      </div>
                      <p className="text-xs text-white/80">Add a new child to your account</p>
                    </div>
                    <FaArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
              
              {/* Progress Indicator - Enhanced White Styling */}
              <div className="mt-6 bg-white/25 rounded-lg p-3 backdrop-blur-sm border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-white">Overall Progress</span>
                  <span className="text-sm font-bold text-white">{stats.completionRate}%</span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-2 border border-white/20">
                  <div 
                    className="bg-gradient-to-r from-white to-white/90 h-2 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${stats.completionRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats for Parents - Enhanced with consistent spacing */}
          {userRole === 'parent' && (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className={`p-4 sm:p-6 rounded-lg shadow-md text-center border-l-4 border-blue-500 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-3xl sm:text-4xl font-bold text-blue-500 mb-2">{stats.children}</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children</div>
              </div>
              <div className={`p-4 sm:p-6 rounded-lg shadow-md text-center border-l-4 border-purple-500 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-3xl sm:text-4xl font-bold text-purple-500 mb-2">{stats.homework}</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Homework</div>
              </div>
              <div className={`p-4 sm:p-6 rounded-lg shadow-md text-center border-l-4 border-green-500 transition-all duration-200 hover:shadow-lg ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className="text-3xl sm:text-4xl font-bold text-green-500 mb-2">{stats.submitted}</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Submitted</div>
              </div>
              <div className={`p-4 sm:p-6 rounded-lg shadow-md text-center border-l-4 transition-all duration-200 hover:shadow-lg ${stats.completionRate >= 80 ? 'border-green-500' : stats.completionRate >= 60 ? 'border-yellow-500' : 'border-orange-500'} ${
                isDark 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-white text-gray-800'
              }`}> 
                <div className={`text-3xl sm:text-4xl font-bold mb-2 ${stats.completionRate >= 80 ? 'text-green-500' : stats.completionRate >= 60 ? 'text-yellow-500' : 'text-orange-500'}`}>{stats.completionRate}%</div>
                <div className={`text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Complete</div>
              </div>
            </div>
          )}

          {/* Content Ad - Native integration */}
          {userRole === 'parent' && stats.children > 0 && (
            <div className="mb-6">
              <ContentAd />
            </div>
          )}

          {/* Enhanced Stats Toggle */}
          {userRole === 'parent' && (
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
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Enhanced detailed stats with better spacing */}
                  <div className={`p-4 sm:p-6 rounded-xl shadow-lg border-l-4 border-red-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</div>
                        <div className="text-2xl sm:text-3xl font-bold text-red-500">{expandedStats.overdue}</div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                        <FaExclamationTriangle className="text-red-500 text-lg sm:text-xl" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Add more enhanced stats cards */}
                  <div className={`p-4 sm:p-6 rounded-xl shadow-lg border-l-4 border-green-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Graded</div>
                        <div className="text-2xl sm:text-3xl font-bold text-green-500">{expandedStats.graded}</div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
                        <FaCheckCircle className="text-green-500 text-lg sm:text-xl" />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`p-4 sm:p-6 rounded-xl shadow-lg border-l-4 border-indigo-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                    isDark 
                      ? 'bg-gray-800 text-white' 
                      : 'bg-white text-gray-800'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>AI Usage</div>
                        <div className="text-2xl sm:text-3xl font-bold text-indigo-500">{expandedStats.aiUsage}</div>
                      </div>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                        <FaBrain className="text-indigo-500 text-lg sm:text-xl" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick Actions for Parents - Enhanced with consistent spacing */}
          {userRole === 'parent' && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Link to="/children" className={`p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-blue-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaUser className="text-2xl sm:text-3xl text-blue-500" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-center">My Children</span>
                </Link>

                <Link to="/homework" className={`p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-purple-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaBook className="text-2xl sm:text-3xl text-purple-500" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-center">Homework</span>
                </Link>

                <Link to="/activities" className={`p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-orange-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaBrain className="text-2xl sm:text-3xl text-orange-500" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-center">Activities</span>
                </Link>

                <Link to="/notifications" className={`p-6 sm:p-8 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-green-500 group ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}> 
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FaBell className="text-2xl sm:text-3xl text-green-500" />
                  </div>
                  <span className="font-semibold text-base sm:text-lg text-center">Updates</span>
                </Link>
              </div>
            </div>
          )}

          {/* Bottom Banner Ad - Removed to reduce ad density */}
          
        </div>
      </main>
      
      {/* Child Registration Modal */}
      <ChildRegistration 
        isOpen={showChildRegistration}
        onClose={() => setShowChildRegistration(false)}
        onSuccess={() => {
          // Refresh dashboard data after successful registration
          window.location.reload();
        }}
      />
      
      {/* Development mode indicator - hidden in production and on mobile */}
      {import.meta.env.DEV && window.innerWidth > 768 && (
        <div className="hidden md:block fixed bottom-4 left-4 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300 opacity-50 hover:opacity-100 transition-opacity">
          Dev Mode
        </div>
      )}
    </div>
  );
};

export default Dashboard; 