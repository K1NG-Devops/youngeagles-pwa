import React, { useState, useEffect, useCallback } from 'react';
import { FaUser, FaChartBar, FaCalendarWeek, FaTrophy, FaStar, FaBookOpen, FaCog, FaEye, FaDownload, FaFilter, FaSort, FaSearch } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';

// Skills Framework
const SKILL_CATEGORIES = {
  mathematics: { name: 'Mathematics', color: '#3B82F6', icon: '🔢' },
  literacy: { name: 'Literacy', color: '#10B981', icon: '📚' },
  science: { name: 'Science', color: '#8B5CF6', icon: '🔬' },
  socialEmotional: { name: 'Social-Emotional', color: '#F59E0B', icon: '💖' },
  creative: { name: 'Creative Arts', color: '#EF4444', icon: '🎨' }
};

const PROFICIENCY_LEVELS = {
  1: { name: 'Emerging', color: '#EF4444', description: 'Beginning to show interest' },
  2: { name: 'Developing', color: '#F59E0B', description: 'Making progress with support' },
  3: { name: 'Proficient', color: '#10B981', description: 'Demonstrating skill independently' },
  4: { name: 'Advanced', color: '#3B82F6', description: 'Exceeding expectations' },
  5: { name: 'Mastery', color: '#8B5CF6', description: 'Teaching others, creative application' }
};

