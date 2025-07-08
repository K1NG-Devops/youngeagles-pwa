# Young Eagles PWA - Ads Module Documentation

## Overview

The ads module provides a comprehensive solution for integrating Google AdSense advertisements into the Young Eagles PWA. It includes components for different ad formats, custom hooks for ad management, and configuration utilities.

## Module Structure

```
src/
├── components/
│   └── ads/
│       ├── index.js           # Main export file
│       ├── GoogleAdSense.jsx  # Core AdSense component
│       ├── BannerAd.jsx       # Banner ad component
│       └── SidebarAd.jsx      # Sidebar ad component
├── hooks/
│   └── useAdSense.js          # Custom hook for ad management
└── config/
    ├── adsense-config.js      # AdSense configuration
    └── admob-config.js        # AdMob configuration (mobile)
```

## Quick Start

### 1. Import the Components

```javascript
import { GoogleAdSense, BannerAd, SidebarAd } from '../components/ads';
```

### 2. Basic Usage

```javascript
// Simple banner ad
<BannerAd />

// Custom ad with specific slot
<GoogleAdSense 
  slot="1234567890" 
  size={[728, 90]} 
  format="auto" 
/>

// Sidebar ad
<SidebarAd />
```

### 3. Using the Hook

```javascript
import { useAdSense } from '../hooks/useAdSense';

const MyComponent = () => {
  const { 
    isAdSenseLoaded, 
    adSenseError, 
    shouldDisplayAds,
    pushAd 
  } = useAdSense();

  if (!shouldDisplayAds()) {
    return null;
  }

  return (
    <div>
      {isAdSenseLoaded && <BannerAd />}
      {adSenseError && <p>Ads unavailable</p>}
    </div>
  );
};
```

## Components

### GoogleAdSense

The core component for displaying Google AdSense ads.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `slot` | string | `ADSENSE_CONFIG.AD_SLOTS.DISPLAY_AD` | AdSense ad slot ID |
| `size` | Array | `[300, 250]` | Ad dimensions [width, height] |
| `format` | string | `'auto'` | Ad format type |
| `className` | string | `''` | Additional CSS classes |

#### Example

```javascript
<GoogleAdSense 
  slot="1234567890"
  size={[728, 90]}
  format="auto"
  className="my-ad-container"
/>
```

### BannerAd

Pre-configured banner ad component optimized for header/footer placement.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `''` | Additional CSS classes |
| `responsive` | boolean | `true` | Enable responsive behavior |

#### Example

```javascript
<BannerAd className="header-ad" />
```

### SidebarAd

Pre-configured sidebar ad component optimized for side placement.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | string | `''` | Additional CSS classes |
| `position` | string | `'right'` | Sidebar position ('left' or 'right') |

#### Example

```javascript
<SidebarAd position="left" />
```

## Configuration

### AdSense Configuration

Edit `src/config/adsense-config.js`:

```javascript
export const ADSENSE_CONFIG = {
  PUBLISHER_ID: 'ca-pub-XXXXXXXXXXXXXXXX', // Your AdSense publisher ID
  
  AD_SLOTS: {
    DISPLAY_AD: '1234567890',
    BANNER_AD: '0987654321',
    SIDEBAR_AD: '1122334455',
  },
  
  AD_SIZES: {
    BANNER: [728, 90],
    LEADERBOARD: [728, 90],
    RECTANGLE: [300, 250],
    SIDEBAR: [160, 600],
    MOBILE_BANNER: [320, 50],
  },
  
  TEST_MODE: true, // Set to false in production
};
```

### Environment Variables

Add to your `.env` file:

```
VITE_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_TEST_MODE=true
```

## Custom Hook - useAdSense

The `useAdSense` hook provides utilities for managing AdSense integration.

### Returns

| Property | Type | Description |
|----------|------|-------------|
| `isAdSenseLoaded` | boolean | Whether AdSense script has loaded |
| `adSenseError` | string\|null | Error message if loading failed |
| `pushAd` | function | Function to push ad to AdSense |
| `isTestMode` | function | Check if in test mode |
| `getPublisherId` | function | Get publisher ID |
| `shouldDisplayAds` | function | Check if ads should be displayed |

### Usage Example

```javascript
import { useAdSense } from '../hooks/useAdSense';

const AdContainer = () => {
  const { 
    isAdSenseLoaded, 
    adSenseError, 
    shouldDisplayAds,
    isTestMode
  } = useAdSense();

  if (!shouldDisplayAds()) {
    return <div>Ad blocker detected or ads disabled</div>;
  }

  if (adSenseError) {
    return <div>Unable to load ads: {adSenseError}</div>;
  }

  return (
    <div>
      {isTestMode() && <p>Test mode active</p>}
      {isAdSenseLoaded && <GoogleAdSense />}
    </div>
  );
};
```

## Installation & Setup

### 1. Google AdSense Setup

