import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserShield, FaSpinner, FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setIsLoading(true);
    try {
      await login(formData.email, formData.password, 'admin');
      toast.success('Login successful!');
      navigate('/admin-dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaUserShield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">Administrative access only</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your admin email"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your admin password"
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
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700 focus:ring-4 focus:ring-purple-200'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaSpinner className="animate-spin" />
                  <span>Signing in...</span>
                </div>
              ) : (
                'Admin Sign In'
              )}
            </button>
          </form>
          <div className="mt-6 text-center space-y-2">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <span>Not an admin?</span>
              <Link to="/login" className="text-blue-600 hover:text-blue-700">Parent Login</Link>
              <span>•</span>
              <Link to="/teacher-login" className="text-green-600 hover:text-green-700">Teacher Login</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
