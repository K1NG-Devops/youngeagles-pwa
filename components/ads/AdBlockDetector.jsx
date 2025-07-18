"use client"

import { useState, useEffect } from "react"

export const AdBlockDetector = ({ children, fallback }) => {
  const [adBlockDetected, setAdBlockDetected] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Method 1: Try to load a known ad-related resource
        const testAd = document.createElement("div")
        testAd.innerHTML = "&nbsp;"
        testAd.className = "adsbox"
        testAd.style.position = "absolute"
        testAd.style.left = "-10000px"
        document.body.appendChild(testAd)

        setTimeout(() => {
          const isBlocked = testAd.offsetHeight === 0
          document.body.removeChild(testAd)
          setAdBlockDetected(isBlocked)
          setLoading(false)
        }, 100)

        // Method 2: Check for adsbygoogle
        setTimeout(() => {
          if (!window.adsbygoogle || window.adsbygoogle.length === 0) {
            setAdBlockDetected(true)
          }
          setLoading(false)
        }, 2000)
      } catch (error) {
        console.log("Ad block detection failed:", error)
        setAdBlockDetected(false)
        setLoading(false)
      }
    }

    detectAdBlock()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (adBlockDetected) {
    return (
      fallback || (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            textAlign: "center",
            margin: "10px 0",
          }}
        >
          <h4>Support Young Eagles</h4>
          <p>We notice you're using an ad blocker. Please consider disabling it to support our educational programs.</p>
          <small>Ads help us provide free resources to students and families.</small>
        </div>
      )
    )
  }

  return children
}

export const AdBlockFallback = ({ message, showDonation = true }) => (
  <div
    style={{
      padding: "20px",
      backgroundColor: "#e8f4fd",
      border: "1px solid #bee5eb",
      borderRadius: "4px",
      textAlign: "center",
      margin: "10px 0",
    }}
  >
    <h4>🦅 Young Eagles PWA</h4>
    <p>{message || "Help us keep this app free by allowing ads or making a donation."}</p>
    {showDonation && (
      <button
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "10px",
        }}
        onClick={() => window.open("/donate", "_blank")}
      >
        Support Us
      </button>
    )}
  </div>
)
