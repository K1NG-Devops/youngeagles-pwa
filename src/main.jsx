import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SubscriptionProvider } from "./contexts/SubscriptionContext"
import { AdSenseProvider } from "./components/ads/AdSenseProvider.jsx" // Correct path to AdSenseProvider
import "./index.css" // Assuming you have a global CSS file here

// Get AdSense configuration from environment variables
const adsensePublisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID
const adsenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true" // Convert string to boolean

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <AdSenseProvider publisherId={adsensePublisherId} enabled={adsenseEnabled}>
              <App />
            </AdSenseProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
