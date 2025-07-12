import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { FaKey, FaUsers, FaPlus, FaCopy, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa';
import apiService from '../services/apiService';
import nativeNotificationService from '../services/nativeNotificationService';

const TeacherTokenManager = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [tokens, setTokens] = useState([]);
  const [linkedChildren, setLinkedChildren] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newTokenName, setNewTokenName] = useState('');
  const [maxChildren, setMaxChildren] = useState(20);
  const [showTokenValues, setShowTokenValues] = useState({});

  useEffect(() => {
    if (user?.userType === 'teacher') {
      loadTeacherTokens();
      loadLinkedChildren();
    }
  }, [user]);

  const loadTeacherTokens = async () => {
    try {
      const response = await apiService.get('/api/teacher/tokens');
      setTokens(response.data.tokens || []);
    } catch (error) {
      console.error('Error loading teacher tokens:', error);
      nativeNotificationService.error('Failed to load teacher tokens');
    }
  };

  const loadLinkedChildren = async () => {
    try {
      const response = await apiService.get('/api/teacher/linked-children');
      setLinkedChildren(response.data.linkedChildren || []);
    } catch (error) {
      console.error('Error loading linked children:', error);
      nativeNotificationService.error('Failed to load linked children');
    } finally {
      setIsLoading(false);
    }
  };

  const createToken = async () => {
    if (!newTokenName.trim()) {
      nativeNotificationService.error('Please enter a token name');
      return;
    }

    try {
      const response = await apiService.post('/api/teacher/generate-token', {
        tokenName: newTokenName,
        maxChildren
      });

      if (response.data.success) {
        nativeNotificationService.success('Teacher token created successfully!');
        setShowCreateModal(false);
        setNewTokenName('');
        setMaxChildren(20);
        loadTeacherTokens();
      }
    } catch (error) {
      console.error('Error creating teacher token:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create teacher token';
      nativeNotificationService.error(errorMessage);
    }
  };

  const deactivateToken = async (tokenId) => {
    if (!window.confirm('Are you sure you want to deactivate this token? Parents will no longer be able to use it to link their children.')) {
      return;
    }

    try {
      const response = await apiService.post(`/api/teacher/deactivate-token/${tokenId}`);
      if (response.data.success) {
        nativeNotificationService.success('Token deactivated successfully');
        loadTeacherTokens();
      }
    } catch (error) {
      console.error('Error deactivating token:', error);
      nativeNotificationService.error('Failed to deactivate token');
    }
  };

  const copyTokenToClipboard = (token) => {
    navigator.clipboard.writeText(token);
    nativeNotificationService.success('Token copied to clipboard!');
  };

  const toggleTokenVisibility = (tokenId) => {
    setShowTokenValues(prev => ({
      ...prev,
      [tokenId]: !prev[tokenId]
    }));
  };

  if (user?.userType !== 'teacher') {
    return (
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <p className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Teacher token management is only available for teachers.
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
            Teacher Token Management
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <FaPlus className="text-sm" />
            <span>Create Token</span>
          </button>
        </div>
        
        <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Create and manage tokens that allow parents to link their children to your class. 
          Each token can support up to 20 children.
        </p>
      </div>

      {/* Active Tokens */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Active Tokens ({tokens.length})
        </h3>
        
        {tokens.length === 0 ? (
          <div className="text-center py-8">
            <FaKey className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No active tokens. Create your first token to allow parents to link their children.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tokens.map((token) => (
              <div
                key={token.id}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {token.token_name}
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Created: {new Date(token.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => toggleTokenVisibility(token.id)}
                      className={`p-2 rounded ${
                        isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      title={showTokenValues[token.id] ? 'Hide token' : 'Show token'}
                    >
                      {showTokenValues[token.id] ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    <button
                      onClick={() => copyTokenToClipboard(token.token)}
                      className="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white"
                      title="Copy token"
                    >
                      <FaCopy />
                    </button>
                    <button
                      onClick={() => deactivateToken(token.id)}
                      className="p-2 rounded bg-red-500 hover:bg-red-600 text-white"
                      title="Deactivate token"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
                
                {showTokenValues[token.id] && (
                  <div className={`p-3 rounded bg-gray-100 ${isDark ? 'bg-gray-600' : 'bg-gray-100'} mb-3`}>
                    <p className={`text-sm font-mono ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {token.token}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <FaUsers className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {token.linked_children_count || 0} / {token.max_children} children
                      </span>
                    </div>
                    <div className={`text-sm px-2 py-1 rounded ${
                      token.subscription_status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {token.subscription_status}
                    </div>
                  </div>
                  
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, ((token.linked_children_count || 0) / token.max_children) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linked Children */}
      <div className={`p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Linked Children ({linkedChildren.length})
        </h3>
        
        {linkedChildren.length === 0 ? (
          <div className="text-center py-8">
            <FaUsers className={`text-4xl mx-auto mb-4 ${isDark ? 'text-gray-400' : 'text-gray-300'}`} />
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              No children linked yet. Share your tokens with parents to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {linkedChildren.map((child) => (
              <div
                key={`${child.id}-${child.linked_at}`}
                className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {child.name}
                </h4>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Parent: {child.parent_name}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Token: {child.token_name}
                </p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                  Linked: {new Date(child.linked_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Token Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`max-w-md w-full rounded-lg p-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Create Teacher Token
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Token Name
                </label>
                <input
                  type="text"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  placeholder="e.g., Grade 1 Class 2024"
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
              
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Maximum Children
                </label>
                <input
                  type="number"
                  value={maxChildren}
                  onChange={(e) => setMaxChildren(parseInt(e.target.value) || 20)}
                  min="1"
                  max="20"
                  className={`w-full p-3 rounded-lg border ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={createToken}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                Create Token
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
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

export default TeacherTokenManager; 