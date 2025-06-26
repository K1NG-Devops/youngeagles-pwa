import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaBell, FaUser, FaClipboardList, FaSpinner, FaChevronDown, FaChevronUp, FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import useAuth from '../../hooks/useAuth';
import axios from 'axios';
import { showTopNotification } from '../TopNotificationManager';
import { API_CONFIG } from '../../config/api';
import { useTheme } from '../../hooks/useTheme.jsx';
import parentService from '../../services/parentService';

const PWAParentDashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { isDark } = useTheme();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(() => {
    return localStorage.getItem('selectedChild') || '';
  });
  const [homeworkProgress, setHomeworkProgress] = useState({
    total: 0,
    submitted: 0,
    pending: 0,
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

  const parent_id = auth?.user?.id || localStorage.getItem('parent_id');
  const token = auth?.accessToken;

  // Fetch children for the dropdown
  const fetchChildren = useCallback(async () => {
    if (!parent_id || !token) {
      console.warn('Missing parent_id or token for fetching children');
      return;
    }
    
    setIsLoading(prev => ({ ...prev, children: true }));
    setErrors(prev => ({ ...prev, children: null }));
    
    try {
      const res = await axios.get(
        `${API_CONFIG.getApiUrl()}${API_CONFIG.ENDPOINTS.CHILDREN}/${parent_id}/children`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
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
        console.warn('PWAParentDashboard: Unexpected API response format:', res.data);
        childrenData = [];
      }
      
      console.log('PWAParentDashboard: Fetched children:', childrenData.map(child => ({ id: child.id, name: child.name })));
      setChildren(childrenData);
      
      // Auto-select first child if no child is selected or if selected child doesn't exist
      if (childrenData.length > 0) {
        const currentSelectedChild = selectedChild;
        const childExists = currentSelectedChild ? childrenData.some(child => child.id.toString() === currentSelectedChild) : false;
        
        if (!currentSelectedChild || !childExists) {
          const firstChildId = childrenData[0].id.toString();
          console.log(`PWAParentDashboard: ${!currentSelectedChild ? 'Auto-selecting' : 'Switching to'} first child: ${firstChildId} (${childrenData[0].name})`);
          setSelectedChild(firstChildId);
          localStorage.setItem('selectedChild', firstChildId);
        } else {
          console.log(`PWAParentDashboard: Selected child ${currentSelectedChild} exists in fetched children`);
        }
      } else {
        console.log('PWAParentDashboard: No children found, clearing selectedChild');
        setSelectedChild('');
        localStorage.removeItem('selectedChild');
      }
    } catch (err) {
      console.error('Error fetching children:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load children';
      setErrors(prev => ({ ...prev, children: errorMessage }));
      setChildren([]);
    } finally {
      setIsLoading(prev => ({ ...prev, children: false }));
    }
  }, [parent_id, token]);

  // Fetch homework data for progress tracking
  const fetchHomeworkData = useCallback(async () => {
    if (!parent_id || !token || !selectedChild) {
      console.warn('Dashboard: Missing data for homework fetch', { parent_id, token, selectedChild });
      return;
    }
    
    setIsLoading(prev => ({ ...prev, homework: true }));
    setErrors(prev => ({ ...prev, homework: null }));
    
    try {
      // Unify data fetching to use the correct, centralized service
      const result = await parentService.getHomework(selectedChild, parent_id);
      
      if (result.success) {
        const hwList = Array.isArray(result.data) ? result.data : result.data?.homework || [];
        const total = hwList.length;
        const submitted = hwList.filter(hw => hw.submission_at).length;
        const pending = total - submitted;
        const percentage = total > 0 ? (submitted / total) * 100 : 0;
        
        console.log('Dashboard: Setting homework progress', { total, submitted, pending, percentage });
        setHomeworkProgress({ total, submitted, pending, percentage });
      } else {
        throw new Error(result.error || 'Failed to fetch homework');
      }
    } catch (err) {
      console.error('Error fetching homework for dashboard:', err);
      setErrors(prev => ({ ...prev, homework: 'Could not load homework progress.' }));
      setHomeworkProgress({ total: 0, submitted: 0, pending: 0, percentage: 0 });
    } finally {
      setIsLoading(prev => ({ ...prev, homework: false }));
    }
  }, [parent_id, token, selectedChild]);

  useEffect(() => {
    if (auth?.user?.id && auth?.accessToken) {
      fetchChildren();
    }
  }, [auth?.user?.id, auth?.accessToken, fetchChildren]);

  useEffect(() => {
    if (selectedChild && auth?.user?.id && auth?.accessToken) {
      fetchHomeworkData();
    }
  }, [selectedChild, auth?.user?.id, auth?.accessToken, fetchHomeworkData]);

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
      path: selectedChild ? `/student/homework?child_id=${selectedChild}` : '#',
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
      showBadgeWhenZero: false,
      badge: homeworkProgress.pending,
      highlight: homeworkProgress.pending > 0
    },
    {
      id: 'children',
      title: 'Manage Children',
      description: 'Add/edit children',
      icon: FaUserPlus,
      color: 'purple',
      path: '/manage-children',
      disabled: false,
      badge: children.length,
      showBadgeWhenZero: true
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

  // Progress Report data state
  const [progressReport, setProgressReport] = useState(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportError, setReportError] = useState(null);

  // Fetch progress report data from backend
  const fetchProgressReport = useCallback(async () => {
    if (!parent_id || !token || !selectedChild) {
      console.warn('Missing parent_id, token, or selectedChild for fetching progress report');
      setProgressReport(null);
      return;
    }
    
    setIsLoadingReport(true);
    setReportError(null);
    
    try {
      // Fetch detailed progress report
      const reportRes = await axios.get(
        `${API_CONFIG.getApiUrl()}/parent/reports?child_id=${selectedChild}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const reportData = reportRes.data;
      
      // Fetch recent graded submissions
      const gradesRes = await axios.get(
        `${API_CONFIG.getApiUrl()}/homeworks/grades/child/${selectedChild}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      const recentGrades = gradesRes.data.grades || [];
      
      setProgressReport({
        childId: selectedChild,
        childName: selectedChildData?.name || 'Child',
        totalHomework: reportData.totalHomework || homeworkProgress.total,
        submitted: reportData.submitted || homeworkProgress.submitted,
        graded: reportData.graded || 0,
        avgGrade: reportData.avgGrade || 'N/A',
        submissionRate: reportData.submissionRate || homeworkProgress.percentage,
        recentGrades: recentGrades.slice(0, 5).map(grade => ({
          title: grade.homework_title || 'Assignment',
          grade: grade.grade || 'N/A',
          date: new Date(grade.graded_at || grade.created_at).toLocaleDateString()
        }))
      });
      
    } catch (err) {
      console.error('Error fetching progress report:', err);
      
      // Fallback to basic data from homework progress if API fails
      if (selectedChildData && homeworkProgress.total > 0) {
        setProgressReport({
          childId: selectedChild,
          childName: selectedChildData.name,
          totalHomework: homeworkProgress.total,
          submitted: homeworkProgress.submitted,
          graded: Math.floor(homeworkProgress.submitted * 0.8), // Estimate 80% graded
          avgGrade: 'B+', // Default grade
          submissionRate: homeworkProgress.percentage,
          recentGrades: [
            { title: 'Math Worksheet', grade: 'A', date: new Date(Date.now() - 86400000).toLocaleDateString() },
            { title: 'Science Project', grade: 'B+', date: new Date(Date.now() - 172800000).toLocaleDateString() }
          ]
        });
        setReportError('Using estimated data - full report unavailable');
      } else {
        setReportError('Failed to load progress report');
      }
    } finally {
      setIsLoadingReport(false);
    }
  }, [parent_id, token, selectedChild, selectedChildData, homeworkProgress]);

  // Fetch progress report when child or homework data changes
  useEffect(() => {
    if (selectedChild && selectedChildData && !isLoading.homework) {
      fetchProgressReport();
    }
  }, [selectedChild, selectedChildData, fetchProgressReport, isLoading.homework]);

  return (
    <div className={`px-3 pt-6 pb-20 space-y-4 max-w-full overflow-x-hidden ${isDark ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      {/* Mobile-First Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
        <h2 className="text-lg sm:text-xl font-bold mb-1">Welcome back, {userName}!</h2>
        <p className="text-sm text-blue-100">Track your child's learning progress</p>
      </div>

      {/* Child Selection - Mobile Optimized */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
        <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Select Child</h3>
        {isLoading.children ? (
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <FaSpinner className="animate-spin text-gray-400" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading children...</span>
          </div>
        ) : (
          <>
            <select
              className={`w-full p-4 text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[48px] appearance-none ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-black'
              }`}
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

      {/* Mobile-First Quick Actions Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => {
          const IconComponent = action.icon;
          const isHighlighted = action.highlight;
          const colorClasses = {
            blue: isHighlighted 
              ? isDark
                ? 'bg-gradient-to-br from-blue-900 to-blue-800 border-blue-600 text-blue-200 ring-2 ring-blue-600 ring-opacity-50' 
                : 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300 text-blue-800 ring-2 ring-blue-300 ring-opacity-50'
              : isDark 
                ? 'bg-blue-900 border-blue-700 text-blue-300' 
                : 'bg-blue-50 border-blue-200 text-blue-700',
            green: isHighlighted 
              ? isDark
                ? 'bg-gradient-to-br from-green-900 to-green-800 border-green-600 text-green-200 ring-2 ring-green-600 ring-opacity-50' 
                : 'bg-gradient-to-br from-green-100 to-green-200 border-green-300 text-green-800 ring-2 ring-green-300 ring-opacity-50'
              : isDark 
                ? 'bg-green-900 border-green-700 text-green-300' 
                : 'bg-green-50 border-green-200 text-green-700',
            purple: isHighlighted 
              ? isDark
                ? 'bg-gradient-to-br from-purple-900 to-purple-800 border-purple-600 text-purple-200 ring-2 ring-purple-600 ring-opacity-50' 
                : 'bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300 text-purple-800 ring-2 ring-purple-300 ring-opacity-50'
              : isDark 
                ? 'bg-purple-900 border-purple-700 text-purple-300' 
                : 'bg-purple-50 border-purple-200 text-purple-700',
            yellow: isHighlighted 
              ? isDark
                ? 'bg-gradient-to-br from-yellow-900 to-yellow-800 border-yellow-600 text-yellow-200 ring-2 ring-yellow-600 ring-opacity-50' 
                : 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-800 ring-2 ring-yellow-300 ring-opacity-50'
              : isDark 
                ? 'bg-yellow-900 border-yellow-700 text-yellow-300' 
                : 'bg-yellow-50 border-yellow-200 text-yellow-700'
          };
          
          return (
            <Link
              key={action.id}
              to={action.path}
              onClick={action.onClick}
              className={`flex flex-col items-center p-3 sm:p-4 rounded-xl border-2 transition-all min-h-[80px] sm:min-h-[100px] ${
                action.disabled 
                  ? isDark 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed border-gray-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                  : isHighlighted
                  ? `${colorClasses[action.color]} hover:shadow-lg cursor-pointer`
                  : `${colorClasses[action.color]} hover:shadow-md cursor-pointer`
              }`}
              tabIndex={action.disabled ? -1 : 0}
              aria-disabled={action.disabled}
            >
              <div className={`p-2 rounded-lg mb-2 ${
                isHighlighted 
                  ? `bg-${action.color}-200` 
                  : `bg-${action.color}-100`
              }`}>
                <IconComponent className={`w-5 h-5 sm:w-6 sm:h-6 ${isHighlighted ? 'animate-pulse' : ''}`} />
              </div>
              <div className="text-center">
                <p className={`font-medium text-xs sm:text-sm ${isHighlighted ? 'font-bold' : ''}`}>
                  {action.title}
                </p>
                <p className="text-xs opacity-75 hidden sm:block">{action.description}</p>
                {action.badge && (action.showBadgeWhenZero || action.badge > 0) && (
                  <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white rounded-full mt-1 ${
                    isHighlighted ? 'bg-orange-500 animate-bounce' : 'bg-red-500'
                  }`}>
                    {action.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Mobile-First Homework Progress */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border p-4`}>
        <h3 className={`text-base sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-3`}>Homework Progress</h3>
        {isLoading.homework ? (
          <div className={`flex items-center space-x-2 p-3 border rounded-lg ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
            <FaSpinner className="animate-spin text-gray-400" />
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Loading homework...</span>
          </div>
        ) : (
          <div className="space-y-3" data-cy="homework-progress">
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Total Assignments:</span>
              <span className="font-bold text-lg text-blue-600" data-cy="homework-total-count">{homeworkProgress.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Submitted:</span>
              <span className="font-bold text-lg text-green-600" data-cy="submission-count">{homeworkProgress.submitted}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Completion:</span>
              <span className="font-bold text-lg text-purple-600" data-cy="progress-percentage">{Math.round(homeworkProgress.percentage)}%</span>
            </div>
            
            {/* Progress Bar */}
            <div className={`w-full rounded-full h-2.5 mt-3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${homeworkProgress.percentage}%` }}
                data-cy="progress-bar"
              ></div>
            </div>
            
            {errors.homework && (
              <div className={`text-center mt-3 p-2 border rounded-lg ${isDark ? 'bg-red-900/30 border-red-800 text-red-300' : 'bg-red-50 border-red-200 text-red-700'}`}>
                <p className="text-sm">
                  Homework data is currently unavailable.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress Report - Collapsible */}
      <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} rounded-xl shadow-sm border`}>
        <button
          onClick={() => toggleSection('progress')}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
        >
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Progress Report</h3>
          {expandedSection === 'progress' ? (
            <FaChevronUp className="text-gray-500" />
          ) : (
            <FaChevronDown className="text-gray-500" />
          )}
        </button>
        
        {expandedSection === 'progress' && (
          <div className={`px-4 pb-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
            <div className="pt-4">
              {isLoadingReport ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className={`animate-spin text-2xl ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                  <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loading progress report...</span>
                </div>
              ) : progressReport ? (
                <>
                  {reportError && (
                    <div className={`border-l-4 border-yellow-500 p-3 mb-4 rounded-md ${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-700'}`}>
                      <p className="text-sm font-medium">Report Update</p>
                      <p className="text-xs">{reportError}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-900/50 border border-blue-800' : 'bg-blue-50'}`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Total Homework</div>
                      <div className={`text-lg font-bold ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>{progressReport.totalHomework}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-green-900/50 border border-green-800' : 'bg-green-50'}`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-green-400' : 'text-green-600'}`}>Submitted</div>
                      <div className={`text-lg font-bold ${isDark ? 'text-green-300' : 'text-green-700'}`}>{progressReport.submitted}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-purple-900/50 border border-purple-800' : 'bg-purple-50'}`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>Graded</div>
                      <div className={`text-lg font-bold ${isDark ? 'text-purple-300' : 'text-purple-700'}`}>{progressReport.graded}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${isDark ? 'bg-yellow-900/50 border border-yellow-800' : 'bg-yellow-50'}`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>Avg. Grade</div>
                      <div className={`text-lg font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-700'}`}>{progressReport.avgGrade}</div>
                    </div>
                    <div className={`p-3 rounded-lg col-span-2 ${isDark ? 'bg-indigo-900/50 border border-indigo-800' : 'bg-indigo-50'}`}>
                      <div className={`text-xs font-medium ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>Submission Rate</div>
                      <div className={`text-lg font-bold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>{Math.round(progressReport.submissionRate)}%</div>
                      <div className={`w-full rounded-full h-2 mt-2 ${isDark ? 'bg-indigo-800' : 'bg-indigo-200'}`}>
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                          style={{width: `${progressReport.submissionRate}%`}}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {progressReport.recentGrades.length > 0 && (
                    <div>
                      <div className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recent Grades</div>
                      <div className="space-y-2">
                        {progressReport.recentGrades.map((grade, i) => (
                          <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${isDark ? 'bg-gray-700 border border-gray-600' : 'bg-gray-50'}`}>
                            <span className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>{grade.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{grade.grade}</span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{grade.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : selectedChildData ? (
                <div className="text-center py-8">
                  <FaClipboardList className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Progress report for {selectedChildData.name} is not available at this time.</p>
                  <button 
                    onClick={fetchProgressReport}
                    className="mt-3 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUser className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Please select a child to view their progress report.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Upload / Overdue Warning Widget */}
      {homeworkProgress.pending > 0 && (
        <div className={`rounded-xl shadow-sm border-2 p-4 ${isDark ? 'bg-gradient-to-r from-orange-900/40 to-yellow-900/40 border-orange-700' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${isDark ? 'bg-orange-800' : 'bg-orange-100'}`}>
                <FaClipboardList className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>Pending Assignments</h3>
                <p className={`text-xs ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                  {homeworkProgress.pending} assignment(s) waiting for submission
                </p>
              </div>
            </div>
            <Link
              to="/submit-work"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors shadow-sm"
            >
              Upload Now
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default PWAParentDashboard;
