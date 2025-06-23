import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Components
import AutoLogout from './components/AutoLogout'
import PWALayout from './components/PWALayout'
import { ThemeProvider } from './hooks/useTheme'

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