1. Sign up for Google AdSense at [https://adsense.google.com/](https://adsense.google.com/)
2. Add your website and get approval
3. Create ad units and get your publisher ID and slot IDs
4. Update `src/config/adsense-config.js` with your actual IDs

### 2. HTML Head Setup

Add to your `index.html`:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossorigin="anonymous"></script>
```

### 3. Production Configuration

Before deploying to production:

1. Set `TEST_MODE: false` in `adsense-config.js`
2. Replace all placeholder IDs with actual AdSense IDs
3. Test ads in a staging environment first

## Testing

### Test Mode

When `TEST_MODE` is `true`, the components will render placeholder ads instead of real AdSense ads. This is useful for development and testing.

### Example Test Component

```javascript
const TestAds = () => {
  return (
    <div>
      <h2>Ad Testing</h2>
      <BannerAd />
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <GoogleAdSense size={[300, 250]} />
        </div>
        <div>
          <SidebarAd />
        </div>
      </div>
    </div>
  );
};
```

## Troubleshooting

### Common Issues

#### 1. Module Loading Error

**Error:** `Loading failed for the module with source "http://localhost:3002/src/components/ads/index.js"`

**Solution:** This was a file extension issue. The `index.js` file was importing `.js` files, but the actual files had `.jsx` extensions. This has been fixed.

#### 2. AdSense Not Loading

**Symptoms:** Ads not appearing, blank spaces

**Solutions:**
- Check that AdSense script is loaded in `index.html`
- Verify publisher ID is correct
- Ensure ad slots are properly configured
- Check browser console for errors

#### 3. Ad Blocker Detection

**Symptoms:** Ads not showing for some users

**Solution:** The `shouldDisplayAds()` function in `useAdSense` can be extended to detect ad blockers:

```javascript
const shouldDisplayAds = () => {
  // Check if AdSense failed to load (possible ad blocker)
  if (adSenseError) return false;
  
  // Additional ad blocker detection logic
  if (!window.adsbygoogle || window.adsbygoogle.length === 0) {
    return false;
  }
  
  return true;
};
```

#### 4. Responsive Issues

**Symptoms:** Ads not responsive on mobile

**Solution:** Use responsive ad sizes and formats:

```javascript
<GoogleAdSense 
  size={[320, 50]} // Mobile banner size
  format="auto"
  responsive={true}
/>
```

### Debug Mode

Enable debug logging by adding this to your component:

```javascript
useEffect(() => {
  if (ADSENSE_CONFIG.TEST_MODE) {
    console.log('AdSense Debug Info:', {
      isLoaded: !!window.adsbygoogle,
      publisherId: ADSENSE_CONFIG.PUBLISHER_ID,
      testMode: ADSENSE_CONFIG.TEST_MODE
    });
  }
}, []);
```

## Best Practices

### 1. Performance

- Load AdSense script asynchronously
- Use lazy loading for ads below the fold
- Implement proper error handling

### 2. User Experience

- Always provide fallback content
- Ensure ads don't block content
- Use appropriate ad sizes for different screen sizes

### 3. Compliance

- Follow AdSense policies
- Implement proper privacy notices
- Respect user preferences (GDPR, etc.)

### 4. Testing

- Always test in staging environment
- Use test mode during development
- Monitor performance impact

## Mobile Optimization

For mobile devices, consider using AdMob configuration:

```javascript
// src/config/admob-config.js
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX',
  AD_UNITS: {
    BANNER: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
    INTERSTITIAL: 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX',
  },
  TEST_MODE: true,
};
```

## API Reference

### Configuration Objects

#### ADSENSE_CONFIG

```javascript
{
  PUBLISHER_ID: string,
  AD_SLOTS: {
    DISPLAY_AD: string,
    BANNER_AD: string,
    SIDEBAR_AD: string,
  },
  AD_SIZES: {
    BANNER: [number, number],
    LEADERBOARD: [number, number],
    RECTANGLE: [number, number],
    SIDEBAR: [number, number],
    MOBILE_BANNER: [number, number],
  },
  TEST_MODE: boolean,
}
```

### Hook Returns

#### useAdSense()

```javascript
{
  isAdSenseLoaded: boolean,
  adSenseError: string | null,
  pushAd: (element: HTMLElement) => void,
  isTestMode: () => boolean,
  getPublisherId: () => string,
  shouldDisplayAds: () => boolean,
}
```

## Future Enhancements

- Ad performance analytics
- A/B testing for ad placements
- Dynamic ad loading based on user behavior
- Integration with Google Analytics
- GDPR compliance utilities
- Ad refresh mechanisms

## Support

For issues related to:
- **AdSense setup**: [Google AdSense Help](https://support.google.com/adsense)
- **Technical issues**: Check browser console and review this documentation
- **Performance**: Monitor Core Web Vitals and optimize accordingly

---

*Last updated: January 2025*
