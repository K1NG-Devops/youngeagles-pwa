import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationCircle,
  FaChartLine,
  FaLightbulb,
  FaComments
} from 'react-icons/fa';

const StudentProgressModal = ({ student, onClose }) => {
  const { isDark } = useTheme();

  if (!student) return null;

  const getScoreColor = (score) => {
    if (score >= 80) return isDark ? 'text-green-400' : 'text-green-600';
    if (score >= 60) return isDark ? 'text-yellow-400' : 'text-yellow-600';
    return isDark ? 'text-red-400' : 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <FaCheckCircle className={getScoreColor(score)} />;
    if (score >= 60) return <FaExclamationCircle className={getScoreColor(score)} />;
    return <FaTimesCircle className={getScoreColor(score)} />;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`w-full max-w-3xl rounded-xl shadow-lg ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Student Progress Report
            </h2>
            <button
              onClick={onClose}
              className={`rounded-lg p-2 hover:bg-opacity-10 ${
                isDark ? 'hover:bg-gray-300' : 'hover:bg-gray-600'
              }`}
            >
              <FaTimesCircle className={isDark ? 'text-gray-400' : 'text-gray-600'} />
            </button>
          </div>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {student.name} - {student.class}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Overall Progress */}
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-4">
              <FaChartLine className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <h3 className="text-lg font-semibold">Overall Progress</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500 mb-1">Average Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(student.averageScore)}`}>
                  {student.averageScore}%
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {student.completedAssignments}
                </p>
              </div>
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <p className="text-sm text-gray-500 mb-1">Pending</p>
                <p className={`text-2xl font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {student.pendingAssignments}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Assignments */}
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-4">
              <FaLightbulb className={`mr-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              <h3 className="text-lg font-semibold">Recent Assignments</h3>
            </div>
            <div className="space-y-3">
              {student.recentAssignments?.map((assignment) => (
                <div
                  key={assignment.id}
                  className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{assignment.title}</h4>
                    <div className="flex items-center">
                      {getScoreIcon(assignment.score)}
                      <span className={`ml-2 ${getScoreColor(assignment.score)}`}>
                        {assignment.score}%
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {assignment.feedback}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations */}
          <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <div className="flex items-center mb-4">
              <FaComments className={`mr-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              <h3 className="text-lg font-semibold">AI Recommendations</h3>
            </div>
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <ul className="space-y-2">
                {student.recommendations?.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2">•</span>
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      {rec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Close
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              Download Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

StudentProgressModal.propTypes = {
  student: PropTypes.shape({
    name: PropTypes.string.isRequired,
    class: PropTypes.string.isRequired,
    averageScore: PropTypes.number.isRequired,
    completedAssignments: PropTypes.number.isRequired,
    pendingAssignments: PropTypes.number.isRequired,
    recentAssignments: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      score: PropTypes.number.isRequired,
      feedback: PropTypes.string.isRequired
    })),
    recommendations: PropTypes.arrayOf(PropTypes.string)
  }),
  onClose: PropTypes.func.isRequired
};

export default StudentProgressModal;
