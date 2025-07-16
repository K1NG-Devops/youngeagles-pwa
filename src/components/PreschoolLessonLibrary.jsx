import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import lessonService from '../services/lessonService';
import nativeNotificationService from '../services/nativeNotificationService';
import { 
  FaBook, 
  FaPlay, 
  FaDownload, 
  FaEye, 
  FaGamepad, 
  FaImages, 
  FaFileAlt, 
  FaHeadphones, 
  FaVideo, 
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaClock,
  FaUsers,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaLightbulb,
  FaCheckCircle,
  FaSpinner
} from 'react-icons/fa';

const PreschoolLessonLibrary = ({ onAssignHomework, classes = [], onClose }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showResourceModal, setShowResourceModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [lessonToAssign, setLessonToAssign] = useState(null);
  const [dueDate, setDueDate] = useState(() => {
    const defaultDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return defaultDate.toISOString().slice(0, 16);
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const allLessons = lessonService.getAllLessons();
    setLessons([...allLessons.age_1_3, ...allLessons.age_4_6]);
  }, []);

  const filteredLessons = lessons.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.objective.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAge = selectedAgeGroup === 'all' || 
                      (selectedAgeGroup === '1-3' && lesson.id <= 10) ||
                      (selectedAgeGroup === '4-6' && lesson.id > 10);
    const matchesDifficulty = selectedDifficulty === 'all' || lesson.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesAge && matchesDifficulty;
  });

  const generateDigitalResource = (type, lessonTitle, content) => {
    const baseUrl = '/resources/preschool'; // This would be served from your static assets
    
    switch(type) {
      case 'flashcard':
        return {
          type: 'Interactive Flashcards',
          icon: FaImages,
          description: `Digital flashcards for ${lessonTitle}`,
          url: `${baseUrl}/flashcards/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.html`,
          interactive: true,
          content: content
        };
      case 'storybook':
        return {
          type: 'Digital Storybook',
          icon: FaBook,
          description: `Interactive storybook for ${lessonTitle}`,
          url: `${baseUrl}/storybooks/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.html`,
          interactive: true,
          content: content
        };
      case 'audio':
        return {
          type: 'Audio Guide',
          icon: FaHeadphones,
          description: `Audio narration for ${lessonTitle}`,
          url: `${baseUrl}/audio/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.mp3`,
          interactive: false,
          content: content
        };
      case 'video':
        return {
          type: 'Video Tutorial',
          icon: FaVideo,
          description: `Video demonstration for ${lessonTitle}`,
          url: `${baseUrl}/videos/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.mp4`,
          interactive: false,
          content: content
        };
      case 'worksheet':
        return {
          type: 'Printable Worksheet',
          icon: FaFileAlt,
          description: `Printable activities for ${lessonTitle}`,
          url: `${baseUrl}/worksheets/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.pdf`,
          interactive: false,
          content: content
        };
      case 'game':
        return {
          type: 'Interactive Game',
          icon: FaGamepad,
          description: `Educational game for ${lessonTitle}`,
          url: `${baseUrl}/games/${lessonTitle.toLowerCase().replace(/\s+/g, '-')}.html`,
          interactive: true,
          content: content
        };
      default:
        return null;
    }
  };

  const getLessonResources = (lesson) => {
    const resources = [];
    
    // Generate appropriate resources based on lesson content
    if (lesson.title.includes('Color') || lesson.title.includes('Shape') || lesson.title.includes('Animal')) {
      resources.push(generateDigitalResource('flashcard', lesson.title, {
        cards: lesson.title.includes('Color') ? 
          ['Red Apple', 'Blue Ball', 'Yellow Sun', 'Green Tree'] :
          lesson.title.includes('Shape') ?
          ['Circle', 'Square', 'Triangle', 'Rectangle'] :
          ['Dog - Woof', 'Cat - Meow', 'Cow - Moo', 'Duck - Quack']
      }));
    }
    
    if (lesson.title.includes('Story') || lesson.title.includes('Family') || lesson.title.includes('Emotion')) {
      resources.push(generateDigitalResource('storybook', lesson.title, {
        pages: [
          { image: 'page1.jpg', text: 'Once upon a time...' },
          { image: 'page2.jpg', text: 'There was a little child...' },
          { image: 'page3.jpg', text: 'Who learned something new...' }
        ]
      }));
    }
    
    if (lesson.title.includes('Music') || lesson.title.includes('Sound') || lesson.title.includes('Action')) {
      resources.push(generateDigitalResource('audio', lesson.title, {
        duration: '3:45',
        tracks: ['Introduction', 'Main Activity', 'Conclusion']
      }));
    }
    
    if (lesson.title.includes('Addition') || lesson.title.includes('Counting') || lesson.title.includes('Letter')) {
      resources.push(generateDigitalResource('game', lesson.title, {
        levels: ['Beginner', 'Intermediate', 'Advanced'],
        activities: lesson.activities.slice(0, 3)
      }));
    }
    
    // Always include worksheet and video
    resources.push(generateDigitalResource('worksheet', lesson.title, {
      pages: 3,
      activities: lesson.activities
    }));
    
    resources.push(generateDigitalResource('video', lesson.title, {
      duration: '5:30',
      chapters: ['Introduction', 'Activity Demo', 'Summary']
    }));
    
    return resources.filter(r => r !== null);
  };

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowResourceModal(true);
  };

  const handleAssignLesson = async (lesson) => {
    try {
      setIsLoading(true);
      
      const homeworkData = lessonService.convertToHomework(
        lesson.id,
        user.id,
        classes[0]?.id || 1,
        dueDate
      );
      
      // Add digital resources to homework
      const resources = getLessonResources(lesson);
      homeworkData.digital_resources = resources;
      homeworkData.has_digital_resources = true;
      
      await onAssignHomework(homeworkData);
      
      nativeNotificationService.success(`"${lesson.title}" assigned with digital resources!`);
      setShowAssignModal(false);
      setLessonToAssign(null);
    } catch (error) {
      nativeNotificationService.error('Failed to assign lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const ResourceModal = ({ resource, onClose }) => {
    if (!resource) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <resource.icon className="text-2xl text-blue-500 mr-3" />
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {resource.type}
                </h3>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                }`}
              >
                ×
              </button>
            </div>
            
            <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {resource.description}
            </p>
            
            {resource.interactive ? (
              <div className={`p-4 rounded-lg border-2 border-dashed ${
                isDark ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
              }`}>
                <div className="text-center">
                  <resource.icon className="text-4xl text-blue-500 mx-auto mb-2" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Interactive content will load here
                  </p>
                  <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Launch Interactive Content
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <FaDownload className="mr-2" />
                  Download Resource
                </button>
                <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FaPlay className="mr-2" />
                  Preview Resource
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const AssignModal = ({ lesson, onClose, onAssign }) => {
    if (!lesson) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`max-w-lg w-full rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="p-6">
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Assign Lesson: {lesson.title}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <h4 className={`font-medium mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Included Digital Resources:
                </h4>
                <div className="space-y-1">
                  {getLessonResources(lesson).map((resource, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <resource.icon className="mr-2 text-blue-500" />
                      <span className={isDark ? 'text-blue-200' : 'text-blue-700'}>
                        {resource.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={() => onAssign(lesson)}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      Assigning...
                    </>
                  ) : (
                    'Assign Lesson'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onClose}
            className="flex items-center px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-xl font-bold">Preschool Lesson Library</h1>
          <div className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {filteredLessons.length} lessons
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>
          
          <select
            value={selectedAgeGroup}
            onChange={(e) => setSelectedAgeGroup(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Ages</option>
            <option value="1-3">Ages 1-3</option>
            <option value="4-6">Ages 4-6</option>
          </select>
          
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${
              isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="all">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const resources = getLessonResources(lesson);
            
            return (
              <div
                key={lesson.id}
                className={`rounded-xl border shadow-sm hover:shadow-md transition-shadow ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {lesson.title}
                    </h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      lesson.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                      lesson.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lesson.difficulty}
                    </div>
                  </div>
                  
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {lesson.objective}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <FaClock className="mr-1" />
                      {lesson.duration}min
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-1" />
                      Age {lesson.id <= 10 ? '1-3' : '4-6'}
                    </div>
                  </div>
                  
                  {/* Digital Resources Preview */}
                  <div className="mb-4">
                    <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Digital Resources ({resources.length})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {resources.slice(0, 3).map((resource, index) => (
                        <button
                          key={index}
                          onClick={() => handleResourceClick(resource)}
                          className={`p-2 rounded-lg text-center transition-colors ${
                            isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <resource.icon className="text-blue-500 mx-auto mb-1" />
                          <div className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {resource.type.split(' ')[0]}
                          </div>
                        </button>
                      ))}
                      {resources.length > 3 && (
                        <div className={`p-2 rounded-lg text-center ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <div className="text-xs text-gray-500">+{resources.length - 3} more</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedLesson(lesson)}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                        isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      <FaEye className="mr-2 inline" />
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        setLessonToAssign(lesson);
                        setShowAssignModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <FaCheckCircle className="mr-2 inline" />
                      Assign
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showResourceModal && (
        <ResourceModal 
          resource={selectedResource} 
          onClose={() => setShowResourceModal(false)} 
        />
      )}
      
      {showAssignModal && (
        <AssignModal
          lesson={lessonToAssign}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignLesson}
        />
      )}
    </div>
  );
};

export default PreschoolLessonLibrary;
