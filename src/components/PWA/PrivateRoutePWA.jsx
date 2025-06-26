import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const PrivateRoutePWA = () => {
  const { isAuthenticated, auth } = useAuth();
  const location = useLocation();

  // Wait until the auth state is definitively known
  if (auth === undefined || auth === null && !localStorage.getItem('accessToken')) {
    // You can return a loading spinner here if you have one
    console.log('🚧 PrivateRoutePWA: Auth state pending, waiting...');
    return <div>Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    console.log(`🚫 PrivateRoutePWA: Access denied for ${location.pathname}. Redirecting to /login.`);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
};

export default PrivateRoutePWA;
