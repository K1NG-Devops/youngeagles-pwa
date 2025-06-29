import React, { useState } from 'react';
import parentService from '../../services/parentService';
import { API_CONFIG } from '../../config/api';

const MessagingDebug = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
  };

  const testAuthentication = () => {
    addLog('🔍 Testing authentication status...', 'info');
    
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    const role = localStorage.getItem('role');
    
    addLog(`Token: ${token ? 'Present' : 'Missing'}`, token ? 'success' : 'error');
    addLog(`User: ${user ? 'Present' : 'Missing'}`, user ? 'success' : 'error');
    addLog(`Role: ${role || 'Not set'}`, role ? 'success' : 'warning');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        addLog(`User ID: ${userData.id}`, 'info');
        addLog(`User Email: ${userData.email}`, 'info');
        addLog(`User Role: ${userData.role}`, 'info');
      } catch {
        addLog('❌ Failed to parse user data', 'error');
      }
    }
  };

  const testContacts = async () => {
    setIsLoading(true);
    addLog('📞 Testing contacts API...', 'info');
    
    try {
      const result = await parentService.getAvailableContacts();
      addLog('✅ Contacts API call completed', 'success');
      addLog(`Response: ${JSON.stringify(result, null, 2)}`, 'info');
      
      if (result.error === 'AUTHENTICATION_FAILED') {
        addLog('🔐 Authentication failed for contacts endpoint', 'error');
      } else if (result.contacts) {
        addLog(`Found ${result.contacts.length} contacts`, 'success');
      }
    } catch (error) {
      addLog(`❌ Contacts API error: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const testAPI = () => {
    addLog('🌐 Testing API configuration...', 'info');
    addLog(`Base URL: ${API_CONFIG.getApiUrl()}`, 'info');
    addLog(`Contacts Endpoint: ${API_CONFIG.ENDPOINTS.GET_CONTACTS}`, 'info');
    addLog(`Full URL: ${API_CONFIG.getApiUrl()}${API_CONFIG.ENDPOINTS.GET_CONTACTS}`, 'info');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔧 Messaging Debug Panel</h2>
      
      <div className="flex gap-2 mb-4">
        <button 
          onClick={testAuthentication}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Auth
        </button>
        <button 
          onClick={testAPI}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test API Config
        </button>
        <button 
          onClick={testContacts}
          disabled={isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
        >
          {isLoading ? 'Testing...' : 'Test Contacts API'}
        </button>
        <button 
          onClick={clearLogs}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-gray-500">Click a button to start debugging...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className={`mb-1 ${
              log.type === 'error' ? 'text-red-400' : 
              log.type === 'success' ? 'text-green-400' : 
              log.type === 'warning' ? 'text-yellow-400' : 
              'text-white'
            }`}>
              <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MessagingDebug; 