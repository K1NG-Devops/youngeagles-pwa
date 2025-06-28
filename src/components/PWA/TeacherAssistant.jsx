import React, { useState, useEffect } from 'react';
import { FaRobot, FaExclamationTriangle, FaBullseye, FaLightbulb, FaUsers, FaChild, FaChartLine, FaTrophy, FaSpinner, FaEye, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { mean, deviation, quantile } from 'd3-array';
import { showTopNotification } from '../TopNotificationManager';
import API_CONFIG from '../../config/api';

const API_BASE_URL = API_CONFIG.getApiUrl();

const TeacherAssistant = ({ isDark = false }) => {
  const [insights, setInsights] = useState({
    classWideAlerts: [],
    individualAlerts: [],
    recommendations: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  const [skillsAnalysis, setSkillsAnalysis] = useState(null);

  const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  useEffect(() => {
    if (teacherId && token) {
      fetchAndAnalyzeData();
    }
  }, [teacherId, token]);

  const fetchAndAnalyzeData = async () => {
    try {
      setLoading(true);
      
      const studentsResponse = await fetch(`${API_BASE_URL}/children/teacher/${teacherId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let students = [];
      if (studentsResponse.ok) {
        const result = await studentsResponse.json();
        students = result.children || [];
        setStudentsData(students);
      }

      if (students.length > 0) {
        await Promise.all([
          analyzeSkillsData(students),
          analyzeHomeworkData(students),
          analyzeProgressTrends(students)
        ]);
      } else {
        showTopNotification('No student data available for analysis', 'info');
      }

    } catch (error) {
      console.error('Error fetching teacher data:', error);
      showTopNotification('Error loading student data for analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeSkillsData = async (students) => {
    const skillsPromises = students.map(student => 
      fetch(`${API_BASE_URL}/api/homework/skills/progress/${student.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }).then(res => res.ok ? res.json() : null)
    );

    const skillsResults = await Promise.all(skillsPromises);
    const validSkillsData = skillsResults.filter(data => data && data.progressByCategory);

    if (validSkillsData.length > 0) {
      analyzeClassWideSkills(validSkillsData, students);
    }
  };

  const analyzeHomeworkData = async (students) => {
    const homeworkPromises = students.map(student => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);
      const weekEnd = new Date();
      
      return fetch(
        `${API_BASE_URL}/api/homework/reports/weekly/${student.id}?weekStart=${weekStart.toISOString().split('T')[0]}&weekEnd=${weekEnd.toISOString().split('T')[0]}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      ).then(res => res.ok ? res.json() : null);
    });

    const homeworkResults = await Promise.all(homeworkPromises);
    const validHomeworkData = homeworkResults.filter(data => data && data.report);

    if (validHomeworkData.length > 0) {
      analyzeHomeworkTrends(validHomeworkData, students);
    }
  };

  const analyzeProgressTrends = async (students) => {
    console.log('🧠 AI Assistant: Analyzing progress trends for', students.length, 'students');
    const progressAlerts = [];
    const recommendations = [];
    
    const weeklyComparisons = await Promise.all(
      students.map(async (student) => {
        try {
          const currentWeekStart = new Date();
          currentWeekStart.setDate(currentWeekStart.getDate() - 7);
          const currentWeekEnd = new Date();
          
          const prevWeekStart = new Date();
          prevWeekStart.setDate(prevWeekStart.getDate() - 14);
          const prevWeekEnd = new Date();
          prevWeekEnd.setDate(prevWeekEnd.getDate() - 7);
          
          const [currentWeek, previousWeek] = await Promise.all([
            fetch(`${API_BASE_URL}/api/homework/reports/weekly/${student.id}?weekStart=${currentWeekStart.toISOString().split('T')[0]}&weekEnd=${currentWeekEnd.toISOString().split('T')[0]}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null),
            
            fetch(`${API_BASE_URL}/api/homework/reports/weekly/${student.id}?weekStart=${prevWeekStart.toISOString().split('T')[0]}&weekEnd=${prevWeekEnd.toISOString().split('T')[0]}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            }).then(res => res.ok ? res.json() : null)
          ]);
          
          return { student, currentWeek: currentWeek?.report, previousWeek: previousWeek?.report };
        } catch (error) {
          console.warn(`Could not fetch trend data for ${student.name}:`, error);
          return { student, currentWeek: null, previousWeek: null };
        }
      })
    );
    
    // Advanced Pattern Detection
    weeklyComparisons.forEach(({ student, currentWeek, previousWeek }) => {
      if (!currentWeek || !previousWeek || !currentWeek.summary || !previousWeek.summary) return;
      
      const completionRates = weeklyComparisons.map(w => w.currentWeek?.summary?.completionRate).filter(Boolean);
      const accuracyRates = weeklyComparisons.map(w => w.currentWeek?.summary?.averageAccuracy).filter(Boolean);

      const completionDeviation = deviation(completionRates);
      const accuracyDeviation = deviation(accuracyRates);
      const meanCompletion = mean(completionRates);
      
      // Pattern 1: Completion Rate Drop (now uses standard deviation)
      const currentRate = currentWeek.summary.completionRate || 0;
      const previousRate = previousWeek.summary.completionRate || 0;
      const drop = previousRate - currentRate;
        
      if (drop > completionDeviation * 1.5) {
        progressAlerts.push({
          type: 'individual',
          priority: 'high',
          student: student.name,
          message: `${student.name}'s completion rate dropped significantly by ${drop.toFixed(0)}%`,
          action: 'Schedule immediate check-in - this drop is unusually high for your class'
        });
      } else if (drop > completionDeviation) {
        progressAlerts.push({
          type: 'individual',
          priority: 'medium',
          student: student.name,
          message: `${student.name}'s completion rate decreased more than average`,
          action: 'Monitor closely and consider offering additional support'
        });
      }
      
      // Pattern 2: Accuracy Trends (now uses standard deviation)
      const currentAccuracy = currentWeek.summary.averageAccuracy || 0;
      const previousAccuracy = previousWeek.summary.averageAccuracy || 0;
      const accuracyDrop = previousAccuracy - currentAccuracy;
        
      if (accuracyDrop > accuracyDeviation * 1.2) {
        progressAlerts.push({
          type: 'individual',
          priority: 'medium',
          student: student.name,
          message: `${student.name}'s accuracy declined more than average (${accuracyDrop.toFixed(0)}% drop)`,
          action: 'Review recent homework submissions for specific areas of confusion'
        });
      }
      
      // Pattern 3: Time Spent Analysis
      if (currentWeek?.summary && previousWeek?.summary) {
        const currentTime = currentWeek.summary.totalTimeSpent || 0;
        const previousTime = previousWeek.summary.totalTimeSpent || 0;
        
        if (currentTime < previousTime * 0.5 && currentTime > 0) {
          progressAlerts.push({
            type: 'individual',
            priority: 'low',
            student: student.name,
            message: `${student.name} is spending much less time on homework (${currentTime}min vs ${previousTime}min)`,
            action: 'Check if assignments are too easy or if student needs engagement strategies'
          });
        } else if (currentTime > previousTime * 2 && previousTime > 0) {
          progressAlerts.push({
            type: 'individual',
            priority: 'medium',
            student: student.name,
            message: `${student.name} is taking much longer than usual (${currentTime}min vs ${previousTime}min)`,
            action: 'Assignments may be too difficult - consider differentiated instruction'
          });
        }
      }
      
      // Pattern 4: Positive Trends (Achievements)
      if (currentWeek?.summary && previousWeek?.summary) {
        const currentRate = currentWeek.summary.completionRate || 0;
        const previousRate = previousWeek.summary.completionRate || 0;
        const improvement = currentRate - previousRate;
        
        if (improvement > 15) {
          setInsights(prev => ({
            ...prev,
            achievements: [...prev.achievements, {
              type: 'individual',
              student: student.name,
              message: `${student.name} has improved completion rate by ${improvement.toFixed(0)}% this week!`,
              action: 'Celebrate this progress and share positive feedback with parents'
            }]
          }));
        }
      }
    });
    
    // Class-wide Pattern Detection
    const completionRates = weeklyComparisons
      .filter(w => w.currentWeek?.summary)
      .map(w => w.currentWeek.summary.completionRate || 0);
      
    if (completionRates.length > 0) {
      const avgCompletion = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;
      const lowPerformers = completionRates.filter(rate => rate < 60).length;
      const lowPerformerPercentage = (lowPerformers / completionRates.length) * 100;
      
      if (lowPerformerPercentage > 30) {
        recommendations.push({
          type: 'teaching',
          category: 'engagement',
          message: `${lowPerformerPercentage.toFixed(0)}% of students have low completion rates`,
          action: 'Consider redesigning assignments for better engagement or breaking them into smaller tasks'
        });
      }
    }
    
    console.log(`🧠 AI Assistant: Generated ${progressAlerts.length} progress alerts and ${recommendations.length} recommendations`);
    
    setInsights(prev => ({
      ...prev,
      individualAlerts: [...prev.individualAlerts, ...progressAlerts],
      recommendations: [...prev.recommendations, ...recommendations]
    }));
  };

  const analyzeClassWideSkills = (skillsData, students) => {
    console.log('🧠 AI Assistant: Analyzing class-wide skills from', skillsData.length, 'student reports');
    const classAlerts = [];
    const recommendations = [];
    const achievements = [];
    
    const categoryPerformance = {};

    skillsData.forEach((data, index) => {
      const studentName = students[index].name;
      if (data.progressByCategory) {
        Object.entries(data.progressByCategory).forEach(([category, catData]) => {
          if (!categoryPerformance[category]) {
            categoryPerformance[category] = { proficiencies: [], skills: {} };
          }

          if (catData.skills) {
            catData.skills.forEach(skill => {
              if (!categoryPerformance[category].skills[skill.name]) {
                categoryPerformance[category].skills[skill.name] = [];
              }
              categoryPerformance[category].skills[skill.name].push(skill.proficiency_level);
              categoryPerformance[category].proficiencies.push(skill.proficiency_level);
            });
          }
        });
      }
    });

    Object.entries(categoryPerformance).forEach(([category, data]) => {
      if (data.proficiencies.length < students.length / 2) return; // Only analyze if we have data for at least half the class

      const meanProficiency = mean(data.proficiencies);
      const lowerQuartile = quantile(data.proficiencies.sort(), 0.25);

      if (meanProficiency < 2.5) {
        classAlerts.push({
          type: 'classwide',
          priority: 'high',
          category,
          message: `The class average for ${category} is low (${meanProficiency.toFixed(1)}/5).`,
          action: `Plan a group lesson to review fundamental ${category} concepts.`
        });
      }

      const strugglingStudentsCount = data.proficiencies.filter(p => p <= lowerQuartile).length;

      if (strugglingStudentsCount > students.length * 0.25 && lowerQuartile < 2) {
         classAlerts.push({
          type: 'classwide',
          priority: 'medium',
          category,
          message: `${strugglingStudentsCount} students are in the bottom 25% for ${category}.`,
          action: `Form a small group with these students for targeted ${category} practice.`
        });
      }

      // Detect excellence
      if (meanProficiency > 4.2) {
         achievements.push({
          type: 'classwide',
          category,
          message: `Outstanding performance in ${category}! The class average is ${meanProficiency.toFixed(1)}/5.`,
          action: 'Introduce advanced topics or a project-based activity for this subject.'
        });
      }
      
      // Detect polarization
      const standardDev = deviation(data.proficiencies);
      if (standardDev > 1.8) {
        recommendations.push({
          type: 'teaching',
          category,
          message: `Performance in ${category} is highly varied.`,
          action: 'Consider using differentiated instruction with multiple activity levels.'
        });
      }
    });
    
    // Skill-specific analysis
    Object.entries(categoryPerformance).forEach(([category, data]) => {
      Object.entries(data.skills).forEach(([skill, proficiencies]) => {
        const meanProficiency = mean(proficiencies);
        const lowerQuartile = quantile(proficiencies.sort(), 0.25);

        if (meanProficiency < 2.5) {
          classAlerts.push({
            type: 'classwide',
            priority: 'medium',
            category,
            message: `The class average for ${skill} in ${category} is low (${meanProficiency.toFixed(1)}/5).`,
            action: `Consider a hands-on counting activity using physical objects`
          });
        }
      });
    });

    console.log(`🧠 AI Assistant: Generated ${classAlerts.length} skill alerts, ${recommendations.length} recommendations, ${achievements.length} achievements`);

    setInsights(prev => ({
      ...prev,
      classWideAlerts: [...prev.classWideAlerts, ...classAlerts],
      recommendations: [...prev.recommendations, ...recommendations],
      achievements: [...prev.achievements, ...achievements]
    }));
  };

  const analyzeHomeworkTrends = (homeworkData, students) => {
    console.log('🧠 AI Assistant: Analyzing homework trends from', homeworkData.length, 'student reports');
    const completionRates = homeworkData.map(hw => hw.report?.summary?.completionRate || 0);
    const avgCompletion = completionRates.reduce((sum, rate) => sum + rate, 0) / completionRates.length;

    if (avgCompletion < 70) {
      setInsights(prev => ({
        ...prev,
        classWideAlerts: [...prev.classWideAlerts, {
          type: 'classwide',
          priority: 'medium',
          category: 'homework',
          message: `Class homework completion rate is ${avgCompletion.toFixed(0)}%`,
          action: 'Consider adjusting homework difficulty or providing additional support'
        }]
      }));
    } else if (avgCompletion > 90) {
      setInsights(prev => ({
        ...prev,
        achievements: [...prev.achievements, {
          type: 'classwide',
          category: 'homework',
          message: `Outstanding homework completion rate: ${avgCompletion.toFixed(0)}%!`,
          action: 'Keep up the excellent work and consider more challenging assignments'
        }]
      }));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-orange-500';
      case 'low': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return <FaExclamationTriangle className="text-red-500" />;
      case 'medium': return <FaEye className="text-orange-500" />;
      case 'low': return <FaLightbulb className="text-yellow-500" />;
      default: return <FaBullseye className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
          <span className="text-lg">Analyzing class data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaRobot className="text-3xl text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">AI Teaching Assistant</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Intelligent insights to help you teach more effectively
            </p>
          </div>
        </div>
        <button
          onClick={fetchAndAnalyzeData}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <FaChartLine />
          <span>Refresh Insights</span>
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-red-50'} border-l-4 border-red-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600">High Priority</p>
              <p className="text-2xl font-bold text-red-500">
                {insights.classWideAlerts.filter(a => a.priority === 'high').length}
              </p>
            </div>
            <FaExclamationTriangle className="text-red-500 text-xl" />
          </div>
        </div>

        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-orange-50'} border-l-4 border-orange-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Watch List</p>
              <p className="text-2xl font-bold text-orange-500">
                {insights.individualAlerts.length}
              </p>
            </div>
            <FaChild className="text-orange-500 text-xl" />
          </div>
        </div>

        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border-l-4 border-blue-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Recommendations</p>
              <p className="text-2xl font-bold text-blue-500">
                {insights.recommendations.length}
              </p>
            </div>
            <FaLightbulb className="text-blue-500 text-xl" />
          </div>
        </div>

        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-green-50'} border-l-4 border-green-500`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Achievements</p>
              <p className="text-2xl font-bold text-green-500">
                {insights.achievements.length}
              </p>
            </div>
            <FaTrophy className="text-green-500 text-xl" />
          </div>
        </div>
      </div>

      {/* Insights Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class-wide Alerts */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaUsers className="mr-2 text-red-500" />
            Class-wide Alerts
          </h3>
          <div className="space-y-3">
            {insights.classWideAlerts.length > 0 ? (
              insights.classWideAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-red-500`}>
                  <div className="flex items-start space-x-2">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {alert.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No class-wide issues detected. Great work!
              </p>
            )}
          </div>
        </div>

        {/* Individual Student Alerts */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaChild className="mr-2 text-orange-500" />
            Individual Student Alerts
          </h3>
          <div className="space-y-3">
            {insights.individualAlerts.length > 0 ? (
              insights.individualAlerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-orange-500`}>
                  <div className="flex items-start space-x-2">
                    {getPriorityIcon(alert.priority)}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{alert.message}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {alert.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                All students are progressing well!
              </p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaLightbulb className="mr-2 text-blue-500" />
            Teaching Recommendations
          </h3>
          <div className="space-y-3">
            {insights.recommendations.length > 0 ? (
              insights.recommendations.map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-blue-500`}>
                  <div className="flex items-start space-x-2">
                    <FaLightbulb className="text-blue-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{rec.message}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {rec.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No specific recommendations at this time.
              </p>
            )}
          </div>
        </div>

        {/* Achievements */}
        <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <FaTrophy className="mr-2 text-green-500" />
            Achievements & Successes
          </h3>
          <div className="space-y-3">
            {insights.achievements.length > 0 ? (
              insights.achievements.map((achievement, index) => (
                <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-green-500`}>
                  <div className="flex items-start space-x-2">
                    <FaTrophy className="text-green-500 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{achievement.message}</p>
                      <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        💡 {achievement.action}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Keep up the great work! Achievements will appear here.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAssistant; 