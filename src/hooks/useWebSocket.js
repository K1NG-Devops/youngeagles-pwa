import { useEffect, useState, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';
import useAuth from './useAuth';

const useWebSocket = () => {
  const { auth } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const listenersRef = useRef(new Map());

  // Initialize WebSocket connection
  useEffect(() => {
    if (auth?.user?.id && auth?.user?.role) {
      console.log('🔌 Initializing WebSocket connection for user:', auth.user.id);
      websocketService.connect(auth.user.id, auth.user.role);
    }

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      websocketService.disconnect();
    };
  }, [auth?.user?.id, auth?.user?.role]);

  // Setup event listeners
  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
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

    return websocketService.sendMessage(message);
  }, []);

  // Send typing indicator
  const sendTyping = useCallback((conversationId) => {
    websocketService.sendMessage({ type: 'typing', conversationId });
  }, []);

  // Add custom event listener
  const addEventListener = useCallback((event, callback) => {
    websocketService.subscribe(event, callback);
    
    // Keep track of listeners for cleanup
    if (!listenersRef.current.has(event)) {
      listenersRef.current.set(event, new Set());
    }
    listenersRef.current.get(event).add(callback);

    // Return cleanup function
    return () => {
      websocketService.unsubscribe(event, callback);
      const eventListeners = listenersRef.current.get(event);
      if (eventListeners) {
        eventListeners.delete(callback);
      }
    };
  }, []);

  // Remove event listener
  const removeEventListener = useCallback((event, callback) => {
    websocketService.unsubscribe(event, callback);
    
    const eventListeners = listenersRef.current.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
    }
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