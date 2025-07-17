import React, { useState, useEffect } from 'react';
import useMobileDetection from '../hooks/useMobileDetection';
import { MobileBannerAd, ResponsiveAd } from './AdSenseComponents';

const MobileAdDebugger = () => {
  const { isMobile, isTablet, screenSize } = useMobileDetection();
  const [showDebug, setShowDebug] = useState(false);
  const [adLoadStatus, setAdLoadStatus] = useState({});

  const isProduction = import.meta.env.PROD;
  const adSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
  const testMode = import.meta.env.VITE_ADSENSE_TEST_MODE === 'true';

  useEffect(() => {
    // Monitor ad loading status
    const checkAdStatus = () => {
      const ads = document.querySelectorAll('.adsbygoogle');
      const status = {};
      
      ads.forEach((ad, index) => {
        const slot = ad.dataset.adSlot;
        status[slot] = {
          loaded: ad.dataset.adStatus === 'filled',
          status: ad.dataset.adStatus,
          width: ad.offsetWidth,
          height: ad.offsetHeight,
          visible: ad.offsetParent !== null
        };
      });
      
      setAdLoadStatus(status);
    };

    const interval = setInterval(checkAdStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!isMobile || isProduction) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="bg-blue-500 text-white px-3 py-2 rounded-lg text-sm shadow-lg"
      >
        🐛 Mobile Ad Debug
      </button>
      
      {showDebug && (
        <div className="absolute bottom-full right-0 mb-2 bg-white border rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <h3 className="font-bold text-lg mb-2">Mobile Ad Debug Panel</h3>
          
          <div className="mb-4 text-sm">
            <div><strong>Device:</strong> {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</div>
            <div><strong>Screen:</strong> {screenSize.width}x{screenSize.height}</div>
            <div><strong>AdSense Enabled:</strong> {adSenseEnabled ? 'Yes' : 'No'}</div>
            <div><strong>Test Mode:</strong> {testMode ? 'Yes' : 'No'}</div>
            <div><strong>Production:</strong> {isProduction ? 'Yes' : 'No'}</div>
          </div>

          <div className="mb-4">
            <h4 className="font-semibold">Ad Status:</h4>
            {Object.keys(adLoadStatus).length === 0 ? (
              <div className="text-gray-500">No ads detected</div>
            ) : (
              Object.entries(adLoadStatus).map(([slot, status]) => (
                <div key={slot} className="text-xs mb-1">
                  <div><strong>Slot:</strong> {slot}</div>
                  <div>Status: {status.status || 'Unknown'}</div>
                  <div>Size: {status.width}x{status.height}</div>
                  <div>Visible: {status.visible ? 'Yes' : 'No'}</div>
                  <hr className="my-1" />
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold">Test Ads:</h4>
            <div className="border p-2">
              <div className="text-xs mb-1">Mobile Banner:</div>
              <MobileBannerAd className="mobile-optimized" />
            </div>
            <div className="border p-2">
              <div className="text-xs mb-1">Responsive (Header):</div>
              <ResponsiveAd placement="header" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileAdDebugger;
