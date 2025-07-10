import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaMoon, FaSun, FaSpinner, FaEnvelope, FaPhone, FaUserTag } from 'react-icons/fa';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    userType: 'parent'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      nativeNotificationService.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      nativeNotificationService.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      nativeNotificationService.error('Password must be at least 6 characters long');
      return;
    }
    
    try {
      setLoading(true);
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.userType
      });
      
      if (result.success) {
        nativeNotificationService.success('Account created successfully! Please sign in.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration error:', error);
      nativeNotificationService.error(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-all duration-500 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed xs:static top-2 right-2 xs:top-6 xs:right-6 p-2 xs:p-4 rounded-full transition-all duration-300 z-50 transform hover:scale-110 hover:rotate-12 w-10 h-10 xs:w-12 xs:h-12
          ${isDark 
            ? 'bg-gray-800/80 text-yellow-400 hover:bg-gray-700/80 border-2 border-gray-600 shadow-2xl backdrop-blur-sm' 
            : 'bg-white/80 text-blue-600 hover:bg-blue-50/80 border-2 border-blue-200 shadow-2xl backdrop-blur-sm'
        }`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      >
        {isDark ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
      </button>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className={`mx-auto h-24 w-24 rounded-2xl flex items-center justify-center mb-8 transform hover:scale-105 transition-all duration-300 ${
            isDark 
              ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl' 
              : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-2xl'
          }`}>
            <FaGraduationCap className="text-4xl" />
          </div>
          <h2 className={`text-4xl font-bold mb-2 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Join Young Eagles
          </h2>
          <p className={`text-lg font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Create your account to get started
          </p>
        </div>
        
        {/* Registration Form */}
        <div className={`rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 backdrop-blur-xl border-2 transition-all duration-500 ${
          isDark 
            ? 'bg-gray-800/30 border-gray-700/50' 
            : 'bg-white/70 border-white/50'
        }`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* User Type Selection */}
            <div>
              <label className={`block text-sm font-semibold mb-4 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                I am registering as:
              </label>
              <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 xs:gap-3 user-type-buttons">
                {['parent', 'teacher', 'admin'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: type }))}
                    className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 ${
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
            
            {/* Name Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaUser className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your full name"
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Email Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaEnvelope className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your email address"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Phone Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Phone Number (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaPhone className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your phone number"
                  disabled={loading}
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaLock className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-14 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Create a password (min. 6 characters)"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute inset-y-0 right-0 pr-5 flex items-center transition-colors duration-200 ${
                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaLock className={`text-lg ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-14 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Confirm your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute inset-y-0 right-0 pr-5 flex items-center transition-colors duration-200 ${
                    isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center items-center py-4 px-6 border-2 border-transparent text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl hover:-translate-y-1'
              }`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin text-xl mr-3" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            {/* Login Link */}
            <div className="text-center mt-6">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className={`font-semibold underline transition-colors duration-200 ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Sign in here
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
