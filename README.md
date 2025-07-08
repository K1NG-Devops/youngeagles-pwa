# Young Eagles PWA - Minimal Version

A minimal Progressive Web Application for the Young Eagles preschool management system.

## Features

- ✅ React 18 with modern hooks
- ✅ React Router for navigation
- ✅ Authentication system (Parent, Teacher, Admin)
- ✅ Responsive mobile-first design
- ✅ Progressive Web App capabilities
- ✅ API integration with the Young Eagles API
- ✅ Toast notifications
- ✅ Protected routes
- ✅ Children and Classes management
- ✅ Bottom navigation for mobile
- ✅ Google AdSense integration
- ✅ Ad management system

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment setup:**
   Create a `.env` file in the root directory:
   ```
   VITE_API_URL=http://localhost:3001
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ads/            # Ad management components
│   │   ├── index.js    # Ad components export
│   │   ├── GoogleAdSense.jsx  # Core AdSense component
│   │   ├── BannerAd.jsx       # Banner ad component
│   │   └── SidebarAd.jsx      # Sidebar ad component
│   ├── Header.jsx      # App header with user info
│   ├── Layout.jsx      # Main layout wrapper
│   ├── Navigation.jsx  # Bottom navigation
│   └── PrivateRoute.jsx # Protected route wrapper
├── contexts/           # React Context providers
│   └── AuthContext.jsx # Authentication state management
├── hooks/              # Custom React hooks
│   └── useAdSense.js   # AdSense management hook
├── config/             # Configuration files
│   ├── adsense-config.js  # AdSense configuration
│   └── admob-config.js    # AdMob configuration
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login form
│   ├── Dashboard.jsx   # User dashboard
│   ├── Children.jsx    # Children management
│   └── Classes.jsx     # Classes view
├── services/           # API and external services
│   └── apiService.js   # HTTP client for API calls
├── App.jsx             # Main app component
├── main.jsx            # React entry point
└── index.css           # Global styles
```

## API Integration

The PWA connects to the Young Eagles API with the following endpoints:

### Authentication
- `POST /api/auth/parent-login`
- `POST /api/auth/teacher-login`
- `POST /api/auth/admin-login`

### Children
- `GET /api/children` (admin/teacher)
- `GET /api/children/parent/:parentId` (parent)
- `GET /api/children/:childId`

### Classes
- `GET /api/classes`
- `GET /api/classes/:classId`
- `GET /api/classes/:classId/children`

## User Roles

### Parent
- View their own children
- Access basic class information
- Dashboard with children count

### Teacher
- View all children
- Access all classes and their enrolled students
- Class management features

### Admin
- Full access to all features
- User and system management capabilities

## PWA Features

- **Installable**: Can be installed on mobile devices and desktop
- **Offline capable**: Basic caching for essential resources
- **Responsive**: Mobile-first design with bottom navigation
- **App-like**: Standalone display mode

## Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | http://localhost:3001 |

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with PWA support

## Authentication Flow

1. User selects role (Parent/Teacher/Admin)
2. Enters credentials and submits login form
3. API validates credentials and returns JWT token
4. Token stored in localStorage for session persistence
5. User redirected to dashboard
6. Protected routes check authentication status

## Mobile Experience

- Bottom navigation for easy thumb navigation
- Touch-friendly button sizes
- Responsive grid layouts
- Native app-like feel when installed

## Demo Credentials

**Admin:**
- Email: admin@youngeagles.org.za
- Password: #Admin@2012

## Security Features

- JWT token-based authentication
- Automatic token refresh on API calls
- Protected routes for authenticated content
- Role-based access control
- Secure token storage

## Ads Module

The PWA includes a comprehensive ads management system with Google AdSense integration:

### Features
- Google AdSense integration
- Multiple ad formats (banner, sidebar, display)
- Test mode for development
- Responsive ad components
- Custom hook for ad management
- Error handling and fallbacks

### Quick Usage
```javascript
import { BannerAd, SidebarAd, useAdSense } from './components/ads';

// Simple banner ad
<BannerAd />

// Using the hook
const { isAdSenseLoaded, shouldDisplayAds } = useAdSense();
```

### Configuration
1. Update `src/config/adsense-config.js` with your AdSense publisher ID
2. Add ad slots from your AdSense dashboard
3. Set `TEST_MODE: false` for production

### Documentation
For detailed documentation, see [`docs/ADS_MODULE.md`](docs/ADS_MODULE.md)

## Contributing

This is a minimal version focused on core functionality. Future enhancements can include:

- Push notifications
- Offline data synchronization
- Real-time messaging
- Advanced reporting
- File uploads
- Calendar integration
- Ad performance analytics
- A/B testing for ad placements

## License

MIT 