const AdvancedProgressDashboard = ({ isDark = false }) => {
  const [activeView, setActiveView] = useState('overview');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [filterPeriod, setFilterPeriod] = useState('week');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  
  // Sample data - would come from API
  const [classData, setClassData] = useState({
    totalStudents: 24,
    averageCompletion: 78,
    weeklyProgress: [
      { week: 'Week 1', completion: 65, engagement: 72 },
      { week: 'Week 2', completion: 71, engagement: 78 },
      { week: 'Week 3', completion: 78, engagement: 85 },
      { week: 'Week 4', completion: 82, engagement: 88 }
    ],
    skillsProgress: [
      { skill: 'Mathematics', current: 3.2, target: 4.0 },
      { skill: 'Literacy', current: 2.8, target: 3.5 },
      { skill: 'Science', current: 3.5, target: 4.0 },
      { skill: 'Social-Emotional', current: 4.1, target: 4.2 },
      { skill: 'Creative Arts', current: 3.7, target: 4.0 }
    ]
  });

  const [studentsData, setStudentsData] = useState([
    {
      id: 1,
      name: 'Emma Johnson',
      avatar: '/api/placeholder/40/40',
      overallProgress: 85,
      homeworkCompleted: 12,
      homeworkTotal: 15,
      skillsProfile: {
        mathematics: 4,
        literacy: 3,
        science: 4,
        socialEmotional: 5,
        creative: 3
      },
      recentActivity: [
        { date: '2024-01-15', assignment: 'Counting Bears', score: 90, skill: 'mathematics' },
        { date: '2024-01-14', assignment: 'Letter Sounds', score: 85, skill: 'literacy' },
        { date: '2024-01-13', assignment: 'Weather Chart', score: 95, skill: 'science' }
      ],
      strengths: ['Problem Solving', 'Creativity', 'Social Skills'],
      improvements: ['Letter Formation', 'Following Multi-step Instructions'],
      parentEngagement: 92
    },
    {
      id: 2,
      name: 'Liam Chen',
      avatar: '/api/placeholder/40/40',
      overallProgress: 72,
      homeworkCompleted: 10,
      homeworkTotal: 15,
      skillsProfile: {
        mathematics: 3,
        literacy: 4,
        science: 3,
        socialEmotional: 3,
        creative: 4
      },
      recentActivity: [
        { date: '2024-01-15', assignment: 'Shape Hunt', score: 75, skill: 'mathematics' },
        { date: '2024-01-14', assignment: 'Story Time', score: 88, skill: 'literacy' },
        { date: '2024-01-12', assignment: 'Art Creation', score: 92, skill: 'creative' }
      ],
      strengths: ['Reading Comprehension', 'Artistic Expression'],
      improvements: ['Number Recognition', 'Sharing with Peers'],
      parentEngagement: 68
    },
    {
      id: 3,
      name: 'Sophia Martinez',
      avatar: '/api/placeholder/40/40',
      overallProgress: 91,
      homeworkCompleted: 14,
      homeworkTotal: 15,
      skillsProfile: {
        mathematics: 5,
        literacy: 4,
        science: 4,
        socialEmotional: 4,
        creative: 5
      },
      recentActivity: [
        { date: '2024-01-15', assignment: 'Pattern Making', score: 98, skill: 'mathematics' },
        { date: '2024-01-14', assignment: 'Science Experiment', score: 94, skill: 'science' },
        { date: '2024-01-13', assignment: 'Creative Writing', score: 96, skill: 'literacy' }
      ],
      strengths: ['Mathematical Thinking', 'Leadership', 'Innovation'],
      improvements: ['Patience in Group Work'],
      parentEngagement: 95
    }
  ]);

  // Filter and sort students
  const filteredStudents = studentsData
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'progress':
          return b.overallProgress - a.overallProgress;
        case 'completion':
          return (b.homeworkCompleted / b.homeworkTotal) - (a.homeworkCompleted / a.homeworkTotal);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Weekly Overview Component
  const WeeklyOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Class Statistics */}
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Class Statistics
            </h3>
            <FaChartBar className={`text-blue-500`} />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Students</span>
              <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{classData.totalStudents}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Completion</span>
              <span className={`font-bold text-green-600`}>{classData.averageCompletion}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Active This Week</span>
              <span className={`font-bold text-blue-600`}>22</span>
            </div>
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className={`md:col-span-2 p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Weekly Progress Trend
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={classData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="week" stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="completion" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Completion Rate"
              />
              <Line 
                type="monotone" 
                dataKey="engagement" 
                stroke="#3B82F6" 
                strokeWidth={3}
                name="Engagement Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Skills Development Matrix */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Class Skills Development Matrix
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={classData.skillsProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
              <XAxis dataKey="skill" stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <YAxis domain={[0, 5]} stroke={isDark ? '#9CA3AF' : '#6B7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="current" fill="#10B981" name="Current Level" />
              <Bar dataKey="target" fill="#3B82F6" name="Target Level" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="space-y-4">
            {classData.skillsProgress.map((skill, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {skill.skill}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {skill.current.toFixed(1)}/{skill.target.toFixed(1)}
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                    style={{ width: `${(skill.current / skill.target) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Individual Student Card Component
  const StudentCard = ({ student }) => (
    <div 
      className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${
        isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'
      }`}
      onClick={() => setSelectedStudent(student)}
    >
      <div className="flex items-center space-x-3 mb-3">
        <img 
          src={student.avatar} 
          alt={student.name}
          className="w-10 h-10 rounded-full bg-gray-300"
        />
        <div className="flex-1">
          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {student.name}
          </h4>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {student.homeworkCompleted}/{student.homeworkTotal} completed
          </p>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${
            student.overallProgress >= 80 ? 'text-green-600' :
            student.overallProgress >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {student.overallProgress}%
          </div>
        </div>
      </div>
      
      {/* Skills Radar Mini Chart */}
      <div className="h-24 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={Object.entries(student.skillsProfile).map(([key, value]) => ({
            skill: SKILL_CATEGORIES[key]?.name || key,
            level: value
          }))}>
            <PolarGrid gridType="polygon" />
            <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis domain={[0, 5]} tick={false} />
            <Radar 
              dataKey="level" 
              stroke="#3B82F6" 
              fill="#3B82F6" 
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Recent Performance */}
      <div className="flex items-center justify-between text-xs">
        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Recent: {student.recentActivity[0]?.score}%
        </span>
        <div className="flex items-center space-x-1">
          {student.strengths.slice(0, 2).map((strength, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs"
            >
              {strength}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // Detailed Student View Component
  const StudentDetailView = ({ student }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setSelectedStudent(null)}
          className={`px-4 py-2 rounded-lg border transition-colors ${
            isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          ← Back to Class View
        </button>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <FaDownload className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Student Header */}
      <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center space-x-4">
          <img 
            src={student.avatar} 
            alt={student.name}
            className="w-16 h-16 rounded-full bg-gray-300"
          />
          <div className="flex-1">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {student.name}
            </h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Overall Progress: <span className="font-semibold text-blue-600">{student.overallProgress}%</span>
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className={`text-2xl font-bold text-green-600`}>
                  {student.homeworkCompleted}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Completed
                </div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {student.homeworkTotal}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skills Profile */}
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Skills Development Profile
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={Object.entries(student.skillsProfile).map(([key, value]) => ({
              skill: SKILL_CATEGORIES[key]?.name || key,
              level: value,
              fullMark: 5
            }))}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" />
              <PolarRadiusAxis domain={[0, 5]} />
              <Radar 
                dataKey="level" 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {student.recentActivity.map((activity, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {activity.assignment}
                  </h4>
                  <span className={`text-sm font-bold ${
                    activity.score >= 80 ? 'text-green-600' :
                    activity.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {activity.score}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs`} style={{
                    backgroundColor: SKILL_CATEGORIES[activity.skill]?.color + '20',
                    color: SKILL_CATEGORIES[activity.skill]?.color
                  }}>
                    {SKILL_CATEGORIES[activity.skill]?.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strengths and Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 text-green-600`}>
            Identified Strengths
          </h3>
          <div className="space-y-2">
            {student.strengths.map((strength, index) => (
              <div key={index} className="flex items-center space-x-2">
                <FaStar className="text-green-500" />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {strength}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 text-blue-600`}>
            Areas for Growth
          </h3>
          <div className="space-y-2">
            {student.improvements.map((improvement, index) => (
              <div key={index} className="flex items-center space-x-2">
                <FaTrophy className="text-blue-500" />
                <span className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {improvement}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📊 Advanced Progress Dashboard
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Comprehensive student progress tracking and analytics
          </p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${
              isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="term">This Term</option>
          </select>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-4 border-b border-gray-200">
        {[
          { id: 'overview', label: 'Class Overview', icon: FaChartBar },
          { id: 'students', label: 'Individual Students', icon: FaUser },
          { id: 'analytics', label: 'Deep Analytics', icon: FaCog }
        ].map(tab => {
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 font-medium transition-colors ${
                activeView === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <TabIcon />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      {selectedStudent ? (
        <StudentDetailView student={selectedStudent} />
      ) : activeView === 'overview' ? (
        <WeeklyOverview />
      ) : activeView === 'students' ? (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FaSearch className={`absolute left-3 top-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 pr-4 py-2 border rounded-lg ${
                    isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-3 py-2 border rounded-lg ${
                  isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
                <option value="completion">Sort by Completion</option>
              </select>
            </div>
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map(student => (
              <StudentCard key={student.id} student={student} />
            ))}
          </div>
        </div>
      ) : (
        <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <FaCog className="mx-auto text-4xl mb-4" />
          <h3 className="text-lg font-medium mb-2">Deep Analytics Coming Soon</h3>
          <p>Advanced analytics and predictive insights will be available here.</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedProgressDashboard;