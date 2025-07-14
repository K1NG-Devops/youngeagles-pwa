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
import PerformanceMonitor from './components/PerformanceMonitor';
import Layout from './components/Layout';
import AutoAds from './components/ads/AutoAds';
import memoryOptimizer from './utils/memoryOptimizer';
import adSenseErrorHandler from './utils/adSenseErrorHandler';
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
        Initializing application... ({Math.round(loadingTime/1000)}s)
      </p>
      <p style={{ marginTop: '5px', color: '#999', fontSize: '12px' }}>
        Check console for detailed logs
      </p>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Single comprehensive initialization effect - MUST be first hook
  useEffect(() => {
    console.log('🚀 App initialization starting...');
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
    
    let timeoutId;
    let memoryInterval;
    
    const initializeApp = async () => {
      try {
        // Failsafe timeout to prevent infinite loading
        timeoutId = setTimeout(() => {
          if (!isInitialized) {
            console.warn('⚠️ App initialization timeout - forcing initialization');
            setIsInitialized(true);
          }
        }, 10000); // 10 second timeout
        
        // Initialize memory optimizer
        console.log('📊 Initializing memory optimizer...');
        await memoryOptimizer.init();
        console.log('✅ Memory optimizer initialized');
        
        // Initialize AdSense error handler
        console.log('📢 Initializing AdSense error handler...');
        await adSenseErrorHandler.init();
        console.log('✅ AdSense error handler initialized');
        
        // Register cleanup for route changes
        console.log('🧹 Registering cleanup tasks...');
        memoryOptimizer.registerCleanupTask(() => {
          // Clean up stale references on route changes
          const staleElements = document.querySelectorAll('.stale-component');
          staleElements.forEach(el => el.remove());
        });
        console.log('✅ Cleanup tasks registered');
        
        // Memory monitoring for development
        if (import.meta.env.DEV) {
          console.log('🔧 Setting up development memory monitoring...');
          memoryInterval = setInterval(() => {
            try {
              const stats = memoryOptimizer.getMemoryStats();
              if (stats.supported && stats.used > 80) {
                console.warn('⚠️ High memory usage detected:', `${stats.used}MB (${stats.percentage}%)`);
              }
              
              // Also log AdSense status
              const adSenseStats = adSenseErrorHandler.getErrorStats();
              if (adSenseStats.totalErrors > 0) {
                console.log('📊 AdSense Error Stats:', adSenseStats);
              }
            } catch (error) {
              console.error('❌ Error in memory monitoring:', error);
            }
          }, 60000); // Check every minute
        }
        
        console.log('🎉 App initialization completed successfully!');
        setIsInitialized(true);
        
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        console.error('Error stack:', error.stack);
        // Still set initialized to true to prevent infinite loading
        console.log('⚠️ Continuing despite initialization error...');
        setIsInitialized(true);
      }
    };
    
    initializeApp();
    
    // Cleanup function
    return () => {
      console.log('🧹 App cleanup...');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (memoryInterval) {
        clearInterval(memoryInterval);
      }
      memoryOptimizer.stop();
    };
  }, []); // Empty dependency array - runs once on mount

  // Show loading screen while initializing
  if (!isInitialized) {
    return <DebugLoadingSpinner />;
  }

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
                        <PerformanceMonitor />
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
