import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import nativeNotificationService from './services/nativeNotificationService.js';

// Initialize native notification service
try {
  nativeNotificationService.init();
} catch (error) {
  console.warn('Failed to initialize native notifications:', error);
}

// Create root and render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
