import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { FaGraduationCap, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const { isDark } = useTheme();
  const location = useLocation();
  
  // Hide Login/Sign Up buttons on login page
  const hideAuthButtons = location.pathname === '/login';

  return (
    <footer className={`fixed bottom-0 left-0 right-0 z-50 py-4 px-4 border-t ${
      isDark 
        ? 'bg-gray-900 border-gray-700 text-gray-300' 
        : 'bg-white border-gray-200 text-gray-600'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Compact mobile-first layout */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          {/* Brand - simplified */}
          <div className="flex items-center">
            <FaGraduationCap className={`text-lg mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              YoungEagles
            </span>
          </div>

          {/* Links - horizontal layout */}
          <div className="flex flex-wrap justify-center items-center space-x-3 text-xs">
            <Link 
              to="/" 
              className={`hover:text-blue-500 transition-colors ${
                isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/contact" 
              className={`hover:text-blue-500 transition-colors ${
                isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600'
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/privacy-policy" 
              className={`hover:text-blue-500 transition-colors ${
                isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600'
              }`}
            >
              Privacy
            </Link>
            <Link 
              to="/terms-of-service" 
              className={`hover:text-blue-500 transition-colors ${
                isDark ? 'text-gray-300 hover:text-blue-400' : 'text-gray-600'
              }`}
            >
              Terms
            </Link>
            {!hideAuthButtons && (
              <>
            <Link 
              to="/login" 
              className={`hover:text-blue-500 transition-colors font-medium ${
                isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
              }`}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                isDark 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Sign Up
            </Link>
              </>
            )}
          </div>

          {/* Copyright - simplified */}
          <div className="flex items-center text-xs">
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              © {new Date().getFullYear()}
            </span>
            <FaHeart className="text-red-500 mx-1 text-xs" />
            <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              SA
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
