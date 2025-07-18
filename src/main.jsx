import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App.jsx"
import "./index.css"
import { BrowserRouter } from "react-router-dom"
import { AuthProvider } from "../contexts/AuthContext.jsx" // Assuming AuthContext
import { ThemeProvider } from "../contexts/ThemeContext.jsx" // Assuming ThemeContext
import { SubscriptionProvider } from "../contexts/SubscriptionContext.jsx" // Assuming SubscriptionContext
import { AdSenseProvider } from "../components/ads/AdSenseProvider.jsx" // Assuming AdSenseProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <AdSenseProvider>
              <App />
            </AdSenseProvider>
          </SubscriptionProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
