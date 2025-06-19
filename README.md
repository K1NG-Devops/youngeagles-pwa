# Young Eagles PWA

A Progressive Web App (PWA) for the Young Eagles School Management System, providing offline capabilities and a native app-like experience.

## Features

- 🚀 **Progressive Web App**: Installable on mobile and desktop devices
- 📱 **Offline Support**: Works without internet connection using cached data
- 🔔 **Push Notifications**: Real-time notifications for important updates
- ⚡ **Fast Loading**: Service worker caching for instant load times
- 📊 **Dashboard**: Overview of school statistics and quick actions
- 🔔 **Notifications**: Manage and view all school notifications
- 📚 **Homework**: Track homework assignments and submissions
- 🎨 **Modern UI**: Built with Tailwind CSS and Lucide React icons

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Vite Plugin PWA** - PWA functionality
- **React Router** - Client-side routing
- **React Toastify** - Toast notifications
- **Lucide React** - Icons
- **Workbox** - Service worker management

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The PWA will be available at `http://localhost:3002`

### Available Scripts

- `npm run dev` - Start development server on port 3002
- `npm run build` - Build for production
- `npm run build:prod` - Build for production with optimizations
- `npm run preview` - Preview production build on port 3003
- `npm run serve` - Build and serve production version
- `npm run pwa:build` - Build PWA with production optimizations
- `npm run lint` - Run ESLint

## PWA Features

### Installation

The app can be installed on:
- **Mobile devices** (Android/iOS) - Add to Home Screen
- **Desktop** (Chrome, Edge, Firefox) - Install App button
- **Standalone mode** - Runs like a native app

### Offline Capabilities

- **Cached Assets**: All static files are cached for offline access
- **API Caching**: API responses are cached with Network First strategy
- **Background Sync**: Changes sync when connection is restored
- **Offline Indicator**: Visual indicator when offline

### Push Notifications

- **Browser Notifications**: Native browser notification support
- **Permission Management**: Request and manage notification permissions
- **Test Notifications**: Development testing functionality

## Project Structure

```
pwa/
├── public/
│   ├── icon-*.png          # PWA icons
│   ├── manifest.json       # Original manifest (if needed)
│   └── firebase-messaging-sw.js
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Header.jsx      # Navigation header
│   │   ├── Homework.jsx    # Homework management
│   │   ├── Notifications.jsx # Notification center
│   │   └── OfflineIndicator.jsx # Offline status
│   ├── App.jsx            # Main app component
│   ├── index.css          # Global styles
│   └── main.jsx           # App entry point
├── .env                   # Environment variables
├── index.html            # HTML template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind configuration
└── vite.config.js        # Vite and PWA configuration
```

## Integration with Main App

This PWA is designed to work alongside the main Young Eagles application:

- **API Integration**: Connects to the same backend API (port 3001)
- **Shared Assets**: Uses the same icons and branding
- **Data Sync**: Syncs data with the main application
- **Authentication**: Can share authentication state

## Browser Support

- **Chrome** 67+ (full PWA support)
- **Firefox** 79+ (most PWA features)
- **Safari** 14+ (basic PWA support)
- **Edge** 79+ (full PWA support)
