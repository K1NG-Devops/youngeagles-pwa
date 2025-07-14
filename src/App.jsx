import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
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

// Error boundary with minimal error message
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Standard lazy loading
const createLazyComponent = (importFunc) => {
  return lazy(importFunc);
};

const Home = createLazyComponent(() => import('./pages/Home'));
const Login = createLazyComponent(() => import('./pages/Login'));
const Register = createLazyComponent(() => import('./pages/Register'));
const Dashboard = createLazyComponent(() => import('./pages/Dashboard'));
const Activities = createLazyComponent(() => import('./pages/Activities'));
const Homework = createLazyComponent(() => import('./pages/Homework'));
const Children = createLazyComponent(() => import('./pages/Children'));
const Classes = createLazyComponent(() => import('./pages/Classes'));
const Notifications = createLazyComponent(() => import('./pages/Notifications'));
const Settings = createLazyComponent(() => import('./pages/Settings'));
const Contact = createLazyComponent(() => import('./pages/Contact'));
const Events = createLazyComponent(() => import('./pages/Events'));
const Management = createLazyComponent(() => import('./pages/Management'));
const AdminDashboard = createLazyComponent(() => import('./pages/AdminDashboard'));
const TeacherDashboard = createLazyComponent(() => import('./pages/TeacherDashboard'));
const ParentProfile = createLazyComponent(() => import('./pages/ParentProfile'));
const PrivacyPolicy = createLazyComponent(() => import('./pages/PrivacyPolicy'));
const TermsOfService = createLazyComponent(() => import('./pages/TermsOfService'));
const HomeworkDetails = createLazyComponent(() => import('./pages/HomeworkDetails'));
const SubmitWork = createLazyComponent(() => import('./pages/SubmitWork'));
const ClassRegister = createLazyComponent(() => import('./pages/ClassRegister'));
const Checkout = createLazyComponent(() => import('./pages/Checkout'));
const PaymentSuccess = createLazyComponent(() => import('./pages/PaymentSuccess'));
const PaymentCancel = createLazyComponent(() => import('./pages/PaymentCancel'));
const PaymentProofs = createLazyComponent(() => import('./pages/PaymentProofs'));
const AdminPaymentReview = createLazyComponent(() => import('./pages/AdminPaymentReview'));
const SwipeDemo = createLazyComponent(() => import('./components/SwipeDemo'));

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // App initialization
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Failsafe timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
          setIsInitialized(true);
        }, 10000);
        
        // Initialize memory optimizer
        await memoryOptimizer.init();
        
        // Initialize AdSense error handler
        await adSenseErrorHandler.init();
        
        // Register cleanup for route changes
        memoryOptimizer.registerCleanupTask(() => {
          const staleElements = document.querySelectorAll('.stale-component');
          staleElements.forEach(el => el.remove());
        });
        
        setIsInitialized(true);
        clearTimeout(timeoutId);
        
      } catch (error) {
        setIsInitialized(true);
      }
    };
    
    initializeApp();
    
    return () => {
      memoryOptimizer.stop();
    };
  }, []);

  // Show loading screen while initializing
  if (!isInitialized) {
    return <LoadingSpinner />;
  }

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NavigationProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <div className="App">
                <Suspense fallback={<LoadingSpinner />}>
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
            </SubscriptionProvider>
          </AuthProvider>
        </NavigationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
