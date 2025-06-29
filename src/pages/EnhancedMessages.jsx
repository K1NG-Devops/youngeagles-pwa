import React, { useState, useEffect, useRef } from 'react';
import { useEnhancedMessaging } from '../hooks/useEnhancedMessaging';
import { 
  FiSend, 
  FiSearch, 
  FiSmile, 
  FiMoreVertical, 
  FiArrowLeft,
  FiCheck,
  FiCheckCircle,
  FiCircle,
  FiAlertCircle,
  FiPhone,
  FiVideo
} from 'react-icons/fi';
// Using CSS transitions instead of framer-motion for better compatibility
// import { motion, AnimatePresence } from 'framer-motion';

// Add custom CSS for smooth animations
const styles = `
  .active\\:scale-98:active {
    transform: scale(0.98);
  }
  .hover\\:scale-105:hover {
    transform: scale(1.05);
  }
  .active\\:scale-95:active {
    transform: scale(0.95);
  }
  .hover\\:scale-125:hover {
    transform: scale(1.25);
  }
  .hover\\:scale-110:hover {
    transform: scale(1.1);
  }
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const EnhancedMessages = () => {
  const {
    isInitialized,
    conversations,
    currentConversation,
    messages,
    loading,
    error,
    searchResults,
    isSearching,
    loadConversations,
    sendMessage,
    addReaction,
    selectConversation,
    getUserPresence,
    getTypingIndicator,
    getMessageStatus,
    startTyping,
    stopTyping,
    searchMessages,
    clearSearch,
    clearError
  } = useEnhancedMessaging();

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(null);
  const [messagePriority, setMessagePriority] = useState('normal');
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const messagesEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message input changes with typing indicators
  const handleMessageChange = (e) => {
    setMessageText(e.target.value);
    
    if (currentConversation && e.target.value.trim()) {
      startTyping(currentConversation.id);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Stop typing after 3 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(currentConversation.id);
      }, 3000);
    } else if (currentConversation) {
      stopTyping(currentConversation.id);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || !currentConversation) return;

    const messageData = {
      recipientId: currentConversation.otherParticipant?.id,
      recipientType: currentConversation.otherParticipant?.type,
      message: messageText.trim(),
      priority: messagePriority,
      replyToMessageId: replyToMessage?.id || null
    };

    const success = await sendMessage(messageData);
    
    if (success) {
      setMessageText('');
      setMessagePriority('normal');
      setReplyToMessage(null);
      stopTyping(currentConversation.id);
    }
  };

  // Handle search
  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchMessages(searchQuery);
    }
  };

  // Get presence status display
  const getPresenceDisplay = (userId, userType) => {
    const presence = getUserPresence(userId, userType);
    const statusColors = {
      online: 'bg-green-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      offline: 'bg-gray-400'
    };
    
    return {
      color: statusColors[presence.status] || statusColors.offline,
      text: presence.status || 'offline',
      lastSeen: presence.lastSeen
    };
  };

  // Get message status icon
  const getMessageStatusIcon = (messageId, senderId, currentUserId) => {
    if (senderId !== currentUserId) return null;
    
    const status = getMessageStatus(messageId);
    
    switch (status) {
      case 'sent':
        return <FiCheck className="w-4 h-4 text-gray-400" />;
      case 'delivered':
        return <FiCheckCircle className="w-4 h-4 text-blue-500" />;
      case 'read':
        return <FiCheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <FiCircle className="w-4 h-4 text-gray-300" />;
    }
  };

  // Get priority indicator
  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'high':
        return <FiAlertCircle className="w-4 h-4 text-orange-500" />;
      case 'urgent':
        return <FiAlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Emoji reactions
  const commonEmojis = ['👍', '❤️', '😂', '😮', '😢', '😡', '👏', '🎉'];

  const handleAddReaction = async (messageId, emoji) => {
    await addReaction(messageId, emoji);
    setShowEmojiPicker(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing enhanced messaging...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-1/3 bg-white border-r border-gray-200 ${currentConversation ? 'hidden md:block' : 'block'}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Enhanced Messages</h1>
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FiSearch className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          
          {/* Search Bar */}
          {showSearch && (
            <form
              onSubmit={handleSearch}
              className="mb-4 transition-all duration-300 ease-in-out"
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              </div>
            </form>
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="p-4 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-blue-900">Search Results</h3>
              <button
                onClick={clearSearch}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {searchResults.map((result) => (
                <div key={result.id} className="p-2 bg-white rounded border text-sm">
                  <p className="text-gray-900 truncate">{result.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-4 text-center">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No conversations yet</p>
              <p className="text-sm mt-2">Start a conversation from the main Messages page</p>
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => {
                const presence = getPresenceDisplay(
                  conversation.otherParticipant?.id,
                  conversation.otherParticipant?.type
                );
                const isSelected = currentConversation?.id === conversation.id;
                
                return (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`p-4 cursor-pointer border-l-4 transition-all duration-200 hover:bg-gray-50 active:scale-98 ${
                      isSelected 
                        ? 'bg-blue-50 border-l-blue-500' 
                        : 'border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                          {conversation.otherParticipant?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${presence.color} rounded-full border-2 border-white`}></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-gray-900 truncate">
                            {conversation.otherParticipant?.name || 'Unknown'}
                          </h3>
                          <span className="text-xs text-gray-500">
                            {conversation.lastMessage ? 
                              new Date(conversation.lastMessage.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : ''
                            }
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mt-1">
                          {conversation.lastMessage?.message || 'No messages yet'}
                        </p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${presence.color === 'bg-green-500' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            {presence.text}
                          </span>
                          
                          {conversation.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col ${!currentConversation ? 'hidden md:flex' : 'flex'}`}>
        {currentConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => selectConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                  >
                    <FiArrowLeft className="w-5 h-5" />
                  </button>
                  
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {currentConversation.otherParticipant?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getPresenceDisplay(currentConversation.otherParticipant?.id, currentConversation.otherParticipant?.type).color} rounded-full border-2 border-white`}></div>
                  </div>
                  
                  <div>
                    <h2 className="font-medium text-gray-900">
                      {currentConversation.otherParticipant?.name || 'Unknown'}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {getPresenceDisplay(currentConversation.otherParticipant?.id, currentConversation.otherParticipant?.type).text}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiPhone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiVideo className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <FiMoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              <div className="text-center">
                <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-block mb-4">
                  🚀 Enhanced Messaging Features Active
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Real-time presence • Typing indicators • Message reactions • Read receipts
                </p>
              </div>

              {messages.map((message, index) => {
                const isOwnMessage = message.sender_id === currentConversation.currentUserId;
                const showAvatar = index === 0 || messages[index - 1].sender_id !== message.sender_id;
                
                return (
                  <div
                    key={message.id}
                    className={`flex group transition-all duration-300 ease-in-out ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                      <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                        {!isOwnMessage && showAvatar && (
                          <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-sm font-bold mb-1">
                            {message.sender_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        
                        <div className={`relative px-4 py-2 rounded-2xl ${
                          isOwnMessage 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                        }`}>
                          {/* Priority Indicator */}
                          {message.message_priority !== 'normal' && (
                            <div className="flex items-center space-x-1 mb-1">
                              {getPriorityIndicator(message.message_priority)}
                              <span className={`text-xs font-medium ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                                {message.message_priority.toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Reply Context */}
                          {message.reply_to_message && (
                            <div className={`p-2 mb-2 rounded border-l-4 ${
                              isOwnMessage 
                                ? 'bg-blue-400 border-blue-200' 
                                : 'bg-gray-100 border-gray-300'
                            }`}>
                              <p className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-600'}`}>
                                Replying to: {message.reply_to_message.message}
                              </p>
                            </div>
                          )}
                          
                          <p className="break-words">{message.message}</p>
                          
                          {/* Message Reactions */}
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {message.reactions.map((reaction, idx) => (
                                <span
                                  key={idx}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer hover:scale-110 transition-transform ${
                                    isOwnMessage 
                                      ? 'bg-blue-400 text-white' 
                                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                  }`}
                                  onClick={() => handleAddReaction(message.id, reaction.emoji)}
                                >
                                  {reaction.emoji} {reaction.count}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-gray-500'}`}>
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            
                            <div className="flex items-center space-x-1">
                              {getMessageStatusIcon(message.id, message.sender_id, currentConversation.currentUserId)}
                              
                              <button
                                onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                                className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${
                                  isOwnMessage ? 'hover:bg-blue-400' : 'hover:bg-gray-200'
                                }`}
                              >
                                <FiSmile className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Emoji Picker */}
                          {showEmojiPicker === message.id && (
                            <div
                              className="absolute bottom-full mb-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 flex space-x-1 z-10 transition-all duration-200 ease-in-out"
                            >
                              {commonEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  onClick={() => handleAddReaction(message.id, emoji)}
                                  className="hover:bg-gray-100 p-1 rounded text-lg hover:scale-125 transition-transform"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              
              {/* Typing Indicator */}
              {(() => {
                const typingIndicator = getTypingIndicator(currentConversation.id);
                if (typingIndicator) {
                  return (
                    <div
                      className="flex items-center space-x-2 text-gray-500 transition-all duration-300 ease-in-out"
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm">{typingIndicator.userName} is typing...</span>
                    </div>
                  );
                }
                return null;
              })()}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-4">
              {/* Reply Context */}
              {replyToMessage && (
                <div
                  className="mb-3 p-3 bg-gray-100 rounded-lg border-l-4 border-blue-500 transition-all duration-300 ease-in-out"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Replying to:</p>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {replyToMessage.message}
                      </p>
                    </div>
                    <button
                      onClick={() => setReplyToMessage(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Priority Selector */}
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-sm text-gray-600">Priority:</span>
                <select
                  value={messagePriority}
                  onChange={(e) => setMessagePriority(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    ref={messageInputRef}
                    value={messageText}
                    onChange={handleMessageChange}
                    placeholder="Type your enhanced message..."
                    rows={1}
                    className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    style={{ minHeight: '44px', maxHeight: '120px' }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white p-3 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <FiSend className="w-5 h-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                <FiSend className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Enhanced Messaging
              </h3>
              <p className="text-gray-500 mb-4">
                Select a conversation to start using enhanced features
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Real-time presence</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-500" />
                  <span>Read receipts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>💬</span>
                  <span>Typing indicators</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>😊</span>
                  <span>Message reactions</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Toast */}
      {error && (
        <div
          className="fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 transition-all duration-300 ease-in-out"
        >
          <FiAlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button
            onClick={clearError}
            className="ml-2 text-red-200 hover:text-white"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default EnhancedMessages; 