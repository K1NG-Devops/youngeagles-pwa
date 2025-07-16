import React, { useState } from 'react';
import { 
  FaChalkboardTeacher, 
  FaCalendarAlt, 
  FaClock, 
  FaEye, 
  FaUpload, 
  FaGamepad, 
  FaChevronDown, 
  FaChevronUp,
  FaBullseye,
  FaClipboardList,
  FaLightbulb,
  FaBookOpen,
  FaUserGraduate,
  FaTasks,
  FaCheckCircle
} from 'react-icons/fa';

// Subject icons remain the same
const getSubjectIcon = (subject) => {
  const icons = {
    'Mathematics': FaUserGraduate,
    'English': FaBookOpen,
    'Science': FaLightbulb,
    'History': FaClipboardList,
    'Geography': FaBullseye,
    'Art': FaClipboardList,
    'Physical Education': FaTasks,
    'Music': FaClipboardList,
    'default': FaClipboardList
  };
  return icons[subject] || icons.default;
};

const getStatusInfo = (status) => {
  const statusMap = {
    'pending': {
      text: 'Pending',
      icon: FaClock,
      bgClass: 'bg-yellow-100 dark:bg-yellow-900/50',
      textClass: 'text-yellow-800 dark:text-yellow-200',
      borderClass: 'border-l-4 border-yellow-400'
    },
    'submitted': {
      text: 'Submitted',
      icon: FaCheckCircle,
      bgClass: 'bg-blue-100 dark:bg-blue-900/50',
      textClass: 'text-blue-800 dark:text-blue-200',
      borderClass: 'border-l-4 border-blue-400'
    },
    'graded': {
      text: 'Graded',
      icon: FaCheckCircle,
      bgClass: 'bg-green-100 dark:bg-green-900/50',
      textClass: 'text-green-800 dark:text-green-200',
      borderClass: 'border-l-4 border-green-400'
    },
    'overdue': {
      text: 'Overdue',
      icon: FaClock,
      bgClass: 'bg-red-100 dark:bg-red-900/50',
      textClass: 'text-red-800 dark:text-red-200',
      borderClass: 'border-l-4 border-red-400'
    }
  };
  return statusMap[status] || statusMap.pending;
};

