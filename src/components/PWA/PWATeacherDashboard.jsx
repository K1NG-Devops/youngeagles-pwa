import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaUsers, FaBell, FaPlus, FaEye, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/api';

const PWATeacherDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
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

  const token = localStorage.getItem('accessToken');
  const teacherId = auth?.user?.id || localStorage.getItem('teacherId');

  // Fetch teacher stats and submissions
  const fetchTeacherData = useCallback(async () => {
    if (!token || !teacherId) return;
    
    setIsLoading(prev => ({ ...prev, stats: true, submissions: true }));
    
    try {
      // Fetch homework stats
      const homeworkRes = await axios.get(
        `${API_CONFIG.getApiUrl()}/homeworks/for-teacher/${teacherId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const homeworks = homeworkRes.data.homeworks || [];
      
      // Fetch all submissions for teacher
      const submissionsRes = await axios.get(
        `${API_CONFIG.getApiUrl()}/homeworks/teacher/all-submissions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const submissions = submissionsRes.data.submissions || [];
      const teacherClassInfo = submissionsRes.data.teacherClass;
      
      setTeacherClass(teacherClassInfo);
      setRecentSubmissions(submissions.slice(0, 5)); // Show latest 5 submissions
      
      // Calculate stats
      const totalHomeworks = homeworks.length;
      const totalSubmissions = submissions.length;
      const uniqueStudents = new Set(submissions.map(s => s.child_id)).size;
      const submissionRate = totalHomeworks > 0 ? (totalSubmissions / (totalHomeworks * Math.max(1, uniqueStudents))) * 100 : 0;
      
      setTeacherStats({
        totalHomeworks,
        totalSubmissions,
        totalStudents: uniqueStudents,
        submissionRate: Math.min(100, submissionRate)
      });
      
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      if (typeof toast !== 'undefined') {
        toast.error('Failed to load dashboard data');
      }
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
      id: 'homework',
      title: 'Post Homework',
      description: 'Create assignments',
      icon: FaBook,
      color: 'blue',
      path: '/homework/upload',
      badge: null
    },
    {
      id: 'submissions',
      title: 'View Submissions',
      description: 'Check student work',
      icon: FaEye,
      color: 'green',
      path: '/teacher-submissions',
      badge: teacherStats.totalSubmissions
    },
    {
      id: 'attendance',
      title: 'Attendance',
      description: 'Mark attendance',
      icon: FaChalkboardTeacher,
      color: 'purple',
      path: '/teacher-attendance',
      badge: null
    },
    {
      id: 'reports',
      title: 'Create Reports',
      description: 'Student reports',
      icon: FaFileUpload,
      color: 'orange',
      path: '/teacher-reports',
      badge: null
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-hidden pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">Welcome, {teacherName}!</h2>
        <p className="text-sm text-green-100">Manage your class and track student progress</p>
        {teacherClass && (
          <div className="mt-2 bg-white bg-opacity-20 rounded-lg p-2">
            <p className="text-sm font-medium">Your Class: {teacherClass}</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Homeworks</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{teacherStats.totalHomeworks}</p>
              )}
            </div>
            <div className="p-2 bg-blue-100 rounded-full">
              <FaBook className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{teacherStats.totalStudents}</p>
              )}
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <FaUser className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Submissions</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{teacherStats.totalSubmissions}</p>
              )}
            </div>
            <div className="p-2 bg-purple-100 rounded-full">
              <FaClipboardList className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rate</p>
              {isLoading.stats ? (
                <FaSpinner className="animate-spin text-gray-400 text-lg" />
              ) : (
                <p className="text-2xl font-bold text-gray-900">{Math.round(teacherStats.submissionRate)}%</p>
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

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const IconComponent = action.icon;
            const colorClasses = {
              blue: 'bg-blue-50 border-blue-200 text-blue-700',
              green: 'bg-green-50 border-green-200 text-green-700',
              purple: 'bg-purple-50 border-purple-200 text-purple-700',
              orange: 'bg-orange-50 border-orange-200 text-orange-700'
            };
            
            return (
              <Link
                key={action.id}
                to={action.path}
                className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all min-h-[100px] ${colorClasses[action.color]} hover:shadow-md cursor-pointer`}
              >
                <div className={`p-2 rounded-lg mb-2 bg-${action.color}-100`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs opacity-75">{action.description}</p>
                  {action.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full mt-1">
                      {action.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Submissions - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={() => toggleSection('submissions')}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
        >
          <h3 className="text-lg font-semibold text-gray-900">Recent Submissions</h3>
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
                  to="/teacher-submissions"
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={() => toggleSection('class')}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
        >
          <h3 className="text-lg font-semibold text-gray-900">Class Management</h3>
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
