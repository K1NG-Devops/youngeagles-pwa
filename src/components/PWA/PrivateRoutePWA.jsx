import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const PrivateRoutePWA = () => {
    const location = useLocation();
    const [authChecked, setAuthChecked] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [redirectPath, setRedirectPath] = useState(null);
    
    useEffect(() => {
        const validateAuth = () => {
            // SIMPLIFIED localStorage check with more lenient validation
            const accessToken = localStorage.getItem('accessToken');
            const role = localStorage.getItem('role');
            const storedUser = localStorage.getItem('user');
            
            // Detailed auth logging
            console.log('🔍 PrivateRoutePWA - SIMPLIFIED auth check:', {
                timestamp: new Date().toISOString(),
                currentPath: location.pathname,
                hasToken: !!accessToken,
                tokenLength: accessToken?.length,
                role,
                hasUser: !!storedUser,
            });
            
            // SIMPLIFIED validation: basic check for token existence
            // This is the minimum needed to consider a user logged in
            const authValid = !!accessToken;
            
            // Set authenticated state
            setIsAuthenticated(authValid);
            setUserRole(role || 'parent'); // Default to parent if no role found
            
            // Determine redirect path if not authenticated
            if (!authValid) {
                console.log('🚫 PrivateRoutePWA - Auth validation failed, preparing to redirect...');
                const loginPath = role === 'teacher' ? '/teacher-login' : 
                                  role === 'admin' ? '/admin-login' : 
                                  '/login';
                setRedirectPath(loginPath);
            }
            
            // Always set authChecked to true to prevent getting stuck
            setAuthChecked(true);
        };
        
        // Execute immediately without delay
        validateAuth();
        
        // Failsafe: If somehow we don't set authChecked, force it after 1 second
        const failsafeTimer = setTimeout(() => {
            if (!authChecked) {
                console.warn('⚠️ PrivateRoutePWA - Failsafe triggered: forcing authChecked=true');
                setAuthChecked(true);
            }
        }, 1000);
        
        return () => clearTimeout(failsafeTimer);
    }, [location.pathname, authChecked]);
    
    // Don't render anything while checking authentication
    if (!authChecked) {
        return <div style={{ padding: 20, textAlign: 'center' }}>
            <div>Verifying authentication...</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                If this message persists, try refreshing the page or clearing your browser cache.
            </div>
        </div>;
    }
    
    if (!isAuthenticated) {
        console.log('🚫 PrivateRoutePWA - Not authenticated, redirecting to:', redirectPath);
        return <Navigate to={redirectPath} replace />;
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
      '/student/homework',
    ];

    // Routes accessible by all authenticated users (parent, teacher, admin)
    const commonAuthenticatedRoutes = [
        '/messages',
        '/notifications',
    ];

    // Check if the current path requires admin access
    if (requiresAdmin.includes(location.pathname)) {
        if (userRole === 'admin') {
            console.log('✅ PrivateRoutePWA - Admin access granted for', location.pathname);
            return <Outlet />;
        } else {
            console.log('🚷 PrivateRoutePWA - Access denied for', location.pathname, 'with role:', userRole);
            if (userRole === 'teacher') {
              console.log('🔄 PrivateRoutePWA - Redirecting teacher to teacher dashboard');
              return <Navigate to='/teacher-dashboard' replace />;
            } else if (userRole === 'parent' || userRole === 'user') {
              console.log('🔄 PrivateRoutePWA - Redirecting parent/user to parent dashboard');
              return <Navigate to='/dashboard' replace />;
            } else {
              console.log('🔄 PrivateRoutePWA - Redirecting unknown role to unauthorized');
              return <Navigate to='/unauthorized' replace />;
            }
        }
    }

    // Check if the current path requires teacher or admin access
    if (requiresTeacherOrAdmin.includes(location.pathname)) {
        if (userRole === 'teacher' || userRole === 'admin') {
            console.log('✅ PrivateRoutePWA - Teacher/Admin access granted for', location.pathname);
            return <Outlet />;
        } else {
            console.log('🚷 PrivateRoutePWA - Access denied for', location.pathname, 'with role:', userRole);
            if (userRole === 'parent' || userRole === 'user') {
              console.log('🔄 PrivateRoutePWA - Redirecting parent/user to parent dashboard');
              return <Navigate to='/dashboard' replace />;
            } else {
              console.log('🔄 PrivateRoutePWA - Redirecting unknown role to unauthorized');
              return <Navigate to='/unauthorized' replace />;
            }
        }
    }

    // Check if the current path requires parent access
    if (requiresParent.includes(location.pathname)) {
      if (userRole === 'parent' || userRole === 'user') {
        console.log('✅ PrivateRoutePWA - Parent access granted for', location.pathname);
        return <Outlet />;
      } else {
        console.log('🚷 PrivateRoutePWA - Access denied for', location.pathname, 'with role:', userRole);
        if (userRole === 'teacher') {
          console.log('🔄 PrivateRoutePWA - Redirecting teacher to teacher dashboard');
          return <Navigate to='/teacher-dashboard' replace />;
        } else if (userRole === 'admin') {
          console.log('🔄 PrivateRoutePWA - Redirecting admin to admin dashboard');
          return <Navigate to='/admin-dashboard' replace />;
        } else {
          console.log('🔄 PrivateRoutePWA - Redirecting unknown role to unauthorized');
          return <Navigate to='/unauthorized' replace />;
        }
      }
    }

    // If it's a common authenticated route, allow access
    if (commonAuthenticatedRoutes.includes(location.pathname)) {
        console.log('✅ PrivateRoutePWA - Common authenticated access granted for', location.pathname);
        return <Outlet />;
    }
    
    // Check for root path redirections based on role
    if (location.pathname === '/' || location.pathname === '') {
        console.log('⚠️ PrivateRoutePWA - Root path detected, redirecting based on role:', userRole);
        if (userRole === 'teacher') {
            return <Navigate to='/teacher-dashboard' replace />;
        } else if (userRole === 'admin') {
            return <Navigate to='/admin-dashboard' replace />;
        } else if (userRole === 'parent' || userRole === 'user') {
            return <Navigate to='/dashboard' replace />;
        }
    }

    // If none of the specific role-based paths match, but user is logged in, allow access (for general private routes)
    console.log('✅ PrivateRoutePWA - General authenticated access granted for', location.pathname);
    
    // Debug route match status
    console.log('🔍 PrivateRoutePWA - Route match details:', {
        path: location.pathname,
        isAdminRoute: requiresAdmin.includes(location.pathname),
        isTeacherRoute: requiresTeacherOrAdmin.includes(location.pathname),
        isParentRoute: requiresParent.includes(location.pathname),
        isCommonRoute: commonAuthenticatedRoutes.includes(location.pathname),
        role: userRole
    });
    
    return <Outlet />;
};

export default PrivateRoutePWA;
