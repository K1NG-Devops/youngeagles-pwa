import React from 'react';

const PageWrapper = ({ children, onRefresh, className = '' }) => {
  // Note: Removed custom PullToRefresh to restore native mobile pull-to-refresh
  // Native browser pull-to-refresh will now work on mobile devices
  
  return (
    <div className={className}>
      {children}
    </div>
  );
};

export default PageWrapper;
