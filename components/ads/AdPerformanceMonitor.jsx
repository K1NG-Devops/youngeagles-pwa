"use client"

import { useState, useEffect } from "react"
import { useAdSense } from "./AdSenseProvider"

const AdPerformanceMonitor = () => {
  const { canShowAds } = useAdSense()
  const [adMetrics, setAdMetrics] = useState({
    totalAdsLoaded: 0,
    totalAdsFailed: 0,
    averageLoadTime: 0,
    adsByType: {},
    loadTimes: [],
    errors: [],
  })

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!canShowAds) return

    const monitorAds = () => {
      const ads = document.querySelectorAll(".adsbygoogle")
      const metrics = {
        totalAdsLoaded: 0,
        totalAdsFailed: 0,
        averageLoadTime: 0,
        adsByType: {},
        loadTimes: [],
        errors: [],
      }

      ads.forEach((ad) => {
        const slot = ad.dataset.adSlot
        const status = ad.dataset.adsbygoogleStatus
        const loadTime = ad.dataset.loadTime

        if (!metrics.adsByType[slot]) {
          metrics.adsByType[slot] = { loaded: 0, failed: 0, total: 0 }
        }

        metrics.adsByType[slot].total++

        if (status === "done") {
          metrics.totalAdsLoaded++
          metrics.adsByType[slot].loaded++

          if (loadTime) {
            metrics.loadTimes.push(Number.parseInt(loadTime))
          }
        } else if (status === "error") {
          metrics.totalAdsFailed++
          metrics.adsByType[slot].failed++
        }
      })

      if (metrics.loadTimes.length > 0) {
        metrics.averageLoadTime = metrics.loadTimes.reduce((a, b) => a + b, 0) / metrics.loadTimes.length
      }

      setAdMetrics(metrics)
    }

    // Monitor every 5 seconds
    const interval = setInterval(monitorAds, 5000)
    monitorAds() // Initial check

    return () => clearInterval(interval)
  }, [canShowAds])

  // Performance scoring
  const getPerformanceScore = () => {
    const { totalAdsLoaded, totalAdsFailed, averageLoadTime } = adMetrics
    const total = totalAdsLoaded + totalAdsFailed

    if (total === 0) return { score: 0, grade: "N/A" }

    const successRate = (totalAdsLoaded / total) * 100
    const speedScore = averageLoadTime < 1000 ? 100 : Math.max(0, 100 - (averageLoadTime - 1000) / 100)

    const score = (successRate * 0.7 + speedScore * 0.3).toFixed(1)
    let grade = "F"

    if (score >= 90) grade = "A"
    else if (score >= 80) grade = "B"
    else if (score >= 70) grade = "C"
    else if (score >= 60) grade = "D"

    return { score, grade }
  }

  const { score, grade } = getPerformanceScore()

  // Only show in development
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        📊 Ad Performance
      </button>

      {isVisible && (
        <div className="absolute top-12 right-0 bg-white border border-gray-300 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Ad Performance</h3>
              <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Performance Score */}
            <div className="text-center">
              <div
                className={`text-4xl font-bold ${
                  grade === "A"
                    ? "text-green-600"
                    : grade === "B"
                      ? "text-blue-600"
                      : grade === "C"
                        ? "text-yellow-600"
                        : "text-red-600"
                }`}
              >
                {grade}
              </div>
              <div className="text-sm text-gray-600">Performance Score: {score}%</div>
            </div>

            {/* Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ads Loaded:</span>
                <span className="font-semibold text-green-600">{adMetrics.totalAdsLoaded}</span>
              </div>
              <div className="flex justify-between">
                <span>Ads Failed:</span>
                <span className="font-semibold text-red-600">{adMetrics.totalAdsFailed}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg Load Time:</span>
                <span className="font-semibold">{Math.round(adMetrics.averageLoadTime)}ms</span>
              </div>
            </div>

            {/* Ad Types Breakdown */}
            <div>
              <h4 className="font-semibold mb-2">By Ad Type</h4>
              <div className="space-y-1 text-sm">
                {Object.entries(adMetrics.adsByType).map(([slot, data]) => (
                  <div key={slot} className="flex justify-between">
                    <span className="truncate">{slot.slice(-8)}...</span>
                    <span>
                      {data.loaded}/{data.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Load Time Distribution */}
            {adMetrics.loadTimes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Load Times</h4>
                <div className="text-sm space-y-1">
                  <div>Min: {Math.min(...adMetrics.loadTimes)}ms</div>
                  <div>Max: {Math.max(...adMetrics.loadTimes)}ms</div>
                  <div>Median: {adMetrics.loadTimes.sort()[Math.floor(adMetrics.loadTimes.length / 2)]}ms</div>
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-blue-50 p-3 rounded">
              <h4 className="font-semibold mb-2 text-blue-800">Recommendations</h4>
              <div className="text-sm text-blue-700 space-y-1">
                {score < 70 && <div>• Consider reducing ad frequency</div>}
                {adMetrics.averageLoadTime > 2000 && <div>• Optimize ad loading performance</div>}
                {adMetrics.totalAdsFailed > 0 && <div>• Check ad slot configurations</div>}
                {Object.keys(adMetrics.adsByType).length === 0 && <div>• No ads detected - check setup</div>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdPerformanceMonitor
