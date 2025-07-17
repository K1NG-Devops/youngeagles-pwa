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
// Google AdSense Components
import { HeaderBannerAd, ContentRectangleAd, InFeedNativeAd, MobileBannerAd, ResponsiveAd } from '../components/AdSenseComponents';
import MobileAdDebugger from '../components/MobileAdDebugger';
// Fallback Ad Components
import { HeaderAd, ContentAd, NativeAd } from '../components/ads/AdComponents';

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
  const [isLoading, setIsLoading] = useState(true);
  const [showChildRegistration, setShowChildRegistration] = useState(false);
  
  // Ad frequency management - simplified for better display
  const { shouldShowAd, recordAdShown, canShowMoreAds } = useAdFrequency('dashboard');
  
  // Always show ads for better user experience
  const showAds = true;

  // Swipe gesture handlers
  const handleSwipe = (direction) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    switch (direction) {
    case 'left':
      // Navigate to activities page
      navigate('/activities');
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
          // For parents, get their children data
          try {
            const childrenResponse = await apiService.children.getByParent(user.id);
            const childrenData = childrenResponse.data.children || [];
            setChildren(childrenData);
            
            setStats({
              children: childrenData.length,
              classes: 0,
              homework: 0,
              pending: 0,
              submitted: 0,
              completionRate: 0
            });

            // Set expanded stats
            setExpandedStats({
              totalAssignments: 0,
              overdue: 0,
              graded: 0,
              avgScore: 0,
              weeklyProgress: 0,
              monthlyProgress: 0,
              paymentStatus: 'paid',
              aiUsage: 8,
              lastLogin: new Date()
            });
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
          
          setStats({
            children: childrenResponse.data.children?.length || 0,
            classes: classesResponse.data.classes?.length || 0,
            homework: 0,
            pending: 0,
            submitted: 0,
            completionRate: 0
          });
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
    <div ref={swipeRef} className={`min-h-screen mt-0 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} overflow-y-auto`} style={{
      WebkitOverflowScrolling: 'touch',
      overscrollBehavior: 'contain',
      scrollBehavior: 'smooth',
      touchAction: 'pan-y'
    }}>
      <Header />
      <NativeAppEnhancements />
      
      
      <main>
        <div className="mobile-container">
          {/* Mobile-First Ad Strategy - ads will hide themselves if empty */}
          <div className="block sm:hidden">
            <MobileBannerAd />
          </div>
          <div className="hidden sm:block">
            <ResponsiveAd placement="header" />
          </div>

          {/* Welcome Section - 320px Optimized */}
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 text-white rounded-2xl shadow-xl mobile-space-md overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-4 left-4 w-16 h-16 rounded-full bg-white/30"></div>
              <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-white/20"></div>
              <div className="absolute top-1/2 right-6 w-8 h-8 rounded-full bg-white/25"></div>
            </div>
            
            <div className="relative z-10 mobile-p-md">
              {/* Header Section - 320px Optimized */}
              <div className="text-center mobile-space-sm">
                <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center mx-auto mobile-space-xs shadow-lg">
                  <FaGraduationCap className="text-lg text-white" />
                </div>
                <h1 className="text-mobile-xl font-bold leading-tight text-white mobile-space-xs">
                  Welcome back, {user?.name?.split(' ')[0] || 'Student'}!
                </h1>
                <p className="text-white/90 text-mobile-sm opacity-90">
                  Track learning progress
                </p>
              </div>

              {/* Stats Preview - 320px Grid */}
              <div className="mobile-grid-2 mobile-space-sm">
                <div className="bg-white/25 rounded-lg mobile-p-sm text-center backdrop-blur-sm shadow-md border border-white/30">
                  <div className="flex items-center justify-center mobile-space-xs">
                    <FaUser className="text-sm mr-1 text-white" />
                    <div className="text-mobile-lg font-bold text-white">{stats.children}</div>
                  </div>
                  <div className="text-mobile-xs text-white/80 font-medium">Children</div>
                </div>
                <div className="bg-white/25 rounded-lg mobile-p-sm text-center backdrop-blur-sm shadow-md border border-white/30">
                  <div className="flex items-center justify-center mobile-space-xs">
                    <FaBell className="text-sm mr-1 text-white" />
                    <div className="text-mobile-lg font-bold text-white">{stats.classes}</div>
                  </div>
                  <div className="text-mobile-xs text-white/80 font-medium">Classes</div>
                </div>
              </div>
              
              {/* Quick Actions - 320px Optimized */}
              <div className="mobile-space-sm">
                <Link 
                  to="/children" 
                  className="mobile-card hover:bg-white/35 backdrop-blur-sm border border-white/30 mb-3 block transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaUser className="text-lg mr-3 text-white" />
                      <div>
                        <span className="font-semibold text-mobile-sm text-white block">Children</span>
                        <p className="text-mobile-xs text-white/80">Manage profiles</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-white/60" />
                  </div>
                </Link>
                
                <Link 
                  to="/activities" 
                  className="mobile-card hover:bg-white/35 backdrop-blur-sm border border-white/30 block transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.25)',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaBrain className="text-lg mr-3 text-white" />
                      <div>
                        <span className="font-semibold text-mobile-sm text-white block">Activities</span>
                        <p className="text-mobile-xs text-white/80">Learning games</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-white/60" />
                  </div>
                </Link>
              </div>
              
              {/* Register Child Button - 320px Optimized */}
              <div className="mobile-space-sm">
                <button
                  onClick={() => setShowChildRegistration(true)}
                  className="mobile-touch-target w-full hover:bg-white/30 backdrop-blur-sm rounded-xl border border-white/30 text-left transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaPlus className="text-lg mr-3 text-white" />
                      <div>
                        <span className="font-semibold text-mobile-sm text-white block">Register Child</span>
                        <p className="text-mobile-xs text-white/80">Add new child</p>
                      </div>
                    </div>
                    <FaArrowRight className="text-white/60" />
                  </div>
                </button>
              </div>
              
              {/* Progress Indicator - 320px Optimized */}
                            {/* Progress Indicator - 320px Optimized */}
              <div className="mobile-space-sm rounded-lg mobile-p-sm backdrop-blur-sm border border-white/30"
                   style={{
                     background: 'rgba(255, 255, 255, 0.25)',
                     color: 'white'
                   }}>
                <div className="flex items-center justify-between">
                  <span className="text-mobile-sm font-semibold text-white">Progress</span>
                  <span className="text-mobile-sm font-bold text-white">{stats.progress}%</span>
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

          {/* Content Ad - Google AdSense */}
          {userRole === 'parent' && (
            <div className="mb-6">
              <ResponsiveAd placement="content" />
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

          {/* Additional Content Ad for better monetization - Google AdSense */}
          <div className="mb-6">
            <ResponsiveAd placement="infeed" />
          </div>
          
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
      
      {/* Mobile Ad Debugger */}
      <MobileAdDebugger />
    </div>
  );
};

export default Dashboard; 