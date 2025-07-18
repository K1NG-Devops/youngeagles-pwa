"use client"

import { useState } from "react"
import { useGoogleAds } from "./ads/GoogleAdsProvider"
import { MobileBannerAd, HeaderBannerAd, ResponsiveAd } from "./ads/AdSenseComponents"
import useAdFrequency from "@/hooks/useAdFrequency"

export default function Dashboard() {
  const { isAdsLoaded, isAdBlockerDetected } = useGoogleAds()
  const { shouldShowAd, recordAdShown, canShowMoreAds } = useAdFrequency("dashboard", "banner")

  const [stats, setStats] = useState({
    children: 0,
    classes: 0,
    homework: 0,
    pending: 0,
    submitted: 0,
    completionRate: 0,
  })

  // Check if ads should be displayed
  const shouldDisplayAds = isAdsLoaded && !isAdBlockerDetected && process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true"

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-400 via-purple-500 to-purple-600 text-white rounded-2xl shadow-xl mb-8 p-6">
          <h1 className="text-2xl font-bold mb-2">Welcome back!</h1>
          <p className="text-blue-100">Here's your dashboard overview</p>
        </div>

        {/* Mobile Banner Ad */}
        {shouldDisplayAds && shouldShowAd && (
          <div className="block sm:hidden mb-8" onClick={() => recordAdShown()}>
            <MobileBannerAd className="mx-auto" />
          </div>
        )}

        {/* Desktop Header Banner Ad */}
        {shouldDisplayAds && shouldShowAd && (
          <div className="hidden sm:block mb-8" onClick={() => recordAdShown()}>
            <HeaderBannerAd className="mx-auto" />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats.children}</div>
            <div className="text-sm text-gray-600">Children</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats.classes}</div>
            <div className="text-sm text-gray-600">Classes</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">{stats.homework}</div>
            <div className="text-sm text-gray-600">Homework</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">{stats.completionRate}%</div>
            <div className="text-sm text-gray-600">Completion</div>
          </div>
        </div>

        {/* Content Ad */}
        {shouldDisplayAds && canShowMoreAds && (
          <div className="mb-8" onClick={() => recordAdShown()}>
            <ResponsiveAd placement="content" className="mx-auto" />
          </div>
        )}

        {/* Additional Content */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">Your recent activity will appear here...</p>
        </div>
      </main>
    </div>
  )
}
