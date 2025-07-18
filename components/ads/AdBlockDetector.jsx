"use client"

import { useState, useEffect } from "react"

export const useAdBlockDetector = () => {
  const [isAdBlocked, setIsAdBlocked] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const detectAdBlock = async () => {
      try {
        // Attempt to load a common ad script or resource
        // This is a common heuristic, but not foolproof
        const testUrl = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        const response = await fetch(testUrl, { method: "HEAD", mode: "no-cors" })

        // If the fetch fails or returns an opaque response (due to no-cors and ad blocker),
        // it might indicate an ad blocker.
        // A more robust check might involve checking the size of a known ad element
        // or using a dedicated ad block detection library.
        if (!response || response.type === "opaque" || response.status === 0) {
          setIsAdBlocked(true)
        } else {
          setIsAdBlocked(false)
        }
      } catch (error) {
        // Network error or ad blocker preventing fetch
        setIsAdBlocked(true)
      }
    }

    detectAdBlock()

    // You might want to re-check periodically or on certain events
    const interval = setInterval(detectAdBlock, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  return { isAdBlocked }
}
