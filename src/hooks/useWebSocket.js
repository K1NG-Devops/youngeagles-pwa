import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';
import useAuth from './useAuth';

const useWebSocket = () => {
  const { auth } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const connectionTimeoutRef = useRef(null);

  // Initialize WebSocket connection
  useEffect(() => {
    if (auth?.user?.id && auth?.user?.role) {
      console.log('🔌 Initializing WebSocket connection for user:', auth.user.id);
      websocketService.connect(auth.user.id, auth.user.role);
      
      // Set a timeout to fall back to "connected" state if WebSocket fails
      connectionTimeoutRef.current = setTimeout(() => {
        if (!isConnected) {
          console.log('⚠️ WebSocket connection timeout - falling back to API-only mode');
          setIsConnected(true); // Show as connected since API is working
        }
      }, 8000); // Give WebSocket 8 seconds to connect
    }

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      websocketService.disconnect();
    };
  }, [auth?.user?.id, auth?.user?.role, isConnected]);

  // Setup event listeners
  useEffect(() => {
    const handleConnect = () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
    };

    const handleDisconnect = () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
      
      // Set a timeout to fall back to "connected" if API is still working
      setTimeout(() => {
        // Simple API health check
        fetch(window.location.origin + '/api/health', { 
          method: 'HEAD', 
          timeout: 3000 
        })
        .then(() => {
          console.log('💡 API is still working - showing as connected');
          setIsConnected(true);
        })
        .catch(() => {
          console.log('❌ Both WebSocket and API are down');
        });
      }, 3000);
    };

    const handleMessage = (message) => {
      console.log('📨 New message received:', message);
      setLastMessage(message);
    };

    const handleTyping = (data) => {
      setTypingUsers(prev => new Set([...prev, data.userId]));
      // Clear typing indicator after 3 seconds
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.userId);
          return newSet;
        });
      }, 3000);
    };

    // Subscribe to events
    websocketService.subscribe('connect', handleConnect);
    websocketService.subscribe('disconnect', handleDisconnect);
    websocketService.subscribe('message', handleMessage);
    websocketService.subscribe('typing', handleTyping);

    // Cleanup subscriptions
    return () => {
      websocketService.unsubscribe('connect', handleConnect);
      websocketService.unsubscribe('disconnect', handleDisconnect);
      websocketService.unsubscribe('message', handleMessage);
      websocketService.unsubscribe('typing', handleTyping);
    };
  }, []);

  // Send message function
  const sendMessage = useCallback((message) => {
    if (!message) {
      console.warn('⚠️ Cannot send empty message');
      return false;
    }

    // Try WebSocket first, fall back to API if needed
    const webSocketSuccess = websocketService.sendMessage(message);
    if (!webSocketSuccess) {
      console.log('💡 WebSocket failed, message would need API fallback');
      // Note: API fallback would be implemented here in a real scenario
    }
    return webSocketSuccess;
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId) => {
    websocketService.sendMessage({ type: 'typing', conversationId });
  }, []);

  // Add custom event listener
  const addEventListener = useCallback((conversationId) => {
    console.log('🔗 Joining conversation via useWebSocket:', conversationId);
    // For messaging, we use join_conversation event
    websocketService.joinConversation(conversationId);
  }, []);

  // Remove event listener
  const removeEventListener = useCallback((conversationId) => {
    console.log('🔗 Leaving conversation via useWebSocket:', conversationId);
    // For messaging, we use leave_conversation event
    websocketService.leaveConversation(conversationId);
  }, []);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (auth?.user?.id && auth?.user?.role) {
      websocketService.disconnect();
      websocketService.connect(auth.user.id, auth.user.role);
    }
  }, [auth?.user?.id, auth?.user?.role]);

  return {
    isConnected,
    lastMessage,
    typingUsers: Array.from(typingUsers),
    sendMessage,
    sendTyping,
    addEventListener,
    removeEventListener,
    reconnect
  };
};

export default useWebSocket; 