import React, { useState, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import { 
  FaPlay, 
  FaPause, 
  FaStar, 
  FaClock, 
  FaUsers, 
  FaDownload, 
  FaSearch, 
  FaEye,
  FaTimes,
  FaPlus,
  FaPaperPlane
} from 'react-icons/fa';

const LessonLibrary = ({ onAssignHomework, classes = [] }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [assignmentDetails, setAssignmentDetails] = useState({
    dueDate: '',
    instructions: '',
    points: 10
  });
  const audioRef = useRef(null);

  // Sample lesson data - can be replaced with API call
  const lessons = [
    {
      id: 1,
      title: 'ABC Adventure',
      category: 'literacy',
      age: '3-4',
      duration: '15 min',
      difficulty: 'beginner',
      rating: 4.8,
      views: 1240,
      description: 'Learn letters A-C through fun interactive games and songs',
      materials: ['Paper', 'Crayons', 'Letter cards'],
      objectives: ['Recognize letters A, B, C', 'Practice letter sounds', 'Improve fine motor skills'],
      image: '🔤',
      color: isDark ? 'bg-blue-900/20' : 'bg-blue-100',
      borderColor: isDark ? 'border-blue-600' : 'border-blue-300'
    },
    {
      id: 2,
      title: 'Counting Safari',
      category: 'math',
      age: '4-5',
      duration: '12 min',
      difficulty: 'intermediate',
      rating: 4.9,
      views: 856,
      description: 'Count animals from 1-10 while exploring the safari',
      materials: ['Toy animals', 'Counting blocks'],
      objectives: ['Count from 1-10', 'Identify number patterns', 'Animal recognition'],
      image: '🦁',
      color: isDark ? 'bg-green-900/20' : 'bg-green-100',
      borderColor: isDark ? 'border-green-600' : 'border-green-300'
    },
    {
      id: 3,
      title: 'Rainbow Art Lab',
      category: 'creative',
      age: '3-5',
      duration: '20 min',
      difficulty: 'beginner',
      rating: 4.7,
      views: 2103,
      description: 'Explore colors and create beautiful rainbow art',
      materials: ['Paint', 'Brushes', 'Paper', 'Sponges'],
      objectives: ['Learn color names', 'Practice painting techniques', 'Express creativity'],
      image: '🌈',
      color: isDark ? 'bg-purple-900/20' : 'bg-purple-100',
      borderColor: isDark ? 'border-purple-600' : 'border-purple-300'
    },
    {
      id: 4,
      title: 'Weather Watchers',
      category: 'science',
      age: '4-5',
      duration: '18 min',
      difficulty: 'intermediate',
      rating: 4.6,
      views: 674,
      description: 'Discover different types of weather and seasons',
      materials: ['Weather chart', 'Thermometer', 'Calendar'],
      objectives: ['Identify weather types', 'Understand seasons', 'Make predictions'],
      image: '⛅',
      color: isDark ? 'bg-yellow-900/20' : 'bg-yellow-100',
      borderColor: isDark ? 'border-yellow-600' : 'border-yellow-300'
    },
    {
      id: 5,
      title: 'Feelings Friends',
      category: 'social',
      age: '3-4',
      duration: '10 min',
      difficulty: 'beginner',
      rating: 4.9,
      views: 1456,
      description: 'Learn about emotions and how to express feelings',
      materials: ['Emotion cards', 'Mirror', 'Drawing paper'],
      objectives: ['Identify basic emotions', 'Practice emotional expression', 'Build empathy'],
      image: '😊',
      color: isDark ? 'bg-pink-900/20' : 'bg-pink-100',
      borderColor: isDark ? 'border-pink-600' : 'border-pink-300'
    },
    {
      id: 6,
      title: 'Shape Detective',
      category: 'math',
      age: '3-4',
      duration: '14 min',
      difficulty: 'beginner',
      rating: 4.8,
      views: 923,
      description: 'Hunt for shapes around the house and learn their names',
      materials: ['Shape cards', 'Magnifying glass', 'Stickers'],
      objectives: ['Recognize basic shapes', 'Find shapes in environment', 'Sort and classify'],
      image: '🔺',
      color: isDark ? 'bg-green-900/20' : 'bg-green-100',
      borderColor: isDark ? 'border-green-600' : 'border-green-300'
    },
    {
      id: 7,
      title: 'Music & Movement',
      category: 'creative',
      age: '3-5',
      duration: '16 min',
      difficulty: 'beginner',
      rating: 4.9,
      views: 1789,
      description: 'Dance and move to different rhythms and sounds',
      materials: ['Music player', 'Scarves', 'Instruments'],
      objectives: ['Develop rhythm sense', 'Improve coordination', 'Express through movement'],
      image: '🎵',
      color: isDark ? 'bg-purple-900/20' : 'bg-purple-100',
      borderColor: isDark ? 'border-purple-600' : 'border-purple-300'
    },
    {
      id: 8,
      title: 'Plant Growth Lab',
      category: 'science',
      age: '4-5',
      duration: '25 min',
      difficulty: 'intermediate',
      rating: 4.7,
      views: 1045,
      description: 'Learn how plants grow and what they need',
      materials: ['Seeds', 'Pots', 'Soil', 'Water'],
      objectives: ['Understand plant needs', 'Observe growth process', 'Practice measurement'],
      image: '🌱',
      color: isDark ? 'bg-yellow-900/20' : 'bg-yellow-100',
      borderColor: isDark ? 'border-yellow-600' : 'border-yellow-300'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Lessons', icon: '📚', color: isDark ? 'bg-gray-800' : 'bg-gray-100' },
    { id: 'literacy', name: 'Reading & Writing', icon: '📖', color: isDark ? 'bg-blue-900/20' : 'bg-blue-100' },
    { id: 'math', name: 'Numbers & Math', icon: '🔢', color: isDark ? 'bg-green-900/20' : 'bg-green-100' },
    { id: 'science', name: 'Science Fun', icon: '🔬', color: isDark ? 'bg-yellow-900/20' : 'bg-yellow-100' },
    { id: 'creative', name: 'Arts & Crafts', icon: '🎨', color: isDark ? 'bg-purple-900/20' : 'bg-purple-100' },
    { id: 'social', name: 'Social Skills', icon: '👫', color: isDark ? 'bg-pink-900/20' : 'bg-pink-100' }
  ];

  const filteredLessons = lessons.filter(lesson => {
    const matchesCategory = selectedCategory === 'all' || lesson.category === selectedCategory;
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const playAudio = (lessonId) => {
    if (playingAudio === lessonId) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(lessonId);
      setTimeout(() => setPlayingAudio(null), 3000);
    }
  };

  const handleAssignLesson = async () => {
    if (selectedClasses.length === 0) {
      toast.error('Please select at least one class');
      return;
    }

    if (!assignmentDetails.dueDate) {
      toast.error('Please set a due date');
      return;
    }

    try {
      const homeworkData = {
        title: selectedLesson.title,
        description: `${selectedLesson.description}\n\n${assignmentDetails.instructions}`,
        type: 'lesson',
        lesson_id: selectedLesson.id,
        due_date: assignmentDetails.dueDate,
        points: assignmentDetails.points,
        materials: selectedLesson.materials,
        objectives: selectedLesson.objectives,
        duration: selectedLesson.duration,
        difficulty: selectedLesson.difficulty,
        classes: selectedClasses
      };

      // If parent component provided assignment handler, use it
      if (onAssignHomework) {
        await onAssignHomework(homeworkData);
      } else {
        // Otherwise use API directly
        await apiService.homework.create(homeworkData);
      }

      toast.success(`Lesson "${selectedLesson.title}" assigned successfully!`);
      setShowAssignModal(false);
      setSelectedClasses([]);
      setAssignmentDetails({ dueDate: '', instructions: '', points: 10 });
    } catch (error) {
      console.error('Error assigning lesson:', error);
      toast.error('Failed to assign lesson. Please try again.');
    }
  };

  const LessonCard = ({ lesson }) => (
    <div className={`${lesson.color} ${lesson.borderColor} border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${isDark ? 'hover:shadow-gray-800/50' : ''}`}
      onClick={() => setSelectedLesson(lesson)}>
      <div className="flex items-start justify-between mb-4">
        <div className="text-4xl mb-2">{lesson.image}</div>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              playAudio(lesson.id);
            }}
            className={`p-2 rounded-full shadow-md hover:shadow-lg transition-shadow ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white'}`}
          >
            {playingAudio === lesson.id ? 
              <FaPause className="w-4 h-4 text-blue-600" /> : 
              <FaPlay className="w-4 h-4 text-blue-600" />
            }
          </button>
          {user?.role === 'teacher' && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setSelectedLesson(lesson);
                setShowAssignModal(true);
              }}
              className={`p-2 rounded-full shadow-md hover:shadow-lg transition-shadow ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white'}`}
            >
              <FaPlus className="w-4 h-4 text-green-600" />
            </button>
          )}
        </div>
      </div>
      
      <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{lesson.title}</h3>
      <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{lesson.description}</p>
      
      <div className={`flex items-center gap-4 text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="flex items-center gap-1">
          <FaClock className="w-4 h-4" />
          {lesson.duration}
        </div>
        <div className="flex items-center gap-1">
          <FaUsers className="w-4 h-4" />
          Age {lesson.age}
        </div>
        <div className="flex items-center gap-1">
          <FaEye className="w-4 h-4" />
          {lesson.views}
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <FaStar className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium">{lesson.rating}</span>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          lesson.difficulty === 'beginner' ? 'bg-green-200 text-green-800' :
            lesson.difficulty === 'intermediate' ? 'bg-yellow-200 text-yellow-800' :
              'bg-red-200 text-red-800'
        }`}>
          {lesson.difficulty}
        </span>
      </div>
    </div>
  );

  const LessonDetail = ({ lesson, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto p-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-6xl mb-4">{lesson.image}</div>
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>{lesson.title}</h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{lesson.description}</p>
          </div>
          <button 
            onClick={onClose}
            className={`text-2xl ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FaTimes />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <FaClock className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <div className={`font-semibold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>{lesson.duration}</div>
            <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Duration</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <FaUsers className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            <div className={`font-semibold ${isDark ? 'text-green-300' : 'text-green-800'}`}>Age {lesson.age}</div>
            <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Age Range</div>
          </div>
          <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}`}>
            <FaStar className={`w-6 h-6 mx-auto mb-2 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
            <div className={`font-semibold ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>{lesson.rating}</div>
            <div className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Rating</div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Learning Objectives</h3>
          <ul className="space-y-2">
            {lesson.objectives.map((obj, index) => (
              <li key={index} className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {obj}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>Materials Needed</h3>
          <div className="flex flex-wrap gap-2">
            {lesson.materials.map((material, index) => (
              <span key={index} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                {material}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
            <FaPlay className="w-5 h-5" />
            Preview Lesson
          </button>
          {user?.role === 'teacher' && (
            <button 
              onClick={() => setShowAssignModal(true)}
              className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaPaperPlane className="w-5 h-5" />
              Assign as Homework
            </button>
          )}
          <button className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2">
            <FaDownload className="w-5 h-5" />
            Download Materials
          </button>
        </div>
      </div>
    </div>
  );

  const AssignmentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`rounded-2xl max-w-md w-full p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Assign Lesson</h3>
          <button 
            onClick={() => setShowAssignModal(false)}
            className={`${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FaTimes />
          </button>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Classes
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {classes.map(classItem => (
              <label key={classItem.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedClasses.includes(classItem.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedClasses([...selectedClasses, classItem.id]);
                    } else {
                      setSelectedClasses(selectedClasses.filter(id => id !== classItem.id));
                    }
                  }}
                  className="rounded text-blue-600"
                />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {classItem.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Due Date
          </label>
          <input
            type="date"
            value={assignmentDetails.dueDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })}
            className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Points
          </label>
          <input
            type="number"
            value={assignmentDetails.points}
            onChange={(e) => setAssignmentDetails({...assignmentDetails, points: parseInt(e.target.value)})}
            className={`w-full p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            min="1"
            max="100"
          />
        </div>

        <div className="mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Additional Instructions
          </label>
          <textarea
            value={assignmentDetails.instructions}
            onChange={(e) => setAssignmentDetails({...assignmentDetails, instructions: e.target.value})}
            className={`w-full p-3 border rounded-lg h-24 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            placeholder="Add any specific instructions for this assignment..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setShowAssignModal(false)}
            className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button
            onClick={handleAssignLesson}
            className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Assign Lesson
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            🌟 Learning Library
          </h1>
          <p className={`text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Interactive lessons for engaging learning!
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search lessons..."
                className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isDark ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${category.color} px-4 py-2 rounded-full border-2 transition-all duration-200 ${
                  selectedCategory === category.id 
                    ? 'border-blue-500 shadow-md transform scale-105' 
                    : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map(lesson => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>

        {filteredLessons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No lessons found</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Lesson Detail Modal */}
        {selectedLesson && !showAssignModal && (
          <LessonDetail 
            lesson={selectedLesson} 
            onClose={() => setSelectedLesson(null)} 
          />
        )}

        {/* Assignment Modal */}
        {showAssignModal && selectedLesson && (
          <AssignmentModal />
        )}
      </div>

      {/* Audio element for sound effects */}
      <audio ref={audioRef} />
    </div>
  );
};

export default LessonLibrary;
