import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FaLink, FaUnlink, FaUser, FaChild, FaKey, FaCheck } from 'react-icons/fa';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';

const ParentTeacherLink = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [teacherLinks, setTeacherLinks] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [teacherToken, setTeacherToken] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');
  const [tokenValidation, setTokenValidation] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.userType === 'parent') {
      loadChildren();
      loadTeacherLinks();
    }
  }, [user]);

  const loadChildren = async () => {
    try {
      const response = await apiService.get('/api/parent/children');
      setChildren(response.data.children || []);
    } catch (error) {
      console.error('Error loading children:', error);
      nativeNotificationService.error('Failed to load children');
    }
  };

  const loadTeacherLinks = async () => {
    try {
      const response = await apiService.get('/api/parent/teacher-links');
      setTeacherLinks(response.data.links || []);
    } catch (error) {
      console.error('Error loading teacher links:', error);
      nativeNotificationService.error('Failed to load teacher links');
    } finally {
      setIsLoading(false);
    }
  };

  const validateTeacherToken = async (token) => {
    if (!token.trim()) {
      setTokenValidation(null);
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiService.post('/api/parent/validate-teacher-token', {
        teacherToken: token
      });

      if (response.data.success) {
        setTokenValidation(response.data.data);
      }
    } catch (error) {
      console.error('Error validating teacher token:', error);
      setTokenValidation(null);
      const errorMessage = error.response?.data?.error || 'Invalid token';
      nativeNotificationService.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const linkChildToTeacher = async () => {
    if (!teacherToken.trim() || !selectedChildId) {
      nativeNotificationService.error('Please select a child and enter a valid teacher token');
      return;
    }

    try {
      const response = await apiService.post('/api/parent/link-to-teacher', {
        teacherToken,
        childId: selectedChildId
      });

      if (response.data.success) {
        nativeNotificationService.success(response.data.message);
        setShowLinkModal(false);
        setTeacherToken('');
        setSelectedChildId('');
        setTokenValidation(null);
        loadTeacherLinks();
      }
    } catch (error) {
      console.error('Error linking child to teacher:', error);
      const errorMessage = error.response?.data?.error || 'Failed to link child to teacher';
      nativeNotificationService.error(errorMessage);
    }
  };

  const unlinkChildFromTeacher = async (childId, teacherToken) => {
    if (!window.confirm('Are you sure you want to unlink this child from the teacher?')) {
      return;
    }

    try {
      const response = await apiService.post('/api/parent/unlink-from-teacher', {
        childId,
        teacherToken
      });

      if (response.data.success) {
        nativeNotificationService.success(response.data.message);
        loadTeacherLinks();
      }
    } catch (error) {
      console.error('Error unlinking child from teacher:', error);
      const errorMessage = error.response?.data?.error || 'Failed to unlink child from teacher';
      nativeNotificationService.error(errorMessage);
    }
  };

  const handleTokenChange = (token) => {
    setTeacherToken(token);
    if (token.length > 10) { // Only validate if token looks substantial
      validateTeacherToken(token);
    } else {
      setTokenValidation(null);
    }
  };

  if (user?.userType !== 'parent') {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Teacher linking is only available for parents.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Teacher Connections
          </h2>
          <button
            onClick={() => setShowLinkModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaLink className="text-sm" />
            <span>Link Child to Teacher</span>
          </button>
        </div>
        
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Connect your children to their teachers using teacher tokens. This allows teachers to 
          track your child's progress and provide personalized learning experiences.
        </p>
      </div>

      {/* Current Links */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Current Teacher Links ({teacherLinks.length})
        </h3>
        
        {teacherLinks.length === 0 ? (
          <div className="text-center py-8">
            <FaLink className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No teacher connections yet. Ask your child's teacher for their token to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {teacherLinks.map((link, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FaChild className={`text-blue-500`} />
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {link.child_name}
                      </h4>
                    </div>
                    
                    <div className="flex items-center space-x-3 mb-2">
                      <FaUser className={`text-green-500`} />
                      <div>
                        <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                          {link.teacher_name}
                        </p>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {link.teacher_email}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <FaKey className={`text-purple-500`} />
                      <div>
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Class: {link.token_name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                          Connected: {new Date(link.linked_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => unlinkChildFromTeacher(link.child_id, link.teacher_token)}
                    className="p-2 rounded bg-red-500 hover:bg-red-600 text-white"
                    title="Unlink from teacher"
                  >
                    <FaUnlink />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Link Child to Teacher
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Select Child
                </label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                >
                  <option value="">Choose a child...</option>
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Teacher Token
                </label>
                <input
                  type="text"
                  value={teacherToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  placeholder="Enter the teacher token provided by your child's teacher"
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                {isValidating && (
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Validating token...
                  </p>
                )}
              </div>
              
              {tokenValidation && (
                <div className={`p-3 rounded-lg ${
                  tokenValidation.canLink 
                    ? 'bg-green-100 border border-green-200' 
                    : 'bg-yellow-100 border border-yellow-200'
                }`}>
                  <div className="flex items-center space-x-2 mb-2">
                    <FaCheck className={`text-green-600`} />
                    <p className="font-medium text-green-800">
                      Valid Token - {tokenValidation.teacherName}
                    </p>
                  </div>
                  <p className="text-sm text-green-700">
                    Class: {tokenValidation.tokenName}
                  </p>
                  <p className="text-sm text-green-700">
                    Available slots: {tokenValidation.availableSlots} / {tokenValidation.maxChildren}
                  </p>
                  {!tokenValidation.canLink && (
                    <p className="text-sm text-yellow-700 mt-2">
                      This class is at full capacity. Please contact the teacher.
                    </p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={linkChildToTeacher}
                disabled={!tokenValidation?.canLink || !selectedChildId}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  tokenValidation?.canLink && selectedChildId
                    ? 'bg-blue-500 hover:bg-blue-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Link Child
              </button>
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setTeacherToken('');
                  setSelectedChildId('');
                  setTokenValidation(null);
                }}
                className={`flex-1 py-2 px-4 rounded-lg ${
                  isDark 
                    ? 'bg-gray-600 hover:bg-gray-500 text-white' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentTeacherLink; 