"use client"

import { useState, useEffect } from "react"

const useMobileDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenSize: { width: 0, height: 0 },
    orientation: "landscape",
    touchSupported: false,
    userAgent: "",
    deviceType: "desktop",
  })

  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      const userAgent = navigator.userAgent.toLowerCase()
      const touchSupported = "ontouchstart" in window || navigator.maxTouchPoints > 0

      // Mobile detection
      const mobileRegex =
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|rim)|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i
      const tabletRegex = /android|ipad|playbook|silk/i

      const isMobile = mobileRegex.test(userAgent) || tabletRegex.test(userAgent.substring(0, 4))

      // Tablet detection (more specific)
      const isTablet = (width >= 768 && width <= 1024) || /ipad|android(?!.*mobile)/i.test(userAgent)

      // Desktop detection
      const isDesktop = width > 1024 && !touchSupported

      // Orientation
      const orientation = width > height ? "landscape" : "portrait"

      // Device type
      let deviceType = "desktop"
      if (isMobile && !isTablet) deviceType = "mobile"
      else if (isTablet) deviceType = "tablet"

      setDeviceInfo({
        isMobile: isMobile && !isTablet,
        isTablet,
        isDesktop,
        screenSize: { width, height },
        orientation,
        touchSupported,
        userAgent,
        deviceType,
      })
    }

    // Initial detection
    detectDevice()

    // Listen for resize events
    const handleResize = () => {
      detectDevice()
    }

    // Listen for orientation changes
    const handleOrientationChange = () => {
      setTimeout(detectDevice, 100) // Small delay for orientation change
    }

    window.addEventListener("resize", handleResize)
    window.addEventListener("orientationchange", handleOrientationChange)

    return () => {
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("orientationchange", handleOrientationChange)
    }
  }, [])

  return deviceInfo
}

export default useMobileDetection
