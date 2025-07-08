import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import { toast } from 'react-toastify';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaBuilding, FaLock, FaEye, FaEyeSlash, FaGraduationCap, FaMoon, FaSun, FaSpinner } from 'react-icons/fa';
import apiService from '../services/apiService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    workAddress: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      return setErrors('Passwords do not match');
    }

    if (formData.password.length < 6) {
      return setErrors('Password must be at least 6 characters long');
    }

    setLoading(true);

    try {
      const res = await apiService.post('/api/auth/register', formData);

      localStorage.removeItem('accessToken');
      
      // Show success message
      toast.success('Registration successful!');
      setMessage('Registration successful! Please sign in.');
      setFormData({
        name: '', email: '', phone: '', address: '', workAddress: '', password: '', confirmPassword: ''
      });
      setErrors('');
      
      // Navigate to login after a short delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.errors) {
        const allErrors = err.response.data.errors.map(e => e.msg).join(', ');
        setErrors(allErrors);
      } else {
        setErrors(err.response?.data?.message || 'Registration failed');
      }
      setMessage('');
      toast.error('Registration failed. Please try again.');
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
            Parent Registration
          </h2>
          <p className={`text-lg font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Join the Young Eagles community
          </p>
        </div>
        
        {/* Registration Form */}
        <div className={`rounded-3xl shadow-2xl p-8 sm:p-10 space-y-8 backdrop-blur-xl border-2 transition-all duration-500 ${
          isDark 
            ? 'bg-gray-800/30 border-gray-700/50' 
            : 'bg-white/70 border-white/50'
        }`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Form Fields */}
            {[
              { name: 'name', label: 'Full Name', icon: FaUser },
              { name: 'email', label: 'Email Address', type: 'email', icon: FaEnvelope },
              { name: 'phone', label: 'Phone Number', icon: FaPhone },
              { name: 'address', label: 'Home Address', icon: FaHome },
              { name: 'workAddress', label: 'Work Address (Optional)', icon: FaBuilding }
            ].map(({ name, label, type = 'text', icon: Icon }) => (
              <div key={name}>
                <label className={`block text-sm font-semibold mb-3 ${
                  isDark ? 'text-gray-200' : 'text-gray-700'
                }`}>
                  {label}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <Icon className={`text-lg ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <input
                    id={name}
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={name !== 'workAddress'}
                    autoComplete={name}
                    className={`block w-full pl-14 pr-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                      isDark 
                        ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                        : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                    }`}
                    placeholder={name === 'workAddress' ? 'Enter work address if applicable' : `Enter your ${label.toLowerCase()}`}
                  />
                </div>
              </div>
            ))}

            {/* Password Field */}
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
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full pl-14 pr-14 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Create a password (min. 6 characters)"
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

            {/* Confirm Password Field */}
            <div>
              <label className={`block text-sm font-semibold mb-3 ${
                isDark ? 'text-gray-200' : 'text-gray-700'
              }`}>
                Confirm Password
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
                  onChange={handleChange}
                  className={`block w-full pl-14 pr-14 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-lg ${
                    isDark 
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 backdrop-blur-sm' 
                      : 'bg-white/50 border-gray-300 text-gray-900 placeholder-gray-500 backdrop-blur-sm'
                  }`}
                  placeholder="Confirm your password"
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

            {/* Terms */}
            <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              By registering, you agree to our{' '}
              <a href="/terms" className={`font-semibold underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className={`font-semibold underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Privacy Policy
              </a>
              .
            </p>

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
                'Create Parent Account'
              )}
            </button>

            {/* Messages */}
            {message && <p className="text-green-600 text-center font-medium">{message}</p>}
            {errors && <p className="text-red-600 text-center font-medium">{errors}</p>}

            {/* Login Link */}
            <div className="text-center mt-6">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Already have an account?{' '}
                <Link
                  to="/login"
                  className={`font-semibold underline transition-colors duration-200 ${
                    isDark 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Sign in here
                </Link>
              </p>
            </div>

            {/* Back to Home */}
            <div className="text-center">
              <Link
                to="/"
                className={`font-semibold underline transition-colors duration-200 ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-300' 
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
