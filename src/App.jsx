import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { AdSenseScript } from "./components/ads/AdSenseComponents"
import { AdFrequencyProvider } from "./components/ads/AdFrequencyManager"
import Dashboard from "./components/Dashboard"
import { AdBlockDetector, AdBlockFallback } from "./components/ads/AdBlockDetector"

// ... other imports

function App() {
  return (
    <AdFrequencyProvider>
      <Router>
        <div className="App">
          {/* Load AdSense script */}
          <AdSenseScript />

          {/* Wrap your app with ad block detection */}
          <AdBlockDetector
            fallback={<AdBlockFallback message="Please disable your ad blocker to support Young Eagles PWA" />}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              {/* ... other routes */}
            </Routes>
          </AdBlockDetector>
        </div>
      </Router>
    </AdFrequencyProvider>
  )
}

export default App
