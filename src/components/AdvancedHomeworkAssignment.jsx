import React, { useState, useEffect } from 'react';
import nativeNotificationService from '../services/nativeNotificationService.js';
import {
  FaBook,
  FaUsers,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaFileAlt,
  FaTags,
  FaGraduationCap,
  FaSave,
  FaTimes,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const AdvancedHomeworkAssignment = ({ onClose, onHomeworkCreated }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [classes, setClasses] = useState([]);

  // CAPS-aligned homework library
  const homeworkLibrary = [
    {
      id: 1,
      title: 'Counting and Number Recognition 1-10',
      subject: 'Mathematics',
      ageGroup: '2-3',
      difficulty: 'easy',
      description: 'Interactive counting exercises with numbers 1-10 using colorful objects and visual aids.',
      estimatedDuration: 15,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 2,
      title: 'Basic Shape Recognition',
      subject: 'Mathematics',
      ageGroup: '2-3',
      difficulty: 'easy',
      description: 'Identify and name basic shapes: circle, square, triangle, and rectangle.',
      estimatedDuration: 20,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 3,
      title: 'Letter Recognition A-E',
      subject: 'Language',
      ageGroup: '2-3',
      difficulty: 'medium',
      description: 'Introduction to the first five letters of the alphabet with sound recognition.',
      estimatedDuration: 25,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 4,
      title: 'Colors and Patterns',
      subject: 'Art & Creativity',
      ageGroup: '2-3',
      difficulty: 'easy',
      description: 'Learn primary colors and simple patterns through creative activities.',
      estimatedDuration: 30,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 5,
      title: 'Counting 11-20',
      subject: 'Mathematics',
      ageGroup: '4-6',
      difficulty: 'medium',
      description: 'Advanced counting exercises with teen numbers and simple addition.',
      estimatedDuration: 25,
      prerequisites: [1],
      unlocked: false
    },
    {
      id: 6,
      title: 'Letter Recognition F-J',
      subject: 'Language',
      ageGroup: '4-6',
      difficulty: 'medium',
      description: 'Continue alphabet learning with letters F through J.',
      estimatedDuration: 30,
      prerequisites: [3],
      unlocked: false
    },
    {
      id: 7,
      title: 'Simple Word Formation',
      subject: 'Language',
      ageGroup: '4-6',
      difficulty: 'hard',
      description: 'Combine letters to form simple 3-letter words.',
      estimatedDuration: 35,
      prerequisites: [3, 6],
      unlocked: false
    },
    {
      id: 8,
      title: 'Basic Addition 1-5',
      subject: 'Mathematics',
      ageGroup: '4-6',
      difficulty: 'hard',
      description: 'Introduction to addition concepts using visual aids and manipulatives.',
      estimatedDuration: 40,
      prerequisites: [1, 5],
      unlocked: false
    }
  ];

  // Form state
  const [formData, setFormData] = useState({
    selectedAssignment: '',
    teacherInstructions: '',
    dueDate: '',
    dueTime: '17:00',
    assignmentType: 'class', // 'class' or 'individual'
    selectedClass: '',
    selectedChildren: []
  });

  // Load teacher's classes and children
  useEffect(() => {
    const loadTeacherData = async () => {
      try {
        setIsLoading(true);
        
        // Get teacher's classes
        const classesResponse = await apiService.classes.getByTeacher(user.id);
        const teacherClasses = classesResponse.data.classes || [];
        setClasses(teacherClasses);
        
        if (teacherClasses.length > 0) {
          setFormData(prev => ({ ...prev, selectedClass: teacherClasses[0].id }));
          
          // Get children for the first class
          const childrenResponse = await apiService.classes.getChildren(teacherClasses[0].id);
          const allChildren = childrenResponse.data.children || [];
          
          // Filter to only show our test children (Daniel and Shirley Baker)
          const testChildren = allChildren.filter(child => 
            child.name === 'Daniel Baker' || child.name === 'Shirley Baker'
          );
          
          setAvailableChildren(testChildren);
          console.log('📚 Test children available:', testChildren);
        }
        
      } catch (error) {
        console.error('Error loading teacher data:', error);
        nativeNotificationService.error('Failed to load class data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadTeacherData();
    }
  }, [user]);

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Check if assignment is unlocked based on prerequisites
  const isAssignmentUnlocked = (assignment) => {
    if (!assignment.prerequisites) return true;
    // For now, we'll make all assignments unlocked for demo purposes
    // In a real implementation, you'd check if prerequisite assignments are completed
    return true;
  };

  // Handle child selection for individual assignments
  const handleChildSelection = (childId) => {
    setFormData(prev => ({
      ...prev,
      selectedChildren: prev.selectedChildren.includes(childId)
        ? prev.selectedChildren.filter(id => id !== childId)
        : [...prev.selectedChildren, childId]
    }));
  };

  // Handle assignment type change
  const handleAssignmentTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      assignmentType: type,
      selectedChildren: type === 'class' ? [] : prev.selectedChildren
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.selectedAssignment) {
      nativeNotificationService.error('Please select an assignment from the homework library');
      return false;
    }
    if (!formData.dueDate) {
      nativeNotificationService.error('Due date is required');
      return false;
    }
    if (formData.assignmentType === 'individual' && formData.selectedChildren.length === 0) {
      nativeNotificationService.error('Please select at least one student for individual assignment');
      return false;
    }
    if (formData.assignmentType === 'class' && !formData.selectedClass) {
      nativeNotificationService.error('Please select a class');
      return false;
    }
    return true;
  };

  // Submit homework assignment
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      // Prepare homework data
      const homeworkData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        instructions: formData.instructions.trim() || null,
        subject: formData.subject,
        grade: formData.grade,
        due_date: `${formData.dueDate} ${formData.dueTime}`,
        estimated_duration: formData.estimatedDuration,
        difficulty: formData.difficulty,
        teacher_id: user.id,
        status: 'active'
      };

      // Add class or individual assignment data
      if (formData.assignmentType === 'class') {
        homeworkData.class_id = formData.selectedClass;
      } else {
        homeworkData.child_ids = formData.selectedChildren;
      }

      console.log('📝 Creating homework assignment:', homeworkData);

      // Create homework assignment
      const response = await apiService.homework.create(homeworkData);
      
      if (response.data.success) {
        nativeNotificationService.success(`Homework "${formData.title}" assigned successfully!`);
        
        // Call parent callback
        if (onHomeworkCreated) {
          onHomeworkCreated(response.data.homework);
        }
        
        // Close modal
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to create homework');
      }

    } catch (error) {
      console.error('Error creating homework:', error);
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to create homework';
      nativeNotificationService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && availableChildren.length === 0) {
    return (
      <div className={'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'}>
        <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-3">
            <FaSpinner className="animate-spin text-blue-500" />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Homework Assignment
            </h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaBook className="inline mr-2" />
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="e.g., Math Practice: Addition and Subtraction"
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaTags className="inline mr-2" />
                Subject
              </label>
              <select
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="English">English</option>
                <option value="Science">Science</option>
                <option value="Social Studies">Social Studies</option>
                <option value="Art">Art</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Music">Music</option>
                <option value="Life Skills">Life Skills</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaGraduationCap className="inline mr-2" />
                Grade Level
              </label>
              <select
                value={formData.grade}
                onChange={(e) => handleInputChange('grade', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="">Select Grade</option>
                <option value="Pre-K">Pre-K</option>
                <option value="Kindergarten">Kindergarten</option>
                <option value="Grade 1">Grade 1</option>
                <option value="Grade 2">Grade 2</option>
                <option value="Grade 3">Grade 3</option>
                <option value="Mixed">Mixed Levels</option>
              </select>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Difficulty Level
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => handleInputChange('difficulty', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FaFileAlt className="inline mr-2" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Brief description of the homework assignment..."
            />
          </div>

          {/* Instructions */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Detailed Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => handleInputChange('instructions', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Detailed step-by-step instructions for students..."
            />
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaCalendarAlt className="inline mr-2" />
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <FaClock className="inline mr-2" />
                Due Time
              </label>
              <input
                type="time"
                value={formData.dueTime}
                onChange={(e) => handleInputChange('dueTime', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Est. Duration (minutes)
              </label>
              <input
                type="number"
                value={formData.estimatedDuration}
                onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
                min={5}
                max={180}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Assignment Type */}
          <div>
            <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Assignment Type
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => handleAssignmentTypeChange('class')}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.assignmentType === 'class'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isDark 
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <FaUsers className="mr-2" />
                Entire Class
              </button>
              <button
                type="button"
                onClick={() => handleAssignmentTypeChange('individual')}
                className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                  formData.assignmentType === 'individual'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : isDark 
                      ? 'border-gray-600 text-gray-300 hover:border-gray-500'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <FaUser className="mr-2" />
                Individual Students
              </button>
            </div>
          </div>

          {/* Individual Student Selection */}
          {formData.assignmentType === 'individual' && (
            <div>
              <label className={`block text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Select Students (Test Children: Daniel & Shirley Baker)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableChildren.map(child => (
                  <div
                    key={child.id}
                    className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                      formData.selectedChildren.includes(child.id)
                        ? 'border-blue-500 bg-blue-50'
                        : isDark 
                          ? 'border-gray-600 hover:border-gray-500'
                          : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => handleChildSelection(child.id)}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 border-2 rounded mr-3 flex items-center justify-center ${
                        formData.selectedChildren.includes(child.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.selectedChildren.includes(child.id) && (
                          <FaCheckCircle className="text-white text-xs" />
                        )}
                      </div>
                      <div>
                        <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {child.name}
                        </div>
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {child.className} Class
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {availableChildren.length === 0 && (
                <div className={`text-center py-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaExclamationTriangle className="mx-auto mb-2" />
                  <p>No test children (Daniel or Shirley Baker) found in your classes.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-end space-x-3`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Creating...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Create Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdvancedHomeworkAssignment;
