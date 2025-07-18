import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css" // Import global styles

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "EduDash Pro",
  description: "Your professional education management platform",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
