import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService.js';
import { useTheme } from '../contexts/ThemeContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { FaChild, FaCalendarAlt, FaUser, FaArrowLeft, FaPhone, FaPlus, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import FeatureGuard, { useFeatureAccess } from '../components/FeatureGuard';
import { InFeedNativeAd } from '../components/AdSenseComponents';

const Children = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { getCurrentPlan, canAddChild } = useSubscription();
  const { checkChildLimit } = useFeatureAccess();
  const [children, setChildren] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const currentPlan = getCurrentPlan();
  const maxChildren = currentPlan?.features.maxChildren;

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        setIsLoading(true);
        
        let response;

        if (user?.userType === 'parent') {
          // Parents can only see their own children
          response = await apiService.children.getByParent(user.id);
        } else {
          // Teachers and admins can see all children
          response = await apiService.children.getAll();
        }

        setChildren(response.data.children || []);
      } catch (error) {
        console.error('Error fetching children:', error);
        nativeNotificationService.error('Failed to load children data');
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchChildren();
    }
  }, [user]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading children...</p>
        </div>
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-6`}>
        <div className={`max-w-4xl mx-auto px-4 sm:px-6 text-center p-8 rounded-lg shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <FaChild className={`text-6xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No Children Found</h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {user?.userType === 'parent' 
              ? 'You don\'t have any children registered yet.' 
              : 'No children are currently registered in the system.'
            }
          </p>
          {user?.userType !== 'parent' && (
            <FeatureGuard feature="maxChildren" showUpgrade={true} blockAccess={false}>
              <button 
                onClick={() => {
                  if (checkChildLimit()) {
                    nativeNotificationService.info('Add child feature coming soon!');
                  }
                }}
                className={`mt-4 px-6 py-3 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaPlus className="inline mr-2" />
                Add First Child
              </button>
            </FeatureGuard>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pt-4 pb-8`}>
      <div className="max-w-6xl mx-auto px-2 sm:px-6 space-y-6">
        {/* Header */}       
        <div className={`p-2 mt-4 rounded-lg shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className={`inline-flex px-2 items-center py-2 rounded-lg transition-colors ${isDark
                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
            </button>
            <div>
              <h2 className={`text-2xl mr-8 font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {user?.userType === 'parent' ? 'My Children' : 'All Children'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                Total: {children.length} {children.length === 1 ? 'child' : 'children'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-800'}`}>
                <FaChild className="inline mr-2" />
                {children.length}
                {maxChildren !== -1 && (
                  <span className="text-xs ml-1">/ {maxChildren}</span>
                )}
              </div>
              
              {user?.userType !== 'parent' && (
                <button 
                  onClick={() => {
                    if (checkChildLimit()) {
                      nativeNotificationService.info('Add child feature coming soon!');
                    }
                  }}
                  disabled={!canAddChild()}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                    canAddChild()
                      ? isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {canAddChild() ? (
                    <>
                      <FaPlus className="w-4 h-4 mr-2" />
                      Add Child
                    </>
                  ) : (
                    <>
                      <FaLock className="w-4 h-4 mr-2" />
                      Limit Reached
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {children.map((child) => (
            <div key={child.id} className={`p-6 rounded-lg shadow-sm border transition-all hover:shadow-md ${isDark ? 'bg-gray-800 border-gray-700 hover:bg-gray-750' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              {/* Child Header */}
              <div className="flex items-center mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${isDark ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'}`}>
                  {child.first_name ? child.first_name.charAt(0) : child.name?.charAt(0) || '?'}
                </div>
                <div className="ml-3">
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {child.first_name && child.last_name ? `${child.first_name} ${child.last_name}` : child.name}
                  </h3>
                  {child.class_name && (
                    <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'} font-medium`}>
                      {child.class_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Child Details */}
              <div className="space-y-3">
                {child.age && (
                  <div className="flex items-center">
                    <FaCalendarAlt className={`w-4 h-4 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Age:</strong> {child.age} years old
                    </span>
                  </div>
                )}

                {child.date_of_birth && (
                  <div className="flex items-center">
                    <FaCalendarAlt className={`w-4 h-4 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>DOB:</strong> {new Date(child.date_of_birth).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {child.parent_name && (
                  <div className="flex items-center">
                    <FaUser className={`w-4 h-4 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Parent:</strong> {child.parent_name}
                    </span>
                  </div>
                )}

                {child.emergency_contact && (
                  <div className="flex items-center">
                    <FaPhone className={`w-4 h-4 mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <strong>Emergency:</strong> {child.emergency_contact}
                    </span>
                  </div>
                )}

                {!child.class_name && (
                  <div className={`text-xs px-2 py-1 rounded-full inline-block ${isDark ? 'bg-yellow-900 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`}>
                    Not assigned to class
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-6 flex space-x-3">
                <button 
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                  onClick={() => nativeNotificationService.info('View details feature coming soon!')}
                >
                  View Details
                </button>
                {user?.userType !== 'parent' && (
                  <button 
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    }`}
                    onClick={() => nativeNotificationService.info('Edit feature coming soon!')}
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions (for non-parents) */}
        {user?.userType !== 'parent' && (
          <div className={`p-6 rounded-lg shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={() => nativeNotificationService.info('Add child feature coming soon!')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                + Add Child
              </button>
              <button 
                onClick={() => nativeNotificationService.info('Bulk import feature coming soon!')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Import Children
              </button>
              <button 
                onClick={() => nativeNotificationService.info('Export feature coming soon!')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-yellow-500 hover:bg-yellow-600 text-white'
                }`}
              >
                Export List
              </button>
            </div>
          </div>
        )}
        
        {/* Single Content Ad */}
        <InFeedNativeAd />
      </div>
    </div>
  );
};

export default Children; 