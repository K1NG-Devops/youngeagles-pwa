// Advanced AI Grading & Assessment System for Virtual School
// Comprehensive grading with detailed analytics and personalized feedback

import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';
import { 
  FaRobot, 
  FaChartLine, 
  FaBrain, 
  FaClipboardCheck,
  FaUser,
  FaUsers,
  FaClock,
  FaStar,
  FaLightbulb,
  FaHeart,
  FaExclamationTriangle,
  FaCheckCircle,
  FaSpinner,
  FaDownload,
  FaShare,
  FaEye,
  FaComment,
  FaThumbsUp,
  FaTrophy,
  FaBookOpen,
  FaGraduationCap,
  FaMinus
} from 'react-icons/fa';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

const EnhancedAIGradingSystem = ({ submissions = [], onGradingComplete }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  // State management
  const [gradingState, setGradingState] = useState({
    status: 'idle', // idle, processing, completed, error
    progress: 0,
    currentSubmission: null,
    processedCount: 0,
    totalCount: 0
  });
  
  const [gradingResults, setGradingResults] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [feedbackMode, setFeedbackMode] = useState('detailed'); // quick, detailed, comprehensive
  const [activeTab, setActiveTab] = useState('overview');

  // AI Grading Engine Configuration
  const gradingCriteria = {
    accuracy: {
      weight: 40,
      description: 'Correctness of answers and understanding',
      levels: {
        excellent: { min: 90, feedback: 'Outstanding accuracy! You demonstrate excellent understanding.' },
        good: { min: 75, feedback: 'Good work! Most answers show solid understanding.' },
        satisfactory: { min: 60, feedback: 'Satisfactory performance. Some areas need review.' },
        needsImprovement: { min: 0, feedback: 'Let\'s work together to improve understanding.' }
      }
    },
    effort: {
      weight: 25,
      description: 'Engagement and attempt at all questions',
      levels: {
        excellent: { min: 90, feedback: 'Fantastic effort! You tackled every challenge.' },
        good: { min: 75, feedback: 'Great effort shown throughout the work.' },
        satisfactory: { min: 60, feedback: 'Good attempt at most questions.' },
        needsImprovement: { min: 0, feedback: 'Try to complete all parts next time.' }
      }
    },
    creativity: {
      weight: 20,
      description: 'Original thinking and problem-solving approach',
      levels: {
        excellent: { min: 80, feedback: 'Amazing creativity! Your unique ideas shine through.' },
        good: { min: 65, feedback: 'Nice creative touches in your work.' },
        satisfactory: { min: 50, feedback: 'Some creative elements present.' },
        needsImprovement: { min: 0, feedback: 'Try adding your own creative ideas.' }
      }
    },
    presentation: {
      weight: 15,
      description: 'Organization and clarity of work',
      levels: {
        excellent: { min: 85, feedback: 'Beautifully organized and clearly presented.' },
        good: { min: 70, feedback: 'Well-organized with clear presentation.' },
        satisfactory: { min: 55, feedback: 'Generally well-presented.' },
        needsImprovement: { min: 0, feedback: 'Focus on making your work neater and clearer.' }
      }
    }
  };

  // Mock advanced grading data
  const mockGradingResults = [
    {
      id: 1,
      studentId: 'student_1',
      studentName: 'Emma Johnson',
      homeworkTitle: 'Counting Safari Adventure',
      submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      totalScore: 87,
      criteriaScores: {
        accuracy: 92,
        effort: 85,
        creativity: 78,
        presentation: 90
      },
      timeSpent: 18,
      questionsAnswered: 10,
      questionsCorrect: 9,
      strengths: [
        'Excellent number recognition skills',
        'Creative problem-solving approach',
        'Beautiful handwriting and organization'
      ],
      improvements: [
        'Practice counting beyond 10',
        'Double-check answers before submitting'
      ],
      personalizedFeedback: 'Emma, your counting skills are fantastic! I love how you drew pictures to help solve the problems. Keep up the amazing work!',
      nextSteps: [
        'Try counting objects around your house',
        'Practice writing numbers 11-20',
        'Help family members count things together'
      ],
      aiConfidence: 95,
      flaggedForReview: false,
      learningGaps: [],
      masteredConcepts: ['counting-1-10', 'number-recognition', 'one-to-one-correspondence']
    },
    {
      id: 2,
      studentId: 'student_2', 
      studentName: 'Liam Rodriguez',
      homeworkTitle: 'Shape Detective Challenge',
      submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      totalScore: 73,
      criteriaScores: {
        accuracy: 70,
        effort: 80,
        creativity: 65,
        presentation: 75
      },
      timeSpent: 25,
      questionsAnswered: 8,
      questionsCorrect: 6,
      strengths: [
        'Good effort on all activities',
        'Shows understanding of basic shapes',
        'Followed instructions well'
      ],
      improvements: [
        'Review triangle and rectangle differences',
        'Practice shape sorting activities',
        'Take time to check work'
      ],
      personalizedFeedback: "Liam, you worked really hard on this! I can see you understand circles and squares very well. Let's practice triangles and rectangles together next time.",
      nextSteps: [
        'Go on a shape hunt around your home',
        'Practice with shape puzzles',
        'Draw shapes with family members'
      ],
      aiConfidence: 88,
      flaggedForReview: true,
      learningGaps: ['triangle-recognition', 'rectangle-properties'],
      masteredConcepts: ['circle-recognition', 'square-identification']
    }
  ];

  // Enhanced AI grading simulation
  const startAIGrading = async () => {
    setGradingState({
      status: 'processing',
      progress: 0,
      currentSubmission: null,
      processedCount: 0,
      totalCount: submissions.length || mockGradingResults.length
    });

    // Simulate AI processing with realistic timing
    const submissionsToProcess = submissions.length > 0 ? submissions : mockGradingResults;
    
    for (let i = 0; i < submissionsToProcess.length; i++) {
      const submission = submissionsToProcess[i];
      
      setGradingState(prev => ({
        ...prev,
        currentSubmission: submission.studentName || `Student ${i + 1}`,
        progress: Math.round(((i + 1) / submissionsToProcess.length) * 100),
        processedCount: i + 1
      }));

      // Simulate AI analysis time (2-5 seconds per submission)
      await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    }

    // Complete grading
    setGradingState(prev => ({
      ...prev,
      status: 'completed',
      currentSubmission: null
    }));

    setGradingResults(mockGradingResults);
    generateClassAnalytics(mockGradingResults);
    
    nativeNotificationService.success(
      `🎉 AI grading completed! ${submissionsToProcess.length} submissions processed with detailed feedback.`
    );

    if (onGradingComplete) {
      onGradingComplete(mockGradingResults);
    }
  };

  // Generate comprehensive class analytics
  const generateClassAnalytics = (results) => {
    const analytics = {
      overview: {
        totalSubmissions: results.length,
        averageScore: Math.round(results.reduce((sum, r) => sum + r.totalScore, 0) / results.length),
        completionRate: 95,
        averageTimeSpent: Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length),
        flaggedForReview: results.filter(r => r.flaggedForReview).length
      },
      scoreDistribution: [
        { range: '90-100', count: results.filter(r => r.totalScore >= 90).length, color: '#10B981' },
        { range: '80-89', count: results.filter(r => r.totalScore >= 80 && r.totalScore < 90).length, color: '#34D399' },
        { range: '70-79', count: results.filter(r => r.totalScore >= 70 && r.totalScore < 80).length, color: '#FCD34D' },
        { range: '60-69', count: results.filter(r => r.totalScore >= 60 && r.totalScore < 70).length, color: '#FB923C' },
        { range: 'Below 60', count: results.filter(r => r.totalScore < 60).length, color: '#F87171' }
      ],
      criteriaAnalysis: Object.keys(gradingCriteria).map(criteria => ({
        name: criteria,
        average: Math.round(results.reduce((sum, r) => sum + r.criteriaScores[criteria], 0) / results.length),
        distribution: results.map(r => r.criteriaScores[criteria])
      })),
      timeAnalysis: {
        quickest: Math.min(...results.map(r => r.timeSpent)),
        longest: Math.max(...results.map(r => r.timeSpent)),
        average: Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / results.length)
      },
      conceptMastery: {
        mastered: ['counting-1-10', 'number-recognition', 'circle-recognition'],
        emerging: ['triangle-recognition', 'rectangle-properties'],
        needsWork: ['counting-beyond-10', 'shape-attributes']
      },
      insights: [
        {
          type: 'success',
          title: 'Strong Number Recognition',
          description: '85% of students demonstrate excellent number recognition skills',
          icon: FaCheckCircle,
          color: 'green'
        },
        {
          type: 'improvement',
          title: 'Shape Identification Opportunity',
          description: 'Consider additional practice with triangle and rectangle recognition',
          icon: FaLightbulb,
          color: 'orange'
        },
        {
          type: 'engagement',
          title: 'High Engagement Level',
          description: 'Students spent an average of 22 minutes on activities',
          icon: FaHeart,
          color: 'purple'
        }
      ]
    };

    setClassAnalytics(analytics);
  };

  // Get score color based on performance
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  // Get trend icon based on performance
  const getTrendIcon = (score) => {
    if (score >= 85) return <FaArrowUp className="text-green-500" />;
    if (score >= 70) return <FaMinus className="text-yellow-500" />;
    return <FaArrowDown className="text-red-500" />;
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`p-6 rounded-2xl shadow-xl mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                🤖 AI Grading & Assessment Center
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Intelligent grading with personalized feedback and detailed analytics
              </p>
            </div>
            
            {gradingState.status === 'idle' && (
              <button
                onClick={startAIGrading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-medium"
              >
                <FaRobot className="inline mr-2" />
                Start AI Grading
              </button>
            )}
          </div>
        </div>

        {/* Grading Status */}
        {gradingState.status === 'processing' && (
          <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                AI Grading in Progress
              </h2>
              <div className="flex items-center">
                <FaSpinner className="animate-spin text-blue-500 mr-2" />
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {gradingState.progress}% Complete
                </span>
              </div>
            </div>
            
            <div className={`w-full h-3 rounded-full mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${gradingState.progress}%` }}
              ></div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {gradingState.processedCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Processed
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  {gradingState.totalCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total
                </div>
              </div>
              <div>
                <div className={`text-2xl font-bold ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  {gradingState.totalCount - gradingState.processedCount}
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Remaining
                </div>
              </div>
            </div>
            
            {gradingState.currentSubmission && (
              <div className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                  Currently grading: <strong>{gradingState.currentSubmission}</strong>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Results Dashboard */}
        {gradingState.status === 'completed' && gradingResults.length > 0 && (
          <>
            {/* Navigation Tabs */}
            <div className={`p-6 rounded-xl shadow-lg mb-8 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Class Overview', icon: FaChartLine },
                  { id: 'individual', label: 'Individual Results', icon: FaUser },
                  { id: 'analytics', label: 'Deep Analytics', icon: FaBrain },
                  { id: 'insights', label: 'AI Insights', icon: FaLightbulb }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-600 text-white shadow-md'
                        : isDark 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Class Overview Tab */}
            {activeTab === 'overview' && classAnalytics && (
              <div className="space-y-8">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { 
                      label: 'Submissions', 
                      value: classAnalytics.overview.totalSubmissions, 
                      icon: FaClipboardCheck,
                      color: 'blue'
                    },
                    { 
                      label: 'Avg Score', 
                      value: `${classAnalytics.overview.averageScore}%`, 
                      icon: FaStar,
                      color: 'green'
                    },
                    { 
                      label: 'Completion', 
                      value: `${classAnalytics.overview.completionRate}%`, 
                      icon: FaCheckCircle,
                      color: 'purple'
                    },
                    { 
                      label: 'Avg Time', 
                      value: `${classAnalytics.overview.averageTimeSpent}min`, 
                      icon: FaClock,
                      color: 'orange'
                    },
                    { 
                      label: 'For Review', 
                      value: classAnalytics.overview.flaggedForReview, 
                      icon: FaExclamationTriangle,
                      color: 'red'
                    }
                  ].map((stat, index) => (
                    <div key={index} className={`p-4 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className={`p-3 rounded-lg bg-${stat.color}-100 mb-3 w-fit`}>
                        <stat.icon className={`text-2xl text-${stat.color}-600`} />
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {stat.value}
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score Distribution Chart */}
                <div className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Score Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classAnalytics.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* AI Insights */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {classAnalytics.insights.map((insight, index) => (
                    <div key={index} className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg bg-${insight.color}-100`}>
                          <insight.icon className={`text-2xl text-${insight.color}-600`} />
                        </div>
                        <div>
                          <h4 className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {insight.title}
                          </h4>
                          <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Results Tab */}
            {activeTab === 'individual' && (
              <div className="space-y-6">
                {gradingResults.map((result) => (
                  <div key={result.id} className={`p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    {/* Student Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {result.studentName.charAt(0)}
                        </div>
                        <div>
                          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {result.studentName}
                          </h3>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.homeworkTitle}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold ${getScoreColor(result.totalScore)}`}>
                          {result.totalScore}%
                        </div>
                        <div className="flex items-center justify-end mt-1">
                          {getTrendIcon(result.totalScore)}
                          <span className={`text-sm ml-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.timeSpent}min
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Criteria Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {Object.entries(result.criteriaScores).map(([criteria, score]) => (
                        <div key={criteria} className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div className={`text-lg font-bold ${getScoreColor(score)}`}>
                            {score}%
                          </div>
                          <div className={`text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {criteria}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Personalized Feedback */}
                    <div className={`p-4 rounded-lg mb-4 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
                      <h4 className={`font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                        Personal Message
                      </h4>
                      <p className={`${isDark ? 'text-blue-200' : 'text-blue-700'}`}>
                        {result.personalizedFeedback}
                      </p>
                    </div>

                    {/* Strengths and Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                        <h4 className={`font-bold mb-2 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                          ✨ Strengths
                        </h4>
                        <ul className="space-y-1">
                          {result.strengths.map((strength, index) => (
                            <li key={index} className={`text-sm ${isDark ? 'text-green-200' : 'text-green-700'}`}>
                              • {strength}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
                        <h4 className={`font-bold mb-2 ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                          🎯 Growth Areas
                        </h4>
                        <ul className="space-y-1">
                          {result.improvements.map((improvement, index) => (
                            <li key={index} className={`text-sm ${isDark ? 'text-orange-200' : 'text-orange-700'}`}>
                              • {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3">
                      <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark 
                          ? 'bg-blue-600 text-white hover:bg-blue-700' 
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      }`}>
                        <FaShare className="inline mr-2" />
                        Share with Parent
                      </button>
                      <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                        <FaDownload className="inline mr-2" />
                        Download Report
                      </button>
                      <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        isDark 
                          ? 'bg-purple-600 text-white hover:bg-purple-700' 
                          : 'bg-purple-500 text-white hover:bg-purple-600'
                      }`}>
                        <FaLightbulb className="inline mr-2" />
                        Next Steps
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnhancedAIGradingSystem;
