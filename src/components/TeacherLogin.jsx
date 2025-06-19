import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSpinner, FaChalkboardTeacher } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const TeacherLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔐 Teacher login form submitted');
    console.log('📧 Email:', formData.email);
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // Always use real API call
      console.log('🚀 Making API call for teacher login');
      console.log('📡 Calling login function with role: teacher');
      
      await login(formData.email, formData.password, 'teacher');
      
      console.log('✅ Teacher login successful!');
      toast.success('Login successful!');
      navigate('/teacher-dashboard');
    } catch (error) {
      console.error('❌ Teacher login error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaChalkboardTeacher className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teacher Login</h1>
          <p className="text-gray-600">Sign in to manage your class</p>
        </div>

        {/* Development Mode Notice */}
        {import.meta.env.DEV && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-xs text-blue-800 text-center">
              <strong>Development Mode:</strong> Using real API - need valid teacher credentials
            </p>
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-4 focus:ring-green-200'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaSpinner className="animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <Link
              to="/password-reset"
              className="text-sm text-green-600 hover:text-green-700"
            >
              Forgot your password?
            </Link>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>Not a teacher?</span>
              <Link to="/login" className="text-blue-600 hover:text-blue-700">
                Parent Login
              </Link>
              <span>•</span>
              <Link to="/admin-login" className="text-purple-600 hover:text-purple-700">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherLogin;
