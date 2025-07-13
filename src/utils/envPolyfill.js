/**
 * Environment Variable Polyfill for Firefox Compatibility
 * Provides fallback for import.meta.env in older browsers
 */

// Polyfill for browsers that don't support import.meta.env
export const getEnvVar = (key, defaultValue = '') => {
  try {
    // Try Vite's import.meta.env first
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || defaultValue;
    }
    
    // Fallback for older browsers
    if (typeof process !== 'undefined' && process.env) {
      return process.env[key] || defaultValue;
    }
    
    // Final fallback - check window for injected env vars
    if (typeof window !== 'undefined' && window.__ENV__) {
      return window.__ENV__[key] || defaultValue;
    }
    
    return defaultValue;
  } catch (error) {
    console.warn(`Environment variable ${key} not found, using default:`, defaultValue);
    return defaultValue;
  }
};

// Export environment variables with fallbacks
export const ENV = {
  API_URL: getEnvVar('VITE_API_URL', 'http://localhost:5000'),
  // AdSense variables removed
  VAPID_PUBLIC_KEY: getEnvVar('VITE_VAPID_PUBLIC_KEY', ''),
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  DEV: getEnvVar('DEV', 'true') === 'true',
  MODE: getEnvVar('MODE', 'development')
}; 