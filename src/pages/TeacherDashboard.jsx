import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { Link } from 'react-router-dom';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';
import LessonLibrary from '../components/LessonLibrary';
import { 
  FaBook, 
  FaUsers, 
  FaGraduationCap, 
  FaChartLine, 
  FaPlus,
  FaBell,
  FaTasks,
  FaLightbulb,
  FaArrowRight
} from 'react-icons/fa';
import Header from '../components/Header';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    classes: 0,
    students: 0,
    assignments: 0,
    pending: 0
  });
  const [classes, setClasses] = useState([]);
  const [showLessonLibrary, setShowLessonLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
        
        // Fetch homework assignments by teacher
        try {
          const homeworkResponse = await apiService.homework.getByTeacher(user.id);
          const homework = homeworkResponse.data.homework || [];
          
          setStats({
            classes: Math.max(teacherClasses.length, studentCount > 0 ? 1 : 0),
            students: studentCount,
            assignments: homework.length,
            pending: homework.filter(hw => hw.status === 'assigned').length
          });
        } catch {
          // Use empty data when homework API is not available
          setStats({
            classes: Math.max(teacherClasses.length, studentCount > 0 ? 1 : 0),
            students: studentCount,
            assignments: 0,
            pending: 0
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
  }, [user]);

  const handleAssignHomework = async (homeworkData) => {
    try {
      await apiService.homework.create(homeworkData);
      toast.success(`Lesson "${homeworkData.title}" assigned successfully!`);
      
      // Refresh stats
      setStats(prev => ({
        ...prev,
        assignments: prev.assignments + 1,
        pending: prev.pending + homeworkData.classes.length
      }));
    } catch (error) {
      console.error('Error assigning homework:', error);
      throw error; // Re-throw to let LessonLibrary handle the error
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

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white mt-20">
        <div className="max-w-6xl mx-auto py-6">
          <h2 className="text-xl font-bold mb-1">Welcome back, {user?.name}!</h2>
          <p className="text-green-100 text-sm">Manage your classes and create engaging lessons</p>
          {/* Display teacher's class name if they have one */}
          {classes.length > 0 && (
            <div className="mt-3 bg-white/10 rounded-lg p-3">
              <p className="text-sm font-medium">Your Class:</p>
              <p className="text-lg font-bold">{classes[0].name}</p>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 pb-28">
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

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Create Assignment */}
          <Link
            to="/homework"
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
              isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-100 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-4xl">📝</div>
              <FaPlus className={`text-2xl ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Assignment
            </h3>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Create custom homework assignments for your students
            </p>
            <div className={`inline-flex items-center text-sm font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              Get Started <FaArrowRight className="ml-2 w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Mark Register */}
          <Link
            to="/register"
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
              <div className="text-xs opacity-90">Students</div>
              <div className="text-xs opacity-75 mt-1">View all students</div>
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

          {/* Reports */}
          <button
            onClick={() => toast.info('Reports feature coming soon!')}
            className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${
              isDark ? 'bg-orange-800 border-orange-700 hover:bg-orange-750' : 'bg-orange-500 hover:bg-orange-600'
            }`}
          >
            <div className="text-center text-white">
              <FaChartLine className="text-2xl mx-auto mb-2" />
              <div className="text-lg font-bold">View</div>
              <div className="text-xs opacity-90">Reports</div>
              <div className="text-xs opacity-75 mt-1">Student progress</div>
            </div>
          </button>
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
                      to={`/classes/${classItem.id}`}
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
    </div>
  );
};

export default TeacherDashboard;
