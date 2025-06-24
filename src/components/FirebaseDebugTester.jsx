import React, { useState, useEffect } from 'react';
import { auth, testFirebaseConnection, diagnoseFirebaseIssues } from '../firebase';
import { signInAnonymously, signOut } from 'firebase/auth';

const FirebaseDebugTester = () => {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (testName, status, message, data = null) => {
    const result = {
      id: Date.now() + Math.random(),
      testName,
      status, // 'success', 'error', 'loading', 'warning'
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setTestResults(prev => [...prev, result]);
    return result;
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const runFirebaseTests = async () => {
    setIsLoading(true);
    clearResults();

    // Test 1: Basic Configuration
    addResult('Firebase Config', 'loading', 'Checking Firebase configuration...');
    try {
      if (auth) {
        addResult('Firebase Config', 'success', 'Firebase Auth service is available', {
          currentUser: auth.currentUser?.email || 'No user signed in',
          app: auth.app?.name || 'Default'
        });
      } else {
        addResult('Firebase Config', 'error', 'Firebase Auth service not available');
      }
    } catch (error) {
      addResult('Firebase Config', 'error', `Configuration error: ${error.message}`, error);
    }

    // Test 2: Network Connectivity
    addResult('Network Test', 'loading', 'Testing network connectivity...');
    try {
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD', 
        mode: 'no-cors',
        cache: 'no-cache'
      });
      addResult('Network Test', 'success', 'Internet connection is available');
    } catch (error) {
      addResult('Network Test', 'error', 'Network connectivity issue', error);
    }

    // Test 3: Firebase Connection Test
    addResult('Firebase Connection', 'loading', 'Testing Firebase connection...');
    try {
      const connectionResult = await testFirebaseConnection();
      addResult('Firebase Connection', 'success', 'Firebase connection successful', connectionResult);
    } catch (error) {
      addResult('Firebase Connection', 'error', `Connection failed: ${error.message}`, error);
    }

    // Test 4: Anonymous Sign In Test
    addResult('Anonymous Auth', 'loading', 'Testing anonymous authentication...');
    try {
      const userCredential = await signInAnonymously(auth);
      addResult('Anonymous Auth', 'success', 'Anonymous sign-in successful', {
        uid: userCredential.user.uid,
        isAnonymous: userCredential.user.isAnonymous
      });

      // Clean up - sign out
      await signOut(auth);
      addResult('Auth Cleanup', 'success', 'Anonymous user signed out');

    } catch (error) {
      addResult('Anonymous Auth', 'error', `Authentication failed: ${error.message}`, {
        code: error.code,
        message: error.message
      });

      // Check for specific error types
      if (error.code === 'auth/network-request-failed') {
        addResult('Network Diagnosis', 'error', 'Firebase servers unreachable - check network/DNS');
      } else if (error.code === 'auth/unauthorized-domain') {
        addResult('Domain Diagnosis', 'error', 'Domain not authorized in Firebase Console');
      }
    }

    // Test 5: Domain Authorization Check
    addResult('Domain Check', 'loading', 'Checking domain authorization...');
    const issues = diagnoseFirebaseIssues();
    if (issues.length > 0) {
      issues.forEach(issue => {
        addResult('Domain Check', 'warning', issue.message, {
          type: issue.type,
          solution: issue.solution
        });
      });
    } else {
      addResult('Domain Check', 'success', 'No domain issues detected');
    }

    // Test 6: Browser Environment Check
    addResult('Browser Check', 'loading', 'Checking browser environment...');
    const browserIssues = [];
    
    if (!window.indexedDB) {
      browserIssues.push('IndexedDB not available');
    }
    
    if (!window.localStorage) {
      browserIssues.push('LocalStorage not available');
    }
    
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      browserIssues.push('Not using HTTPS (required for Firebase in production)');
    }

    if (browserIssues.length > 0) {
      addResult('Browser Check', 'warning', 'Browser environment issues detected', browserIssues);
    } else {
      addResult('Browser Check', 'success', 'Browser environment is compatible');
    }

    setIsLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'bg-green-100 border-green-300 text-green-800';
      case 'error': return 'bg-red-100 border-red-300 text-red-800';
      case 'warning': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'loading': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'loading': return '🔄';
      default: return 'ℹ️';
    }
  };

  useEffect(() => {
    // Auto-run tests on component mount
    runFirebaseTests();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            🔥 Firebase Connection Diagnostics
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Testing Firebase connectivity and configuration
          </p>
        </div>

        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={runFirebaseTests}
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '🔄 Running Tests...' : '🧪 Run Firebase Tests'}
            </button>
            
            <button
              onClick={clearResults}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              🗑️ Clear Results
            </button>
          </div>

          <div className="space-y-4">
            {testResults.map((result) => (
              <div
                key={result.id}
                className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <h3 className="font-semibold">{result.testName}</h3>
                      <span className="text-xs opacity-75">{result.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm">{result.message}</p>
                    
                    {result.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-medium opacity-75 hover:opacity-100">
                          View Details
                        </summary>
                        <pre className="mt-2 p-2 bg-black bg-opacity-10 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {testResults.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              <p>No test results yet. Click "Run Firebase Tests" to start.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FirebaseDebugTester; 