import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaClock, FaCalendarAlt, FaFileAlt, FaEye, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaPlay, FaPlusCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import axios from 'axios';
import { API_CONFIG } from '../config/api';

const HomeworkList = () => {
  const { auth } = useAuth();
  const [searchParams] = useSearchParams();
  const [homeworks, setHomeworks] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(() => {
    return searchParams.get('child_id') || localStorage.getItem('selectedChild') || '';
  });
  const [filter, setFilter] = useState('all'); // all, pending, submitted, overdue
  const [isLoading, setIsLoading] = useState({
    children: false,
    homeworks: false
  });

  const parent_id = localStorage.getItem('parent_id');
  const token = localStorage.getItem('accessToken');
  const userRole = auth?.user?.role || localStorage.getItem('role');
  const isTeacher = userRole === 'teacher';
  const teacherId = auth?.user?.id || localStorage.getItem('teacherId');

  // Fetch children for parents
  useEffect(() => {
    if (isTeacher || !parent_id || !token) return;
    
    const fetchChildren = async () => {
      setIsLoading(prev => ({ ...prev, children: true }));
      
      try {
        const res = await axios.get(
          `${API_CONFIG.getApiUrl()}/auth/parents/${parent_id}/children`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        const childrenData = Array.isArray(res.data) ? res.data : res.data.children || [];
        setChildren(childrenData);
        
        // Auto-select first child if no child is selected
        if (childrenData.length > 0 && !selectedChild) {
          const firstChildId = childrenData[0].id.toString();
          setSelectedChild(firstChildId);
          localStorage.setItem('selectedChild', firstChildId);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        toast.error('Failed to load children');
      } finally {
        setIsLoading(prev => ({ ...prev, children: false }));
      }
    };

    fetchChildren();
  }, [isTeacher, parent_id, token]);

  // Fetch homeworks
  useEffect(() => {
    const fetchHomeworks = async () => {
      if (!token) return;
      if (!isTeacher && (!parent_id || !selectedChild)) return;
      
      setIsLoading(prev => ({ ...prev, homeworks: true }));
      
      try {
        let url;
        if (isTeacher) {
          url = `${API_CONFIG.getApiUrl()}/homeworks/for-teacher/${teacherId}`;
        } else {
          url = `${API_CONFIG.getApiUrl()}/homeworks/for-parent/${parent_id}?child_id=${selectedChild}`;
        }
        
        const res = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        const hwList = Array.isArray(res.data) ? res.data : res.data.homeworks || [];
        setHomeworks(hwList);
      } catch (err) {
        console.error('Error fetching homeworks:', err);
        if (err.response?.status !== 404) {
          toast.error('Failed to load homeworks');
        }
      } finally {
        setIsLoading(prev => ({ ...prev, homeworks: false }));
      }
    };

    fetchHomeworks();
  }, [isTeacher, parent_id, selectedChild, teacherId, token]);

  // Filter homeworks based on selected filter
  const filteredHomeworks = homeworks.filter(hw => {
    const now = new Date();
    const dueDate = new Date(hw.due_date);
    const isOverdue = dueDate < now && !hw.submitted;
    
    switch (filter) {
      case 'pending':
        return !hw.submitted && !isOverdue;
      case 'submitted':
        return hw.submitted;
      case 'overdue':
        return isOverdue;
      default:
        return true;
    }
  });

  const getStatusIcon = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.due_date);
    const isOverdue = dueDate < now && !homework.submitted;
    
    if (homework.submitted) {
      return <FaCheckCircle className="text-green-500" />;
    } else if (isOverdue) {
      return <FaExclamationTriangle className="text-red-500" />;
    } else {
      return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.due_date);
    const isOverdue = dueDate < now && !homework.submitted;
    
    if (homework.submitted) {
      return 'Submitted';
    } else if (isOverdue) {
      return 'Overdue';
    } else {
      return 'Pending';
    }
  };

  const getStatusColor = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.due_date);
    const isOverdue = dueDate < now && !homework.submitted;
    
    if (homework.submitted) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (isOverdue) {
      return 'bg-red-100 text-red-800 border-red-200';
    } else {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const selectedChildData = children.find(child => child.id.toString() === selectedChild);

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-hidden pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <h1 className="text-xl font-bold mb-1">
          {isTeacher ? 'Manage Homework' : 'Homework Assignments'}
        </h1>
        <p className="text-sm text-blue-100">
          {isTeacher ? 'View and manage your class assignments' : 'View your child\'s homework assignments'}
        </p>
      </div>

      {/* Child Selection for Parents */}
      {!isTeacher && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Child</h3>
          {isLoading.children ? (
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
              <FaSpinner className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading children...</span>
            </div>
          ) : (
            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedChild}
              onChange={(e) => {
                setSelectedChild(e.target.value);
                localStorage.setItem('selectedChild', e.target.value);
              }}
            >
              <option value="">Select a child</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.name} - {child.className || 'No Class'}
                </option>
              ))}
            </select>
          )}
          {selectedChildData && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
              Selected: <span className="font-medium">{selectedChildData.name}</span> ({selectedChildData.className})
            </div>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Filter</h3>
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: homeworks.length },
            { id: 'pending', label: 'Pending', count: homeworks.filter(hw => !hw.submitted && new Date(hw.due_date) >= new Date()).length },
            { id: 'submitted', label: 'Submitted', count: homeworks.filter(hw => hw.submitted).length },
            { id: 'overdue', label: 'Overdue', count: homeworks.filter(hw => new Date(hw.due_date) < new Date() && !hw.submitted).length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Actions */}
      {isTeacher && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            <Link
              to="/homework/upload"
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-4 h-4" />
              <span>New Assignment</span>
            </Link>
          </div>
        </div>
      )}

      {/* Homework List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
        </div>
        
        {isLoading.homeworks ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-gray-400 text-2xl" />
            <span className="ml-2 text-gray-500">Loading assignments...</span>
          </div>
        ) : filteredHomeworks.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredHomeworks.map((homework) => (
              <div key={homework.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaFileAlt className="text-blue-500 text-lg" />
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{homework.title}</h4>
                        <p className="text-sm text-gray-600">
                          {homework.subject || 'General'} • {homework.className || 'Class'}
                        </p>
                      </div>
                    </div>
                    
                    {homework.description && (
                      <p className="text-sm text-gray-700 mb-3 ml-8">{homework.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600 ml-8">
                      <div className="flex items-center space-x-1">
                        <FaCalendarAlt className="text-gray-400" />
                        <span>Due: {formatDate(homework.due_date)}</span>
                      </div>
                      {homework.submitted_at && (
                        <div className="text-green-600">
                          Submitted: {formatDate(homework.submitted_at)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getStatusColor(homework)}`}>
                      {getStatusIcon(homework)}
                      <span>{getStatusText(homework)}</span>
                    </div>
                    
                    {!homework.submitted && !isTeacher && (
                      <Link
                        to={`/submit-work?homework_id=${homework.id}&child_id=${selectedChild}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Submit Work
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No homework assignments' : `No ${filter} assignments`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'There are no homework assignments to display.'
                : `There are no ${filter} assignments at this time.`
              }
            </p>
            {isTeacher && filter === 'all' && (
              <Link
                to="/homework/upload"
                className="inline-flex items-center space-x-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                <span>Create First Assignment</span>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeworkList;
