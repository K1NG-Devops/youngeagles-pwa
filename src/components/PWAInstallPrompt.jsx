import React, { useState, useEffect } from 'react';
import usePWA from '../hooks/usePWA';

const PWAInstallPrompt = () => {
  const { isInstallable, promptInstall } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the prompt in this session
    const sessionDismissed = sessionStorage.getItem('pwa-install-dismissed');
    if (sessionDismissed) {
      setDismissed(true);
      return;
    }

    // Show prompt with a delay if app is installable
    if (isInstallable && !dismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, dismissed]);

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    // Remember dismissal for this session
    sessionStorage.setItem('pwa-install-dismissed', 'true');
  };

  // Don't show if not installable, already dismissed, or not supposed to show
  if (!isInstallable || dismissed || !showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg shadow-lg border border-blue-500">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-1">Install Young Eagles App</h3>
            <p className="text-xs text-blue-100 mb-3">
              Install our app for quick access, offline support, and push notifications!
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleInstall}
                className="bg-white text-blue-600 text-xs px-3 py-1.5 rounded-md font-medium hover:bg-blue-50 transition-colors"
              >
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="bg-blue-500 hover:bg-blue-400 text-white text-xs px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                Not Now
              </button>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-blue-200 hover:text-white"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
