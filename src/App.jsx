import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Components
import NotificationManager from './components/NotificationManager'
import AutoLogout from './components/AutoLogout'
import PWALayout from './components/PWALayout'

function App() {
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
        
        {/* PWALayout handles all routes (public and authenticated) */}
        <Routes>
          <Route path="/*" element={<PWALayout />} />
        </Routes>
        
        {/* Notification Manager */}
        <NotificationManager />
      </AutoLogout>
    </Router>
  )
}

export default App
