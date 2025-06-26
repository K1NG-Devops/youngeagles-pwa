import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { FaBook, FaClock, FaCalendarAlt, FaFileAlt, FaEye, FaCheckCircle, FaExclamationTriangle, FaSpinner, FaPlay, FaPlusCircle, FaPlus } from 'react-icons/fa';
import { showTopNotification } from '../components/TopNotificationManager';
import useAuth from '../hooks/useAuth';
import { api } from '../services/httpClient';
import { API_CONFIG } from '../config/api';
import parentService from '../services/parentService';
import { useTheme } from '../hooks/useTheme';
import { formatDate } from '../utils/dateUtils';

// Error handler for homework fetch errors - moved outside component to prevent re-renders
const handleHomeworkError = (err, navigate, isTeacher) => {
  if (!err.response) {
    showTopNotification('Network error. Please check your connection and try again.', 'error');
    return;
  }

  const { status } = err.response;
  switch (status) {
    case 401:
      showTopNotification('Your session has expired. Please log in again.', 'error');
      navigate('/login');
      break;
    case 403:
      showTopNotification('You do not have permission to view homeworks.', 'error');
      break;
    case 404:
      if (isTeacher) {
        showTopNotification('No homework assignments found.', 'info');
      }
      break;
    default:
      showTopNotification('Failed to load homework assignments. Please try again later.', 'error');
  }
};

