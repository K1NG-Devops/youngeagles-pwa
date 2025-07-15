import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import { useSwipeGestures } from '../hooks/useGestures';

import { 
  FaUser, 
  FaBook, 
  FaBrain, 
  FaBell, 
  FaArrowRight, 
  FaChevronDown, 
  FaChevronUp, 
  FaChartLine, 
  FaCreditCard, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaGraduationCap, 
  FaPlus, 
  FaSync, 
  FaCalendarAlt, 
  FaUpload 
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import TeacherDashboard from './TeacherDashboard';
import AdminDashboard from './AdminDashboard';
import AdaptiveLoader from '../components/loading/AdaptiveLoader';
import NativeAppEnhancements from '../components/NativeAppEnhancements';
import ChildRegistration from '../components/ChildRegistration';
import PullToRefresh from '../components/PullToRefresh';
// Simplified Ad Components
import { HeaderAd, ContentAd, NativeAd } from '../components/ads/AdComponents';
import useAdFrequency from '../hooks/useAdFrequency';
import adConfig from '../utils/adConfig';

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { navigationStyle, NAVIGATION_STYLES } = useNavigation();
  const { showAds } = useSubscription();
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
  const [children, setChildren] = useState([]);
  const [homeworkData, setHomeworkData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showChildRegistration, setShowChildRegistration] = useState(false);
  
  // Ad frequency management
  const { shouldShowAd, recordAdShown, canShowMoreAds } = useAdFrequency('dashboard');
  
  // Mobile-first responsive design helpers
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isTablet = typeof window !== 'undefined' && window.innerWidth >= 768 && window.innerWidth < 1024;
  
  // Get proper spacing based on navigation style
  const getContainerClasses = () => {
    let classes = `${isDark ? 'bg-gray-900' : 'bg-gray-50'}`;
    return classes;
  };
  
  // Main content classes with proper spacing
  const getMainClasses = () => {
    let classes = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
    
    // Adjust spacing for different screen sizes
    if (isMobile) {
      classes += ' space-y-4';
    } else if (isTablet) {
      classes += ' space-y-6';
    } else {
      classes += ' space-y-8';
    }
    
    return classes;
  };

  // Swipe gesture handlers
  const handleSwipe = (direction) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }

    switch (direction) {
      case 'left':
        navigate('/homework');
        break;
      case 'right':
        navigate('/activities');
        break;
      case 'up':
        setShowMoreStats(true);
        break;
      case 'down':
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

  // Refresh data function for pull-to-refresh
  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  // Main fetch logic for Dashboard
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch different data based on user role
      const userRole = user?.role || user?.userType;
      const childrenData = await getChildrenData(user.id, userRole);
      const homeworkData = await getHomeworkData(user.id, userRole);

      // Set children data
      setChildren(childrenData);
      setHomeworkData(homeworkData);

      // Update main statistics
      const totalHomework = homeworkData.length;
      const submittedHomework = homeworkData.filter(hw => hw.status === 'submitted' || hw.status === 'graded').length;
      const completionRate = totalHomework > 0 ? Math.round((submittedHomework / totalHomework) * 100) : 0;
      const graded = homeworkData.filter(hw => hw.status === 'graded').length;
      const overdue = homeworkData.filter(hw => hw.status === 'overdue').length;

      setStats({
        children: childrenData.length,
        classes: 0,
        homework: totalHomework,
        pending: totalHomework - submittedHomework,
        submitted: submittedHomework,
        completionRate
      });

      // Set expanded stats data
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
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      resetStats();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch children data based on user role
  const getChildrenData = async (userId, userRole) => {
    try {
      if (userRole === 'parent') {
        const { data } = await apiService.children.getByParent(userId);
        return data.children || [];
      }

      const { data } = await apiService.children.getAll();
      return data.children || [];
    } catch (error) {
      console.error('Failed to fetch children data:', error);
      return [];
    }
  };

  // Fetch homework data based on user role
  const getHomeworkData = async (userId, userRole) => {
    try {
      if (userRole === 'parent') {
        const { data } = await apiService.homework.getByParent(userId);
        return data.homework || [];
      }

      const { data } = await apiService.homework.getByTeacher(userId);
      return data.homework || [];
    } catch (error) {
      console.error('Failed to fetch homework data:', error);
      return [];
    }
  };

  // Reset statistics
  const resetStats = () => {
    setStats({
      children: 0,
      classes: 0,
      homework: 0,
      pending: 0,
      submitted: 0,
      completionRate: 0
    });

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
  };

  useEffect(() => {
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

  // Get user role
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
    <PullToRefresh onRefresh={refreshData}>
      <div ref={swipeRef} className={getContainerClasses()}>
        <NativeAppEnhancements />
        
        <div className={getMainClasses()}>
          {/* Banner Ad - Top placement */}
          {adConfig.isEnabled() && shouldShowAd && canShowMoreAds && (
            <div className="mb-6">
              <HeaderAd />
            </div>
          )}

          {/* Welcome Section - Clean compact design */}
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 text-white rounded-2xl shadow-xl mb-6 overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-15">
              <div className="absolute top-4 left-4 w-20 h-20 rounded-full bg-white/30"></div>
              <div className="absolute bottom-4 right-4 w-16 h-16 rounded-full bg-white/20"></div>
              <div className="absolute top-1/2 right-8 w-12 h-12 rounded-full bg-white/25"></div>
            </div>
            
            <div className="relative z-10 p-4 sm:p-6">
              {/* Header Section - Compact */}
              <div className="text-center mb-4">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/30 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <FaGraduationCap className="text-xl sm:text-2xl text-white" />
                </div>
                <h1 className="text-lg sm:text-xl font-bold mb-1 leading-tight text-white">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-white/90 text-xs sm:text-sm opacity-90">
                  Track your child's learning progress
                </p>
              </div>

              {/* Stats Preview - Compact grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/25 rounded-lg px-3 py-3 text-center backdrop-blur-sm shadow-md border border-white/30">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.children}</div>
                    <div className="text-xs text-white/80 font-medium">Children</div>
                  </div>
                </div>
                <div className="bg-white/25 rounded-lg px-3 py-3 text-center backdrop-blur-sm shadow-md border border-white/30">
                  <div className="flex flex-col items-center">
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stats.pending}</div>
                    <div className="text-xs text-white/80 font-medium">Pending</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Grid - Compact */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Link 
                  to="/homework" 
                  className="group bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30"
                >
                  <div className="flex items-center">
                    <FaBook className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                    <div>
                      <div className="font-semibold text-sm text-white">Homework</div>
                      <div className="text-xs text-white/80">View assignments</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  to="/children" 
                  className="group bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30"
                >
                  <div className="flex items-center">
                    <FaUser className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                    <div>
                      <div className="font-semibold text-sm text-white">Children</div>
                      <div className="text-xs text-white/80">Manage profiles</div>
                    </div>
                  </div>
                </Link>
                
                <Link 
                  to="/activities" 
                  className="group bg-white/25 hover:bg-white/35 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30 sm:col-span-3 lg:col-span-1"
                >
                  <div className="flex items-center">
                    <FaBrain className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                    <div>
                      <div className="font-semibold text-sm text-white">Activities</div>
                      <div className="text-xs text-white/80">Learning games</div>
                    </div>
                  </div>
                </Link>
              </div>
              
              {/* Register Child Button - Compact */}
              <div className="mt-4">
                <button
                  onClick={() => setShowChildRegistration(true)}
                  className="w-full group bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg p-3 transition-all duration-300 hover:scale-105 hover:shadow-lg border border-white/30 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FaPlus className="text-lg mr-2 group-hover:scale-110 transition-transform text-white" />
                      <div>
                        <div className="font-semibold text-sm text-white">Register Child</div>
                        <div className="text-xs text-white/80">Add a new child to your account</div>
                      </div>
                    </div>
                    <FaArrowRight className="text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
              
              {/* Progress Indicator - Compact */}
              <div className="mt-4 bg-white/25 rounded-lg p-3 backdrop-blur-sm border border-white/30">
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
          
          {/* Quick Stats for Parents - Mobile-first grid */}
          {userRole === 'parent' && (
            <div className="grid grid-cols-2 gap-4 mb-6">
              {[
                { label: 'Children', value: stats.children, color: 'blue', icon: FaUser },
                { label: 'Homework', value: stats.homework, color: 'purple', icon: FaBook },
                { label: 'Submitted', value: stats.submitted, color: 'green', icon: FaCheckCircle },
                { label: 'Complete', value: `${stats.completionRate}%`, color: stats.completionRate >= 80 ? 'green' : stats.completionRate >= 60 ? 'yellow' : 'orange', icon: FaChartLine }
              ].map((stat, index) => (
                <div key={index} className={`p-4 rounded-lg shadow-md text-center border-l-4 border-${stat.color}-500 transition-all duration-200 hover:shadow-lg ${
                  isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                }`}>
                  <div className="flex items-center justify-center mb-2">
                    <stat.icon className={`text-lg mr-2 text-${stat.color}-500`} />
                    <div className={`text-2xl sm:text-3xl font-bold text-${stat.color}-500`}>{stat.value}</div>
                  </div>
                  <div className={`text-xs sm:text-sm font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Native Ad - Integrated between content */}
          {adConfig.isEnabled() && userRole === 'parent' && stats.children > 0 && shouldShowAd && canShowMoreAds && (
            <div className="mb-6">
              <NativeAd />
            </div>
          )}

          {/* Enhanced Stats Toggle */}
          {userRole === 'parent' && (
            <div className="mb-6">
              <button
                onClick={() => setShowMoreStats(!showMoreStats)}
                className={`w-full p-4 sm:p-6 rounded-xl shadow-lg flex items-center justify-between transition-all duration-200 hover:shadow-xl border-l-4 border-indigo-500 ${
                  isDark 
                    ? 'bg-gray-800 text-white hover:bg-gray-700' 
                    : 'bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold flex items-center text-base sm:text-lg">
                  <FaChartLine className="mr-3 text-indigo-500" />
                  {showMoreStats ? 'Hide' : 'View'} Detailed Stats
                </span>
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {showMoreStats ? <FaChevronUp className="text-indigo-500" /> : <FaChevronDown className="text-indigo-500" />}
                </div>
              </button>
              
              {showMoreStats && (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Overdue', value: expandedStats.overdue, color: 'red', icon: FaExclamationTriangle },
                    { label: 'Graded', value: expandedStats.graded, color: 'green', icon: FaCheckCircle },
                    { label: 'AI Usage', value: expandedStats.aiUsage, color: 'indigo', icon: FaBrain }
                  ].map((stat, index) => (
                    <div key={index} className={`p-4 rounded-xl shadow-lg border-l-4 border-${stat.color}-500 transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                      isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</div>
                          <div className={`text-2xl sm:text-3xl font-bold text-${stat.color}-500`}>{stat.value}</div>
                        </div>
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-2xl flex items-center justify-center`}>
                          <stat.icon className={`text-${stat.color}-500 text-lg sm:text-xl`} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Quick Actions for Parents - Mobile-first grid */}
          {userRole === 'parent' && (
            <div className="mb-6">
              <h2 className={`text-xl font-semibold mb-6 flex items-center ${isDark ? 'text-white' : 'text-gray-900'}`}>
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full mr-4"></div>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { path: '/children', icon: FaUser, label: 'My Children', color: 'blue' },
                  { path: '/homework', icon: FaBook, label: 'Homework', color: 'purple' },
                  { path: '/activities', icon: FaBrain, label: 'Activities', color: 'orange' },
                  { path: '/notifications', icon: FaBell, label: 'Updates', color: 'green' }
                ].map((action, index) => (
                  <Link 
                    key={index}
                    to={action.path} 
                    className={`p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 hover:shadow-xl hover:scale-105 border-l-4 border-${action.color}-500 group ${
                      isDark ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-${action.color}-100 dark:bg-${action.color}-900/30 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className={`text-xl sm:text-2xl text-${action.color}-500`} />
                    </div>
                    <span className="font-semibold text-sm sm:text-base text-center">{action.label}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Banner Ad - Clean placement */}
          {adConfig.isEnabled() && shouldShowAd && canShowMoreAds && (
            <div className="mt-6">
              <ContentAd />
            </div>
          )}

        </div>
        
        {/* Child Registration Modal */}
        <ChildRegistration 
          isOpen={showChildRegistration}
          onClose={() => setShowChildRegistration(false)}
          onSuccess={() => {
            setShowChildRegistration(false);
            refreshData();
          }}
        />
      </div>
    </PullToRefresh>
  );
};

export default Dashboard;
