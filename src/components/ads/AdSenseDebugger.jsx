import React, { useEffect, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const AdSenseDebugger = () => {
  const { isDark } = useTheme();
  const [debugInfo, setDebugInfo] = useState({
    adsbygoogleLoaded: false,
    adsbygoogleArray: false,
    scriptElements: [],
    cspErrors: [],
    networkErrors: []
  });

  useEffect(() => {
    const checkAdSenseStatus = () => {
      const info = {
        adsbygoogleLoaded: typeof window.adsbygoogle !== 'undefined',
        adsbygoogleArray: Array.isArray(window.adsbygoogle),
        scriptElements: [],
        cspErrors: [],
        networkErrors: []
      };

      // Check for AdSense script elements
      const scripts = document.querySelectorAll('script[src*="googlesyndication"]');
      info.scriptElements = Array.from(scripts).map(script => ({
        src: script.src,
        loaded: script.readyState === 'complete' || script.complete,
        async: script.async,
        crossorigin: script.crossOrigin
      }));

      // Listen for CSP violations
      const handleCSPViolation = (event) => {
        if (event.violatedDirective && event.blockedURI) {
          info.cspErrors.push({
            directive: event.violatedDirective,
            blockedURI: event.blockedURI,
            timestamp: new Date().toISOString()
          });
          setDebugInfo(prev => ({
            ...prev,
            cspErrors: [...prev.cspErrors, {
              directive: event.violatedDirective,
              blockedURI: event.blockedURI,
              timestamp: new Date().toISOString()
            }]
          }));
        }
      };

      // Listen for network errors
      const handleError = (event) => {
        if (event.target && event.target.src && event.target.src.includes('google')) {
          info.networkErrors.push({
            src: event.target.src,
            error: 'Failed to load',
            timestamp: new Date().toISOString()
          });
          setDebugInfo(prev => ({
            ...prev,
            networkErrors: [...prev.networkErrors, {
              src: event.target.src,
              error: 'Failed to load',
              timestamp: new Date().toISOString()
            }]
          }));
        }
      };

      document.addEventListener('securitypolicyviolation', handleCSPViolation);
      window.addEventListener('error', handleError, true);

      setDebugInfo(info);

      return () => {
        document.removeEventListener('securitypolicyviolation', handleCSPViolation);
        window.removeEventListener('error', handleError, true);
      };
    };

    const cleanup = checkAdSenseStatus();
    
    // Check periodically
    const interval = setInterval(checkAdSenseStatus, 5000);

    return () => {
      cleanup && cleanup();
      clearInterval(interval);
    };
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      isDark ? 'bg-gray-800 text-white border border-gray-600' : 'bg-white text-gray-900 border border-gray-300'
    }`}>
      <h3 className="text-lg font-bold mb-2 text-green-600">🐛 AdSense Debug</h3>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${
            debugInfo.adsbygoogleLoaded ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span>adsbygoogle loaded: {debugInfo.adsbygoogleLoaded ? '✅' : '❌'}</span>
        </div>
        
        <div className="flex items-center">
          <span className={`w-3 h-3 rounded-full mr-2 ${
            debugInfo.adsbygoogleArray ? 'bg-green-500' : 'bg-red-500'
          }`}></span>
          <span>adsbygoogle array: {debugInfo.adsbygoogleArray ? '✅' : '❌'}</span>
        </div>

        <div>
          <strong>Scripts ({debugInfo.scriptElements.length}):</strong>
          {debugInfo.scriptElements.map((script, index) => (
            <div key={index} className="ml-2 text-xs">
              <span className={`w-2 h-2 rounded-full inline-block mr-1 ${
                script.loaded ? 'bg-green-400' : 'bg-yellow-400'
              }`}></span>
              {script.src.split('/').pop()}
            </div>
          ))}
        </div>

        {debugInfo.cspErrors.length > 0 && (
          <div>
            <strong className="text-red-500">CSP Errors ({debugInfo.cspErrors.length}):</strong>
            {debugInfo.cspErrors.slice(-3).map((error, index) => (
              <div key={index} className="ml-2 text-xs text-red-400">
                {error.directive}: {error.blockedURI.split('/').pop()}
              </div>
            ))}
          </div>
        )}

        {debugInfo.networkErrors.length > 0 && (
          <div>
            <strong className="text-orange-500">Network Errors ({debugInfo.networkErrors.length}):</strong>
            {debugInfo.networkErrors.slice(-3).map((error, index) => (
              <div key={index} className="ml-2 text-xs text-orange-400">
                {error.src.split('/').pop()}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2 text-xs opacity-75">
        Updates every 5s in dev mode
      </div>
    </div>
  );
};

export default AdSenseDebugger;
