import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./App.jsx"
import "./index.css" // Assuming you have a global CSS file
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SubscriptionProvider } from "./contexts/SubscriptionContext"
import { GoogleAdsProvider } from "./components/ads/GoogleAdsProvider" // Assuming this path

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <GoogleAdsProvider>
              <App />
            </GoogleAdsProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  </React.StrictMode>,
)