const HomeworkList = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [homeworks, setHomeworks] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(() => {
    // Get child_id from query params first, but don't store invalid values
    const queryChild = searchParams.get('child_id');
    const storedChild = localStorage.getItem('selectedChild');
    
    // Only use valid child IDs (non-empty strings that aren't just whitespace)
    if (queryChild && queryChild.trim() !== '' && queryChild !== 'null' && queryChild !== 'undefined') {
      console.log('HomeworkList: Using child_id from query params:', queryChild);
      localStorage.setItem('selectedChild', queryChild);
      return queryChild;
    } else if (storedChild && storedChild.trim() !== '' && storedChild !== 'null' && storedChild !== 'undefined') {
      console.log('HomeworkList: Using child_id from localStorage:', storedChild);
      return storedChild;
    }
    console.log('HomeworkList: No valid child_id found, will auto-select first child');
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
        const res = await api.get(`${API_CONFIG.ENDPOINTS.CHILDREN}/${parent_id}/children`, { 
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
          dataLength: Array.isArray(res.data) ? res.data.length : (res.data && res.data.children ? res.data.children.length : 'N/A'),
          responseStructure: res.data
        });
        
        // Handle different response structures from the API
        let childrenData = [];
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          // New API format: {success: true, data: [...]}
          childrenData = res.data.data;
        } else if (Array.isArray(res.data)) {
          // Direct array format: [...]
          childrenData = res.data;
        } else if (res.data && res.data.children && Array.isArray(res.data.children)) {
          // Nested format: {children: [...]}
          childrenData = res.data.children;
        } else {
          console.warn('HomeworkList: Unexpected API response format:', res.data);
          childrenData = [];
        }
        
        console.log(`HomeworkList: Fetched ${childrenData.length} children:`, childrenData.map(child => ({ id: child.id, name: child.name })));
        setChildren(childrenData);
        
        // Auto-select first child if no child is selected or if selected child doesn't exist
        if (childrenData.length > 0) {
          const currentSelectedChild = selectedChild;
          const childExists = currentSelectedChild ? childrenData.some(child => child.id.toString() === currentSelectedChild) : false;
          
          if (!currentSelectedChild || !childExists) {
            const firstChildId = childrenData[0].id.toString();
            console.log(`HomeworkList: ${!currentSelectedChild ? 'Auto-selecting' : 'Switching to'} first child: ${firstChildId} (${childrenData[0].name})`);
            setSelectedChild(firstChildId);
            localStorage.setItem('selectedChild', firstChildId);
          } else {
            console.log(`HomeworkList: Selected child ${currentSelectedChild} exists in fetched children`);
          }
        } else {
          console.log('HomeworkList: No children found, clearing selectedChild');
          setSelectedChild('');
          localStorage.removeItem('selectedChild');
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
            
            showTopNotification('Your session has expired. Please log in again.', 'error');
            navigate('/login');
          } else if (status === 403) {
            showTopNotification('You do not have permission to view children.', 'error');
          } else if (status === 404) {
            console.log('HomeworkList: No children found for parent_id:', parent_id);
            setChildren([]);
            showTopNotification('No children found. Please register a child first.', 'info');
            // Redirect to the correct child management page
            navigate('/manage-children');
          } else {
            showTopNotification(`Failed to load children: ${data?.message || 'Unknown error'}`, 'error');
          }
        } else {
          showTopNotification('Network error. Please check your connection and try again.', 'error');
        }
      } finally {
        setIsLoading(prev => ({ ...prev, children: false }));
      }
    };

    fetchChildren();
  }, [isTeacher, parent_id, token, navigate]);

  // Fetch homeworks and submissions
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchHomeworkAndSubmissions = async () => {
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
          const hwResult = await parentService.getHomework(selectedChild, parent_id);
          
          if (!hwResult.success) {
            throw new Error(hwResult.error || 'Failed to fetch homework');
          }
          
          homeworkData = hwResult.data || [];
        }
        
        // Fetch submissions for the parent
        const subResult = await api.get(`/api/submissions/parent/${parent_id}`);
        if (subResult.data.success) {
          setSubmissions(subResult.data.submissions || []);
        }
        
        if (!isMounted) return;
        
        // Handle different response structures
        let hwList;
        if (Array.isArray(homeworkData)) {
          hwList = homeworkData;
        } else if (homeworkData.data && Array.isArray(homeworkData.data)) {
          hwList = homeworkData.data;
        } else if (homeworkData.homeworks && Array.isArray(homeworkData.homeworks)) {
          hwList = homeworkData.homeworks;
        } else {
          hwList = [];
        }
        
        console.log('HomeworkList: Processing homework data:', {
          originalData: homeworkData,
          extractedList: hwList,
          listLength: hwList.length
        });
        
        setHomeworks(hwList);
        
        // Clear any existing errors
        setError(null);
        
      } catch (err) {
        console.error('HomeworkList: Error fetching homework:', err);
        
        if (!isMounted) return;
        
        const errorMessage = err.response?.data?.message || err.message;
        setHomeworks([]); // Clear homework on error
        
        if (err.response?.status === 401) {
          showTopNotification('Your session has expired. Please log in again.', 'error');
          navigate('/login');
        } else if (err.response?.status === 403) {
          showTopNotification('You do not have permission to view homework assignments.', 'error');
        } else if (err.response?.status === 404) {
          // This is a user-friendly message for a common case.
          showTopNotification('No homework found for the selected child.', 'info');
          // We set the error to null because this is an expected empty state, not a system failure.
          setError(null);
        } else {
          // For all other errors, show a generic but helpful message.
          showTopNotification('Could not load homework. Please try again later.', 'error');
          setError('An unexpected error occurred.');
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
        fetchHomeworkAndSubmissions();
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
    // Using the new robust date formatting
    const dueDate = new Date(hw.dueDate);
    const isOverdue = dueDate < now && hw.status !== 'submitted';
    
    switch (filter) {
      case 'pending':
        return hw.status === 'pending' && !isOverdue;
      case 'submitted':
        return hw.status === 'submitted';
      case 'overdue':
        return isOverdue;
      default:
        return true;
    }
  });

  const getStatusIcon = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const isOverdue = dueDate < now && homework.status !== 'submitted';
    
    if (homework.status === 'submitted') {
      return <FaCheckCircle className="text-green-500" />;
    } else if (isOverdue) {
      return <FaExclamationTriangle className="text-red-500" />;
    } else {
      return <FaClock className="text-yellow-500" />;
    }
  };

  const getStatusText = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const isOverdue = dueDate < now && homework.status !== 'submitted';
    
    if (homework.status === 'submitted') {
      return 'Submitted';
    } else if (isOverdue) {
      return 'Overdue';
    } else {
      return 'Pending';
    }
  };

  const getStatusColor = (homework) => {
    const now = new Date();
    const dueDate = new Date(homework.dueDate);
    const isOverdue = dueDate < now && homework.status !== 'submitted';
    
    if (homework.status === 'submitted') {
      return isDark 
        ? 'bg-green-900 text-green-300 border-green-700' 
        : 'bg-green-100 text-green-800 border-green-200';
    } else if (isOverdue) {
      return isDark 
        ? 'bg-red-900 text-red-300 border-red-700' 
        : 'bg-red-100 text-red-800 border-red-200';
    } else {
      return isDark 
        ? 'bg-yellow-900 text-yellow-300 border-yellow-700' 
        : 'bg-yellow-100 text-yellow-800 border-yellow-200';
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
    <div className={`min-h-screen w-full pt-4 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="p-4 space-y-4 pb-20">
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
        <div className={`${isDark ? 'bg-yellow-900 border-yellow-600' : 'bg-yellow-50 border-yellow-400'} border-l-4 p-4 rounded-md`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>
                Authentication issue detected. Please try logging out and logging back in.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Child Selection for Parents */}
      {!isTeacher && (
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-3`}>Select Child</h3>
          {isLoading.children ? (
            <div className={`flex items-center space-x-2 p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
              <FaSpinner className="animate-spin text-gray-400" />
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading children...</span>
            </div>
          ) : children.length === 0 ? (
            <div className={`text-center p-4 ${isDark ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>No children found for your account.</p>
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
                className={`w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  isDark 
                    ? 'bg-gray-700 border-gray-600 text-white' 
                    : 'bg-white border-gray-300 text-black'
                }`}
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
                <div className={`mt-2 p-2 border rounded text-sm ${
                  isDark 
                    ? 'bg-yellow-900 border-yellow-600 text-yellow-300' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-700'
                }`}>
                  Please select a child to view homework assignments
                </div>
              )}
              
              {selectedChildData && (
                <div className={`mt-2 p-2 rounded text-sm ${
                  isDark 
                    ? 'bg-blue-900 text-blue-300' 
                    : 'bg-blue-50 text-blue-700'
                }`}>
                  Selected: <span className="font-medium">{selectedChildData.name}</span> ({selectedChildData.className})
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
        <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'} mb-3`}>Filter</h3>
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All', count: homeworks.length },
            { id: 'pending', label: 'Pending', count: homeworks.filter(hw => hw.status === 'pending' && new Date(hw.dueDate) >= new Date()).length },
            { id: 'submitted', label: 'Submitted', count: homeworks.filter(hw => hw.status === 'submitted').length },
            { id: 'overdue', label: 'Overdue', count: homeworks.filter(hw => new Date(hw.dueDate) < new Date() && hw.status !== 'submitted').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                filter === tab.id
                  ? 'bg-blue-600 text-white'
                  : isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
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
        <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Quick Actions</h3>
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
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`}>
        <div className={`p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>Assignments</h3>
        </div>
        
        {isLoading.homeworks ? (
          <div className="flex items-center justify-center py-8">
            <FaSpinner className="animate-spin text-gray-400 text-2xl" />
            <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading assignments...</span>
          </div>
        ) : filteredHomeworks.length > 0 ? (
          <div className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-100'}`}>
            {filteredHomeworks.map((homework) => {
              const isSubmitted = homework.status === 'submitted';
              const isOverdue = new Date(homework.dueDate) < new Date() && !isSubmitted;
              
              return (
                <div key={homework.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 flex justify-between items-start">
                  {/* Left side content */}
                  <div className="flex-grow space-y-3">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-gray-100">{homework.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        General • {homework.className}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                      <FaCalendarAlt className="text-gray-400" />
                      <span>Due: {formatDate(homework.dueDate)}</span>
                    </div>
                  </div>

                  {/* Right side status and button */}
                  <div className="flex-shrink-0 flex flex-col items-end space-y-2">
                    <div className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(homework)}`}>
                      {getStatusText(homework)}
                    </div>
                    
                    {isSubmitted && (() => {
                      const submission = submissions.find(s => s.homework_id === homework.id);
                      return submission ? (
                        <Link
                          to={`/submission/${submission.id}`}
                          className="mt-1 text-center py-1 px-3 text-xs font-medium rounded-lg transition-colors bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-800 dark:text-green-200 dark:hover:bg-green-700"
                        >
                          View Submission
                        </Link>
                      ) : null;
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <FaBook className={`w-16 h-16 ${isDark ? 'text-gray-600' : 'text-gray-300'} mx-auto mb-4`} />
            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
              {filter === 'all' ? 'No homework assignments' : `No ${filter} assignments`}
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
    </div>
  );
};

export default HomeworkList;
