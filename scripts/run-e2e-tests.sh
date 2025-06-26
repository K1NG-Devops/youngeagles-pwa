#!/bin/bash

# End-to-End Test Runner Script
# This script sets up and runs the complete E2E test suite

set -e

echo "🚀 Starting End-to-End Test Suite for Young Eagles PWA"
echo "=================================================="

# Check if required commands exist
command -v npm >/dev/null 2>&1 || { echo "❌ npm is required but not installed. Aborting." >&2; exit 1; }

# Set environment variables
export NODE_ENV=test
export CYPRESS_baseUrl=http://localhost:3002
export PLAYWRIGHT_baseURL=http://localhost:3002

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up test environment..."

# Check if servers are running
echo "🌐 Checking if servers are running..."

# Check frontend server
if curl -s http://localhost:3002 >/dev/null; then
    echo "✅ Frontend server is running on port 3002"
else
    echo "❌ Frontend server is not running on port 3002"
    echo "💡 Please start the frontend server with: npm run dev"
    exit 1
fi

# Check backend server
if curl -s http://localhost:3001 >/dev/null; then
    echo "✅ Backend server is running on port 3001"
else
    echo "⚠️  Backend server is not running on port 3001"
    echo "💡 Some tests may fail without the backend API"
fi

echo ""
echo "🎯 Running Test Suite..."
echo "========================"

# Function to run Cypress tests
run_cypress_tests() {
    echo "🔍 Running Cypress E2E Tests..."
    if npm run test:e2e; then
        echo "✅ Cypress tests passed!"
        return 0
    else
        echo "❌ Cypress tests failed!"
        return 1
    fi
}

# Function to run Playwright tests
run_playwright_tests() {
    echo "🎭 Installing Playwright browsers..."
    npx playwright install

    echo "🎭 Running Playwright E2E Tests..."
    if npm run test:playwright; then
        echo "✅ Playwright tests passed!"
        return 0
    else
        echo "❌ Playwright tests failed!"
        return 1
    fi
}

# Parse command line arguments
CYPRESS_ONLY=false
PLAYWRIGHT_ONLY=false
INTERACTIVE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --cypress-only)
            CYPRESS_ONLY=true
            shift
            ;;
        --playwright-only)
            PLAYWRIGHT_ONLY=true
            shift
            ;;
        --interactive)
            INTERACTIVE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --cypress-only     Run only Cypress tests"
            echo "  --playwright-only  Run only Playwright tests"
            echo "  --interactive      Run in interactive mode"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Run tests based on arguments
CYPRESS_RESULT=0
PLAYWRIGHT_RESULT=0

if [ "$INTERACTIVE" = true ]; then
    echo "🎮 Running in interactive mode..."
    echo "Choose test framework:"
    echo "1) Cypress (Interactive)"
    echo "2) Playwright (UI Mode)"
    echo "3) Both"
    read -p "Enter choice (1-3): " choice

    case $choice in
        1)
            npm run test:e2e:open
            ;;
        2)
            npm run test:playwright:ui
            ;;
        3)
            npm run test:e2e:open &
            npm run test:playwright:ui
            ;;
        *)
            echo "Invalid choice"
            exit 1
            ;;
    esac
elif [ "$CYPRESS_ONLY" = true ]; then
    run_cypress_tests
    CYPRESS_RESULT=$?
elif [ "$PLAYWRIGHT_ONLY" = true ]; then
    run_playwright_tests
    PLAYWRIGHT_RESULT=$?
else
    # Run both test suites
    echo "🔄 Running complete test suite..."
    
    run_cypress_tests
    CYPRESS_RESULT=$?
    
    echo ""
    
    run_playwright_tests
    PLAYWRIGHT_RESULT=$?
fi

echo ""
echo "📊 Test Results Summary"
echo "======================"

if [ "$CYPRESS_ONLY" != true ] && [ "$PLAYWRIGHT_ONLY" != true ]; then
    if [ $CYPRESS_RESULT -eq 0 ]; then
        echo "✅ Cypress Tests: PASSED"
    else
        echo "❌ Cypress Tests: FAILED"
    fi

    if [ $PLAYWRIGHT_RESULT -eq 0 ]; then
        echo "✅ Playwright Tests: PASSED"
    else
        echo "❌ Playwright Tests: FAILED"
    fi

    TOTAL_RESULT=$((CYPRESS_RESULT + PLAYWRIGHT_RESULT))
else
    if [ "$CYPRESS_ONLY" = true ]; then
        TOTAL_RESULT=$CYPRESS_RESULT
    else
        TOTAL_RESULT=$PLAYWRIGHT_RESULT
    fi
fi

echo ""
if [ $TOTAL_RESULT -eq 0 ]; then
    echo "🎉 All tests passed! The homework workflow is working correctly."
    echo ""
    echo "📋 Test Coverage:"
    echo "  ✅ Teacher assignment creation"
    echo "  ✅ Database insertion verification"
    echo "  ✅ Parent dashboard real-time updates"
    echo "  ✅ Student homework submission"
    echo "  ✅ Progress tracking and counters"
    echo "  ✅ Teacher submission verification"
else
    echo "💥 Some tests failed. Please check the output above for details."
    echo ""
    echo "🔍 Debugging tips:"
    echo "  • Check server logs for API errors"
    echo "  • Verify test data exists in database"
    echo "  • Ensure WebSocket connections are working"
    echo "  • Review screenshots/videos in test artifacts"
fi

echo ""
echo "📁 Test Artifacts:"
if [ -d "cypress/screenshots" ]; then
    echo "  📸 Cypress Screenshots: cypress/screenshots/"
fi
if [ -d "cypress/videos" ]; then
    echo "  🎥 Cypress Videos: cypress/videos/"
fi
if [ -d "playwright-report" ]; then
    echo "  📊 Playwright Report: playwright-report/"
fi

echo ""
echo "🔗 Quick Commands:"
echo "  View Playwright report: npm run test:playwright:report"
echo "  Open Cypress: npm run test:e2e:open"
echo "  Debug Playwright: npx playwright test --debug"

exit $TOTAL_RESULT
