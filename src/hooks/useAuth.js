import { useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

const useAuth = () => {
  const [auth, setAuth] = useState(authService.getAuthState());

  useEffect(() => {
    // Subscribe to auth changes
    const unsubscribe = authService.subscribe((newAuthState) => {
      console.log('🔄 useAuth hook received auth state update:', {
        isAuthenticated: newAuthState.isAuthenticated,
        userEmail: newAuthState.user?.email,
      });
      setAuth({
        accessToken: newAuthState.accessToken,
        user: newAuthState.user,
        role: newAuthState.user?.role,
      });
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = useCallback(async (emailOrUserData, password, role = 'parent') => {
    try {
      return await authService.login(emailOrUserData, password, role);
    } catch (error) {
      console.error('Login failed in useAuth:', error);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed in useAuth:', error);
      // Still clear auth state on frontend even if API call fails
      authService.clearAuthData();
    }
  }, []);

  const verifyAuth = useCallback(async () => {
    console.log('🔎 Verifying auth token in useAuth...');
    try {
      await authService.verifyToken();
      console.log('✅ Token verification successful in useAuth.');
    } catch (error) {
      console.error('Auth verification failed in useAuth, logging out:', error);
      await logout();
    }
  }, [logout]);

  return {
    auth,
    login,
    logout,
    verifyAuth,
    isAuthenticated: !!auth && !!auth.accessToken,
    isTeacher: auth?.role === 'teacher',
    isAdmin: auth?.role === 'admin',
    isParent: auth?.role === 'parent',
    user: auth?.user,
    accessToken: auth?.accessToken,
    role: auth?.role,
    getCurrentUser: useCallback(() => authService.getCurrentUser(), []),
    getAccessToken: useCallback(() => authService.getToken(), []),
    hasRole: useCallback((role) => authService.hasRole(role), []),
    updateProfile: useCallback((userData) => authService.updateProfile(userData), [])
  };
};

export default useAuth;

