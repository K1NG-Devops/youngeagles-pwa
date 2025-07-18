import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AdSenseScript } from "./components/ads/AdSenseComponents"
import { AdFrequencyProvider } from "./components/ads/AdFrequencyManager"
import Dashboard from "./components/Dashboard"
// ... other imports

function App() {
  return (
    <AdFrequencyProvider>
      <Router>
        <div className="App">
          {/* Load AdSense script */}
          <AdSenseScript />

          {/* Your existing routes */}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            {/* ... other routes */}
          </Routes>
        </div>
      </Router>
    </AdFrequencyProvider>
  )
}

export default App
