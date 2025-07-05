import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../hooks/useTheme';
import {
  FaUser,
  FaComments,
  FaShareAlt
} from 'react-icons/fa';

const ParentCommunicationPanel = ({ classes, onShareResults, onGenerateReport }) => {
  const { isDark } = useTheme();
  
  const handleShareResults = (classId) => {
    // Simulate sharing results with parents (in reality, you'd fetch & filter)
    onShareResults(classId, 'parentId');
  };

  const handleGenerateReport = (classId) => {
    // Simulate generating a report (you'd use real data here)
    onGenerateReport(classId, { start: '2025-01-01', end: '2025-12-31' });
  };

  return (
    <div className={`max-w-6xl mx-auto px-4 sm:px-6 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Parent Communication</h2>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Share results and communicate with parents
        </p>
      </div>

      {/* Classes List */}
      <div className="space-y-6">
        {classes.map((cls) => (
          <div 
            key={cls.id}
            className={`rounded-xl shadow-sm border p-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{cls.name} Class</h3>
              <FaUser className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={() => handleShareResults(cls.id)}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  isDark
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaComments className="mr-2" />
                Share Results
              </button>

              <button
                onClick={() => handleGenerateReport(cls.id)}
                className={`px-4 py-2 rounded-lg flex items-center transition-colors ${
                  isDark
                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                <FaShareAlt className="mr-2" />
                Generate Report
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

ParentCommunicationPanel.propTypes = {
  classes: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired
    })
  ).isRequired,
  onShareResults: PropTypes.func.isRequired,
  onGenerateReport: PropTypes.func.isRequired
};

export default ParentCommunicationPanel;

