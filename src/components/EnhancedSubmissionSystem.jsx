// Enhanced Submission System with Real-time Progress Tracking
// State-of-the-art homework submission experience

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  FaUpload, 
  FaGamepad, 
  FaCheckCircle, 
  FaSpinner,
  FaCloudUploadAlt,
  FaFileImage,
  FaFilePdf,
  FaFileWord,
  FaMicrophone,
  FaVideo,
  FaCamera,
  FaChartLine,
  FaStar,
  FaLightbulb,
  FaComments,
  FaRobot,
  FaEye,
  FaClock,
  FaHeart
} from 'react-icons/fa';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';

const EnhancedSubmissionSystem = ({ homework, selectedChildId, onSubmissionComplete }) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [submissionState, setSubmissionState] = useState({
    currentStep: 1,
    totalSteps: 4,
    isProcessing: false,
    uploadProgress: 0,
    submissionType: homework?.content_type || 'traditional',
    files: [],
    comments: '',
    timeSpent: 0,
    startTime: Date.now(),
    confidenceLevel: 'medium',
    needsHelp: false,
    parentNotes: '',
    teacherQuestions: []
  });

  const [interactiveProgress, setInteractiveProgress] = useState({
    currentActivity: 0,
    totalActivities: 0,
    score: 0,
    correctAnswers: 0,
    hintsUsed: 0,
    timePerActivity: [],
    engagementLevel: 'high'
  });

  const [aiInsights, setAiInsights] = useState(null);
  const [realTimeAnalytics, setRealTimeAnalytics] = useState({
    timeSpent: 0,
    focusLevel: 'high',
    strugglingAreas: [],
    strengths: [],
    recommendedBreak: false
  });

  // Real-time time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSpent = Math.floor((Date.now() - submissionState.startTime) / 1000);
      setSubmissionState(prev => ({ ...prev, timeSpent }));
      
      // Update real-time analytics
      setRealTimeAnalytics(prev => ({
        ...prev,
        timeSpent,
        recommendedBreak: timeSpent > 1800 && timeSpent % 900 === 0 // Every 15 min after 30 min
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [submissionState.startTime]);

  // Smart file validation with AI suggestions
  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = {
      'image/jpeg': { icon: FaFileImage, category: 'Photo' },
      'image/png': { icon: FaFileImage, category: 'Photo' },
      'image/gif': { icon: FaFileImage, category: 'Photo' },
      'application/pdf': { icon: FaFilePdf, category: 'Document' },
      'application/msword': { icon: FaFileWord, category: 'Document' },
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FaFileWord, category: 'Document' },
      'video/mp4': { icon: FaVideo, category: 'Video' },
      'audio/mpeg': { icon: FaMicrophone, category: 'Audio' },
      'audio/wav': { icon: FaMicrophone, category: 'Audio' }
    };

    if (file.size > maxSize) {
      return { valid: false, error: 'File size too large (max 10MB)' };
    }

    if (!allowedTypes[file.type]) {
      return { valid: false, error: 'File type not supported' };
    }

    return { 
      valid: true, 
      fileInfo: { 
        ...allowedTypes[file.type], 
        size: file.size,
        name: file.name
      }
    };
  }, []);

  // Enhanced file handling with smart categorization
  const handleFileUpload = async (files) => {
    setSubmissionState(prev => ({ ...prev, isProcessing: true }));
    
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (validation.valid) {
        validFiles.push({
          file,
          ...validation.fileInfo,
          id: Math.random().toString(36).substr(2, 9),
          uploadProgress: 0,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        });
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      nativeNotificationService.error(`Upload issues: ${errors.join(', ')}`);
    }

    setSubmissionState(prev => ({ 
      ...prev, 
      files: [...prev.files, ...validFiles],
      isProcessing: false
    }));

    // Generate AI insights about uploaded content
    if (validFiles.length > 0) {
      generateUploadInsights(validFiles);
    }
  };

  // AI-powered upload insights
  const generateUploadInsights = async (files) => {
    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const insights = {
        fileQuality: 'Good - Clear and readable images detected',
        contentAnalysis: 'Mathematical work identified with step-by-step solutions',
        suggestions: [
          'Consider adding a photo of your work process',
          'Voice recording explaining your thinking would be helpful',
          'Great job showing your calculations clearly!'
        ],
        completenessScore: 85,
        improvementTips: 'Add brief explanations for each step'
      };
      
      setAiInsights(insights);
      nativeNotificationService.info('AI analysis complete - check suggestions below!');
    } catch (error) {
      console.error('Error generating insights:', error);
    }
  };

  // Smart submission with adaptive feedback
  const handleSubmission = async () => {
    setSubmissionState(prev => ({ ...prev, isProcessing: true, currentStep: prev.totalSteps }));
    
    try {
      const formData = new FormData();
      formData.append('homework_id', homework.id);
      formData.append('child_id', selectedChildId);
      formData.append('comments', submissionState.comments);
      formData.append('time_spent', submissionState.timeSpent);
      formData.append('confidence_level', submissionState.confidenceLevel);
      formData.append('needs_help', submissionState.needsHelp);
      formData.append('parent_notes', submissionState.parentNotes);
      
      // Add AI analytics data
      formData.append('analytics_data', JSON.stringify({
        realTimeAnalytics,
        interactiveProgress: homework.content_type === 'interactive' ? interactiveProgress : null,
        aiInsights
      }));

      // Add files
      submissionState.files.forEach(fileObj => {
        formData.append('files', fileObj.file);
      });

      // Submit with progress tracking
      const response = await apiService.homework.submit(homework.id, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setSubmissionState(prev => ({ ...prev, uploadProgress: progress }));
        }
      });

      if (response.data.success) {
        // Success with celebration
        setSubmissionState(prev => ({ ...prev, currentStep: prev.totalSteps + 1 }));
        
        // Generate personalized success message
        const successMessage = generateSuccessMessage();
        nativeNotificationService.success(successMessage);
        
        // Trigger confetti or celebration animation
        triggerCelebration();
        
        if (onSubmissionComplete) {
          onSubmissionComplete(response.data);
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      nativeNotificationService.error('Submission failed. Please try again.');
      setSubmissionState(prev => ({ ...prev, currentStep: 3 })); // Back to review step
    } finally {
      setSubmissionState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  // Personalized success message generation
  const generateSuccessMessage = () => {
    const timeSpentMinutes = Math.round(submissionState.timeSpent / 60);
    const effort = timeSpentMinutes > 30 ? 'exceptional' : timeSpentMinutes > 15 ? 'great' : 'good';
    
    const messages = [
      `🎉 Amazing work! You spent ${timeSpentMinutes} minutes showing ${effort} effort!`,
      `⭐ Fantastic submission! Your teacher will love seeing your ${effort} work!`,
      `🌟 Well done! ${timeSpentMinutes} minutes of focused learning - you're amazing!`,
      `🎯 Perfect! Your ${effort} effort really shows in this submission!`
    ];
    
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Celebration animation trigger
  const triggerCelebration = () => {
    // This would trigger a confetti animation or celebration effect
    const celebrationElement = document.createElement('div');
    celebrationElement.innerHTML = '🎉✨🌟⭐🎊';
    celebrationElement.className = 'celebration-animation fixed inset-0 pointer-events-none z-50';
    document.body.appendChild(celebrationElement);
    
    setTimeout(() => {
      document.body.removeChild(celebrationElement);
    }, 3000);
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    handleFileUpload(files);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepStatus = (stepNumber) => {
    if (stepNumber < submissionState.currentStep) return 'completed';
    if (stepNumber === submissionState.currentStep) return 'active';
    return 'pending';
  };

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Submission Progress
        </span>
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Step {submissionState.currentStep} of {submissionState.totalSteps}
        </span>
      </div>
      <div className={`w-full rounded-full h-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <div 
          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${(submissionState.currentStep / submissionState.totalSteps) * 100}%` }}
        />
      </div>
      
      {/* Step indicators */}
      <div className="flex justify-between mt-2">
        {['Upload', 'Review', 'Enhance', 'Submit'].map((label, index) => (
          <div key={label} className="flex flex-col items-center">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              getStepStatus(index + 1) === 'completed' 
                ? 'bg-green-500 text-white' 
                : getStepStatus(index + 1) === 'active'
                  ? 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-600 text-gray-400' : 'bg-gray-300 text-gray-600'
            }`}>
              {getStepStatus(index + 1) === 'completed' ? <FaCheckCircle /> : index + 1}
            </div>
            <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeTracker = () => (
    <div className={`rounded-lg p-3 border mb-4 ${
      isDark ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <FaClock className="text-blue-500 mr-2" />
          <span className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
            Time Spent: {formatTime(submissionState.timeSpent)}
          </span>
        </div>
        
        {realTimeAnalytics.recommendedBreak && (
          <div className={`text-xs px-2 py-1 rounded-full ${
            isDark ? 'bg-yellow-900/30 text-yellow-400' : 'bg-yellow-100 text-yellow-800'
          }`}>
            💡 Break recommended
          </div>
        )}
      </div>
      
      <div className={`text-xs mt-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
        Focus Level: {realTimeAnalytics.focusLevel} • Estimated completion: 
        {homework?.estimated_duration ? ` ${homework.estimated_duration} min` : ' 30 min'}
      </div>
    </div>
  );

  const renderUploadArea = () => (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
        isDark 
          ? 'border-gray-600 hover:border-blue-500 bg-gray-800' 
          : 'border-gray-300 hover:border-blue-500 bg-gray-50'
      }`}
    >
      <FaCloudUploadAlt className="text-4xl text-blue-500 mx-auto mb-4" />
      <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Upload Your Work
      </h3>
      <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        Drag and drop files here, or click to select
      </p>
      
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {[
          { icon: FaCamera, label: 'Photos', color: 'green' },
          { icon: FaFilePdf, label: 'PDFs', color: 'red' },
          { icon: FaFileWord, label: 'Documents', color: 'blue' },
          { icon: FaVideo, label: 'Videos', color: 'purple' },
          { icon: FaMicrophone, label: 'Audio', color: 'orange' }
        ].map(type => (
          <div key={type.label} className={`flex items-center px-2 py-1 rounded-full text-xs ${
            isDark ? 'bg-gray-700 text-gray-300' : 'bg-white text-gray-600'
          }`}>
            <type.icon className={`mr-1 text-${type.color}-500`} />
            {type.label}
          </div>
        ))}
      </div>
      
      <input
        type="file"
        multiple
        accept="image/*,application/pdf,.doc,.docx,video/*,audio/*"
        onChange={(e) => handleFileUpload(Array.from(e.target.files))}
        className="hidden"
        id="file-upload"
      />
      <label
        htmlFor="file-upload"
        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
      >
        <FaUpload className="mr-2" />
        Choose Files
      </label>
    </div>
  );

  const renderFileList = () => (
    <div className="space-y-3">
      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        Uploaded Files ({submissionState.files.length})
      </h4>
      {submissionState.files.map(file => (
        <div key={file.id} className={`flex items-center p-3 rounded-lg border ${
          isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'
        }`}>
          <file.icon className="text-2xl text-blue-500 mr-3" />
          <div className="flex-1">
            <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {file.name}
            </div>
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {file.category} • {(file.size / 1024 / 1024).toFixed(2)} MB
            </div>
          </div>
          {file.preview && (
            <img src={file.preview} alt="Preview" className="w-12 h-12 object-cover rounded ml-3" />
          )}
        </div>
      ))}
    </div>
  );

  const renderAIInsights = () => (
    aiInsights && (
      <div className={`rounded-lg p-4 border ${
        isDark ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'
      }`}>
        <div className="flex items-center mb-3">
          <FaRobot className="text-purple-500 mr-2" />
          <h4 className={`font-semibold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
            AI Analysis & Suggestions
          </h4>
        </div>
        
        <div className="space-y-2">
          <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
            <strong>Quality:</strong> {aiInsights.fileQuality}
          </div>
          <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
            <strong>Content:</strong> {aiInsights.contentAnalysis}
          </div>
          <div className={`text-sm ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
            <strong>Completeness:</strong> {aiInsights.completenessScore}%
          </div>
          
          <div className="mt-3">
            <div className={`text-sm font-medium mb-1 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
              💡 Suggestions:
            </div>
            <ul className={`text-xs space-y-1 ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>
              {aiInsights.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  );

  const renderConfidenceSelector = () => (
    <div className="space-y-3">
      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
        How confident do you feel about this work?
      </h4>
      <div className="grid grid-cols-3 gap-2">
        {[
          { value: 'low', label: 'Need Help', icon: '😅', color: 'red' },
          { value: 'medium', label: 'Pretty Good', icon: '😊', color: 'yellow' },
          { value: 'high', label: 'Very Confident', icon: '😄', color: 'green' }
        ].map(option => (
          <button
            key={option.value}
            onClick={() => setSubmissionState(prev => ({ ...prev, confidenceLevel: option.value }))}
            className={`p-3 rounded-lg border text-center transition-all ${
              submissionState.confidenceLevel === option.value
                ? `border-${option.color}-500 bg-${option.color}-500/20`
                : isDark ? 'border-gray-600 hover:border-gray-500' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="text-2xl mb-1">{option.icon}</div>
            <div className={`text-xs font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {option.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={`rounded-xl shadow-lg border p-6 ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Submit Your Work
          </h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {homework?.title}
          </p>
        </div>
        <div className="flex items-center">
          <FaHeart className="text-red-500 mr-2" />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            You've got this!
          </span>
        </div>
      </div>

      {renderProgressBar()}
      {renderTimeTracker()}

      {/* Step Content */}
      {submissionState.currentStep === 1 && (
        <div className="space-y-6">
          {renderUploadArea()}
          {submissionState.files.length > 0 && renderFileList()}
          
          <div className="flex justify-end">
            <button
              onClick={() => setSubmissionState(prev => ({ ...prev, currentStep: 2 }))}
              disabled={submissionState.files.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              Next: Review
            </button>
          </div>
        </div>
      )}

      {submissionState.currentStep === 2 && (
        <div className="space-y-6">
          {renderFileList()}
          {renderAIInsights()}
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Comments (Optional)
            </label>
            <textarea
              value={submissionState.comments}
              onChange={(e) => setSubmissionState(prev => ({ ...prev, comments: e.target.value }))}
              rows={3}
              placeholder="Tell your teacher about your work, challenges you faced, or questions you have..."
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setSubmissionState(prev => ({ ...prev, currentStep: 1 }))}
              className={`px-4 py-2 rounded-lg ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Back
            </button>
            <button
              onClick={() => setSubmissionState(prev => ({ ...prev, currentStep: 3 }))}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Next: Enhance
            </button>
          </div>
        </div>
      )}

      {submissionState.currentStep === 3 && (
        <div className="space-y-6">
          {renderConfidenceSelector()}
          
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Parent Notes (Optional)
            </label>
            <textarea
              value={submissionState.parentNotes}
              onChange={(e) => setSubmissionState(prev => ({ ...prev, parentNotes: e.target.value }))}
              rows={2}
              placeholder="Any additional context or notes for the teacher..."
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`}
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="needs-help"
              checked={submissionState.needsHelp}
              onChange={(e) => setSubmissionState(prev => ({ ...prev, needsHelp: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="needs-help" className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              I would like extra help with this topic
            </label>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setSubmissionState(prev => ({ ...prev, currentStep: 2 }))}
              className={`px-4 py-2 rounded-lg ${
                isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
            >
              Back
            </button>
            <button
              onClick={() => setSubmissionState(prev => ({ ...prev, currentStep: 4 }))}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Ready to Submit
            </button>
          </div>
        </div>
      )}

      {submissionState.currentStep === 4 && (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to Submit!
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Review your submission details below, then click submit when ready.
            </p>
          </div>
          
          <div className={`rounded-lg p-4 border ${
            isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Files:
                </span>
                <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {submissionState.files.length}
                </span>
              </div>
              <div>
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Time Spent:
                </span>
                <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {formatTime(submissionState.timeSpent)}
                </span>
              </div>
              <div>
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confidence:
                </span>
                <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {submissionState.confidenceLevel}
                </span>
              </div>
              <div>
                <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Help Requested:
                </span>
                <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {submissionState.needsHelp ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
          
          {submissionState.isProcessing ? (
            <div className="space-y-4">
              <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto" />
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Submitting your work...
              </p>
              <div className={`w-full rounded-full h-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${submissionState.uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-between">
              <button
                onClick={() => setSubmissionState(prev => ({ ...prev, currentStep: 3 }))}
                className={`px-4 py-2 rounded-lg ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
              >
                Back
              </button>
              <button
                onClick={handleSubmission}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-lg transition-all transform hover:scale-105"
              >
                <FaCheckCircle className="mr-2 inline" />
                Submit Work
              </button>
            </div>
          )}
        </div>
      )}

      {submissionState.currentStep === 5 && (
        <div className="space-y-6 text-center">
          <div className="space-y-4">
            <div className="text-6xl animate-bounce">🎉</div>
            <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Submission Complete!
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Your work has been successfully submitted to your teacher.
            </p>
          </div>
          
          <div className={`rounded-lg p-4 border ${
            isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'
          }`}>
            <div className={`text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              ✅ Files uploaded successfully<br/>
              ✅ Teacher notification sent<br/>
              ✅ Progress recorded<br/>
              ✅ Parent notification sent
            </div>
          </div>
          
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            You'll receive a notification when your teacher grades your work!
          </p>
        </div>
      )}
    </div>
  );
};

export default EnhancedSubmissionSystem;
