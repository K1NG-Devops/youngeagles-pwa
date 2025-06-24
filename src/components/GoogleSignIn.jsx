import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const GoogleSignIn = ({ className = '' }) => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const createUserSession = async (firebaseUser) => {
    try {
      console.log('Creating user session for:', firebaseUser.email);
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      console.log('Got Firebase ID token');
      
      // Send to your backend for session creation with correct payload format
      const response = await fetch('https://youngeagles-api-server.up.railway.app/api/auth/firebase-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          idToken: idToken,
          email: firebaseUser.email,
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName
        })
      });
      
      console.log('Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Session created successfully:', data);
        login(data);
        localStorage.setItem('parent_id', data.user.id);
        localStorage.setItem('accessToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.user.role);
        return true;
      } else {
        const errorData = await response.text(); // Get as text first
        console.error('Backend error response:', errorData);
        
        try {
          const jsonError = JSON.parse(errorData);
          if (jsonError.code === 'EMAIL_NOT_VERIFIED') {
            toast.error('Please verify your email before signing in.');
          } else {
            toast.error(jsonError.message || 'Authentication failed');
          }
        } catch (e) {
          // If response is not JSON (like HTML error page)
          console.error('Non-JSON error response:', errorData);
          toast.error('Server error. Please try again later.');
        }
        return false;
      }
    } catch (error) {
      console.error('Session creation error:', error);
      toast.error('Failed to create session');
      return false;
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      
      // Configure popup settings for better mobile support
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      console.log('Starting Google sign-in...');
      
      // Sign in with Google
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      
      // Google accounts are automatically verified, skip email verification check
      // Google OAuth provides verified emails by default
      
      // Create session with backend
      const sessionCreated = await createUserSession(result.user);
      
      if (sessionCreated) {
        toast.success('Successfully signed in with Google!');
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      }
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Failed to sign in with Google';
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in was cancelled';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked. Please allow popups and try again';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign-in request was cancelled';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'Account exists with different credentials';
          break;
        default:
          errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={loading}
      className={`w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600 mr-3"></div>
      ) : (
        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
      )}
      <span className="text-gray-700 font-medium">
        {loading ? 'Signing in...' : 'Continue with Google'}
      </span>
    </button>
  );
};

export default GoogleSignIn;

