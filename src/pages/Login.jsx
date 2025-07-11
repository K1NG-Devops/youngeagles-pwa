import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { FaEye, FaEyeSlash, FaGraduationCap, FaMoon, FaSun, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'parent'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  
  const { login, loading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Check for token expiration or invalid token messages
  useEffect(() => {
    const expired = searchParams.get('expired');
    const invalid = searchParams.get('invalid');
    
    if (expired === 'true') {
      nativeNotificationService.warning('Your session has expired. Please sign in again.');
    } else if (invalid === 'true') {
      nativeNotificationService.error('Invalid authentication token. Please sign in again.');
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      nativeNotificationService.error('Please fill in all fields');
      return;
    }
    
    try {
      const result = await login({
        username: formData.email,
        password: formData.password
      }, formData.userType);
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      nativeNotificationService.error(error.message || 'Failed to login. Please try again.');
    }
  };

  return (
    <div className={`w-full min-h-screen bg-gradient-to-br ${
      isDark 
        ? 'from-gray-900 via-blue-900 to-purple-900' 
        : 'from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      
      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-2 right-2 sm:top-4 sm:right-4 z-50 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-lg ${
          isDark 
            ? 'bg-yellow-500 hover:bg-yellow-400 text-yellow-900' 
            : 'bg-gray-800 hover:bg-gray-700 text-yellow-300'
        }`}
      >
        {isDark ? <FaSun className="text-sm sm:text-lg" /> : <FaMoon className="text-sm sm:text-lg" />}
      </button>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-32 h-32 sm:w-72 sm:h-72 rounded-full opacity-10 sm:opacity-20 blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-96 sm:h-96 rounded-full opacity-10 sm:opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
      </div>



      {/* Main Grid Layout - Split screen vertically */}
      <div className="min-h-screen grid grid-rows-[minmax(auto,1fr)_minmax(auto,0.5fr)_auto] sm:grid-rows-[auto_1fr_auto] relative z-10 pt-4 sm:pt-24 pb-2 sm:pb-4 gap-2 sm:gap-0">
        
        {/* Upper Half - Login Form */}
        <div className="flex flex-col justify-center items-center px-2 sm:px-4 py-2 sm:py-6">
          <div className="w-full max-w-xs sm:max-w-sm md:max-w-2xl mx-1 sm:mx-4">
            {/* Header */}
            <div className="text-center mb-3 sm:mb-8">
              <div className={`mx-auto h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-4 transform hover:scale-105 transition-all duration-300 ${
                isDark 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl' 
                  : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-xl'
              }`}>
                <FaGraduationCap className="text-lg sm:text-2xl" />
              </div>
              <h2 className={`text-lg sm:text-2xl font-bold mb-1 sm:mb-2 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                Young Eagles PWA
              </h2>
              <p className={`text-xs sm:text-sm font-medium ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Welcome back! Sign in to continue
              </p>
            </div>
            
            {/* Login Form */}
            <form className="space-y-2 sm:space-y-4" onSubmit={handleSubmit}>
              {/* User Type Selection */}
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1 sm:mb-3 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  I am signing in as:
                </label>
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
                  {['parent', 'teacher', 'admin'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                      className={`px-1 sm:px-3 py-2 sm:py-2 text-xs sm:text-sm font-semibold rounded-md sm:rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 min-h-[40px] sm:min-h-[44px] ${
                        formData.userType === type
                          ? isDark
                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : isDark
                            ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border-2 border-gray-600'
                            : 'bg-gray-100/50 text-gray-600 hover:bg-gray-200/50 border-2 border-gray-200'
                      }`}
                      disabled={loading}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Email Input */}
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`block w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-h-[40px] sm:min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div>
                <label className={`block text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`block w-full pl-3 sm:pl-4 pr-12 py-2 sm:py-3 text-sm sm:text-base border-2 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 min-h-[40px] sm:min-h-[44px] ${
                      isDark 
                        ? 'bg-gray-700/70 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                    placeholder="Enter your password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center transition-colors duration-200 min-w-[44px] ${
                      isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center py-2 sm:py-3 px-4 sm:px-6 border-2 border-transparent text-sm sm:text-base font-bold rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg min-h-[40px] sm:min-h-[44px] active:scale-95 ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Signing you in...
                  </>
                ) : (
                  'Sign In to Dashboard'
                )}
              </button>
              
              {/* Registration Link */}
              <div className="text-center mt-2 sm:mt-4">
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className={`font-semibold underline transition-colors duration-200 ${
                      isDark 
                        ? 'text-blue-400 hover:text-blue-300' 
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    Sign up here
                  </button>
                </p>
              </div>

            </form>
          </div>
        </div>
        
        {/* Lower Half - Welcome Message & Features */}
        <div className="flex flex-col justify-center items-center px-2 sm:px-4 py-2 sm:py-6">
          <div className={`w-full max-w-xs sm:max-w-sm md:max-w-2xl mx-1 sm:mx-4 p-3 sm:p-6 rounded-xl sm:rounded-2xl border-2 backdrop-blur-sm text-center ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/50' 
              : 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50'
          }`}>
            <div className="text-center mb-2 sm:mb-4">
              <h3 className={`text-sm sm:text-xl font-bold mb-1 sm:mb-2 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                🚀 Welcome to Young Eagles
              </h3>
              <p className={`text-xs sm:text-sm ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your comprehensive education management platform
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-1 sm:gap-3 mb-2 sm:mb-4">
              {[
                { icon: '📱', text: 'Mobile Optimized' },
                { icon: '🔒', text: 'Secure Platform' },
                { icon: '⚡', text: 'Real-time Updates' },
                { icon: '🌐', text: 'Offline Access' }
              ].map((feature, index) => (
                <div key={index} className={`flex flex-col items-center space-y-1 p-1 sm:p-3 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
                  isDark ? 'bg-gray-700/30 hover:bg-gray-600/30' : 'bg-white/30 hover:bg-white/50'
                }`}>
                  <span className="text-base sm:text-2xl">{feature.icon}</span>
                  <span className={`text-xs font-medium text-center leading-tight ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
            
            <div className={`pt-2 sm:pt-4 border-t text-center ${
              isDark ? 'border-gray-600/50' : 'border-blue-200/50'
            }`}>
              <p className={`text-xs font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                💡 Need help? Contact your school administrator
              </p>
            </div>
          </div>
        </div>
        
        {/* Remove the ad space section completely */}
        
      </div>
    </div>
  );
};

export default Login;