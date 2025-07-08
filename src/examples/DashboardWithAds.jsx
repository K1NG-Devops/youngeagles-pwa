import React from 'react';
import { BannerAd, SidebarAd, GoogleAdSense, useAdSense } from '../components/ads';

/**
 * Example: Dashboard page with integrated AdSense ads
 * This shows how to integrate ads into your existing pages
 */
const DashboardWithAds = () => {
  const { shouldDisplayAds, isTestMode } = useAdSense();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner Ad */}
      {shouldDisplayAds() && (
        <BannerAd className="pt-4" />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            
            {/* Your existing dashboard content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Dashboard cards */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Students</h3>
                <p className="text-3xl font-bold text-blue-600">125</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Classes</h3>
                <p className="text-3xl font-bold text-green-600">8</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Events</h3>
                <p className="text-3xl font-bold text-purple-600">12</p>
              </div>
            </div>

            {/* Middle content ad - Rectangle ad */}
            {shouldDisplayAds() && (
              <div className="flex justify-center my-8">
                <GoogleAdSense
                  slot="your-rectangle-slot-id"
                  size={[300, 250]}
                  format="rectangle"
                  className="mx-auto"
                />
              </div>
            )}

            {/* More dashboard content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>New student enrolled in Math Class</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Homework submitted by John Doe</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>New event scheduled for next week</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar with Ad */}
          <div className="lg:w-64">
            {shouldDisplayAds() && (
              <SidebarAd className="mb-6" />
            )}
            
            {/* Other sidebar content */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Add Student
                </button>
                <button className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  Create Event
                </button>
                <button className="w-full bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  Send Notice
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner Ad */}
      {shouldDisplayAds() && (
        <BannerAd className="pb-4" />
      )}

      {/* Debug info in test mode */}
      {isTestMode() && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded shadow">
          <p className="text-sm font-semibold">AdSense Test Mode</p>
          <p className="text-xs">Ads are placeholders in development</p>
        </div>
      )}
    </div>
  );
};

export default DashboardWithAds;
