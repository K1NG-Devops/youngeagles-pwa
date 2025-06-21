// This script will unregister any existing service workers
// to fix offline detection issues
window.addEventListener('load', function() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for (let registration of registrations) {
        console.log('Unregistering service worker:', registration);
        registration.unregister();
      }
      console.log('All service workers unregistered');
    });
    console.log('Service worker unregistration attempted');
  }
});
