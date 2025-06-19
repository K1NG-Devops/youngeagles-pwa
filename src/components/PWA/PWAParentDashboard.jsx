import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaBell, FaUser, FaClipboardList, FaSpinner, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_CONFIG } from '../../config/api';

const PWAParentDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(() => {
    return localStorage.getItem('selectedChild') || '';
  });
  const [homeworkProgress, setHomeworkProgress] = useState({
    total: 0,
    submitted: 0,
    percentage: 0
  });
  const [isLoading, setIsLoading] = useState({
    children: false,
    homework: false
  });
  const [errors, setErrors] = useState({
    children: null,
    homework: null
  });
  const [expandedSection, setExpandedSection] = useState(null);

  const parent_id = localStorage.getItem('parent_id');
  const token = localStorage.getItem('accessToken');

  // Fetch children for the dropdown
  const fetchChildren = useCallback(async () => {
    if (!parent_id || !token) return;
    
    setIsLoading(prev => ({ ...prev, children: true }));
    setErrors(prev => ({ ...prev, children: null }));
    
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
      const errorMessage = err.response?.data?.message || 'Failed to load children';
      setErrors(prev => ({ ...prev, children: errorMessage }));
      setChildren([]);
    } finally {
      setIsLoading(prev => ({ ...prev, children: false }));
    }
  }, [parent_id, token, selectedChild]);

  // Fetch homework data for progress tracking
  const fetchHomeworkData = useCallback(async () => {
    if (!parent_id || !token || !selectedChild) return;
    
    setIsLoading(prev => ({ ...prev, homework: true }));
    setErrors(prev => ({ ...prev, homework: null }));
    
    try {
      const res = await axios.get(
        `${API_CONFIG.getApiUrl()}/homeworks/for-parent/${parent_id}?child_id=${selectedChild}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const hwList = Array.isArray(res.data) ? res.data : res.data.homeworks || [];
      
      // Calculate progress
      const total = hwList.length;
      const submitted = hwList.filter(hw => hw.submitted).length;
      const percentage = total > 0 ? (submitted / total) * 100 : 0;
      
      setHomeworkProgress({
        total,
        submitted,
        percentage
      });
      
      setErrors(prev => ({ ...prev, homework: null }));
    } catch (err) {
      console.error('Error fetching homework:', err);
      const errorMessage = err.response?.data?.message || 'Unable to load homework data';
      
      // Handle different error scenarios
      if (err.response?.status === 404) {
        // No homework found - this is normal, not an error
        console.log('No homework found for this child - this is normal');
        setErrors(prev => ({ ...prev, homework: null }));
      } else if (err.response?.status === 400 && errorMessage.includes('Child ID must be specified')) {
        // Child not selected
        setErrors(prev => ({ ...prev, homework: 'Please select a child first' }));
      } else {
        // Actual error
        setErrors(prev => ({ ...prev, homework: errorMessage }));
      }
      
      setHomeworkProgress({
        total: 0,
        submitted: 0,
        percentage: 0
      });
    } finally {
      setIsLoading(prev => ({ ...prev, homework: false }));
    }
  }, [parent_id, token, selectedChild]);

  useEffect(() => {
    fetchChildren();
  }, [parent_id, token]);

  useEffect(() => {
    if (selectedChild) {
      fetchHomeworkData();
    }
  }, [selectedChild, parent_id, token]);

  const userName = auth?.user?.name || 'Parent';
  const selectedChildData = children.find(child => child.id.toString() === selectedChild);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleViewHomework = (e) => {
    if (!selectedChild) {
      e.preventDefault();
      toast.error('Please select a child first');
    }
  };

  const quickActions = [
    {
      id: 'homework',
      title: 'View Homework',
      description: 'Check assignments',
      icon: FaBook,
      color: 'blue',
      path: selectedChild ? `/homework?child_id=${selectedChild}` : '#',
      disabled: !selectedChild,
      badge: homeworkProgress.total,
      showBadgeWhenZero: false,
      onClick: handleViewHomework
    },
    {
      id: 'submit',
      title: 'Submit Work',
      description: 'Upload assignments',
      icon: FaClipboardList,
      color: 'green',
      path: '/submit-work',
      disabled: false,
      showBadgeWhenZero: false
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'View updates',
      icon: FaBell,
      color: 'yellow',
      path: '/notifications',
      disabled: false,
      badge: 0, // TODO: Add notification count
      showBadgeWhenZero: false
    }
  ];

  // MOCK: Example report data structure for parent reports
  // Backend contract suggestion:
  // GET /parent/reports?child_id=123
  // Response: {
  //   childId: 123,
  //   childName: 'Emma Johnson',
  //   totalHomework: 12,
  //   submitted: 10,
  //   graded: 8,
  //   avgGrade: 'B+',
  //   submissionRate: 83.3,
  //   recentGrades: [
  //     { title: 'Math Worksheet', grade: 'A', date: '2024-06-01' },
  //     { title: 'Science Project', grade: 'B+', date: '2024-05-28' }
  //   ]
  // }

  const mockReport = (childName) => ({
    childName,
    totalHomework: 12,
    submitted: 10,
    graded: 8,
    avgGrade: 'B+',
    submissionRate: 83.3,
    recentGrades: [
      { title: 'Math Worksheet', grade: 'A', date: '2024-06-01' },
      { title: 'Science Project', grade: 'B+', date: '2024-05-28' }
    ]
  });

  const report = selectedChildData ? mockReport(selectedChildData.name) : null;

  return (
    <div className="p-4 space-y-4 max-w-full overflow-x-hidden pb-20">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <h2 className="text-xl font-bold mb-1">Welcome back, {userName}!</h2>
        <p className="text-sm text-blue-100">Track your child's learning progress</p>
      </div>

      {/* Child Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Child</h3>
        {isLoading.children ? (
          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
            <FaSpinner className="animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading children...</span>
          </div>
        ) : (
          <>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg bg-white text-black text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[44px]"
              value={selectedChild}
              onChange={e => {
                setSelectedChild(e.target.value);
                localStorage.setItem('selectedChild', e.target.value);
              }}
            >
              <option value="">-- Select Child --</option>
              {children.map(child => (
                <option key={child.id} value={child.id}>{child.name}</option>
              ))}
            </select>
            {errors.children && <div className="text-red-500 text-sm mt-2">{errors.children}</div>}
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <Link
              key={action.id}
              to={action.path}
              onClick={action.onClick}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all min-h-[100px] ${
                action.disabled
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : `bg-${action.color}-50 border-${action.color}-200 text-${action.color}-700 hover:shadow-md cursor-pointer`
              }`}
              tabIndex={action.disabled ? -1 : 0}
              aria-disabled={action.disabled}
            >
              <div className={`p-2 rounded-lg mb-2 bg-${action.color}-100`}>
                <IconComponent className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs opacity-75">{action.description}</p>
                {action.badge && (action.showBadgeWhenZero || action.badge > 0) && (
                  <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full mt-1">
                    {action.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Homework Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Homework Progress</h3>
        {isLoading.homework ? (
          <div className="flex items-center space-x-2 p-3 border rounded-lg bg-gray-50">
            <FaSpinner className="animate-spin text-gray-400" />
            <span className="text-sm text-gray-500">Loading homework...</span>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Total Assignments:</span>
              <span className="font-bold text-lg text-blue-700">{homeworkProgress.total}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Submitted:</span>
              <span className="font-bold text-lg text-green-700">{homeworkProgress.submitted}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Completion:</span>
              <span className="font-bold text-lg text-purple-700">{Math.round(homeworkProgress.percentage)}%</span>
            </div>
            {errors.homework && <div className="text-red-500 text-sm mt-2">{errors.homework}</div>}
          </>
        )}
      </div>

      {selectedChildData && report && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress Report</h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2">
              <div className="text-xs text-gray-500">Total Homework</div>
              <div className="text-lg font-bold text-blue-700">{report.totalHomework}</div>
            </div>
            <div className="p-2">
              <div className="text-xs text-gray-500">Submitted</div>
              <div className="text-lg font-bold text-green-700">{report.submitted}</div>
            </div>
            <div className="p-2">
              <div className="text-xs text-gray-500">Graded</div>
              <div className="text-lg font-bold text-purple-700">{report.graded}</div>
            </div>
            <div className="p-2">
              <div className="text-xs text-gray-500">Avg. Grade</div>
              <div className="text-lg font-bold text-yellow-700">{report.avgGrade}</div>
            </div>
            <div className="p-2 col-span-2">
              <div className="text-xs text-gray-500">Submission Rate</div>
              <div className="text-lg font-bold text-indigo-700">{report.submissionRate}%</div>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Recent Grades</div>
            <ul className="divide-y divide-gray-100">
              {report.recentGrades.map((g, i) => (
                <li key={i} className="py-1 flex justify-between text-sm">
                  <span>{g.title}</span>
                  <span className="font-semibold text-gray-700">{g.grade}</span>
                  <span className="text-gray-400">{g.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAParentDashboard;
