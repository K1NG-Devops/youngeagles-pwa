import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaCalculator, FaPalette, FaShapes, FaSpellCheck, FaLeaf, FaArrowLeft, FaTrophy, FaUsers, FaUser, FaClipboardList } from 'react-icons/fa';
import nativeNotificationService from '../services/nativeNotificationService.js';
import MazeActivity from '../components/PWA/MazeActivity';
import apiService from '../services/apiService';

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
    <div className={`min-h-screen py-6 pt-24 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full">
        {/* Back Button */}
        <div className="mb-4 px-4">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Interactive Activities Hub</h1>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Fun and educational activities for young learners
          </p>
          
          {/* Stats */}
          {completedActivities.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} inline-block`}>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">{completedActivities.length}</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {Math.round(completedActivities.reduce((sum, comp) => sum + comp.score, 0) / completedActivities.length)}
                  </div>
                  <div className="text-sm text-gray-500">Avg Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {Math.round((completedActivities.length / activities.length) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activities.map((activity) => (
            <ActivityCard key={activity.id} activity={activity} />
          ))}
        </div>

        {/* Info Section */}
        <div className={`mt-12 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            About Interactive Activities
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Educational Benefits
              </h3>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Develops problem-solving skills</li>
                <li>• Enhances logical thinking</li>
                <li>• Improves hand-eye coordination</li>
                <li>• Builds confidence through achievement</li>
                <li>• Makes learning fun and engaging</li>
              </ul>
            </div>
            <div>
              <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                How to Use
              </h3>
              <ul className={`text-sm space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                <li>• Click on any activity card to start</li>
                <li>• Follow the instructions in each activity</li>
                <li>• Complete activities to earn scores</li>
                <li>• Track your progress over time</li>
                <li>• Try different difficulty levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`max-w-2xl w-full rounded-lg shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Assign: {selectedActivity.title}</h2>
              
              {/* Assignment Type */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Assignment Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="class"
                      checked={assignmentForm.assignmentType === 'class'}
                      onChange={(e) => handleFormChange('assignmentType', e.target.value)}
                      className="mr-2"
                    />
                    <FaUsers className="mr-2" />
                    Entire Class ({students.length} students)
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="individual"
                      checked={assignmentForm.assignmentType === 'individual'}
                      onChange={(e) => handleFormChange('assignmentType', e.target.value)}
                      className="mr-2"
                    />
                    <FaUser className="mr-2" />
                    Individual Students
                  </label>
                </div>
              </div>

              {/* Student Selection (for individual assignments) */}
              {assignmentForm.assignmentType === 'individual' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Students</label>
                  <div className={`max-h-40 overflow-y-auto p-3 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                    {students.map((student) => (
                      <label key={student.id} className="flex items-center py-2">
                        <input
                          type="checkbox"
                          checked={assignmentForm.selectedStudents.includes(student.id)}
                          onChange={() => handleStudentSelection(student.id)}
                          className="mr-3"
                        />
                        <span>{student.first_name} {student.last_name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Instructions for Students</label>
                <textarea
                  value={assignmentForm.instructions}
                  onChange={(e) => handleFormChange('instructions', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                  rows="3"
                  placeholder="Enter instructions for students..."
                />
              </div>

              {/* Due Date */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <input
                  type="date"
                  value={assignmentForm.dueDate}
                  onChange={(e) => handleFormChange('dueDate', e.target.value)}
                  className={`w-full p-3 border rounded-lg ${isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300'}`}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className={`flex-1 py-2 px-4 rounded-lg border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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