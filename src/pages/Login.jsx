import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaMoon, FaSun, FaSpinner } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    userType: 'parent'
  });
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading } = useAuth();
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
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
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
      toast.error(error.message || 'Failed to login. Please try again.');
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
        className={`fixed top-6 right-6 p-4 rounded-full transition-all duration-300 z-50 transform hover:scale-110 hover:rotate-12 ${
          isDark 
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
            Young Eagles PWA
          </h2>
          <p className={`text-lg font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Welcome back! Sign in to continue
          </p>
        </div>
        
        {/* Login Form */}
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
                I am signing in as:
              </label>
              <div className="grid grid-cols-3 gap-3">
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
            
            {/* Email Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FaUser className={`text-lg ${
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
            
            {/* Password Input */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Password
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
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`block w-full pl-14 pr-14 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Enter your password"
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
                  Signing you in...
                </>
              ) : (
                'Sign In to Dashboard'
              )}
            </button>
            
            {/* Registration Link */}
            <div className="text-center mt-6">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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

          {/* Welcome Message & Features */}
          <div className={`mt-8 p-6 rounded-2xl border-2 backdrop-blur-sm ${
            isDark 
              ? 'bg-gradient-to-br from-gray-800/50 to-gray-700/50 border-gray-600/50' 
              : 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-blue-200/50'
          }`}>
            <div className="text-center mb-6">
              <h3 className={`text-xl font-bold mb-3 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                🚀 Welcome to Young Eagles
              </h3>
              <p className={`text-base ${
                isDark ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Your comprehensive education management platform
              </p>
            </div>
                
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '📱', text: 'Mobile Optimized' },
                { icon: '🔒', text: 'Secure Platform' },
                { icon: '⚡', text: 'Real-time Updates' },
                { icon: '🌐', text: 'Offline Access' }
              ].map((feature, index) => (
                <div key={index} className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 hover:scale-105 ${
                  isDark ? 'bg-gray-700/30 hover:bg-gray-600/30' : 'bg-white/30 hover:bg-white/50'
                }`}>
                  <span className="text-2xl">{feature.icon}</span>
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
                
            <div className={`mt-6 pt-6 border-t text-center ${
              isDark ? 'border-gray-600/50' : 'border-blue-200/50'
            }`}>
              <p className={`text-sm font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}>
                💡 Need help? Contact your school administrator
              </p>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;