import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { FaTrophy, FaCalculator, FaRobot, FaPalette, FaShapes, FaSpellCheck, FaLeaf, FaClipboardList, FaArrowLeft } from 'react-icons/fa';
import apiService from '../services/apiService';
import ErrorBoundary from '../components/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import nativeNotificationService from '../services/nativeNotificationService';
import LazyLoader from '../components/LazyLoader';
import MazeActivity from '../components/PWA/MazeActivity';

const Activities = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [students, setStudents] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    assignmentType: 'class',
    selectedStudents: [],
    instructions: '',
    dueDate: '',
    difficulty: 'medium'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'teacher') {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      // Fetch students from API when backend is ready
      const response = await apiService.children.getAll();
      setStudents(response.data.children || []);
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents([]);
    }
  };

  const activities = [
    {
      id: 'maze-robot',
      title: 'Robot Maze Navigator',
      description: 'Guide a robot through a maze using directional commands',
      icon: FaRobot,
      subject: 'Coding',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Easy',
      color: 'bg-blue-500',
      component: MazeActivity
    },
    {
      id: 'counting-fruits',
      title: 'Fruit Counter',
      description: 'Count fruits and match with numbers',
      icon: FaCalculator,
      subject: 'Math',
      ageGroup: '4-6',
      duration: '10-15 min',
      difficulty: 'Easy',
      color: 'bg-green-500',
      component: null // Placeholder for future implementation
    },
    {
      id: 'color-matching',
      title: 'Color Matching Game',
      description: 'Match objects with their corresponding colors',
      icon: FaPalette,
      subject: 'Colors',
      ageGroup: '4-6',
      duration: '10-15 min',
      difficulty: 'Easy',
      color: 'bg-pink-500',
      component: null
    },
    {
      id: 'shape-sorter',
      title: 'Shape Sorter',
      description: 'Sort different shapes into correct categories',
      icon: FaShapes,
      subject: 'Sorting',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Easy',
      color: 'bg-purple-500',
      component: null
    },
    {
      id: 'letter-finder',
      title: 'Letter Finder',
      description: 'Find and identify letters in words',
      icon: FaSpellCheck,
      subject: 'English',
      ageGroup: '4-6',
      duration: '15-20 min',
      difficulty: 'Easy',
      color: 'bg-yellow-500',
      component: null
    },
    {
      id: 'nature-explorer',
      title: 'Nature Explorer',
      description: 'Learn about plants and animals in their habitats',
      icon: FaLeaf,
      subject: 'Science',
      ageGroup: '4-6',
      duration: '20-25 min',
      difficulty: 'Medium',
      color: 'bg-green-600',
      component: null
    }
  ];

  const handleActivityComplete = (activityId, result) => {
    console.log('Activity completed:', activityId, result);
    
    // Add to completed activities if not already there
    if (!completedActivities.find(comp => comp.id === activityId)) {
      setCompletedActivities(prev => [...prev, {
        id: activityId,
        completedAt: new Date(),
        score: result.score,
        ...result
      }]);
    }

    // You could save this to the backend here
    // apiService.activities.saveProgress(activityId, result);
  };

  const handleAssignActivity = (activity, event) => {
    event.stopPropagation(); // Prevent card click
    setSelectedActivity(activity);
    setAssignmentForm({
      assignmentType: 'class',
      selectedStudents: [],
      instructions: `Complete the ${activity.title} activity. ${activity.description}`,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      difficulty: activity.difficulty || 'medium'
    });
    setShowAssignModal(true);
  };

  const handleFormChange = (field, value) => {
    setAssignmentForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStudentSelection = (studentId) => {
    setAssignmentForm(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const handleSubmitAssignment = async () => {
    if (!selectedActivity) return;

    if (assignmentForm.assignmentType === 'individual' && assignmentForm.selectedStudents.length === 0) {
      nativeNotificationService.error('Please select at least one student for individual assignment');
      return;
    }

    setLoading(true);
    try {
      // Simulate assignment (replace with actual API call when backend is ready)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const studentsCount = assignmentForm.assignmentType === 'class' 
        ? students.length 
        : assignmentForm.selectedStudents.length;

      nativeNotificationService.success(`Activity "${selectedActivity.title}" assigned to ${studentsCount} student${studentsCount !== 1 ? 's' : ''}!`);
      
      setShowAssignModal(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error assigning activity:', error);
      nativeNotificationService.error('Failed to assign activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
    case 'easy':
      return isDark ? 'text-green-400' : 'text-green-600';
    case 'medium':
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    case 'hard':
      return isDark ? 'text-red-400' : 'text-red-600';
    default:
      return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const isActivityCompleted = (activityId) => {
    return completedActivities.some(comp => comp.id === activityId);
  };

  const getActivityScore = (activityId) => {
    const completed = completedActivities.find(comp => comp.id === activityId);
    return completed ? completed.score : 0;
  };

  const ActivityCard = ({ activity }) => {
    const IconComponent = activity.icon;
    const isCompleted = isActivityCompleted(activity.id);
    const score = getActivityScore(activity.id);

    return (
      <div 
        className={`relative p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
          isDark ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:bg-gray-50'
        } border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
        onClick={() => {
          if (activity.component) {
            setSelectedActivity(activity);
          }
        }}
      >
        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 flex items-center space-x-1">
            <FaTrophy className="text-yellow-500" />
            <span className="text-sm font-bold text-yellow-500">{score}</span>
          </div>
        )}

        {/* Activity Icon */}
        <div className={`w-16 h-16 rounded-full ${activity.color} flex items-center justify-center mb-4 mx-auto`}>
          <IconComponent className="text-2xl text-white" />
        </div>

        {/* Activity Info */}
        <div className="text-center">
          <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {activity.title}
          </h3>
          <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {activity.description}
          </p>

          {/* Activity Details */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subject:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {activity.subject}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Age:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {activity.ageGroup}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Duration:</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {activity.duration}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Difficulty:</span>
              <span className={`font-medium ${getDifficultyColor(activity.difficulty)}`}>
                {activity.difficulty}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 space-y-2">
            <button 
              className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                activity.component
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-400 text-white cursor-not-allowed'
              }`}
              disabled={!activity.component}
            >
              {activity.component ? 'Play Now' : 'Coming Soon'}
            </button>
            
            {/* Assignment Button for Teachers */}
            {user?.role === 'teacher' && (
              <button 
                onClick={(e) => handleAssignActivity(activity, e)}
                className="w-full py-2 px-4 rounded-lg font-medium transition-colors bg-green-600 text-white hover:bg-green-700 flex items-center justify-center"
              >
                <FaClipboardList className="mr-2" />
                Assign to Students
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const ActivityRenderer = ({ activity }) => {
    const [currentDifficulty, setCurrentDifficulty] = useState('easy');
    const ActivityComponent = activity.component;

    // Ensure we always start with a valid unlocked level
    const validateAndSetDifficulty = (newDifficulty) => {
      // Get completed levels from localStorage
      try {
        const saved = localStorage.getItem('mazeGameProgress');
        const completedLevels = saved ? JSON.parse(saved) : [];
        const levelOrder = ['easy', 'medium', 'hard', 'expert', 'master'];
        
        // Check if the requested level is unlocked
        if (newDifficulty === 'easy') {
          setCurrentDifficulty('easy');
          return;
        }
        
        const levelIndex = levelOrder.indexOf(newDifficulty);
        const previousLevel = levelOrder[levelIndex - 1];
        
        if (completedLevels.includes(previousLevel)) {
          setCurrentDifficulty(newDifficulty);
        } else {
          // If trying to access locked level, revert to easy
          setCurrentDifficulty('easy');
        }
      } catch {
        // If any error, default to easy
        setCurrentDifficulty('easy');
      }
    };

    // Validate initial difficulty on component mount for maze game
    React.useEffect(() => {
      if (activity.id === 'maze-robot') {
        validateAndSetDifficulty(currentDifficulty);
      }
    }, [activity.id, currentDifficulty]);
    
    if (!ActivityComponent) {
      return (
        <div className={`text-center p-8 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <h3 className="text-xl font-bold mb-4">Activity Not Available</h3>
          <p>This activity is coming soon!</p>
        </div>
      );
    }

    // Special handling for maze activity to include level management
    if (activity.id === 'maze-robot') {
      return (
        <ActivityComponent 
          onComplete={(result) => handleActivityComplete(activity.id, result)}
          difficulty={currentDifficulty}
          onLevelChange={validateAndSetDifficulty}
        />
      );
    }

    return (
      <ActivityComponent 
        onComplete={(result) => handleActivityComplete(activity.id, result)}
        difficulty={currentDifficulty}
      />
    );
  };

  if (selectedActivity) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* Back Button */}
        <div className="absolute top-0 left-0 z-10 p-4">
          <button
            onClick={() => setSelectedActivity(null)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Activities
          </button>
        </div>

        {/* Activity Component */}
        <div className="h-screen w-full">
          <ActivityRenderer activity={selectedActivity} />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header section - ads removed */}

        {/* Back Button */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className={`text-3xl sm:text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            🎮 Learning Activities
          </h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Fun and educational activities for young learners
          </p>
        </div>

        {/* Content section - ads removed */}

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>

        {/* Footer section - ads removed */}
      </div>

      {/* Assignment Modal for Teachers */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-xl shadow-2xl ${
            isDark ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Assign Activity: {selectedActivity?.title}
              </h3>
              
              {/* Assignment Type */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Assignment Type
                </label>
                <select
                  value={assignmentForm.assignmentType}
                  onChange={(e) => handleFormChange('assignmentType', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="class">Assign to Entire Class</option>
                  <option value="individual">Assign to Individual Students</option>
                </select>
              </div>

              {/* Student Selection (if individual) */}
              {assignmentForm.assignmentType === 'individual' && (
                <div className="mb-4">
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Select Students
                  </label>
                  <div className="max-h-32 overflow-y-auto border rounded-lg p-2">
                    {students.map(student => (
                      <label key={student.id} className="flex items-center space-x-2 p-1">
                        <input
                          type="checkbox"
                          checked={assignmentForm.selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          className="rounded"
                        />
                        <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {student.first_name} {student.last_name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Due Date */}
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => handleFormChange('dueDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Instructions */}
              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Instructions
                </label>
                <textarea
                  value={assignmentForm.instructions}
                  onChange={(e) => handleFormChange('instructions', e.target.value)}
                  rows="3"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                    isDark 
                      ? 'bg-gray-600 text-white hover:bg-gray-700' 
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={loading}
                  className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign Activity'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Activities; 