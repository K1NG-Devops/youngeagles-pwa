import React, { useState, useEffect, useCallback } from 'react';
import AdminService from '../../services/adminService';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaEnvelope, FaPhone, FaUserTie, FaUserFriends, FaSpinner, FaEye, FaEyeSlash } from 'react-icons/fa';

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'parent',
    password: '',
    confirmPassword: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Optimized input handlers with useCallback to prevent focus loss
  const handleNewUserChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setNewUser(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formErrors]);

  const handleSelectedUserChange = useCallback((field) => (e) => {
    const value = e.target.value;
    setSelectedUser(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear field-specific errors when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  }, [formErrors]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const toggleShowPassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const toggleShowConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleModalClose = useCallback(() => {
    if (isSubmitting) return; // Don't close if submitting
    
    setShowCreateModal(false);
    setShowEditModal(false);
    setFormErrors({});
    setSelectedUser(null);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'parent',
      password: '',
      confirmPassword: ''
    });
  }, [isSubmitting]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await AdminService.getUsers(currentPage, 20, searchTerm);
      setUsers(response.data || []);
      setPagination(response.pagination || {});
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (userData, isCreate = false) => {
    const errors = {};
    
    if (!userData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (isCreate) {
      if (!userData.password) {
        errors.password = 'Password is required';
      } else {
        // Match backend password requirements exactly
        const password = userData.password;
        
        if (password.length < 8) {
          errors.password = 'Password must be at least 8 characters long';
        } else if (!/[A-Z]/.test(password)) {
          errors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[a-z]/.test(password)) {
          errors.password = 'Password must contain at least one lowercase letter';
        } else if (!/\d/.test(password)) {
          errors.password = 'Password must contain at least one number';
        } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
          errors.password = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
        }
      }
      
      if (!userData.confirmPassword) {
        errors.confirmPassword = 'Please confirm your password';
      } else if (userData.password !== userData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    if (userData.phone && !/^\d{10,15}$/.test(userData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10-15 digits';
    }
    
    return errors;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    const errors = validateForm(newUser, true);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await AdminService.createUser({
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        password: newUser.password
      });
      
      setShowCreateModal(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'parent',
        password: '',
        confirmPassword: ''
      });
      setFormErrors({});
      fetchUsers();
      
      // Show success message
      const successMessage = `${newUser.role.charAt(0).toUpperCase() + newUser.role.slice(1)} "${newUser.name}" created successfully!`;
      alert(successMessage);
      
    } catch (err) {
      console.error('Create user error:', err);
      
      // Provide specific error messages based on the error type
      let errorMessage = 'Failed to create user. Please try again.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 409) {
        errorMessage = 'A user with this email address already exists. Please use a different email.';
      } else if (err.response?.status === 400) {
        errorMessage = 'Please check all required fields and ensure they meet the requirements.';
      } else if (err.response?.status === 403) {
        errorMessage = 'You do not have permission to create users. Please contact your administrator.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error occurred. Please try again later or contact support.';
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return; // Prevent double submission
    
    const errors = validateForm(selectedUser, false);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      await AdminService.updateUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        source: selectedUser.source
      });
      setShowEditModal(false);
      setSelectedUser(null);
      setFormErrors({});
      fetchUsers();
      alert('User updated successfully!');
    } catch (err) {
      alert('Failed to update user: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        await AdminService.deleteUser(user.id, user.source);
        fetchUsers();
        alert('User deleted successfully!');
      } catch (err) {
        alert('Failed to delete user: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'teacher': 
      case 'admin': return <FaUserTie className="text-blue-500" />;
      case 'parent': return <FaUserFriends className="text-green-500" />;
      default: return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      teacher: 'bg-blue-100 text-blue-800',
      admin: 'bg-blue-100 text-blue-800',
      parent: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { score: 0, requirements: [] };
    
    const requirements = [
      { test: password.length >= 8, label: 'At least 8 characters', met: password.length >= 8 },
      { test: /[A-Z]/.test(password), label: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { test: /[a-z]/.test(password), label: 'One lowercase letter', met: /[a-z]/.test(password) },
      { test: /\d/.test(password), label: 'One number', met: /\d/.test(password) },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(password), label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
    
    const score = requirements.filter(req => req.met).length;
    return { score, requirements };
  };

  const PasswordStrengthIndicator = ({ password }) => {
    const { score, requirements } = getPasswordStrength(password);
    
    if (!password) return null;
    
    const getStrengthColor = (score) => {
      if (score < 2) return 'bg-red-500';
      if (score < 4) return 'bg-yellow-500';
      if (score === 4) return 'bg-blue-500';
      return 'bg-green-500';
    };
    
    const getStrengthText = (score) => {
      if (score < 2) return 'Weak';
      if (score < 4) return 'Fair';
      if (score === 4) return 'Good';
      return 'Strong';
    };
    
    return (
      <div className="mt-2">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(score)}`}
              style={{ width: `${(score / 5) * 100}%` }}
            />
          </div>
          <span className={`text-xs font-medium ${score === 5 ? 'text-green-600' : 'text-gray-600'}`}>
            {getStrengthText(score)}
          </span>
        </div>
        <div className="space-y-1">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}>
                {req.met && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={req.met ? 'text-green-600' : 'text-gray-500'}>
                {req.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const InputField = ({ label, type = "text", value, onChange, error, required = false, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  const PasswordField = ({ label, value, onChange, error, showPassword, onToggleVisibility, required = false, showStrengthIndicator = false, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value || ''}
          onChange={onChange}
          className={`mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
          {...props}
        />
        <button
          type="button"
          onClick={onToggleVisibility}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none p-1"
        >
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>
      {showStrengthIndicator && <PasswordStrengthIndicator password={value} />}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="px-3 py-4 sm:p-6 bg-white rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-base sm:text-sm"
        >
          <FaPlus /> Add User
        </button>
      </div>

      {/* Mobile-First Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Mobile-First Users Display */}
      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : error ? (
        <div className="text-center py-8 text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout, Desktop: Table Layout */}
          <div className="block sm:hidden space-y-4">
            {users.map((user) => (
              <div key={user.id} className="bg-gray-50 rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name || `${user.first_name} ${user.last_name}`}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role === 'admin' ? 'Teacher' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className="text-xs" />
                    {user.email}
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className="text-xs" />
                    {user.phone || 'N/A'}
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || `${user.first_name} ${user.last_name}`}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <FaEnvelope className="text-xs" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                        {user.role === 'admin' ? 'Teacher' : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <FaPhone className="text-xs text-gray-400" />
                        {user.phone || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile-First Pagination */}
          {pagination.pages > 1 && (
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-700 text-center sm:text-left">
                Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} users
              </div>
              <div className="flex justify-center sm:justify-end gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Mobile-First Create User Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleModalClose();
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Add New User</h3>
              <form onSubmit={handleCreateUser}>
                <div className="space-y-4">
                  <InputField
                    label="Name"
                    value={newUser.name}
                    onChange={handleNewUserChange('name')}
                    error={formErrors.name}
                    required
                  />
                  
                  <InputField
                    label="Email"
                    type="email"
                    value={newUser.email}
                    onChange={handleNewUserChange('email')}
                    error={formErrors.email}
                    required
                  />
                  
                  <InputField
                    label="Phone"
                    type="tel"
                    value={newUser.phone}
                    onChange={handleNewUserChange('phone')}
                    error={formErrors.phone}
                    placeholder="e.g., 0123456789"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newUser.role}
                      onChange={handleNewUserChange('role')}
                      className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="parent">Parent</option>
                      <option value="teacher">Teacher</option>
                    </select>
                  </div>
                  
                  <PasswordField
                    label="Password"
                    value={newUser.password}
                    onChange={handleNewUserChange('password')}
                    error={formErrors.password}
                    showPassword={showPassword}
                    onToggleVisibility={toggleShowPassword}
                    required
                    showStrengthIndicator={showPassword}
                    placeholder="Minimum 8 characters, uppercase, lowercase, numbers, and special characters"
                  />
                  
                  <PasswordField
                    label="Confirm Password"
                    value={newUser.confirmPassword}
                    onChange={handleNewUserChange('confirmPassword')}
                    error={formErrors.confirmPassword}
                    showPassword={showConfirmPassword}
                    onToggleVisibility={toggleShowConfirmPassword}
                    required
                    showStrengthIndicator={showConfirmPassword}
                    placeholder="Re-enter password"
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-base sm:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaPlus />
                        Create User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleModalClose}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 py-3 sm:py-2 rounded-lg transition-colors text-base sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-First Edit User Modal */}
      {showEditModal && selectedUser && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleModalClose();
            }
          }}
        >
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold mb-4">Edit User</h3>
              <form onSubmit={handleUpdateUser}>
                <div className="space-y-4">
                  <InputField
                    label="Name"
                    value={selectedUser.name || ''}
                    onChange={handleSelectedUserChange('name')}
                    error={formErrors.name}
                    required
                  />
                  
                  <InputField
                    label="Email"
                    type="email"
                    value={selectedUser.email || ''}
                    onChange={handleSelectedUserChange('email')}
                    error={formErrors.email}
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={selectedUser.role || ''}
                      className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                    <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      value={selectedUser.source === 'staff_table' ? 'Staff (Teachers/Admins)' : 'Users (Parents)'}
                      className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 rounded-lg bg-gray-100"
                      disabled
                    />
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 sm:py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-base sm:text-sm"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <FaEdit />
                        Update User
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleModalClose}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-700 py-3 sm:py-2 rounded-lg transition-colors text-base sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement; 