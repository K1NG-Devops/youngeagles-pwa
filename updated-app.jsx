import { Suspense, lazy } from "react"
import { Routes, Route } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"
import { NavigationProvider } from "./contexts/NavigationContext"
import { SubscriptionProvider } from "./contexts/SubscriptionContext"
import { WebSocketProvider } from "./contexts/WebSocketContext"
import { AdSenseProvider } from "./components/ads/AdSenseProvider" // Add this
import LoadingSpinner from "./components/LoadingSpinner"
import PrivateRoute from "./components/PrivateRoute"
import PWAEnhancements from "./components/PWAEnhancements"
import Layout from "./components/Layout"
import Home from "./pages/Home" // Declare Home component
import Login from "./pages/Login" // Declare Login component
import "./index.css"

// Your existing lazy components...
const Dashboard = lazy(() => import("./pages/Dashboard"))
// ... other components

function App() {
  return (
    <ThemeProvider>
      <NavigationProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <AdSenseProvider>
              {" "}
              {/* Wrap with AdSense provider */}
              <div className="App">
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    {/* Your existing routes */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    {/* ... other routes */}

                    <Route
                      path="/"
                      element={
                        <WebSocketProvider>
                          <Layout />
                        </WebSocketProvider>
                      }
                    >
                      <Route
                        path="dashboard"
                        element={
                          <PrivateRoute>
                            <Dashboard />
                          </PrivateRoute>
                        }
                      />
                      {/* ... other protected routes */}
                    </Route>
                  </Routes>
                </Suspense>
                <PWAEnhancements />
              </div>
            </AdSenseProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </NavigationProvider>
    </ThemeProvider>
  )
}

export default App
