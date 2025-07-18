import GoogleAd from "./GoogleAd"
import { useAdSense } from "./AdSenseProvider"
import useMobileDetection from "../../hooks/useMobileDetection"

// Fallback component when ads can't be shown
const AdFallback = ({ type = "banner", className = "" }) => {
  const fallbacks = {
    banner: (
      <div
        className={`ad-fallback bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg text-center ${className}`}
      >
        <h3 className="font-bold text-sm mb-1">Support Young Eagles</h3>
        <p className="text-xs opacity-90">Upgrade to remove ads and unlock premium features</p>
      </div>
    ),
    rectangle: (
      <div
        className={`ad-fallback bg-gray-100 border-2 border-dashed border-gray-300 p-6 rounded-lg text-center ${className}`}
      >
        <div className="text-gray-500 mb-2">📚</div>
        <p className="text-sm text-gray-600">Educational Content</p>
        <p className="text-xs text-gray-500 mt-1">Discover premium learning resources</p>
      </div>
    ),
    native: (
      <div className={`ad-fallback bg-white border border-gray-200 rounded-lg p-4 shadow-sm ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">🎓</span>
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">Premium Features</h4>
            <p className="text-sm text-gray-600">Unlock advanced learning tools</p>
          </div>
        </div>
      </div>
    ),
  }

  return fallbacks[type] || fallbacks.banner
}

// Enhanced ad components with fallbacks
export const HeaderBannerAd = ({ className = "" }) => {
  const { canShowAds } = useAdSense()

  if (!canShowAds) {
    return <AdFallback type="banner" className={className} />
  }

  return (
    <GoogleAd
      slot={import.meta.env.VITE_ADSENSE_HEADER_BANNER || "1234567890"}
      style={{
        display: "block",
        margin: "16px auto",
        width: "100%",
        minHeight: "50px",
        textAlign: "center",
      }}
      format="auto"
      responsive={true}
      hideWhenEmpty={true}
      className={`mobile-header-safe ${className}`}
    />
  )
}

export const MobileBannerAd = ({ className = "" }) => {
  const { canShowAds } = useAdSense()
  const { isMobile } = useMobileDetection()

  if (!canShowAds || !isMobile) {
    return null
  }

  return (
    <GoogleAd
      slot={import.meta.env.VITE_ADSENSE_MOBILE_BANNER || "1234567890"}
      style={{
        display: "block",
        margin: "8px auto",
        width: "320px",
        height: "50px",
      }}
      format="auto"
      responsive={false}
      hideWhenEmpty={true}
      className={`mobile-optimized ${className}`}
    />
  )
}

export const ContentRectangleAd = ({ className = "" }) => {
  const { canShowAds } = useAdSense()

  if (!canShowAds) {
    return <AdFallback type="rectangle" className={className} />
  }

  return (
    <GoogleAd
      slot={import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE || "1234567890"}
      style={{
        display: "block",
        margin: "16px auto",
        width: "300px",
        height: "250px",
      }}
      format="rectangle"
      responsive={false}
      hideWhenEmpty={true}
      className={className}
    />
  )
}

export const ResponsiveAd = ({ placement = "content", className = "" }) => {
  const { canShowAds } = useAdSense()
  const { isMobile, isTablet } = useMobileDetection()

  if (!canShowAds) {
    const fallbackType = placement === "content" ? "rectangle" : "banner"
    return <AdFallback type={fallbackType} className={className} />
  }

  const getSlot = () => {
    const slots = {
      header: import.meta.env.VITE_ADSENSE_HEADER_BANNER || "1234567890",
      content: import.meta.env.VITE_ADSENSE_CONTENT_RECTANGLE || "1234567890",
      sidebar: import.meta.env.VITE_ADSENSE_SIDEBAR_SKYSCRAPER || "1234567890",
      footer: import.meta.env.VITE_ADSENSE_FOOTER_BANNER || "1234567890",
      infeed: import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE || "1234567890",
    }
    return slots[placement] || slots.content
  }

  const getStyle = () => {
    if (isMobile) {
      return {
        display: "block",
        margin: "8px auto",
        width: "100%",
        maxWidth: "320px",
        minHeight: "50px",
      }
    }

    return {
      display: "block",
      margin: "16px auto",
      width: "100%",
      minHeight: "90px",
    }
  }

  return (
    <GoogleAd
      slot={getSlot()}
      style={getStyle()}
      format="auto"
      responsive={true}
      hideWhenEmpty={true}
      className={`responsive-ad-${placement} ${className}`}
    />
  )
}

export const InFeedNativeAd = ({ className = "" }) => {
  const { canShowAds } = useAdSense()

  if (!canShowAds) {
    return <AdFallback type="native" className={className} />
  }

  return (
    <GoogleAd
      slot={import.meta.env.VITE_ADSENSE_IN_FEED_NATIVE || "1234567890"}
      style={{
        display: "block",
        margin: "20px auto",
        width: "100%",
        minHeight: "200px",
      }}
      format="fluid"
      responsive={true}
      hideWhenEmpty={true}
      className={className}
    />
  )
}
