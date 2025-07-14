// Advanced AI Homework Analytics Dashboard
// Real-time insights and performance tracking

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { 
  FaChartLine, 
  FaBrain, 
  FaUsers, 
  FaClock, 
  FaStar,
  FaLightbulb,
  FaHeart,
  FaEye,
  FaComments,
  FaExclamationTriangle,
  FaCheckCircle,
  FaGamepad,
  FaUpload
} from 'react-icons/fa';
import { 
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

const AIHomeworkAnalytics = ({ homework, students: _students, onClose }) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [_timeRange, _setTimeRange] = useState('week');
  const [_selectedStudent, _setSelectedStudent] = useState(null);
  const [_realTimeData, _setRealTimeData] = useState({});
  const [_aiInsights, _setAiInsights] = useState([]);

  // Mock data for demonstration
  const mockData = {
    overview: {
      totalSubmissions: 24,
      averageScore: 87.5,
      completionRate: 89,
      averageTime: 23.5,
      engagementScore: 92,
      strugglingStudents: 3,
      exceelingStudents: 8
    },
    timeData: [
      { time: '09:00', submissions: 5, accuracy: 85 },
      { time: '10:00', submissions: 8, accuracy: 88 },
      { time: '11:00', submissions: 12, accuracy: 92 },
      { time: '12:00', submissions: 7, accuracy: 85 },
      { time: '13:00', submissions: 15, accuracy: 90 },
      { time: '14:00', submissions: 18, accuracy: 94 },
      { time: '15:00', submissions: 22, accuracy: 91 },
      { time: '16:00', submissions: 19, accuracy: 89 }
    ],
    difficultyData: [
      { difficulty: 'Easy', correct: 95, incorrect: 5 },
      { difficulty: 'Medium', correct: 78, incorrect: 22 },
      { difficulty: 'Hard', correct: 65, incorrect: 35 }
    ],
    engagementData: [
      { activity: 'Number Quest', engagement: 95, completions: 23 },
      { activity: 'Shape Detective', engagement: 88, completions: 21 },
      { activity: 'Math Carnival', engagement: 92, completions: 22 },
      { activity: 'Space Mission', engagement: 85, completions: 20 }
    ],
    learningStyleData: [
      { style: 'Visual', value: 45, color: '#8B5CF6' },
      { style: 'Auditory', value: 30, color: '#10B981' },
      { style: 'Kinesthetic', value: 25, color: '#F59E0B' }
    ],
    studentProgress: [
      { name: 'Emma', score: 95, time: 18, engagement: 98, struggles: 0 },
      { name: 'Liam', score: 88, time: 25, engagement: 85, struggles: 1 },
      { name: 'Sofia', score: 92, time: 22, engagement: 92, struggles: 0 },
      { name: 'Noah', score: 75, time: 32, engagement: 78, struggles: 3 },
      { name: 'Ava', score: 85, time: 28, engagement: 88, struggles: 2 }
    ]
  };

  // AI-generated insights
  const generateAIInsights = () => {
    return [
      {
        type: 'performance',
        icon: FaChartLine,
        title: 'Performance Trend',
        message: 'Class performance has improved by 12% since last week. Students are showing stronger number recognition skills.',
        priority: 'high',
        color: 'text-green-500'
      },
      {
        type: 'engagement',
        icon: FaHeart,
        title: 'Engagement Alert',
        message: 'The "Magical Number Quest" activity has 95% engagement rate. Consider using similar fantasy themes.',
        priority: 'medium',
        color: 'text-purple-500'
      },
      {
        type: 'difficulty',
        icon: FaExclamationTriangle,
        title: 'Difficulty Adjustment',
        message: '3 students are struggling with counting beyond 7. AI suggests adding more visual aids.',
        priority: 'high',
        color: 'text-orange-500'
      },
      {
        type: 'timing',
        icon: FaClock,
        title: 'Optimal Timing',
        message: 'Peak performance occurs between 2-4 PM. Consider scheduling similar activities during this window.',
        priority: 'low',
        color: 'text-blue-500'
      },
      {
        type: 'learning_style',
        icon: FaBrain,
        title: 'Learning Style Insight',
        message: '65% of students prefer visual learning. Adding more animations could boost overall performance.',
        priority: 'medium',
        color: 'text-indigo-500'
      }
    ];
  };

  useEffect(() => {
    setAiInsights(generateAIInsights());
  }, []);

  // Real-time data updates (mock)
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeStudents: Math.floor(Math.random() * 5) + 15,
        recentSubmissions: Math.floor(Math.random() * 3) + 1,
        currentEngagement: Math.floor(Math.random() * 10) + 85
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            label: 'Total Submissions', 
            value: mockData.overview.totalSubmissions, 
            icon: FaUpload, 
            color: 'text-blue-500',
            trend: '+12%'
          },
          { 
            label: 'Average Score', 
            value: `${mockData.overview.averageScore}%`, 
            icon: FaStar, 
            color: 'text-yellow-500',
            trend: '+5%'
          },
          { 
            label: 'Completion Rate', 
            value: `${mockData.overview.completionRate}%`, 
            icon: FaCheckCircle, 
            color: 'text-green-500',
            trend: '+8%'
          },
          { 
            label: 'Avg Time', 
            value: `${mockData.overview.averageTime}m`, 
            icon: FaClock, 
            color: 'text-purple-500',
            trend: '-3m'
          }
        ].map((stat, index) => (
          <div key={index} className={`p-4 rounded-xl ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
          } shadow-sm`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stat.value}
                </p>
                <p className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend} from last week
                </p>
              </div>
              <stat.icon className={`text-2xl ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-700' : 'bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <FaBrain className="inline mr-2 text-purple-500" />
          AI Insights & Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiInsights.slice(0, 4).map((insight, index) => (
            <div key={index} className={`p-4 rounded-lg ${
              isDark ? 'bg-gray-800/50' : 'bg-white/70'
            } border border-gray-200/50`}>
              <div className="flex items-start space-x-3">
                <insight.icon className={`text-lg mt-1 ${insight.color}`} />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {insight.message}
                  </p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs ${
                    insight.priority === 'high' 
                      ? 'bg-red-100 text-red-700' 
                      : insight.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}>
                    {insight.priority} priority
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submission Timeline */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Submission Timeline
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={mockData.timeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="submissions" 
                stroke="#8B5CF6" 
                fill="#8B5CF6" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Learning Style Distribution */}
        <div className={`p-6 rounded-xl ${
          isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
        }`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Learning Style Preferences
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={mockData.learningStyleData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {mockData.learningStyleData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderStudentTab = () => (
    <div className="space-y-6">
      {/* Student Performance Table */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Individual Student Performance
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Student
                </th>
                <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Score
                </th>
                <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Time
                </th>
                <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Engagement
                </th>
                <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Struggles
                </th>
                <th className={`text-center py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockData.studentProgress.map((student, index) => (
                <tr key={index} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {student.name.charAt(0)}
                      </div>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {student.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className={`font-semibold ${
                        student.score >= 90 ? 'text-green-500' :
                          student.score >= 80 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {student.score}%
                      </span>
                      {student.score >= 90 && <FaStar className="text-yellow-500" />}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {student.time}m
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <div className={`w-12 h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                        <div 
                          className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${student.engagement}%` }}
                        />
                      </div>
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {student.engagement}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {student.struggles > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">
                        <FaExclamationTriangle className="mr-1" />
                        {student.struggles}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                        <FaCheckCircle className="mr-1" />
                        None
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button className="p-1 text-blue-500 hover:text-blue-600">
                        <FaEye />
                      </button>
                      <button className="p-1 text-purple-500 hover:text-purple-600">
                        <FaComments />
                      </button>
                      <button className="p-1 text-green-500 hover:text-green-600">
                        <FaLightbulb />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      {/* Activity Performance */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Activity Performance Analysis
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={mockData.engagementData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="activity" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="engagement" fill="#8B5CF6" />
            <Bar dataKey="completions" fill="#10B981" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Difficulty Analysis */}
      <div className={`p-6 rounded-xl ${
        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Difficulty Level Analysis
        </h3>
        
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockData.difficultyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="difficulty" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="correct" fill="#10B981" />
            <Bar dataKey="incorrect" fill="#EF4444" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl ${
        isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-200'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FaChartLine className="text-2xl text-purple-500" />
              <div>
                <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  AI Analytics Dashboard
                </h2>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {homework?.title || 'Homework Analytics'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Live Data
                </span>
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
          </div>

          {/* Tabs */}
          <div className="mt-4 flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartLine },
              { id: 'students', label: 'Students', icon: FaUsers },
              { id: 'activities', label: 'Activities', icon: FaGamepad }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white shadow-md'
                    : isDark 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="text-sm" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-full overflow-y-auto">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'students' && renderStudentTab()}
          {activeTab === 'activities' && renderActivityTab()}
        </div>
      </div>
    </div>
  );
};

export default AIHomeworkAnalytics;
