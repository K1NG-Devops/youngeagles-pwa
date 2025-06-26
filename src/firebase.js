import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyABl23C2T_smbFQgTypZ0cfii3faawwoe8",
  authDomain: "skydekstorage.firebaseapp.com",
  projectId: "skydekstorage",
  storageBucket: "skydekstorage.firebasestorage.app",
  messagingSenderId: "482749285321",
  appId: "1:482749285321:web:3864dec67deca22f885e18",
  measurementId: "G-ZLBW552T6P"
};

// Add debug logging
console.log('🔥 Initializing Firebase with config:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Hide full API key in logs
});

// Initialize Firebase with error handling
let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');

  // Initialize Firebase Authentication
  auth = getAuth(app);
  console.log('✅ Firebase Auth service initialized');

  // Add auth state change listener for debugging (non-interfering)
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('🔐 Firebase user signed in:', user.email || 'Anonymous');
    } else {
      console.log('🔓 Firebase user signed out (this does not affect PWA auth)');
    }
  });

} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  console.error('Error details:', {
    code: error.code,
    message: error.message,
    stack: error.stack
  });
  
  // Check for specific Firebase errors
  if (error.code === 'auth/network-request-failed') {
    console.error('🌐 Network error: Check your internet connection');
  } else if (error.code === 'auth/invalid-api-key') {
    console.error('🔑 Invalid API key: Check Firebase project configuration');
  } else if (error.code === 'auth/unauthorized-domain') {
    console.error('🚫 Unauthorized domain: Add your domain to Firebase Console > Authentication > Settings > Authorized domains');
  }
}

// Export with null checks
export { auth };
export default app;

// Add connection testing function
export const testFirebaseConnection = async () => {
  try {
    if (!auth) {
      throw new Error('Firebase Auth not initialized');
    }

    console.log('🧪 Testing Firebase connection...');
    
    // Test connection by attempting to get current user
    const currentUser = auth.currentUser;
    console.log('👤 Current user:', currentUser?.email || 'No user signed in');

    // Test auth state
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Firebase connection test timeout'));
      }, 10000);

      const unsubscribe = auth.onAuthStateChanged((user) => {
        clearTimeout(timeout);
        unsubscribe();
        console.log('✅ Firebase Auth state change detected');
        resolve({ connected: true, user: user?.email || null });
      }, (error) => {
        clearTimeout(timeout);
        unsubscribe();
        console.error('❌ Firebase Auth state error:', error);
        reject(error);
      });
    });

  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    throw error;
  }
};

// Check for common Firebase issues
export const diagnoseFirebaseIssues = () => {
  const issues = [];
  
  // Check if running on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🏠 Running on localhost - Firebase should work');
  }
  
  // Check if running on production domain
  const productionDomains = [
    'youngeagles-g4tu8n56q-k1ng-devops-projects.vercel.app',
    'youngeagles-3984w2rnk-k1ng-devops-projects.vercel.app'
  ];
  
  const currentDomain = window.location.hostname;
  const isProductionDomain = productionDomains.some(domain => 
    currentDomain === domain || currentDomain.endsWith('.vercel.app')
  );
  
  if (!isProductionDomain && currentDomain !== 'localhost' && currentDomain !== '127.0.0.1') {
    issues.push({
      type: 'domain',
      message: `Domain '${currentDomain}' may not be authorized in Firebase Console`,
      solution: 'Add your domain to Firebase Console > Authentication > Settings > Authorized domains'
    });
  }
  
  // Check network connectivity
  if (!navigator.onLine) {
    issues.push({
      type: 'network',
      message: 'No internet connection detected',
      solution: 'Check your internet connection'
    });
  }
  
  return issues;
};

// Run diagnostics on load
const issues = diagnoseFirebaseIssues();
if (issues.length > 0) {
  console.warn('⚠️ Potential Firebase issues detected:', issues);
} else {
  console.log('✅ No obvious Firebase configuration issues detected');
}

