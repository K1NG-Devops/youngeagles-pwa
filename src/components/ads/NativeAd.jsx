import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const NativeAd = ({ type = 'banner' }) => {
  const { isDark } = useTheme();

  if (type === 'banner') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </span>
          </div>
          <div className="bg-blue-500 text-white p-6 rounded-lg text-center">
            <h3 className="font-bold text-lg mb-2">Educational Resources</h3>
            <p className="text-sm mb-4">Discover premium learning materials for your child</p>
            <button className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium">
              Learn More
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'feed') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">ED</span>
            </div>
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Educational Apps
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Sponsored
              </p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-400 to-blue-500 p-4 rounded-lg text-white mb-3">
            <h3 className="font-bold mb-1">Khan Academy Kids</h3>
            <p className="text-sm">Free educational games and activities for children</p>
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-green-500 text-white px-4 py-2 rounded-md text-sm font-medium">
              Download Now
            </button>
            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Free
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'video') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </span>
          </div>
          <div className="bg-purple-600 aspect-video rounded-lg flex items-center justify-center relative mb-3">
            <div className="text-white text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
              <p className="text-sm font-medium">STEM Learning Adventures</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Interactive Science Experiments
              </h4>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Perfect for ages 6-12
              </p>
            </div>
            <button className="bg-purple-600 text-white px-3 py-1 rounded-md text-sm">
              Watch
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Sponsored
            </span>
          </div>
          <div className="bg-orange-500 p-4 rounded-lg text-white text-center mb-3">
            <h4 className="font-bold text-lg mb-2">Learning Tools</h4>
            <p className="text-sm">Educational apps and resources</p>
          </div>
          <button className="w-full bg-orange-500 text-white py-2 rounded-md text-sm font-medium">
            Explore
          </button>
        </div>
      </div>
    );
  }

  // Default banner style
  return (
    <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Advertisement
          </span>
        </div>
        <div className="bg-blue-500 text-white p-6 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">Educational Content</h3>
          <p className="text-sm mb-4">Enhance your child's learning experience</p>
          <button className="bg-white text-blue-500 px-4 py-2 rounded-md font-medium">
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default NativeAd;
