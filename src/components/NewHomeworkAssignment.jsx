import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
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
  FaExclamationTriangle,
  FaChevronDown,
  FaStar,
  FaLock,
  FaUnlock
} from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';

const NewHomeworkAssignment = ({ onClose, onHomeworkCreated }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingChildren, setLoadingChildren] = useState(false);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [classes, setClasses] = useState([]);

  // CAPS-aligned homework library
  const homeworkLibrary = [
    {
      id: 1,
      title: "Counting and Number Recognition 1-10",
      subject: "Mathematics",
      ageGroup: "2-3",
      difficulty: "easy",
      description: "Interactive counting exercises with numbers 1-10 using colorful objects and visual aids.",
      estimatedDuration: 15,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 2,
      title: "Basic Shape Recognition",
      subject: "Mathematics",
      ageGroup: "2-3",
      difficulty: "easy",
      description: "Identify and name basic shapes: circle, square, triangle, and rectangle.",
      estimatedDuration: 20,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 3,
      title: "Letter Recognition A-E",
      subject: "Language",
      ageGroup: "2-3",
      difficulty: "medium",
      description: "Introduction to the first five letters of the alphabet with sound recognition.",
      estimatedDuration: 25,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 4,
      title: "Colors and Patterns",
      subject: "Art & Creativity",
      ageGroup: "2-3",
      difficulty: "easy",
      description: "Learn primary colors and simple patterns through creative activities.",
      estimatedDuration: 30,
      prerequisites: null,
      unlocked: true
    },
    {
      id: 5,
      title: "Counting 11-20",
      subject: "Mathematics",
      ageGroup: "4-6",
      difficulty: "medium",
      description: "Advanced counting exercises with teen numbers and simple addition.",
      estimatedDuration: 25,
      prerequisites: [1],
      unlocked: false
    },
    {
      id: 6,
      title: "Letter Recognition F-J",
      subject: "Language",
      ageGroup: "4-6",
      difficulty: "medium",
      description: "Continue alphabet learning with letters F through J.",
      estimatedDuration: 30,
      prerequisites: [3],
      unlocked: false
    },
    {
      id: 7,
      title: "Simple Word Formation",
      subject: "Language",
      ageGroup: "4-6",
      difficulty: "hard",
      description: "Combine letters to form simple 3-letter words.",
      estimatedDuration: 35,
      prerequisites: [3, 6],
      unlocked: false
    },
    {
      id: 8,
      title: "Basic Addition 1-5",
      subject: "Mathematics",
      ageGroup: "4-6",
      difficulty: "hard",
      description: "Introduction to addition concepts using visual aids and manipulatives.",
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
          
          // Load children from all teacher's classes
          await loadChildrenFromClasses(teacherClasses);
        }
        
      } catch (error) {
        console.error('Error loading teacher data:', error);
        toast.error('Failed to load class data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      loadTeacherData();
    }
  }, [user]);

  // Function to load children from all teacher's classes
  const loadChildrenFromClasses = async (teacherClasses) => {
    try {
      setLoadingChildren(true);
      let allChildren = [];
      
      // Try to get children from each class
      for (const cls of teacherClasses) {
        try {
          const childrenResponse = await apiService.classes.getChildren(cls.id);
          const classChildren = childrenResponse.data.children || [];
          
          // Add class name to each child for display
          const childrenWithClass = classChildren.map(child => ({
            ...child,
            className: cls.name || 'Unknown Class'
          }));
          
          allChildren = [...allChildren, ...childrenWithClass];
          console.log(`📚 Found ${classChildren.length} children in class ${cls.name}`);
        } catch (error) {
          console.error(`Error getting children for class ${cls.id}:`, error);
        }
      }
      
      // If no children found in classes API, try attendance API as fallback
      if (allChildren.length === 0) {
        console.log('⚠️ No children found in classes API, trying attendance API...');
        try {
          const attendanceResponse = await apiService.attendance.getByClass();
          if (attendanceResponse.data.success && attendanceResponse.data.students) {
            allChildren = attendanceResponse.data.students.map(student => ({
              id: student.id,
              name: student.name || `Student ${student.id}`,
              first_name: student.name ? student.name.split(' ')[0] : 'Student',
              last_name: student.name ? student.name.split(' ').slice(1).join(' ') : `${student.id}`,
              className: attendanceResponse.data.className || 'My Class'
            }));
            console.log(`✅ Found ${allChildren.length} students from attendance API`);
          }
        } catch (attendanceError) {
          console.error('Error getting students from attendance API:', attendanceError);
        }
      }
      
      console.log(`👥 Total children loaded: ${allChildren.length}`, allChildren);
      setAvailableChildren(allChildren);
      
    } catch (error) {
      console.error('Error loading children from classes:', error);
      toast.error('Failed to load student data');
    } finally {
      setLoadingChildren(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Get assignment from library by ID
  const getSelectedAssignment = () => {
    return homeworkLibrary.find(assignment => assignment.id.toString() === formData.selectedAssignment);
  };

  // Check if assignment is unlocked based on prerequisites
  const isAssignmentUnlocked = (assignment) => {
    if (!assignment.prerequisites) return true;
    // For now, we'll make all assignments unlocked for demo purposes
    // In a real implementation, you'd check if prerequisite assignments are completed
    return true;
  };

  // Filter assignments by age group (only show 2-3 and 4-6 as per requirements)
  const getFilteredAssignments = () => {
    return homeworkLibrary.filter(assignment => 
      isAssignmentUnlocked(assignment) && 
      (assignment.ageGroup === '2-3' || assignment.ageGroup === '4-6')
    );
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
      toast.error('Please select an assignment from the homework library');
      return false;
    }
    if (!formData.dueDate) {
      toast.error('Due date is required');
      return false;
    }
    if (formData.assignmentType === 'individual' && formData.selectedChildren.length === 0) {
      toast.error('Please select at least one student for individual assignment');
      return false;
    }
    if (formData.assignmentType === 'class' && !formData.selectedClass) {
      toast.error('Please select a class');
      return false;
    }
    return true;
  };

  // Submit homework assignment
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);
      const selectedAssignment = getSelectedAssignment();
      if (!selectedAssignment) {
        toast.error('Selected assignment not found');
        return;
      }

      // Prepare homework data using selected assignment from library
      const homeworkData = {
        title: selectedAssignment.title,
        description: selectedAssignment.description,
        instructions: formData.teacherInstructions.trim() || null,
        subject: selectedAssignment.subject,
        grade: selectedAssignment.ageGroup, // Map age group to grade
        due_date: `${formData.dueDate} ${formData.dueTime}`,
        estimated_duration: selectedAssignment.estimatedDuration,
        difficulty: selectedAssignment.difficulty,
        teacher_id: user.id,
        status: 'active',
        assignment_type: formData.assignmentType
      };

      // Add class or individual assignment data
      if (formData.assignmentType === 'class') {
        homeworkData.class_id = formData.selectedClass;
      } else {
        // For individual assignments, get the class_id from the first selected child
        const firstChildId = formData.selectedChildren[0];
        const firstChild = availableChildren.find(child => child.id === firstChildId);
        
        if (firstChild && firstChild.className) {
          // Find the class_id by matching className with the teacher's classes
          const matchingClass = classes.find(cls => cls.name === firstChild.className);
          if (matchingClass) {
            homeworkData.class_id = matchingClass.id;
            console.log(`📝 Setting class_id ${matchingClass.id} for individual assignment to ${firstChild.className} class`);
          }
        }
        
        homeworkData.child_ids = formData.selectedChildren;
        console.log(`👥 Individual assignment for ${formData.selectedChildren.length} students`);
      }

      console.log('📝 Creating homework assignment:', homeworkData);

      // Create homework assignment
      const response = await apiService.homework.create(homeworkData);
      
      if (response.data.success) {
        toast.success(`Assignment "${selectedAssignment.title}" posted successfully!`);
        
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
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && availableChildren.length === 0) {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
        <div className={`p-8 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center space-x-3">
            <FaSpinner className="animate-spin text-blue-500" />
            <span className={isDark ? 'text-white' : 'text-gray-900'}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  const selectedAssignment = getSelectedAssignment();

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
          {/* Assignment Selection */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FaBook className="inline mr-2" />
              Select Assignment from CAPS-Aligned Library *
            </label>
            <select
              value={formData.selectedAssignment}
              onChange={(e) => handleInputChange('selectedAssignment', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Choose an assignment from the library</option>
              {getFilteredAssignments().map((assignment) => (
                <option key={assignment.id} value={assignment.id}>
                  {assignment.title} - {assignment.subject} (Age {assignment.ageGroup})
                </option>
              ))}
            </select>
          </div>

          {/* Assignment Preview */}
          {selectedAssignment && (
            <div className={`rounded-lg p-4 border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Assignment Preview
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center">
                  <FaTags className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Subject: {selectedAssignment.subject}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaGraduationCap className={`mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Age: {selectedAssignment.ageGroup}
                  </span>
                </div>
                <div className="flex items-center">
                  <FaClock className={`mr-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    Duration: {selectedAssignment.estimatedDuration} min
                  </span>
                </div>
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedAssignment.description}
              </p>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  selectedAssignment.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                  selectedAssignment.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                  'bg-red-200 text-red-800'
                }`}>
                  {selectedAssignment.difficulty.toUpperCase()}
                </span>
              </div>
            </div>
          )}

          {/* Teacher Instructions */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <FaFileAlt className="inline mr-2" />
              Additional Teacher Instructions
            </label>
            <textarea
              value={formData.teacherInstructions}
              onChange={(e) => handleInputChange('teacherInstructions', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Any additional instructions for the students..."
            />
          </div>

          {/* Due Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Select Students from Your Classes
              </label>
              {loadingChildren ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaSpinner className="animate-spin mx-auto mb-2 text-2xl" />
                  <p>Loading students from your classes...</p>
                </div>
              ) : availableChildren.length > 0 ? (
                <>
                  <div className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose one or more students to assign this homework to individually.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
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
                              {child.name || `${child.first_name} ${child.last_name}`}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {child.className || 'Unknown Class'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {formData.selectedChildren.length > 0 && (
                    <div className={`mt-3 p-2 rounded text-sm ${
                      isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {formData.selectedChildren.length} student{formData.selectedChildren.length > 1 ? 's' : ''} selected
                    </div>
                  )}
                </>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <FaExclamationTriangle className="mx-auto mb-2 text-2xl" />
                  <p className="mb-2">No students found in your classes.</p>
                  <p className="text-xs">Please make sure you have students enrolled in your classes.</p>
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
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Posting...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                Post Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewHomeworkAssignment;
