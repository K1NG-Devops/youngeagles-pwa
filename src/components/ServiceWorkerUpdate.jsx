import React, { useEffect, useState } from 'react';
import { FaSync } from 'react-icons/fa';

const ServiceWorkerUpdate = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      // Listen for new service worker waiting
      navigator.serviceWorker.ready.then(registration => {
        // Check if there's already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setShowUpdate(true);
        }

        // Listen for new workers
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowUpdate(true);
              }
            });
          }
        });
      });

      // Listen for controlling service worker changes
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      // Tell waiting service worker to skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FaSync className="text-xl animate-spin" />
          <div>
            <p className="font-semibold">Update Available</p>
            <p className="text-sm opacity-90">Click to refresh and get the latest version</p>
          </div>
        </div>
        <button
          onClick={handleUpdate}
          className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  );
};

export default ServiceWorkerUpdate;
