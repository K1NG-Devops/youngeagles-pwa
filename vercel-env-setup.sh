#!/bin/bash

# Set up Vercel environment variables for Google AdSense
echo "Setting up Vercel environment variables for AdSense..."

# Core AdSense Configuration
vercel env add VITE_ADSENSE_PUBLISHER_ID ca-pub-5506438806314781 production
vercel env add VITE_ADSENSE_ENABLED true production
vercel env add VITE_ADSENSE_TEST_MODE false production

# Ad Unit IDs
vercel env add VITE_ADSENSE_MOBILE_BANNER 5122452205 production
vercel env add VITE_ADSENSE_FOOTER_BANNER 3546766216 production
vercel env add VITE_ADSENSE_HEADER_BANNER 9586077878 production
vercel env add VITE_ADSENSE_SIDEBAR_SKYSCRAPER 8151940224 production
vercel env add VITE_ADSENSE_CONTENT_RECTANGLE 1707587859 production
vercel env add VITE_ADSENSE_IN_FEED_NATIVE 6408733271 production
vercel env add VITE_ADSENSE_IN_ARTICLE_NATIVE 4668276193 production

# Legacy compatibility
vercel env add VITE_ADSENSE_BANNER_AD_UNIT 5122452205 production
vercel env add VITE_ADSENSE_SIDEBAR_AD_UNIT 8151940224 production
vercel env add VITE_ADSENSE_FOOTER_AD_UNIT 3546766216 production
vercel env add VITE_ADSENSE_HEADER_AD_UNIT 9586077878 production
vercel env add VITE_ADSENSE_CONTENT_AD_UNIT 1707587859 production
vercel env add VITE_ADSENSE_MAIN_DISPLAY_AD_UNIT 2894237519 production

echo "Environment variables set! Run 'vercel --prod' to deploy with the new configuration."
