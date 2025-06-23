import React, { useState, useEffect } from 'react';
import { FaCalendarWeek, FaTrophy, FaStar, FaBookOpen, FaChartLine, FaDownload, FaEye, FaSpinner, FaChild, FaGraduationCap } from 'react-icons/fa';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { showTopNotification } from '../TopNotificationManager';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://youngeagles-api-server.up.railway.app';

const SKILL_COLORS = {
  mathematics: '#3B82F6',
  literacy: '#10B981', 
  science: '#8B5CF6',
  socialEmotional: '#F59E0B',
  creative: '#EF4444'
};

const WeeklyReportDashboard = ({ isDark = false }) => {
  const [selectedChild, setSelectedChild] = useState(null);
  const [children, setChildren] = useState([]);
  const [weeklyReport, setWeeklyReport] = useState(null);
  const [skillProgress, setSkillProgress] = useState(null);
  const [loading, setLoading] = useState({
    children: true,
    report: false,
    skills: false
  });
  const [selectedWeek, setSelectedWeek] = useState(() => {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    return startOfWeek.toISOString().split('T')[0];
  });

  // Get parent ID and token from localStorage
  const parentId = localStorage.getItem('parentId') || localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  // Fetch children on component mount
  useEffect(() => {
    fetchChildren();
  }, []);

  // Fetch report when child or week changes
  useEffect(() => {
    if (selectedChild) {
      fetchWeeklyReport();
      fetchSkillProgress();
    }
  }, [selectedChild, selectedWeek]);

  const fetchChildren = async () => {
    try {
      setLoading(prev => ({ ...prev, children: true }));
      
      const response = await fetch(`${API_BASE_URL}/api/parent/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const childrenList = result.children || [];
        setChildren(childrenList);
        
        // Auto-select first child if available
        if (childrenList.length > 0 && !selectedChild) {
          setSelectedChild(childrenList[0]);
        }
      } else {
        toast.error('Failed to load children');
      }
    } catch (error) {
      console.error('Error fetching children:', error);
      toast.error('Error loading children data');
    } finally {
      setLoading(prev => ({ ...prev, children: false }));
    }
  };

  const fetchWeeklyReport = async () => {
    if (!selectedChild) return;

    try {
      setLoading(prev => ({ ...prev, report: true }));
      
      const weekEnd = new Date(selectedWeek);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const response = await fetch(
        `${API_BASE_URL}/api/homework/reports/weekly/${selectedChild.id}?weekStart=${selectedWeek}&weekEnd=${weekEnd.toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setWeeklyReport(result.report);
      } else {
        const error = await response.json();
        console.error('Report fetch error:', error);
        toast.error('Failed to load weekly report');
      }
    } catch (error) {
      console.error('Error fetching weekly report:', error);
      toast.error('Error loading weekly report');
    } finally {
      setLoading(prev => ({ ...prev, report: false }));
    }
  };

  const fetchSkillProgress = async () => {
    if (!selectedChild) return;

    try {
      setLoading(prev => ({ ...prev, skills: true }));
      
      const response = await fetch(
        `${API_BASE_URL}/api/homework/skills/progress/${selectedChild.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setSkillProgress(result);
      } else {
        console.error('Skills fetch error:', await response.json());
      }
    } catch (error) {
      console.error('Error fetching skill progress:', error);
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const generateReport = async () => {
    if (!selectedChild) return;

    try {
      setLoading(prev => ({ ...prev, report: true }));
      
      const response = await fetch(`${API_BASE_URL}/api/homework/reports/weekly/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentId: selectedChild.id,
          weekStart: selectedWeek
        })
      });

      if (response.ok) {
        toast.success('Report generated successfully!');
        await fetchWeeklyReport();
      } else {
        toast.error('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Error generating report');
    } finally {
      setLoading(prev => ({ ...prev, report: false }));
    }
  };

  // Prepare radar chart data for skills
  const getSkillsRadarData = () => {
    if (!skillProgress?.progressByCategory) return [];
    
    return Object.entries(skillProgress.progressByCategory).map(([category, data]) => {
      const avgProficiency = data.skills.length > 0 
        ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
        : 0;
      
      return {
        subject: data.title,
        proficiency: avgProficiency,
        fullMark: 5
      };
    });
  };

  // Prepare homework completion chart data
  const getHomeworkTrendData = () => {
    if (!weeklyReport?.homeworkData) return [];
    
    return weeklyReport.homeworkData.map((hw, index) => ({
      name: `HW ${index + 1}`,
      completed: hw.submitted_at ? 100 : 0,
      accuracy: hw.accuracy_score || 0,
      effort: hw.effort_score || 0
    }));
  };

  if (loading.children) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-3 text-lg">Loading children...</span>
      </div>
    );
  }

  return (
    <div className={`p-6 space-y-6 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <FaCalendarWeek className="text-3xl text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">Weekly Progress Report</h1>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Track your child's learning journey and academic growth
              </p>
            </div>
          </div>
          <button
            onClick={generateReport}
            disabled={loading.report}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {loading.report ? <FaSpinner className="animate-spin" /> : <FaDownload />}
            <span>Generate Report</span>
          </button>
        </div>

        {/* Child and Week Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Select Child
            </label>
            <select
              value={selectedChild?.id || ''}
              onChange={(e) => {
                const child = children.find(c => c.id.toString() === e.target.value);
                setSelectedChild(child);
              }}
              className={`w-full p-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            >
              <option value="">Choose a child</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>
                  {child.name} - {child.className}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Week Starting
            </label>
            <input
              type="date"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
              className={`w-full p-3 rounded-lg border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
            />
          </div>
        </div>
      </div>

      {selectedChild && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completion Rate</p>
                  <p className="text-2xl font-bold text-green-500">
                    {weeklyReport?.summary?.completionRate || 0}%
                  </p>
                </div>
                <FaTrophy className="text-green-500 text-xl" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Accuracy</p>
                  <p className="text-2xl font-bold text-blue-500">
                    {weeklyReport?.summary?.averageAccuracy || 0}%
                  </p>
                </div>
                <FaStar className="text-blue-500 text-xl" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Skills Practiced</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {weeklyReport?.skillsDevelopment?.totalSkillsPracticed || 0}
                  </p>
                </div>
                <FaBookOpen className="text-purple-500 text-xl" />
              </div>
            </div>

            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Spent</p>
                  <p className="text-2xl font-bold text-orange-500">
                    {weeklyReport?.summary?.totalTimeSpent || 0}m
                  </p>
                </div>
                <FaChartLine className="text-orange-500 text-xl" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills Radar Chart */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaGraduationCap className="mr-2 text-purple-500" />
                Skills Development
              </h3>
              {loading.skills ? (
                <div className="flex items-center justify-center h-64">
                  <FaSpinner className="animate-spin text-2xl text-purple-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={getSkillsRadarData()}>
                    <PolarGrid stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }} />
                    <PolarRadiusAxis 
                      angle={30} 
                      domain={[0, 5]} 
                      tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#6B7280' }}
                    />
                    <Radar
                      name="Proficiency"
                      dataKey="proficiency"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Homework Progress Chart */}
            <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <FaChartLine className="mr-2 text-blue-500" />
                Homework Progress
              </h3>
              {loading.report ? (
                <div className="flex items-center justify-center h-64">
                  <FaSpinner className="animate-spin text-2xl text-blue-500" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={getHomeworkTrendData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#E5E7EB'} />
                    <XAxis dataKey="name" stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                    <YAxis stroke={isDark ? '#9CA3AF' : '#6B7280'} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="completed" fill="#10B981" name="Completion %" />
                    <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Insights Section */}
          {weeklyReport?.insights && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strengths */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
                  <FaTrophy className="mr-2" />
                  Strengths
                </h3>
                <div className="space-y-2">
                  {weeklyReport.insights.strengths.length > 0 ? (
                    weeklyReport.insights.strengths.map((strength, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FaStar className="text-green-500 text-sm" />
                        <span className="text-sm">{strength}</span>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Keep working to identify strengths!
                    </p>
                  )}
                </div>
              </div>

              {/* Areas for Improvement */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center text-orange-600">
                  <FaChartLine className="mr-2" />
                  Growth Areas
                </h3>
                <div className="space-y-2">
                  {weeklyReport.insights.improvements.length > 0 ? (
                    weeklyReport.insights.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <FaBookOpen className="text-orange-500 text-sm" />
                        <span className="text-sm">{improvement}</span>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Great job! No specific areas need focus right now.
                    </p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-600">
                  <FaGraduationCap className="mr-2" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {weeklyReport.insights.recommendations.length > 0 ? (
                    weeklyReport.insights.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <FaChild className="text-blue-500 text-sm mt-1" />
                        <span className="text-sm">{rec}</span>
                      </div>
                    ))
                  ) : (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Keep up the excellent work!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {!selectedChild && !loading.children && (
        <div className={`text-center py-12 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg`}>
          <FaChild className="text-6xl text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Select a Child</h3>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Choose a child from the dropdown above to view their weekly progress report
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportDashboard; 