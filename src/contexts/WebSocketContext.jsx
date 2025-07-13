import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { API_BASE_URL } from '../services/apiService';

const WebSocketContext = createContext();

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider = ({ children }) => {
  const { user, token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !token || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const newSocket = io(API_BASE_URL, {
      auth: {
        token
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
    });

    // Notification events
    newSocket.on('notification:count', (data) => {
      setNotificationCount(data.count);
    });

    newSocket.on('notification:new', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setNotificationCount(prev => prev + 1);
    });

    newSocket.on('notification:error', (error) => {
      console.error('Notification error:', error);
    });

    // Profile events
    newSocket.on('profile:updated', (profile) => {
      // This would typically trigger a context update
      // For now, we'll just log it
      console.log('Profile updated:', profile);
    });

    newSocket.on('profile:error', (error) => {
      console.error('Profile error:', error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token, user]);

  // Methods to interact with the WebSocket
  const refreshNotifications = useCallback(() => {
    if (socket && connected) {
      socket.emit('notification:refresh');
    }
  }, [socket, connected]);

  const refreshProfile = useCallback(() => {
    if (socket && connected) {
      socket.emit('profile:refresh');
    }
  }, [socket, connected]);

  const markNotificationAsRead = useCallback((notificationId) => {
    if (socket && connected) {
      socket.emit('notification:read', { notificationId });
      // Optimistically update the count
      setNotificationCount(prev => Math.max(0, prev - 1));
    }
  }, [socket, connected]);

  const markAllNotificationsAsRead = useCallback(() => {
    if (socket && connected) {
      socket.emit('notification:read-all');
      setNotificationCount(0);
    }
  }, [socket, connected]);

  const value = {
    socket,
    connected,
    notificationCount,
    notifications,
    refreshNotifications,
    refreshProfile,
    markNotificationAsRead,
    markAllNotificationsAsRead
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
