import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const AutoLogout = ({ children }) => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  
  // Auto logout after 30 minutes of inactivity
  const LOGOUT_TIME = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 25 * 60 * 1000; // 25 minutes (5 min warning)

  const handleAutoLogout = useCallback(async () => {
    try {
      await logout();
      toast.error('You have been logged out due to inactivity', {
        position: 'top-center'
      });
      navigate('/login');
    } catch (error) {
      console.error('Auto logout error:', error);
    }
  }, [logout, navigate]);

  const resetTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    if (isAuthenticated) {
      // Set warning timeout
      warningTimeoutRef.current = setTimeout(() => {
        toast.warning('You will be logged out in 5 minutes due to inactivity', {
          position: 'top-center',
          autoClose: 10000
        });
      }, WARNING_TIME);

      // Set logout timeout
      timeoutRef.current = setTimeout(() => {
        handleAutoLogout();
      }, LOGOUT_TIME);
    }
  }, [isAuthenticated, WARNING_TIME, LOGOUT_TIME, handleAutoLogout]);


  useEffect(() => {
    if (isAuthenticated) {
      resetTimeout();

      // Reset timeout on user activity
      const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
      
      const resetTimeoutHandler = () => {
        resetTimeout();
      };

      events.forEach(event => {
        document.addEventListener(event, resetTimeoutHandler, true);
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, resetTimeoutHandler, true);
        });
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (warningTimeoutRef.current) {
          clearTimeout(warningTimeoutRef.current);
        }
      };
    }
  }, [isAuthenticated, resetTimeout]);

  return children;
};

export default AutoLogout;
