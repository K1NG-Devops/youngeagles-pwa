import React from 'react';

const SidebarAd = ({ 
  className = '', 
  style = {},
  format = 'vertical',
  responsive = true,
  disabled = false 
}) => {
  
  if (disabled) {
    return null;
  }

  // Smaller sizing for sidebar ads
  const containerStyle = {
    width: '100%',
    minHeight: '120px',
    height: '120px',
    maxHeight: '150px',
    maxWidth: '320px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div 
      className={`sidebar-ad w-full ${className} mb-3 sm:mb-4`} 
      style={containerStyle}
    >
      <div className="w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-xl bg-gradient-to-b from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 p-4 sm:p-5 shadow-lg hover:shadow-xl smooth-animation hover-lift">
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="text-3xl sm:text-4xl">📚</div>
          <div className="text-gray-600 dark:text-gray-300 text-sm sm:text-base font-semibold line-clamp-2">
            Discover More Learning Adventures
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-3">
            Join thousands of students exploring interactive lessons, homework help, and educational games designed for success.
          </div>
          <div className="pt-2 sm:pt-3">
            <button className="w-full px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-lg smooth-animation hover:scale-105 active:scale-95 shadow-md truncate">
              Explore Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarAd;
