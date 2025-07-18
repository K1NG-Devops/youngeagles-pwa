"use client"

import { useState } from "react"
import { useAdSense } from "./AdSenseProvider"
import useMobileDetection from "../../hooks/useMobileDetection"
import useAdFrequency from "../../hooks/useAdFrequency"

const AdTestingSuite = () => {
  const { adSenseLoaded, adBlockerDetected, adsEnabled, canShowAds } = useAdSense()
  const { isMobile, isTablet, screenSize, deviceType } = useMobileDetection()
  const { shouldShowAd, recordAdShown, canShowMoreAds, getAdStats } = useAdFrequency("test-page", "banner")

  const [testResults, setTestResults] = useState({})
  const [isVisible, setIsVisible] = useState(false)
  const [activeTest, setActiveTest] = useState(null)
  const [testLogs, setTestLogs] = useState([])

  // Environment variables check
  const envVars = {
    VITE_ADSENSE_ENABLED: import.meta.env.VITE_ADSENSE_ENABLED,
    VITE_ADSENSE_TEST_MODE: import.meta.env.VITE_ADSENSE_TEST_MODE,
    VITE_ADSENSE_PUBLISHER_ID: import.meta.env.VITE_ADSENSE_PUBLISHER_ID,
    VITE_ADSENSE_HEADER_BANNER: import.meta.env.VITE_ADSENSE_HEADER_BANNER,
    VITE_ADSENSE_MOBILE_BANNER: import.meta.env.VITE_ADSENSE_MOBILE_BANNER,
    VITE_ADSENSE_CONTENT_RECTANGLE: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE,
  }

  const addLog = (message, type = "info") => {
    const timestamp = new Date().toLocaleTimeString()
    setTestLogs((prev) => [...prev.slice(-20), { timestamp, message, type }])
  }

  // Comprehensive ad testing functions
  const runAdTests = async () => {
    setActiveTest("comprehensive")
    addLog("Starting comprehensive ad tests...", "info")

    const results = {}

    // Test 1: Environment Variables
    addLog("Testing environment variables...", "info")
    results.envVars = Object.entries(envVars).map(([key, value]) => ({
      key,
      value: value || "NOT SET",
      status: value ? "✅" : "❌",
    }))

    // Test 2: AdSense Script Loading
    addLog("Testing AdSense script loading...", "info")
    results.adSenseScript = {
      loaded: adSenseLoaded,
      available: typeof window.adsbygoogle !== "undefined",
      scriptExists: !!document.querySelector('script[src*="adsbygoogle.js"]'),
      status: adSenseLoaded ? "✅" : "❌",
    }

    // Test 3: Ad Blocker Detection
    addLog("Testing ad blocker detection...", "info")
    results.adBlocker = {
      detected: adBlockerDetected,
      status: adBlockerDetected ? "❌ Blocked" : "✅ Not Blocked",
    }

    // Test 4: Device Detection
    addLog("Testing device detection...", "info")
    results.device = {
      type: deviceType,
      isMobile,
      isTablet,
      screenSize: `${screenSize.width}x${screenSize.height}`,
      status: "✅",
    }

    // Test 5: Ad Frequency Logic
    addLog("Testing ad frequency logic...", "info")
    const adStats = getAdStats()
    results.frequency = {
      shouldShow: shouldShowAd,
      canShowMore: canShowMoreAds,
      stats: adStats,
      status: "✅",
    }

    // Test 6: Network Connectivity
    addLog("Testing network connectivity...", "info")
    try {
      const response = await fetch("https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js", {
        method: "HEAD",
        mode: "no-cors",
      })
      results.network = {
        adSenseReachable: true,
        status: "✅",
      }
    } catch (error) {
      results.network = {
        adSenseReachable: false,
        error: error.message,
        status: "❌",
      }
    }

    // Test 7: DOM Ad Elements
    addLog("Testing DOM ad elements...", "info")
    const adElements = document.querySelectorAll(".adsbygoogle")
    results.domElements = {
      count: adElements.length,
      elements: Array.from(adElements).map((el, index) => ({
        index,
        slot: el.dataset.adSlot,
        status: el.dataset.adsbygoogleStatus || "unknown",
        visible: el.offsetParent !== null,
        dimensions: `${el.offsetWidth}x${el.offsetHeight}`,
      })),
      status: adElements.length > 0 ? "✅" : "⚠️",
    }

    setTestResults(results)
    setActiveTest(null)
    addLog("Comprehensive tests completed!", "success")
  }

  const testSpecificAd = async (adType) => {
    setActiveTest(adType)
    addLog(`Testing ${adType} ad...`, "info")

    // Create test ad element
    const testContainer = document.createElement("div")
    testContainer.style.position = "absolute"
    testContainer.style.left = "-9999px"
    testContainer.innerHTML = `
      <ins class="adsbygoogle test-ad"
           style="display:block"
           data-ad-client="${envVars.VITE_ADSENSE_PUBLISHER_ID}"
           data-ad-slot="${envVars[`VITE_ADSENSE_${adType.toUpperCase()}`]}"
           data-ad-format="auto"
           data-full-width-responsive="true">
      </ins>
    `

    document.body.appendChild(testContainer)

    try {
      // Try to load the ad
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})

      // Wait and check result
      setTimeout(() => {
        const testAd = testContainer.querySelector(".test-ad")
        const success = testAd.dataset.adsbygoogleStatus === "done"

        addLog(`${adType} ad test ${success ? "passed" : "failed"}`, success ? "success" : "error")

        // Clean up
        document.body.removeChild(testContainer)
        setActiveTest(null)
      }, 3000)
    } catch (error) {
      addLog(`${adType} ad test failed: ${error.message}`, "error")
      document.body.removeChild(testContainer)
      setActiveTest(null)
    }
  }

  const clearLogs = () => {
    setTestLogs([])
  }

  const exportTestResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      testResults,
      testLogs,
      environment: envVars,
      device: { isMobile, isTablet, screenSize, deviceType },
      adSense: { adSenseLoaded, adBlockerDetected, adsEnabled, canShowAds },
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ad-test-results-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Only show in development
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed top-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors"
      >
        🧪 Ad Testing Suite
      </button>

      {isVisible && (
        <div className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Ad Testing Suite</h3>
              <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Quick Status */}
            <div className="bg-gray-50 p-3 rounded">
              <h4 className="font-semibold mb-2">Quick Status</h4>
              <div className="text-sm space-y-1">
                <div>AdSense Loaded: {adSenseLoaded ? "✅" : "❌"}</div>
                <div>Ad Blocker: {adBlockerDetected ? "❌ Detected" : "✅ Not Detected"}</div>
                <div>Ads Enabled: {adsEnabled ? "✅" : "❌"}</div>
                <div>Can Show Ads: {canShowAds ? "✅" : "❌"}</div>
                <div>Device: {deviceType}</div>
              </div>
            </div>

            {/* Test Buttons */}
            <div className="space-y-2">
              <button
                onClick={runAdTests}
                disabled={activeTest === "comprehensive"}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {activeTest === "comprehensive" ? "Running Tests..." : "Run All Tests"}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => testSpecificAd("HEADER_BANNER")}
                  disabled={activeTest}
                  className="bg-purple-600 text-white py-1 px-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  Test Header
                </button>
                <button
                  onClick={() => testSpecificAd("MOBILE_BANNER")}
                  disabled={activeTest}
                  className="bg-purple-600 text-white py-1 px-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  Test Mobile
                </button>
                <button
                  onClick={() => testSpecificAd("CONTENT_RECTANGLE")}
                  disabled={activeTest}
                  className="bg-purple-600 text-white py-1 px-2 rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  Test Content
                </button>
                <button
                  onClick={() => recordAdShown()}
                  className="bg-orange-600 text-white py-1 px-2 rounded text-sm hover:bg-orange-700"
                >
                  Record Ad
                </button>
              </div>
            </div>

            {/* Test Results */}
            {Object.keys(testResults).length > 0 && (
              <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                <h4 className="font-semibold mb-2">Test Results</h4>
                <div className="text-xs space-y-2">
                  {Object.entries(testResults).map(([key, value]) => (
                    <div key={key} className="border-b pb-1">
                      <strong>{key}:</strong>
                      <pre className="text-xs mt-1 whitespace-pre-wrap">
                        {typeof value === "object" ? JSON.stringify(value, null, 2) : value}
                      </pre>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Test Logs */}
            <div className="bg-gray-50 p-3 rounded">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold">Test Logs</h4>
                <button onClick={clearLogs} className="text-xs text-red-600 hover:text-red-800">
                  Clear
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                {testLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`${
                      log.type === "error"
                        ? "text-red-600"
                        : log.type === "success"
                          ? "text-green-600"
                          : "text-gray-600"
                    }`}
                  >
                    <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
                  </div>
                ))}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={exportTestResults}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 text-sm"
            >
              Export Test Results
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdTestingSuite
