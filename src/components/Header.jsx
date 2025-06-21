import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { FaHome, FaBook, FaBell, FaUser, FaChalkboardTeacher, FaExternalLinkAlt, FaCog, FaGlobe, FaComments } from 'react-icons/fa'
import useAuth from '../hooks/useAuth'
import usePWA from '../hooks/usePWA'
import { toast } from 'react-toastify'

// Import dashboard components
import PWAParentDashboard from './PWA/PWAParentDashboard'
import PWATeacherDashboard from './PWA/PWATeacherDashboard'
import SubmitWork from '../pages/SubmitWork'
import HomeworkList from '../pages/HomeworkList'
import Notifications from '../pages/Notifications'
import Login from '../components/Login'
import Register from '../components/Register'
import PasswordReset from '../components/PasswordReset'
import TeacherLogin from '../components/TeacherLogin'
import AuthTest from '../components/AuthTest'
import MessagingCenter from './MessagingCenter'
import PrivateRoutePWA from './PWA/PrivateRoutePWA'
import AdminLogin from '../components/AdminLogin'
import OfflineIndicator from './OfflineIndicator'

const PWALayout = ({ isOnline = true }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, logout } = useAuth()
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
        
        // If we have a token but no auth user, try to restore the session
        if (accessToken && !auth?.user && storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            // You might want to validate the token here
            // await validateToken(accessToken);
          } catch (error) {
            console.error('Error parsing stored user:', error)
            localStorage.removeItem('user')
            localStorage.removeItem('accessToken')
          }
        }

        // Only redirect if we're not already on a login page
        if (!auth?.user && !accessToken && !location.pathname.includes('login')) {
          const preferredRole = localStorage.getItem('preferredRole') || 'parent'
          const loginPath = preferredRole === 'teacher' ? '/teacher-login' : 
                          preferredRole === 'admin' ? '/admin-login' : 
                          '/login'
          navigate(loginPath)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsInitialized(true)
      }
    }

    initializeAuth()
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
    // Open the main website in browser
    const mainWebsiteUrl = import.meta.env.DEV 
      ? (import.meta.env.VITE_MAIN_WEBSITE_DEV_URL || 'http://localhost:5173')
      : (import.meta.env.VITE_MAIN_WEBSITE_URL || 'https://youngeagles.org.za')
    
    window.open(mainWebsiteUrl, '_blank')
    toast.info('Opening main website in browser...')
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
                alt="Young Eagles Logo" 
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
            <Route path="/admin-dashboard" element={<div className="p-4">Admin Dashboard Coming Soon</div>} />
          </Route>

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

