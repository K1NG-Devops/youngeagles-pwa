import {
  HeaderBannerAd,
  ContentRectangleAd,
  MobileBannerAd,
  SidebarSkyscraperAd,
  FooterBannerAd,
  InFeedNativeAd,
  InArticleNativeAd,
  BannerAdUnit,
  MainDisplayAd,
} from "../../components/ads/AdSenseComponents"

function AdTestPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">AdSense Test Page</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Header Banner Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[100px]">
          <HeaderBannerAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Main Display Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[250px]">
          <MainDisplayAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Content Rectangle Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[250px]">
          <ContentRectangleAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Mobile Banner Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[50px]">
          <MobileBannerAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Sidebar Skyscraper Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[600px]">
          <SidebarSkyscraperAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Footer Banner Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[100px]">
          <FooterBannerAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">In-Feed Native Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[150px]">
          <InFeedNativeAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">In-Article Native Ad</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[150px]">
          <InArticleNativeAd />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Generic Banner Ad Unit</h2>
        <div className="border p-4 bg-gray-50 flex justify-center items-center min-h-[100px]">
          <BannerAdUnit />
        </div>
      </div>
    </div>
  )
}

export default AdTestPage
