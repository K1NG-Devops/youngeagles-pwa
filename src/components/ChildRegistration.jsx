import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';
import { 
  FaChild, 
  FaUser, 
  FaCalendarAlt, 
  FaSchool, 
  FaPlus, 
  FaSpinner, 
  FaTimes,
  FaSearch,
  FaUsers,
  FaExclamationTriangle,
  FaCheckCircle
} from 'react-icons/fa';

const ChildRegistration = ({ isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [step, setStep] = useState(1); // 1: Search/Register Choice, 2: Child Form, 3: Confirmation
  const [isLoading, setIsLoading] = useState(false);
  const [existingChildren, setExistingChildren] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedExistingChild, setSelectedExistingChild] = useState(null);
  
  const [childData, setChildData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    class: '', // Auto-assigned class (non-editable)
    currentSchool: '', // Current/previous school (editable)
    isYoungEaglesChild: false, // Toggle for Young Eagles vs General
    gender: '',
    allergies: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalConditions: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Search for existing Young Eagles children
  const searchExistingChildren = async (query) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      // API call to search for existing children in Young Eagles database
      const response = await apiService.children.search(query);
      setSearchResults(response.data.children || []);
    } catch (error) {
      console.error('Error searching children:', error);
      nativeNotificationService.error('Failed to search for existing children');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchExistingChildren(searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Auto-assign class based on age and registration type
  const assignClass = (dateOfBirth, isYoungEagles) => {
    if (!dateOfBirth) return '';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
    const ageInYears = Math.floor(ageInMonths / 12);
    
    if (isYoungEagles) {
      // Young Eagles classes
      if (ageInYears >= 1 && ageInYears <= 3) {
        return 'Panda';
      } else if (ageInYears >= 4 && ageInYears <= 6) {
        return 'Curious Cubs';
      }
    } else {
      // General classes for non-Young Eagles children
      if (ageInYears >= 1 && ageInYears <= 3) {
        return 'Little Explorers';
      } else if (ageInYears >= 4 && ageInYears <= 6) {
        return 'Tiny Adventurers';
      }
    }
    
    return 'Unassigned'; // For children outside age range
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let newValue = type === 'checkbox' ? checked : value;
    
    // Handle phone number formatting
    if (name === 'emergencyPhone') {
      // Remove all non-digits
      const digits = value.replace(/\D/g, '');
      // Format as South African phone number
      newValue = digits;
      if (digits.length >= 10) {
        newValue = digits.slice(0, 10);
        newValue = newValue.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      }
    }
    
    setChildData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Auto-assign class when date of birth or registration type changes
      if (name === 'dateOfBirth' || name === 'isYoungEaglesChild') {
        const dateOfBirth = name === 'dateOfBirth' ? newValue : prev.dateOfBirth;
        const isYoungEagles = name === 'isYoungEaglesChild' ? newValue : prev.isYoungEaglesChild;
        updated.class = assignClass(dateOfBirth, isYoungEagles);
      }
      
      return updated;
    });
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};
    
    if (!childData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    
    if (!childData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }
    
    if (!childData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else {
      // Validate date is not in the future and child is within preschool age range
      const birthDate = new Date(childData.dateOfBirth);
      const today = new Date();
      const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + (today.getMonth() - birthDate.getMonth());
      const ageInYears = Math.floor(ageInMonths / 12);
      
      if (birthDate > today) {
        newErrors.dateOfBirth = 'Date of birth cannot be in the future';
      } else if (ageInYears > 6) {
        newErrors.dateOfBirth = 'Child must be 6 years or younger for preschool';
      } else if (ageInYears < 1) {
        newErrors.dateOfBirth = 'Child must be at least 1 year old';
      }
    }
    
    if (!childData.gender) {
      newErrors.gender = 'Gender is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Register new child
  const handleRegisterNewChild = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      
      const registrationData = {
        ...childData,
        parentId: user.id,
        registrationSource: 'parent_app',
        requiresAdminApproval: true,
        registrationType: childData.isYoungEaglesChild ? 'young_eagles' : 'general'
      };

      // Use different endpoints based on registration type
      let response;
      if (childData.isYoungEaglesChild) {
        response = await apiService.children.register(registrationData);
      } else {
        // For general registration, try the specific endpoint first, fallback to regular register
        try {
          response = await apiService.children.registerGeneral(registrationData);
        } catch (error) {
          if (error.response?.status === 404) {
            // Fallback to regular register endpoint if registerGeneral doesn't exist
            response = await apiService.children.register(registrationData);
          } else {
            throw error;
          }
        }
      }
      
      if (response.data.success) {
        const registrationType = childData.isYoungEaglesChild ? 'Young Eagles' : 'General';
        const className = childData.class || 'unassigned';
        nativeNotificationService.success(
          `${registrationType} child registration submitted for admin approval! ${childData.firstName} has been assigned to ${className} class.`
        );
        setStep(3);
        
        // Notify admin of new registration
        await apiService.notifications.send({
          recipientRole: 'admin',
          title: `New ${registrationType} Child Registration`,
          message: `${user.name} has registered a new ${registrationType.toLowerCase()} child: ${childData.firstName} ${childData.lastName} (${className} class)`,
          type: 'admin_action_required',
          priority: 'high',
          metadata: {
            childId: response.data.child.id,
            parentId: user.id,
            registrationType: registrationType.toLowerCase(),
            assignedClass: className,
            action: 'approve_child_registration'
          }
        });
      }
    } catch (error) {
      console.error('Error registering child:', error);
      nativeNotificationService.error('Failed to register child. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Link to existing Young Eagles child
  const handleLinkExistingChild = async (child) => {
    try {
      setIsLoading(true);
      
      const response = await apiService.children.linkToParent({
        childId: child.id,
        parentId: user.id,
        relationshipType: 'parent',
        requiresApproval: true
      });
      
      if (response.data.success) {
        nativeNotificationService.success('Link request submitted for admin approval!');
        setSelectedExistingChild(child);
        setStep(3);
        
        // Notify admin of link request
        await apiService.notifications.send({
          recipientRole: 'admin',
          title: 'Parent-Child Link Request',
          message: `${user.name} wants to link to existing child: ${child.firstName} ${child.lastName}`,
          type: 'admin_action_required',
          priority: 'high',
          metadata: {
            childId: child.id,
            parentId: user.id,
            action: 'approve_parent_child_link'
          }
        });
      }
    } catch (error) {
      console.error('Error linking to child:', error);
      nativeNotificationService.error('Failed to submit link request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form and close modal
  const handleClose = () => {
    setStep(1);
    setChildData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      class: '',
      currentSchool: '',
      isYoungEaglesChild: false,
      gender: '',
      allergies: '',
      emergencyContact: '',
      emergencyPhone: '',
      medicalConditions: '',
      notes: ''
    });
    setErrors({});
    setSearchQuery('');
    setSearchResults([]);
    setSelectedExistingChild(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaChild className="text-2xl text-blue-500 mr-3" />
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {step === 1 ? 'Register Child' : 
                    step === 2 ? 'Child Information' : 
                      'Registration Complete'}
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {step === 1 ? 'Search for existing child or register new child' : 
                    step === 2 ? 'Fill in your child\'s information (all fields with * are required)' : 
                      'Your request has been submitted'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= stepNum 
                    ? 'bg-blue-500 text-white' 
                    : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-0.5 ${
                    step > stepNum 
                      ? 'bg-blue-500' 
                      : isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 && (
            <div className="space-y-6">
              {/* Search for Existing Children */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Is your child already a Young Eagles student?
                </h3>
                
                <div className="relative mb-4">
                  <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by child's name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                  {isSearching && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-spin text-blue-500" />
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className={`border rounded-lg overflow-hidden ${
                    isDark ? 'border-gray-600' : 'border-gray-300'
                  }`}>
                    <div className={`px-4 py-2 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Found {searchResults.length} existing student(s)
                      </p>
                    </div>
                    <div className="max-h-40 overflow-y-auto">
                      {searchResults.map((child) => (
                        <div
                          key={child.id}
                          className={`p-4 border-b last:border-b-0 cursor-pointer transition-colors ${
                            isDark 
                              ? 'border-gray-600 hover:bg-gray-700' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => handleLinkExistingChild(child)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {child.firstName} {child.lastName}
                              </p>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Grade {child.grade} • {child.className}
                              </p>
                            </div>
                            <button className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors">
                              Link Child
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className={`absolute inset-0 flex items-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  <div className={`w-full border-t ${isDark ? 'border-gray-600' : 'border-gray-300'}`} />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className={`px-2 ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-500'}`}>
                    OR
                  </span>
                </div>
              </div>

              {/* Register New Child */}
              <div>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Register a new child
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your child is not currently enrolled with Young Eagles, but you'd like to register them.
                </p>
                <button
                  onClick={() => setStep(2)}
                  className="w-full flex items-center justify-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaPlus className="mr-2" />
                  Register New Child
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Child Information Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={childData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.firstName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:border-transparent`}
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={childData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.lastName 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:border-transparent`}
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={childData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.dateOfBirth 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:border-transparent`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
                  )}
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={childData.gender}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      errors.gender 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isDark 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:border-transparent`}
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                {/* Registration Type Selection */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Registration Type *
                  </label>
                  <div className="space-y-3">
                    <label className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      childData.isYoungEaglesChild 
                        ? (isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50')
                        : (isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
                    }`}>
                      <input
                        type="radio"
                        name="registrationType"
                        value="youngEagles"
                        checked={childData.isYoungEaglesChild}
                        onChange={() => setChildData(prev => ({...prev, isYoungEaglesChild: true}))}
                        className="w-4 h-4 text-blue-600 mt-0.5"
                      />
                      <div>
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          Young Eagles Student
                        </span>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Child is currently enrolled at Young Eagles (transferring within school)
                        </p>
                      </div>
                    </label>
                    
                    <label className={`flex items-start space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      !childData.isYoungEaglesChild 
                        ? (isDark ? 'border-green-500 bg-green-900/20' : 'border-green-500 bg-green-50')
                        : (isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400')
                    }`}>
                      <input
                        type="radio"
                        name="registrationType"
                        value="external"
                        checked={!childData.isYoungEaglesChild}
                        onChange={() => setChildData(prev => ({...prev, isYoungEaglesChild: false}))}
                        className="w-4 h-4 text-green-600 mt-0.5"
                      />
                      <div>
                        <span className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                          New Student (from another school)
                        </span>
                        <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Child is coming from another school or preschool
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Auto-assigned Class Display */}
                {childData.dateOfBirth && (
                  <div className="md:col-span-2">
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Assigned Class (Auto-assigned)
                    </label>
                    <div className={`px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-gray-50 border-gray-300 text-gray-900'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{childData.class || 'Calculating...'}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          childData.isYoungEaglesChild 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {childData.isYoungEaglesChild ? 'Young Eagles' : 'General'}
                        </span>
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {childData.isYoungEaglesChild 
                          ? 'Young Eagles class assignment based on age'
                          : 'General preschool class assignment based on age'
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Current/Previous School */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {childData.isYoungEaglesChild ? 'Current Young Eagles Class/Teacher' : 'Previous School/Preschool'} (Optional)
                  </label>
                  <input
                    type="text"
                    name="currentSchool"
                    value={childData.currentSchool || ''}
                    onChange={handleInputChange}
                    placeholder={childData.isYoungEaglesChild ? 'Current class or teacher name' : 'Previous school or preschool name'}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    name="emergencyContact"
                    value={childData.emergencyContact}
                    onChange={handleInputChange}
                    placeholder="Emergency contact person"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Emergency Contact Phone
                  </label>
                  <input
                    type="tel"
                    name="emergencyPhone"
                    value={childData.emergencyPhone}
                    onChange={handleInputChange}
                    placeholder="Emergency contact phone"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={childData.allergies}
                    onChange={handleInputChange}
                    placeholder="Any known allergies"
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Medical Conditions
                  </label>
                  <textarea
                    name="medicalConditions"
                    value={childData.medicalConditions}
                    onChange={handleInputChange}
                    placeholder="Any medical conditions we should know about"
                    rows={2}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={childData.notes}
                    onChange={handleInputChange}
                    placeholder="Any additional information you'd like to share"
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex space-x-4 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 px-6 py-3 rounded-lg border transition-colors ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>
                <button
                  onClick={handleRegisterNewChild}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Registration'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
                isDark ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <FaCheckCircle className="text-3xl text-green-500" />
              </div>
              
              <div>
                <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Registration Submitted Successfully!
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {selectedExistingChild 
                    ? `Your request to link with ${selectedExistingChild.firstName} ${selectedExistingChild.lastName} has been submitted.`
                    : 'Your child\'s registration has been submitted for review.'
                  }
                </p>
              </div>

              <div className={`p-4 rounded-lg ${isDark ? 'bg-yellow-900/20 border border-yellow-700' : 'bg-yellow-50 border border-yellow-200'}`}>
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-yellow-500 mr-3 mt-0.5" />
                  <div className="text-left">
                    <p className={`text-sm font-medium ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                      Admin Approval Required
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-yellow-400' : 'text-yellow-700'}`}>
                      An administrator will review your request and notify you once it's approved. 
                      This usually takes 1-2 business days.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  handleClose();
                  if (onSuccess) onSuccess();
                }}
                className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildRegistration;
