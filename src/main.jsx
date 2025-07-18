import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./App.jsx"
import "./index.css" // Assuming you have a global CSS file here
import { AuthProvider } from "./contexts/AuthContext" // Assuming AuthContext exists
import { ThemeProvider } from "./contexts/ThemeContext" // Assuming ThemeContext exists
import { SubscriptionProvider } from "./contexts/SubscriptionContext" // Assuming SubscriptionContext exists
import { GoogleAdsProvider } from "./components/ads/GoogleAdsProvider" // Assuming GoogleAdsProvider exists

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
