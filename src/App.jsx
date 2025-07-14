import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';
import PWAEnhancements from './components/PWAEnhancements';
import Layout from './components/Layout';
import AutoAds from './components/ads/AutoAds';
import './index.css';

// Debug logger
const debugLog = (message, data = null) => {
  const timestamp = new Date().toISOString();
  console.log(`[DEBUG ${timestamp}] ${message}`, data || '');
  
  // Show user-friendly alert for critical issues
  if (message.includes('ERROR') || message.includes('FAILED')) {
    alert(`Debug: ${message}`);
  }
};

// Enhanced error boundary for debugging
class DebugErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    debugLog('ERROR: React Error Boundary caught error', { error, errorInfo });
    alert(`React Error: ${error.message}\nComponent: ${errorInfo.componentStack}`);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', background: '#fee', color: '#c00' }}>
          <h2>Debug Mode - Error Detected</h2>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload App</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load components with debug logging
const createLazyComponent = (importFunc, name) => {
  return lazy(() => {
    debugLog(`Loading component: ${name}`);
    return importFunc().catch(error => {
      debugLog(`ERROR: Failed to load component ${name}`, error);
      throw error;
    });
  });
};

const Home = createLazyComponent(() => import('./pages/Home'), 'Home');
const Login = createLazyComponent(() => import('./pages/Login'), 'Login');
const Register = createLazyComponent(() => import('./pages/Register'), 'Register');
const Dashboard = createLazyComponent(() => import('./pages/Dashboard'), 'Dashboard');
const Activities = createLazyComponent(() => import('./pages/Activities'), 'Activities');
const Homework = createLazyComponent(() => import('./pages/Homework'), 'Homework');
const Children = createLazyComponent(() => import('./pages/Children'), 'Children');
const Classes = createLazyComponent(() => import('./pages/Classes'), 'Classes');
const Notifications = createLazyComponent(() => import('./pages/Notifications'), 'Notifications');
const Settings = createLazyComponent(() => import('./pages/Settings'), 'Settings');
const Contact = createLazyComponent(() => import('./pages/Contact'), 'Contact');
const Events = createLazyComponent(() => import('./pages/Events'), 'Events');
const Management = createLazyComponent(() => import('./pages/Management'), 'Management');
const AdminDashboard = createLazyComponent(() => import('./pages/AdminDashboard'), 'AdminDashboard');
const TeacherDashboard = createLazyComponent(() => import('./pages/TeacherDashboard'), 'TeacherDashboard');
const ParentProfile = createLazyComponent(() => import('./pages/ParentProfile'), 'ParentProfile');
const PrivacyPolicy = createLazyComponent(() => import('./pages/PrivacyPolicy'), 'PrivacyPolicy');
const TermsOfService = createLazyComponent(() => import('./pages/TermsOfService'), 'TermsOfService');
const HomeworkDetails = createLazyComponent(() => import('./pages/HomeworkDetails'), 'HomeworkDetails');
const SubmitWork = createLazyComponent(() => import('./pages/SubmitWork'), 'SubmitWork');
const ClassRegister = createLazyComponent(() => import('./pages/ClassRegister'), 'ClassRegister');
const Checkout = createLazyComponent(() => import('./pages/Checkout'), 'Checkout');
const PaymentSuccess = createLazyComponent(() => import('./pages/PaymentSuccess'), 'PaymentSuccess');
const PaymentCancel = createLazyComponent(() => import('./pages/PaymentCancel'), 'PaymentCancel');
const PaymentProofs = createLazyComponent(() => import('./pages/PaymentProofs'), 'PaymentProofs');
const AdminPaymentReview = createLazyComponent(() => import('./pages/AdminPaymentReview'), 'AdminPaymentReview');
const SwipeDemo = createLazyComponent(() => import('./components/SwipeDemo'), 'SwipeDemo');

// Debug navigation tracker
function NavigationTracker() {
  const location = useLocation();
  const navigate = useNavigate();
  const [routeHistory, setRouteHistory] = useState([]);

  useEffect(() => {
    debugLog(`Navigation: ${location.pathname}`, location);
    setRouteHistory(prev => [...prev, location.pathname].slice(-10));
  }, [location]);

  useEffect(() => {
    debugLog('App initialized in debug mode');
    
    // Test navigation functions
    window.debugNavigate = (path) => {
      debugLog(`Debug navigation to: ${path}`);
      navigate(path);
    };

    window.debugRouteHistory = () => {
      debugLog('Route history:', routeHistory);
      alert(`Route History: ${routeHistory.join(' → ')}`);
    };

    window.debugCurrentLocation = () => {
      debugLog('Current location:', location);
      alert(`Current Location: ${location.pathname}`);
    };

    return () => {
      delete window.debugNavigate;
      delete window.debugRouteHistory;
      delete window.debugCurrentLocation;
    };
  }, [navigate, routeHistory, location]);

  return null;
}

