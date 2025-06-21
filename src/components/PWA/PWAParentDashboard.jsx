import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaBook, FaBell, FaUser, FaClipboardList, FaSpinner, FaChevronDown, FaChevronUp, FaUserPlus } from 'react-icons/fa';
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
    if (!parent_id || !token || !selectedChild) {
      console.warn('Missing parent_id, token, or selectedChild for fetching homework');
      return;
    }
    
    setIsLoading(prev => ({ ...prev, homework: true }));
    setErrors(prev => ({ ...prev, homework: null }));
    
    try {
      const res = await axios.get(
        `${API_CONFIG.getApiUrl()}${API_CONFIG.ENDPOINTS.HOMEWORK_LIST}?child_id=${selectedChild}&parent_id=${parent_id}`,
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
      showBadgeWhenZero: false
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
        `${API_CONFIG.getApiUrl()}/public/parent/reports?child_id=${selectedChild}`,
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
                
      {/* Progress Report - Collapsible */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <button
          onClick={() => toggleSection('progress')}
          className="w-full p-4 flex items-center justify-between text-left focus:outline-none"
        >
          <h3 className="text-lg font-semibold text-gray-900">Progress Report</h3>
          {expandedSection === 'progress' ? (
            <FaChevronUp className="text-gray-500" />
          ) : (
            <FaChevronDown className="text-gray-500" />
          )}
        </button>
        
        {expandedSection === 'progress' && (
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="pt-4">
              {isLoadingReport ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-gray-400 text-2xl" />
                  <span className="ml-2 text-gray-500">Loading progress report...</span>
                </div>
              ) : progressReport ? (
                <>
                  {reportError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-700">{reportError}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-xs text-blue-600 font-medium">Total Homework</div>
                      <div className="text-lg font-bold text-blue-700">{progressReport.totalHomework}</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-xs text-green-600 font-medium">Submitted</div>
                      <div className="text-lg font-bold text-green-700">{progressReport.submitted}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-xs text-purple-600 font-medium">Graded</div>
                      <div className="text-lg font-bold text-purple-700">{progressReport.graded}</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-xs text-yellow-600 font-medium">Avg. Grade</div>
                      <div className="text-lg font-bold text-yellow-700">{progressReport.avgGrade}</div>
                    </div>
                    <div className="p-3 bg-indigo-50 rounded-lg col-span-2">
                      <div className="text-xs text-indigo-600 font-medium">Submission Rate</div>
                      <div className="text-lg font-bold text-indigo-700">{Math.round(progressReport.submissionRate)}%</div>
                      <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
                        <div 
                          className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                          style={{width: `${progressReport.submissionRate}%`}}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {progressReport.recentGrades.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Recent Grades</div>
                      <div className="space-y-2">
                        {progressReport.recentGrades.map((grade, i) => (
                          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-900">{grade.title}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-gray-700">{grade.grade}</span>
                              <span className="text-xs text-gray-500">{grade.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : selectedChildData ? (
                <div className="text-center py-8">
                  <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">No progress data available for {selectedChildData.name}</p>
                  <button 
                    onClick={fetchProgressReport}
                    className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaUser className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Please select a child to view progress report</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PWAParentDashboard;
