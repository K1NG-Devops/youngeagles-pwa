import React, { useState, useEffect, useRef } from 'react';
import { FaArrowLeft, FaPaperPlane, FaUserCircle, FaSpinner } from 'react-icons/fa';
import messagingService from '../../services/messagingService';
import useAuth from '../../hooks/useAuth';

const MessageThread = ({ conversation, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (conversation) {
      loadMessages();
      setupEventListeners();
      
      // Mark conversation as read
      markAsRead();
    }
    
    return () => {
      messagingService.off('messageAdded', handleMessageAdded);
      messagingService.off('newMessage', handleNewMessage);
    };
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async (pageNum = 1) => {
    if (!conversation?.id) return;
    
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const result = await messagingService.loadMessages(conversation.id, pageNum);
      
      if (pageNum === 1) {
        setMessages(result);
      } else {
        // Prepend older messages
        setMessages(prev => [...result, ...prev]);
      }
      
      setHasMore(result.length === 50); // Assuming 50 is the limit
      setPage(pageNum);
      
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const setupEventListeners = () => {
    messagingService.on('messageAdded', handleMessageAdded);
    messagingService.on('newMessage', handleNewMessage);
  };

  const handleMessageAdded = ({ conversationId, message }) => {
    if (conversationId === conversation?.id) {
      setMessages(prev => [...prev, message]);
    }
  };

  const handleNewMessage = ({ conversationId, message }) => {
    if (conversationId === conversation?.id) {
      setMessages(prev => [...prev, message]);
      markAsRead();
    }
  };

  const markAsRead = async () => {
    if (!conversation?.id) return;
    
    try {
      // Mark conversation as read (this will mark all messages as read)
      await messagingService.markMessageAsRead(conversation.id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() || sending) return;
    
    setSending(true);
    try {
      await messagingService.sendMessage(conversation.id, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMoreMessages = () => {
    if (!loadingMore && hasMore) {
      loadMessages(page + 1);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      const date = formatDate(message.createdAt);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'text-red-600';
      case 'teacher': return 'text-blue-600';
      case 'parent': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading messages...</span>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="bg-white rounded-lg shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <FaUserCircle className="w-6 h-6 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {conversation.otherParticipant?.name || 'Unknown User'}
            </h3>
            <p className="text-sm text-gray-500 truncate">
              <span className={getRoleColor(conversation.otherParticipant?.role)}>
                {conversation.otherParticipant?.role || 'user'}
              </span>
              {' • '}
              {conversation.subject}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {/* Load More Button */}
        {hasMore && (
          <div className="text-center">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50"
            >
              {loadingMore ? (
                <>
                  <FaSpinner className="animate-spin inline mr-2" />
                  Loading...
                </>
              ) : (
                'Load older messages'
              )}
            </button>
          </div>
        )}

        {/* Messages grouped by date */}
        {Object.entries(messageGroups).map(([date, dateMessages]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex justify-center mb-4">
              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                {date}
              </span>
            </div>
            
            {/* Messages for this date */}
            <div className="space-y-3">
              {dateMessages.map((message, index) => {
                const isOwn = message.isOwn || (message.senderId === user.id && message.senderType === user.role);
                const showAvatar = !isOwn && (index === 0 || dateMessages[index - 1].senderId !== message.senderId);
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
                  >
                    {/* Avatar for received messages */}
                    {!isOwn && (
                      <div className={`flex-shrink-0 mr-2 ${showAvatar ? '' : 'invisible'}`}>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <FaUserCircle className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    )}
                    
                    <div className={`max-w-xs lg:max-w-md ${isOwn ? 'ml-auto' : ''}`}>
                      {/* Sender name for received messages */}
                      {!isOwn && showAvatar && (
                        <div className="text-xs text-gray-500 mb-1 ml-2">
                          {message.senderName}
                        </div>
                      )}
                      
                      {/* Message bubble */}
                      <div
                        className={`px-4 py-2 rounded-lg ${
                          isOwn
                            ? 'bg-blue-600 text-white ml-auto'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* Message status and time */}
                        <div className={`text-xs mt-1 ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                          {formatTime(message.createdAt)}
                          {isOwn && message.status && (
                            <span className="ml-2">
                              {message.status === 'sending' && '⏳'}
                              {message.status === 'sent' && '✓'}
                              {message.status === 'delivered' && '✓✓'}
                              {message.status === 'failed' && '❌'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <form onSubmit={sendMessage} className="flex items-end space-x-2">
          <div className="flex-1">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="w-full resize-none border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="1"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(e);
                }
              }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sending ? (
              <FaSpinner className="w-4 h-4 animate-spin" />
            ) : (
              <FaPaperPlane className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageThread;
