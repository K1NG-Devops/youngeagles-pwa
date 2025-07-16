import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FaBell, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import pushNotificationService from '../services/pushNotificationService';

const NotificationTester = () => {
  const { isDark } = useTheme();
  const [status, setStatus] = useState('idle');
  const [permissionStatus, setPermissionStatus] = useState('unknown');
  const [subscriptionStatus, setSubscriptionStatus] = useState('unknown');
  const [testResult, setTestResult] = useState('');

  const checkStatus = async () => {
    setStatus('checking');
    try {
      const notificationStatus = await pushNotificationService.getNotificationStatus();
      setPermissionStatus(notificationStatus.permission);
      setSubscriptionStatus(notificationStatus.isSubscribed ? 'subscribed' : 'not subscribed');
      setStatus('ready');
    } catch (error) {
      console.error('Error checking notification status:', error);
      setStatus('error');
    }
  };

  const requestPermission = async () => {
    setStatus('requesting');
    try {
      const granted = await pushNotificationService.requestPermission();
      setPermissionStatus(granted ? 'granted' : 'denied');
      setStatus('ready');
    } catch (error) {
      console.error('Error requesting permission:', error);
      setStatus('error');
    }
  };

  const subscribe = async () => {
    setStatus('subscribing');
    try {
      await pushNotificationService.subscribe();
      setSubscriptionStatus('subscribed');
      setStatus('ready');
    } catch (error) {
      console.error('Error subscribing:', error);
      setStatus('error');
    }
  };

  const sendTestNotification = async () => {
    setStatus('testing');
    try {
      await pushNotificationService.testPushNotification();
      setTestResult('✅ Test notification sent successfully!');
      setStatus('ready');
    } catch (error) {
      console.error('Error sending test notification:', error);
      setTestResult('❌ Failed to send test notification');
      setStatus('error');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'granted':
      case 'subscribed':
        return 'text-green-600';
      case 'denied':
        return 'text-red-600';
      case 'default':
      case 'not subscribed':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`p-6 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-3 mb-6">
        <FaBell className={`text-2xl ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Push Notification Tester
        </h3>
      </div>

      <div className="space-y-4">
        {/* Status Section */}
        <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Current Status</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Permission:</span>
              <span className={`ml-2 font-medium ${getStatusColor(permissionStatus)}`}>
                {permissionStatus}
              </span>
            </div>
            <div>
              <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Subscription:</span>
              <span className={`ml-2 font-medium ${getStatusColor(subscriptionStatus)}`}>
                {subscriptionStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={checkStatus}
            disabled={status === 'checking'}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {status === 'checking' ? 'Checking...' : 'Check Status'}
          </button>

          {permissionStatus !== 'granted' && (
            <button
              onClick={requestPermission}
              disabled={status === 'requesting'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-orange-500 text-white hover:bg-orange-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === 'requesting' ? 'Requesting...' : 'Request Permission'}
            </button>
          )}

          {permissionStatus === 'granted' && subscriptionStatus !== 'subscribed' && (
            <button
              onClick={subscribe}
              disabled={status === 'subscribing'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-green-500 text-white hover:bg-green-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {status === 'subscribing' ? 'Subscribing...' : 'Subscribe'}
            </button>
          )}

          {permissionStatus === 'granted' && subscriptionStatus === 'subscribed' && (
            <button
              onClick={sendTestNotification}
              disabled={status === 'testing'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                isDark
                  ? 'bg-purple-600 text-white hover:bg-purple-700'
                  : 'bg-purple-500 text-white hover:bg-purple-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <FaPlay className="w-3 h-3" />
              {status === 'testing' ? 'Testing...' : 'Send Test Notification'}
            </button>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`p-3 rounded-lg ${
            testResult.includes('✅') 
              ? (isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-100 text-green-800')
              : (isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-100 text-red-800')
          }`}>
            {testResult}
          </div>
        )}

        {/* Instructions */}
        <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
          isDark ? 'bg-blue-900/20 text-blue-300' : 'bg-blue-50 text-blue-800'
        }`}>
          <h5 className="font-semibold mb-2">Instructions:</h5>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>First, check your current notification status</li>
            <li>If permission is not granted, click "Request Permission"</li>
            <li>If not subscribed, click "Subscribe" to enable push notifications</li>
            <li>Once subscribed, click "Send Test Notification" to test the functionality</li>
            <li>The notification should appear even if the app is in the background</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NotificationTester;
