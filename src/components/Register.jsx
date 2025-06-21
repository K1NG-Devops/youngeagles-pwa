import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';
import API_CONFIG from '../config/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', workAddress: '', password: '', confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/dashboard');
    }
  }, [navigate]);
  const validatePhoneNumber = (phone) => {
    // Basic phone validation (accepts formats like: 123-456-7890, (123) 456-7890, 123.456.7890, etc.)
    const phoneRegex = /^[\d\s\-+().]{10,15}$/;
    return phoneRegex.test(phone);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific field error when user starts typing again
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors('');
    setMessage('');
    setFieldErrors({});
    
    // Validate all fields
    const newFieldErrors = {};
    let hasErrors = false;
    
    if (formData.password !== formData.confirmPassword) {
      newFieldErrors.confirmPassword = 'Passwords do not match';
      hasErrors = true;
    }
    
    if (formData.password.length < 6) {
      newFieldErrors.password = 'Password must be at least 6 characters';
      hasErrors = true;
    }
    
    if (!validatePhoneNumber(formData.phone)) {
      newFieldErrors.phone = 'Please enter a valid phone number';
      hasErrors = true;
    }
    
    if (hasErrors) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(`${API_CONFIG.getApiUrl()}${API_CONFIG.ENDPOINTS.REGISTER}`, formData);

      localStorage.removeItem('accessToken');
      
      // login using the same credentials
      const loginRes = await axios.post(`${API_CONFIG.getApiUrl()}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        email: formData.email,
        password: formData.password
      });

      // Store credentials consistently
      localStorage.setItem('accessToken', loginRes.data.token);
      localStorage.setItem('parent_id', loginRes.data.user.id);
      localStorage.setItem('user', JSON.stringify(loginRes.data.user));
      
      setMessage('Registration successful! Redirecting to login...');
      setFormData({
        name: '', email: '', phone: '', address: '', workAddress: '', password: '', confirmPassword: ''
      });
      setErrors('');
      
      // Success message and redirect to login
      setTimeout(() => {
        // Show success dialog with PWA option
        const installApp = window.confirm('✅ Registration successful!\n\n📱 Would you like to install our mobile app for the best experience?');
        
        if (installApp) {
          // Show installation instructions without opening a new tab
          alert('📱 To install the app:\n\n1. Look for the "Install" or "Add to Home Screen" option in your browser\n2. Follow the prompts to add Young Eagles to your device\n3. Open the app from your home screen for the best experience');
        }
        
        // Navigate to login page
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      console.error(err); // Helpful for debugging
      
      // Handle specific error cases
      if (err.response?.status === 409 || (err.response?.data?.message && err.response.data.message.includes('email'))) {
        setFieldErrors(prev => ({ ...prev, email: 'Email already in use' }));
      } else if (err.response?.data?.errors) {
        // Process validation errors from the server
        const newFieldErrors = {};
        err.response.data.errors.forEach(error => {
          if (error.param && formData[error.param] !== undefined) {
            newFieldErrors[error.param] = error.msg;
          }
        });
        
        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        } else {
          const allErrors = err.response.data.errors.map(e => e.msg).join(', ');
          setErrors(allErrors);
        }
      } else {
        setErrors(err.response?.data?.message || 'Registration failed. Please try again.');
      }
      setMessage('');
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Registration</h1>
          <p className="text-gray-600">Create your parent account</p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name' },
              { name: 'email', label: 'Email Address', type: 'email' },
              { name: 'phone', label: 'Phone Number' },
              { name: 'address', label: 'Home Address' },
              { name: 'workAddress', label: 'Work Address' },
              { name: 'password', label: 'Password', type: 'password' },
              { name: 'confirmPassword', label: 'Confirm Password', type: 'password' },
            ].map(({ name, label, type = 'text' }) => (
              <div key={name} className="relative">
                <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
                <div className="relative">
                  {name === 'name' && <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
                  {name === 'email' && <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
                  {(name === 'password' || name === 'confirmPassword') && <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />}
                  <input
                    id={name}
                    type={type}
                    name={name}
                    value={formData[name]}
                    onChange={handleChange}
                    required={name !== 'workAddress'}
                    autoComplete={name === 'password' || name === 'confirmPassword' ? 'new-password' : name}
                    className={`w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors[name] ? 'border-red-500' : ''}`}
                    placeholder={name === "workAddress" ? "If applicable" : name === "phone" ? "e.g., 123-456-7890" : undefined}
                    pattern={name === 'phone' ? "[0-9\\s\\-+().]{10,15}" : undefined}
                  />
                  {fieldErrors[name] && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>
                  )}
                </div>
              </div>
            ))}

            <p className="text-sm text-center text-gray-600">
              By registering, you agree to our <a href="/terms" className="text-blue-600 hover:text-blue-500">Terms</a> and <a href="/privacy" className="text-blue-600 hover:text-blue-500">Privacy</a>.
            </p>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-all ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
              }`}
            >
              {loading ? <><FaSpinner className="animate-spin inline mr-2" /> Registering...</> : <><FaUserPlus className="inline mr-2" /> Register</>}
            </button>

            {/* Error/Success Messages */}
            {message && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm text-center">{message}</p>
              </div>
            )}
            {errors && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{errors}</p>
              </div>
            )}

            {/* Footer Links */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Role Navigation */}
        <div className="mt-6 bg-white rounded-xl shadow-lg p-4">
          <div className="flex justify-center space-x-4 text-sm">
            <Link to="/home" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
