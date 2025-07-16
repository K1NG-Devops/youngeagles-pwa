import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';
import {
  FaArrowLeft,
  FaBook,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaUpload,
  FaGraduationCap,
  FaChartLine,
  FaCalendarAlt,
  FaSpinner,
  FaTrophy,
  FaFileAlt,
  FaComments,
  FaStar
} from 'react-icons/fa';

const TeacherHomeworkView = () => {
  const { id: homeworkId } = useParams();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [homework, setHomework] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAssigned: 0,
    submitted: 0,
    graded: 0,
    pending: 0,
    averageScore: 0,
    completionRate: 0
  });

  // Load homework details and submissions
  useEffect(() => {
    const fetchHomeworkData = async () => {
      if (!homeworkId) {
        setError('No homework ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch homework details
        const homeworkResponse = await apiService.get(`/api/homework/${homeworkId}`);
        const homeworkData = homeworkResponse.data.homework;
        
        // Verify teacher ownership
        if (homeworkData.teacher_id !== user.id) {
          setError('You can only view your own homework assignments');
          setIsLoading(false);
          return;
        }

        setHomework(homeworkData);

        // Fetch submissions for this homework
        const submissionsResponse = await apiService.get(`/api/homework/${homeworkId}/submissions`);
        const submissionsData = submissionsResponse.data.submissions || [];
        setSubmissions(submissionsData);

        // Calculate statistics
        const totalAssigned = submissionsData.length;
        const submitted = submissionsData.filter(s => s.status === 'submitted' || s.status === 'graded').length;
        const graded = submissionsData.filter(s => s.status === 'graded').length;
        const pending = submissionsData.filter(s => s.status === 'pending').length;
        
        const gradedSubmissions = submissionsData.filter(s => s.status === 'graded' && s.score !== null);
        const averageScore = gradedSubmissions.length > 0 
          ? Math.round(gradedSubmissions.reduce((sum, s) => sum + s.score, 0) / gradedSubmissions.length)
          : 0;
        
        const completionRate = totalAssigned > 0 ? Math.round((submitted / totalAssigned) * 100) : 0;

        setStats({
          totalAssigned,
          submitted,
          graded,
          pending,
          averageScore,
          completionRate
        });

      } catch (error) {
        console.error('Error fetching homework data:', error);
        setError(error.response?.data?.message || 'Failed to load homework details');
        nativeNotificationService.error('Failed to load homework details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHomeworkData();
  }, [homeworkId, user.id]);

  const getStatusInfo = (status) => {
    const statusMap = {
      'pending': {
        color: 'orange',
        icon: FaClock,
        text: 'Pending',
        bgClass: 'bg-orange-100 dark:bg-orange-900',
        textClass: 'text-orange-800 dark:text-orange-200'
      },
      'submitted': {
        color: 'blue',
        icon: FaUpload,
        text: 'Submitted',
        bgClass: 'bg-blue-100 dark:bg-blue-900',
        textClass: 'text-blue-800 dark:text-blue-200'
      },
      'graded': {
        color: 'green',
        icon: FaTrophy,
        text: 'Graded',
        bgClass: 'bg-green-100 dark:bg-green-900',
        textClass: 'text-green-800 dark:text-green-200'
      }
    };
    return statusMap[status] || statusMap['pending'];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleGradeSubmission = (submissionId) => {
    // Navigate to grading interface
    navigate(`/teacher/grade/${submissionId}`);
  };

  const handleViewSubmission = (submission) => {
    // Navigate to submission details
    navigate(`/teacher/submission/${submission.id}`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading homework details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Error</h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="text-sm" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-4`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/homework')}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <div>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                📚 {homework?.title}
              </h1>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Homework Assignment Management
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/homework/${homeworkId}/edit`)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="text-sm" />
              Edit Assignment
            </button>
          </div>
        </div>

        {/* Assignment Details Card */}
        <div className={`p-6 rounded-xl border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Assignment Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <FaBook className="text-blue-500" />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Subject</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {homework?.subject || 'General'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-green-500" />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Due Date</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {homework?.due_date ? formatDate(homework.due_date) : 'No due date'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaClock className="text-purple-500" />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Duration</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {homework?.duration || 30} minutes
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaStar className="text-yellow-500" />
                  <div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Points</p>
                    <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {homework?.points || 10} points
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
                Description
              </h3>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {homework?.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.totalAssigned}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Assigned
                </p>
              </div>
              <FaUsers className="text-blue-500 text-xl" />
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
                <p className={`text-2xl font-bold text-blue-500`}>
                  {stats.submitted}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Submitted
                </p>
              </div>
              <FaUpload className="text-blue-500 text-xl" />
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-green-500`}>
                  {stats.graded}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Graded
                </p>
              </div>
              <FaTrophy className="text-green-500 text-xl" />
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
                <p className={`text-2xl font-bold text-indigo-500`}>
                  {stats.averageScore}%
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Average Score
                </p>
              </div>
              <FaStar className="text-indigo-500 text-xl" />
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            📋 Student Submissions ({submissions.length})
          </h2>

          {submissions.length === 0 ? (
            <div className={`text-center py-12 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <FaGraduationCap className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
              <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                No submissions yet
              </h3>
              <p className={`${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Student submissions will appear here once they start working on this assignment.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {submissions.map((submission) => {
                const statusInfo = getStatusInfo(submission.status);
                const StatusIcon = statusInfo.icon;

                return (
                  <div
                    key={submission.id}
                    className={`p-6 rounded-xl border transition-all hover:shadow-lg ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-lg ${statusInfo.bgClass}`}>
                          <StatusIcon className={`text-lg ${statusInfo.textClass}`} />
                        </div>
                        <div>
                          <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {submission.student_name || `Student ${submission.student_id}`}
                          </h3>
                          <div className="flex items-center gap-4 text-sm">
                            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium ${statusInfo.bgClass} ${statusInfo.textClass}`}>
                              <StatusIcon className="text-xs" />
                              {statusInfo.text}
                            </span>
                            {submission.submitted_at && (
                              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Submitted: {formatDate(submission.submitted_at)}
                              </span>
                            )}
                            {submission.status === 'graded' && submission.score !== null && (
                              <span className="text-green-600 font-medium">
                                Score: {submission.score}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewSubmission(submission)}
                          className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <FaEye className="text-xs" />
                          View
                        </button>

                        {submission.status === 'submitted' && (
                          <button
                            onClick={() => handleGradeSubmission(submission.id)}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <FaTrophy className="text-xs" />
                            Grade
                          </button>
                        )}
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

export default TeacherHomeworkView;
