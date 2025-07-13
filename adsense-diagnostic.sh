#!/bin/bash

# AdSense Diagnostic Script
# This script checks various aspects of AdSense configuration

echo "🔍 Young Eagles PWA - AdSense Diagnostic Check"
echo "============================================="

# Check environment variables
echo -e "\n📋 Environment Variables:"
echo "VITE_ADSENSE_PUBLISHER_ID: $VITE_ADSENSE_PUBLISHER_ID"
echo "VITE_ADSENSE_ENABLED: $VITE_ADSENSE_ENABLED"
echo "VITE_ADSENSE_TEST_MODE: $VITE_ADSENSE_TEST_MODE"

# Check ads.txt file
echo -e "\n📄 ads.txt File:"
if [ -f "public/ads.txt" ]; then
    echo "✅ ads.txt exists"
    cat public/ads.txt
else
    echo "❌ ads.txt not found"
fi

# Check AdSense script in index.html
echo -e "\n🔧 AdSense Script Check:"
if grep -q "adsbygoogle.js" index.html; then
    echo "✅ AdSense script found in index.html"
    grep -n "adsbygoogle" index.html
else
    echo "❌ AdSense script not found in index.html"
fi

# Check subscription logic
echo -e "\n🔒 Subscription Logic Check:"
if grep -q "showAds()" src/contexts/SubscriptionContext.jsx; then
    echo "✅ showAds() function exists"
    echo "Current implementation:"
    grep -A 10 "showAds = ()" src/contexts/SubscriptionContext.jsx
else
    echo "❌ showAds() function not found"
fi

# Check AutoAds component
echo -e "\n🎯 AutoAds Component Check:"
if [ -f "src/components/ads/AutoAds.jsx" ]; then
    echo "✅ AutoAds component exists"
    if grep -q "AutoAds" src/App.jsx; then
        echo "✅ AutoAds component used in App.jsx"
    else
        echo "❌ AutoAds component not used in App.jsx"
    fi
else
    echo "❌ AutoAds component not found"
fi

# Check Vercel deployment
echo -e "\n🚀 Vercel Deployment Check:"
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json exists"
    if grep -q "Content-Security-Policy" vercel.json; then
        echo "✅ CSP headers configured"
    else
        echo "❌ CSP headers not configured"
    fi
else
    echo "❌ vercel.json not found"
fi

echo -e "\n✅ Diagnostic complete!"
echo "If all checks pass, ads should work in production."
