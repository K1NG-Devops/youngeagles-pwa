import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoutePWA = () => {
    const location = useLocation();
    
    // Simple localStorage-based authentication like the full website
    const accessToken = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    const storedUser = localStorage.getItem('user');
    
    console.log('🛡️ PrivateRoutePWA - Simple auth check:', {
        currentPath: location.pathname,
        hasAccessToken: !!accessToken,
        role: role,
        hasStoredUser: !!storedUser
    });
    
    // Simple validation: must have token and user data
    const isAuthenticated = !!(accessToken && storedUser);
    
    // Get user role from localStorage
    const userRole = role;
    
    if (!isAuthenticated) {
        console.log('🚫 PrivateRoutePWA - Not authenticated, redirecting to login...');
        // Determine the appropriate login page based on stored role
        const loginPath = role === 'teacher' ? '/teacher-login' : 
                          role === 'admin' ? '/admin-login' : 
                          '/login';
        return <Navigate to={loginPath} replace />;
    }

    // Define routes and their required roles for PWA
    const requiresAdmin = ['/admin-dashboard'];
    const requiresTeacherOrAdmin = [
      '/teacher-dashboard',
      '/teacher/homework-list',
      '/homework/upload',
      '/teacher-submissions',
      '/teacher-attendance',
      '/teacher-reports',
      '/teacher-children-list',
      '/teacher-dashboard/activity-builder'
    ];
    const requiresParent = [
      '/dashboard',
      '/homework',
      '/submit-work',
    ];

    // Routes accessible by all authenticated users (parent, teacher, admin)
    const commonAuthenticatedRoutes = [
        '/messages',
        '/notifications',
    ];

    // Check if the current path requires admin access
    if (requiresAdmin.includes(location.pathname)) {
        if (userRole === 'admin') {
            console.log('PrivateRoutePWA - Admin access granted for', location.pathname);
            return <Outlet />;
        } else {
            console.log('PrivateRoutePWA - Access denied for', location.pathname, ', redirecting non-admin.');
            if (userRole === 'teacher') {
              return <Navigate to='/teacher-dashboard' replace />;
            } else if (userRole === 'parent' || userRole === 'user') {
              return <Navigate to='/dashboard' replace />;
            } else {
              return <Navigate to='/unauthorized' replace />;
            }
        }
    }

    // Check if the current path requires teacher or admin access
    if (requiresTeacherOrAdmin.includes(location.pathname)) {
        if (userRole === 'teacher' || userRole === 'admin') {
            console.log('PrivateRoutePWA - Teacher/Admin access granted for', location.pathname);
            return <Outlet />;
        } else {
            console.log('PrivateRoutePWA - Access denied for', location.pathname, ', redirecting non-teacher/non-admin.');
            if (userRole === 'parent' || userRole === 'user') {
              return <Navigate to='/dashboard' replace />;
            } else {
              return <Navigate to='/unauthorized' replace />;
            }
        }
    }

    // Check if the current path requires parent access
    if (requiresParent.includes(location.pathname)) {
      if (userRole === 'parent' || userRole === 'user') {
        console.log('PrivateRoutePWA - Parent access granted for', location.pathname);
        return <Outlet />;
      } else {
        console.log('PrivateRoutePWA - Access denied for', location.pathname, ', redirecting non-parent.');
        if (userRole === 'teacher') {
          return <Navigate to='/teacher-dashboard' replace />;
        } else if (userRole === 'admin') {
          return <Navigate to='/admin-dashboard' replace />;
        } else {
          return <Navigate to='/unauthorized' replace />;
        }
      }
    }

    // If it's a common authenticated route, allow access
    if (commonAuthenticatedRoutes.includes(location.pathname)) {
        console.log('PrivateRoutePWA - Common authenticated access granted for', location.pathname);
        return <Outlet />;
    }

    // If none of the specific role-based paths match, but user is logged in, allow access (for general private routes)
    console.log('PrivateRoutePWA - General authenticated access granted for', location.pathname);
    return <Outlet />;
};

export default PrivateRoutePWA;
