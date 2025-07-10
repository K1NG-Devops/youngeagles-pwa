import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { useNavigate } from 'react-router-dom';
import { 
  FaGraduationCap, 
  FaUsers, 
  FaChalkboardTeacher, 
  FaArrowLeft, 
  FaSpinner,
  FaExclamationTriangle 
} from 'react-icons/fa';
import Header from '../components/Header';

const Classes = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classChildren, setClassChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingChildren, setIsLoadingChildren] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        console.log('🎓 Fetching classes data...');
        
        const response = await apiService.classes.getAll();
        console.log('📚 Classes response:', response.data);
        
        const classesData = response.data.classes || response.data || [];
        setClasses(classesData);
        
        if (classesData.length === 0) {
          nativeNotificationService.info('No classes found in the system');
        } else {
          console.log(`✅ Loaded ${classesData.length} classes`);
        }
      } catch (error) {
        console.error('❌ Error fetching classes:', error);
        const errorMsg = error.response?.data?.message || error.message || 'Failed to load classes data';
        
        // Mock data for demo purposes if API fails
        if (error.response?.status === 404 || error.code === 'ECONNREFUSED' || !error.response) {
          console.log('🔧 Using mock data for classes');
          const mockClasses = [
            {
              id: 1,
              class_name: 'Grade 3A',
              description: 'Primary school class for 8-9 year olds',
              teacher_name: user?.role === 'teacher' ? user.name : 'Ms. Johnson',
              capacity: 25,
              age_group: '8-9 years',
              student_count: 18
            },
            {
              id: 2,
              class_name: 'Grade 4B',
              description: 'Primary school class for 9-10 year olds',
              teacher_name: user?.role === 'teacher' ? user.name : 'Mr. Williams',
              capacity: 28,
              age_group: '9-10 years',
              student_count: 22
            },
            {
              id: 3,
              class_name: 'Grade 5C',
              description: 'Primary school class for 10-11 year olds',
              teacher_name: user?.role === 'teacher' ? user.name : 'Mrs. Davis',
              capacity: 30,
              age_group: '10-11 years',
              student_count: 15
            }
          ];
          
          // Filter classes for teachers - show only their class
          if (user?.role === 'teacher') {
            const teacherClass = mockClasses.find(cls => cls.teacher_name === user.name) || mockClasses[0];
            teacherClass.teacher_name = user.name;
            setClasses([teacherClass]);
            nativeNotificationService.info(`Using demo data - showing your class: ${teacherClass.class_name}`);
          } else {
            setClasses(mockClasses);
            nativeNotificationService.info(`Using demo data - ${mockClasses.length} sample classes`);
          }
        } else {
          nativeNotificationService.error(errorMsg);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [user]);

  const handleViewClassChildren = async (classId, className) => {
    try {
      setIsLoadingChildren(true);
      // Navigate to the children view of the class
      navigate(`/classes/${classId}/children`);
    } finally {
      setIsLoadingChildren(false);
    }
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setClassChildren([]);
  };

  const handleViewClassDetails = (classItem) => {
    console.log('📋 Viewing class details for:', classItem);
    
    // Create a detailed modal or navigate to a details page
    const details = {
      name: classItem.class_name,
      description: classItem.description || 'No description available',
      teacher: classItem.teacher_name || 'No teacher assigned',
      capacity: classItem.capacity || 'Not specified',
      ageGroup: classItem.age_group || 'Not specified',
      studentCount: classItem.student_count || 0,
      id: classItem.id
    };

    // For now, show a detailed toast message
    // Navigate to the detailed class page
    navigate(`/classes/${classItem.id}/details`);
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FaSpinner className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading classes...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show class children view
  if (selectedClass) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="pt-24 pb-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
            <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Children in {selectedClass}
                  </h2>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total: {classChildren.length} children
                  </p>
                </div>
                <button 
                  onClick={handleBackToClasses}
                  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-600' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-300'
                  }`}
                >
                  <FaArrowLeft className="w-4 h-4 mr-2" />
                  Back to Classes
                </button>
              </div>
            </div>

            {isLoadingChildren ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FaSpinner className="animate-spin h-8 w-8 text-blue-500 mx-auto mb-4" />
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading children...</p>
                </div>
              </div>
            ) : classChildren.length === 0 ? (
              <div className={`p-8 rounded-xl shadow-sm border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                <FaUsers className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
                <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No children found in this class.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classChildren.map((child) => (
                  <div key={child.id} className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                        <FaUsers className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {child.first_name} {child.last_name}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span className="font-medium">Age:</span> {child.age || 'Not specified'}
                      </p>
                      {child.parent_name && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="font-medium">Parent:</span> {child.parent_name}
                        </p>
                      )}
                      {child.emergency_contact && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          <span className="font-medium">Emergency Contact:</span> {child.emergency_contact}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show classes list
  if (classes.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <Header />
        <div className="pt-24 pb-4">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className={`p-8 rounded-xl shadow-sm border text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
              <FaExclamationTriangle className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Classes Found</h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>No classes are currently available in the system.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <Header />
      <div className="pt-24 pb-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
          {/* Header Section */}
          <div className={`p-6 rounded-xl shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                <FaGraduationCap className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <div className="ml-3">
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Classes</h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total: {classes.length} classes</p>
              </div>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div key={classItem.id} className={`p-6 rounded-xl shadow-sm border transition-all hover:shadow-md ${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                {/* Class Header */}
                <div className="flex items-center mb-4">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/20' : 'bg-green-100'}`}>
                    <FaChalkboardTeacher className={`w-6 h-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                  </div>
                  <div className="ml-3">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {classItem.class_name}
                    </h3>
                  </div>
                </div>
                
                {/* Class Details */}
                <div className="space-y-3 mb-6">
                  {classItem.description && (
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Description:</span> {classItem.description}
                    </p>
                  )}
                  {classItem.teacher_name && (
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Teacher:</span> {classItem.teacher_name}
                    </p>
                  )}
                  {classItem.capacity && (
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Capacity:</span> {classItem.capacity} students
                    </p>
                  )}
                  {classItem.age_group && (
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <span className="font-medium">Age Group:</span> {classItem.age_group}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {(user?.role === 'teacher' || user?.role === 'admin') && (
                    <button 
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
                      onClick={() => handleViewClassChildren(classItem.id, classItem.class_name)}
                    >
                      <FaUsers className="w-4 h-4 mr-2" />
                      View Children
                    </button>
                  )}
                  <button 
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors border ${
                      isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white' 
                             : 'border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    onClick={() => handleViewClassDetails(classItem)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Classes;

