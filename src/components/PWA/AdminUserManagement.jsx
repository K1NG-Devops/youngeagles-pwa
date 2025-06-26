import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminService from '../../services/adminService';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaUser, FaEnvelope, FaPhone, FaUserTie, FaUserFriends, FaSpinner, FaEye, FaEyeSlash, FaTimes, FaSchool, FaChalkboardTeacher } from 'react-icons/fa';
import { useTheme } from '../../hooks/useTheme.jsx';

// --- Re-usable, Memoized Form Components (Moved outside for stability) ---

const InputField = React.memo(({ label, type = "text", name, value, onChange, error, required = false, isDark, ...props }) => (
  <div>
    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      value={value || ''}
      onChange={onChange}
      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
        isDark 
          ? `bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${error ? 'border-red-400' : 'focus:border-blue-400'}` 
          : `bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${error ? 'border-red-500' : 'border-gray-300'}`
      }`}
      {...props}
    />
    {error && <p className={`mt-1 text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>}
  </div>
));

const PasswordStrengthIndicator = React.memo(({ password }) => {
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, requirements: [] };
    const requirements = [
      { test: pass.length >= 8, label: 'At least 8 characters' },
      { test: /[A-Z]/.test(pass), label: 'One uppercase letter' },
      { test: /[a-z]/.test(pass), label: 'One lowercase letter' },
      { test: /\d/.test(pass), label: 'One number' },
      { test: /[!@#$%^&*(),.?":{}|<>]/.test(pass), label: 'One special character' }
    ];
    const metRequirements = requirements.map(r => ({ ...r, met: r.test }));
    const score = metRequirements.filter(r => r.met).length;
    return { score, requirements: metRequirements };
  };

  const { score, requirements } = getPasswordStrength(password);
  if (!password) return null;

  const getStrengthColor = (s) => {
    if (s < 2) return 'bg-red-500';
    if (s < 4) return 'bg-yellow-500';
    return 'bg-green-500';
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
      </div>
      <div className="space-y-1">
        {requirements.map((req) => (
          <div key={req.label} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500' : 'bg-gray-300'}`}>
              {req.met && <span className="text-white text-xs">✓</span>}
            </div>
            <span className={req.met ? 'text-green-600' : 'text-gray-500'}>{req.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

const PasswordField = React.memo(({ label, name, value, onChange, error, showPassword, onToggleVisibility, required = false, showStrengthIndicator = false, isDark, ...props }) => (
  <div>
    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value || ''}
        onChange={onChange}
        className={`block w-full rounded-lg border px-3 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
          isDark 
            ? `bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${error ? 'border-red-400' : 'border-gray-600'}` 
            : `bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${error ? 'border-red-500' : 'border-gray-300'}`
        }`}
        {...props}
      />
      <button
        type="button"
        onClick={onToggleVisibility}
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} focus:outline-none p-1`}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </button>
    </div>
    {showStrengthIndicator && <PasswordStrengthIndicator password={value} />}
    {error && <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{error}</p>}
  </div>
));

const AdminUserManagement = ({ userType = 'all', isDark: propIsDark }) => {
  const { isDark: contextIsDark } = useTheme();
  const isDark = propIsDark !== undefined ? propIsDark : contextIsDark;
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: userType === 'teacher' ? 'teacher' : userType === 'parent' ? 'parent' : 'parent',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    zipCode: '',
    emergencyContact: '',
    emergencyPhone: '',
    qualification: '',
    experience: '',
    specialization: '',
    dateOfBirth: '',
    gender: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // When the form to create a new user is shown, reset the state
  useEffect(() => {
    if (showCreateForm) {
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: userType === 'teacher' ? 'teacher' : userType === 'parent' ? 'parent' : 'parent',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zipCode: '',
        emergencyContact: '',
        emergencyPhone: '',
        qualification: '',
        experience: '',
        specialization: '',
        dateOfBirth: '',
        gender: ''
      });
      setFormErrors({});
    }
  }, [showCreateForm, userType]);

  // Get filtered users based on userType prop
  const filteredUsers = useMemo(() => {
    if (userType === 'all') return users;
    
    // For teachers, if we loaded them from the dedicated teachers endpoint,
    // they should all be displayed regardless of their role field
    if (userType === 'teacher') {
      // Check if any user has a source indicating they came from staff table
      const hasStaffTableUsers = users.some(user => user.source === 'staff_table');
      if (hasStaffTableUsers) {
        // All users are teachers from the staff endpoint
        return users;
      }
    }
    
    return users.filter(user => user.role === userType);
  }, [users, userType]);

  // Get user type display information
  const userTypeInfo = useMemo(() => {
    switch (userType) {
      case 'parent':
        return {
          title: 'Parent Management',
          icon: <FaSchool className="inline mr-2" />,
          color: 'blue',
          addText: 'Add Parent',
          searchPlaceholder: 'Search parents by name or email...'
        };
      case 'teacher':
        return {
          title: 'Teacher Management',
          icon: <FaChalkboardTeacher className="inline mr-2" />,
          color: 'green',
          addText: 'Add Teacher',
          searchPlaceholder: 'Search teachers by name or email...'
        };
      default:
        return {
          title: 'User Management',
          icon: <FaUser className="inline mr-2" />,
          color: 'blue',
          addText: 'Add User',
          searchPlaceholder: 'Search users by name or email...'
        };
    }
  }, [userType]);

  // Update newUser role when userType changes
  useEffect(() => {
    if (userType !== 'all') {
    setNewUser(prev => ({
      ...prev,
        role: userType
      }));
    }
  }, [userType]);

  // Smarter form handler that auto-populates first/last name
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setNewUser(prev => {
      const updatedUser = { ...prev, [name]: value };
      
      // If the full name is being changed, try to split it
      if (name === 'name') {
        const nameParts = value.trim().split(' ');
        updatedUser.firstName = nameParts[0] || '';
        updatedUser.lastName = nameParts.slice(1).join(' ') || '';
      }
      
      return updatedUser;
    });
  };

  // Simple toggle functions
  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  // Simple form close handler
  const handleFormClose = () => {
    if (isSubmitting) return;
    
    setShowCreateForm(false);
    setShowEditModal(false);
    setFormErrors({});
    setSelectedUser(null);
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: userType === 'teacher' ? 'teacher' : userType === 'parent' ? 'parent' : 'parent',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      address: '',
      city: '',
      zipCode: '',
      emergencyContact: '',
      emergencyPhone: '',
      qualification: '',
      experience: '',
      specialization: '',
      dateOfBirth: '',
      gender: ''
    });
  };

  // Simple search handler
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Edit user handler - ultra stable
  const handleSelectedUserChange = (e) => {
    const { name, value } = e.target;
    setSelectedUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📋 Fetching users - Type: ${userType}, Page: ${currentPage}, Search: ${searchTerm}`);
      
      // Pass the userType to the API call to filter by role on the backend
      const response = await AdminService.getUsers(currentPage, 20, searchTerm, userType);
      
      console.log('📊 API Response:', response);
      console.log('📊 Response structure:', {
        data: response.data,
        users: response.users,
        pagination: response.pagination
      });
      
      // Handle different response formats
      let users = [];
      if (response.data) {
        users = Array.isArray(response.data) ? response.data : (response.data.users || []);
      } else if (response.users) {
        users = response.users;
      } else if (Array.isArray(response)) {
        users = response;
      }
      
      console.log(`📋 Found ${users.length} users total`);
      
      // Debug: Log all user roles to see what we actually have
      console.log('🔍 All user roles found:', users.map(u => ({
        id: u.id,
        name: u.name || `${u.first_name} ${u.last_name}`,
        role: u.role,
        email: u.email,
        source: u.source
      })));
      
      // If we're looking for teachers and none found, try the teachers endpoint
      if (userType === 'teacher' && users.filter(user => user.role === 'teacher').length === 0) {
        console.log('🔍 No teachers found in users response, trying teachers endpoint...');
        try {
          const teachersResponse = await AdminService.getTeachers();
          console.log('👩‍🏫 Teachers endpoint response:', teachersResponse);
          
          if (teachersResponse && teachersResponse.length > 0) {
            // Use teachers from the specific endpoint
            console.log('✅ Setting teachers from dedicated endpoint:', teachersResponse);
            setUsers(teachersResponse);
            setPagination({ pages: 1, total: teachersResponse.length });
            setLoading(false);
            return;
          }
        } catch (teacherError) {
          console.log('⚠️ Teachers endpoint failed, continuing with user filtering...');
        }
      }
      
      // If we're filtering by role on frontend (as backup)
      if (userType !== 'all') {
        const filtered = users.filter(user => user.role === userType);
        console.log(`🔍 After filtering by role '${userType}': ${filtered.length} users`);
        
        // If no teachers found, check for alternative role names
        if (userType === 'teacher' && filtered.length === 0) {
          const possibleTeachers = users.filter(user => 
            user.role === 'admin' || 
            user.role === 'staff' || 
            user.source === 'staff_table' ||
            (user.role && user.role.toLowerCase().includes('teach'))
          );
          console.log(`🔍 Possible teachers with different roles:`, possibleTeachers.map(u => ({
            name: u.name,
            role: u.role,
            source: u.source
          })));
          
          if (possibleTeachers.length > 0) {
            console.log(`✨ Found ${possibleTeachers.length} potential teachers with roles: ${possibleTeachers.map(u => u.role).join(', ')}`);
            // For now, show these as teachers
            setUsers(possibleTeachers);
          } else {
            setUsers(filtered);
          }
        } else {
          setUsers(filtered);
        }
      } else {
        setUsers(users);
      }
      
      setPagination(response.pagination || { pages: 1, total: users.length });
      
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(`Failed to fetch users: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, userType]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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
      
      // Prepare user data including all fields
      const userData = {
        // Core required fields
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        password: newUser.password,
        
        // Additional profile fields
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        address: newUser.address,
        city: newUser.city,
        zipCode: newUser.zipCode,
        emergencyContact: newUser.emergencyContact,
        emergencyPhone: newUser.emergencyPhone,
        dateOfBirth: newUser.dateOfBirth,
        gender: newUser.gender,
        
        // Teacher-specific fields (only if role is teacher)
        ...(newUser.role === 'teacher' && {
          qualification: newUser.qualification,
          experience: newUser.experience,
          specialization: newUser.specialization
        })
      };
      
      await AdminService.createUser(userData);
      
      setShowCreateForm(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: userType === 'teacher' ? 'teacher' : userType === 'parent' ? 'parent' : 'parent',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        zipCode: '',
        emergencyContact: '',
        emergencyPhone: '',
        qualification: '',
        experience: '',
        specialization: '',
        dateOfBirth: '',
        gender: ''
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
    
    // Additional password validation for updates
    if (selectedUser.password) {
      if (selectedUser.password !== selectedUser.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare update data with all fields
      const updateData = {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        source: selectedUser.source
      };

      // Add role-specific fields
      if (selectedUser.role === 'teacher') {
        updateData.qualification = selectedUser.qualification;
        updateData.experience = selectedUser.experience;
        updateData.specialization = selectedUser.specialization;
        updateData.emergencyContact = selectedUser.emergencyContact;
        updateData.emergencyPhone = selectedUser.emergencyPhone;
      } else if (selectedUser.role === 'parent') {
        updateData.address = selectedUser.address;
        updateData.city = selectedUser.city;
        updateData.zipCode = selectedUser.zipCode;
        updateData.emergencyContact = selectedUser.emergencyContact;
        updateData.emergencyPhone = selectedUser.emergencyPhone;
      }

      // Include password only if it's being changed
      if (selectedUser.password && selectedUser.password.trim() !== '') {
        updateData.password = selectedUser.password;
      }

      const response = await AdminService.updateUser(selectedUser.id, updateData);
      
      // Update the users list with the updated user data
      setUsers(users.map(user => 
        user.id === selectedUser.id ? { ...user, ...response.user } : user
      ));
      
      setShowEditModal(false);
      setSelectedUser(null);
      setFormErrors({});
      fetchUsers(); // Refresh the list to ensure we have the latest data
      alert('User updated successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setFormErrors({ general: errorMessage });
      alert('Failed to update user: ' + errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)) {
      try {
        // Determine deletion strategy based on user source and role
        if (user.source === 'staff_table' || userType === 'teacher' || user.role === 'teacher' || user.role === 'admin') {
          console.log('🗑️ Attempting teacher/admin deletion via dedicated endpoint...');
          try {
            await AdminService.deleteTeacher(user.id);
            console.log('✅ Teacher deleted successfully via dedicated endpoint');
          } catch (teacherError) {
            console.log('⚠️ Dedicated teacher endpoint failed, trying parent endpoint as fallback...');
            // Some teachers might be stored in the users table, try parent deletion
            try {
              await AdminService.deleteParent(user.id);
              console.log('✅ User deleted successfully via parent endpoint');
            } catch (parentError) {
              console.log('❌ Both teacher and parent endpoints failed');
              throw new Error('Unable to delete user: no suitable deletion endpoint found');
            }
          }
        } else {
          console.log('🗑️ Attempting parent deletion...');
          await AdminService.deleteParent(user.id);
          console.log('✅ Parent deleted successfully');
        }
        fetchUsers();
        alert('User deleted successfully!');
      } catch (err) {
        console.error('❌ Delete operation failed:', err);
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

  return (
    <div className={`px-3 py-4 sm:p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'} rounded-lg shadow-lg transition-colors duration-200`}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <h2 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>{userTypeInfo.title}</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className={`w-full sm:w-auto px-4 py-3 sm:py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-base sm:text-sm ${
            showCreateForm 
              ? 'bg-gray-500 hover:bg-gray-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {showCreateForm ? <FaTimes /> : <FaPlus />} 
          {showCreateForm ? 'Cancel' : userTypeInfo.addText}
        </button>
      </div>

      {/* Mobile-First Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder={userTypeInfo.searchPlaceholder}
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>
      </div>

      {/* Inline Create User Form */}
      {showCreateForm && (
        <div className={`${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} rounded-lg border p-6 mb-6`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            {userTypeInfo.icon} Add New {userType === 'teacher' ? 'Teacher' : userType === 'parent' ? 'Parent' : 'User'}
          </h3>
          <form onSubmit={handleCreateUser} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Basic Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                    name="name"
                  value={newUser.name}
                    onChange={handleInputChange}
                  error={formErrors.name}
                  required={true}
                    placeholder="Enter full name"
                  isDark={isDark}
                />
                <InputField
                  label="Email Address"
                    type="email"
                    name="email"
                  value={newUser.email}
                    onChange={handleInputChange}
                  error={formErrors.email}
                  required={true}
                    placeholder="user@example.com"
                  isDark={isDark}
                />
                <InputField
                  label="Phone Number"
                    type="tel"
                    name="phone"
                  value={newUser.phone}
                    onChange={handleInputChange}
                  error={formErrors.phone}
                  placeholder="(555) 123-4567"
                  isDark={isDark}
                />
                {userType === 'all' && (
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={newUser.role}
                    onChange={handleInputChange}
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="parent">Parent</option>
                    <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                  </select>
                </div>
                )}
                {userType !== 'all' && (
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Role
                  </label>
                    <div className={`w-full px-3 py-3 text-base border rounded-lg ${
                      isDark 
                        ? 'bg-gray-600 border-gray-600 text-gray-300' 
                        : 'bg-gray-100 border-gray-300 text-gray-600'
                    }`}>
                      {userType.charAt(0).toUpperCase() + userType.slice(1)}
                </div>
                  </div>
                )}
              </div>
                </div>
                
            {/* Personal Details */}
                <div>
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Date of Birth"
                    type="date"
                    name="dateOfBirth"
                  value={newUser.dateOfBirth}
                    onChange={handleInputChange}
                  isDark={isDark}
                />
                <div className="md:col-span-1">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={newUser.gender}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      isDark 
                        ? 'bg-gray-600 border-gray-500 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Address Information</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={newUser.address || ''}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={newUser.city || ''}
                      onChange={handleInputChange}
                      placeholder="City name"
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="zipCode"
                      value={newUser.zipCode || ''}
                      onChange={handleInputChange}
                      placeholder="12345"
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={newUser.emergencyContact || ''}
                    onChange={handleInputChange}
                    placeholder="Emergency contact full name"
                    className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={newUser.emergencyPhone || ''}
                    onChange={handleInputChange}
                    placeholder="Emergency contact phone number"
                    className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Teacher-Specific Fields */}
            {newUser.role === 'teacher' && (
              <div>
                <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Professional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={newUser.qualification || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Bachelor of Education"
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="experience"
                      value={newUser.experience || ''}
                      onChange={handleInputChange}
                      placeholder="Years of teaching experience"
                      min="0"
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={newUser.specialization || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Early Childhood Development, Mathematics, Arts"
                      className={`w-full px-3 py-3 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                        isDark 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Password Section */}
            <div>
              <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Account Security</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={newUser.password || ''}
                      onChange={handleInputChange}
                      placeholder="Minimum 8 characters with uppercase, lowercase, numbers, and special characters"
                      className={`block w-full rounded-lg border px-3 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDark 
                          ? `bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${formErrors.password ? 'border-red-400' : 'border-gray-600'}` 
                          : `bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`
                      }`}
                    />
                    <button
                      type="button"
                      onClick={toggleShowPassword}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} focus:outline-none p-1`}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {newUser.password && <PasswordStrengthIndicator password={newUser.password} />}
                  {formErrors.password && <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{formErrors.password}</p>}
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={newUser.confirmPassword || ''}
                      onChange={handleInputChange}
                      placeholder="Re-enter password to confirm"
                      className={`block w-full rounded-lg border px-3 py-3 pr-12 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDark 
                          ? `bg-gray-700 border-gray-600 text-white placeholder-gray-400 ${formErrors.confirmPassword ? 'border-red-400' : 'border-gray-600'}` 
                          : `bg-white border-gray-300 text-gray-900 placeholder-gray-500 ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`
                      }`}
                    />
                    <button
                      type="button"
                      onClick={toggleShowConfirmPassword}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} focus:outline-none p-1`}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && <p className={`text-xs mt-1 ${isDark ? 'text-red-400' : 'text-red-500'}`}>{formErrors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-300">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin" />
                    Creating {newUser.role}...
                  </>
                ) : (
                  <>
                    <FaPlus />
                    Create {newUser.role === 'teacher' ? 'Teacher' : 'Parent'}
                  </>
                )}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowCreateForm(false)}
                className={`w-full sm:w-auto py-3 px-6 rounded-lg transition-colors text-base font-medium ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile-First Users Display */}
      {loading ? (
        <div className="text-center py-8">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading users...</p>
        </div>
      ) : error ? (
        <div className={`text-center py-8 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
          <p>{error}</p>
          <button
            onClick={fetchUsers}
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
          
          {/* Debug Information */}
          <div className={`mt-6 p-4 text-left text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-lg`}>
            <details className="cursor-pointer">
              <summary className="font-medium mb-2">Debug Information (Click to expand)</summary>
              <div className="space-y-2">
                <p><strong>User Type:</strong> {userType}</p>
                <p><strong>Current Page:</strong> {currentPage}</p>
                <p><strong>Search Term:</strong> "{searchTerm}"</p>
                <p><strong>Users Found:</strong> {users.length}</p>
                <p><strong>Filtered Users:</strong> {filteredUsers.length}</p>
                <p><strong>Error Message:</strong> {error}</p>
                <button
                  onClick={() => {
                    console.log('🔍 Manual Debug - Current State:');
                    console.log('userType:', userType);
                    console.log('users:', users);
                    console.log('filteredUsers:', filteredUsers);
                    console.log('currentPage:', currentPage);
                    console.log('searchTerm:', searchTerm);
                    console.log('pagination:', pagination);
                  }}
                  className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                >
                  Log Current State to Console
                </button>
              </div>
            </details>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaUser className="text-4xl mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">
            No {userType === 'all' ? 'users' : userType + 's'} found
          </p>
          <p className="text-sm">
            {searchTerm 
              ? `No ${userType === 'all' ? 'users' : userType + 's'} match your search "${searchTerm}"`
              : userType === 'teacher' 
                ? "There are no teachers in the system yet. Click 'Add Teacher' to get started."
                : userType === 'parent'
                  ? "There are no parents in the system yet. Click 'Add Parent' to get started."
                  : "No users found in the system."
            }
          </p>
          
          {/* Debug Information for Empty State */}
          <div className={`mt-6 p-4 text-left text-xs ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'} rounded-lg max-w-md mx-auto`}>
            <details className="cursor-pointer">
              <summary className="font-medium mb-2">Debug Information (Click to expand)</summary>
              <div className="space-y-2">
                <p><strong>User Type Filter:</strong> {userType}</p>
                <p><strong>Total Users Loaded:</strong> {users.length}</p>
                <p><strong>Filtered Users Count:</strong> {filteredUsers.length}</p>
                <p><strong>Search Term:</strong> "{searchTerm}"</p>
                <p><strong>All Users Roles:</strong> {users.map(u => u.role).join(', ') || 'None'}</p>
                <button
                  onClick={() => {
                    console.log('🔍 Empty State Debug:');
                    console.log('userType:', userType);
                    console.log('users:', users);
                    console.log('filteredUsers:', filteredUsers);
                    console.log('All user roles:', users.map(u => ({ id: u.id, role: u.role, email: u.email })));
                  }}
                  className="mt-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs"
                >
                  Log Debug Info to Console
                </button>
                <button
                  onClick={() => {
                    console.log('🔄 Force Refresh Users');
                    fetchUsers();
                  }}
                  className="mt-2 ml-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs"
                >
                  Force Refresh
                </button>
              </div>
            </details>
          </div>
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout, Desktop: Table Layout */}
          <div className="block sm:hidden space-y-4">
             {filteredUsers.map((user) => (
              <div key={user.id} className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-4 border ${isDark ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-200`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                      {getRoleIcon(user.role)}
                    </div>
                    <div>
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {user.name || `${user.first_name} ${user.last_name}`}
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                         {user.role === 'admin' ? 'Teacher' : user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Teacher'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className={`p-2 text-blue-600 ${isDark ? 'hover:bg-blue-900' : 'hover:bg-blue-50'} rounded-lg transition-colors duration-200`}
                    >
                      <FaEdit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className={`p-2 text-red-600 ${isDark ? 'hover:bg-red-900' : 'hover:bg-red-50'} rounded-lg transition-colors duration-200`}
                    >
                      <FaTrash size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaEnvelope className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaPhone className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{user.phone || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Status:</span>
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
            <table className={`min-w-full ${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
              <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    User
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Role
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Contact
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Status
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDark ? 'bg-gray-800 divide-gray-600' : 'bg-white divide-gray-200'} divide-y transition-colors duration-200`}>
                 {filteredUsers.map((user) => (
                  <tr key={user.id} className={isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className={`h-10 w-10 rounded-full ${isDark ? 'bg-gray-600' : 'bg-gray-200'} flex items-center justify-center`}>
                            {getRoleIcon(user.role)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {user.name || `${user.first_name} ${user.last_name}`}
                          </div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center gap-1`}>
                            <FaEnvelope className="text-xs" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                         {user.role === 'admin' ? 'Teacher' : user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Teacher'}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                      <div className="flex items-center gap-1">
                        <FaPhone className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
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
               <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} text-center sm:text-left`}>
                 {userType !== 'all' ? (
                   <>Showing {filteredUsers.length} {userType}s {searchTerm ? `matching "${searchTerm}"` : ''}</>
                 ) : (
                   <>Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, pagination.total)} of {pagination.total} users</>
                 )}
              </div>
              <div className="flex justify-center sm:justify-end gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                   className={`px-4 py-2 border rounded-lg disabled:opacity-50 text-sm transition-colors ${
                     isDark 
                       ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800' 
                       : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100'
                   }`}
                >
                  Previous
                </button>
                 <span className={`px-4 py-2 bg-blue-500 text-white rounded-lg text-sm`}>
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.pages))}
                  disabled={currentPage === pagination.pages}
                   className={`px-4 py-2 border rounded-lg disabled:opacity-50 text-sm transition-colors ${
                     isDark 
                       ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:bg-gray-800' 
                       : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:bg-gray-100'
                   }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

           {/* Results Summary for filtered views */}
           {userType !== 'all' && !loading && !error && (
             <div className={`mt-4 p-4 rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'} border`}>
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                   {userTypeInfo.icon}
                   <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                     {userType === 'parent' ? 'Parent' : 'Teacher'} Management Summary
                   </span>
                 </div>
                 <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                   {filteredUsers.length} {userType}s
                 </div>
               </div>
               {searchTerm && (
                 <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                   Filtered by: "{searchTerm}"
                 </p>
               )}
             </div>
           )}
        </>
      )}

      {/* Slide-in Panel for Edit User */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleFormClose}
          />
          
          {/* Slide-in Panel */}
          <div className={`fixed right-0 top-0 h-screen w-full max-w-md ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl transform transition-transform overflow-hidden`}>
            <div className="flex flex-col h-full relative">
              {/* Header */}
              <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} bg-opacity-90 backdrop-blur-sm flex-shrink-0`}>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Edit User</h3>
                <button
                  onClick={handleFormClose}
                  disabled={isSubmitting}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form Content */}
              <div className="flex-1 overflow-y-auto px-4 py-6" style={{ paddingBottom: '180px' }}>
                <form onSubmit={handleUpdateUser} id="edit-user-form">
                  <div className="space-y-6">
                    {/* Basic Information Section */}
                    <div>
                      <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Basic Information</h4>
                      <div className="space-y-4">
                        <InputField
                          label="Full Name"
                          name="name"
                          value={selectedUser.name || ''}
                          onChange={handleSelectedUserChange}
                          error={formErrors.name}
                          required
                          isDark={isDark}
                        />
                        
                        <InputField
                          label="Email Address"
                          name="email"
                          type="email"
                          value={selectedUser.email || ''}
                          onChange={handleSelectedUserChange}
                          error={formErrors.email}
                          required
                          isDark={isDark}
                        />
                        
                        <InputField
                          label="Phone Number"
                          name="phone"
                          type="tel"
                          value={selectedUser.phone || ''}
                          onChange={handleSelectedUserChange}
                          error={formErrors.phone}
                          placeholder="(555) 123-4567"
                          isDark={isDark}
                        />
                      </div>
                    </div>

                    {/* Password Section */}
                    <div>
                      <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Security</h4>
                      <div className="space-y-4">
                        <PasswordField
                          label="New Password (leave blank to keep current)"
                          name="password"
                          value={selectedUser.password || ''}
                          onChange={handleSelectedUserChange}
                          error={formErrors.password}
                          showPassword={showPassword}
                          onToggleVisibility={toggleShowPassword}
                          showStrengthIndicator={true}
                          placeholder="Enter new password"
                          isDark={isDark}
                        />
                        
                        {selectedUser.password && (
                          <PasswordField
                            label="Confirm New Password"
                            name="confirmPassword"
                            value={selectedUser.confirmPassword || ''}
                            onChange={handleSelectedUserChange}
                            error={formErrors.confirmPassword}
                            showPassword={showConfirmPassword}
                            onToggleVisibility={toggleShowConfirmPassword}
                            placeholder="Confirm new password"
                            isDark={isDark}
                          />
                        )}
                      </div>
                    </div>

                    {/* System Information */}
                    <div>
                      <h4 className={`text-md font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>System Information</h4>
                      <div className="space-y-4">
                        <div>
                          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Role
                          </label>
                          <input
                            type="text"
                            value={selectedUser.role || ''}
                            className={`w-full px-3 py-3 text-base border rounded-lg ${
                              isDark 
                                ? 'bg-gray-600 border-gray-500 text-gray-300' 
                                : 'bg-gray-100 border-gray-300 text-gray-600'
                            }`}
                            disabled
                          />
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Role cannot be changed</p>
                        </div>
                        
                        <div>
                          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                            Data Source
                          </label>
                          <input
                            type="text"
                            value={selectedUser.source === 'staff_table' ? 'Staff (Teachers/Admins)' : 'Users (Parents)'}
                            className={`w-full px-3 py-3 text-base border rounded-lg ${
                              isDark 
                                ? 'bg-gray-600 border-gray-500 text-gray-300' 
                                : 'bg-gray-100 border-gray-300 text-gray-600'
                            }`}
                            disabled
                          />
                          <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Indicates which database table stores this user</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              
              {/* Footer */}
              <div className={`absolute bottom-0 left-0 right-0 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} p-2 mb- shadow-lg`}>
                <div className="flex flex-col gap-2 max-w-md mx-auto">
                  <button
                    type="submit"
                    form="edit-user-form"
                    disabled={isSubmitting}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-base font-medium"
                  >
                    {isSubmitting ? (
                      <>
                        <FaSpinner className="animate-spin" />
                        Updating User...
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
                    onClick={handleFormClose}
                    className={`w-full py-2.5 px-4 mb-10 rounded-lg transition-colors text-base font-medium ${
                      isDark 
                        ? 'bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-gray-200' 
                        : 'bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-700'
                    }`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement; 