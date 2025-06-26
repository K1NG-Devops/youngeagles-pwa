import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { FaHome, FaBook, FaBell, FaUser, FaChalkboardTeacher, FaExternalLinkAlt, FaCog, FaGlobe, FaComments } from 'react-icons/fa'
import useAuth from '../hooks/useAuth'
import usePWA from '../hooks/usePWA'
import { showNotification } from '../utils/notifications'
import { useTheme } from '../hooks/useTheme'
import useWebSocket from '../hooks/useWebSocket'

// Import dashboard components
import PWAParentDashboard from './PWA/PWAParentDashboard'
import PWATeacherDashboard from './PWA/PWATeacherDashboard'
import PWAAdminDashboard from './PWA/PWAAdminDashboard'
import SubmitWork from '../pages/SubmitWork'
import HomeworkList from '../pages/HomeworkList'
import Notifications from '../pages/Notifications'
import Login from './Login'
import Register from './Register'
import PasswordReset from './PasswordReset'
import TeacherLogin from './TeacherLogin'
import AuthTest from './AuthTest'
import WhatsAppMessaging from './MessagingSystem/WhatsAppMessaging'
import TopNotificationManager from './TopNotificationManager'
import PrivateRoutePWA from './PWA/PrivateRoutePWA'
import AdminLogin from './AdminLogin'
import Registration2026 from '../pages/Registration2026'
import ContactUs from '../pages/ContactUs'
import AdminTeachers from './PWA/AdminTeachers'
import AdminUserManagement from './PWA/AdminUserManagement'
import ChildManagement from './PWA/ChildManagement'
import AssignmentCreate from './PWA/AssignmentCreate'
import AssignmentManagement from './PWA/AssignmentManagement'
import TeacherStudentList from './PWA/TeacherStudentList'
import TeacherReports from './PWA/TeacherReports'
import ActivityBuilder from './PWA/ActivityBuilder'
import AppSettings from './PWA/AppSettings'
import UserDropdown from './UserDropdown'

const PWALayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, user, role, isAuthenticated, logout, verifyAuth } = useAuth()
  const { isOnline } = usePWA()
  const { isDark, toggleTheme } = useTheme()
  const { isConnected, sendMessage, lastMessage } = useWebSocket()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isInitialized, setIsInitialized] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const navigationAttempted = useRef(false)

  // Verify auth token on initial load
  useEffect(() => {
    const checkAuth = async () => {
      if (isAuthenticated) {
        await verifyAuth();
      }
      setIsVerifying(false);
    };
    checkAuth();
  }, [verifyAuth, isAuthenticated]);

  // Helper functions to improve code readability
  const isPublicRoute = (path) => {
    return path.includes('login') || 
           path.includes('register') || 
           path.includes('password-reset') ||
           path.includes('auth-test') ||
           path === '/contact-us' ||
           path === '/register-2026';
  }

  const getDashboardPath = (userRole) => {
    if (userRole === 'teacher') return '/teacher-dashboard';
    if (userRole === 'admin') return '/admin-dashboard';
    return '/dashboard'; // Default for parents/students
  }

  // Reset navigation lock when auth state changes
  useEffect(() => {
    navigationAttempted.current = false;
  }, [isAuthenticated, auth]);

  // Single consolidated navigation effect
  useEffect(() => {
    // Wait until verification is complete
    if (isVerifying) {
      console.log('⏳ Verification in progress, navigation paused...');
      return;
    }

    const currentPath = location.pathname;
    const isPublic =
      currentPath.includes('login') || currentPath.includes('register');

    console.log(`🧭 Nav Check: Path=${currentPath}, Auth=${isAuthenticated}, Public=${isPublic}, Init=${isInitialized}`);

    // If auth state is not yet determined, wait.
    if (auth === undefined) {
      console.log('⏳ Auth state is undefined, waiting...');
      return;
    }

    // Mark as initialized once auth state is available
    if (!isInitialized) {
      setIsInitialized(true);
    }
    
    // Prevent redirect loops for path-based navigation only
    // Don't block navigation after auth state changes
    if (navigationAttempted.current && location.pathname === currentPath) {
        console.log('↩️ Navigation already attempted for this path, skipping.');
        return;
    }

    if (isAuthenticated && isPublic) {
      // Only redirect if we're on a login page after being authenticated
      // and no navigation is already in progress
      if (!navigationAttempted.current) {
        const dashboardPath =
          role === 'teacher'
            ? '/teacher-dashboard'
            : role === 'admin'
            ? '/admin-dashboard'
            : '/dashboard';
        console.log(`🚀 Auto-redirecting authenticated user from ${currentPath} to ${dashboardPath}`);
        navigationAttempted.current = true;
        navigate(dashboardPath, { replace: true });
      }
    } else if (!isAuthenticated && !isPublic) {
      console.log('🚪 Redirecting unauthenticated user to /login');
      navigationAttempted.current = true;
      navigate('/login', { replace: true });
    }
  }, [location.pathname, isAuthenticated, auth, role, navigate, isInitialized, isVerifying]);
  
  // Reset navigation lock on successful path change
  useEffect(() => {
    const timer = setTimeout(() => {
      navigationAttempted.current = false;
    }, 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Sync active tab with current route
  useEffect(() => {
    if (!isInitialized) return;
    
    const path = location.pathname;
    if (path.includes('/homework')) {
      setActiveTab('homework');
    } else if (path.includes('/messages')) {
      setActiveTab('messages');
    } else if (path.includes('/notifications')) {
      setActiveTab('notifications');
    } else if (path.includes('/dashboard')) {
      setActiveTab('dashboard');
    }
  }, [location.pathname, isInitialized]);

  const handleLogout = async () => {
    try {
      await logout();
      setActiveTab('dashboard');
      navigate('/login');
      showNotification('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showNotification('Error during logout', 'error');
    }
  };

  const handleOpenWebsite = async () => {
    const mainWebsiteUrl = import.meta.env.DEV 
      ? (import.meta.env.VITE_MAIN_WEBSITE_DEV_URL || 'http://localhost:5173')
      : (import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://youngeagles.org.za');
    
    window.open(mainWebsiteUrl, '_blank');
    showNotification('Opening main website in browser...', 'info');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const userRole = role;
    const isTeacher = userRole === 'teacher';
    const isAdmin = userRole === 'admin';
    
    if (!isInitialized || !user) return [];

    if (isTeacher) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/teacher-dashboard' },
        { id: 'homework', label: 'Homework', icon: FaBook, path: '/teacher/homework-list' },
        { id: 'messages', label: 'Messages', icon: FaComments, path: '/messages' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/notifications' }
      ];
    } else if (isAdmin) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/admin-dashboard' },
        { id: 'messages', label: 'Messages', icon: FaComments, path: '/messages' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/notifications' }
      ];
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/dashboard' },
        { id: 'homework', label: 'Homework', icon: FaBook, path: '/student/homework' },
        { id: 'messages', label: 'Messages', icon: FaComments, path: '/messages' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/notifications' }
      ];
    }
  };

  const navigationItems = getNavigationItems();

  if (isVerifying || !isInitialized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  // Show settings if requested
  if (showSettings) {
    return (
      <AppSettings
        isDark={isDark}
        onThemeChange={toggleTheme}
        onClose={() => setShowSettings(false)}
      />
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex flex-col transition-colors duration-200`}>
      <TopNotificationManager />
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-gray-800' : 'bg-blue-600'} text-white px-3 py-2 shadow-lg transition-colors duration-200`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden shadow-lg border border-white/20">
              <img 
                src="/icon-48x48.png" 
                alt="Young Eagles Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <h1 className="text-sm sm:text-lg font-bold">Young Eagles</h1>
              <span className={`hidden sm:inline text-xs px-1.5 py-0.5 rounded-full ${isDark ? 'bg-gray-700' : 'bg-blue-500'} transition-colors duration-200`}>PWA</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={handleOpenWebsite}
              className={`p-2 rounded-lg transition-colors duration-200 hidden sm:block ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-500'}`}
              title="Open full website"
            >
              <FaExternalLinkAlt className="text-sm" />
            </button>
            
            <UserDropdown
              user={user}
              onLogout={handleLogout}
              onSettings={() => setShowSettings(true)}
              onOpenWebsite={handleOpenWebsite}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pt-16 pb-16">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/password-reset" element={<PasswordReset />} />
          <Route path="/teacher/login" element={<TeacherLogin />} />
          <Route path="/teacher-login" element={<TeacherLogin />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/auth-test" element={<AuthTest />} />
          
          <Route element={<PrivateRoutePWA />}>
            <Route path="/dashboard" element={<PWAParentDashboard />} />
            <Route path="/student/homework" element={<HomeworkList />} />
            <Route path="/submit-work" element={<SubmitWork />} />
            <Route path="/messages" element={<WhatsAppMessaging />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/manage-children" element={<ChildManagement />} />
            <Route path="/teacher-dashboard" element={<PWATeacherDashboard />} />
            <Route path="/teacher/homework-list" element={<HomeworkList />} />
            <Route path="/teacher/assignments" element={<AssignmentManagement />} />
            <Route path="/teacher/assignments/create" element={<AssignmentCreate />} />
            <Route path="/teacher-children-list" element={<TeacherStudentList />} />
            <Route path="/teacher-reports" element={<TeacherReports />} />
            <Route path="/teacher-dashboard/activity-builder" element={<ActivityBuilder />} />
            <Route path="/admin-dashboard" element={<PWAAdminDashboard />} />
            <Route path="/admin-teachers" element={<AdminTeachers />} />
            <Route path="/admin-users" element={<AdminUserManagement />} />
            <Route path="/admin-reports" element={<AdminTeachers />} />
            <Route path="/admin-settings" element={<AdminTeachers />} />
          </Route>

          <Route path="/register-2026" element={<Registration2026 />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      {user && navigationItems.length > 0 && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t shadow-lg transition-colors duration-200 z-50 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-around items-center h-16 px-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(item.path);
                  }}
                  className={`flex flex-col items-center justify-center flex-1 py-2 px-1 rounded-lg transition-colors duration-200 min-h-[48px] ${
                    isActive 
                      ? isDark
                        ? 'text-blue-400 bg-blue-900/50'
                        : 'text-blue-600 bg-blue-50'
                      : isDark
                        ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className={`${isActive ? 'text-xl' : 'text-lg'} mb-1`} />
                  <span className={`text-xs font-medium leading-tight text-center ${
                    isActive ? 'font-semibold' : ''
                  }`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
};

export default PWALayout;

