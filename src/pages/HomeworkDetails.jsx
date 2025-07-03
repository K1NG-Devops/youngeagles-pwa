import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaBook, 
  FaUser, 
  FaCalendarAlt, 
  FaClock, 
  FaExclamationTriangle,
  FaArrowLeft,
  FaFileAlt,
  FaGraduationCap,
  FaChevronRight,
  FaDownload,
  FaSpinner,
  FaUpload
} from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

const HomeworkDetails = () => {
  const { homeworkId } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [homework, setHomework] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHomeworkDetails = async () => {
      if (!homeworkId) {
        setError('No homework ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await apiService.get(`/api/homework/${homeworkId}`);
        setHomework(response.data.homework);
      } catch (error) {
        console.error('Error fetching homework details:', error);
        setError(error.response?.data?.message || error.message || 'Failed to load homework details');
        toast.error('Failed to load homework details');
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworkDetails();
  }, [homeworkId]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getDaysUntilDue = (dueDate) => {
    if (!dueDate) return null;
    try {
      const due = new Date(dueDate);
      const now = new Date();
      const diffTime = due - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch {
      return null;
    }
  };

  const renderDueStatus = (dueDate) => {
    const daysUntil = getDaysUntilDue(dueDate);
    if (daysUntil === null) return null;

    let statusColor, statusText, icon;
    if (daysUntil < 0) {
      statusColor = isDark 
        ? 'text-red-400 bg-red-900/20 border-red-800' 
        : 'text-red-600 bg-red-100 border-red-200';
      statusText = `Overdue by ${Math.abs(daysUntil)} day(s)`;
      icon = FaExclamationTriangle;
    } else if (daysUntil === 0) {
      statusColor = isDark 
        ? 'text-orange-400 bg-orange-900/20 border-orange-800' 
        : 'text-orange-600 bg-orange-100 border-orange-200';
      statusText = 'Due today';
      icon = FaClock;
    } else if (daysUntil <= 3) {
      statusColor = isDark 
        ? 'text-yellow-400 bg-yellow-900/20 border-yellow-800' 
        : 'text-yellow-600 bg-yellow-100 border-yellow-200';
      statusText = `Due in ${daysUntil} day(s)`;
      icon = FaClock;
    } else {
      statusColor = isDark 
        ? 'text-green-400 bg-green-900/20 border-green-800' 
        : 'text-green-600 bg-green-100 border-green-200';
      statusText = `Due in ${daysUntil} day(s)`;
      icon = FaClock;
    }

    const IconComponent = icon;
    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColor}`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {statusText}
      </div>
    );
  };

  if (loading) {
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
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Error Loading Homework
          </h2>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!homework) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No homework details available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Homework
          </button>
          
          <div className={`text-sm font-medium px-4 py-2 rounded-lg ${
            isDark ? 'text-gray-300 bg-gray-700' : 'text-gray-600 bg-gray-100'
          }`}>
            <FaBook className="w-4 h-4 mr-2 inline" />
            Homework Details
          </div>
        </div>

        {/* Main Content */}
        <div className={`rounded-lg shadow-lg overflow-hidden border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          {/* Header Section */}
          <div className={`px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {homework.title}
                </h1>
                {homework.class_name && (
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                    isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <FaGraduationCap className="w-4 h-4 mr-2" />
                    {homework.class_name}
                  </div>
                )}
                {homework.due_date && renderDueStatus(homework.due_date)}
              </div>
            </div>
          </div>

          {/* Content Sections */}
          <div className="p-6 space-y-6">
            {/* Description/Instructions */}
            {homework.description && (
              <div className="space-y-3">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <FaFileAlt className="w-5 h-5 mr-2 text-blue-600" />
                  Instructions
                </h2>
                <div className={`rounded-lg p-4 border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                    {homework.description}
                  </p>
                </div>
              </div>
            )}

            {/* Learning Objectives */}
            {homework.educational_details?.learning_objectives && homework.educational_details.learning_objectives.length > 0 && (
              <div className="space-y-3">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <FaGraduationCap className="w-5 h-5 mr-2 text-green-600" />
                  Learning Objectives
                </h2>
                <div className={`rounded-lg p-4 border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <ul className="space-y-2">
                    {homework.educational_details.learning_objectives.map((objective, index) => (
                      <li key={index} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <FaChevronRight className="w-4 h-4 mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Resources */}
            {homework.resources?.file_url && (
              <div className="space-y-3">
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <FaDownload className="w-5 h-5 mr-2 text-purple-600" />
                  Resources
                </h2>
                <div className={`rounded-lg p-4 border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <a 
                    href={homework.resources.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                      isDark 
                        ? 'bg-purple-900/20 text-purple-400 hover:bg-purple-800/30' 
                        : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    }`}
                  >
                    <FaDownload className="w-4 h-4 mr-2" />
                    Download Assignment File
                  </a>
                </div>
              </div>
            )}

            {/* Additional Information Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Teacher Information */}
              {(homework.teacher_name || homework.teacher_email) && (
                <div className="space-y-3">
                  <h3 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                    <FaUser className="w-4 h-4 mr-2 text-indigo-600" />
                    Teacher
                  </h3>
                  <div className={`rounded-lg p-4 border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    {homework.teacher_name && (
                      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {homework.teacher_name}
                      </p>
                    )}
                    {homework.teacher_email && (
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {homework.teacher_email}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Important Dates */}
              <div className="space-y-3">
                <h3 className={`text-md font-semibold ${isDark ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-orange-600" />
                  Important Dates
                </h3>
                <div className={`rounded-lg p-4 space-y-2 border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  {homework.created_at && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Assigned:</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatDate(homework.created_at)}
                      </span>
                    </div>
                  )}
                  {homework.due_date && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Due:</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatDate(homework.due_date)}
                      </span>
                    </div>
                  )}
                  {homework.points !== undefined && homework.points > 0 && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Points:</span>
                      <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {homework.points}
                      </span>
                    </div>
                  )}
                  {homework.status && (
                    <div className="flex justify-between">
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Status:</span>
                      <span className={`text-sm font-medium capitalize ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                        {homework.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className={`rounded-lg shadow-lg p-6 border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaBook className="w-5 h-5 mr-3 text-blue-600" />
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Ready to submit your work?
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Review the instructions above and submit your completed assignment.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const params = new window.URLSearchParams();
                params.set('homework_id', homework.id);
                navigate(`/submit-work?${params.toString()}`);
              }}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <FaUpload className="w-4 h-4 mr-2" />
              Submit Work
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeworkDetails; 