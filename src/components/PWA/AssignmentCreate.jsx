import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaUsers, 
  FaBook, 
  FaSpinner, 
  FaTimes, 
  FaCheck,
  FaArrowLeft
} from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';
import assignmentService from '../../services/assignmentService';
import useAuth from '../../hooks/useAuth';

const AssignmentCreate = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [loadingChildren, setLoadingChildren] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    class_name: 'Panda Class',
    due_date: '',
    child_ids: []
  });

  // Form validation
  const [errors, setErrors] = useState({});

  // Load available children for teacher's class
  useEffect(() => {
    loadAvailableChildren();
    setDefaultDueDate();
  }, []);

  const loadAvailableChildren = async () => {
    try {
      setLoadingChildren(true);
      const teacherId = auth?.user?.id || localStorage.getItem('teacherId') || 2;
      console.log('🎯 AssignmentCreate: Loading children for teacher ID:', teacherId);
      
      const children = await assignmentService.getAvailableChildren(teacherId);
      console.log('🎯 AssignmentCreate: Received children data:', children);
      
      setAvailableChildren(children);
      
      // Show success message for database connectivity
      if (children.length > 0) {
        console.log('✅ Successfully loaded students from database');
        showTopNotification(`✅ Loaded ${children.length} students from your class!`, 'success');
      } else {
        console.log('⚠️ No students found in teacher\'s class');
        showTopNotification('ℹ️ No students found in your assigned class', 'info');
      }
      
      // Auto-set the class name based on teacher's class
      if (children.length > 0) {
        const className = children[0].className;
        console.log('🎯 AssignmentCreate: Setting class name to:', className);
        setFormData(prev => ({
          ...prev,
          class_name: className
        }));
      } else {
        console.log('⚠️ AssignmentCreate: No children found for teacher');
      }
    } catch (error) {
      console.error('❌ AssignmentCreate: Error loading children:', error);
      
      // Show specific error message to help with troubleshooting
      if (error.message.includes('Unable to load students')) {
        showTopNotification(error.message, 'error');
      } else {
        showTopNotification('❌ Failed to connect to student database. Please check your connection.', 'error');
      }
    } finally {
      setLoadingChildren(false);
    }
  };

  const setDefaultDueDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0); // 5 PM tomorrow
    setFormData(prev => ({
      ...prev,
      due_date: tomorrow.toISOString().slice(0, 16)
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleChildSelection = (childId) => {
    setFormData(prev => ({
      ...prev,
      child_ids: prev.child_ids.includes(childId)
        ? prev.child_ids.filter(id => id !== childId)
        : [...prev.child_ids, childId]
    }));

    // Clear child selection error
    if (errors.child_ids) {
      setErrors(prev => ({
        ...prev,
        child_ids: ''
      }));
    }
  };

  const handleSelectAll = () => {
    if (formData.child_ids.length === availableChildren.length) {
      // If all are selected, deselect all
      setFormData(prev => ({
        ...prev,
        child_ids: []
      }));
    } else {
      // Select all children
      const allIds = availableChildren.map(child => child.id);
      setFormData(prev => ({
        ...prev,
        child_ids: allIds
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Assignment title is required';
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Due date is required';
    } else {
      const dueDate = new Date(formData.due_date);
      const now = new Date();
      if (dueDate <= now) {
        newErrors.due_date = 'Due date must be in the future';
      }
    }

    if (formData.child_ids.length === 0) {
      newErrors.child_ids = 'Please select at least one child';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showTopNotification('Please fix the form errors', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await assignmentService.createAssignment(formData);
      
      if (result.success) {
        showTopNotification(
          `🎉 Assignment "${formData.title}" created successfully for ${formData.child_ids.length} student${formData.child_ids.length === 1 ? '' : 's'}!`,
          'success'
        );
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          class_name: 'Panda Class',
          due_date: '',
          child_ids: []
        });
        setDefaultDueDate();
        
        // Navigate back to teacher dashboard with a delay to show the success message
        console.log('🏠 Navigating back to teacher dashboard in 2 seconds...');
        setTimeout(() => {
          navigate('/teacher-dashboard');
        }, 2000);
      } else {
        showTopNotification('❌ Failed to create assignment', 'error');
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      showTopNotification(error.message || 'Failed to create assignment', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDueDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 sticky top-0 z-10 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/teacher-dashboard')}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold">Create Assignment</h1>
              <p className="text-sm text-green-100">Assign homework to your students</p>
            </div>
          </div>
          <FaPlus className="w-6 h-6" />
        </div>
      </div>

      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Assignment Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaBook className="mr-2 text-blue-500" />
              Assignment Details
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Math Homework - Addition Practice"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white placeholder-gray-500 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaTimes className="w-4 h-4 mr-1" />
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Provide detailed instructions for the assignment..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none text-gray-900 bg-white placeholder-gray-500"
                />
              </div>

              {/* Class Name - Auto-set based on teacher's assigned class */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Assigned Class
                </label>
                <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                  <div className="flex items-center space-x-2">
                    <FaUsers className="text-blue-500" />
                    <span className="font-medium">{formData.class_name}</span>
                    <span className="text-sm text-gray-500">
                      ({availableChildren.length} student{availableChildren.length === 1 ? '' : 's'})
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  You can only assign homework to children in your assigned class
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="due_date"
                  value={formData.due_date}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white ${
                    errors.due_date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formData.due_date && (
                  <p className="mt-1 text-sm text-gray-600 flex items-center">
                    <FaCalendarAlt className="w-4 h-4 mr-1" />
                    Due: {formatDueDate(formData.due_date)}
                  </p>
                )}
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <FaTimes className="w-4 h-4 mr-1" />
                    {errors.due_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Student Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaUsers className="mr-2 text-green-500" />
                Select Students *
              </h2>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    formData.child_ids.length === availableChildren.length
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {formData.child_ids.length === availableChildren.length ? 'Deselect All' : 'Select All'}
                  <span className="ml-1 text-xs">
                    ({formData.child_ids.length}/{availableChildren.length})
                  </span>
                </button>
              </div>
            </div>

            {loadingChildren ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin text-gray-400 text-2xl mr-3" />
                <span className="text-gray-600">Loading students...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {availableChildren.map((child) => (
                  <div
                    key={child.id}
                    onClick={() => handleChildSelection(child.id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.child_ids.includes(child.id)
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.child_ids.includes(child.id)
                            ? 'border-green-500 bg-green-500'
                            : 'border-gray-300'
                        }`}>
                          {formData.child_ids.includes(child.id) && (
                            <FaCheck className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{child.name}</p>
                          <p className="text-sm text-gray-600">{child.age} years old • {child.className}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {formData.child_ids.length > 0 && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <FaUsers className="inline mr-1" />
                  {formData.child_ids.length} student{formData.child_ids.length === 1 ? '' : 's'} selected
                </p>
              </div>
            )}

            {errors.child_ids && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <FaTimes className="w-4 h-4 mr-1" />
                {errors.child_ids}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Creating Assignment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <FaPlus className="mr-2" />
                  Create Assignment
                </div>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentCreate; 