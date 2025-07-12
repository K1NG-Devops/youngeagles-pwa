import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import {
  FaBook,
  FaClock,
  FaCheckCircle,
  FaExclamationCircle,
  FaChild,
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaEye,
  FaUpload,
  FaDownload,
  FaSpinner,
  FaGamepad,
  FaArrowLeft
} from 'react-icons/fa';
import { HeaderAd, ContentMiddleAd, SidebarAd, ContentBottomAd } from '../components/ads';

const Homework = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [homework, setHomework] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    submitted: 0,
    overdue: 0
  });
  const [, setAllTeacherHomework] = useState([]);

  useEffect(() => {
    const fetchHomework = async () => {
      try {
        setIsLoading(true);
        
        if (user.role === 'teacher') {
          // For teachers, get homework assigned by them and their students
          console.log(`🏫 Loading homework for teacher: ${user.name} (ID: ${user.id})`);
          
          try {
            // Get teacher's classes and students
            const classesResponse = await apiService.classes.getByTeacher(user.id);
            const teacherClasses = classesResponse.data.classes || [];
            console.log(`📚 Teacher has ${teacherClasses.length} classes:`, teacherClasses);
            
            // Get all students from teacher's classes
            let allStudents = [];
            for (const cls of teacherClasses) {
              try {
                const studentsResponse = await apiService.classes.getChildren(cls.id);
                const classStudents = studentsResponse.data.children || [];
                allStudents = [...allStudents, ...classStudents];
              } catch (error) {
                console.error(`Error getting students for class ${cls.id}:`, error);
              }
            }
            
            // If no students found in classes API, try attendance API
            if (allStudents.length === 0) {
              console.log('⚠️ No students found in classes API, trying attendance API...');
              try {
                const attendanceResponse = await apiService.attendance.getByClass();
                if (attendanceResponse.data.success && attendanceResponse.data.students) {
                  allStudents = attendanceResponse.data.students.map(student => ({
                    id: student.id,
                    first_name: student.name ? student.name.split(' ')[0] : 'Student',
                    last_name: student.name ? student.name.split(' ').slice(1).join(' ') : `${student.id}`,
                    class_name: attendanceResponse.data.className || 'My Class'
                  }));
                  console.log(`✅ Found ${allStudents.length} students from attendance API`);
                }
              } catch (attendanceError) {
                console.error('Error getting students from attendance API:', attendanceError);
              }
            }
            
            console.log(`👥 Total students found: ${allStudents.length}`);
            setChildren(allStudents);
            
            // Get homework assigned by this teacher
            const homeworkResponse = await apiService.homework.getByTeacher(user.id);
            const teacherHomework = homeworkResponse.data.homework || [];
            
            console.log(`📋 Found ${teacherHomework.length} homework assignments:`, teacherHomework);
            
            // Store all homework for local filtering
            setAllTeacherHomework(teacherHomework);

            // For teachers, show all homework created by them
            setHomework(teacherHomework);

            // Calculate stats
            const now = new Date();
            const stats = {
              total: teacherHomework.length,
              pending: teacherHomework.filter(h => h.status === 'assigned' || h.status === 'pending').length,
              submitted: teacherHomework.filter(h => h.status === 'submitted').length,
              overdue: teacherHomework.filter(h => 
                (h.status === 'assigned' || h.status === 'pending') && new Date(h.due_date) < now
              ).length
            };
            setStats(stats);
            
            // Set first student as default if none selected and students exist
            if (!selectedChildId && allStudents.length > 0) {
              setSelectedChildId(allStudents[0].id);
            }
            
          } catch (teacherError) {
            console.error('Error fetching teacher homework data:', teacherError);
            // Show empty state for teachers when API is not available
            setChildren([]);
            setHomework([]);
            setStats({ total: 0, pending: 0, submitted: 0, overdue: 0 });
          }
          
        } else {
          // For parents, use proper API method
          console.log(`👨‍👩‍👧‍👦 Loading homework for parent: ${user.name} (ID: ${user.id})`);
          
          try {
            const response = await apiService.homework.getByParent(user.id, selectedChildId);
            const homeworkData = response.data.homework || [];
            setHomework(homeworkData);
            setChildren(response.data.children || []);
            
            console.log(`📋 Found ${homeworkData.length} homework assignments for parent:`, homeworkData);
            
            // Calculate stats (include graded as submitted)
            const now = new Date();
            const stats = {
              total: homeworkData.length,
              pending: homeworkData.filter(h => h.status === 'pending').length,
              submitted: homeworkData.filter(h => h.status === 'submitted' || h.status === 'graded').length,
              overdue: homeworkData.filter(h => 
                h.status === 'pending' && new Date(h.due_date) < now
              ).length
            };
            setStats(stats);
            
            // Set first child as default if none selected
            if (!selectedChildId && response.data.children?.length > 0) {
              setSelectedChildId(response.data.children[0].id);
            }
          } catch (parentError) {
            console.error('Error fetching parent homework data:', parentError);
            // Try alternative endpoint if the first one fails
            try {
              console.log('🔄 Trying alternative endpoint for parent homework...');
              const alternativeResponse = await apiService.get(`/api/homework/parent/${user.id}${selectedChildId ? `?childId=${selectedChildId}` : ''}`);
              const homeworkData = alternativeResponse.data.homework || [];
              setHomework(homeworkData);
              setChildren(alternativeResponse.data.children || []);
              
              console.log(`📋 Found ${homeworkData.length} homework assignments via alternative endpoint:`, homeworkData);
            } catch (altError) {
              console.error('Error with alternative endpoint:', altError);
              setHomework([]);
              setChildren([]);
            }
          }
        }
        
      } catch (error) {
        console.error('Error fetching homework:', error);
        nativeNotificationService.error('Failed to load homework assignments');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchHomework();
    }
  }, [user, refreshTrigger, selectedChildId]);


  const getStatusColor = (status, dueDate) => {
    const now = new Date();
    const isOverdue = new Date(dueDate) < now && status === 'pending';
    
    if (status === 'submitted' || status === 'graded') {
      return isDark 
        ? 'bg-green-900/20 text-green-400 border-green-800' 
        : 'bg-green-100 text-green-800 border-green-200';
    } else if (isOverdue) {
      return isDark 
        ? 'bg-red-900/20 text-red-400 border-red-800' 
        : 'bg-red-100 text-red-800 border-red-200';
    } else {
      return isDark 
        ? 'bg-yellow-900/20 text-yellow-400 border-yellow-800' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };


  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-500 mx-auto mb-4" />
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>Loading homework assignments...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={`max-w-4xl mx-auto p-6 min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`rounded-lg shadow-sm p-8 text-center border ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <FaChild className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Children Found</h2>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>You don't have any children registered in the system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-8`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header Ad - High visibility */}
        <HeaderAd />
        

        {/* Back Button */}
        <div className="pt-4 mb-4">
          <button
            onClick={() => navigate(-1)}
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
        
        {/* Header */}
        <div className="mb-6">
          <h1 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            📚 Homework Dashboard
          </h1>
          <p className={`text-sm sm:text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {user.role === 'teacher' 
              ? 'View and manage homework assignments for your students'
              : 'View and manage your children\'s homework assignments'
            }
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className={`rounded-lg shadow-sm p-3 sm:p-4 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <FaBook className="text-lg sm:text-2xl text-blue-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.total}</p>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-sm p-3 sm:p-4 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <FaClock className="text-lg sm:text-2xl text-yellow-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.pending}</p>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Pending</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-sm p-3 sm:p-4 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <FaCheckCircle className="text-lg sm:text-2xl text-green-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.submitted}</p>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Submitted</p>
              </div>
            </div>
          </div>

          <div className={`rounded-lg shadow-sm p-3 sm:p-4 border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center">
              <FaExclamationCircle className="text-lg sm:text-2xl text-red-500 mr-2 sm:mr-3 flex-shrink-0" />
              <div className="min-w-0">
                <p className={`text-lg sm:text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stats.overdue}</p>
                <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Rectangle Ad - High engagement area */}
        <ContentMiddleAd />
        

        {/* Child/Student Selector */}
        <div className={`rounded-lg shadow-sm p-4 sm:p-6 border mb-6 sm:mb-8 ${
          isDark 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <FaChild className={`${isDark ? 'text-gray-400' : 'text-gray-500'} flex-shrink-0`} />
            <div className="flex-1 min-w-0">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2 block`}>
                {user.role === 'teacher' ? 'Select Student:' : 'Select Child:'}
              </label>
              <select 
                className={`form-select block w-full sm:max-w-xs rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-gray-700'
                }`}
                value={selectedChildId}
                onChange={(e) => setSelectedChildId(e.target.value)}
              >
                {children.map(child => (
                  <option key={child.id} value={child.id}>
                    {child.first_name} {child.last_name} - {child.class_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Homework List */}
        {homework.length === 0 ? (
          <div className={`rounded-lg shadow-sm p-8 text-center border ${
            isDark 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-white border-gray-200'
          }`}>
            <FaBook className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Homework Assignments
            </h3>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              There are currently no homework assignments for this child.
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {homework.map((assignment, index) => (
              <React.Fragment key={assignment.id}>
                <div 
                  className={`rounded-lg shadow-sm border p-4 sm:p-6 hover:shadow-md transition-shadow ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700' 
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-3 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-3">
                          <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'} break-words`}>
                            {assignment.title}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full self-start ${getStatusColor(assignment.status, assignment.due_date)}`}>
                            {assignment.status === 'graded' ? 'GRADED' : assignment.status.toUpperCase()}
                          </span>
                        </div>
                      
                        <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
                            <div className="flex items-center space-x-2">
                              <FaCalendarAlt className={`${isDark ? 'text-gray-400' : 'text-gray-400'} flex-shrink-0`} />
                              <span className="break-words">Due: {formatDate(assignment.due_date)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <FaChalkboardTeacher className={`${isDark ? 'text-gray-400' : 'text-gray-400'} flex-shrink-0`} />
                              <span className="break-words">{assignment.teacher_name}</span>
                            </div>
                          </div>

                          {assignment.description && (
                            <p className={`mt-4 ${isDark ? 'text-gray-300' : 'text-gray-700'} break-words`}>{assignment.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => navigate(`/homework/${assignment.id}/details?child_id=${selectedChildId}`)}
                        className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isDark 
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <FaEye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      
                      {(assignment.status === 'pending') && (
                        // Show different buttons based on homework type
                        assignment.content_type === 'interactive' || 
                        assignment.title.includes('Basic Addition') || 
                        assignment.title.includes('Counting') || 
                        assignment.title.includes('Number Recognition') ? (
                            <button
                              onClick={() => navigate(`/homework/${assignment.id}/details?child_id=${selectedChildId}`)}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <FaGamepad className="w-4 h-4 mr-2" />
                            Start Homework
                            </button>
                          ) : (
                            <button
                              onClick={() => navigate(`/submit-work?homework_id=${assignment.id}&child_id=${selectedChildId}`)}
                              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaUpload className="w-4 h-4 mr-2" />
                            Submit Work
                            </button>
                          )
                      )}
                    </div>
                  </div>

                  {(assignment.status === 'submitted' || assignment.status === 'graded') && (
                    <div className={`mt-6 p-4 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600' 
                        : 'bg-gray-50 border-gray-100'
                    }`}>
                      <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Submission Details</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Submitted:</span> {formatDate(assignment.submitted_at)}</p>
                        {assignment.grade && (
                          <p><span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Grade:</span> {assignment.grade}%</p>
                        )}
                        {assignment.teacher_feedback && (
                          <div className="mt-3">
                            <p className={`mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Teacher Feedback:</p>
                            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{assignment.teacher_feedback}</p>
                          </div>
                        )}
                        {assignment.status === 'graded' && (
                          <div className={`mt-3 p-2 rounded ${isDark ? 'bg-green-900/20' : 'bg-green-50'}`}>
                            <p className={`text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-800'}`}>
                              ✅ Graded and returned by teacher
                            </p>
                          </div>
                        )}
                      </div>
                    
                      {assignment.attachment_url && (
                        <a 
                          href={assignment.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center px-4 py-2 mt-4 text-sm font-medium rounded-lg transition-colors ${
                            isDark 
                              ? 'text-blue-400 bg-blue-900/20 hover:bg-blue-800/30' 
                              : 'text-blue-700 bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <FaDownload className="mr-2" />
                          View Submission
                        </a>
                      )}
                    </div>
                  )}

                  {assignment.status === 'submitted' && !assignment.grade && (
                    <p className={`mt-4 text-sm italic ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Waiting for teacher's review
                    </p>
                  )}
                </div>

                {/* Ads removed */}
              </React.Fragment>
            ))}
          </div>
        )}
        <ContentBottomAd />
      </div>
    </div>
  );
};

export default Homework; 