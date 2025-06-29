import { useState, useEffect, useCallback, useRef } from 'react';
import enhancedMessagingService from '../services/enhancedMessagingService';
import useAuth from './useAuth';

export const useEnhancedMessaging = () => {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [presence, setPresence] = useState(new Map());
  const [typingIndicators, setTypingIndicators] = useState(new Map());
  const [messageStatuses, setMessageStatuses] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const typingTimeoutRef = useRef(null);
  const lastTypingTimeRef = useRef(0);

  // Initialize enhanced messaging service
  useEffect(() => {
    if (user && !isInitialized) {
      initializeService();
    }

    return () => {
      if (isInitialized) {
        enhancedMessagingService.disconnect();
        setIsInitialized(false);
        setIsConnected(false);
      }
    };
  }, [user, isInitialized]);

  const initializeService = async () => {
    try {
      setLoading(true);
      const success = await enhancedMessagingService.initialize(user);
      
      if (success) {
        setIsInitialized(true);
        setIsConnected(true);
        setupEventListeners();
        enhancedMessagingService.startHeartbeat();
        
        // Set initial presence to online
        await enhancedMessagingService.updatePresence('online');
        
        console.log('✅ Enhanced messaging initialized successfully');
      }
    } catch (error) {
      console.error('❌ Failed to initialize enhanced messaging:', error);
      setError('Failed to initialize messaging service');
    } finally {
      setLoading(false);
    }
  };

  const setupEventListeners = () => {
    // Presence updates
    enhancedMessagingService.on('presenceUpdate', (data) => {
      setPresence(prev => {
        const newPresence = new Map(prev);
        const userKey = `${data.userType}_${data.userId}`;
        newPresence.set(userKey, {
          status: data.status,
          lastSeen: data.lastSeen
        });
        return newPresence;
      });
    });

    // Typing indicators
    enhancedMessagingService.on('typingUpdate', (data) => {
      setTypingIndicators(prev => {
        const newTyping = new Map(prev);
        if (data.isTyping) {
          newTyping.set(data.conversationId, {
            userId: data.userId,
            userType: data.userType,
            userName: data.userName
          });
        } else {
          newTyping.delete(data.conversationId);
        }
        return newTyping;
      });
    });

    // Message status updates
    enhancedMessagingService.on('messageStatusUpdate', (data) => {
      setMessageStatuses(prev => {
        const newStatuses = new Map(prev);
        newStatuses.set(data.messageId, data.status);
        return newStatuses;
      });

      // Update message in current conversation
      if (currentConversation) {
        setMessages(prev => prev.map(msg => 
          msg.id === data.messageId 
            ? { ...msg, message_status: data.status, read_at: data.readAt }
            : msg
        ));
      }
    });

    // New message received
    enhancedMessagingService.on('newMessageReceived', (data) => {
      // Refresh conversations to show new message
      loadConversations();
      
      // If it's for current conversation, add to messages
      if (currentConversation && data.conversationId === currentConversation.id) {
        loadMessages(currentConversation.id);
      }
    });

    // Reaction added
    enhancedMessagingService.on('reactionAdded', (data) => {
      // Update message reactions in current conversation
      if (currentConversation) {
        setMessages(prev => prev.map(msg => {
          if (msg.id === data.messageId) {
            const updatedReactions = msg.reactions || [];
            const existingReactionIndex = updatedReactions.findIndex(r => r.emoji === data.emoji);
            
            if (existingReactionIndex >= 0) {
              updatedReactions[existingReactionIndex].count += 1;
            } else {
              updatedReactions.push({ emoji: data.emoji, count: 1 });
            }
            
            return { ...msg, reactions: updatedReactions };
          }
          return msg;
        }));
      }
    });
  };

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!isInitialized) return;

    try {
      setLoading(true);
      const conversationsData = await enhancedMessagingService.getEnhancedConversations();
      setConversations(conversationsData || []);
      
      // Update presence data
      conversationsData?.forEach(conv => {
        const userKey = `${conv.otherParticipant.type}_${conv.otherParticipant.id}`;
        setPresence(prev => {
          const newPresence = new Map(prev);
          newPresence.set(userKey, {
            status: conv.otherParticipant.presenceStatus,
            lastSeen: conv.otherParticipant.lastSeen
          });
          return newPresence;
        });
      });
    } catch (error) {
      console.error('❌ Failed to load conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  // Load messages for conversation
  const loadMessages = useCallback(async (conversationId, page = 1) => {
    if (!isInitialized || !conversationId) return;

    try {
      setLoading(true);
      const messagesData = await enhancedMessagingService.getEnhancedMessages(conversationId, page);
      
      if (page === 1) {
        setMessages(messagesData || []);
      } else {
        setMessages(prev => [...(messagesData || []), ...prev]);
      }

      // Join conversation room for real-time updates
      enhancedMessagingService.joinConversation(conversationId);

      // Mark messages as read
      const unreadMessages = messagesData?.filter(msg => 
        msg.recipient_id === user.id && 
        msg.message_status !== 'read'
      ) || [];

      for (const msg of unreadMessages) {
        await enhancedMessagingService.markMessageAsRead(
          msg.id, 
          msg.sender_id, 
          msg.sender_type
        );
      }
    } catch (error) {
      console.error('❌ Failed to load messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [isInitialized, user]);

  // Send enhanced message
  const sendMessage = useCallback(async (messageData) => {
    if (!isInitialized) return false;

    try {
      const result = await enhancedMessagingService.sendEnhancedMessage(messageData);
      
      if (result.success) {
        // Add message to current conversation immediately for better UX
        const newMessage = {
          id: result.messageId,
          message: messageData.message,
          sender_id: user.id,
          sender_type: user.role,
          recipient_id: messageData.recipientId,
          recipient_type: messageData.recipientType,
          message_status: 'sent',
          message_priority: messageData.priority || 'normal',
          created_at: new Date().toISOString(),
          reactions: []
        };

        if (currentConversation && 
            `${messageData.recipientId}_${messageData.recipientType}` === currentConversation.id) {
          setMessages(prev => [...prev, newMessage]);
        }

        // Refresh conversations to update last message
        loadConversations();
        
        return result;
      }
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setError('Failed to send message');
      return false;
    }
  }, [isInitialized, user, currentConversation, loadConversations]);

  // Add reaction to message
  const addReaction = useCallback(async (messageId, emoji) => {
    if (!isInitialized) return false;

    try {
      const result = await enhancedMessagingService.addReaction(messageId, emoji);
      return result.success;
    } catch (error) {
      console.error('❌ Failed to add reaction:', error);
      setError('Failed to add reaction');
      return false;
    }
  }, [isInitialized]);

  // Remove reaction from message
  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!isInitialized) return false;

    try {
      const result = await enhancedMessagingService.removeReaction(messageId, emoji);
      return result.success;
    } catch (error) {
      console.error('❌ Failed to remove reaction:', error);
      setError('Failed to remove reaction');
      return false;
    }
  }, [isInitialized]);

  // Update presence status
  const updatePresence = useCallback(async (status) => {
    if (!isInitialized) return false;

    try {
      const result = await enhancedMessagingService.updatePresence(status);
      return result.success;
    } catch (error) {
      console.error('❌ Failed to update presence:', error);
      return false;
    }
  }, [isInitialized]);

  // Typing indicator management
  const startTyping = useCallback((conversationId) => {
    if (!isInitialized || !conversationId) return;

    const now = Date.now();
    lastTypingTimeRef.current = now;

    // Only send typing indicator if we haven't sent one recently
    if (now - lastTypingTimeRef.current > 3000) {
      enhancedMessagingService.startTyping(conversationId);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      enhancedMessagingService.stopTyping(conversationId);
    }, 3000);
  }, [isInitialized]);

  const stopTyping = useCallback((conversationId) => {
    if (!isInitialized || !conversationId) return;

    enhancedMessagingService.stopTyping(conversationId);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [isInitialized]);

  // Search messages
  const searchMessages = useCallback(async (query, limit = 20, offset = 0) => {
    if (!isInitialized || !query.trim()) return;

    try {
      setIsSearching(true);
      const results = await enhancedMessagingService.searchMessages(query, limit, offset);
      
      if (offset === 0) {
        setSearchResults(results.messages || []);
      } else {
        setSearchResults(prev => [...prev, ...(results.messages || [])]);
      }
      
      return results;
    } catch (error) {
      console.error('❌ Failed to search messages:', error);
      setError('Failed to search messages');
      return null;
    } finally {
      setIsSearching(false);
    }
  }, [isInitialized]);

  // Clear search results
  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  // Select conversation
  const selectConversation = useCallback((conversation) => {
    // Leave previous conversation room
    if (currentConversation) {
      enhancedMessagingService.leaveConversation(currentConversation.id);
    }

    setCurrentConversation(conversation);
    setMessages([]);
    
    if (conversation) {
      loadMessages(conversation.id);
    }
  }, [currentConversation, loadMessages]);

  // Get user presence
  const getUserPresence = useCallback((userId, userType) => {
    const userKey = `${userType}_${userId}`;
    return presence.get(userKey) || { status: 'offline', lastSeen: null };
  }, [presence]);

  // Get typing indicator for conversation
  const getTypingIndicator = useCallback((conversationId) => {
    return typingIndicators.get(conversationId) || null;
  }, [typingIndicators]);

  // Get message status
  const getMessageStatus = useCallback((messageId) => {
    return messageStatuses.get(messageId) || 'sent';
  }, [messageStatuses]);

  // Auto-load conversations when initialized
  useEffect(() => {
    if (isInitialized) {
      loadConversations();
    }
  }, [isInitialized, loadConversations]);

  // Handle page visibility for presence updates
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isInitialized) {
        if (document.visibilityState === 'visible') {
          updatePresence('online');
        } else {
          updatePresence('away');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isInitialized, updatePresence]);

  return {
    // State
    isInitialized,
    isConnected,
    conversations,
    currentConversation,
    messages,
    presence,
    typingIndicators,
    messageStatuses,
    loading,
    error,
    searchResults,
    isSearching,

    // Actions
    loadConversations,
    loadMessages,
    sendMessage,
    addReaction,
    removeReaction,
    updatePresence,
    startTyping,
    stopTyping,
    searchMessages,
    clearSearch,
    selectConversation,

    // Getters
    getUserPresence,
    getTypingIndicator,
    getMessageStatus,

    // Utilities
    clearError: () => setError(null)
  };
}; 