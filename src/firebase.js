import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyABl23C2T_smbFQgTypZ0cfii3faawwoe8",
  authDomain: "skydekstorage.firebaseapp.com",
  projectId: "skydekstorage",
  storageBucket: "skydekstorage.firebasestorage.app",
  messagingSenderId: "482749285321",
  appId: "1:482749285321:web:3864dec67deca22f885e18",
  measurementId: "G-ZLBW552T6P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export default app;

