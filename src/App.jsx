import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { WebSocketProvider } from './contexts/WebSocketContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import PrivateRoute from './components/PrivateRoute';
import PWAEnhancements from './components/PWAEnhancements';
import Layout from './components/Layout';
import AutoAds from './components/ads/AutoAds';
import './index.css';

// Lazy load components for better performance
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Activities = lazy(() => import('./pages/Activities'));
const Homework = lazy(() => import('./pages/Homework'));
const Children = lazy(() => import('./pages/Children'));
const Classes = lazy(() => import('./pages/Classes'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Settings = lazy(() => import('./pages/Settings'));
const Contact = lazy(() => import('./pages/Contact'));
const Events = lazy(() => import('./pages/Events'));
const Management = lazy(() => import('./pages/Management'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const ParentProfile = lazy(() => import('./pages/ParentProfile'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const HomeworkDetails = lazy(() => import('./pages/HomeworkDetails'));
const SubmitWork = lazy(() => import('./pages/SubmitWork'));
const ClassRegister = lazy(() => import('./pages/ClassRegister'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('./pages/PaymentCancel'));
const PaymentProofs = lazy(() => import('./pages/PaymentProofs'));
const AdminPaymentReview = lazy(() => import('./pages/AdminPaymentReview'));
const SwipeDemo = lazy(() => import('./components/SwipeDemo'));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <ErrorBoundary>
          <AuthProvider>
            <ErrorBoundary>
              <SubscriptionProvider>
                <ErrorBoundary>
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
                          <Route path="admin" element={
                            <PrivateRoute>
                              <AdminDashboard />
                            </PrivateRoute>
                          } />
                          <Route path="admin/payments" element={
                            <PrivateRoute>
                              <AdminPaymentReview />
                            </PrivateRoute>
                          } />
                          <Route path="teacher" element={
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
                        </Route>
                      </Routes>
                    </Suspense>
                      
                    {/* PWA Enhancements */}
                    <PWAEnhancements />
                    
                    {/* Google Auto Ads - Properly configured to avoid mobile header interference */}
                    <AutoAds 
                      enableAutoAds={true}
                      enablePageLevelAds={true}
                      enableAnchorAds={false}
                      enableVignetteAds={false}
                    />
                  </div>
                </ErrorBoundary>
              </SubscriptionProvider>
            </ErrorBoundary>
          </AuthProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App; 