const RichHomeworkCard = ({ 
  item, 
  isDark, 
  onViewDetails, 
  onHomeworkAction,
  formatDueDate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const SubjectIcon = getSubjectIcon(item.subject);
  const statusInfo = getStatusInfo(item.status);
  const StatusIcon = statusInfo.icon;

  // Enhanced lesson data from database fields
  const enhancedLessonData = {
    objectives: item.objectives || [],
    activities: item.activities || [],
    materials: item.materials || [],
    parentGuidance: item.parent_guidance || null,
    capsAlignment: item.caps_alignment || null,
    estimatedTime: item.duration || null,
    difficultyLevel: item.difficulty || null
  };

  const getDifficultyColor = (level) => {
    switch(level.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200';
    }
  };

  return (
    <div
      className={`p-4 sm:p-5 md:p-7 rounded-xl border transition-all hover:shadow-lg w-full max-w-full overflow-hidden ${
        isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:shadow-xl'
      } ${statusInfo.borderClass}`}
    >
      <div className="flex flex-col gap-4 sm:gap-5 w-full">
        {/* Header Section */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
            <div className={`p-1.5 sm:p-2 rounded-lg ${statusInfo.bgClass} flex-shrink-0`}>
              <SubjectIcon className={`text-sm sm:text-base md:text-lg ${statusInfo.textClass}`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm sm:text-base md:text-lg ${isDark ? 'text-white' : 'text-gray-900'} truncate`}>
                {item.title}
              </h3>
              <div className="flex flex-col gap-0.5 sm:gap-1 text-xs sm:text-sm">
                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  <FaChalkboardTeacher className="text-xs flex-shrink-0" />
                  <span className="truncate">{item.teacher_name || 'Teacher'}</span>
                </span>
                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  <FaCalendarAlt className="text-xs flex-shrink-0" />
                  <span className="truncate">{formatDueDate(item.due_date)}</span>
                </span>
                <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'} truncate`}>
                  <FaClock className="text-xs flex-shrink-0" />
                  <span className="truncate">{enhancedLessonData.estimatedTime || 30} mins</span>
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1 sm:gap-2">
              <div className={`px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium ${getDifficultyColor(enhancedLessonData.difficultyLevel || 'intermediate')}`}>
                {enhancedLessonData.difficultyLevel || 'Intermediate'}
              </div>
            </div>
          </div>

          {/* Description */}
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3 sm:mb-4 md:mb-5 line-clamp-2`}>
            {item.description}
          </p>

          {/* CAPS Alignment Badge */}
          {enhancedLessonData.capsAlignment && (
            <div className="mb-3">
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                isDark ? 'bg-purple-900/50 text-purple-200' : 'bg-purple-100 text-purple-800'
              }`}>
                <FaBookOpen className="text-xs" />
                {enhancedLessonData.capsAlignment}
              </span>
            </div>
          )}

          {/* Quick Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-5">
            <div className={`p-3 sm:p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FaBullseye className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Objectives
                </span>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {enhancedLessonData.objectives.length > 0 ? `${enhancedLessonData.objectives.length} learning goals` : 'No objectives set'}
              </span>
            </div>
            
            <div className={`p-3 sm:p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FaTasks className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Activities
                </span>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {enhancedLessonData.activities.length > 0 ? `${enhancedLessonData.activities.length} tasks to complete` : 'No activities set'}
              </span>
            </div>
            
            <div className={`p-3 sm:p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                <FaClipboardList className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
                <span className={`text-xs font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Materials
                </span>
              </div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {enhancedLessonData.materials.length} items needed
              </span>
            </div>
          </div>

          {/* Expandable Details */}
          {isExpanded && (
            <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="space-y-4">
                {/* Learning Objectives */}
                <div>
                  <h4 className={`font-medium text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FaBullseye className="text-blue-500" />
                    Learning Objectives
                  </h4>
                  <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {enhancedLessonData.objectives.map((objective, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Activities */}
                <div>
                  <h4 className={`font-medium text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FaTasks className="text-green-500" />
                    Activities to Complete
                  </h4>
                  <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {enhancedLessonData.activities.map((activity, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Materials */}
                <div>
                  <h4 className={`font-medium text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FaClipboardList className="text-orange-500" />
                    Required Materials
                  </h4>
                  <ul className={`text-xs space-y-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {enhancedLessonData.materials.map((material, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        <span>{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Parent Guidance */}
                <div>
                  <h4 className={`font-medium text-sm mb-2 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <FaLightbulb className="text-purple-500" />
                    Parent Guidance
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'} bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg`}>
                    {enhancedLessonData.parentGuidance}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Badge and Action Buttons */}
          <div className="flex flex-col gap-3 sm:gap-4 w-full">
            <div className="flex items-center justify-between">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${statusInfo.bgClass} ${statusInfo.textClass} w-fit`}>
                <StatusIcon className="text-xs" />
                {statusInfo.text}
                {item.status === 'graded' && item.score && (
                  <span className="ml-1">• {item.score}%</span>
                )}
              </div>
              
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' 
                    : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {isExpanded ? 'Less Info' : 'More Info'}
                {isExpanded ? <FaChevronUp className="text-xs" /> : <FaChevronDown className="text-xs" />}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
              <button
                onClick={() => onViewDetails(item)}
                className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex-1 sm:flex-none ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaEye className="text-xs" />
                <span className="truncate">View Details</span>
              </button>

              {item.status === 'pending' && (
                <button
                  onClick={() => onHomeworkAction(item)}
                  className={`flex items-center justify-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white rounded-lg transition-colors flex-1 sm:flex-none ${
                    item.content_type === 'interactive' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {item.content_type === 'interactive' ? (
                    <>
                      <FaGamepad className="text-xs" />
                      <span className="truncate">Start Activity</span>
                    </>
                  ) : (
                    <>
                      <FaUpload className="text-xs" />
                      <span className="truncate">Submit Work</span>
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
};

export default RichHomeworkCard;
