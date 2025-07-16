import React, { useState } from 'react';
import { 
  FaFileAlt, 
  FaDownload, 
  FaCalendarAlt,
  FaGraduationCap,
  FaChalkboardTeacher,
  FaGamepad,
  FaUpload,
  FaArrowLeft
} from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import InteractiveHomework from './InteractiveHomework';
import nativeNotificationService from '../services/nativeNotificationService.js';

const EnhancedHomeworkDetail = ({ homework, selectedChildId }) => {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mode, setMode] = useState('instructions'); // 'instructions', 'interactive', 'submit'
  const [interactiveComplete, setInteractiveComplete] = useState(false);
  const [interactiveResults, setInteractiveResults] = useState(null);

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

  const isInteractiveHomework = () => {
    // Check if this homework has interactive content based on content_type
    return homework.content_type === 'interactive';
  };

  const handleInteractiveComplete = (results) => {
    setInteractiveComplete(true);
    setInteractiveResults(results);
    nativeNotificationService.success(`Interactive activities completed! Score: ${results.score}/${results.totalQuestions}`);
  };

  const handleSubmitWork = () => {
    navigate(`/submit-work?homework_id=${homework.id}&child_id=${selectedChildId}`);
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <div className="px-2 py-4 space-y-4">
        {/* Header */}
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
        </div>

        {/* Homework Header */}
        <div className={`rounded-xl shadow-lg overflow-hidden border ${
          isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className={`px-6 py-5 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <h1 className={`text-2xl sm:text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
              {homework.title}
            </h1>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {homework.class_name && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-100 text-blue-800'
                }`}>
                  <FaGraduationCap className="w-4 h-4 mr-2" />
                  {homework.class_name}
                </div>
              )}
              
              {homework.subject && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-100 text-purple-800'
                }`}>
                  <FaFileAlt className="w-4 h-4 mr-2" />
                  {homework.subject}
                </div>
              )}
              
              {homework.difficulty && (
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  homework.difficulty === 'easy' 
                    ? isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800'
                    : homework.difficulty === 'medium'
                      ? isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
                      : isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800'
                }`}>
                  {homework.difficulty.charAt(0).toUpperCase() + homework.difficulty.slice(1)}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              {homework.teacher_name && (
                <div className="flex items-center">
                  <FaChalkboardTeacher className={`w-4 h-4 mr-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Teacher: {homework.teacher_name}
                  </span>
                </div>
              )}
              
              {homework.due_date && (
                <div className="flex items-center">
                  <FaCalendarAlt className="w-4 h-4 mr-2 text-orange-600" />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                    Due: {formatDate(homework.due_date)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Mode Selection */}
          <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setMode('instructions')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'instructions'
                    ? 'bg-blue-600 text-white'
                    : isDark
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFileAlt className="w-4 h-4 mr-2 inline" />
                Instructions
              </button>
              
              {isInteractiveHomework() && (
                <button
                  onClick={() => setMode('interactive')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'interactive'
                      ? 'bg-green-600 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaGamepad className="w-4 h-4 mr-2 inline" />
                  Interactive Activities
                  {interactiveComplete && <span className="ml-1">✅</span>}
                </button>
              )}
              
              {/* Only show Submit Work button for non-interactive homework */}
              {!isInteractiveHomework() && (
                <button
                  onClick={() => setMode('submit')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === 'submit'
                      ? 'bg-purple-600 text-white'
                      : isDark
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <FaUpload className="w-4 h-4 mr-2 inline" />
                  Submit Work
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content based on selected mode */}
        {mode === 'instructions' && (
          <div className={`p-4`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              📋 Instructions
            </h2>
            
            {homework.description && (
              <div className="mb-4">
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                  {homework.description}
                </p>
              </div>
            )}

            {homework.instructions && (
              <div className="mb-4">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  Detailed Instructions:
                </h3>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap leading-relaxed`}>
                  {homework.instructions}
                </p>
              </div>
            )}

            {/* Show message if no detailed content available */}
            {!homework.instructions && !homework.objectives && !homework.activities && !homework.materials && !homework.parent_guidance && (
              <div className={`rounded-lg p-6 border text-center ${
                isDark ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="text-yellow-500 text-4xl mb-3">⚠️</div>
                <h3 className={`font-semibold ${isDark ? 'text-yellow-400' : 'text-yellow-800'} mb-2`}>
                  Limited Information Available
                </h3>
                <p className={`${isDark ? 'text-yellow-300' : 'text-yellow-700'} mb-4`}>
                  This homework assignment doesn't have detailed instructions yet. Please check with your teacher for more information.
                </p>
                <p className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  Basic assignment description is shown above.
                </p>
              </div>
            )}

            {/* Learning Objectives */}
            {homework.objectives && homework.objectives.length > 0 && (
              <div className="mt-6">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  🎯 Learning Objectives
                </h3>
                <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {homework.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-500 mr-2 mt-1">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Activities to Complete */}
            {homework.activities && homework.activities.length > 0 && (
              <div className="mt-6">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  📝 Activities to Complete
                </h3>
                <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {homework.activities.map((activity, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-1">{index + 1}.</span>
                      <span>{activity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Materials Needed */}
            {homework.materials && homework.materials.length > 0 && (
              <div className="mt-6">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  📦 Materials Needed
                </h3>
                <ul className={`space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {homework.materials.map((material, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2 mt-1">•</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Parent Guidance */}
            {homework.parent_guidance && (
              <div className={`rounded-lg p-4 mt-6 border-l-4 border-purple-500 ${
                isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
              }`}>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  👨‍👩‍👧‍👦 Parent Guidance
                </h3>
                <p className={`${isDark ? 'text-purple-300' : 'text-purple-700'} leading-relaxed`}>
                  {homework.parent_guidance}
                </p>
              </div>
            )}

            {/* Duration and Difficulty */}
            <div className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {homework.duration && (
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-blue-500 mr-2">⏱️</span>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Estimated Time</p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{homework.duration} minutes</p>
                      </div>
                    </div>
                  </div>
                )}
                
                {homework.difficulty && (
                  <div className={`p-3 rounded-lg border ${
                    isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-2">📊</span>
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Difficulty Level</p>
                        <p className={`font-semibold capitalize ${isDark ? 'text-white' : 'text-gray-900'}`}>{homework.difficulty}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* CAPS Alignment */}
            {homework.caps_alignment && (
              <div className="mt-6">
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-indigo-900/20 border-indigo-800' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <div className="flex items-center">
                    <span className="text-indigo-500 mr-2">🎓</span>
                    <div>
                      <p className={`text-sm ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>CAPS Curriculum Alignment</p>
                      <p className={`font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>{homework.caps_alignment}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resources */}
            {homework.resources?.file_url && (
              <div className="mt-6">
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>
                  📎 Resources
                </h3>
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
            )}
          </div>
        )}

        {mode === 'interactive' && isInteractiveHomework() && (
          <div>
            <div className={`rounded-xl shadow-lg p-6 border mb-4 ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
            }`}>
              <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                🎮 Interactive Learning Activities
              </h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
                Complete these fun activities to practice what you've learned!
              </p>
              
              {interactiveResults && (
                <div className={`rounded-lg p-4 mb-4 border ${
                  isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center">
                    <div className="text-green-500 mr-3">🔒</div>
                    <div>
                      <p className={`font-semibold ${isDark ? 'text-green-400' : 'text-green-800'}`}>
                        Final Score: {interactiveResults.score}/{interactiveResults.totalQuestions} ({interactiveResults.percentage}%)
                      </p>
                      <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-700'}`}>
                        Homework completed and submitted! Interactive activities can only be done once.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <InteractiveHomework 
              homework={homework} 
              selectedChildId={selectedChildId}
              onComplete={handleInteractiveComplete}
            />
          </div>
        )}

        {mode === 'submit' && (
          <div className={`rounded-xl shadow-lg p-6 border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              📤 Submit Your Work
            </h2>
            
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-6`}>
              Ready to submit your homework? You can upload files, photos of your work, or documents.
            </p>

            {interactiveComplete && (
              <div className={`rounded-lg p-4 mb-6 border ${
                isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center">
                  <div className="text-blue-500 mr-3">🎮</div>
                  <div>
                    <p className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
                      Interactive Activities Completed!
                    </p>
                    <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                      Score: {interactiveResults?.score}/{interactiveResults?.totalQuestions} ({interactiveResults?.percentage}%)
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleSubmitWork}
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <FaUpload className="w-5 h-5 mr-2" />
                Go to Submit Work Page
              </button>
              
              <p className={`text-sm text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Upload photos, documents, or files showing your completed work
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedHomeworkDetail;
