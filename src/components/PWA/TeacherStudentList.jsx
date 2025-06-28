import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGraduationCap, FaSearch, FaFilter } from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';
import API_CONFIG from '../../config/api';

const TeacherStudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClass, setFilterClass] = useState('all');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch(`${API_CONFIG.getApiUrl()}/api/auth/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched students:', data); // Debug log
        if (data && Array.isArray(data.children)) {
          setStudents(data.children);
        } else {
          console.error('Invalid response format:', data);
          showTopNotification('Invalid response format from server', 'error');
        }
      } else {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        showTopNotification(errorData.message || 'Failed to fetch students', 'error');
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      showTopNotification('Error fetching students', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.className === filterClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(students.map(student => student.className))];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">My Students</h1>
      <p className="text-gray-600 mb-6">Manage and view information about your students</p>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Classes</option>
              {classes.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading students...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <FaUser className="text-2xl text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
          <p className="text-gray-600 mt-1">
            {searchTerm || filterClass !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'No students assigned to your classes yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map(student => (
            <div key={student.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <FaUser className="text-blue-600 text-xl" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">{student.name}</h3>
                  <p className="text-sm text-gray-500">{student.className}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <FaGraduationCap className="mr-2" />
                  <span>Age: {student.age} years</span>
                </div>
                {student.parent_id && (
                  <div className="flex items-center text-gray-600">
                    <FaUser className="mr-2" />
                    <span>Parent ID: {student.parent_id}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherStudentList; 