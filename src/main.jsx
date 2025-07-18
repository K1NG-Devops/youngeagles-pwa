import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./App.jsx"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SubscriptionProvider } from "./contexts/SubscriptionContext"
import { GoogleAdsProvider } from "../components/ads/GoogleAdsProvider.tsx" // Assuming this path is correct
import "./index.css" // Assuming you have a global CSS file here

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <GoogleAdsProvider>
              <App />
            </GoogleAdsProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
