import { useState } from 'react';
import authService from '../services/authService.js';

const useAuth = () => {
  const [auth, setAuth] = useState(() => {
    // Initialize from authService
    if (authService.isLoggedIn()) {
      const initialAuth = {
        accessToken: authService.getToken(),
        user: authService.getCurrentUser(),
        role: authService.getUserRole()
      };
      return initialAuth;
    }
    return null;
  });

  const login = async (emailOrUserData, password, role = 'parent') => {
    try {
      let result;
      if (typeof emailOrUserData === 'string') {
        // Called with email, password, role
        result = await authService.login(emailOrUserData, password, role);
      } else {
        // Called with userData object (legacy support)
        const userData = emailOrUserData;
        result = authService.handleLoginSuccess(userData);
      }
      setAuth({
        accessToken: result.accessToken || result.token,
        user: result.user,
        role: result.role
      });
      return result;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setAuth(null);
    } catch (error) {
      console.error('Logout failed:', error);
      setAuth(null);
    }
  };

  return {
    auth,
    login,
    logout,
    isAuthenticated: !!auth && !!auth.accessToken,
    isTeacher: auth?.role === 'teacher',
    isAdmin: auth?.role === 'admin',
    isParent: auth?.role === 'parent',
    user: auth?.user,
    accessToken: auth?.accessToken,
    role: auth?.role,
    getCurrentUser: () => authService.getCurrentUser(),
    getAccessToken: () => authService.getToken(),
    hasRole: (role) => authService.hasRole(role),
    updateProfile: (userData) => authService.updateProfile(userData)
  };
};

export default useAuth;

