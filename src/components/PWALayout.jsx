import React, { useState, useEffect } from 'react'
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
  const { logout } = useAuth()
  const { isOnline } = usePWA()
  const { isDark, toggleTheme } = useTheme()
  const { isConnected, sendMessage, lastMessage } = useWebSocket()
  
  // Simple localStorage-based auth like the full website
  const accessToken = localStorage.getItem('accessToken')
  const storedUser = localStorage.getItem('user')
  const role = localStorage.getItem('role')
  
  let auth = null
  if (accessToken && storedUser) {
    try {
      auth = {
        user: JSON.parse(storedUser),
        token: accessToken,
        role: role
      }
    } catch (error) {
      console.error('Error parsing stored user:', error)
      localStorage.removeItem('user')
      localStorage.removeItem('accessToken')
    }
  }
  const { openFullWebsite } = usePWA()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isInitialized, setIsInitialized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Helper functions to improve code readability
  const isPublicRoute = (path) => {
    return path.includes('login') || 
           path.includes('register') || 
           path.includes('password-reset') ||
           path.includes('auth-test') ||
           path === '/contact-us' ||
           path === '/register-2026';
  }

  const getDashboardPath = (role) => {
    if (role === 'teacher') return '/teacher-dashboard';
    if (role === 'admin') return '/admin-dashboard';
    return '/dashboard'; // Default for parents/students
  }

  // Navigation Guard: Check immediately if user is on login but already authenticated
  useEffect(() => {
    const currentPath = location.pathname;
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    const userRole = localStorage.getItem('role');
    
    console.log('🔍 PWALayout - Navigation Guard Check:', {
      path: currentPath,
      hasToken: !!accessToken,
      hasUser: !!storedUser,
      role: userRole || 'none',
      isPublicRoute: isPublicRoute(currentPath)
    });
    
    // If user is authenticated but on a public route (like login), redirect to dashboard
    if (isPublicRoute(currentPath) && accessToken && storedUser) {
      try {
        // Verify the stored user is valid JSON
        const user = JSON.parse(storedUser);
        const role = user.role || userRole || 'parent';
        const dashboardPath = getDashboardPath(role);
        
        console.log('🚀 PWALayout - Redirecting authenticated user from public route to dashboard', {
          from: currentPath,
          to: dashboardPath,
          userRole: role
        });
        
        navigate(dashboardPath, { replace: true });
      } catch (error) {
        console.error('❌ PWALayout - Invalid user data in localStorage:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      }
    }
  }, [location.pathname, navigate]);

  // Check authentication on mount and handle redirects for protected routes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const storedUser = localStorage.getItem('user');
        const userRole = localStorage.getItem('role');
        const currentPath = location.pathname;
        
        console.log('🔄 PWALayout - Auth initialization:', {
          hasAccessToken: !!accessToken,
          hasAuthUser: !!auth?.user,
          hasStoredUser: !!storedUser,
          currentPath: currentPath,
          tokenLength: accessToken ? accessToken.length : 0,
          isPublicRoute: isPublicRoute(currentPath)
        });
        
        // If we have a token but no auth user, let useAuth handle restoration
        if (accessToken && !auth?.user && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('📦 PWALayout - Found stored user data:', {
              email: parsedUser.email,
              role: parsedUser.role || userRole,
              name: parsedUser.name
            });
          } catch (error) {
            console.error('❌ Error parsing stored user:', error);
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        }

        // Only redirect if we clearly have no auth data and not on public routes
        if (!accessToken && !isPublicRoute(currentPath)) {
          console.log('🚪 PWALayout - No auth data found, redirecting to login');
          const preferredRole = localStorage.getItem('preferredRole') || 'parent';
          const loginPath = preferredRole === 'teacher' ? '/teacher-login' : 
                          preferredRole === 'admin' ? '/admin-login' : 
                          '/login';
          navigate(loginPath, { replace: true });
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    // Run immediately without delay
    initializeAuth();
  }, [auth?.user, navigate, location.pathname]);

  // Sync navigation tab with current route
  useEffect(() => {
    if (!isInitialized) return
    
    const currentPath = location.pathname
    console.log('📌 PWALayout - Syncing navigation tab with route:', {
      path: currentPath,
      authenticated: !!auth?.user,
      isInitialized
    })
    
    if (currentPath.includes('/student/homework') || currentPath.includes('/homework')) {
      setActiveTab('homework')
    } else if (currentPath.includes('/messages')) {
      setActiveTab('messages')
    } else if (currentPath.includes('/notifications')) {
      setActiveTab('notifications')
    } else if (currentPath.includes('/dashboard')) {
      setActiveTab('dashboard')
    }
  }, [location.pathname, isInitialized, auth?.user])

  // Handle WebSocket connection status
  useEffect(() => {
    if (auth?.user && isConnected) {
      console.log('🔌 WebSocket connected for user:', auth.user.name || auth.user.email)
      showNotification('Connected to real-time messaging', 'success')
    } else if (auth?.user && !isConnected) {
      console.log('🔌 WebSocket disconnected for user:', auth.user.name || auth.user.email)
    }
  }, [isConnected, auth?.user])

  // Handle new WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      console.log('📨 New real-time message received:', lastMessage)
      // You can add custom logic here for different message types
      if (lastMessage.type === 'homework_notification') {
        showNotification(`New homework: ${lastMessage.title}`, 'info')
      } else if (lastMessage.type === 'message') {
        showNotification(`New message from ${lastMessage.sender}`, 'info')
      }
    }
  }, [lastMessage])

  const handleLogout = async () => {
    try {
      await logout()
      setActiveTab('dashboard')
      navigate('/login')
      toast.success('Logged out successfully')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Error during logout')
    }
  }

  const handleOpenWebsite = async () => {
    // Open the main website in browser - this PWA is standalone
    const mainWebsiteUrl = import.meta.env.DEV 
      ? (import.meta.env.VITE_MAIN_WEBSITE_DEV_URL || 'http://localhost:5173')
      : (import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://youngeagles.org.za')
    
    window.open(mainWebsiteUrl, '_blank')
    showNotification('Opening main website in browser...', 'info')
  }

  // Navigation items based on user role
  const getNavigationItems = () => {
    const role = auth?.user?.role || localStorage.getItem('role')
    const isTeacher = role === 'teacher'
    const isAdmin = role === 'admin'
    
    if (!isInitialized) return []

    if (isTeacher) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/teacher-dashboard' },
        { id: 'homework', label: 'Homework', icon: FaBook, path: '/teacher/homework-list' },
        { id: 'messages', label: 'Messages', icon: FaComments, path: '/messages' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/notifications' },
      ]
    } else if (isAdmin) {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/admin-dashboard' },
        { id: 'messages', label: 'Messages', icon: FaComments, path: '/messages' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/notifications' },
      ]
    } else {
      return [
        { id: 'dashboard', label: 'Dashboard', icon: FaHome, path: '/dashboard' },
        { id: 'homework', label: 'Homework', icon: FaBook, path: '/student/homework' },
        { id: 'messages', label: 'Messages', icon: FaComments, path: '/messages' },
        { id: 'notifications', label: 'Notifications', icon: FaBell, path: '/notifications' },
      ]
    }
  }

  const navigationItems = getNavigationItems()

  // Debug auth state before rendering
  useEffect(() => {
    console.log('🧪 PWALayout - Current Auth State:', {
      hasToken: !!localStorage.getItem('accessToken'),
      hasUser: !!localStorage.getItem('user'),
      role: localStorage.getItem('role') || 'none',
      path: location.pathname,
      isInitialized
    });
  }, [location.pathname, isInitialized]);

  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
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
      {/* Mobile-First PWA Header - Fixed */}
      <header className={`fixed top-0 left-0 right-0 z-40 ${isDark ? 'bg-gray-800' : 'bg-blue-600'} text-white px-3 py-2 shadow-lg transition-colors duration-200`}>
        <div className="flex justify-between items-center">
          {/* Logo and Title - Simplified for mobile */}
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
              {/* WebSocket Connection Indicator */}
              {auth?.user && (
                <div className={`flex items-center space-x-1 ${isConnected ? 'text-green-400' : 'text-red-400'}`} title={isConnected ? 'Connected to real-time messaging' : 'Disconnected from real-time messaging'}>
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} ${isConnected ? 'animate-pulse' : ''}`}></div>
                  <span className="text-xs hidden sm:inline">{isConnected ? 'Live' : 'Offline'}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side actions - Mobile optimized */}
          <div className="flex items-center space-x-1">
            {/* Only show essential actions on mobile */}
            <button
              onClick={handleOpenWebsite}
              className={`p-2 rounded-lg transition-colors duration-200 hidden sm:block ${isDark ? 'hover:bg-gray-700' : 'hover:bg-blue-500'}`}
              title="Open full website"
            >
              <FaExternalLinkAlt className="text-sm" />
            </button>
            
            {/* User Dropdown Menu */}
            <UserDropdown
              user={auth?.user}
              onLogout={handleLogout}
              onSettings={() => setShowSettings(true)}
              onOpenWebsite={handleOpenWebsite}
            />
          </div>
        </div>
        

      </header>

      {/* Main Content - Full Viewport Width, Account for Fixed Header */}
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

      {/* Mobile-First Bottom Navigation - Theme Aware */}
      {auth?.user && navigationItems.length > 0 && (
        <nav className={`fixed bottom-0 left-0 right-0 border-t shadow-lg transition-colors duration-200 z-50 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex justify-around items-center h-16 px-2">
            {navigationItems.map((item) => {
              const IconComponent = item.icon
              const isActive = activeTab === item.id
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    navigate(item.path)
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
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}

export default PWALayout

