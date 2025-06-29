import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import AutoLogout from './components/AutoLogout'
import PWALayout from './components/PWALayout'
import { ThemeProvider } from './contexts/ThemeContext'
import HomeworkList from './pages/HomeworkList'
import SubmitWork from './pages/SubmitWork'
import ViewSubmission from './pages/ViewSubmission'
import ContactUs from './pages/ContactUs'
import Registration2026 from './pages/Registration2026'
import Notifications from './components/Notifications'
import MessagingCenter from './components/MessagingCenter'
import SimpleMessaging from './components/MessagingSystem/SimpleMessaging'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AutoLogout>
          {/* PWALayout handles all routes (public and authenticated) */}
          <Routes>
            <Route path="/*" element={<PWALayout />} />
          </Routes>
        </AutoLogout>
      </Router>
    </ThemeProvider>
  )
}

export default App
