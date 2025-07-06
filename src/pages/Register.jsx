import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../hooks/useTheme';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaUsers,
  FaSave,
  FaClock,
  FaExclamationTriangle,
  FaSpinner,
  FaChevronDown
} from 'react-icons/fa';

const Register = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [className, setClassName] = useState('');
  const [teacherClass, setTeacherClass] = useState(null);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [error, setError] = useState(null);

  // Load teacher's class and students
  useEffect(() => {
    const loadClassData = async () => {
      if (!user || user.role !== 'teacher') {
        setError('Access denied: Teacher account required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get teacher's classes
        console.log(`🔍 Fetching classes for logged-in teacher ID: ${user.id}`);
        console.log('🔐 Current user:', user);
        const classesResponse = await apiService.classes.getByTeacher(user.id);
        console.log('📋 Full classes response:', classesResponse.data);
        const classes = classesResponse.data.classes || [];
        console.log(`📚 Found ${classes.length} classes for teacher ${user.id}:`, classes);

        if (classes.length === 0) {
          console.log('⚠️ No classes assigned to teacher, trying attendance API as fallback...');

          // Try to get students from attendance API even without assigned classes
          try {
            const attendanceResponse = await apiService.attendance.getByClass(selectedDate);
            console.log('🔍 Attendance fallback response:', attendanceResponse.data);

            if (attendanceResponse.data.success && attendanceResponse.data.students && attendanceResponse.data.students.length > 0) {
              console.log(`✅ Found ${attendanceResponse.data.students.length} students in attendance API for teacher ${user.id}`);

              // Create a virtual class from attendance data
              const virtualClass = {
                id: attendanceResponse.data.classId || 1,
                name: attendanceResponse.data.className || 'My Class',
                student_count: attendanceResponse.data.totalStudents || attendanceResponse.data.students.length
              };

              setTeacherClasses([virtualClass]);
              setTeacherClass(virtualClass);
              setClassName(virtualClass.name);
              setSelectedClassId(virtualClass.id);

              // Map students from attendance API
              const attendanceStudents = attendanceResponse.data.students.map(student => ({
                id: student.id,
                name: student.name || `Student ${student.id}`,
                gender: student.gender || 'unknown',
                avatar: student.gender === 'female' ? '👧' : student.gender === 'male' ? '👦' : '👤'
              }));

              console.log('👥 Using attendance students:', attendanceStudents);
              setStudents(attendanceStudents);
              await loadAttendanceForDate(virtualClass.id, selectedDate, attendanceStudents);
              setIsLoading(false);
              return;
            } else {
              console.log('❌ No students found in attendance API either');
            }
          } catch (attendanceError) {
            console.error('❌ Error checking attendance API fallback:', attendanceError);
          }

          setError('No classes or students assigned to this teacher');
          setIsLoading(false);
          return;
        }

        // Store all teacher's classes
        setTeacherClasses(classes);

        // Use the first class as default or previously selected class
        const currentClass = selectedClassId
          ? classes.find(c => c.id === selectedClassId) || classes[0]
          : classes[0];
        setTeacherClass(currentClass);
        setClassName(currentClass.name);
        setSelectedClassId(currentClass.id);

        // Get students in this class
        console.log(`👥 Fetching students for class ${currentClass.id} (${currentClass.name})`);
        const studentsResponse = await apiService.classes.getChildren(currentClass.id);
        console.log('🔍 Full students response:', studentsResponse.data);
        console.log('🔍 Students API status:', studentsResponse.status);
        console.log('🔍 Students API URL called:', `/api/classes/${currentClass.id}/children`);
        console.log('🔍 Students response headers:', studentsResponse.headers);
        console.log('🔍 Raw students data structure:', JSON.stringify(studentsResponse.data, null, 2));

        const classStudents = studentsResponse.data.children || [];
        console.log('👥 Class students array:', classStudents);
        console.log('📊 Number of students found:', classStudents.length);

        // If no students found in classes API, try to get them from attendance API
        if (classStudents.length === 0) {
          console.log('⚠️ No students found in classes API, trying attendance API...');
          try {
            const attendanceResponse = await apiService.attendance.getByClass(selectedDate);
            if (attendanceResponse.data.success && attendanceResponse.data.students) {
              console.log('✅ Found students in attendance API:', attendanceResponse.data.students.length);
              const attendanceStudents = attendanceResponse.data.students.map(student => ({
                id: student.id,
                name: student.name || `Student ${student.id}`,
                gender: student.gender || 'unknown',
                avatar: student.gender === 'female' ? '👧' : student.gender === 'male' ? '👦' : '👤'
              }));
              setStudents(attendanceStudents);
              await loadAttendanceForDate(currentClass.id, selectedDate, attendanceStudents);
              return;
            }
          } catch (error) {
            console.error('Error fetching from attendance API:', error);
          }
        }

        // Use students from classes API if available
        const studentsWithAvatars = classStudents.map(student => ({
          ...student,
          avatar: student.gender === 'female' ? '👧' : student.gender === 'male' ? '👦' : '👤'
        }));

        console.log('✨ Students with avatars:', studentsWithAvatars);
        setStudents(studentsWithAvatars);

        // Load existing attendance for the selected date
        await loadAttendanceForDate(currentClass.id, selectedDate, studentsWithAvatars);

      } catch (error) {
        console.error('Error loading class data:', error);
        setError(error.response?.data?.message || 'Failed to load class data');
        toast.error('Failed to load class data');
      } finally {
        setIsLoading(false);
      }
    };

    loadClassData();
  }, [user]);

  // Load attendance when date changes
  useEffect(() => {
    if (teacherClass && students.length > 0) {
      loadAttendanceForDate(teacherClass.id, selectedDate, students);
    }
  }, [selectedDate, teacherClass, students.length]);

  // Load attendance for a specific date using the live backend API
  const loadAttendanceForDate = async (classId, date, classStudents) => {
    console.log(`📋 Loading attendance for class ${classId} on ${date}`);

    try {
      // Use the live backend API to get attendance data
      const response = await apiService.attendance.getByClass(date);
      const attendanceData = response.data;

      console.log('🔍 Attendance API response:', attendanceData);

      if (attendanceData.success && attendanceData.students) {
        // Create attendance object from API response
        const attendanceMap = {};
        attendanceData.students.forEach(student => {
          attendanceMap[student.id] = student.attendance_status || 'present';
        });

        console.log('✅ Loaded attendance from live API:', attendanceMap);
        setAttendance(attendanceMap);
        return;
      }
    } catch (error) {
      console.error('Error loading attendance from API:', error);
      console.log('⚠️ Falling back to default attendance');
    }

    // Fallback: Initialize with default 'present' status
    const defaultAttendance = {};
    classStudents.forEach(student => {
      defaultAttendance[student.id] = 'present';
    });

    console.log('🆕 Using default attendance as fallback');
    setAttendance(defaultAttendance);
  };

  // Handle class selection change
  const handleClassChange = async (classId) => {
    if (!classId || classId === selectedClassId) return;

    try {
      setIsLoading(true);
      setSelectedClassId(parseInt(classId));

      // Find the selected class
      const selectedClass = teacherClasses.find(cls => cls.id === parseInt(classId));
      if (!selectedClass) return;

      setTeacherClass(selectedClass);
      setClassName(selectedClass.name);

      // Get students in the selected class
      const studentsResponse = await apiService.classes.getChildren(selectedClass.id);
      const classStudents = studentsResponse.data.children || [];

      // Add avatar based on gender or use default
      const studentsWithAvatars = classStudents.map(student => ({
        ...student,
        avatar: student.gender === 'female' ? '👧' : student.gender === 'male' ? '👦' : '👤'
      }));

      setStudents(studentsWithAvatars);

      // Load attendance for the current date and new class
      await loadAttendanceForDate(selectedClass.id, selectedDate, studentsWithAvatars);

    } catch (error) {
      console.error('Error changing class:', error);
      toast.error('Failed to load class data');
    } finally {
      setIsLoading(false);
    }
  };

  const markAttendance = (studentId, status) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    if (!teacherClass) {
      toast.error('No class selected');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare attendance data for bulk mark API
      const attendanceRecords = students.map(student => ({
        childId: student.id,
        status: attendance[student.id] || 'present',
        notes: null // You can add notes functionality later
      }));

      console.log('📤 Saving attendance for', attendanceRecords.length, 'students');
      console.log('📅 Date:', selectedDate);
      console.log('📝 Records:', attendanceRecords);

      // Save attendance using the live bulk mark API
      const response = await apiService.attendance.bulkMark(selectedDate, attendanceRecords);
      console.log('✅ Attendance saved successfully:', response.data);

      const presentCount = Object.values(attendance).filter(status => status === 'present').length;
      const absentCount = Object.values(attendance).filter(status => status === 'absent').length;
      const lateCount = Object.values(attendance).filter(status => status === 'late').length;

      toast.success(
        `Attendance saved! ${presentCount} present, ${absentCount} absent, ${lateCount} late`
      );

      // Reload attendance data to reflect saved changes
      await loadAttendanceForDate(teacherClass.id, selectedDate, students);

    } catch (error) {
      console.error('Error saving attendance:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to save attendance';
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceStats = () => {
    const total = students.length;
    const present = Object.values(attendance).filter(status => status === 'present').length;
    const absent = Object.values(attendance).filter(status => status === 'absent').length;
    const late = Object.values(attendance).filter(status => status === 'late').length;

    return { total, present, absent, late };
  };

  const stats = getAttendanceStats();

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading class register...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <FaExclamationTriangle className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Access Error
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <FaUsers className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h2 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            No Students Found
          </h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            This class doesn't have any students enrolled yet.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen mt-20 rounded-lg ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-4`}>
      <div className="p-4 space-y-6 pb-4">
        <div className={`p-4 border-b rounded-xl sticky top-0 z-10 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className={`inline-flex items-center px-3 py-2 rounded-lg transition-colors ${isDark
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>

            <div className="text-center">
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Class Register
              </h1>
              {teacherClasses.length > 1 ? (
                <div className="flex items-center justify-center mt-2">
                  <select
                    value={selectedClassId || ''}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className={`px-3 py-1 rounded-lg border text-sm ${isDark
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                      }`}
                  >
                    {teacherClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                  <FaChevronDown className={`w-3 h-3 ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
                </div>
              ) : (
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {className}
                </p>
              )}
            </div>

            <button
              onClick={handleSaveAttendance}
              disabled={isSaving}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${isSaving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
          </div>
        </div>

        {/* Date Selection */}
        <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FaCalendarAlt className={`w-5 h-5 mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <div>
                <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Attendance Date
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Select the date to mark attendance
                </p>
              </div>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
                }`}
            />
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                <FaUsers className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.total}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
                <FaCheck className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.present}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Present</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-red-900/20' : 'bg-red-100'}`}>
                <FaTimes className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.absent}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Absent</p>
              </div>
            </div>
          </div>

          <div className={`p-4 rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-100'}`}>
                <FaClock className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
              </div>
              <div className="ml-3">
                <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {stats.late}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Late</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className={`rounded-xl border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Mark Attendance
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Tap on students to mark their attendance status
            </p>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 gap-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className={`p-4 rounded-lg border transition-all ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-2xl mr-3">{student.avatar}</div>
                      <div>
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {student.name}
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Student ID: {student.id.toString().padStart(3, '0')}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => markAttendance(student.id, 'present')}
                        className={`p-2 rounded-lg transition-colors ${attendance[student.id] === 'present'
                            ? 'bg-green-600 text-white'
                            : isDark
                              ? 'bg-gray-600 text-gray-300 hover:bg-green-600 hover:text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-green-600 hover:text-white'
                          }`}
                      >
                        <FaCheck className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => markAttendance(student.id, 'late')}
                        className={`p-2 rounded-lg transition-colors ${attendance[student.id] === 'late'
                            ? 'bg-yellow-600 text-white'
                            : isDark
                              ? 'bg-gray-600 text-gray-300 hover:bg-yellow-600 hover:text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-yellow-600 hover:text-white'
                          }`}
                      >
                        <FaClock className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => markAttendance(student.id, 'absent')}
                        className={`p-2 rounded-lg transition-colors ${attendance[student.id] === 'absent'
                            ? 'bg-red-600 text-white'
                            : isDark
                              ? 'bg-gray-600 text-gray-300 hover:bg-red-600 hover:text-white'
                              : 'bg-gray-200 text-gray-600 hover:bg-red-600 hover:text-white'
                          }`}
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
