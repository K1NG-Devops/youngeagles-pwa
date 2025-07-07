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

  // Complete CAPS-aligned homework library
  const homeworkLibrary = [
    {
      id: 1,
      title: 'Counting and Number Recognition 1-10',
      subject: 'Mathematics',
      ageGroup: '2-3',
      difficulty: 'easy',
      description: 'Complete counting homework with interactive exercises, number tracing, and real-world counting activities.',
      estimatedDuration: 20,
      prerequisites: null,
      unlocked: true,
      materials: [
        'Number cards 1-10 (provided)',
        'Counting worksheet (downloadable)',
        'Small objects for counting (toys, blocks)',
        'Crayons for number coloring'
      ],
      activities: [
        'Count objects from 1-10 around the house',
        'Trace numbers 1-10 on worksheet',
        'Match quantity dots to correct numbers',
        'Practice writing numbers 1-5'
      ],
      worksheets: [
        'Number_Tracing_1-10.pdf',
        'Counting_Objects_Worksheet.pdf',
        'Number_Matching_Activity.pdf'
      ],
      parentInstructions: 'Help your child count everyday objects. Practice numbers during daily routines like counting steps or toys.'
    },
    {
      id: 2,
      title: 'Basic Shape Recognition & Sorting',
      subject: 'Mathematics',
      ageGroup: '2-3',
      difficulty: 'easy',
      description: 'Interactive shape learning with household object sorting, shape tracing, and creative shape art.',
      estimatedDuration: 25,
      prerequisites: null,
      unlocked: true,
      materials: [
        'Shape cards (circle, square, triangle, rectangle)',
        'Shape sorting worksheet (downloadable)',
        'Household objects of different shapes',
        'Safety scissors for cutting shapes'
      ],
      activities: [
        'Find shapes around your home',
        'Sort objects by their shapes',
        'Trace shapes on worksheet',
        'Create shape art using cut-out shapes'
      ],
      worksheets: [
        'Shape_Recognition_Cards.pdf',
        'Shape_Sorting_Activity.pdf',
        'Shape_Tracing_Practice.pdf'
      ],
      parentInstructions: "Point out shapes during daily activities. Use shape vocabulary: 'The plate is round like a circle.'"
    },
    {
      id: 3,
      title: 'Letter Recognition A-E with Phonics',
      subject: 'Language',
      ageGroup: '2-3',
      difficulty: 'medium',
      description: 'Complete phonics homework covering letters A-E with sound practice, letter formation, and object identification.',
      estimatedDuration: 30,
      prerequisites: null,
      unlocked: true,
      materials: [
        'Letter cards A-E (provided)',
        'Phonics worksheet pack (downloadable)',
        'Mirror for sound practice',
        'Objects starting with A, B, C, D, E'
      ],
      activities: [
        'Practice letter sounds /a/, /b/, /c/, /d/, /e/',
        'Trace letters A-E correctly',
        'Find objects starting with each letter',
        'Complete letter-sound matching worksheet'
      ],
      worksheets: [
        'Letter_Tracing_A-E.pdf',
        'Phonics_Sound_Practice.pdf',
        'Letter_Object_Matching.pdf'
      ],
      parentInstructions: "Practice letter sounds daily. Emphasize the first sound in words: 'Apple starts with /a/.'"
    },
    {
      id: 4,
      title: 'Colors, Patterns & Creative Art',
      subject: 'Art & Creativity',
      ageGroup: '2-3',
      difficulty: 'easy',
      description: 'Art-based homework exploring primary colors, simple patterns, and creative expression through various mediums.',
      estimatedDuration: 35,
      prerequisites: null,
      unlocked: true,
      materials: [
        'Primary color paints or crayons',
        'Pattern worksheet (downloadable)',
        'Paper for art projects',
        'Household items for pattern making'
      ],
      activities: [
        'Name and use primary colors (red, blue, yellow)',
        'Create AB patterns with colors or objects',
        'Make rainbow art using all colors',
        'Color mixing experiment (optional)'
      ],
      worksheets: [
        'Color_Identification_Sheet.pdf',
        'Pattern_Practice_Activities.pdf',
        'Creative_Art_Templates.pdf'
      ],
      parentInstructions: 'Let your child explore colors freely. Talk about colors you see together throughout the day.'
    },
    {
      id: 5,
      title: 'Advanced Counting 11-20 & Teen Numbers',
      subject: 'Mathematics',
      ageGroup: '4-6',
      difficulty: 'medium',
      description: 'Extended counting homework focusing on teen numbers, quantity recognition, and basic addition concepts.',
      estimatedDuration: 30,
      prerequisites: [1],
      unlocked: true,
      materials: [
        'Number cards 11-20 (provided)',
        'Teen numbers worksheet (downloadable)',
        'Counting manipulatives (beans, buttons)',
        'Number line poster'
      ],
      activities: [
        'Count objects from 11-20 accurately',
        'Recognize and write teen numbers',
        'Practice number order 1-20',
        'Simple addition within 10'
      ],
      worksheets: [
        'Teen_Numbers_Practice.pdf',
        'Advanced_Counting_Activities.pdf',
        'Number_Line_Exercises.pdf'
      ],
      parentInstructions: 'Use a number line for practice. Count steps, toys, or snacks to reinforce teen numbers.'
    },
    {
      id: 6,
      title: 'Letter Recognition F-J & Word Building',
      subject: 'Language',
      ageGroup: '4-6',
      difficulty: 'medium',
      description: 'Advanced phonics homework extending alphabet knowledge with letters F-J and beginning word formation.',
      estimatedDuration: 35,
      prerequisites: [3],
      unlocked: true,
      materials: [
        'Letter cards F-J (provided)',
        'Word building worksheet (downloadable)',
        'Letter tiles or magnetic letters',
        'Simple picture books'
      ],
      activities: [
        'Master letter sounds /f/, /g/, /h/, /i/, /j/',
        'Practice proper letter formation F-J',
        'Build simple CVC words (cat, bat, hat)',
        'Identify letters in simple books'
      ],
      worksheets: [
        'Letters_F-J_Practice.pdf',
        'Word_Building_Activities.pdf',
        'Letter_Recognition_Games.pdf'
      ],
      parentInstructions: 'Read together daily. Point out letters F-J in books and environmental print.'
    },
    {
      id: 7,
      title: 'Simple Word Formation & Reading',
      subject: 'Language',
      ageGroup: '4-6',
      difficulty: 'hard',
      description: 'Beginning reading homework combining letters to form words, sight word practice, and simple sentence reading.',
      estimatedDuration: 40,
      prerequisites: [3, 6],
      unlocked: true,
      materials: [
        'Word cards and letter tiles (provided)',
        'Beginning reader worksheet (downloadable)',
        'Sight word flashcards',
        'Simple reading books'
      ],
      activities: [
        'Build and read 3-letter words (CVC pattern)',
        'Practice common sight words (I, see, go)',
        'Read simple sentences aloud',
        'Complete word family activities (-at, -an)'
      ],
      worksheets: [
        'CVC_Word_Building.pdf',
        'Sight_Word_Practice.pdf',
        'Simple_Sentence_Reading.pdf'
      ],
      parentInstructions: 'Practice word families daily. Celebrate reading success! Sound out words together.'
    },
    {
      id: 8,
      title: 'Basic Addition & Number Concepts',
      subject: 'Mathematics',
      ageGroup: '4-6',
      difficulty: 'hard',
      description: 'Introduction to addition concepts using visual aids, manipulatives, and real-world problem solving.',
      estimatedDuration: 45,
      prerequisites: [1, 5],
      unlocked: true,
      materials: [
        'Addition cards and counters (provided)',
        'Math worksheet pack (downloadable)',
        'Small objects for adding (buttons, toys)',
        'Number line for visual support'
      ],
      activities: [
        'Solve addition problems within 5 (2+1=3)',
        'Use objects to demonstrate addition',
        'Practice addition with fingers',
        'Word problems with pictures'
      ],
      worksheets: [
        'Basic_Addition_Practice.pdf',
        'Visual_Addition_Activities.pdf',
        'Math_Word_Problems.pdf'
      ],
      parentInstructions: "Use everyday situations for math: 'You have 2 apples, I give you 1 more. How many now?'"
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
            <div className={`rounded-lg p-6 border ${
              isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📋 Assignment Preview
              </h3>
              
              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              {/* Description */}
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedAssignment.description}
              </p>

              {/* Difficulty Badge */}
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  selectedAssignment.difficulty === 'easy' ? 'bg-green-200 text-green-800' :
                    selectedAssignment.difficulty === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-red-200 text-red-800'
                }`}>
                  {selectedAssignment.difficulty.toUpperCase()} LEVEL
                </span>
              </div>

              {/* Materials Needed */}
              {selectedAssignment.materials && (
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    📦 Materials Included:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {selectedAssignment.materials.map((material, index) => (
                      <div key={index} className={`flex items-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="text-green-500 mr-2">•</span>
                        {material}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Activities */}
              {selectedAssignment.activities && (
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    🎯 Student Activities:
                  </h4>
                  <div className="space-y-1">
                    {selectedAssignment.activities.map((activity, index) => (
                      <div key={index} className={`flex items-start text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="text-blue-500 mr-2 mt-1">{index + 1}.</span>
                        <span>{activity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Worksheets */}
              {selectedAssignment.worksheets && (
                <div className="mb-4">
                  <h4 className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                    📄 Downloadable Worksheets:
                  </h4>
                  <div className="space-y-1">
                    {selectedAssignment.worksheets.map((worksheet, index) => (
                      <div key={index} className={`flex items-center text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <FaFileAlt className="mr-2 text-purple-500" />
                        {worksheet}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Parent Instructions */}
              {selectedAssignment.parentInstructions && (
                <div className={`p-3 rounded-lg mt-4 border-l-4 border-blue-500 ${
                  isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                }`}>
                  <h4 className={`text-sm font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    👨‍👩‍👧‍👦 Parent Guidance:
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                    {selectedAssignment.parentInstructions}
                  </p>
                </div>
              )}
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
            className={'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'}
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
