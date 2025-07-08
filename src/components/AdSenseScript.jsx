import { useEffect } from 'react';

const AdSenseScript = () => {
  useEffect(() => {
    const publisherId = import.meta.env.VITE_ADSENSE_PUBLISHER_ID;
    const isEnabled = import.meta.env.VITE_ADSENSE_ENABLED === 'true';
    
    if (!publisherId || !isEnabled) {
      console.log('AdSense: Not loaded - missing publisher ID or disabled');
      return;
    }

    // Check if script is already loaded
    if (document.querySelector(`script[src*="pagead2.googlesyndication.com"]`)) {
      console.log('AdSense: Script already loaded');
      return;
    }

    // Create and inject AdSense script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('AdSense: Script loaded successfully');
    };
    
    script.onerror = () => {
      console.error('AdSense: Failed to load script');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup if component unmounts
      const existingScript = document.querySelector(`script[src*="pagead2.googlesyndication.com"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default AdSenseScript;
