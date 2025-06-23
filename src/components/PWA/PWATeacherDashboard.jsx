import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaUsers, FaBell, FaPlus, FaEye, FaSpinner, FaChevronDown, FaChevronUp, FaUser, FaClipboardList, FaCalendarAlt, FaChartBar, FaMagic, FaRocket, FaGraduationCap, FaCalendarWeek } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { showTopNotification } from '../TopNotificationManager';
import { API_CONFIG } from '../../config/api';
import { useTheme } from '../../hooks/useTheme.jsx';
import AdvancedHomeworkCreator from './AdvancedHomeworkCreator';
import AdvancedProgressDashboard from './AdvancedProgressDashboard';
import SkillProgressTracker from './SkillProgressTracker';
import WeeklyReportDashboard from './WeeklyReportDashboard';

const PWATeacherDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isDark } = useTheme();
  const [teacherStats, setTeacherStats] = useState({
    totalHomeworks: 0,
    totalSubmissions: 0,
    totalStudents: 0,
    submissionRate: 0
  });
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState({
    stats: false,
    submissions: false
  });
  const [expandedSection, setExpandedSection] = useState(null);
  const [teacherClass, setTeacherClass] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');
  const [showAdvancedCreator, setShowAdvancedCreator] = useState(false);

  const token = localStorage.getItem('accessToken');
  const teacherId = auth?.user?.id || localStorage.getItem('teacherId');

  // Fetch teacher stats and submissions
  const fetchTeacherData = useCallback(async () => {
    if (!token || !teacherId) return;
    
    setIsLoading(prev => ({ ...prev, stats: true, submissions: true }));
    
    try {
      // Fetch teacher class info and students
      const classRes = await axios.get(
        `${API_CONFIG.getApiUrl()}/teacher/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const classData = classRes.data;
      if (classData.success && classData.teacher) {
        setTeacherClass(classData.teacher.className);
      }
      
      // Fetch teacher stats from homework endpoint
      const statsRes = await axios.get(
        `${API_CONFIG.getApiUrl()}/homework/teacher/stats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      if (statsRes.data.success && statsRes.data.stats) {
        const stats = statsRes.data.stats;
        setTeacherStats({
          totalHomeworks: stats.totalHomework,
          totalSubmissions: stats.totalSubmissions,
          totalStudents: stats.totalStudents,
          submissionRate: Math.round(stats.submissionRate)
        });
      }
      
      // Fetch all submissions for teacher
      try {
        const submissionsRes = await axios.get(
          `${API_CONFIG.getApiUrl()}/homework/teacher/submissions`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const submissions = submissionsRes.data.submissions || [];
        setRecentSubmissions(submissions.slice(0, 5)); // Show latest 5 submissions
      } catch (submissionErr) {
        console.warn('Could not fetch submissions, using empty array:', submissionErr);
        setRecentSubmissions([]);
      }
      
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      showTopNotification('Failed to load dashboard data', 'error');
      
      // Fallback to empty state
      setTeacherStats({
        totalHomeworks: 0,
        totalSubmissions: 0,
        totalStudents: 0,
        submissionRate: 0
      });
      setRecentSubmissions([]);
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false, submissions: false }));
    }
  }, [token, teacherId]);

  useEffect(() => {
    fetchTeacherData();
  }, [fetchTeacherData]);

  const teacherName = auth?.user?.name || 'Teacher';

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const quickActions = [
    {
      id: 'advanced-creator',
      title: '🎯 Advanced Creator',
      description: 'Smart homework wizard',
      icon: FaMagic,
      color: 'gradient',
      action: () => setShowAdvancedCreator(true),
      badge: null,
      isAdvanced: true
    },
    {
      id: 'progress-dashboard',
      title: '📊 Progress Analytics',
      description: 'Student insights',
      icon: FaChartBar,
      color: 'gradient',
      action: () => setActiveView('progress'),
      badge: null,
      isAdvanced: true
    },
    {
      id: 'skill-tracker',
      title: '🎯 Skill Tracker',
      description: 'Monitor development',
      icon: FaGraduationCap,
      color: 'gradient',
      action: () => setActiveView('skills'),
      badge: null,
      isAdvanced: true
    },
    {
      id: 'weekly-reports',
      title: '📋 Weekly Reports',
      description: 'Generate insights',
      icon: FaCalendarWeek,
      color: 'gradient',
      action: () => setActiveView('reports'),
      badge: null,
      isAdvanced: true
    },
    {
      id: 'create-assignment',
      title: 'Create Assignment',
      description: 'New homework task',
      icon: FaPlus,
      color: 'blue',
      path: '/teacher/assignments/create',
      badge: null
    },
    {
      id: 'manage-assignments',
      title: 'My Assignments',
      description: 'Manage homework',
      icon: FaBook,
      color: 'green',
      path: '/teacher/assignments',
      badge: teacherStats.totalHomeworks
    },
    {
      id: 'submissions',
      title: 'View Submissions',
      description: 'Check student work',
      icon: FaEye,
      color: 'purple',
      path: '/teacher/assignments',
      badge: teacherStats.totalSubmissions
    },
    {
      id: 'reports',
      title: 'Create Reports',
      description: 'Student reports',
      icon: FaUsers,
      color: 'orange',
      path: '/teacher-reports',
      badge: null
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Handle advanced homework creation
  const handleAdvancedHomeworkSave = async (homeworkData) => {
    try {
      setIsLoading(prev => ({ ...prev, stats: true }));
      
      // TODO: Send to backend API
      console.log('Saving advanced homework:', homeworkData);
      
      // For now, just show success and close modal
      showTopNotification('Advanced homework created successfully!');
      setShowAdvancedCreator(false);
      
      // Refresh stats
      await fetchTeacherData();
      
    } catch (error) {
      console.error('Error saving homework:', error);
      showTopNotification('Failed to create homework');
    } finally {
      setIsLoading(prev => ({ ...prev, stats: false }));
    }
  };



  // Show Advanced Homework Creator Modal
  if (showAdvancedCreator) {
    return (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 pb-6">
        <div className="max-w-6xl w-full max-h-screen overflow-y-auto">
          <AdvancedHomeworkCreator
            onSave={handleAdvancedHomeworkSave}
            onCancel={() => setShowAdvancedCreator(false)}
            isDark={isDark}
          />
        </div>
      </div>
    );
  }

  // Show Advanced Progress Dashboard
  if (activeView === 'progress') {
    return (
      <div className={`min-h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-blue-400 hover:bg-gray-700' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            ← Back to Dashboard
          </button>
        </div>
        <AdvancedProgressDashboard isDark={isDark} />
      </div>
    );
  }

  // Show Skill Progress Tracker
  if (activeView === 'skills') {
    return (
      <div className={`min-h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-blue-400 hover:bg-gray-700' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            ← Back to Dashboard
          </button>
        </div>
        <SkillProgressTracker isDark={isDark} />
      </div>
    );
  }

  // Show Weekly Reports Dashboard
  if (activeView === 'reports') {
    return (
      <div className={`min-h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-blue-400 hover:bg-gray-700' 
                : 'text-blue-600 hover:bg-blue-50'
            }`}
          >
            ← Back to Dashboard
          </button>
        </div>
        <WeeklyReportDashboard isDark={isDark} />
      </div>
    );
  }

  return (
    <div className={`p-4 space-y-4 max-w-full overflow-x-hidden pb-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-full`}>
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-4 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold mb-1">Welcome, {teacherName}! 🎓</h2>
              <p className="text-sm text-green-100">Advanced Teaching Dashboard - Empowering Every Student</p>
            </div>

          </div>
          {teacherClass && (
            <div className="mt-2 bg-white bg-opacity-20 rounded-lg p-2">
              <p className="text-sm font-medium flex items-center">
                <FaRocket className="mr-2" />
                Your Class: {teacherClass}
              </p>
            </div>
          )}
          <div className="mt-3 flex items-center text-xs text-green-100">
            <span className="bg-white bg-opacity-20 px-2 py-1 rounded-full mr-2">NEW</span>
            Advanced AI-powered teaching tools available!
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex items-center justify-between">
                          <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Homeworks</p>
                {isLoading.stats ? (
                  <FaSpinner className="animate-spin text-gray-400 text-lg" />
                ) : (
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{teacherStats.totalHomeworks}</p>
                )}
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FaBook className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Students</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{teacherStats.totalStudents}</p>
              )}
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <FaUser className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Submissions</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{teacherStats.totalSubmissions}</p>
              )}
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <FaClipboardList className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Rate</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{Math.round(teacherStats.submissionRate)}%</p>
              )}
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <FaBell className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500" 
                style={{width: `${teacherStats.submissionRate}%`}}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
            ✨ Enhanced Features
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            const colorClasses = {
              blue: isDark 
                ? 'bg-blue-900 border-blue-700 text-blue-300' 
                : 'bg-blue-50 border-blue-200 text-blue-700',
              green: isDark 
                ? 'bg-green-900 border-green-700 text-green-300' 
                : 'bg-green-50 border-green-200 text-green-700',
              purple: isDark 
                ? 'bg-purple-900 border-purple-700 text-purple-300' 
                : 'bg-purple-50 border-purple-200 text-purple-700',
              orange: isDark 
                ? 'bg-orange-900 border-orange-700 text-orange-300' 
                : 'bg-orange-50 border-orange-200 text-orange-700',
              gradient: 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-transparent'
            };
            
            const ActionElement = action.path ? Link : 'button';
            const actionProps = action.path 
              ? { to: action.path }
              : { onClick: action.action };
            
            return (
              <ActionElement
                key={action.id}
                {...actionProps}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all min-h-[100px] hover:shadow-md cursor-pointer ${
                  action.isAdvanced
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-transparent hover:from-purple-600 hover:to-pink-600 transform hover:-translate-y-1 shadow-lg'
                    : `${colorClasses[action.color]} hover:shadow-md`
                } ${action.isAdvanced ? 'relative overflow-hidden' : ''}`}
              >
                {action.isAdvanced && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white bg-opacity-20 rounded-full -mr-8 -mt-8" />
                )}
                <div className={`${action.isAdvanced ? 'relative z-10' : ''} p-2 rounded-lg mb-2 ${
                  action.isAdvanced 
                    ? 'bg-white bg-opacity-30' 
                    : isDark 
                      ? `bg-${action.color}-800` 
                      : `bg-${action.color}-100`
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    action.isAdvanced 
                      ? 'text-purple-900' 
                      : isDark 
                        ? `text-${action.color}-200` 
                        : `text-${action.color}-600`
                  }`} />
                </div>
                <div className={`text-center ${action.isAdvanced ? 'relative z-10' : ''}`}>
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className={`text-xs ${action.isAdvanced ? 'opacity-90' : 'opacity-75'}`}>{action.description}</p>
                  {action.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full mt-1">
                      {action.badge}
                    </span>
                  )}
                  {action.isAdvanced && (
                    <div className="mt-2">
                      <span className="text-xs bg-white bg-opacity-30 px-2 py-1 rounded-full">
                        NEW
                      </span>
                    </div>
                  )}
                </div>
              </ActionElement>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions - Collapsible */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`}>
        <button
          onClick={() => toggleSection('submissions')}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Recent Submissions</h3>
          {expandedSection === 'submissions' ? (
            <FaChevronUp className="text-gray-500" />
          ) : (
            <FaChevronDown className="text-gray-500" />
          )}
        </button>
        
        {expandedSection === 'submissions' && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 space-y-3">
              {isLoading.submissions ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                  <span className="ml-2 text-gray-500">Loading submissions...</span>
                </div>
              ) : recentSubmissions.length > 0 ? (
                recentSubmissions.map((submission, index) => (
                  <div key={submission.id || index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {submission.student_name || 'Student'}
                        </p>
                        <p className="text-xs text-gray-600">
                          {submission.homework_title || 'Homework'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(submission.submitted_at)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Submitted
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No submissions yet</p>
                </div>
              )}
              
              {recentSubmissions.length > 0 && (
                <Link
                  to="/teacher/assignments"
                  className="block w-full p-3 text-center bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  View All Submissions
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Class Management - Collapsible */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`}>
        <button
          onClick={() => toggleSection('class')}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Class Management</h3>
          {expandedSection === 'class' ? (
            <FaChevronUp className="text-gray-500" />
          ) : (
            <FaChevronDown className="text-gray-500" />
          )}
        </button>
        
        {expandedSection === 'class' && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4 grid grid-cols-2 gap-3">
              <Link
                to="/teacher-children-list"
                className="flex items-center p-3 bg-teal-50 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
              >
                <div className="p-2 bg-teal-100 rounded-lg mr-3">
                  <FaUser className="w-4 h-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-teal-700">My Students</p>
                  <p className="text-xs text-teal-600">Manage class list</p>
                </div>
              </Link>
              
              <Link
                to="/teacher-dashboard/activity-builder"
                className="flex items-center p-3 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                  <FaCalendarAlt className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-700">Activities</p>
                  <p className="text-xs text-indigo-600">Create activities</p>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWATeacherDashboard;
