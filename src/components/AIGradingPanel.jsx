import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaSpinner, FaCheckCircle, FaExclamationCircle, FaRobot, FaFileAlt } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';

const AIGradingPanel = ({
  pendingSubmissions,
  gradingQueue,
  onStartGrading,
  onViewResults,
  onShareWithParent,
  aiGradingStatus
}) => {
  const { isDark } = useTheme();
  const [selectedSubmissions, setSelectedSubmissions] = useState([]);

  const handleSubmissionSelect = (submissionId) => {
    setSelectedSubmissions(prev => {
      if (prev.includes(submissionId)) {
        return prev.filter(id => id !== submissionId);
      }
      return [...prev, submissionId];
    });
  };

  const handleStartGrading = () => {
    if (selectedSubmissions.length > 0) {
      onStartGrading(selectedSubmissions);
      setSelectedSubmissions([]); // Clear selection after starting
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
    case 'submitted':
      return isDark ? 'text-yellow-400' : 'text-yellow-600';
    case 'grading_in_progress':
      return isDark ? 'text-blue-400' : 'text-blue-600';
    case 'graded':
      return isDark ? 'text-green-400' : 'text-green-600';
    default:
      return isDark ? 'text-gray-400' : 'text-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
    case 'submitted':
      return <FaFileAlt className={getStatusColor(status)} />;
    case 'grading_in_progress':
      return <FaSpinner className={`${getStatusColor(status)} animate-spin`} />;
    case 'graded':
      return <FaCheckCircle className={getStatusColor(status)} />;
    default:
      return <FaExclamationCircle className={getStatusColor(status)} />;
    }
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">AI Grading Assistant</h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Automatically grade student submissions with detailed feedback
        </p>
      </div>

      {/* Status Banner */}
      {aiGradingStatus === 'processing' && (
        <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-100'}`}>
          <div className="flex items-center">
            <FaSpinner className={`animate-spin mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div>
              <p className="font-medium">AI Grading in Progress</p>
              <p className="text-sm opacity-75">Processing {gradingQueue.length} submissions...</p>
            </div>
          </div>
        </div>
      )}

      {/* Pending Submissions */}
      <div className={`rounded-xl shadow-sm border p-6 mb-6 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Pending Submissions</h3>
          <button
            onClick={handleStartGrading}
            disabled={selectedSubmissions.length === 0}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              selectedSubmissions.length > 0
                ? isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                : isDark
                  ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <FaRobot className="mr-2" />
            Start AI Grading
          </button>
        </div>

        <div className="space-y-3">
          {pendingSubmissions.length === 0 ? (
            <p className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No pending submissions to grade
            </p>
          ) : (
            pendingSubmissions.map((submission) => (
              <div 
                key={submission.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-650' : 'bg-gray-50 hover:bg-gray-100'
                } transition-colors`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSubmissions.includes(submission.id)}
                    onChange={() => handleSubmissionSelect(submission.id)}
                    className="mr-4 rounded border-gray-300"
                  />
                  <div>
                    <div className="flex items-center">
                      {getStatusIcon(submission.status)}
                      <span className="ml-2 font-medium">{submission.title || 'Untitled Submission'}</span>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Submitted by {submission.studentName} - {submission.subject}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {submission.status === 'graded' && (
                    <>
                      <button
                        onClick={() => onViewResults(submission.id)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          isDark 
                            ? 'bg-blue-900/20 text-blue-400 hover:bg-blue-900/30' 
                            : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                        }`}
                      >
                        View Results
                      </button>
                      <button
                        onClick={() => onShareWithParent(submission.id, submission.parentId)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          isDark 
                            ? 'bg-green-900/20 text-green-400 hover:bg-green-900/30' 
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                      >
                        Share with Parent
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Grading Queue */}
      {gradingQueue.length > 0 && (
        <div className={`rounded-xl shadow-sm border p-6 ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <h3 className="text-lg font-semibold mb-4">Grading Queue</h3>
          <div className="space-y-3">
            {gradingQueue.map((item) => (
              <div 
                key={item.id}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center">
                  <FaSpinner className={`animate-spin mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                  <div>
                    <p className="font-medium">{item.title || 'Processing Submission'}</p>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Estimated time remaining: {item.estimatedTime || 'Calculating...'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

AIGradingPanel.propTypes = {
  pendingSubmissions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    studentName: PropTypes.string,
    subject: PropTypes.string,
    status: PropTypes.string,
    parentId: PropTypes.string
  })).isRequired,
  gradingQueue: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    estimatedTime: PropTypes.string
  })).isRequired,
  onStartGrading: PropTypes.func.isRequired,
  onViewResults: PropTypes.func.isRequired,
  onShareWithParent: PropTypes.func.isRequired,
  aiGradingStatus: PropTypes.oneOf(['idle', 'processing', 'completed', 'error']).isRequired
};

export default AIGradingPanel;
