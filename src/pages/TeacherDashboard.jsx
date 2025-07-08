import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FaBook,
  FaUsers,
  FaGraduationCap,
  FaChartLine,
  FaPlus,
  FaBell,
  FaTasks,
  FaLightbulb,
  FaArrowRight,
  FaRobot,
  FaClipboardCheck,
  FaComments,
  FaFileAlt,
  FaSpinner,
  FaCheckCircle,
  FaExclamationCircle
} from 'react-icons/fa';
import LessonLibrary from '../components/LessonLibrary';
import AIGradingPanel from '../components/AIGradingPanel';
import StudentProgressModal from '../components/StudentProgressModal';
import ParentCommunicationPanel from '../components/ParentCommunicationPanel';
import AdvancedHomeworkAssignment from '../components/AdvancedHomeworkAssignment';
import NewHomeworkAssignment from '../components/NewHomeworkAssignment';
import Header from '../components/Header';

// Hooks and Services
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import apiService from '../services/apiService';
const TeacherDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
    pending: 0,
    pendingGrading: 0,
    completedAssignments: 0
  });
  const [classes, setClasses] = useState([]);
  const [showLessonLibrary, setShowLessonLibrary] = useState(false);
  const [showAIGrading, setShowAIGrading] = useState(false);
  const [showParentComm, setShowParentComm] = useState(false);
  const [showHomeworkAssignment, setShowHomeworkAssignment] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [gradingQueue, setGradingQueue] = useState([]);
  const [aiGradingStatus, setAiGradingStatus] = useState('idle');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch teacher's classes
        const classesResponse = await apiService.classes.getByTeacher(user.id);
        const teacherClasses = classesResponse.data.classes || [];
        setClasses(teacherClasses);
        
        // Calculate student count - use attendance API if no classes assigned
        let studentCount = 0;
        if (teacherClasses.length > 0) {
          studentCount = teacherClasses.reduce((total, cls) => total + (cls.student_count || 15), 0);
        } else {
          // Try to get student count from attendance API
          try {
            const today = new Date().toISOString().split('T')[0];
            const attendanceResponse = await apiService.attendance.getByClass(today);
            if (attendanceResponse.data.success && attendanceResponse.data.students) {
              studentCount = attendanceResponse.data.students.length;
              console.log(`📊 Found ${studentCount} students in attendance API for teacher ${user.id}`);
              
              // Create virtual class from attendance data
              const virtualClass = {
                id: attendanceResponse.data.classId || 1,
                name: attendanceResponse.data.className || 'My Class',
                student_count: studentCount
              };
              setClasses([virtualClass]);
            }
          } catch (attendanceError) {
            console.error('Error getting students from attendance API:', attendanceError);
          }
        }
        
        // Fetch homework assignments and submissions
        try {
          const homeworkResponse = await apiService.homework.getByTeacher(user.id);
          const homework = homeworkResponse.data.homework || [];
          
          // TODO: Implement these endpoints in the backend
          // Fetch pending submissions for grading
          // const submissionsResponse = await apiService.homework.getPendingSubmissions(user.id);
          // const submissions = submissionsResponse.data.submissions || [];
          const submissions = []; // Mock empty data for now
          setPendingSubmissions(submissions);

          // Fetch AI grading queue status
          // const gradingQueueResponse = await apiService.ai.getGradingQueue(user.id);
          // const queue = gradingQueueResponse.data.queue || [];
          const queue = []; // Mock empty data for now
          setGradingQueue(queue);

          const completedAssignments = submissions.filter(sub => sub.status === 'graded').length;
          const pendingGrading = submissions.filter(sub => sub.status === 'submitted').length;
          
          setStats({
            classes: Math.max(teacherClasses.length, studentCount > 0 ? 1 : 0),
            students: studentCount,
            assignments: homework.length,
            pending: homework.filter(hw => hw.status === 'assigned').length,
            pendingGrading: pendingGrading,
            completedAssignments: completedAssignments
          });
        } catch (error) {
          console.error('Error fetching homework data:', error);
          // Use empty data when homework API is not available
          setStats({
            classes: Math.max(teacherClasses.length, studentCount > 0 ? 1 : 0),
            students: studentCount,
            assignments: 0,
            pending: 0,
            pendingGrading: 0,
            completedAssignments: 0
          });
        }
      } catch (error) {
        console.error('Error fetching teacher data:', error);
        // Use empty stats when API is not available
        setStats({
          classes: 0,
          students: 0,
          assignments: 0,
          pending: 0
        });
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTeacherData();
    }
  }, [user, refreshTrigger]);

  const handleAssignHomework = async (homeworkData) => {
    try {
      const response = await apiService.homework.create(homeworkData);
      const homeworkId = response?.data?.homeworkId || response?.data?.homework?.id;
      toast.success(`Lesson "${homeworkData.title}" assigned successfully!`);

      // Refresh stats
      setStats(prev => ({
        ...prev,
        assignments: prev.assignments + 1,
        pending: prev.pending + homeworkData.classes.length
      }));

      // Navigate to newly created homework details page if we have the ID
      if (homeworkId) {
        navigate(`/homework/${homeworkId}`);
      }
    } catch (error) {
      const errorMessage = error?.response?.data?.message || error.message || 'Failed to assign homework';
      toast.error(errorMessage);
      console.error('Error assigning homework:', error);
      throw error; // Re-throw so calling component can still handle if needed
    }
  };

  // Handle homework creation from advanced component
  const handleHomeworkCreated = (newHomework) => {
    console.log('New homework created:', newHomework);
    
    // Force a complete refresh of teacher data
    const refreshAllData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch updated homework data
        const homeworkResponse = await apiService.homework.getByTeacher(user.id);
        const homework = homeworkResponse.data.homework || [];
        
        // Update stats with fresh data
        setStats(prev => ({
          ...prev,
          assignments: homework.length,
          pending: homework.filter(hw => hw.status === 'assigned' || hw.status === 'active').length
        }));
        
        console.log(`✅ Refreshed homework data: ${homework.length} total assignments`);
        
        // Trigger refresh trigger to update other components
        setRefreshTrigger(prev => prev + 1);
        
      } catch (error) {
        console.error('Error refreshing homework data:', error);
        toast.error('Failed to refresh homework data');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Wait a moment for the API to process, then refresh
    setTimeout(refreshAllData, 500);
  };

  // AI Grading handlers
  const handleStartAIGrading = async (submissions) => {
    try {
      setAiGradingStatus('processing');
      // TODO: Implement this endpoint in the backend
      // const response = await apiService.ai.startGrading(submissions);
      // if (response.data.success) {
      //   setGradingQueue(response.data.queue || []);
      //   toast.success('AI grading has started!');
      // }
      
      // Mock response for now
      toast.success('AI grading feature coming soon!');
      setTimeout(() => {
        setAiGradingStatus('completed');
      }, 3000);
    } catch (error) {
      console.error('Error starting AI grading:', error);
      toast.error('Failed to start AI grading');
      setAiGradingStatus('idle');
    }
  };

  const handleViewGradingResults = async (submissionId) => {
    try {
      // TODO: Implement this endpoint in the backend
      // const response = await apiService.ai.getGradingResults(submissionId);
      // if (response.data.success) {
      //   // Update the UI with grading results
      //   setPendingSubmissions(prev => 
      //     prev.map(sub => 
      //       sub.id === submissionId 
      //         ? { ...sub, ...response.data.results, status: 'graded' }
      //         : sub
      //     )
      //   );
      // }
      
      // Mock response for now
      toast.info('Grading results feature coming soon!');
    } catch (error) {
      console.error('Error viewing grading results:', error);
      toast.error('Failed to load grading results');
    }
  };

  // Parent Communication handlers
  const handleShareWithParent = async (studentId, gradedWork) => {
    try {
      // TODO: Implement this endpoint in the backend
      // const response = await apiService.communication.shareWithParent(studentId, gradedWork);
      // if (response.data.success) {
      //   toast.success('Successfully shared with parent!');
      // }
      
      // Mock response for now
      toast.success('Parent communication feature coming soon!');
    } catch (error) {
      console.error('Error sharing with parent:', error);
      toast.error('Failed to share with parent');
    }
  };

  const handleGenerateProgressReport = async (studentId) => {
    try {
      // TODO: Implement this endpoint in the backend
      // const response = await apiService.reports.generateProgress(studentId);
      // if (response.data.success) {
      //   toast.success('Progress report generated successfully!');
      //   return response.data.report;
      // }
      
      // Mock response for now
      toast.success('Progress report feature coming soon!');
      return null;
    } catch (error) {
      console.error('Error generating progress report:', error);
      toast.error('Failed to generate progress report');
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showLessonLibrary) {
    return (
      <div>
        <div className="mb-4 p-4">
          <button
            onClick={() => setShowLessonLibrary(false)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </button>
        </div>
        <LessonLibrary 
          onAssignHomework={handleAssignHomework}
          classes={classes}
        />
      </div>
    );
  }

  if (showAIGrading) {
    return (
      <div>
        <div className="mb-4 p-4">
          <button
            onClick={() => setShowAIGrading(false)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </button>
        </div>
        <AIGradingPanel 
          pendingSubmissions={pendingSubmissions}
          gradingQueue={gradingQueue}
          onStartGrading={handleStartAIGrading}
          onViewResults={handleViewGradingResults}
          onShareWithParent={handleShareWithParent}
          aiGradingStatus={aiGradingStatus}
        />
      </div>
    );
  }

  if (showParentComm) {
    return (
      <div>
        <div className="mb-4 p-4">
          <button
            onClick={() => setShowParentComm(false)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark ? 'text-gray-300 hover:bg-gray-800 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowRight className="w-4 h-4 mr-2 rotate-180" />
            Back to Dashboard
          </button>
        </div>
        <ParentCommunicationPanel 
          classes={classes}
          onShareResults={handleShareWithParent}
          onGenerateReport={handleGenerateProgressReport}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      
      {/* Welcome Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pb-20 md:pb-28">

        <div className="bg-gradient-to-r text-center rounded-xl from-green-500 to-blue-600 text-white mt-20">
          <div className="max-w-6xl mx-auto py-6 px-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">Welcome back, {user?.name}!</h2>
            <p className="text-green-100 text-xs sm:text-sm">Manage your classes and create engaging lessons</p>
            {/* Display teacher's class name if they have one */}
            {classes.length > 0 && (
              <div className="mt-3 bg-white/10 rounded-lg p-3">
                <p className="text-lg font-bold">{classes[0].name} Class</p>
              </div>
            )}
          </div>
        </div>
        
        {/* AI Grading Status Banner */}
        {aiGradingStatus === 'processing' && (
          <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
            <div className="flex items-center">
              <FaSpinner className="animate-spin text-blue-500 mr-3" />
              <div>
                <p className={`font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>AI Grading in Progress</p>
                <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  {gradingQueue.length} submissions are being processed. You'll be notified when complete.
                </p>
              </div>
            </div>
          </div>
        )}

        {aiGradingStatus === 'completed' && (
          <div className={`p-4 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <div className="flex items-center">
              <FaCheckCircle className="text-green-500 mr-3" />
              <div>
                <p className={`font-medium ${isDark ? 'text-green-300' : 'text-green-800'}`}>AI Grading Complete!</p>
                <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>
                  New graded assignments are ready for review and sharing with parents.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                <FaGraduationCap className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {classes.length > 0 ? classes[0].name : 'No Class'}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>My Class</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
                <FaUsers className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.students}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Children</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-100'}`}>
                <FaTasks className={`w-5 h-5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.assignments}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Assignments</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-900/20' : 'bg-orange-100'}`}>
                <FaBell className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Library Summary */}
        <div className={`p-6 rounded-xl shadow-sm border mb-6 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>📚 CAPS-Aligned Lesson Library</h3>
            <button
              onClick={() => setShowLessonLibrary(true)}
              className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
            >
              View All →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>16</div>
              <div className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Total Lessons</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-green-300' : 'text-green-800'}`}>24+</div>
              <div className={`text-xs ${isDark ? 'text-green-400' : 'text-green-600'}`}>Worksheets</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-purple-900/20' : 'bg-purple-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>5</div>
              <div className={`text-xs ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Subjects</div>
            </div>
            <div className={`text-center p-3 rounded-lg ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
              <div className={`text-2xl font-bold ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>✓</div>
              <div className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Ready-Made</div>
            </div>
          </div>
          <div className={`mt-4 p-3 rounded-lg border-l-4 border-green-500 ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
            <p className={`text-sm ${isDark ? 'text-green-300' : 'text-green-800'}`}>
              ✅ All lessons include: step-by-step instructions, downloadable worksheets, assessment tools, and parent guidance
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Create Homework Assignment */}
          <button
            onClick={() => setShowHomeworkAssignment(true)}
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md text-left ${
              isDark ? 'bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-700 hover:border-indigo-600' : 'bg-gradient-to-r from-indigo-100 to-purple-100 border-indigo-200 hover:border-indigo-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📝</div>
              <FaPlus className={`text-2xl ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Homework
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Create and assign homework to individual students or entire classes
            </p>
            <div className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
              Create Homework <FaArrowRight className="ml-2 w-4 h-4" />
            </div>
          </button>
          {/* Lesson Library */}
          <button
            onClick={() => setShowLessonLibrary(true)}
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md text-left ${
              isDark ? 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700 hover:border-purple-600' : 'bg-gradient-to-r from-purple-100 to-blue-100 border-purple-200 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🌟</div>
              <FaLightbulb className={`text-2xl ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Interactive Lesson Library
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Browse and assign engaging interactive lessons to your classes
            </p>
            <div className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
              Explore Lessons <FaArrowRight className="ml-2 w-4 h-4" />
            </div>
          </button>
          {/* AI Grading Panel */}
          <button
            onClick={() => setShowAIGrading(true)}
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md text-left ${
              isDark ? 'bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border-blue-700 hover:border-blue-600' : 'bg-gradient-to-r from-blue-100 to-cyan-100 border-blue-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">🤖</div>
              <FaRobot className={`text-2xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              AI Grading Assistant
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Automatically grade assignments with detailed feedback and analysis
            </p>
            <div className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              Grade Work <FaArrowRight className="ml-2 w-4 h-4" />
            </div>
            {stats.pendingGrading > 0 && (
              <div className={`mt-2 px-2 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-800'}`}>
                {stats.pendingGrading} pending
              </div>
            )}
          </button>

          {/* Parent Communication */}
          <button
            onClick={() => setShowParentComm(true)}
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md text-left ${
              isDark ? 'bg-gradient-to-r from-green-900/20 to-emerald-900/20 border-green-700 hover:border-green-600' : 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-200 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">👨‍👩‍👧‍👦</div>
              <FaComments className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Parent Communication
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Share graded work and generate progress reports for parents
            </p>
            <div className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Communicate <FaArrowRight className="ml-2 w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Enhanced Feature Cards Grid - Teacher Specific */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mark Register */}
          <Link
            to="/class-register"
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
              isDark ? 'bg-blue-800 border-blue-700 hover:bg-blue-750' : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            <div className="text-center text-white">
              <FaGraduationCap className="text-2xl mx-auto mb-2" />
              <div className="text-lg font-bold">{classes.length > 0 ? classes[0].name : 'Class'}</div>
              <div className="text-xs opacity-90">My Class</div>
              <div className="text-xs opacity-75 mt-1">Mark Register</div>
            </div>
          </Link>

          {/* View Students */}
          <Link
            to="/children"
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
              isDark ? 'bg-green-800 border-green-700 hover:bg-green-750' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            <div className="text-center text-white">
              <FaUsers className="text-2xl mx-auto mb-2" />
              <div className="text-lg font-bold">{stats.students}</div>
              <div className="text-xs opacity-90">Children</div>
              <div className="text-xs opacity-75 mt-1">View Children</div>
            </div>
          </Link>

          {/* View Assignments */}
          <Link
            to="/homework"
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
              isDark ? 'bg-purple-800 border-purple-700 hover:bg-purple-750' : 'bg-purple-500 hover:bg-purple-600'
            }`}
          >
            <div className="text-center text-white">
              <FaBook className="text-2xl mx-auto mb-2" />
              <div className="text-lg font-bold">{stats.assignments}</div>
              <div className="text-xs opacity-90">Assignments</div>
              <div className="text-xs opacity-75 mt-1">Manage homework</div>
            </div>
          </Link>

          {/* Activities */}
          <Link
            to="/activities"
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
              isDark ? 'bg-orange-800 border-orange-700 hover:bg-orange-750' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <div className="text-center text-white">
              <FaRobot className="text-2xl mx-auto mb-2" />
              <div className="text-lg font-bold">{stats.completedAssignments}</div>
              <div className="text-xs opacity-90">Activities</div>
              <div className="text-xs opacity-75 mt-1">Interactive lessons</div>
            </div>
          </Link>
        </div>

        {/* Class Overview */}
        <div className={`p-4 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Classes</h3>
          
          {classes.length === 0 ? (
            <div className="text-center py-8">
              <FaGraduationCap className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No classes assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {classes.map((classItem) => (
                <div key={classItem.id} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{classItem.name}</h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {classItem.student_count || 15} students
                      </p>
                    </div>
                    <Link
                      to={`/classes`}
                      className={`text-sm font-medium ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Homework Assignment Modal */}
      {showHomeworkAssignment && (
        <NewHomeworkAssignment
          onClose={() => setShowHomeworkAssignment(false)}
          onHomeworkCreated={handleHomeworkCreated}
        />
      )}
    </div>
  );
};

export default TeacherDashboard;
