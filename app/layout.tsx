import type React from "react"
import type { Metadata } from "next"
import { GoogleAdsProvider } from "@/components/ads/GoogleAdsProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Young Eagles PWA",
  description: "Educational Progressive Web App for Young Eagles",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["education", "pwa", "learning", "young eagles"],
  authors: [{ name: "Young Eagles Team" }],
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
  themeColor: "#000000",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: process.env.NEXT_PUBLIC_APP_NAME || "Young Eagles PWA",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ""
  const testMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true"
  const adsEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true"

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
        {adsEnabled && publisherId ? (
          <GoogleAdsProvider publisherId={publisherId} testMode={testMode}>
            {children}
          </GoogleAdsProvider>
        ) : (
          children
        )}
      </body>
    </html>
  )
}
