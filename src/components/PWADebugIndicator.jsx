import React from 'react';

const PWADebugIndicator = () => {
  return import.meta.env.DEV ? (
    <div className="fixed top-0 right-0 bg-green-500 text-white px-2 py-1 text-xs z-50">
      PWA Dev Mode
    </div>
  ) : null;
};

export default PWADebugIndicator;
