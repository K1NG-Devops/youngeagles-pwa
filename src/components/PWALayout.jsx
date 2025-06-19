import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { FaHome, FaBook, FaBell, FaUser, FaChalkboardTeacher, FaExternalLinkAlt, FaCog, FaGlobe, FaComments } from 'react-icons/fa'
import useAuth from '../hooks/useAuth'
import usePWA from '../hooks/usePWA'
import { toast } from 'react-toastify'

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
import MessagingCenter from './MessagingCenter'
import PrivateRoutePWA from './PWA/PrivateRoutePWA'
import AdminLogin from './AdminLogin'
import OfflineIndicator from './OfflineIndicator'
import Registration2026 from '../pages/Registration2026'
import ContactUs from '../pages/ContactUs'
import AdminTeachers from './PWA/AdminTeachers'

const PWALayout = ({ isOnline = true }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()
  
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

  // Check authentication on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')
        const userRole = localStorage.getItem('role')
        
        console.log('🔄 PWALayout - Auth initialization:', {
          hasAccessToken: !!accessToken,
          hasAuthUser: !!auth?.user,
          hasStoredUser: !!storedUser,
          currentPath: location.pathname,
          isPublicRoute: location.pathname.includes('login') || 
                        location.pathname.includes('register') || 
                        location.pathname.includes('password-reset')
        })
        
        // If we have a token but no auth user, let useAuth handle restoration
        if (accessToken && !auth?.user && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log('📦 PWALayout - Found stored user data, letting useAuth restore session')
            // Don't redirect immediately, let auth restoration happen first
          } catch (error) {
            console.error('❌ Error parsing stored user:', error)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
          }
        }

        // Only redirect if we clearly have no auth data and not on public routes
        const isPublicRoute = location.pathname.includes('login') || 
                             location.pathname.includes('register') || 
                             location.pathname.includes('password-reset') ||
                             location.pathname.includes('auth-test') ||
                             location.pathname === '/contact-us' ||
                             location.pathname === '/register-2026'
        
        if (!auth?.user && !accessToken && !isPublicRoute) {
          console.log('🚪 PWALayout - No auth data found, redirecting to login')
          const preferredRole = localStorage.getItem('preferredRole') || 'parent'
          const loginPath = preferredRole === 'teacher' ? '/teacher-login' : 
                          preferredRole === 'admin' ? '/admin-login' : 
                          '/login'
          navigate(loginPath)
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    // Add a small delay to let useAuth initialize first
    const timer = setTimeout(initializeAuth, 100)
    return () => clearTimeout(timer)
  }, [auth?.user, navigate, location.pathname])

  // Sync navigation tab with current route
  useEffect(() => {
    if (!isInitialized) return

    const currentPath = location.pathname
    if (currentPath.includes('/student/homework') || currentPath.includes('/homework')) {
      setActiveTab('homework')
    } else if (currentPath.includes('/messages')) {
      setActiveTab('messages')
    } else if (currentPath.includes('/notifications')) {
      setActiveTab('notifications')
    } else if (currentPath.includes('/dashboard')) {
      setActiveTab('dashboard')
    }
  }, [location.pathname, isInitialized])

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
    // For development, just open in new tab
    if (import.meta.env.DEV) {
      window.open('http://localhost:5173', '_blank')
      toast.info('Opening main website in new tab...')
    } else {
      openFullWebsite()
      toast.info('Opening full website in browser...')
    }
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

  if (!isInitialized) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Offline Indicator */}
      {!isOnline && <OfflineIndicator />}
      
      {/* PWA Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full overflow-hidden shadow-lg border-2 border-white/20">
              <img 
                src="/icon-48x48.png" 
                alt="Young Eagles Home Care Centre Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold">Young Eagles</h1>
              <span className="text-xs bg-blue-500 px-2 py-1 rounded-full">PWA</span>
              <span className="text-xs bg-green-500 px-2 py-1 rounded-full">v1.0</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {import.meta.env.DEV && (
              <button
                onClick={() => {
                  console.log('🔔 Test notification clicked')
                  toast.info('Test notification!')
                }}
                className="p-2 hover:bg-blue-500 rounded-lg transition-colors duration-200"
                title="Test Notifications"
              >
                <FaBell className="text-sm" />
              </button>
            )}
            
            <button
              onClick={handleOpenWebsite}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors duration-200"
              title="Open full website"
            >
              <FaExternalLinkAlt className="text-sm" />
            </button>
            
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-blue-500 rounded-lg transition-colors duration-200"
              title="Logout"
            >
              <FaUser className="text-sm" />
            </button>
          </div>
        </div>
        
        {auth?.user && (
          <div className="mt-2 text-sm opacity-90">
            Welcome, {auth.user.name || auth.user.email}
            <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded">
              {auth.user.role}
            </span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <Routes>
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
            <Route path="/messages" element={<MessagingCenter />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/teacher-dashboard" element={<PWATeacherDashboard />} />
            <Route path="/teacher/homework-list" element={<HomeworkList />} />
            <Route path="/admin-dashboard" element={<PWAAdminDashboard />} />
            <Route path="/admin-teachers" element={<AdminTeachers />} />
          </Route>

          <Route path="/register-2026" element={<Registration2026 />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {/* Bottom Navigation */}
      {auth?.user && navigationItems.length > 0 && (
        <nav className="bg-white border-t border-gray-200 p-2">
          <div className="flex justify-around">
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
                  className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${
                    isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="text-lg mb-1" />
                  <span className="text-xs font-medium">{item.label}</span>
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

