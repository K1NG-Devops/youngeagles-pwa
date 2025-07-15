import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const AdTest = () => {
  const { isDark } = useTheme();
  const [scriptStatus, setScriptStatus] = useState('checking');
  const [adStatus, setAdStatus] = useState({});
  const [liveCheck, setLiveCheck] = useState({});

  useEffect(() => {
    // Initialize adsbygoogle if needed (do this first!)
    window.adsbygoogle = window.adsbygoogle || [];
    
    // Live checking function
    const performLiveCheck = () => {
      setLiveCheck({
        hasAdsbygoogle: typeof window.adsbygoogle !== 'undefined',
        type: typeof window.adsbygoogle,
        isArray: Array.isArray(window.adsbygoogle),
        length: window.adsbygoogle ? window.adsbygoogle.length : 0,
        value: window.adsbygoogle
      });
    };

    // Check if AdSense script is loaded
    const checkScript = () => {
      const script = document.querySelector('script[src*="adsbygoogle.js"]');
      const hasScript = !!script;
      const hasAdsByGoogle = typeof window.adsbygoogle !== 'undefined';
      const isArray = Array.isArray(window.adsbygoogle);
      
      setScriptStatus({
        scriptTag: hasScript,
        adsbygoogle: hasAdsByGoogle,
        isArray: isArray,
        publisherId: import.meta.env.VITE_ADSENSE_PUBLISHER_ID,
        testMode: import.meta.env.VITE_ADSENSE_TEST_MODE,
        enabled: import.meta.env.VITE_ADSENSE_ENABLED
      });
    };

    // Check script after initialization
    checkScript();
    
    // Try to push an ad after a delay to ensure script is loaded
    const timer = setTimeout(() => {
      try {
        if (window.adsbygoogle) {
          window.adsbygoogle.push({});
          setAdStatus({ pushed: true, error: null, arrayLength: window.adsbygoogle.length });
          // Re-check script status after push
          checkScript();
        } else {
          setAdStatus({ pushed: false, error: 'adsbygoogle not available' });
        }
      } catch (error) {
        setAdStatus({ pushed: false, error: error.message });
      }
    }, 1000);
    
    // Perform live check every second
    performLiveCheck();
    const interval = setInterval(performLiveCheck, 1000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`min-h-screen p-4 ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <h1 className="text-2xl font-bold mb-6">AdSense Test Page</h1>
      
      <div className="space-y-4">
        <div className={`p-4 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-2">Script Status</h2>
          <pre className="text-sm">{JSON.stringify(scriptStatus, null, 2)}</pre>
        </div>
        
        <div className={`p-4 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-2">Ad Push Status</h2>
          <pre className="text-sm">{JSON.stringify(adStatus, null, 2)}</pre>
        </div>
        
        <div className={`p-4 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-2">Live Check (Updates every second)</h2>
          <pre className="text-sm">{JSON.stringify(liveCheck, null, 2)}</pre>
        </div>
        
        <div className={`p-4 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-2">Manual Ad Push</h2>
          <button 
            onClick={() => {
              try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
                alert('Ad pushed successfully!');
              } catch (error) {
                alert('Error pushing ad: ' + error.message);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Push Ad Manually
          </button>
        </div>
        
        <div className={`p-4 rounded border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <h2 className="text-lg font-semibold mb-2">Simple Test Ad</h2>
          <p className="text-sm mb-2">This should show a test ad if everything is configured correctly:</p>
          <p className="text-xs mb-2 text-gray-500">Publisher ID: {import.meta.env.VITE_ADSENSE_PUBLISHER_ID}</p>
          <p className="text-xs mb-2 text-gray-500">Ad Slot: {import.meta.env.VITE_ADSENSE_HEADER_BANNER}</p>
          
          <div className="border-2 border-dashed border-gray-300 p-4 mb-4">
            <ins 
              className="adsbygoogle"
              style={{ display: 'block', minHeight: '90px', backgroundColor: '#f0f0f0' }}
              data-ad-client={import.meta.env.VITE_ADSENSE_PUBLISHER_ID}
              data-ad-slot={import.meta.env.VITE_ADSENSE_HEADER_BANNER}
              data-ad-format="auto"
              data-full-width-responsive="true"
              data-ad-test="on"
            />
            <p className="text-xs text-gray-500 mt-2">Ad container (bordered area above)</p>
          </div>
          
          <button 
            onClick={() => {
              const adElements = document.querySelectorAll('.adsbygoogle');
              console.log('Found ad elements:', adElements.length);
              adElements.forEach((el, index) => {
                console.log(`Ad ${index + 1}:`, {
                  height: el.offsetHeight,
                  width: el.offsetWidth,
                  innerHTML: el.innerHTML,
                  attributes: Array.from(el.attributes).map(attr => ({[attr.name]: attr.value}))
                });
              });
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Debug Ad Elements
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdTest;
