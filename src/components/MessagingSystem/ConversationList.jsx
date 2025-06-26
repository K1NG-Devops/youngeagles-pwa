import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaUserCircle, FaChevronRight } from 'react-icons/fa';
import messagingService from '../../services/messagingService';
import useAuth from '../../hooks/useAuth';

const ConversationList = ({ onConversationSelect, onNewMessage }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    loadConversations();
    setupEventListeners();
    
    return () => {
      // Cleanup listeners when component unmounts
      messagingService.off('conversationsLoaded', handleConversationsLoaded);
      messagingService.off('newMessage', handleNewMessage);
    };
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      
      // Initialize messaging service if not already done
      if (!messagingService.isInitialized) {
        await messagingService.initialize(user.id, user.role);
      }
      
      const convs = await messagingService.loadConversations();
      setConversations(convs);
      
      // Load unread count
      const unread = await messagingService.getUnreadCount();
      setUnreadCount(unread.unreadCount || 0);
      
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    messagingService.on('conversationsLoaded', handleConversationsLoaded);
    messagingService.on('newMessage', handleNewMessage);
    messagingService.on('conversationCreated', handleConversationCreated);
    messagingService.on('unreadCountUpdated', handleUnreadCountUpdated);
  };

  const handleConversationsLoaded = (convs) => {
    setConversations(convs);
  };

  const handleNewMessage = ({ conversationId, message }) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              lastMessage: message.content,
              lastMessageTime: message.createdAt,
              unreadCount: (conv.unreadCount || 0) + 1
            }
          : conv
      )
    );
  };

  const handleConversationCreated = (conversation) => {
    setConversations(prev => [conversation, ...prev]);
  };

  const handleUnreadCountUpdated = (data) => {
    setUnreadCount(data.unreadCount || 0);
  };

  const filteredConversations = conversations.filter(conv =>
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherParticipant?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // Less than a day ago
    if (diff < 24 * 60 * 60 * 1000) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Less than a week ago
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' });
    }
    
    // Older
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-100';
      case 'teacher': return 'text-blue-600 bg-blue-100';
      case 'parent': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading conversations...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-gray-800">Messages</h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {unreadCount}
              </span>
            )}
            <button
              onClick={onNewMessage}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              title="New Message"
            >
              <FaPlus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FaUserCircle className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg font-medium">No conversations yet</p>
            <p className="text-sm">Start a new conversation to get started</p>
            <button
              onClick={onNewMessage}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="w-4 h-4 inline mr-2" />
              New Message
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map(conversation => (
              <div
                key={conversation.id}
                onClick={() => onConversationSelect(conversation)}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-start space-x-3">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUserCircle className="w-8 h-8 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {conversation.otherParticipant?.name || 'Unknown'}
                        </h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(conversation.otherParticipant?.role)}`}>
                          {conversation.otherParticipant?.role || 'user'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {conversation.unreadCount > 0 && (
                          <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {conversation.unreadCount}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                        <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                      </div>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 mb-1 truncate">
                      {conversation.subject}
                    </p>
                    
                    {conversation.lastMessage && (
                      <p className="text-sm text-gray-500 truncate">
                        {conversation.lastMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
