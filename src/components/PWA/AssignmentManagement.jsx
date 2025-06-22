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
  FaSort
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import assignmentService from '../../services/assignmentService';
import useAuth from '../../hooks/useAuth';

const AssignmentManagement = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const teacherId = auth?.user?.id || localStorage.getItem('teacherId') || 2;

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setIsLoading(true);
      const result = await assignmentService.getTeacherAssignments(teacherId);
      if (result.success) {
        setAssignments(result.data || []);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4">
        <h1 className="text-xl font-bold">My Assignments</h1>
      </div>
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <FaSpinner className="animate-spin text-2xl mx-auto mb-4" />
            <p>Loading assignments...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="bg-white rounded-lg p-4 shadow">
                <h3 className="font-semibold">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentManagement;
