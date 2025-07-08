import React, { useState, useEffect } from 'react';

const Preloader = ({ children }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800); // Reduced time for better UX

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            YoungEagles
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Loading your educational platform...
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default Preloader;
