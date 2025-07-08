import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import { useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import SubscriptionExpiredModal from './components/SubscriptionExpiredModal';
import AdSenseScript from './components/AdSenseScript';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load components for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Children = React.lazy(() => import('./pages/Children'));
const ParentProfile = React.lazy(() => import('./pages/ParentProfile'));
const Classes = React.lazy(() => import('./pages/Classes'));
const Homework = React.lazy(() => import('./pages/Homework'));
const HomeworkDetails = React.lazy(() => import('./pages/HomeworkDetails'));
const SubmitWork = React.lazy(() => import('./pages/SubmitWork'));
const Events = React.lazy(() => import('./pages/Events'));
const Notifications = React.lazy(() => import('./pages/Notifications'));
const Management = React.lazy(() => import('./pages/Management'));
const PaymentProofs = React.lazy(() => import('./pages/PaymentProofs'));
const AdminPaymentReview = React.lazy(() => import('./pages/AdminPaymentReview'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Activities = React.lazy(() => import('./pages/Activities'));
const Register = React.lazy(() => import('./pages/Register'));
const ClassRegister = React.lazy(() => import('./pages/ClassRegister'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const PaymentSuccess = React.lazy(() => import('./pages/PaymentSuccess'));
const PaymentCancel = React.lazy(() => import('./pages/PaymentCancel'));
const CuratedLessonLibrary = React.lazy(() => import('./components/CuratedLessonLibrary'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const Contact = React.lazy(() => import('./pages/Contact'));



function App() {
  // Component to route to correct children page based on user role
  const ChildrenRoute = () => {
    const { user } = useAuth();
    
    if (user?.role === 'parent') {
      return <ParentProfile />;
    }
    
    return <Children />;
  };
  return (
    <ThemeProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="app scroll-smooth scrollbar-no-scrollbar">
            <AdSenseScript />
            <SubscriptionExpiredModal />
            <Suspense fallback={<LoadingSpinner text="Loading page..." />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                
                  {/* Legal and Contact Pages */}
                  <Route path="privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="terms-of-service" element={<TermsOfService />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="about" element={<Contact />} />
                  <Route path="help" element={<Contact />} />

                  {/* Private Routes */}
                  <Route path="dashboard" element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } />
                  <Route path="children" element={
                    <PrivateRoute>
                      <ChildrenRoute />
                    </PrivateRoute>
                  } />
                  <Route path="classes" element={
                    <PrivateRoute>
                      <Classes />
                    </PrivateRoute>
                  } />
                  <Route path="classes/:classId/children" element={
                    <PrivateRoute>
                      <Children />
                    </PrivateRoute>
                  } />
                  <Route path="classes/:classId/details" element={
                    <PrivateRoute>
                      <Classes />
                    </PrivateRoute>
                  } />
                  <Route path="homework" element={
                    <PrivateRoute>
                      <Homework />
                    </PrivateRoute>
                  } />
                  <Route path="homework/:homeworkId/details" element={
                    <PrivateRoute>
                      <HomeworkDetails />
                    </PrivateRoute>
                  } />
                  <Route path="events" element={
                    <PrivateRoute>
                      <Events />
                    </PrivateRoute>
                  } />
                  <Route path="activities" element={
                    <PrivateRoute>
                      <Activities />
                    </PrivateRoute>
                  } />
                  <Route path="notifications" element={
                    <PrivateRoute>
                      <Notifications />
                    </PrivateRoute>
                  } />
                  <Route path="submit-work" element={
                    <PrivateRoute>
                      <SubmitWork />
                    </PrivateRoute>
                  } />
                  <Route path="management" element={
                    <PrivateRoute>
                      <Management />
                    </PrivateRoute>
                  } />
                  <Route path="manage" element={
                    <PrivateRoute>
                      <Management />
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
                  <Route path="settings" element={
                    <PrivateRoute>
                      <Settings />
                    </PrivateRoute>
                  } />
                  <Route path="curated-lessons" element={
                    <PrivateRoute>
                      <CuratedLessonLibrary />
                    </PrivateRoute>
                  } />
                  <Route path="class-register" element={
                    <PrivateRoute>
                      <ClassRegister />
                    </PrivateRoute>
                  } />
                  <Route path="register" element={<Register />} />
                  <Route path="checkout" element={
                    <PrivateRoute>
                      <Checkout />
                    </PrivateRoute>
                  } />
            
                  {/* Payment Routes - These need to be accessible even if not fully authenticated */}
                  <Route path="payment/success" element={
                    <PrivateRoute>
                      <PaymentSuccess />
                    </PrivateRoute>
                  } />
                  <Route path="payment/cancel" element={
                    <PrivateRoute>
                      <PaymentCancel />
                    </PrivateRoute>
                  } />
                </Route>
              </Routes>
            </Suspense>
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 