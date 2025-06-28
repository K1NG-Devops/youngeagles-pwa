#!/bin/bash

echo "🚀 Starting Young Eagles PWA Development Server"
echo "================================================"
echo ""
echo "📋 Configuration:"
echo "  • Frontend: http://localhost:3002"
echo "  • Backend API: http://localhost:3001"
echo "  • Socket.IO proxy enabled"
echo "  • Web Push notifications enabled"
echo ""
echo "🔧 Environment Variables:"
echo "  • VITE_FORCE_LOCAL_API=true"
echo "  • VITE_DEBUG_MODE=true"
echo "  • VITE_ENABLE_PUSH_NOTIFICATIONS=true"
echo ""
echo "🎯 Testing URLs:"
echo "  • PWA: http://localhost:3002"
echo "  • Notification Debugger: http://localhost:3002/debug/notifications"
echo "  • Messages: http://localhost:3002/messages"
echo ""
echo "📍 Make sure your backend is running on port 3001!"
echo ""

# Check if backend is running
if curl -s http://localhost:3001/api/health >/dev/null 2>&1; then
    echo "✅ Backend API is running on port 3001"
else
    echo "⚠️  Backend API not detected on port 3001"
    echo "   Make sure to start your Node.js backend server first!"
    echo ""
fi

echo "Starting Vite development server..."
echo ""

npm run dev
