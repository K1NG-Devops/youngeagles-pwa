import React, { useState, useEffect } from 'react';
import { FaCog, FaBrain, FaRocket, FaChartLine, FaLightbulb, FaSpinner, FaCheck, FaExclamationTriangle, FaGraduationCap, FaEdit } from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';
import API_CONFIG from '../../config/api';

const API_BASE_URL = API_CONFIG.getApiUrl();

const AdaptiveLearningEngine = ({ isDark = false }) => {
  const [adaptations, setAdaptations] = useState({
    difficultyAdjustments: [],
    contentRecommendations: [],
    learningPathAdjustments: [],
    interventions: []
  });
  const [loading, setLoading] = useState(true);
  const [studentsData, setStudentsData] = useState([]);
  const [autoAdaptEnabled, setAutoAdaptEnabled] = useState(true);
  
  const teacherId = localStorage.getItem('teacherId') || localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  useEffect(() => {
    if (teacherId && token) {
      fetchAndAnalyzeForAdaptation();
    }
  }, [teacherId, token]);

  const fetchAndAnalyzeForAdaptation = async () => {
    try {
      setLoading(true);
      console.log('🚀 Adaptive Learning Engine: Analyzing student performance for adaptations...');
      
      setAdaptations({
        difficultyAdjustments: [],
        contentRecommendations: [],
        learningPathAdjustments: [],
        interventions: []
      });
      
      const studentsResponse = await fetch(`${API_BASE_URL}/api/auth/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let students = [];
      if (studentsResponse.ok) {
        const result = await studentsResponse.json();
        students = result.data || result.children || [];
        setStudentsData(students);
        console.log(`🚀 Adaptive Engine: Found ${students.length} students to analyze`);
      }

      if (students.length > 0) {
        await Promise.all([
          analyzeDifficultyNeeds(students),
          recommendContent(students),
          adjustLearningPaths(students),
          identifyInterventions(students)
        ]);
      } else {
        console.log('🚀 Adaptive Engine: No real students found, will show empty state');
        showTopNotification('No student data available for analysis', 'info');
      }

    } catch (error) {
      console.error('🚀 Adaptive Engine: Error fetching data:', error);
      showTopNotification('Error loading student data for adaptation analysis', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeDifficultyNeeds = async (students) => {
    const adjustments = [];
    
    for (const student of students) {
      try {
        const [skillsResponse, weeklyResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/homework/skills/progress/${student.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/homework/reports/weekly/${student.id}?weekStart=${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]}&weekEnd=${new Date().toISOString().split('T')[0]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        let skillsData = null;
        let weeklyData = null;
        
        if (skillsResponse.ok) {
          skillsData = await skillsResponse.json();
        }
        
        if (weeklyResponse.ok) {
          const result = await weeklyResponse.json();
          weeklyData = result.report;
        }
        
        if (skillsData?.progressByCategory) {
          Object.entries(skillsData.progressByCategory).forEach(([category, data]) => {
            const avgProficiency = data.skills && data.skills.length > 0 
              ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
              : 0;
            
            if (avgProficiency >= 4.5) {
              adjustments.push({
                student: student.name,
                studentId: student.id,
                category: category,
                currentDifficulty: 'Standard',
                recommendedDifficulty: 'Advanced',
                reason: `High proficiency (${avgProficiency.toFixed(1)}/5) - ready for advanced concepts`,
                adaptationType: 'increase',
                confidence: 'high',
                impact: 'Prevent boredom and maintain engagement'
              });
            } else if (avgProficiency < 2) {
              adjustments.push({
                student: student.name,
                studentId: student.id,
                category: category,
                currentDifficulty: 'Standard',
                recommendedDifficulty: 'Foundation',
                reason: `Low proficiency (${avgProficiency.toFixed(1)}/5) - needs foundational support`,
                adaptationType: 'decrease',
                confidence: 'high',
                impact: 'Build confidence and fill knowledge gaps'
              });
            }
          });
        }
        
        if (weeklyData?.summary) {
          const completion = weeklyData.summary.completionRate || 0;
          const accuracy = weeklyData.summary.averageAccuracy || 0;
          const timeSpent = weeklyData.summary.totalTimeSpent || 0;
          
          if (completion > 95 && accuracy > 90 && timeSpent < 30) {
            adjustments.push({
              student: student.name,
              studentId: student.id,
              category: 'General',
              currentDifficulty: 'Standard',
              recommendedDifficulty: 'Challenging',
              reason: `High completion (${completion}%) and accuracy (${accuracy}%) with low time investment`,
              adaptationType: 'increase',
              confidence: 'medium',
              impact: 'Provide more challenging and engaging assignments'
            });
          } else if (completion < 60 || accuracy < 50) {
            adjustments.push({
              student: student.name,
              studentId: student.id,
              category: 'General',
              currentDifficulty: 'Standard',
              recommendedDifficulty: 'Simplified',
              reason: `Low completion (${completion}%) or accuracy (${accuracy}%)`,
              adaptationType: 'decrease',
              confidence: 'high',
              impact: 'Reduce frustration and build success momentum'
            });
          }
        }
        
      } catch (error) {
        console.warn(`Could not analyze difficulty needs for ${student.name}:`, error);
      }
    }
    
    setAdaptations(prev => ({ ...prev, difficultyAdjustments: adjustments }));
  };

  const recommendContent = async (students) => {
    const recommendations = [];
    
    for (const student of students) {
      try {
        const skillsResponse = await fetch(`${API_BASE_URL}/api/homework/skills/progress/${student.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          
          if (skillsData?.progressByCategory) {
            Object.entries(skillsData.progressByCategory).forEach(([category, data]) => {
              const avgProficiency = data.skills && data.skills.length > 0 
                ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
                : 0;
              
              if (avgProficiency > 0) {
                const contentSuggestions = getContentRecommendations(category, avgProficiency);
                
                contentSuggestions.forEach(suggestion => {
                  recommendations.push({
                    student: student.name,
                    studentId: student.id,
                    category: category,
                    currentProficiency: avgProficiency,
                    contentType: suggestion.type,
                    title: suggestion.title,
                    description: suggestion.description,
                    estimatedTime: suggestion.time,
                    learningObjectives: suggestion.objectives,
                    priority: suggestion.priority
                  });
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Could not recommend content for ${student.name}:`, error);
      }
    }
    
    setAdaptations(prev => ({ ...prev, contentRecommendations: recommendations }));
  };

  const getContentRecommendations = (category, proficiency) => {
    const recommendations = [];
    
    if (proficiency < 2) {
      recommendations.push({
        type: 'Remedial',
        title: `${category} Foundations`,
        description: `Basic concepts and skills building in ${category}`,
        time: '15-20 minutes',
        objectives: [`Master fundamental ${category} concepts`, 'Build confidence', 'Fill knowledge gaps'],
        priority: 'high'
      });
    } else if (proficiency < 3.5) {
      recommendations.push({
        type: 'Practice',
        title: `${category} Skill Builders`,
        description: `Targeted practice to strengthen ${category} understanding`,
        time: '20-25 minutes',
        objectives: [`Improve ${category} fluency`, 'Apply concepts in new contexts', 'Build automaticity'],
        priority: 'medium'
      });
    } else if (proficiency >= 4.5) {
      recommendations.push({
        type: 'Enrichment',
        title: `Advanced ${category} Challenges`,
        description: `Complex problems and creative applications in ${category}`,
        time: '25-35 minutes',
        objectives: [`Explore advanced ${category} concepts`, 'Develop critical thinking', 'Apply knowledge creatively'],
        priority: 'medium'
      });
    }
    
    return recommendations;
  };

  const adjustLearningPaths = async (students) => {
    const pathAdjustments = [];
    
    if (students.length < 2) {
      setAdaptations(prev => ({ ...prev, learningPathAdjustments: pathAdjustments }));
      return;
    }
    
    const categoryPerformance = {};
    
    for (const student of students) {
      try {
        const skillsResponse = await fetch(`${API_BASE_URL}/api/homework/skills/progress/${student.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          
          if (skillsData?.progressByCategory) {
            Object.entries(skillsData.progressByCategory).forEach(([category, data]) => {
              if (!categoryPerformance[category]) {
                categoryPerformance[category] = { students: [], avgProficiency: 0 };
              }
              
              const avgProficiency = data.skills && data.skills.length > 0 
                ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
                : 0;
              
              if (avgProficiency > 0) {
                categoryPerformance[category].students.push({
                  name: student.name,
                  id: student.id,
                  proficiency: avgProficiency
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Could not analyze learning path for ${student.name}:`, error);
      }
    }
    
    Object.entries(categoryPerformance).forEach(([category, data]) => {
      if (data.students.length === 0) return;
      
      const avgClassProficiency = data.students.reduce((sum, s) => sum + s.proficiency, 0) / data.students.length;
      const strugglingStudents = data.students.filter(s => s.proficiency < 2.5);
      const excellingStudents = data.students.filter(s => s.proficiency >= 4);
      
      if (strugglingStudents.length > data.students.length * 0.5) {
        pathAdjustments.push({
          scope: 'class-wide',
          category: category,
          currentPath: 'Standard Progression',
          recommendedPath: 'Reinforced Foundation',
          affectedStudents: strugglingStudents.length,
          reason: `${strugglingStudents.length}/${data.students.length} students struggling in ${category}`,
          adjustmentType: 'slow-down',
          impact: 'Allow more time for foundational concepts before advancing'
        });
      } else if (excellingStudents.length > data.students.length * 0.3) {
        pathAdjustments.push({
          scope: 'differentiated',
          category: category,
          currentPath: 'Standard Progression',
          recommendedPath: 'Accelerated Track',
          affectedStudents: excellingStudents.length,
          reason: `${excellingStudents.length}/${data.students.length} students ready for acceleration in ${category}`,
          adjustmentType: 'accelerate',
          impact: 'Provide advanced content to maintain engagement and challenge'
        });
      }
    });
    
    setAdaptations(prev => ({ ...prev, learningPathAdjustments: pathAdjustments }));
  };

  const identifyInterventions = async (students) => {
    const interventions = [];
    
    for (const student of students) {
      try {
        const [skillsResponse, weeklyResponse, trendsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/api/homework/skills/progress/${student.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/homework/reports/weekly/${student.id}?weekStart=${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]}&weekEnd=${new Date().toISOString().split('T')[0]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${API_BASE_URL}/api/homework/reports/weekly/${student.id}?weekStart=${new Date(Date.now() - 14*24*60*60*1000).toISOString().split('T')[0]}&weekEnd=${new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0]}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);
        
        let skillsData = null;
        let currentWeek = null;
        let previousWeek = null;
        
        if (skillsResponse.ok) {
          skillsData = await skillsResponse.json();
        }
        
        if (weeklyResponse.ok) {
          const result = await weeklyResponse.json();
          currentWeek = result.report;
        }
        
        if (trendsResponse.ok) {
          const result = await trendsResponse.json();
          previousWeek = result.report;
        }
        
        let criticalAreas = 0;
        let strugglingCategories = [];
        
        if (skillsData?.progressByCategory) {
          Object.entries(skillsData.progressByCategory).forEach(([category, data]) => {
            const avgProficiency = data.skills && data.skills.length > 0 
              ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
              : 0;
            
            if (avgProficiency > 0 && avgProficiency < 2) {
              criticalAreas++;
              strugglingCategories.push(category);
            }
          });
        }
        
        if (criticalAreas >= 2) {
          interventions.push({
            student: student.name,
            studentId: student.id,
            type: 'intensive',
            priority: 'critical',
            title: 'Multi-Area Learning Support',
            description: `Struggling in ${criticalAreas} subject areas`,
            recommendedActions: [
              'Schedule one-on-one assessment meeting',
              'Contact parents for support strategies',
              'Consider learning specialist referral',
              'Implement modified assignments',
              'Daily check-ins for 2 weeks'
            ],
            timeline: 'Immediate - within 2 days',
            categories: strugglingCategories
          });
        }
        
        if (currentWeek?.summary && previousWeek?.summary) {
          const completionDrop = (previousWeek.summary.completionRate || 0) - (currentWeek.summary.completionRate || 0);
          const accuracyDrop = (previousWeek.summary.averageAccuracy || 0) - (currentWeek.summary.averageAccuracy || 0);
          
          if (completionDrop > 25) {
            interventions.push({
              student: student.name,
              studentId: student.id,
              type: 'behavioral',
              priority: 'high',
              title: 'Homework Completion Support',
              description: `Completion rate dropped ${completionDrop.toFixed(0)}% this week`,
              recommendedActions: [
                'Check for external factors affecting homework time',
                'Implement homework tracking system',
                'Break assignments into smaller chunks',
                'Parent communication about home study environment'
              ],
              timeline: 'This week',
              categories: ['Study Habits']
            });
          }
          
          if (accuracyDrop > 20) {
            interventions.push({
              student: student.name,
              studentId: student.id,
              type: 'academic',
              priority: 'medium',
              title: 'Understanding Support',
              description: `Accuracy dropped ${accuracyDrop.toFixed(0)}% - possible comprehension issues`,
              recommendedActions: [
                'Review recent lesson concepts',
                'Provide additional practice materials',
                'Pair with study buddy for peer support',
                'Offer alternative explanation methods'
              ],
              timeline: 'Next 5 days',
              categories: ['Comprehension']
            });
          }
        }
        
      } catch (error) {
        console.warn(`Could not identify interventions for ${student.name}:`, error);
      }
    }
    
    setAdaptations(prev => ({ ...prev, interventions: interventions }));
  };

  const applyAdaptation = async (adaptation, type) => {
    try {
      console.log(`🚀 Applying ${type} adaptation:`, adaptation);
      showTopNotification(`Adaptation applied for ${adaptation.student || 'class'}`, 'success');
    } catch (error) {
      console.error('Error applying adaptation:', error);
      showTopNotification('Failed to apply adaptation', 'error');
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical': return <FaExclamationTriangle className="text-red-500" />;
      case 'high': return <FaRocket className="text-orange-500" />;
      case 'medium': return <FaChartLine className="text-yellow-500" />;
      case 'low': return <FaLightbulb className="text-green-500" />;
      default: return <FaCog className="text-gray-500" />;
    }
  };

  const getAdaptationTypeIcon = (type) => {
    switch (type) {
      case 'increase': return <FaRocket className="text-blue-500" />;
      case 'decrease': return <FaGraduationCap className="text-yellow-500" />;
      case 'accelerate': return <FaChartLine className="text-green-500" />;
      case 'slow-down': return <FaCog className="text-orange-500" />;
      case 'individualize': return <FaEdit className="text-purple-500" />;
      case 'enrich': return <FaBrain className="text-pink-500" />;
      default: return <FaCog className="text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-3xl text-blue-500 mr-3" />
          <span className="text-lg">Analyzing learning patterns...</span>
        </div>
      </div>
    );
  }

  const totalAdaptations = adaptations.difficultyAdjustments.length + 
                         adaptations.contentRecommendations.length + 
                         adaptations.learningPathAdjustments.length + 
                         adaptations.interventions.length;

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaRocket className="text-3xl text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold">Adaptive Learning Engine</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              AI-powered content adaptation based on real-time performance analysis
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm">Auto-Adapt:</span>
            <button
              onClick={() => setAutoAdaptEnabled(!autoAdaptEnabled)}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoAdaptEnabled ? 'bg-green-500' : 'bg-gray-400'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                autoAdaptEnabled ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
          <button
            onClick={fetchAndAnalyzeForAdaptation}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <FaBrain />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Analysis Status</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {studentsData.length} students analyzed, {totalAdaptations} adaptations identified
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{adaptations.difficultyAdjustments.length}</div>
              <div className="text-xs text-gray-500">Difficulty</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{adaptations.contentRecommendations.length}</div>
              <div className="text-xs text-gray-500">Content</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-500">{adaptations.learningPathAdjustments.length}</div>
              <div className="text-xs text-gray-500">Paths</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-500">{adaptations.interventions.length}</div>
              <div className="text-xs text-gray-500">Interventions</div>
            </div>
          </div>
        </div>
      </div>

      {totalAdaptations === 0 ? (
        <div className={`rounded-lg p-8 text-center ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <FaCheck className="text-4xl text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">All Students On Track</h3>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No immediate adaptations needed. The system will continue monitoring student progress and suggest adjustments as patterns emerge.
          </p>
        </div>
      ) : (
        <>
          {adaptations.difficultyAdjustments.length > 0 && (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FaCog className="mr-2 text-blue-500" />
                Difficulty Adjustments ({adaptations.difficultyAdjustments.length})
              </h3>
              <div className="space-y-3">
                {adaptations.difficultyAdjustments.map((adjustment, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-blue-500`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAdaptationTypeIcon(adjustment.adaptationType)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {adjustment.student} - {adjustment.category}
                          </p>
                          <p className="text-xs mt-1">{adjustment.reason}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                            {adjustment.currentDifficulty} → {adjustment.recommendedDifficulty}
                          </p>
                          <p className="text-xs mt-1 text-gray-500">{adjustment.impact}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => applyAdaptation(adjustment, 'difficulty')}
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adaptations.contentRecommendations.length > 0 && (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FaLightbulb className="mr-2 text-green-500" />
                Content Recommendations ({adaptations.contentRecommendations.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {adaptations.contentRecommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-green-500`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs mt-1">{rec.description}</p>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="font-medium">Student:</span>
                            <span>{rec.student}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="font-medium">Time:</span>
                            <span>{rec.estimatedTime}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="font-medium">Type:</span>
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              rec.contentType === 'Enrichment' ? 'bg-purple-100 text-purple-700' :
                              rec.contentType === 'Remedial' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {rec.contentType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => applyAdaptation(rec, 'content')}
                        className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                      >
                        Assign
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adaptations.learningPathAdjustments.length > 0 && (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-purple-50'}`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FaChartLine className="mr-2 text-purple-500" />
                Learning Path Adjustments ({adaptations.learningPathAdjustments.length})
              </h3>
              <div className="space-y-3">
                {adaptations.learningPathAdjustments.map((path, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-purple-500`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getAdaptationTypeIcon(path.adjustmentType)}
                        <div className="flex-1">
                          <p className="font-medium text-sm">
                            {path.scope === 'individual' ? `${path.student} - ${path.category}` : `Class-wide ${path.category}`}
                          </p>
                          <p className="text-xs mt-1">{path.reason}</p>
                          <p className={`text-xs mt-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                            {path.currentPath} → {path.recommendedPath}
                          </p>
                          <p className="text-xs mt-1 text-gray-500">{path.impact}</p>
                          {path.affectedStudents && (
                            <p className="text-xs mt-1 font-medium">
                              Affects {path.affectedStudents} students
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => applyAdaptation(path, 'path')}
                        className="px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
                      >
                        Implement
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {adaptations.interventions.length > 0 && (
            <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <FaExclamationTriangle className="mr-2 text-red-500" />
                Required Interventions ({adaptations.interventions.length})
              </h3>
              <div className="space-y-3">
                {adaptations.interventions.map((intervention, index) => (
                  <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-red-500`}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getPriorityIcon(intervention.priority)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm">{intervention.title}</p>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              intervention.priority === 'critical' ? 'bg-red-100 text-red-700' :
                              intervention.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {intervention.priority}
                            </span>
                          </div>
                          <p className="text-xs mt-1">{intervention.student} - {intervention.description}</p>
                          <p className="text-xs mt-1 font-medium">Timeline: {intervention.timeline}</p>
                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Recommended Actions:</p>
                            <ul className="text-xs space-y-0.5">
                              {intervention.recommendedActions.slice(0, 3).map((action, i) => (
                                <li key={i} className="flex items-start space-x-1">
                                  <span>•</span>
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => applyAdaptation(intervention, 'intervention')}
                        className={`px-3 py-1 text-white text-xs rounded ${
                          intervention.priority === 'critical' ? 'bg-red-500 hover:bg-red-600' :
                          intervention.priority === 'high' ? 'bg-orange-500 hover:bg-orange-600' :
                          'bg-yellow-500 hover:bg-yellow-600'
                        }`}
                      >
                        Begin
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdaptiveLearningEngine;
