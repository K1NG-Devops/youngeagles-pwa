"use client"

import { useState, useRef } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useNavigate } from "react-router-dom"
import { useTheme } from "../contexts/ThemeContext"
import { useSubscription } from "../contexts/SubscriptionContext"
import { useAdSense } from "../components/ads/AdSenseProvider" // Add this
import Header from "../components/Header"
import NativeAppEnhancements from "../components/NativeAppEnhancements"

// Updated ad components
import { MobileBannerAd, ResponsiveAd, HeaderBannerAd } from "../components/ads/UpdatedAdSenseComponents"

import MobileAdDebugger from "../components/MobileAdDebugger"
import useAdFrequency from "../hooks/useAdFrequency"

const Dashboard = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const { getCurrentPlan } = useSubscription()
  const { canShowAds } = useAdSense() // Use AdSense context
  const navigate = useNavigate()
  const swipeRef = useRef(null)

  // Your existing state...
  const [stats, setStats] = useState({
    children: 0,
    classes: 0,
    homework: 0,
    pending: 0,
    submitted: 0,
    completionRate: 0,
  })

  // Ad frequency with better integration
  const { shouldShowAd, recordAdShown, canShowMoreAds } = useAdFrequency("dashboard", "banner")

  // Check if ads should be displayed
  const shouldDisplayAds = canShowAds && getCurrentPlan()?.features?.ads_enabled

  // Your existing useEffect and handlers...

  return (
    <div
      ref={swipeRef}
      className={`min-h-screen mt-0 ${isDark ? "bg-gray-900" : "bg-gray-50"} mobile-scroll-container`}
    >
      <Header />
      <NativeAppEnhancements />

      <main className="relative">
        <div className="mobile-container">
          {/* Your existing welcome section */}

          {/* Updated Mobile-First Banner Ads */}
          {shouldDisplayAds && shouldShowAd && (
            <div className="block sm:hidden mb-8" onClick={() => recordAdShown()}>
              <MobileBannerAd />
            </div>
          )}

          {shouldDisplayAds && shouldShowAd && (
            <div className="hidden sm:block mb-8" onClick={() => recordAdShown()}>
              <HeaderBannerAd />
            </div>
          )}

          {/* Your existing content */}

          {/* Content Ad with better frequency control */}
          {shouldDisplayAds && canShowMoreAds && (
            <div className="mb-8" onClick={() => recordAdShown()}>
              <ResponsiveAd placement="content" />
            </div>
          )}

          {/* Your existing components */}
        </div>
      </main>

      {/* Mobile Ad Debugger - only in development */}
      {import.meta.env.DEV && <MobileAdDebugger />}
    </div>
  )
}

export default Dashboard
