"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useTheme } from "../contexts/ThemeContext"
import { useSubscription } from "../contexts/SubscriptionContext"
import { useAdSense } from "../components/ads/AdSenseProvider"

// Import testing components
import AdTestingSuite from "../components/ads/AdTestingSuite"
import AdPerformanceMonitor from "../components/ads/AdPerformanceMonitor"
import AdTroubleshooter from "../components/ads/AdTroubleshooter"

// Import updated ad components
import { MobileBannerAd, ResponsiveAd, HeaderBannerAd } from "../components/ads/UpdatedAdSenseComponents"

import Header from "../components/Header"
import NativeAppEnhancements from "../components/NativeAppEnhancements"
import useAdFrequency from "../hooks/useAdFrequency"

const Dashboard = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { getCurrentPlan } = useSubscription()
  const { canShowAds } = useAdSense()

  // Your existing state and logic...
  const [stats, setStats] = useState({
    children: 0,
    classes: 0,
    homework: 0,
    pending: 0,
    submitted: 0,
    completionRate: 0,
  })

  const { shouldShowAd, recordAdShown, canShowMoreAds } = useAdFrequency("dashboard", "banner")

  const shouldDisplayAds = canShowAds && getCurrentPlan()?.features?.ads_enabled

  return (
    <div className={`min-h-screen mt-0 ${isDark ? "bg-gray-900" : "bg-gray-50"} mobile-scroll-container`}>
      <Header />
      <NativeAppEnhancements />

      {/* Testing Components - Only in Development */}
      {import.meta.env.DEV && (
        <>
          <AdTestingSuite />
          <AdPerformanceMonitor />
          <AdTroubleshooter />
        </>
      )}

      <main className="relative">
        <div className="mobile-container">
          {/* Your existing welcome section */}
          <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 text-white rounded-2xl shadow-xl mobile-space-md overflow-hidden relative">
            {/* Your existing welcome content */}
          </div>

          {/* Mobile-First Banner Ads with Testing */}
          {shouldDisplayAds && shouldShowAd && (
            <div className="block sm:hidden mb-8" onClick={() => recordAdShown()}>
              <div className="relative">
                <MobileBannerAd />
                {import.meta.env.DEV && (
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                    Mobile Banner
                  </div>
                )}
              </div>
            </div>
          )}

          {shouldDisplayAds && shouldShowAd && (
            <div className="hidden sm:block mb-8" onClick={() => recordAdShown()}>
              <div className="relative">
                <HeaderBannerAd />
                {import.meta.env.DEV && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Header Banner
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Your existing content sections */}

          {/* Content Ad with Testing Label */}
          {shouldDisplayAds && canShowMoreAds && (
            <div className="mb-8" onClick={() => recordAdShown()}>
              <div className="relative">
                <ResponsiveAd placement="content" />
                {import.meta.env.DEV && (
                  <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-2 py-1 rounded">
                    Content Ad
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Your existing dashboard content */}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
