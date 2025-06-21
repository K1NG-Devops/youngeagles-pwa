import React, { useState, useEffect } from 'react';
import { FaDownload, FaMobile, FaChrome, FaSafari } from 'react-icons/fa';

const PWAInstallGuard = ({ children, onInstallComplete }) => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(true);

  useEffect(() => {
    // Check if app is running in standalone mode (PWA is installed)
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone || 
                        document.referrer.includes('android-app://');
      
      setIsStandalone(standalone);
      
      if (standalone) {
        setShowInstallModal(false);
        if (onInstallComplete) {
          onInstallComplete();
        }
      }
    };

    checkStandalone();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsStandalone(true);
      setShowInstallModal(false);
      setDeferredPrompt(null);
      if (onInstallComplete) {
        onInstallComplete();
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [onInstallComplete]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setDeferredPrompt(null);
      } else {
        console.log('User dismissed the install prompt');
      }
    } else {
      // Show manual install instructions
      setShowInstallModal(true);
    }
  };

  const getInstallInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !isChrome;
    const isEdge = /Edg/.test(navigator.userAgent);

    if (isIOS) {
      return {
        icon: FaSafari,
        title: 'Install on iOS (Safari)',
        steps: [
          'Open this page in Safari',
          'Tap the Share button (square with arrow)',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm'
        ]
      };
    } else if (isChrome || isEdge) {
      return {
        icon: FaChrome,
        title: 'Install on Chrome/Edge',
        steps: [
          'Look for the install icon in the address bar',
          'Or click the three dots menu',
          'Select "Install Young Eagles App"',
          'Click "Install" to confirm'
        ]
      };
    } else {
      return {
        icon: FaMobile,
        title: 'Install PWA',
        steps: [
          'Use Chrome, Edge, or Safari browser',
          'Look for the install option in your browser',
          'Add the app to your home screen',
          'Open from your home screen for the best experience'
        ]
      };
    }
  };

  if (isStandalone) {
    return children;
  }

  if (!showInstallModal) {
    return children;
  }

  const instructions = getInstallInstructions();
  const IconComponent = instructions.icon;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconComponent className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Install Young Eagles App
          </h2>
          <p className="text-gray-600">
            For the best experience, please install our app on your device.
          </p>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {instructions.title}
          </h3>
          <ol className="space-y-2">
            {instructions.steps.map((step, index) => (
              <li key={index} className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-sm rounded-full flex items-center justify-center font-semibold">
                  {index + 1}
                </span>
                <span className="text-gray-700 text-sm">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-3">
          {deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <FaDownload className="w-4 h-4" />
              <span>Install Now</span>
            </button>
          )}
          
          <button
            onClick={() => setShowInstallModal(false)}
            className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Continue in Browser
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can always install the app later from your browser menu.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallGuard;

