import type React from "react"
import type { Metadata } from "next"
import { GoogleAdsProvider } from "@/components/ads/GoogleAdsProvider"
import "./globals.css"

export const metadata: Metadata = {
  title: "Young Eagles PWA",
  description: "Educational PWA with integrated advertising",
  generator: "Next.js",
  manifest: "/manifest.json",
  keywords: ["education", "pwa", "learning"],
  authors: [{ name: "Young Eagles Team" }],
  viewport: "minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const publisherId = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || ""
  const testMode = process.env.NEXT_PUBLIC_ADSENSE_TEST_MODE === "true"

  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body>
        <GoogleAdsProvider publisherId={publisherId} testMode={testMode}>
          {children}
        </GoogleAdsProvider>
      </body>
    </html>
  )
}
