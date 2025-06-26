import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import AutoLogout from './components/AutoLogout'
import PWALayout from './components/PWALayout'
import { ThemeProvider } from './hooks/useTheme'
import HomeworkList from './pages/HomeworkList'
import SubmitWork from './pages/SubmitWork'
import ViewSubmission from './pages/ViewSubmission'
import ContactUs from './pages/ContactUs'
import Registration2026 from './pages/Registration2026'
import Notifications from './components/Notifications'
import MessagingCenter from './components/MessagingCenter'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AutoLogout>
          {/* PWALayout handles all routes (public and authenticated) */}
          <Routes>
            <Route path="/*" element={<PWALayout />} />
            <Route path="/homework" element={<PWALayout><HomeworkList /></PWALayout>} />
            <Route path="/submit-work" element={<PWALayout><SubmitWork /></PWALayout>} />
            <Route path="/submission/:submissionId" element={<PWALayout><ViewSubmission /></PWALayout>} />
            <Route path="/notifications" element={<PWALayout><Notifications /></PWALayout>} />
            <Route path="/messages" element={<PWALayout><MessagingCenter /></PWALayout>} />
          </Routes>
        </AutoLogout>
      </Router>
    </ThemeProvider>
  )
}

export default App
