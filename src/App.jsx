import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

import Children from './pages/Children';
import ParentProfile from './pages/ParentProfile';
import Classes from './pages/Classes';
import Homework from './pages/Homework';
import HomeworkDetails from './pages/HomeworkDetails';
import SubmitWork from './pages/SubmitWork';
import Events from './pages/Events';
import Notifications from './pages/Notifications';
import Management from './pages/Management';
import PaymentProofs from './pages/PaymentProofs';
import Settings from './pages/Settings';
import Activities from './pages/Activities';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import PrivateRoute from './components/PrivateRoute';
import { useAuth } from './contexts/AuthContext';



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
            <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
              
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
            <Route path="settings" element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            } />
            <Route path="register" element={
              <PrivateRoute>
                <Register />
              </PrivateRoute>
            } />
            <Route path="checkout" element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            } />
          </Route>
          </Routes>
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App; 