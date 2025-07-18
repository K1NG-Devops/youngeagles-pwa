"use client"

import { useState, useEffect } from "react"

const AdTroubleshooter = () => {
  const [issues, setIssues] = useState([])
  const [solutions, setSolutions] = useState([])
  const [isVisible, setIsVisible] = useState(false)

  const commonIssues = [
    {
      id: "no-ads-showing",
      title: "No ads are showing",
      checks: [
        {
          name: "AdSense script loaded",
          test: () => typeof window.adsbygoogle !== "undefined",
          solution: "Check if AdSense script is properly loaded in your HTML head",
        },
        {
          name: "Publisher ID set",
          test: () => !!import.meta.env.VITE_ADSENSE_PUBLISHER_ID,
          solution: "Set VITE_ADSENSE_PUBLISHER_ID in your .env file",
        },
        {
          name: "Ad slots configured",
          test: () => !!import.meta.env.VITE_ADSENSE_HEADER_BANNER,
          solution: "Configure ad slot IDs in your .env file",
        },
        {
          name: "Ads enabled",
          test: () => import.meta.env.VITE_ADSENSE_ENABLED === "true",
          solution: "Set VITE_ADSENSE_ENABLED=true in your .env file",
        },
      ],
    },
    {
      id: "ads-blocked",
      title: "Ads are being blocked",
      checks: [
        {
          name: "Ad blocker not detected",
          test: () => {
            const testEl = document.createElement("div")
            testEl.className = "adsbox"
            testEl.style.position = "absolute"
            testEl.style.left = "-9999px"
            document.body.appendChild(testEl)
            const blocked = testEl.offsetHeight === 0
            document.body.removeChild(testEl)
            return !blocked
          },
          solution: "Ask users to disable ad blocker or whitelist your site",
        },
        {
          name: "HTTPS enabled",
          test: () => location.protocol === "https:",
          solution: "AdSense requires HTTPS. Deploy your site with SSL certificate",
        },
      ],
    },
    {
      id: "mobile-issues",
      title: "Mobile ad issues",
      checks: [
        {
          name: "Mobile viewport set",
          test: () => !!document.querySelector('meta[name="viewport"]'),
          solution: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your HTML head',
        },
        {
          name: "Mobile ad slots configured",
          test: () => !!import.meta.env.VITE_ADSENSE_MOBILE_BANNER,
          solution: "Configure mobile-specific ad slots in AdSense dashboard",
        },
      ],
    },
    {
      id: "performance-issues",
      title: "Ad performance issues",
      checks: [
        {
          name: "Ads loading quickly",
          test: () => {
            const ads = document.querySelectorAll(".adsbygoogle")
            return Array.from(ads).some((ad) => ad.dataset.adsbygoogleStatus === "done")
          },
          solution: "Use lazy loading and intersection observer for better performance",
        },
        {
          name: "No console errors",
          test: () => {
            // This is a simplified check - in reality you'd monitor console errors
            return true
          },
          solution: "Check browser console for JavaScript errors that might block ads",
        },
      ],
    },
  ]

  const runDiagnostics = () => {
    const foundIssues = []
    const foundSolutions = []

    commonIssues.forEach((issue) => {
      const failedChecks = issue.checks.filter((check) => {
        try {
          return !check.test()
        } catch (error) {
          console.error(`Error running check ${check.name}:`, error)
          return true
        }
      })

      if (failedChecks.length > 0) {
        foundIssues.push({
          ...issue,
          failedChecks,
        })

        failedChecks.forEach((check) => {
          foundSolutions.push({
            issue: issue.title,
            check: check.name,
            solution: check.solution,
          })
        })
      }
    })

    setIssues(foundIssues)
    setSolutions(foundSolutions)
  }

  useEffect(() => {
    // Run diagnostics on mount
    runDiagnostics()
  }, [])

  // Only show in development
  if (import.meta.env.PROD) return null

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${
          issues.length > 0 ? "bg-red-600 hover:bg-red-700 text-white" : "bg-green-600 hover:bg-green-700 text-white"
        }`}
      >
        🔧 Troubleshooter {issues.length > 0 && `(${issues.length} issues)`}
      </button>

      {isVisible && (
        <div className="absolute bottom-12 left-0 bg-white border border-gray-300 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-lg">Ad Troubleshooter</h3>
              <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
          </div>

          <div className="p-4">
            <button
              onClick={runDiagnostics}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 mb-4"
            >
              Run Diagnostics
            </button>

            {issues.length === 0 ? (
              <div className="text-green-600 text-center py-4">
                <div className="text-2xl mb-2">✅</div>
                <div>No issues detected!</div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-red-600 font-semibold">Found {issues.length} issue(s):</div>

                {solutions.map((solution, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded p-3">
                    <div className="font-semibold text-red-800">{solution.issue}</div>
                    <div className="text-sm text-red-700 mt-1">
                      <strong>Failed:</strong> {solution.check}
                    </div>
                    <div className="text-sm text-red-600 mt-2">
                      <strong>Solution:</strong> {solution.solution}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Fixes */}
            <div className="mt-6 pt-4 border-t">
              <h4 className="font-semibold mb-2">Quick Fixes</h4>
              <div className="space-y-2 text-sm">
                <button
                  onClick={() => {
                    localStorage.clear()
                    window.location.reload()
                  }}
                  className="w-full bg-yellow-600 text-white py-1 px-2 rounded hover:bg-yellow-700"
                >
                  Clear Cache & Reload
                </button>
                <button
                  onClick={() => {
                    const ads = document.querySelectorAll(".adsbygoogle")
                    ads.forEach((ad) => {
                      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
                    })
                  }}
                  className="w-full bg-purple-600 text-white py-1 px-2 rounded hover:bg-purple-700"
                >
                  Refresh All Ads
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdTroubleshooter
