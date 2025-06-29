import React, { useState, useEffect } from 'react';
import { 
  FaTrash, FaEllipsisV, FaCheck, FaCheckDouble, FaClock, 
  FaExclamationCircle, FaHeart, FaThumbsUp, FaGrinBeam, 
  FaSurprise, FaFrown, FaAngry, FaSmile, FaReply
} from 'react-icons/fa';
import { format } from 'date-fns';
import { showTopNotification } from '../../utils/notifications';

const Message = ({ message, currentUser, onDelete, isDark, onReact, onReply }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const isOwnMessage = message.senderId === currentUser.id && message.senderType === currentUser.role;
  
  // Common reactions
  const commonReactions = [
    { emoji: '👍', icon: FaThumbsUp },
    { emoji: '❤️', icon: FaHeart },
    { emoji: '😂', icon: FaGrinBeam },
    { emoji: '😮', icon: FaSurprise },
    { emoji: '😢', icon: FaFrown },
    { emoji: '😡', icon: FaAngry }
  ];
  
  // Enhanced message status icons
  const getMessageStatusIcon = (status) => {
    const iconStyle = { fontSize: '12px' };
    
    switch (status) {
      case 'sending':
        return <FaClock style={{ ...iconStyle, color: '#8696A0' }} />;
      case 'sent':
        return <FaCheck style={{ ...iconStyle, color: '#8696A0' }} />;
      case 'delivered':
        return <FaCheckDouble style={{ ...iconStyle, color: '#8696A0' }} />;
      case 'read':
        return <FaCheckDouble style={{ ...iconStyle, color: '#53BDEB' }} />;
      case 'failed':
        return <FaExclamationCircle style={{ ...iconStyle, color: '#F15C6D' }} />;
      default:
        return <FaClock style={{ ...iconStyle, color: '#8696A0' }} />;
    }
  };
  
  // Priority indicator
  const getPriorityIndicator = (priority) => {
    if (!priority || priority === 'normal') return null;
    
    const color = priority === 'high' ? '#FF9500' : priority === 'urgent' ? '#FF3B30' : '#8696A0';
    return (
      <div className="flex items-center space-x-1 mb-1">
        <FaExclamationCircle style={{ color, fontSize: '12px' }} />
        <span style={{ color, fontSize: '10px', fontWeight: 'bold' }}>
          {priority.toUpperCase()}
        </span>
      </div>
    );
  };
  
  // Handle adding reaction
  const handleAddReaction = (emoji) => {
    if (onReact) {
      onReact(message.id, emoji);
    }
    setShowReactions(false);
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/messaging/messages/${message.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        showTopNotification('Message deleted successfully', 'success');
        onDelete(message.id);
      } else {
        showTopNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showTopNotification('Failed to delete message', 'error');
    }
    setShowOptions(false);
  };

  const renderMessageContent = () => {
    if (message.is_deleted) {
      return (
        <span className="italic text-gray-500 dark:text-gray-400">
          This message was deleted
        </span>
      );
    }

    if (message.message_type === 'emoji') {
      return (
        <span className="text-2xl">{message.content}</span>
      );
    }

    return message.content;
  };

  // Auto-mark received messages as read when they become visible
  useEffect(() => {
    if (!isOwnMessage && message.status !== 'read') {
      // Simulate marking message as read after a short delay
      const timer = setTimeout(() => {
        console.log(`📖 Marking message ${message.id} as read`);
        // Here you would typically call an API to mark the message as read
        // For now, we'll just update it locally
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [message.id, isOwnMessage, message.status]);

  return (
    <div className={`group relative flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`relative max-w-[70%] px-4 py-2 rounded-lg ${
          isOwnMessage
            ? 'bg-blue-500 text-white'
            : isDark
              ? 'bg-gray-700 text-white'
              : 'bg-gray-200 text-gray-800'
        }`}
      >
        {/* Sender name for group chats */}
        {message.group_id && !isOwnMessage && (
          <div className="text-xs font-semibold mb-1">
            {message.sender_name}
          </div>
        )}

        {/* Priority indicator */}
        {getPriorityIndicator(message.priority)}
        
        {/* Reply context */}
        {message.reply_to && (
          <div className={`p-2 mb-2 rounded border-l-4 ${
            isOwnMessage 
              ? 'bg-blue-400 border-blue-200' 
              : isDark 
                ? 'bg-gray-600 border-gray-400' 
                : 'bg-gray-100 border-gray-300'
          }`}>
            <p className="text-xs opacity-75">
              Replying to: {message.reply_to.content || message.reply_to.message}
            </p>
          </div>
        )}

        {/* Message content */}
        <div className="break-words">
          {renderMessageContent()}
        </div>
        
        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {message.reactions.map((reaction, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs cursor-pointer hover:scale-110 transition-transform ${
                  isOwnMessage 
                    ? 'bg-blue-400 text-white' 
                    : isDark 
                      ? 'bg-gray-600 text-white hover:bg-gray-500' 
                      : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
                onClick={() => handleAddReaction(reaction.emoji)}
              >
                {reaction.emoji} {reaction.count}
              </span>
            ))}
          </div>
        )}

        {/* Message metadata and actions */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            {/* Reply button */}
            {!message.is_deleted && onReply && (
              <button
                onClick={() => onReply(message)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
                title="Reply"
              >
                <FaReply className="text-xs opacity-75" />
              </button>
            )}
            
            {/* Reaction button */}
            {!message.is_deleted && (
              <div className="relative">
                <button
                  onClick={() => setShowReactions(!showReactions)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-black/10"
                  title="Add reaction"
                >
                  <FaSmile className="text-xs opacity-75" />
                </button>
                
                {/* Reaction picker */}
                {showReactions && (
                  <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                    {commonReactions.map((reaction) => (
                      <button
                        key={reaction.emoji}
                        onClick={() => handleAddReaction(reaction.emoji)}
                        className="hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded text-lg hover:scale-125 transition-transform"
                        title={reaction.emoji}
                      >
                        {reaction.emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-75">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
            {/* Enhanced message status for own messages */}
            {isOwnMessage && getMessageStatusIcon(message.status)}
          </div>
        </div>

        {/* Message options */}
        {!message.is_deleted && (isOwnMessage || currentUser.role === 'admin') && (
          <div className="absolute top-0 right-0 -mr-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`p-2 rounded-full ${
                isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
              }`}
            >
              <FaEllipsisV className={isDark ? 'text-gray-300' : 'text-gray-600'} />
            </button>

            {showOptions && (
              <div
                className={`absolute right-0 mt-1 py-1 rounded-lg shadow-lg ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-500
                    hover:bg-red-50 dark:hover:bg-red-900"
                >
                  <FaTrash />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message; 