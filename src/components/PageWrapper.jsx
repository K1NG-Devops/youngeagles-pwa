import React from 'react';
import PullToRefresh from './PullToRefresh';

const PageWrapper = ({ children, onRefresh, className = '' }) => {
  const defaultRefresh = async () => {
    // Default refresh - reload the page
    window.location.reload();
  };

  return (
    <PullToRefresh 
      onRefresh={onRefresh || defaultRefresh}
      className={className}
    >
      {children}
    </PullToRefresh>
  );
};

export default PageWrapper;
