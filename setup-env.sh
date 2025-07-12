#!/bin/bash

# Setup script for Young Eagles PWA environment variables
echo "Setting up Young Eagles PWA environment variables..."

# Create .env file with AdSense configuration
cat > .env << 'EOF'
# Google AdSense Configuration
VITE_ADSENSE_PUBLISHER_ID=ca-pub-5506438806314781
VITE_ADSENSE_ENABLED=true
VITE_ADSENSE_TEST_MODE=false

# AdSense Ad Unit IDs
VITE_ADSENSE_MOBILE_BANNER=5122452205
VITE_ADSENSE_FOOTER_BANNER=3546766216
VITE_ADSENSE_HEADER_BANNER=9586077878
VITE_ADSENSE_SIDEBAR_SKYSCRAPER=8151940224
VITE_ADSENSE_CONTENT_RECTANGLE=1707587859
VITE_ADSENSE_IN_FEED_NATIVE=6408733271
VITE_ADSENSE_IN_ARTICLE_NATIVE=4668276193

# API Configuration
VITE_API_URL=https://youngeagles-api.vercel.app
VITE_APP_ENV=development
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📝 Environment variables configured:"
echo "   - Google AdSense Publisher ID: ca-pub-5506438806314781"
echo "   - All ad unit IDs from your AdSense account"
echo "   - Test mode: disabled (set to true for testing)"
echo ""
echo "🚀 You can now run: npm run dev"
echo ""
echo "⚠️  Note: Make sure to keep your .env file secure and never commit it to version control!" 