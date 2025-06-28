import React, { useState, useEffect } from 'react';
import { 
  FaWifi, 
  FaTimes, 
  FaBell, 
  FaBellSlash, 
  FaPlay, 
  FaStop, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaInfoCircle,
  FaRedo,
  FaCog
} from 'react-icons/fa';
import websocketService from '../services/websocketService.js';
import webPushService from '../services/webPushService.js';
import notificationManager from '../services/notificationManager.js';

const NotificationDebugger = () => {
  const [status, setStatus] = useState({
    websocket: { connected: false },
    webPush: { isSupported: false, isSubscribed: false },
    app: { visible: true, focused: true },
    preferences: {}
  });
  const [logs, setLogs] = useState([]);
  const [testMessage, setTestMessage] = useState('Test notification message');

  useEffect(() => {
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = () => {
    const currentStatus = notificationManager.getStatus();
    setStatus(currentStatus);
  };

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { timestamp, message, type, id: Date.now() },
      ...prev.slice(0, 19) // Keep only last 20 logs
    ]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Test functions
  const testWebSocketConnection = async () => {
    addLog('Testing WebSocket connection...', 'info');
    try {
      websocketService.reconnect();
      addLog('WebSocket reconnection initiated', 'success');
    } catch (error) {
      addLog(`WebSocket test failed: ${error.message}`, 'error');
    }
  };

  const testWebPushSubscription = async () => {
    addLog('Testing Web Push subscription...', 'info');
    try {
      await webPushService.subscribe();
      addLog('Web Push subscription successful', 'success');
      updateStatus();
    } catch (error) {
      addLog(`Web Push subscription failed: ${error.message}`, 'error');
    }
  };

  const testInAppNotification = () => {
    addLog('Testing in-app notification...', 'info');
    notificationManager.showNotification(testMessage, 'info');
    addLog('In-app notification sent', 'success');
  };

  const testBackgroundNotification = async () => {
    addLog('Testing background notification...', 'info');
    try {
      await webPushService.showLocalNotification('Background Test', {
        body: testMessage,
        icon: '/icon-192x192.png'
      });
      addLog('Background notification sent', 'success');
    } catch (error) {
      addLog(`Background notification failed: ${error.message}`, 'error');
    }
  };

  const testSocketMessage = () => {
    addLog('Testing Socket.IO message send...', 'info');
    const success = websocketService.sendMessage({
      type: 'test',
      message: testMessage,
      timestamp: new Date().toISOString()
    });
    
    if (success) {
      addLog('Socket.IO message sent successfully', 'success');
    } else {
      addLog('Socket.IO message failed to send', 'error');
    }
  };

  const toggleNotificationPreference = (key) => {
    const newPrefs = {
      ...status.preferences,
      [key]: !status.preferences[key]
    };
    notificationManager.updatePreferences(newPrefs);
    addLog(`Toggled ${key}: ${newPrefs[key]}`, 'info');
    updateStatus();
  };

  const getStatusColor = (isConnected) => {
    return isConnected ? 'text-green-500' : 'text-red-500';
  };

  const getStatusIcon = (isConnected) => {
    return isConnected ? FaCheckCircle : FaExclamationCircle;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔔 Notification System Debugger
        </h2>
        <button
          onClick={updateStatus}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FaRedo />
          Refresh Status
        </button>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* WebSocket Status */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Socket.IO</h3>
            {status.websocket.connected ? (
              <FaWifi className="text-green-500" />
            ) : (
              <FaTimes className="text-red-500" />
            )}
          </div>
          <p className={`text-sm ${getStatusColor(status.websocket.connected)}`}>
            {status.websocket.connected ? 'Connected' : 'Disconnected'}
          </p>
          {status.websocket.userId && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              User: {status.websocket.userId}
            </p>
          )}
        </div>

        {/* Web Push Status */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Web Push</h3>
            {status.webPush.isSubscribed ? (
              <FaBell className="text-green-500" />
            ) : (
              <FaBellSlash className="text-red-500" />
            )}
          </div>
          <p className={`text-sm ${getStatusColor(status.webPush.isSupported)}`}>
            {status.webPush.isSupported ? 'Supported' : 'Not Supported'}
          </p>
          <p className={`text-xs ${getStatusColor(status.webPush.isSubscribed)}`}>
            {status.webPush.isSubscribed ? 'Subscribed' : 'Not Subscribed'}
          </p>
        </div>

        {/* App State */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">App State</h3>
            <FaInfoCircle className="text-blue-500" />
          </div>
          <p className={`text-sm ${getStatusColor(status.app.visible)}`}>
            {status.app.visible ? 'Visible' : 'Hidden'}
          </p>
          <p className={`text-xs ${getStatusColor(status.app.focused)}`}>
            {status.app.focused ? 'Focused' : 'Blurred'}
          </p>
        </div>

        {/* Notification Queue */}
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white">Queue</h3>
            <FaCog className="text-gray-500" />
          </div>
          <p className="text-sm text-gray-900 dark:text-white">
            {status.queueSize || 0} items
          </p>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Notification Preferences</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(status.preferences).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={() => toggleNotificationPreference(key)}
                className="rounded"
              />
              <span className="text-sm text-gray-900 dark:text-white capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Test Controls */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Test Controls</h3>
        
        <div className="mb-4">
          <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
            Test Message:
          </label>
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Enter test message..."
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <button
            onClick={testWebSocketConnection}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <FaWifi className="text-sm" />
            <span className="text-sm">Test WebSocket</span>
          </button>

          <button
            onClick={testWebPushSubscription}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <FaBell className="text-sm" />
            <span className="text-sm">Test Push</span>
          </button>

          <button
            onClick={testInAppNotification}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            <FaPlay className="text-sm" />
            <span className="text-sm">In-App</span>
          </button>

          <button
            onClick={testBackgroundNotification}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            <FaStop className="text-sm" />
            <span className="text-sm">Background</span>
          </button>

          <button
            onClick={testSocketMessage}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <FaWifi className="text-sm" />
            <span className="text-sm">Socket Msg</span>
          </button>
        </div>
      </div>

      {/* Debug Logs */}
      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Debug Logs</h3>
          <button
            onClick={clearLogs}
            className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Clear Logs
          </button>
        </div>
        
        <div className="bg-black text-green-400 p-3 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-gray-500">No logs yet...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`mb-1 ${
                log.type === 'error' ? 'text-red-400' : 
                log.type === 'success' ? 'text-green-400' : 
                log.type === 'warning' ? 'text-yellow-400' : 
                'text-blue-400'
              }`}>
                <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDebugger;
