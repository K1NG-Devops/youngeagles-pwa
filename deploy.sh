#!/bin/bash

# Young Eagles PWA - Production Deployment Script
# Run this script to deploy to production

set -e  # Exit on any error

echo "🚀 Starting YoungEagles PWA Production Deployment"
echo "================================================"

# Verify we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Are you in the project root?"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder not found. Run 'npm run build' first."
    exit 1
fi

echo "✅ Pre-flight checks passed"

# Choose deployment method
echo ""
echo "Choose deployment method:"
echo "1) Vercel"
echo "2) Netlify"
echo "3) Show manual upload instructions"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo "🌐 Deploying to Vercel..."
        if ! command -v vercel &> /dev/null; then
            echo "Installing Vercel CLI..."
            npm install -g vercel
        fi
        cd dist
        echo "📤 Deploying to production..."
        vercel --prod
        cd ..
        echo "✅ Vercel deployment complete!"
        ;;
    2)
        echo "🌐 Deploying to Netlify..."
        if ! command -v netlify &> /dev/null; then
            echo "Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        cd dist
        echo "📤 Deploying to production..."
        netlify deploy --prod --dir .
        cd ..
        echo "✅ Netlify deployment complete!"
        ;;
    3)
        echo "📁 Manual Upload Instructions:"
        echo "1. Upload all files from the 'dist' folder to your web server"
        echo "2. Ensure the files are in the public web directory"
        echo "3. Configure your web server to:"
        echo "   - Serve index.html for all routes (SPA support)"
        echo "   - Set proper MIME types for .js, .css, .html files"
        echo "   - Enable gzip compression for better performance"
        echo ""
        echo "Files to upload are located in: $(pwd)/dist/"
        ls -la dist/
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment process completed!"
echo ""
echo "📋 Post-deployment checklist:"
echo "- Test mobile login: https://yourdomain.com/login"
echo "- Check mobile ads display correctly"
echo "- Verify mobile debug page: https://yourdomain.com/mobile-debug.html"
echo "- Monitor browser console for errors"
echo "- Check AdSense dashboard for real ad impressions"
echo ""
echo "📊 Monitor these metrics:"
echo "- Mobile user experience"
echo "- Ad viewability rates"
echo "- Page load performance"
echo "- Login success rates"
echo ""
echo "🔧 If issues occur, check PRODUCTION_DEPLOYMENT.md for troubleshooting"
