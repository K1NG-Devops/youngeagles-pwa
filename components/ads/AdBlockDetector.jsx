"use client"

import { useState, useEffect } from "react"

export const AdBlockDetector = ({ children, fallback }) => {
  const [adBlockDetected, setAdBlockDetected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to fetch a common ad-related URL
        const response = await fetch("/ads.txt", {
          method: "HEAD",
          cache: "no-cache",
        })

        // Method 2: Check if AdSense script is blocked
        const adSenseScript = document.querySelector('script[src*="googlesyndication.com"]')

        // Method 3: Create a test element that ad blockers typically hide
        const testAd = document.createElement("div")
        testAd.innerHTML = "&nbsp;"
        testAd.className = "adsbox"
        testAd.style.position = "absolute"
        testAd.style.left = "-10000px"
        document.body.appendChild(testAd)

        setTimeout(() => {
          const isHidden = testAd.offsetHeight === 0
          document.body.removeChild(testAd)

          // If any detection method indicates ad blocking
          if (!response.ok || !adSenseScript || isHidden) {
            setAdBlockDetected(true)
          }

          setIsLoading(false)
        }, 100)
      } catch (error) {
        // If fetch fails, likely due to ad blocker
        setAdBlockDetected(true)
        setIsLoading(false)
      }
    }

    detectAdBlock()
  }, [])

  if (isLoading) {
    return (
      <div
        className="ad-loading"
        style={{
          padding: "20px",
          textAlign: "center",
          color: "#666",
        }}
      >
        Loading...
      </div>
    )
  }

  if (adBlockDetected) {
    return (
      fallback || (
        <div
          className="ad-block-message"
          style={{
            padding: "20px",
            textAlign: "center",
            backgroundColor: "#f8f9fa",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            margin: "10px 0",
          }}
        >
          <h4 style={{ margin: "0 0 10px 0", color: "#495057" }}>Ad Blocker Detected</h4>
          <p style={{ margin: "0", color: "#6c757d", fontSize: "14px" }}>
            Please consider disabling your ad blocker to support our content.
          </p>
        </div>
      )
    )
  }

  return children
}

// Wrapper component for ads with ad block detection
export const AdWithBlockDetection = ({ children, fallbackMessage }) => (
  <AdBlockDetector
    fallback={
      <div
        style={{
          padding: "15px",
          textAlign: "center",
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "4px",
          color: "#856404",
        }}
      >
        {fallbackMessage || "Please disable ad blocker to view ads"}
      </div>
    }
  >
    {children}
  </AdBlockDetector>
)
