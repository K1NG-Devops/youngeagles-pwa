import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaCheck, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import useAuth from '../hooks/useAuth';

const PasswordReset = () => {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    setPasswordRequirements(requirements);
    return Object.values(requirements).every(req => req);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'newPassword') {
      validatePassword(value);
    }
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('All fields are required');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (!validatePassword(formData.newPassword)) {
      toast.error('New password does not meet security requirements');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password changed successfully!');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
      });
    } catch (error) {
      console.error('Password change error:', error);
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const RequirementItem = ({ met, text }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <FaCheck size={12} /> : <FaTimes size={12} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FaLock className="text-blue-500 text-2xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
        <p className="text-gray-600 mt-2">Update your account password securely</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.current ? 'text' : 'password'}
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your current password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.new ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your new password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>

        {/* Password Requirements */}
        {formData.newPassword && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
            <div className="space-y-1">
              <RequirementItem 
                met={passwordRequirements.length} 
                text="At least 8 characters long" 
              />
              <RequirementItem 
                met={passwordRequirements.uppercase} 
                text="Contains uppercase letter (A-Z)" 
              />
              <RequirementItem 
                met={passwordRequirements.lowercase} 
                text="Contains lowercase letter (a-z)" 
              />
              <RequirementItem 
                met={passwordRequirements.number} 
                text="Contains number (0-9)" 
              />
              <RequirementItem 
                met={passwordRequirements.special} 
                text="Contains special character (!@#$%^&*)" 
              />
            </div>
          </div>
        )}

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showPasswords.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your new password"
              required
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !Object.values(passwordRequirements).every(req => req) || formData.newPassword !== formData.confirmPassword}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Changing Password...
            </>
          ) : (
            <>
              <FaLock />
              Change Password
            </>
          )}
        </button>
      </form>

      {/* Security Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Security Tips:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Use a unique password you haven't used elsewhere</li>
          <li>• Consider using a password manager</li>
          <li>• Don't share your password with anyone</li>
          <li>• Change your password regularly</li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordReset;
