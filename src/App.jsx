import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// PWA Components
import PWALayout from './components/PWALayout'
import Login from './components/Login'
import TeacherLogin from './components/TeacherLogin'
import AdminLogin from './components/AdminLogin'
import Register from './components/Register'
import PasswordReset from './components/PasswordReset'
import AuthTest from './components/AuthTest'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import PWADebugIndicator from './components/PWADebugIndicator'
import NotificationManager from './components/NotificationManager'
import AutoLogout from './components/AutoLogout'
import Registration2026 from './pages/Registration2026'
import ContactUs from './pages/ContactUs'

// Hooks
import usePWA from './hooks/usePWA'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const { isStandalone } = usePWA()

  useEffect(() => {
    // Register service worker
    const updateServiceWorker = registerSW({
      onNeedRefresh() {
        toast.info('New content available. Click to refresh.', {
          position: 'bottom-right',
          onClick: () => updateServiceWorker(true)
        })
      },
      onOfflineReady() {
        toast.success('App ready to work offline!', {
          position: 'bottom-right'
        })
      },
    })

    // Online/offline detection
    const handleOnline = () => {
      setIsOnline(true)
      toast.success('Back online!', { position: 'top-center' })
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      toast.warning('You are offline. Some features may be limited.', { position: 'top-center' })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Check if URL has source=pwa parameter to force PWA view
  const urlParams = new URLSearchParams(window.location.search)
  const forcePWAView = urlParams.get('source') === 'pwa'
  
  // Force PWA mode for development
  const shouldUsePWALayout = isStandalone || forcePWAView || import.meta.env.DEV

  return (
    <Router>
      <AutoLogout>
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
        
        {/* Always use PWA Layout in development */}
        {shouldUsePWALayout ? (
          <PWALayout isOnline={isOnline} />
        ) : (
          // Fallback routes for non-PWA access
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/teacher-login" element={<TeacherLogin />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/auth-test" element={<AuthTest />} />
            <Route path="/register-2026" element={<Registration2026 />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route path="/*" element={<Navigate to="/login" replace />} />
          </Routes>
        )}
        
        {/* PWA Install Prompt - only show for web view */}
        {!shouldUsePWALayout && <PWAInstallPrompt />}
        
        {/* Debug indicator for development */}
        {import.meta.env.DEV && <PWADebugIndicator />}
        
        {/* Notification Manager */}
        <NotificationManager />
      </AutoLogout>
    </Router>
  )
}

export default App
