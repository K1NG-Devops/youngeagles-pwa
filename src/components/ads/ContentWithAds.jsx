import React, { Fragment } from 'react';
import NativeAdContainer from './NativeAdContainer';
import useAdFrequency from '../../hooks/useAdFrequency';

const ContentWithAds = ({ 
  children, 
  contentType = 'list',
  adFrequency = 4, // Show ad every N items
  adPosition = 'feed',
  className = ''
}) => {
  const { shouldShowAd, recordAdShown } = useAdFrequency(contentType);

  // Handle single child
  if (!Array.isArray(children)) {
    return <div className={className}>{children}</div>;
  }

  // Insert ads intelligently in content arrays
  const renderWithAds = () => {
    return children.map((child, index) => (
      <Fragment key={index}>
        {child}
        {/* Insert ad after certain intervals, but not at the very beginning or end */}
        {index > 0 && 
         index < children.length - 1 && 
         (index + 1) % adFrequency === 0 && 
         shouldShowAd() && (
          <NativeAdContainer 
            position={adPosition}
            contentType={contentType}
            spacing="medium"
            onAdLoaded={recordAdShown}
            className="ad-in-content"
          />
        )}
      </Fragment>
    ));
  };

  return (
    <div className={className}>
      {renderWithAds()}
    </div>
  );
};

export default ContentWithAds;
