import React, { useState, useEffect } from 'react';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaGraduationCap, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
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
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      const response = await fetch(`${API_CONFIG.getApiUrl()}/children/teacher/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      } else {
        // Mock data for now
        setStudents([
          {
            id: 1,
            name: 'Emma Johnson',
            age: 5,
            className: 'Panda Class',
            parent_name: 'Sarah Johnson',
            parent_email: 'parent@test.com',
            parent_phone: '+27 123 456 789',
            enrollment_date: '2024-01-15',
            attendance_rate: 95,
            homework_completion: 88
          },
          {
            id: 2,
            name: 'Liam Johnson',
            age: 3,
            className: 'Curious Cubs',
            parent_name: 'Sarah Johnson',
            parent_email: 'parent@test.com',
            parent_phone: '+27 123 456 789',
            enrollment_date: '2024-02-01',
            attendance_rate: 92,
            homework_completion: 75
          },
          {
            id: 3,
            name: 'Sophia Davis',
            age: 6,
            className: 'Panda Class',
            parent_name: 'Michael Davis',
            parent_email: 'parent2@test.com',
            parent_phone: '+27 987 654 321',
            enrollment_date: '2023-09-01',
            attendance_rate: 98,
            homework_completion: 95
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parent_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = filterClass === 'all' || student.className === filterClass;
    return matchesSearch && matchesClass;
  });

  const classes = [...new Set(students.map(s => s.className))];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Students</h1>
          <p className="text-gray-600">Manage and view information about your students</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students or parents..."
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
        <div className="space-y-4">
          {filteredStudents.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <FaUser className="mx-auto text-4xl text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterClass !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No students assigned to your classes yet'}
              </p>
            </div>
          ) : (
            filteredStudents.map(student => (
              <div key={student.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <FaUser className="text-blue-600 text-lg" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 space-x-4">
                          <span>Age: {student.age}</span>
                          <span className="flex items-center">
                            <FaGraduationCap className="mr-1" />
                            {student.className}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Parent Information</h4>
                        <div className="space-y-1 text-gray-600">
                          <div className="flex items-center">
                            <FaUser className="mr-2 text-gray-400" />
                            {student.parent_name}
                          </div>
                          <div className="flex items-center">
                            <FaEnvelope className="mr-2 text-gray-400" />
                            {student.parent_email}
                          </div>
                          <div className="flex items-center">
                            <FaPhone className="mr-2 text-gray-400" />
                            {student.parent_phone}
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Performance</h4>
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Attendance</span>
                              <span>{student.attendance_rate}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${student.attendance_rate}%` }}
                              ></div>
                            </div>
                          </div>
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Homework</span>
                              <span>{student.homework_completion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${student.homework_completion}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 lg:mt-0 lg:ml-6 flex flex-col space-y-2">
                    <div className="text-sm text-gray-500 flex items-center">
                      <FaCalendarAlt className="mr-2" />
                      Enrolled: {new Date(student.enrollment_date).toLocaleDateString()}
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm hover:bg-green-200 transition-colors">
                        Message Parent
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {filteredStudents.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{filteredStudents.length}</div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(filteredStudents.reduce((sum, s) => sum + s.attendance_rate, 0) / filteredStudents.length)}%
                </div>
                <div className="text-sm text-gray-500">Avg Attendance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(filteredStudents.reduce((sum, s) => sum + s.homework_completion, 0) / filteredStudents.length)}%
                </div>
                <div className="text-sm text-gray-500">Avg Homework</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{classes.length}</div>
                <div className="text-sm text-gray-500">Classes</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherStudentList; 