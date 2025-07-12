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
import { HeaderAd, ContentMiddleAd, SidebarAd, ContentBottomAd } from '../components/ads';

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

  const handleActivitySelect = (activity) => {
    setSelectedActivity(activity);
  };

  const handleAssignActivity = async () => {
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
    <ErrorBoundary>
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors`}>
        {/* Header Ad - Premium placement for high-value page */}
        <HeaderAd pageType="activities" className="mb-6" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className={`p-2 rounded-lg mr-4 transition-colors ${
                  isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <FaArrowLeft />
              </button>
              <div>
                <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Learning Activities
                </h1>
                <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Interactive games and exercises for young learners
                </p>
              </div>
            </div>
            
            {user?.role === 'teacher' && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <FaClipboardList className="mr-2" />
                Assign Activity
              </button>
            )}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Activities Grid - Main Content */}
            <div className="lg:col-span-3">
              {/* Activity Selection */}
              {!selectedActivity ? (
                <div className="space-y-6">
                  {/* Stats Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center">
                        <FaTrophy className="text-3xl text-yellow-500 mr-4" />
                        <div>
                          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {completedActivities.length}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Completed
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center">
                        <FaCalculator className="text-3xl text-blue-500 mr-4" />
                        <div>
                          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activities.length}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Available
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-center">
                        <FaRobot className="text-3xl text-green-500 mr-4" />
                        <div>
                          <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {Math.round((completedActivities.length / activities.length) * 100) || 0}%
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            Progress
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Native Ad - Between stats and activities */}
                  <ContentMiddleAd pageType="activities" className="my-8" />

                  {/* Activities Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {activities.map((activity) => {
                      const Icon = activity.icon;
                      const isCompleted = completedActivities.includes(activity.id);
                      
                      return (
                        <div
                          key={activity.id}
                          className={`relative p-6 rounded-xl shadow-lg cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                            isDark ? 'bg-gray-800' : 'bg-white'
                          } ${isCompleted ? 'ring-2 ring-green-500' : ''}`}
                          onClick={() => handleActivitySelect(activity)}
                        >
                          {/* Completion Badge */}
                          {isCompleted && (
                            <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-2">
                              <FaTrophy className="text-sm" />
                            </div>
                          )}
                          
                          {/* Activity Icon */}
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${activity.color}`}>
                            <Icon className="text-2xl text-white" />
                          </div>
                          
                          {/* Activity Info */}
                          <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {activity.title}
                          </h3>
                          <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {activity.description}
                          </p>
                          
                          {/* Activity Details */}
                          <div className="flex justify-between items-center text-xs">
                            <span className={`px-2 py-1 rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                              {activity.subject}
                            </span>
                            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {activity.duration}
                            </span>
                          </div>
                          
                          {/* Difficulty Indicator */}
                          <div className="mt-3 flex items-center">
                            <span className={`text-xs mr-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {activity.difficulty}
                            </span>
                            <div className="flex space-x-1">
                              {[...Array(3)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-2 rounded-full ${
                                    i < (activity.difficulty === 'Easy' ? 1 : activity.difficulty === 'Medium' ? 2 : 3)
                                      ? 'bg-blue-500'
                                      : isDark ? 'bg-gray-700' : 'bg-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Activity Player */
                <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  {/* Activity Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={() => setSelectedActivity(null)}
                          className={`p-2 rounded-lg mr-4 transition-colors ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FaArrowLeft />
                        </button>
                        <div>
                          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {selectedActivity.title}
                          </h2>
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {selectedActivity.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Activity Content */}
                  <div className="p-6">
                    <LazyLoader>
                      {selectedActivity.component ? (
                        <selectedActivity.component 
                          onComplete={() => handleActivityComplete(selectedActivity.id)}
                          isDark={isDark}
                        />
                      ) : (
                        <div className="text-center py-12">
                          <FaRobot className="text-6xl text-gray-400 mx-auto mb-4" />
                          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            Coming Soon!
                          </h3>
                          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            This activity is being developed and will be available soon.
                          </p>
                        </div>
                      )}
                    </LazyLoader>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Sidebar Ad - Rectangle format */}
              <SidebarAd pageType="activities" className="sticky top-6" />

              {/* Progress Summary */}
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Your Progress
                </h3>
                <div className="space-y-3">
                  {activities.slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {activity.title}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        completedActivities.includes(activity.id)
                          ? 'bg-green-100 text-green-800'
                          : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {completedActivities.includes(activity.id) ? 'Done' : 'Todo'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Tips */}
              <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Learning Tips
                </h3>
                <div className="space-y-3 text-sm">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
                    <p className={`${isDark ? 'text-gray-300' : 'text-blue-800'}`}>
                      Take breaks every 15-20 minutes to stay focused
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
                    <p className={`${isDark ? 'text-gray-300' : 'text-green-800'}`}>
                      Practice regularly for better learning outcomes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Content Ad */}
          <ContentBottomAd pageType="activities" className="mt-12" />
        </div>

        {/* Assignment Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`max-w-md w-full mx-4 p-6 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Assign Activity
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Assignment Type
                  </label>
                  <select
                    value={assignmentForm.assignmentType}
                    onChange={(e) => setAssignmentForm({...assignmentForm, assignmentType: e.target.value})}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="class">Entire Class</option>
                    <option value="individual">Individual Students</option>
                    <option value="group">Group Assignment</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Instructions
                  </label>
                  <textarea
                    value={assignmentForm.instructions}
                    onChange={(e) => setAssignmentForm({...assignmentForm, instructions: e.target.value})}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows="3"
                    placeholder="Enter assignment instructions..."
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({...assignmentForm, dueDate: e.target.value})}
                    className={`w-full p-3 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className={`px-4 py-2 rounded-lg ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Assigning...' : 'Assign'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Activities; 