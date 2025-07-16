import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';
import {
  FaBook,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChild,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaEye,
  FaPlay,
  FaDownload,
  FaSpinner,
  FaGamepad,
  FaUpload,
  FaGraduationCap,
  FaLanguage,
  FaCalculator,
  FaFlask,
  FaGlobe,
  FaPalette,
  FaRunning,
  FaLightbulb,
  FaStar,
  FaUsers,
  FaTrophy,
  FaFire,
  FaChartLine
} from 'react-icons/fa';

const EnhancedParentHomeworkDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  
  const [homework, setHomework] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    submitted: 0,
    graded: 0,
    overdue: 0,
    completionRate: 0,
    weekStreak: 0,
    totalPoints: 0
  });

  // Subject icons mapping
  const getSubjectIcon = (subject) => {
    const iconMap = {
      'literacy': FaLanguage,
      'mathematics': FaCalculator,
      'science': FaFlask,
      'social-studies': FaGlobe,
      'arts': FaPalette,
      'life-skills': FaRunning,
      'technology': FaLightbulb
    };
    return iconMap[subject] || FaBook;
  };

  // Status colors and icons
  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': {
        color: 'orange',
        icon: FaClock,
        text: 'Not Started',
        bgClass: 'bg-orange-100 dark:bg-orange-900',
        textClass: 'text-orange-800 dark:text-orange-200',
        borderClass: 'border-orange-200 dark:border-orange-700'
      },
      'in_progress': {
        color: 'blue',
        icon: FaPlay,
        text: 'In Progress',
        bgClass: 'bg-blue-100 dark:bg-blue-900',
        textClass: 'text-blue-800 dark:text-blue-200',
        borderClass: 'border-blue-200 dark:border-blue-700'
      },
      'submitted': {
        color: 'green',
        icon: FaCheckCircle,
        text: 'Submitted',
        bgClass: 'bg-green-100 dark:bg-green-900',
        textClass: 'text-green-800 dark:text-green-200',
        borderClass: 'border-green-200 dark:border-green-700'
      },
      'graded': {
        color: 'purple',
        icon: FaTrophy,
        text: 'Graded',
        bgClass: 'bg-purple-100 dark:bg-purple-900',
        textClass: 'text-purple-800 dark:text-purple-200',
        borderClass: 'border-purple-200 dark:border-purple-700'
      },
      'overdue': {
        color: 'red',
        icon: FaExclamationTriangle,
        text: 'Overdue',
        bgClass: 'bg-red-100 dark:bg-red-900',
        textClass: 'text-red-800 dark:text-red-200',
        borderClass: 'border-red-200 dark:border-red-700'
      }
    };
    return statusMap[status] || statusMap['pending'];
  };

  // Load data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Fetch children
        const childrenResponse = await apiService.children.getByParent(user.id);
        const childrenData = childrenResponse.data.children || [];
        setChildren(childrenData);

        // Auto-select first child if none selected
        if (childrenData.length > 0 && !selectedChildId) {
          setSelectedChildId(childrenData[0].id.toString());
        }

        // Fetch homework for selected child or first child
        const targetChildId = selectedChildId || (childrenData[0]?.id.toString());
        if (targetChildId) {
          await fetchHomeworkForChild(targetChildId);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        nativeNotificationService.error('Failed to load homework data');
        
        // Set default empty state instead of crashing
        setChildren([]);
        setHomework([]);
        setStats({
          total: 0,
          pending: 0,
          submitted: 0,
          graded: 0,
          overdue: 0,
          completionRate: 0,
          weekStreak: 0,
          totalPoints: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user.id, selectedChildId]);

  const fetchHomeworkForChild = async (childId) => {
    try {
      // Use the parent-based API call with childId parameter
      const response = await apiService.homework.getByParent(user.id, childId);
      const homeworkData = response.data.homework || [];
      setHomework(homeworkData);

      // Calculate statistics
      const total = homeworkData.length;
      const pending = homeworkData.filter(hw => hw.status === 'pending').length;
      const submitted = homeworkData.filter(hw => hw.status === 'submitted').length;
      const graded = homeworkData.filter(hw => hw.status === 'graded').length;
      const overdue = homeworkData.filter(hw => {
        const dueDate = new Date(hw.due_date);
        return hw.status === 'pending' && dueDate < new Date();
      }).length;
      
      const completionRate = total > 0 ? Math.round(((submitted + graded) / total) * 100) : 0;
      const totalPoints = homeworkData
        .filter(hw => hw.status === 'graded' && hw.score)
        .reduce((sum, hw) => sum + (hw.score || 0), 0);

      setStats({
        total,
        pending,
        submitted,
        graded,
        overdue,
        completionRate,
        weekStreak: 5, // Mock data
        totalPoints
      });

    } catch (error) {
      console.error('Error fetching homework:', error);
      setHomework([]);
      
      // Set default stats when no homework found
      setStats({
        total: 0,
        pending: 0,
        submitted: 0,
        graded: 0,
        overdue: 0,
        completionRate: 0,
        weekStreak: 0,
        totalPoints: 0
      });
    }
  };

  const handleHomeworkAction = (homeworkItem) => {
    if (homeworkItem.content_type === 'interactive' || 
        homeworkItem.title.includes('Basic Addition') || 
        homeworkItem.title.includes('Counting') || 
        homeworkItem.title.includes('Number Recognition')) {
      // Interactive homework - go directly to homework details
      navigate(`/homework/${homeworkItem.id}?child_id=${selectedChildId}`);
    } else {
      // Regular homework - go to submit work page
      navigate(`/submit-work?homework_id=${homeworkItem.id}&child_id=${selectedChildId}`);
    }
  };

  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays > 0) return `Due in ${diffDays} days`;
    return `${Math.abs(diffDays)} days overdue`;
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading homework dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      {/* Header Section */}
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            📚 Homework Dashboard
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Track your child's learning progress and assignments
          </p>
        </div>

        {/* Child Selector */}
        {children.length > 1 && (
          <div className="mb-6">
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
              Select Child
            </label>
            <select
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className={`w-full max-w-sm px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isDark 
                  ? 'bg-gray-800 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              {children.map(child => (
                <option key={child.id} value={child.id.toString()}>
                  {child.first_name} {child.last_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Assignments
                </p>
              </div>
              <FaBook className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-orange-500`}>
                  {stats.pending}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Pending
                </p>
              </div>
              <FaClock className="text-orange-500 text-xl" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-green-500`}>
                  {stats.submitted + stats.graded}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </p>
              </div>
              <FaCheckCircle className="text-green-500 text-xl" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-purple-500`}>
                  {stats.completionRate}%
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completion Rate
                </p>
              </div>
              <FaChartLine className="text-purple-500 text-xl" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-yellow-500`}>
                  {stats.weekStreak}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Day Streak
                </p>
              </div>
              <FaFire className="text-yellow-500 text-xl" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-indigo-500`}>
                  {stats.totalPoints}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Points Earned
                </p>
              </div>
              <FaTrophy className="text-indigo-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Homework List */}
        <div className="space-y-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            📋 Current Assignments ({homework.length})
          </h2>

          {homework.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <FaGraduationCap className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                No assignments yet
              </h3>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Your child's homework assignments will appear here once assigned by their teacher.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {homework.map((item) => {
                const SubjectIcon = getSubjectIcon(item.subject);
                const statusInfo = getStatusInfo(item.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                      isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:shadow-xl'
                    } ${statusInfo.borderClass}`}
                  >
                    <div className="flex items-start justify-between">
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <div className={`p-2 rounded-lg ${statusInfo.bgClass}`}>
                            <SubjectIcon className={`text-lg ${statusInfo.textClass}`} />
                          </div>
                          <div>
                            <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {item.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm">
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <FaChalkboardTeacher className="text-xs" />
                                {item.teacher_name || 'Teacher'}
                              </span>
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <FaCalendarAlt className="text-xs" />
                                {formatDueDate(item.due_date)}
                              </span>
                              <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                <FaClock className="text-xs" />
                                {item.duration || 30} mins
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4 line-clamp-2`}>
                          {item.description}
                        </p>

                        {/* Status Badge */}
                        <div className="flex items-center justify-between">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}>
                            <StatusIcon className="text-xs" />
                            {statusInfo.text}
                            {item.status === 'graded' && item.score && (
                              <span className="ml-1">• {item.score}%</span>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/homework/${item.id}?child_id=${selectedChildId}`)}
                              className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                isDark 
                                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              <FaEye className="text-xs" />
                              View Details
                            </button>

                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleHomeworkAction(item)}
                                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                                  item.content_type === 'interactive' 
                                    ? 'bg-green-600 hover:bg-green-700' 
                                    : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                              >
                                {item.content_type === 'interactive' ? (
                                  <>
                                    <FaGamepad className="text-xs" />
                                    Start Activity
                                  </>
                                ) : (
                                  <>
                                    <FaUpload className="text-xs" />
                                    Submit Work
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedParentHomeworkDashboard;
