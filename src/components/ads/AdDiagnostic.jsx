import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { FaCheck, FaTimes, FaExclamationTriangle, FaEye, FaCode } from 'react-icons/fa';

const AdDiagnostic = ({ showDiagnostic = false }) => {
  const { isDark } = useTheme();
  const { showAds } = useSubscription();
  const [diagnosticData, setDiagnosticData] = useState({
    adSenseScript: false,
    publisherId: false,
    adSlots: {},
    adElements: 0,
    errors: []
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showDiagnostic) {
      runDiagnostic();
    }
  }, [showDiagnostic]);

  const runDiagnostic = () => {
    const results = {
      adSenseScript: !!window.adsbygoogle,
      publisherId: !!import.meta.env.VITE_ADSENSE_PUBLISHER_ID,
      adSlots: {
        native: import.meta.env.VITE_ADSENSE_IN_ARTICLE_NATIVE || 'Not configured',
        feed: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE || 'Not configured',
        banner: import.meta.env.VITE_ADSENSE_HEADER_BANNER || 'Not configured',
        content: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE || 'Not configured'
      },
      adElements: document.querySelectorAll('.adsbygoogle').length,
      errors: []
    };

    // Check for common issues
    if (!results.adSenseScript) {
      results.errors.push('AdSense script not loaded');
    }
    
    if (!results.publisherId || (typeof results.publisherId === 'string' && (results.publisherId.includes('your-') || results.publisherId.includes('XXXXX')))) {
      results.errors.push('Publisher ID not configured properly');
    }

    if (Object.values(results.adSlots).every(slot => slot === 'Not configured' || (typeof slot === 'string' && slot.includes('your-')))) {
      results.errors.push('No ad slots configured');
    }

    if (results.adElements === 0) {
      results.errors.push('No ad elements found on page');
    }

    setDiagnosticData(results);
  };

  if (!showDiagnostic) return null;

  return (
    <>
      {/* Diagnostic Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`
          fixed bottom-4 left-4 z-[9999] p-3 rounded-full shadow-lg
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
          border ${isDark ? 'border-gray-700' : 'border-gray-200'}
          hover:scale-105 transition-transform
        `}
        title="Ad Diagnostic"
      >
        <FaCode className="w-4 h-4" />
      </button>

      {/* Diagnostic Panel */}
      {isVisible && (
        <div className={`
          fixed bottom-20 left-4 right-4 max-w-md z-[9999]
          ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
          border ${isDark ? 'border-gray-700' : 'border-gray-200'}
          rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto
        `}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ad Diagnostic</h3>
            <button
              onClick={() => setIsVisible(false)}
              className={`p-1 rounded ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Status Checks */}
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              {diagnosticData.adSenseScript ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
              <span className="text-sm">AdSense Script Loaded</span>
            </div>

            <div className="flex items-center space-x-3">
              {diagnosticData.publisherId ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
              <span className="text-sm">Publisher ID Configured</span>
            </div>

            <div className="flex items-center space-x-3">
              {showAds() ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
              <span className="text-sm">Ads Enabled (Subscription)</span>
            </div>

            <div className="flex items-center space-x-3">
              {diagnosticData.adElements > 0 ? (
                <FaCheck className="text-green-500" />
              ) : (
                <FaTimes className="text-red-500" />
              )}
              <span className="text-sm">Ad Elements on Page ({diagnosticData.adElements})</span>
            </div>
          </div>

          {/* Ad Slots Configuration */}
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Ad Slots</h4>
            <div className="space-y-1 text-xs">
              {Object.entries(diagnosticData.adSlots).map(([type, slot]) => (
                <div key={type} className="flex justify-between">
                  <span className="capitalize">{type}:</span>
                  <span className={`
                    ${slot === 'Not configured' || slot.includes('your-') 
                  ? 'text-red-500' 
                  : 'text-green-500'
                }
                  `}>
                    {slot === 'Not configured' ? '❌' : '✅'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Environment Info */}
          <div className="mt-4 text-xs">
            <h4 className="text-sm font-medium mb-2">Environment</h4>
            <div className="space-y-1">
              <div>Test Mode: {import.meta.env.VITE_ADSENSE_TEST_MODE === 'true' ? '✅ ON' : '❌ OFF'}</div>
              <div>Publisher: {import.meta.env.VITE_ADSENSE_PUBLISHER_ID?.slice(0, 15)}...</div>
            </div>
          </div>

          {/* Errors */}
          {diagnosticData.errors.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 text-red-500">Issues Found</h4>
              <div className="space-y-1">
                {diagnosticData.errors.map((error, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs">
                    <FaExclamationTriangle className="text-red-500" />
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex space-x-2">
            <button
              onClick={runDiagnostic}
              className={`
                px-3 py-1 rounded text-xs
                ${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'}
                text-white transition-colors
              `}
            >
              Refresh
            </button>
            
            <button
              onClick={() => {
                const adElements = document.querySelectorAll('.adsbygoogle');
                adElements.forEach(el => {
                  el.style.border = '2px solid red';
                  setTimeout(() => {
                    el.style.border = '';
                  }, 3000);
                });
              }}
              className={`
                px-3 py-1 rounded text-xs
                ${isDark ? 'bg-green-600 hover:bg-green-700' : 'bg-green-500 hover:bg-green-600'}
                text-white transition-colors
              `}
            >
              Highlight Ads
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AdDiagnostic;
