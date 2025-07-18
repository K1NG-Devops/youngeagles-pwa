"use client"

import type React from "react"

// Fallback ad components when AdSense fails or is blocked
export const HeaderAd: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`fallback-ad header-ad ${className}`}>
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center">
      <h3 className="font-bold text-lg mb-2">Upgrade to Premium</h3>
      <p className="text-sm opacity-90">Remove ads and unlock exclusive features</p>
      <button className="mt-2 bg-white text-blue-600 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100 transition-colors">
        Learn More
      </button>
    </div>
  </div>
)

export const ContentAd: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`fallback-ad content-ad ${className}`}>
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center">
      <div className="text-gray-500 mb-2">
        <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <p className="text-sm text-gray-600">Advertisement Space</p>
      <p className="text-xs text-gray-500 mt-1">Support us by viewing ads</p>
    </div>
  </div>
)

export const NativeAd: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div className={`fallback-ad native-ad ${className}`}>
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">📚</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">Educational Resources</h4>
          <p className="text-sm text-gray-600">Discover premium learning materials</p>
        </div>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Explore →</button>
      </div>
    </div>
  </div>
)
