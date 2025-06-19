import { useState, useEffect } from 'react';

/**
 * Hook to detect if the app is running as a PWA (standalone mode)
 * and provide PWA-related utilities
 */
export const usePWA = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    // Check if running in standalone mode (PWA installed)
    const checkStandalone = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://') ||
        window.matchMedia('(display-mode: fullscreen)').matches;
      
      setIsStandalone(standalone);
    };

    // Initial check
    checkStandalone();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandalone);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event for triggering later
      setInstallPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setIsInstallable(false);
      console.log('PWA was installed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', checkStandalone);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Function to trigger install prompt
  const promptInstall = async () => {
    if (!installPrompt) return false;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const result = await installPrompt.userChoice;

    // Reset the deferred prompt
    setInstallPrompt(null);
    setIsInstallable(false);

    return result.outcome === 'accepted';
  };

  // Function to open full website
  const openFullWebsite = () => {
    const currentUrl = window.location.origin;
    window.open(currentUrl + '?source=pwa', '_blank');
  };

  return {
    isStandalone,
    isInstallable,
    promptInstall,
    openFullWebsite
  };
};

export default usePWA;

