import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { toast } from 'react-toastify';
import GoogleSignIn from './GoogleSignIn';

const Login = () => {
  const { login } = useAuth(); 
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  // Dedicated function to handle dashboard redirection using React Router
  const redirectToDashboard = () => {
    console.log('🚀 Redirecting to dashboard using React Router navigation...');
    console.log('📍 Current location before redirect:', window.location.href);
    
    // Verify localStorage has auth data before navigation
    const accessToken = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    const parentId = localStorage.getItem('parent_id');
    
    console.log('🔍 Verifying localStorage before navigation:', { 
      hasToken: !!accessToken, 
      hasUser: !!user, 
      hasRole: !!role,
      hasParentId: !!parentId
    });
    
    if (accessToken && user && role) {
      console.log('✅ Auth data verified in localStorage, proceeding with navigation');
      // Use React Router navigation with replace to prevent back button issues
      navigate('/dashboard', { replace: true });
    } else {
      console.error('❌ Missing auth data in localStorage before navigation!', {
        accessToken: !!accessToken,
        user: !!user,
        role: !!role,
        parentId: !!parentId
      });
      // Try again with a small delay as a fallback
      setTimeout(() => {
        console.log('⚠️ Attempting navigation with delay as fallback');
        navigate('/dashboard', { replace: true });
      }, 500);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 Parent login form submitted');
    console.log('📧 Email:', email);
    console.log('🔍 Starting login process...');
    
    setIsLoading(true);

    try {
      // Always use real API call
      console.log('🚀 Making API call for parent login');
      console.log('📡 Calling login function with role: parent');
      
      // Clear any previous errors
      setErrorMessage('');
      
      const result = await login(email, password, 'parent');
      
      console.log('✅ Parent login successful!');
      console.log('👤 User data:', result?.user);
      console.log('🔑 Auth state:', { isAuthenticated: true, role: result?.role });
      
      // Log localStorage state immediately after login
      console.log('📦 Checking localStorage after login:', {
        accessToken: !!localStorage.getItem('accessToken'),
        user: !!localStorage.getItem('user'),
        role: localStorage.getItem('role'),
        parentId: !!localStorage.getItem('parent_id')
      });
      
      setSuccessMessage('Login successful!');
      toast.success('Login successful!');
      
      // Manually ensure critical auth data is in localStorage as a safeguard
      if (result?.token && result?.user && result?.role) {
        console.log('🔒 Ensuring auth data is set in localStorage');
        if (!localStorage.getItem('accessToken')) {
          console.log('⚠️ Setting accessToken in localStorage as fallback');
          localStorage.setItem('accessToken', result.token);
        }
        if (!localStorage.getItem('user')) {
          console.log('⚠️ Setting user in localStorage as fallback');
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        if (!localStorage.getItem('role')) {
          console.log('⚠️ Setting role in localStorage as fallback');
          localStorage.setItem('role', result.role);
        }
        if (result.parent_id && !localStorage.getItem('parent_id')) {
          console.log('⚠️ Setting parent_id in localStorage as fallback');
          localStorage.setItem('parent_id', result.parent_id);
        }
      }
      
      // Navigate immediately without timeout
      console.log('🚪 Calling redirectToDashboard immediately after login');
      redirectToDashboard();
    } catch (error) {
      console.error('❌ Parent login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMsg = error.response?.data?.message || error.message || 'Invalid email or password.';
      setErrorMessage(errorMsg);
      setSuccessMessage('');
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 relative safe-area-inset">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <img
            src="/yehc_logo.png"
            alt="Young Eagles"
            className="h-4 w-4 mx-auto mb-4 rounded-full object-cover shadow-lg"
          />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your parent account</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Google Sign-In */}
          <div className="mb-6">
            <GoogleSignIn />
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.5 8.5m1.378 1.378l4.242 4.242M12 3c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21l-6.132-6.132" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              <Link
                to="/password-reset"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Error/Success Messages */}
          {errorMessage && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{errorMessage}</p>
            </div>
          )}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm text-center">{successMessage}</p>
            </div>
          )}

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
                Sign up here
              </Link>
            </p>
          </div>
        </div>

        {/* Role Navigation */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <p className="text-center text-sm text-gray-600 mb-3">Sign in as:</p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/teacher-login" className="text-blue-600 hover:text-blue-500 font-medium">
              Teacher
            </Link>
            <span className="text-gray-300">•</span>
            <Link to="/admin-login" className="text-blue-600 hover:text-blue-500 font-medium">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

