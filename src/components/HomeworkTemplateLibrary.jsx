// Advanced Homework Template Library
// Pre-designed templates for quick homework creation

import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaBookOpen, 
  FaSearch, 
  FaStar, 
  FaDownload, 
  FaEye, 
  FaHeart,
  FaGamepad,
  FaUpload,
  FaPalette,
  FaClock,
  FaUsers,
  FaSparkles,
  FaRocket,
  FaAward,
  FaClone
} from 'react-icons/fa';

const HomeworkTemplateLibrary = ({ onTemplateSelect, onClose }) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAge, setSelectedAge] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [favorites, setFavorites] = useState([]);

  // Comprehensive template database
  const templates = [
    {
      id: 1,
      title: 'Magical Number Quest',
      description: 'Interactive counting adventure with animated fairy characters',
      category: 'Mathematics',
      subject: 'Mathematics',
      topic: 'Counting 1-10',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: 25,
      type: 'interactive',
      features: ['animations', 'sound-effects', 'rewards', 'adaptive'],
      thumbnail: '🧚‍♀️',
      rating: 4.8,
      downloads: 1234,
      activities: 3,
      gamification: 'high',
      learningStyle: 'visual',
      tags: ['counting', 'numbers', 'fantasy', 'interactive'],
      preview: {
        description: 'Children join Luna the fairy to find hidden numbers in an enchanted forest',
        activities: ['Number Hunt', 'Fairy Counting Circle', 'Magic Number Garden'],
        rewards: ['Fairy Wings', 'Magic Wand', 'Sparkle Stars']
      }
    },
    {
      id: 2,
      title: 'Space Math Mission',
      description: 'Galactic addition and subtraction adventure',
      category: 'Mathematics',
      subject: 'Mathematics',
      topic: 'Basic Addition',
      ageGroup: '4-6',
      difficulty: 'medium',
      duration: 30,
      type: 'interactive',
      features: ['3d-graphics', 'voice-guidance', 'progress-tracking'],
      thumbnail: '🚀',
      rating: 4.9,
      downloads: 2156,
      activities: 4,
      gamification: 'high',
      learningStyle: 'kinesthetic',
      tags: ['addition', 'space', 'adventure', 'problem-solving'],
      preview: {
        description: 'Astronauts solve math problems to fuel their rocket and explore planets',
        activities: ['Rocket Fuel Calculator', 'Planet Population Count', 'Space Station Builder', 'Alien Math Challenge'],
        rewards: ['Astronaut Badge', 'Planet Discovery', 'Space Medal']
      }
    },
    {
      id: 3,
      title: 'Shape Detective Mystery',
      description: 'Solve mysteries by identifying shapes in city scenes',
      category: 'Mathematics',
      subject: 'Mathematics',
      topic: 'Shape Recognition',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: 20,
      type: 'interactive',
      features: ['mystery-solving', 'detective-theme', 'clue-finding'],
      thumbnail: '🕵️',
      rating: 4.7,
      downloads: 890,
      activities: 3,
      gamification: 'medium',
      learningStyle: 'visual',
      tags: ['shapes', 'mystery', 'detective', 'observation'],
      preview: {
        description: 'Young detectives solve cases by finding and identifying shapes around the city',
        activities: ['Missing Shape Case', 'Shape Pattern Mystery', 'Building Blueprint Detective'],
        rewards: ['Detective Badge', 'Magnifying Glass', 'Case Solved Certificate']
      }
    },
    {
      id: 4,
      title: 'Alphabet Adventure Park',
      description: 'Letter recognition and phonics in a fun park setting',
      category: 'Language Arts',
      subject: 'Language Arts',
      topic: 'Letter Recognition',
      ageGroup: '4-6',
      difficulty: 'easy',
      duration: 35,
      type: 'interactive',
      features: ['phonics', 'letter-tracing', 'word-building'],
      thumbnail: '🎡',
      rating: 4.6,
      downloads: 1567,
      activities: 5,
      gamification: 'high',
      learningStyle: 'auditory',
      tags: ['letters', 'phonics', 'reading', 'park'],
      preview: {
        description: 'Children explore different park attractions while learning letters and sounds',
        activities: ['Letter Carousel', 'Phonics Playground', 'Word Building Blocks', 'Alphabet Ferris Wheel', 'Letter Hunt Safari'],
        rewards: ['Park Pass', 'Reading Star', 'Alphabet Champion']
      }
    },
    {
      id: 5,
      title: 'Color Mixing Lab',
      description: 'Creative color theory and mixing experiments',
      category: 'Art',
      subject: 'Art',
      topic: 'Color Theory',
      ageGroup: '4-6',
      difficulty: 'medium',
      duration: 40,
      type: 'interactive',
      features: ['color-mixing', 'creativity', 'experimentation'],
      thumbnail: '🎨',
      rating: 4.5,
      downloads: 743,
      activities: 4,
      gamification: 'medium',
      learningStyle: 'kinesthetic',
      tags: ['colors', 'art', 'creativity', 'experiments'],
      preview: {
        description: 'Young artists learn about colors by mixing and creating beautiful artwork',
        activities: ['Primary Color Lab', 'Rainbow Creator', 'Color Wheel Spinner', 'Masterpiece Gallery'],
        rewards: ['Artist Palette', 'Color Master Badge', 'Creative Genius Award']
      }
    },
    {
      id: 6,
      title: 'Traditional Math Worksheets',
      description: 'Classic printable worksheets for offline practice',
      category: 'Mathematics',
      subject: 'Mathematics',
      topic: 'Mixed Practice',
      ageGroup: '4-6',
      difficulty: 'medium',
      duration: 45,
      type: 'traditional',
      features: ['printable', 'offline', 'parent-guided'],
      thumbnail: '📄',
      rating: 4.2,
      downloads: 3421,
      activities: 6,
      gamification: 'low',
      learningStyle: 'visual',
      tags: ['worksheets', 'traditional', 'printable', 'practice'],
      preview: {
        description: 'Comprehensive worksheet collection for structured math practice',
        activities: ['Number Tracing', 'Shape Coloring', 'Counting Practice', 'Pattern Completion', 'Simple Addition', 'Size Comparison'],
        rewards: ['Completion Stickers', 'Progress Chart', 'Parent Praise']
      }
    }
  ];

  // Filter templates based on search and filters
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesAge = selectedAge === 'all' || template.ageGroup === selectedAge;
    const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesAge && matchesDifficulty;
  });

  // Categories and filter options
  const categories = ['all', 'Mathematics', 'Language Arts', 'Science', 'Art', 'Music'];
  const ageGroups = ['all', '2-3', '4-6', '7-9'];
  const difficulties = ['all', 'easy', 'medium', 'hard'];

  // Handle template selection
  const handleTemplateSelect = (template) => {
    onTemplateSelect(template);
    onClose();
  };

  // Toggle favorite
  const toggleFavorite = (templateId) => {
    setFavorites(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
    case 'easy': return 'text-green-500';
    case 'medium': return 'text-yellow-500';
    case 'hard': return 'text-red-500';
    default: return 'text-gray-500';
    }
  };

  // Get type icon
  const getTypeIcon = (type) => {
    switch(type) {
    case 'interactive': return FaGamepad;
    case 'traditional': return FaUpload;
    case 'mixed': return FaPalette;
    default: return FaBookOpen;
    }
  };

  const renderTemplateCard = (template) => {
    const TypeIcon = getTypeIcon(template.type);
    
    return (
      <div key={template.id} className={`group relative p-6 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isDark 
          ? 'bg-gray-800 border-gray-700 hover:border-purple-500' 
          : 'bg-white border-gray-200 hover:border-purple-400'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{template.thumbnail}</div>
            <div>
              <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {template.title}
              </h3>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {template.subject} • {template.topic}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => toggleFavorite(template.id)}
            className={`p-2 rounded-full transition-colors ${
              favorites.includes(template.id)
                ? 'text-red-500 hover:text-red-600'
                : isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <FaHeart className={favorites.includes(template.id) ? 'fill-current' : ''} />
          </button>
        </div>

        {/* Description */}
        <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {template.description}
        </p>

        {/* Template Stats */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <FaClock className="text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {template.duration} min
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FaUsers className="text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Ages {template.ageGroup}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <TypeIcon className="text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {template.type}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <FaAward className={getDifficultyColor(template.difficulty)} />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {template.difficulty}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {template.features.slice(0, 3).map((feature, index) => (
            <span key={index} className={`px-2 py-1 rounded-full text-xs ${
              isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-700'
            }`}>
              {feature}
            </span>
          ))}
          {template.features.length > 3 && (
            <span className={`px-2 py-1 rounded-full text-xs ${
              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
            }`}>
              +{template.features.length - 3} more
            </span>
          )}
        </div>

        {/* Rating and Downloads */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-500" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {template.rating}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <FaDownload className="text-gray-400" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {template.downloads}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <FaSparkles className="text-orange-500" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {template.activities} activities
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleTemplateSelect(template)}
            className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FaRocket className="mr-2 inline" />
            Use Template
          </button>
          
          <button className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}>
            <FaEye />
          </button>
          
          <button className={`p-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
              : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
          }`}>
            <FaClone />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <FaBookOpen className="text-2xl text-purple-500" />
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Template Library
              </h2>
            </div>
            
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-400 hover:text-white' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
            >
              ✕
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              />
            </div>

            {/* Filters */}
            <div className="flex space-x-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>

              <select
                value={selectedAge}
                onChange={(e) => setSelectedAge(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {ageGroups.map(age => (
                  <option key={age} value={age}>
                    {age === 'all' ? 'All Ages' : `${age} years`}
                  </option>
                ))}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${
                  isDark 
                    ? 'bg-gray-800 border-gray-600 text-white' 
                    : 'bg-white border-gray-300'
                }`}
              >
                {difficulties.map(diff => (
                  <option key={diff} value={diff}>
                    {diff === 'all' ? 'All Levels' : diff}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <FaSearch className="text-4xl text-gray-400 mx-auto mb-4" />
              <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No templates found matching your criteria
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(renderTemplateCard)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeworkTemplateLibrary;
