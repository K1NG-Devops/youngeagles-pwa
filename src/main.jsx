import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter as Router } from "react-router-dom"
import App from "./App.jsx"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { SubscriptionProvider } from "./contexts/SubscriptionContext"
import "../styles/globals.css" // Assuming your global styles are here

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SubscriptionProvider>
            <App />
          </SubscriptionProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>,
)
