import React, { useState, useEffect } from 'react';
import { FaHeart, FaHome, FaStar, FaBookOpen, FaBrain, FaSpinner, FaChild, FaGraduationCap, FaLightbulb, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';
import API_CONFIG from '../../config/api';

const API_BASE_URL = API_CONFIG.getApiUrl();

const ParentAssistant = ({ isDark = false }) => {
  const [insights, setInsights] = useState({
    childProgress: [],
    atHomeActivities: [],
    developmentalMilestones: [],
    parentTips: [],
    celebrationMoments: []
  });
  const [loading, setLoading] = useState(true);
  const [childData, setChildData] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);

  const parentId = localStorage.getItem('parentId') || localStorage.getItem('userId');
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');

  useEffect(() => {
    if (parentId && token) {
      fetchAndAnalyzeParentData();
    }
  }, [parentId, token]);

  const fetchAndAnalyzeParentData = async () => {
    try {
      setLoading(true);
      
      setInsights({
        childProgress: [],
        atHomeActivities: [],
        developmentalMilestones: [],
        parentTips: [],
        celebrationMoments: []
      });
      
      const childrenResponse = await fetch(`${API_BASE_URL}/api/parent/children`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let children = [];
      if (childrenResponse.ok) {
        const result = await childrenResponse.json();
        children = result.data || result.children || [];
        setChildData(children);
        
        if (children.length > 0 && !selectedChild) {
          setSelectedChild(children[0]);
        }
      }

      if (children.length > 0) {
        await Promise.all([
          analyzeChildProgress(children),
          generateAtHomeActivities(children),
          assessDevelopmentalMilestones(children),
          generateParentTips(children)
        ]);
      } else {
        showTopNotification('No children data available for family insights', 'info');
      }

    } catch (error) {
      console.error('Error fetching parent data:', error);
      showTopNotification('Error loading children data for insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  const analyzeChildProgress = async (children) => {
    const progressInsights = [];
    
    for (const child of children) {
      try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weekEnd = new Date();
        
        const weeklyResponse = await fetch(
          `${API_BASE_URL}/api/student/${child.id}/weekly-report?weekStart=${weekStart.toISOString().split('T')[0]}&weekEnd=${weekEnd.toISOString().split('T')[0]}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const skillsResponse = await fetch(
          `${API_BASE_URL}/api/student/${child.id}/skills-progress`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        let weeklyData = null;
        let skillsData = null;
        
        if (weeklyResponse.ok) weeklyData = await weeklyResponse.json();
        if (skillsResponse.ok) skillsData = await skillsResponse.json();
        
        if (weeklyData?.summary) {
          const { completionRate = 0, averageAccuracy = 0 } = weeklyData.summary;
          
          if (completionRate >= 90 && averageAccuracy >= 85) {
            progressInsights.push({
              type: 'excellent',
              child: child.name,
              message: `${child.name} is doing wonderfully! ${completionRate}% completion rate with ${averageAccuracy}% accuracy.`,
              parentAction: 'Celebrate this success! Acknowledge their hard work.',
              icon: 'star'
            });
          } else if (completionRate < 60) {
            progressInsights.push({
              type: 'support',
              child: child.name,
              message: `${child.name} might need extra encouragement with homework completion (${completionRate}%).`,
              parentAction: 'Create a dedicated homework time and space. Break tasks into smaller chunks.',
              icon: 'help'
            });
          }
        }
        
        if (skillsData?.progressByCategory) {
          Object.entries(skillsData.progressByCategory).forEach(([category, data]) => {
            const avgProficiency = data.skills?.length > 0
              ? data.skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / data.skills.length
              : 0;
              
            if (avgProficiency >= 4) {
              progressInsights.push({
                type: 'strength',
                child: child.name,
                message: `${child.name} is excelling in ${category} (Proficiency: ${avgProficiency.toFixed(1)}/5).`,
                parentAction: `Encourage their passion for ${category} with enriching activities.`,
                icon: 'brain'
              });
            } else if (avgProficiency > 0 && avgProficiency < 2.5) {
              progressInsights.push({
                type: 'growth',
                child: child.name,
                message: `${child.name} is building skills in ${category} and would benefit from practice.`,
                parentAction: `Make ${category} fun at home with games or hands-on activities.`,
                icon: 'growth'
              });
            }
          });
        }
        
      } catch (error) {
        console.warn(`Could not analyze progress for ${child.name}:`, error);
      }
    }
    
    setInsights(prev => ({ ...prev, childProgress: progressInsights }));
  };

  const generateAtHomeActivities = async (children) => {
    const activities = [];
    
    for (const child of children) {
      try {
        const skillsResponse = await fetch(
          `${API_BASE_URL}/api/skills/student/${child.id}/progress`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        if (skillsResponse.ok) {
          const skillsData = await skillsResponse.json();
          if (skillsData?.progressByCategory) {
            const focusAreas = Object.entries(skillsData.progressByCategory)
              .map(([category, data]) => ({
                category,
                avgProficiency: data.skills?.length > 0 ? data.skills.reduce((sum, s) => sum + s.proficiency_level, 0) / data.skills.length : 0
              }))
              .sort((a, b) => a.avgProficiency - b.avgProficiency);

            const areaForSupport = focusAreas.find(a => a.avgProficiency > 0 && a.avgProficiency < 3);
            const areaForEnrichment = focusAreas.find(a => a.avgProficiency >= 4);

            if (areaForSupport) {
              const activity = getActivitiesForCategory(areaForSupport.category, 'support');
              activities.push({ ...activity, child: child.name, type: 'support' });
            }
            if (areaForEnrichment) {
              const activity = getActivitiesForCategory(areaForEnrichment.category, 'enrichment');
              activities.push({ ...activity, child: child.name, type: 'enrichment' });
            }
          }
        }
      } catch (error) {
        console.warn(`Could not generate activities for ${child.name}:`, error);
      }
    }
    
    if (activities.length === 0) {
      activities.push({
        child: 'Whole Family',
        category: 'bonding',
        type: 'family',
        title: 'Family Learning Game Night',
        description: 'Turn learning into family fun with educational board games, puzzles, or creative storytelling.',
        timeNeeded: '30-60 minutes',
        materials: 'Board games, paper, crayons'
      });
    }
    
    setInsights(prev => ({ ...prev, atHomeActivities: activities.slice(0, 4) }));
  };

  const getActivitiesForCategory = (category, type) => {
    const activities = {
      mathematics: {
        support: {
          title: 'Kitchen Math Fun',
          description: 'Count ingredients while cooking, measure cups of flour, or sort utensils by size. Math is everywhere in the kitchen!',
          timeNeeded: '15-20 minutes',
          materials: 'Cooking ingredients, measuring cups'
        },
        enrichment: {
          title: 'Math Detective Hunt',
          description: 'Go on a number hunt around the house! Find shapes, count objects, and solve simple math puzzles together.',
          timeNeeded: '20-30 minutes',
          materials: 'Paper, pencil, small prizes'
        }
      },
      literacy: {
        support: {
          title: 'Story Adventure Time',
          description: 'Read together daily, point to words, and ask simple questions about the story. Let them tell you what happens next!',
          timeNeeded: '15-20 minutes',
          materials: 'Age-appropriate books'
        },
        enrichment: {
          title: 'Family Story Creation',
          description: 'Create stories together! Take turns adding sentences, draw pictures, and maybe even make a family book.',
          timeNeeded: '30-45 minutes',
          materials: 'Paper, crayons, stapler'
        }
      },
      science: {
        support: {
          title: 'Simple Science Explorations',
          description: 'Explore with water, magnets, or plants. Ask "What do you think will happen?" and discover together!',
          timeNeeded: '20-30 minutes',
          materials: 'Household items, magnifying glass'
        },
        enrichment: {
          title: 'Backyard Nature Lab',
          description: 'Start a nature journal, collect leaves, observe insects, or grow a small plant together.',
          timeNeeded: '30-60 minutes',
          materials: 'Journal, magnifying glass, small pots'
        }
      }
    };
    
    return activities[category]?.[type] || {
      title: 'Creative Learning Time',
      description: 'Engage in creative, hands-on learning activities that make education fun and meaningful.',
      timeNeeded: '20-30 minutes',
      materials: 'Basic craft supplies'
    };
  };

  const assessDevelopmentalMilestones = (children) => {
    const milestones = [];
    
    children.forEach(child => {
      // Based on typical preschool age ranges (3-5 years)
      milestones.push({
        child: child.name,
        area: 'Social-Emotional',
        milestone: 'Playing cooperatively with others',
        status: 'developing',
        parentTip: 'Arrange playdates and practice sharing activities at home.'
      });
      
      milestones.push({
        child: child.name,
        area: 'Language',
        milestone: 'Using complete sentences and asking questions',
        status: 'on-track',
        parentTip: 'Continue reading together and having conversations about their day.'
      });
      
      milestones.push({
        child: child.name,
        area: 'Physical',
        milestone: 'Fine motor skills for writing and drawing',
        status: 'developing',
        parentTip: 'Practice with play dough, finger painting, and simple mazes.'
      });
    });
    
    setInsights(prev => ({ ...prev, developmentalMilestones: milestones }));
  };

  const generateParentTips = (children) => {
    const tips = [
      {
        category: 'Homework Support',
        tip: 'Create a consistent homework routine',
        description: 'Set a specific time and quiet place for homework. This helps your child develop good study habits.',
        actionable: 'Start with 10-15 minutes daily at the same time.'
      },
      {
        category: 'Positive Reinforcement',
        tip: 'Celebrate effort, not just results',
        description: 'Praise your child for trying hard and persevering, even when tasks are challenging.',
        actionable: 'Say "I love how hard you worked on that!" instead of just "Good job!"'
      },
      {
        category: 'Learning at Home',
        tip: 'Make everyday activities educational',
        description: 'Turn daily routines into learning opportunities - count stairs, identify colors, discuss what you see.',
        actionable: 'During grocery shopping, have your child help find items and count them.'
      },
      {
        category: 'Communication',
        tip: 'Ask open-ended questions',
        description: 'Instead of "Did you have fun?", try "What was the best part of your day?" to encourage detailed responses.',
        actionable: 'At dinner, ask each family member to share one thing they learned today.'
      },
      {
        category: 'Screen Time Balance',
        tip: 'Choose educational content together',
        description: 'When using screens, select educational programs and watch together to discuss what you see.',
        actionable: 'Set a "learning show" time where you watch educational content and talk about it.'
      }
    ];
    
    setInsights(prev => ({ ...prev, parentTips: tips }));
  };

  const getIconForInsight = (iconType) => {
    switch (iconType) {
      case 'star': return <FaStar className="text-yellow-500" />;
      case 'brain': return <FaBrain className="text-purple-500" />;
      case 'help': return <FaHeart className="text-red-500" />;
      case 'growth': return <FaGraduationCap className="text-blue-500" />;
      default: return <FaChild className="text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
        <div className="flex items-center justify-center h-32">
          <FaSpinner className="animate-spin text-3xl text-pink-500 mr-3" />
          <span className="text-lg">Analyzing your child's progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaHeart className="text-3xl text-pink-500" />
          <div>
            <h2 className="text-2xl font-bold">Parent AI Assistant</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Personalized insights to support your child's learning journey
            </p>
          </div>
        </div>
        <button
          onClick={fetchAndAnalyzeParentData}
          className="flex items-center space-x-2 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
        >
          <FaBrain />
          <span>Refresh Insights</span>
        </button>
      </div>

      {/* Child Progress Insights */}
      <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-pink-50'}`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaChild className="mr-2 text-pink-500" />
          Your Child's Progress
        </h3>
        <div className="space-y-3">
          {insights.childProgress.length > 0 ? (
            insights.childProgress.map((progress, index) => (
              <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-pink-500`}>
                <div className="flex items-start space-x-3">
                  {getIconForInsight(progress.icon)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">{progress.message}</p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      💝 {progress.parentAction}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your child is making steady progress! Check back for detailed insights.
            </p>
          )}
        </div>
      </div>

      {/* At-Home Activities */}
      <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaHome className="mr-2 text-blue-500" />
          Suggested At-Home Activities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.atHomeActivities.slice(0, 4).map((activity, index) => (
            <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-blue-500`}>
              <div className="flex items-start space-x-2">
                <FaBookOpen className="text-blue-500 mt-1" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{activity.title}</p>
                  <p className="text-xs mt-1">{activity.description}</p>
                  <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                    <span>⏰ {activity.timeNeeded}</span>
                    <span>📦 {activity.materials}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Parent Tips */}
      <div className={`rounded-lg p-4 ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <FaLightbulb className="mr-2 text-green-500" />
          Parenting Tips
        </h3>
        <div className="space-y-3">
          {insights.parentTips.slice(0, 3).map((tip, index) => (
            <div key={index} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} border-l-4 border-green-500`}>
              <div className="flex items-start space-x-2">
                <FaLightbulb className="text-green-500 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{tip.tip}</p>
                  <p className="text-xs mt-1">{tip.description}</p>
                  <p className={`text-xs mt-1 font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                    Try this: {tip.actionable}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentAssistant; 