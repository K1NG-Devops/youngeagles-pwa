/**
 * Lazy load Google Ads to improve initial page load performance
 */

let adsLoaded = false;
let adsLoadPromise = null;

export const loadGoogleAds = () => {
  if (adsLoaded) {
    return Promise.resolve();
  }

  if (adsLoadPromise) {
    return adsLoadPromise;
  }

  adsLoadPromise = new Promise((resolve, reject) => {
    // Check if user prefers reduced motion or has limited bandwidth
    if (navigator.connection && navigator.connection.saveData) {
      console.log('Data saver mode detected, skipping ads');
      resolve();
      return;
    }

    // Delay loading until after critical resources
    const loadAds = () => {
      try {
        // Create and inject Google Ads script
        const script = document.createElement('script');
        script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        script.crossOrigin = 'anonymous';
        script.async = true;
        script.setAttribute('data-ad-client', 'ca-pub-4854935783304788');
        
        script.onload = () => {
          adsLoaded = true;
          resolve();
        };
        
        script.onerror = () => {
          console.warn('Failed to load Google Ads');
          reject(new Error('Failed to load Google Ads'));
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('Error loading Google Ads:', error);
        reject(error);
      }
    };

    // Load after initial page load and user interaction
    if (document.readyState === 'complete') {
      setTimeout(loadAds, 2000); // Delay by 2 seconds
    } else {
      window.addEventListener('load', () => {
        setTimeout(loadAds, 2000);
      });
    }
  });

  return adsLoadPromise;
};

export const initializeAd = (adElement) => {
  if (!adElement) return;

  return loadGoogleAds().then(() => {
    if (window.adsbygoogle && !adElement.dataset.adsbygoogleStatus) {
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        console.error('Error initializing ad:', error);
      }
    }
  }).catch(error => {
    console.error('Failed to initialize ad:', error);
  });
};

// Intersection Observer for lazy loading ads
export const createAdObserver = () => {
  if (!('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        initializeAd(entry.target);
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.1
  });
};
