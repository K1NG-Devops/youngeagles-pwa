import React from 'react';
import { useTheme } from '../hooks/useTheme';
import {
  FaBook,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaGraduationCap,
  FaTasks,
  FaUsers,
  FaChartLine
} from 'react-icons/fa';

const LessonLibrarySummary = () => {
  const { isDark } = useTheme();

  const libraryStats = {
    totalLessons: 16,
    readyMadeLessons: 8,
    homeworkAssignments: 8,
    totalWorksheets: 24,
    ageGroups: ['2-3 years', '3-4 years', '4-5 years', '4-6 years'],
    subjects: ['Mathematics', 'Language/Literacy', 'Science', 'Art & Creativity', 'Social Skills'],
    capsAligned: true,
    hasStepByStepInstructions: true,
    hasAssessments: true,
    hasDownloadables: true
  };

  const lessonDetails = [
    {
      category: 'Interactive Lessons',
      count: 8,
      items: [
        'ABC Adventure: Letters A, B, C',
        'Counting Safari: Numbers 1-10', 
        'Rainbow Colors & Patterns',
        'Weather Watchers & Seasons',
        'Feelings Friends: Emotions',
        'Shape Detective Adventure',
        'Music & Movement Magic',
        'Plant Growth Laboratory'
      ]
    },
    {
      category: 'Homework Assignments',
      count: 8,
      items: [
        'Counting and Number Recognition 1-10',
        'Basic Shape Recognition & Sorting',
        'Letter Recognition A-E with Phonics',
        'Colors, Patterns & Creative Art',
        'Advanced Counting 11-20 & Teen Numbers',
        'Letter Recognition F-J & Word Building',
        'Simple Word Formation & Reading',
        'Basic Addition & Number Concepts'
      ]
    }
  ];

  const features = [
    {
      icon: <FaCheckCircle className="w-5 h-5 text-green-500" />,
      title: 'CAPS-Aligned Content',
      description: 'All lessons follow South African curriculum standards'
    },
    {
      icon: <FaTasks className="w-5 h-5 text-blue-500" />,
      title: 'Step-by-Step Instructions',
      description: 'Detailed teacher guidance for every activity'
    },
    {
      icon: <FaDownload className="w-5 h-5 text-purple-500" />,
      title: 'Downloadable Resources',
      description: '24+ worksheets, cards, and materials ready to print'
    },
    {
      icon: <FaChartLine className="w-5 h-5 text-orange-500" />,
      title: 'Assessment Tools',
      description: 'Built-in checklists and rubrics for evaluation'
    }
  ];

  return (
    <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-2">📚 Complete Lesson Library Status</h2>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Comprehensive CAPS-Aligned Educational Content
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
          <FaBook className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            {libraryStats.totalLessons}
          </div>
          <div className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Total Lessons</div>
        </div>

        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
          <FaDownload className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>
            {libraryStats.totalWorksheets}+
          </div>
          <div className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Worksheets</div>
        </div>

        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
          <FaGraduationCap className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
            {libraryStats.subjects.length}
          </div>
          <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Subjects</div>
        </div>

        <div className={`p-4 rounded-lg text-center ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
          <FaUsers className={`w-8 h-8 mx-auto mb-2 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          <div className={`text-2xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
            {libraryStats.ageGroups.length}
          </div>
          <div className={`text-sm ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Age Groups</div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {features.map((feature, index) => (
          <div key={index} className={`p-4 rounded-lg border ${isDark ? 'border-gray-600 bg-gray-700/50' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center mb-2">
              {feature.icon}
              <h3 className="ml-3 font-semibold">{feature.title}</h3>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Detailed Content List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {lessonDetails.map((category, index) => (
          <div key={index} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <span className="text-2xl mr-2">{index === 0 ? '🌟' : '📝'}</span>
              {category.category} ({category.count})
            </h3>
            <ul className="space-y-2">
              {category.items.map((item, itemIndex) => (
                <li key={itemIndex} className={`flex items-start text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className="text-green-500 mr-2 mt-1">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* What's Included Summary */}
      <div className={`mt-8 p-6 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
        <h3 className={`text-lg font-bold mb-3 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
          ✅ What Teachers & Children Get:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-green-200' : 'text-green-700'}`}>For Teachers:</h4>
            <ul className={`space-y-1 text-sm ${isDark ? 'text-green-100' : 'text-green-600'}`}>
              <li>• Complete lesson plans with timing</li>
              <li>• Step-by-step activity instructions</li>
              <li>• Assessment checklists and rubrics</li>
              <li>• All materials lists provided</li>
              <li>• CAPS curriculum alignment</li>
            </ul>
          </div>
          <div>
            <h4 className={`font-semibold mb-2 ${isDark ? 'text-green-200' : 'text-green-700'}`}>For Children & Parents:</h4>
            <ul className={`space-y-1 text-sm ${isDark ? 'text-green-100' : 'text-green-600'}`}>
              <li>• Downloadable worksheets and activities</li>
              <li>• Clear parent guidance instructions</li>
              <li>• Age-appropriate, engaging content</li>
              <li>• Progressive skill development</li>
              <li>• Home-school connection support</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center mt-6">
        <div className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold ${
          isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
        }`}>
          <FaCheckCircle className="mr-2" />
          All Lessons Are Complete & Ready to Assign!
        </div>
      </div>
    </div>
  );
};

export default LessonLibrarySummary;
