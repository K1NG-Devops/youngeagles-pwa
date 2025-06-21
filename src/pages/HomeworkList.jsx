import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaBook, FaClock, FaCalendarAlt, FaFileAlt, FaEye, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaPlay, FaPlusCircle, FaPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../hooks/useAuth';
import { api } from '../services/httpClient';
import { API_CONFIG } from '../config/api';
import parentService from '../services/parentService';

// Error handler for homework fetch errors - moved outside component to prevent re-renders
const handleHomeworkError = (err, navigate, isTeacher) => {
  if (!err.response) {
    toast.error('Network error. Please check your connection and try again.');
    return;
  }

  const { status } = err.response;
  switch (status) {
    case 401:
      toast.error('Your session has expired. Please log in again.');
      navigate('/login');
      break;
    case 403:
      toast.error('You do not have permission to view homeworks.');
      break;
    case 404:
      if (isTeacher) {
        toast.info('No homework assignments found.');
      }
      break;
    default:
      toast.error('Failed to load homework assignments. Please try again later.');
  }
};

const HomeworkList = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [searchParams] = useSearchParams();
  const [homeworks, setHomeworks] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(() => {
    // Try to get child_id from multiple sources with validation
    const queryChild = searchParams.get('child_id');
    const storedChild = localStorage.getItem('selectedChild');
    
    // Validate the child_id to ensure it's not null, undefined, or empty string
    if (queryChild && queryChild.trim() !== '') {
      console.log('HomeworkList: Using child_id from query params:', queryChild);
      // Store it in localStorage for persistence
      localStorage.setItem('selectedChild', queryChild);
      return queryChild;
    } else if (storedChild && storedChild.trim() !== '') {
      console.log('HomeworkList: Using child_id from localStorage:', storedChild);
      return storedChild;
    }
    console.log('HomeworkList: No valid child_id found in query or localStorage');
    return '';
  });
  const [filter, setFilter] = useState('all'); // all, pending, submitted, overdue
  const [isLoading, setIsLoading] = useState({
    children: false,
    homeworks: false
  });
  const [error, setError] = useState(null);

  // Get user data from multiple sources for resilience
  const getAuthData = () => {
    // Try to get the most reliable token first
    const token = localStorage.getItem('accessToken') || auth?.accessToken;
    
    // Try to get parent_id from multiple sources
    let parent_id = localStorage.getItem('parent_id');
    if (!parent_id && auth?.user?.id) {
      parent_id = auth.user.id.toString();
      // Store in localStorage for future use
      localStorage.setItem('parent_id', parent_id);
      console.log('HomeworkList: Saved parent_id to localStorage from auth context:', parent_id);
    }
    
    const userRole = localStorage.getItem('role') || auth?.user?.role;
    const isTeacher = userRole === 'teacher';
    const teacherId = localStorage.getItem('teacherId') || auth?.user?.id;
    
    console.log('HomeworkList: Auth data retrieved:', {
      hasToken: !!token,
      hasParentId: !!parent_id,
      userRole,
      isTeacher,
      hasTeacherId: !!teacherId
    });
    
    return { token, parent_id, userRole, isTeacher, teacherId };
  };
  
  // Use the function to get all auth data
  const { token, parent_id, userRole, isTeacher, teacherId } = getAuthData();

  // Fetch children for parents
  useEffect(() => {
    if (isTeacher) {
      console.log('HomeworkList: Skipping children fetch - user is a teacher');
      return;
    }
    
    if (!parent_id) {
      console.error('HomeworkList: Missing parent_id, cannot fetch children');
      
      // Try to recover parent_id from auth or localStorage
      const storedParentId = localStorage.getItem('parent_id');
      const authUserId = auth?.user?.id;
      
      console.log('HomeworkList: Recovery attempt -', { 
        fromLocalStorage: storedParentId, 
        fromAuthContext: authUserId 
      });
      
      if (authUserId) {
        localStorage.setItem('parent_id', authUserId.toString());
        // We'll let the component re-render with the updated localStorage value
        return;
      }
      
      return;
    }
    
    if (!token) {
      console.error('HomeworkList: Missing authentication token, cannot fetch children');
      return;
    }
    
    const fetchChildren = async () => {
      setIsLoading(prev => ({ ...prev, children: true }));
      setError(null);
      
      try {
        console.log(`HomeworkList: Fetching children for parent_id ${parent_id}`);
        const res = await api.get(`${API_CONFIG.ENDPOINTS.CHILDREN}/${parent_id}`, { 
          headers: { 
            'X-Request-Source': 'pwa-homework-list-children',
            'Authorization': `Bearer ${token}` // Explicitly set token in header
          },
          timeout: 8000 // Extend timeout for reliability
        });
        
        console.log(`HomeworkList: Children API response:`, {
          status: res.status,
          hasData: !!res.data,
          isArray: Array.isArray(res.data),
          dataLength: Array.isArray(res.data) ? res.data.length : (res.data && res.data.children ? res.data.children.length : 'N/A')
        });
        const childrenData = Array.isArray(res.data) ? res.data : res.data.children || [];
        console.log(`HomeworkList: Fetched ${childrenData.length} children`);
        setChildren(childrenData);
        
        // Auto-select first child if no child is selected
        if (childrenData.length > 0 && !selectedChild) {
          const firstChildId = childrenData[0].id.toString();
          console.log(`HomeworkList: Auto-selecting first child: ${firstChildId}`);
          setSelectedChild(firstChildId);
          localStorage.setItem('selectedChild', firstChildId);
        } else if (childrenData.length > 0) {
          // Validate that the selected child exists in the fetched children
          const childExists = childrenData.some(child => child.id.toString() === selectedChild);
          if (!childExists) {
            console.log(`HomeworkList: Selected child ${selectedChild} not found in fetched children, selecting first child`);
            const firstChildId = childrenData[0].id.toString();
            setSelectedChild(firstChildId);
            localStorage.setItem('selectedChild', firstChildId);
          }
        }
      } catch (err) {
        console.error('HomeworkList: Error fetching children:', err);
        setError('Failed to load children data');
        
        if (err.response) {
          const { status, data } = err.response;
          
          if (status === 401) {
            // Try to get a fresh token from localStorage
            const freshToken = localStorage.getItem('accessToken');
            if (freshToken && freshToken !== token) {
              console.log('HomeworkList: Found newer token in localStorage, will retry children fetch');
              return; // Component will re-render with new token
            }
            
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
          } else if (status === 403) {
            toast.error('You do not have permission to view children.');
          } else if (status === 404) {
            console.log('HomeworkList: No children found for parent_id:', parent_id);
            setChildren([]);
            toast.info('No children found. Please register a child first.');
            // Redirect to the correct child management page
            navigate('/manage-children');
          } else {
            toast.error(`Failed to load children: ${data?.message || 'Unknown error'}`);
          }
        } else {
          toast.error('Network error. Please check your connection and try again.');
        }
      } finally {
        setIsLoading(prev => ({ ...prev, children: false }));
      }
    };

    fetchChildren();
  }, [isTeacher, parent_id, token, selectedChild, navigate]);

  // Fetch homeworks
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchHomeworks = async () => {
      if (!token) {
        console.warn('HomeworkList: No auth token found, aborting fetch');
        return;
      }
      if (!isTeacher && (!parent_id || !selectedChild)) {
        console.warn('HomeworkList: Missing parent_id or selectedChild for parent view, aborting fetch');
        return;
      }
      
      setIsLoading(prev => ({ ...prev, homeworks: true }));
      setError(null);
      
      try {
        let homeworkData;
        
        if (isTeacher) {
          const res = await api.get(
            API_CONFIG.ENDPOINTS.HOMEWORK_FOR_TEACHER.replace(':teacherId', teacherId),
            {
              headers: { 'X-Request-Source': 'pwa-teacher-homework' },
              signal: controller.signal
            }
          );
          homeworkData = res.data;
        } else {
          // Use the updated parent service
          const result = await parentService.getHomework(selectedChild, parent_id);
          
          if (!result.success) {
            throw new Error(result.error || 'Failed to fetch homework');
          }
          
          homeworkData = result.data;
        }
        
        if (!isMounted) return;
        
        const hwList = Array.isArray(homeworkData) ? homeworkData : homeworkData.homeworks || [];
        setHomeworks(hwList);
        
        // Clear any existing errors
        setError(null);
        
      } catch (err) {
        console.error('HomeworkList: Error fetching homework:', err);
        
        if (!isMounted) return;
        
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        setHomeworks([]);
        
        if (err.response?.status === 401) {
          toast.error('Your session has expired. Please log in again.');
          navigate('/login');
        } else if (err.response?.status === 403) {
          toast.error('You do not have permission to view homework assignments.');
        } else if (err.response?.status === 404) {
          toast.info('No homework assignments found.');
        } else {
          toast.error(`Failed to load homework: ${errorMessage}`);
        }
      } finally {
        if (isMounted) {
          setIsLoading(prev => ({ ...prev, homeworks: false }));
        }
      }
    };

    const timer = setTimeout(() => {
      if ((isTeacher && teacherId && token) || 
          (!isTeacher && parent_id && selectedChild && token)) {
        fetchHomeworks();
      }
    }, 500);
    
    return () => {
      clearTimeout(timer);
      isMounted = false;
      controller.abort();
    };
  }, [isTeacher, parent_id, selectedChild, teacherId, token, navigate]);

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
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid date';
      }
      
      return new Intl.DateTimeFormat('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch (error) {
      console.error('Error formatting date:', error, dateString);
      return 'Invalid date';
    }
  };

  const selectedChildData = children.find(child => child.id?.toString() === selectedChild);

  // Show warnings if there are issues with auth or selection
  const showAuthWarning = !isTeacher && (!token || !parent_id);
  const showChildWarning = !isTeacher && children.length > 0 && !selectedChild;
  
  // Debug information
  console.log('HomeworkList: Render state:', {
    hasToken: !!token,
    parent_id,
    childrenCount: children.length,
    selectedChild,
    selectedChildData: !!selectedChildData,
    showAuthWarning,
    showChildWarning
  });

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
      
      {/* Auth Warning */}
      {showAuthWarning && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Authentication issue detected. Please try logging out and logging back in.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Child Selection for Parents */}
      {!isTeacher && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Child</h3>
          {isLoading.children ? (
            <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
              <FaSpinner className="animate-spin text-gray-400" />
              <span className="text-sm text-gray-500">Loading children...</span>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700 mb-3">No children found for your account.</p>
              <Link 
                to="/children/register" 
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaPlus className="mr-2" />
                Register a Child
              </Link>
            </div>
          ) : (
            <>
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
              
              {showChildWarning && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  Please select a child to view homework assignments
                </div>
              )}
              
              {selectedChildData && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  Selected: <span className="font-medium">{selectedChildData.name}</span> ({selectedChildData.className})
                </div>
              )}
            </>
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
