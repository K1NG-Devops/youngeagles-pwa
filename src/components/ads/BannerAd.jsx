import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const BannerAd = ({ position = 'top' }) => {
  const { isDark } = useTheme();

  if (position === 'top') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-6`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Advertisement
            </span>
          </div>
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Educational Games</h3>
                <p className="text-sm opacity-90">Fun learning activities for kids</p>
              </div>
              <button className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium text-sm">
                Play Now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (position === 'bottom') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mt-6`}>
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </span>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-teal-600 text-white p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Learning Resources</h3>
                <p className="text-sm opacity-90">Premium educational materials</p>
              </div>
              <button className="bg-white text-green-600 px-4 py-2 rounded-md font-medium text-sm">
                Browse
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default banner
  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} my-4`}>
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Advertisement
          </span>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Educational Apps</h3>
              <p className="text-sm opacity-90">Discover new learning tools</p>
            </div>
            <button className="bg-white text-orange-600 px-4 py-2 rounded-md font-medium text-sm">
              Explore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerAd;
