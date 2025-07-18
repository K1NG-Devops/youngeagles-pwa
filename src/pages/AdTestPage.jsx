import React, { useState, useEffect } from 'react';
import { HeaderBannerAd, FooterBannerAd, ResponsiveAd, InFeedNativeAd } from '../components/AdSenseComponents';

const AdTestPage = () => {
  const [adStatus, setAdStatus] = useState({});
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('AdTestPage mounted');
    
    // Monitor AdSense script loading
    const checkAdSenseScript = () => {
      const script = document.querySelector('script[src*="adsbygoogle.js"]');
      if (script) {
        addDebugInfo('AdSense script found in DOM');
      } else {
        addDebugInfo('AdSense script not found');
      }
    };

    checkAdSenseScript();

    // Monitor ad elements
    const monitorAds = () => {
      const adElements = document.querySelectorAll('.adsbygoogle');
      addDebugInfo(`Found ${adElements.length} ad elements`);
      
      adElements.forEach((ad, index) => {
        const client = ad.getAttribute('data-ad-client');
        const slot = ad.getAttribute('data-ad-slot');
        const status = ad.getAttribute('data-adsbygoogle-status');
        
        setAdStatus(prev => ({
          ...prev,
          [`ad-${index}`]: {
            client,
            slot,
            status,
            filled: status === 'filled'
          }
        }));
      });
    };

    const interval = setInterval(monitorAds, 2000);
    return () => clearInterval(interval);
  }, []);

  const refreshAds = () => {
    addDebugInfo('Refreshing ads...');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Ad Test Suite</h1>
          <p className="text-gray-600 mb-4">
            This page tests all AdSense components and provides debugging information.
          </p>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={refreshAds}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Refresh Ads
            </button>
            <button
              onClick={() => setDebugInfo([])}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Debug Log
            </button>
          </div>

          {/* Debug Information */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Debug Information</h2>
            <div className="max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="text-sm text-gray-700 font-mono">
                  {info}
                </div>
              ))}
            </div>
          </div>

          {/* Ad Status */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <h2 className="text-xl font-semibold mb-2">Ad Status</h2>
            {Object.entries(adStatus).map(([key, status]) => (
              <div key={key} className="mb-2 p-2 bg-white rounded">
                <div className="font-semibold">{key}:</div>
                <div className="text-sm">
                  <span className={`inline-block w-3 h-3 rounded-full mr-2 ${
                    status.filled ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                  Status: {status.status || 'unknown'} | 
                  Client: {status.client || 'missing'} | 
                  Slot: {status.slot || 'missing'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Ad Components */}
        <div className="space-y-8">
          {/* Header Banner Ad */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Header Banner Ad</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <HeaderBannerAd />
            </div>
          </div>

          {/* Responsive Ad */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Responsive Ad</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <ResponsiveAd />
            </div>
          </div>

          {/* In-Feed Native Ad */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">In-Feed Native Ad</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <InFeedNativeAd />
            </div>
          </div>

          {/* Footer Banner Ad */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Footer Banner Ad</h2>
            <div className="border-2 border-dashed border-gray-300 p-4 rounded">
              <FooterBannerAd />
            </div>
          </div>
        </div>

        {/* Environment Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Environment Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Environment:</strong> {import.meta.env.MODE}
            </div>
            <div>
              <strong>Dev Mode:</strong> {import.meta.env.DEV ? 'Yes' : 'No'}
            </div>
            <div>
              <strong>AdSense Client:</strong> {import.meta.env.VITE_ADSENSE_CLIENT || 'Not set'}
            </div>
            <div>
              <strong>User Agent:</strong> {navigator.userAgent.substring(0, 50)}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdTestPage;
