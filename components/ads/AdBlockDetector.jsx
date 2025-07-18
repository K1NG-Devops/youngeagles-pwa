"use client"

import { useEffect, useState } from "react"

export const useAdBlockDetector = () => {
  const [adBlocked, setAdBlocked] = useState(false)

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Attempt to fetch a known ad script or create a dummy ad element
        const testUrl = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
        const response = await fetch(testUrl, { method: "HEAD", mode: "no-cors" })
        // If the fetch fails or is intercepted, it might indicate an ad blocker
        // This is a heuristic, not foolproof
        if (!response || !response.ok) {
          setAdBlocked(true)
          console.warn("Ad blocker detected (heuristic).")
        } else {
          setAdBlocked(false)
        }
      } catch (error) {
        setAdBlocked(true)
        console.warn("Ad blocker detected (network error or interception).", error)
      }

      // Alternative: Create a dummy ad element and check its properties
      const dummyAd = document.createElement("div")
      dummyAd.innerHTML = "&nbsp;"
      dummyAd.className = "adsbox" // Common class name used by ad blockers
      dummyAd.style.position = "absolute"
      dummyAd.style.left = "-9999px"
      dummyAd.style.height = "1px"
      dummyAd.style.width = "1px"
      document.body.appendChild(dummyAd)

      // Use a timeout to allow ad blockers to act
      setTimeout(() => {
        if (dummyAd.offsetHeight === 0 || dummyAd.offsetParent === null) {
          setAdBlocked(true)
          console.warn("Ad blocker detected (dummy element method).")
        }
        document.body.removeChild(dummyAd)
      }, 100)
    }

    detectAdBlock()
  }, [])

  return { adBlocked }
}
