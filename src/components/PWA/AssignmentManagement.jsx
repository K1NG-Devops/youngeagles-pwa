import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBook, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSpinner, 
  FaPlus,
  FaCalendarAlt,
  FaUsers,
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaSort,
  FaClipboard,
  FaExclamationCircle
} from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';
import assignmentService from '../../services/assignmentService';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isDark } = useTheme();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const teacherId = auth?.user?.id || localStorage.getItem('teacherId') || 2;

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔍 Loading assignments for teacher:', teacherId);
      const result = await assignmentService.getTeacherAssignments(teacherId);
      
      console.log('📋 Assignment service result:', result);
      
      if (result.success) {
        setAssignments(result.data || []);
        console.log('✅ Assignments loaded:', result.data?.length || 0, 'assignments');
      } else {
        setError('Failed to load assignments');
        showTopNotification('Failed to load assignments', 'error');
      }
    } catch (error) {
      console.error('❌ Error loading assignments:', error);
      setError(error.message || 'Failed to load assignments');
      showTopNotification('Failed to load assignments', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAssignment = () => {
    navigate('/teacher/assignments/create');
  };

  const handleBackToDashboard = () => {
    navigate('/teacher-dashboard');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-20`}>
        <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4">
          <div className="flex items-center">
            <button 
              onClick={handleBackToDashboard}
              className="mr-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <h1 className="text-xl font-bold">My Assignments</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <FaSpinner className={`animate-spin text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading assignments...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-20`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handleBackToDashboard}
              className="mr-3 p-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <FaArrowLeft className="text-lg" />
            </button>
            <div>
              <h1 className="text-xl font-bold">My Assignments</h1>
              <p className="text-sm text-green-100">Manage your homework assignments</p>
            </div>
          </div>
          <button
            onClick={handleCreateAssignment}
            className="flex items-center px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
          >
            <FaPlus className="mr-2" />
            <span className="hidden sm:inline">Create</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {error ? (
          <div className={`rounded-lg p-6 text-center ${isDark ? 'bg-red-900 border-red-700' : 'bg-red-50 border-red-200'} border`}>
            <FaExclamationCircle className={`text-4xl mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} />
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-red-300' : 'text-red-700'}`}>Error Loading Assignments</h3>
            <p className={`mb-4 ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
            <button
              onClick={loadAssignments}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark 
                  ? 'bg-red-700 text-white hover:bg-red-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              Try Again
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className={`rounded-lg p-8 text-center ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
            <FaClipboard className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Assignments Yet</h3>
            <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              You haven't created any homework assignments yet. Get started by creating your first assignment!
            </p>
            <button
              onClick={handleCreateAssignment}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-blue-700 transition-all transform hover:scale-105"
            >
              <FaPlus className="mr-2" />
              Create Your First Assignment
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className={`rounded-lg p-4 border transition-all hover:shadow-md ${
                  isDark 
                    ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' 
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <FaBook className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                      <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {assignment.title}
                      </h3>
                    </div>
                    
                    {assignment.instructions && (
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {assignment.instructions}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm">
                      {assignment.due_date && (
                        <div className="flex items-center">
                          <FaCalendarAlt className={`mr-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            Due: {new Date(assignment.due_date).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      
                      {assignment.class_name && (
                        <div className="flex items-center">
                          <FaUsers className={`mr-1 ${isDark ? 'text-green-400' : 'text-green-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {assignment.class_name}
                          </span>
                        </div>
                      )}
                      
                      {(assignment.submissionCount !== undefined && assignment.totalStudents !== undefined) && (
                        <div className="flex items-center">
                          <FaClipboard className={`mr-1 ${isDark ? 'text-purple-400' : 'text-purple-500'}`} />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {assignment.submissionCount}/{assignment.totalStudents} submitted
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-blue-400 hover:bg-blue-900 hover:bg-opacity-50' 
                          : 'text-blue-600 hover:bg-blue-50'
                      }`}
                      title="View details"
                    >
                      <FaEye />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-green-400 hover:bg-green-900 hover:bg-opacity-50' 
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title="Edit assignment"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className={`p-2 rounded-lg transition-colors ${
                        isDark 
                          ? 'text-red-400 hover:bg-red-900 hover:bg-opacity-50' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title="Delete assignment"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;