// Enhanced loading spinner with debug info
function DebugLoadingSpinner() {
  const [loadingTime, setLoadingTime] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setLoadingTime(Date.now() - start);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f0f0f0'
    }}>
      <LoadingSpinner />
      <p style={{ marginTop: '10px', color: '#666' }}>
        Debug Mode - Loading... ({Math.round(loadingTime/1000)}s)
      </p>
    </div>
  );
}

function App() {
  useEffect(() => {
    debugLog('App component mounted');
    
    // Add debug info to console
    console.log('🔧 DEBUG MODE ACTIVE');
    console.log('Available debug functions:');
    console.log('- window.debugNavigate(path)');
    console.log('- window.debugRouteHistory()');
    console.log('- window.debugCurrentLocation()');
    
    // Test route availability
    const testRoutes = ['/login', '/register', '/dashboard'];
    testRoutes.forEach(route => {
      debugLog(`Testing route availability: ${route}`);
    });
  }, []);

  return (
    <DebugErrorBoundary>
      <ThemeProvider>
        <DebugErrorBoundary>
          <NavigationProvider>
            <DebugErrorBoundary>
              <AuthProvider>
                <DebugErrorBoundary>
                  <SubscriptionProvider>
                    <DebugErrorBoundary>
                      <div className="App">
                        <NavigationTracker />
                        <Suspense fallback={<DebugLoadingSpinner />}>
                          <Routes>
                            {/* Public routes without Layout */}
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/contact" element={<Contact />} />
                            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                            <Route path="/terms-of-service" element={<TermsOfService />} />
                            <Route path="/swipe-demo" element={<SwipeDemo />} />
                              
                            {/* Protected routes with Layout */}
                            <Route path="/" element={
                              <WebSocketProvider>
                                <Layout />
                              </WebSocketProvider>
                            }>
                              <Route path="dashboard" element={
                                <PrivateRoute>
                                  <Dashboard />
                                </PrivateRoute>
                              } />
                              <Route path="activities" element={
                                <PrivateRoute>
                                  <Activities />
                                </PrivateRoute>
                              } />
                              <Route path="homework" element={
                                <PrivateRoute>
                                  <Homework />
                                </PrivateRoute>
                              } />
                              <Route path="homework/:id" element={
                                <PrivateRoute>
                                  <HomeworkDetails />
                                </PrivateRoute>
                              } />
                              <Route path="homework/:id/submit" element={
                                <PrivateRoute>
                                  <SubmitWork />
                                </PrivateRoute>
                              } />
                              <Route path="children" element={
                                <PrivateRoute>
                                  <Children />
                                </PrivateRoute>
                              } />
                              <Route path="classes" element={
                                <PrivateRoute>
                                  <Classes />
                                </PrivateRoute>
                              } />
                              <Route path="classes/:id/register" element={
                                <PrivateRoute>
                                  <ClassRegister />
                                </PrivateRoute>
                              } />
                              <Route path="notifications" element={
                                <PrivateRoute>
                                  <Notifications />
                                </PrivateRoute>
                              } />
                              <Route path="settings" element={
                                <PrivateRoute>
                                  <Settings />
                                </PrivateRoute>
                              } />
                              <Route path="events" element={
                                <PrivateRoute>
                                  <Events />
                                </PrivateRoute>
                              } />
                              <Route path="management" element={
                                <PrivateRoute>
                                  <Management />
                                </PrivateRoute>
                              } />
                              <Route path="admin-dashboard" element={
                                <PrivateRoute>
                                  <AdminDashboard />
                                </PrivateRoute>
                              } />
                              <Route path="teacher-dashboard" element={
                                <PrivateRoute>
                                  <TeacherDashboard />
                                </PrivateRoute>
                              } />
                              <Route path="profile" element={
                                <PrivateRoute>
                                  <ParentProfile />
                                </PrivateRoute>
                              } />
                              <Route path="checkout" element={
                                <PrivateRoute>
                                  <Checkout />
                                </PrivateRoute>
                              } />
                              <Route path="payment-success" element={
                                <PrivateRoute>
                                  <PaymentSuccess />
                                </PrivateRoute>
                              } />
                              <Route path="payment-cancel" element={
                                <PrivateRoute>
                                  <PaymentCancel />
                                </PrivateRoute>
                              } />
                              <Route path="payment-proofs" element={
                                <PrivateRoute>
                                  <PaymentProofs />
                                </PrivateRoute>
                              } />
                              <Route path="admin-payment-review" element={
                                <PrivateRoute>
                                  <AdminPaymentReview />
                                </PrivateRoute>
                              } />
                            </Route>
                          </Routes>
                        </Suspense>
                        <PWAEnhancements />
                        <AutoAds />
                      </div>
                    </DebugErrorBoundary>
                  </SubscriptionProvider>
                </DebugErrorBoundary>
              </AuthProvider>
            </DebugErrorBoundary>
          </NavigationProvider>
        </DebugErrorBoundary>
      </ThemeProvider>
    </DebugErrorBoundary>
  );
}

export default App;
