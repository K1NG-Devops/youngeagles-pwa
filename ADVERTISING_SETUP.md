# Advertising Setup Guide

This guide covers setting up both Google AdSense (for the React PWA) and AdMob (for future React Native implementation).

## 🌐 Google AdSense Setup (Current PWA)

### Step 1: Sign Up for Google AdSense
1. Visit [Google AdSense](https://adsense.google.com/)
2. Sign up with your Google account
3. Add your website URL: `your-domain.com`
4. Wait for approval (can take 1-3 days)

### Step 2: Get Your Publisher ID
1. Once approved, go to your AdSense dashboard
2. Navigate to "Account" → "Account information"
3. Copy your Publisher ID (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 3: Create Ad Units
1. Go to "Ads" → "By ad unit" → "Create new ad unit"
2. Create the following ad units:
   - **Display Ad**: 300x250 rectangle
   - **Banner Ad**: 728x90 leaderboard (320x50 for mobile)
   - **Sidebar Ad**: 160x600 skyscraper
3. Save the Ad Unit IDs for each

### Step 4: Update Configuration
Edit `src/config/adsense-config.js`:
```javascript
export const ADSENSE_CONFIG = {
  PUBLISHER_ID: 'ca-pub-YOUR-ACTUAL-ID', // Replace with your ID
  AD_SLOTS: {
    DISPLAY_AD: 'YOUR-DISPLAY-SLOT-ID',    // Replace with actual slot ID
    BANNER_AD: 'YOUR-BANNER-SLOT-ID',      // Replace with actual slot ID
    SIDEBAR_AD: 'YOUR-SIDEBAR-SLOT-ID',    // Replace with actual slot ID
  },
  TEST_MODE: false, // Set to false for production
};
```

### Step 5: Update HTML Script
Edit `index.html` line 16:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR-ACTUAL-ID" crossorigin="anonymous"></script>
```

## 📱 AdMob Setup (Future React Native)

### Current AdMob Configuration
Your AdMob setup is already saved in `src/config/admob-config.js`:

```javascript
export const ADMOB_CONFIG = {
  APP_ID: 'ca-app-pub-2808416461095370~5549139256',
  AD_UNITS: {
    APP_OPEN: 'ca-app-pub-2808416461095370/5230123792',
  },
};
```

### When Converting to React Native

1. **Install AdMob Package**:
   ```bash
   npm install react-native-google-mobile-ads
   cd ios && pod install # For iOS
   ```

2. **Update App Configuration**:
   
   **Android** (`android/app/src/main/AndroidManifest.xml`):
   ```xml
   <meta-data
     android:name="com.google.android.gms.ads.APPLICATION_ID"
     android:value="ca-app-pub-2808416461095370~5549139256"/>
   ```

   **iOS** (`ios/YourApp/Info.plist`):
   ```xml
   <key>GADApplicationIdentifier</key>
   <string>ca-app-pub-2808416461095370~5549139256</string>
   ```

3. **Initialize AdMob** (in App.js):
   ```javascript
   import mobileAds from 'react-native-google-mobile-ads';
   
   function App() {
     useEffect(() => {
       mobileAds().initialize();
     }, []);
   }
   ```

## 🚀 Using Ads in Your Components

### Quick Start
```javascript
import { BannerAd, SidebarAd, useAdSense } from './components/ads';

function MyPage() {
  const { shouldDisplayAds } = useAdSense();

  return (
    <div>
      {shouldDisplayAds() && <BannerAd />}
      {/* Your content */}
      {shouldDisplayAds() && <SidebarAd />}
    </div>
  );
}
```

### Custom Ad Placement
```javascript
import { GoogleAdSense } from './components/ads';

<GoogleAdSense
  slot="your-custom-slot-id"
  size={[300, 250]}
  format="rectangle"
  className="my-4 mx-auto"
/>
```

## 🔧 Development vs Production

### Test Mode (Development)
- `ADSENSE_CONFIG.TEST_MODE = true`
- Shows placeholder ads with debug info
- No real ads are loaded

### Production Mode
- `ADSENSE_CONFIG.TEST_MODE = false`
- Real ads are displayed
- Revenue generation begins

## 📊 Best Practices

### Ad Placement
1. **Above the fold**: Place one ad visible without scrolling
2. **Content breaks**: Insert ads naturally between content sections
3. **Sidebar**: Use for desktop layouts with available space
4. **Bottom**: Footer ads for additional revenue

### Performance
1. **Lazy loading**: Ads load only when visible
2. **Error handling**: Graceful fallbacks if ads fail to load
3. **Responsive**: Different ad sizes for mobile/desktop

### User Experience
1. **Non-intrusive**: Don't overwhelm users with ads
2. **Relevant content**: Ensure ads match your audience
3. **Loading states**: Show placeholders while ads load

## 🛠️ Troubleshooting

### Common Issues

1. **Ads not showing**:
   - Check if AdSense script is loaded
   - Verify publisher ID and slot IDs
   - Ensure domain is approved in AdSense

2. **Test mode stuck**:
   - Set `TEST_MODE: false` in adsense-config.js
   - Clear browser cache
   - Check console for errors

3. **Mobile responsiveness**:
   - Use responsive ad units
   - Test on different screen sizes
   - Verify CSS styling

### Console Commands for Debugging
```javascript
// Check if AdSense is loaded
console.log(window.adsbygoogle);

// Check ad configuration
import { ADSENSE_CONFIG } from './src/config/adsense-config';
console.log(ADSENSE_CONFIG);
```

## 📈 Revenue Optimization

### Monitoring
1. **AdSense Dashboard**: Track revenue, impressions, CTR
2. **Google Analytics**: Monitor user engagement
3. **A/B Testing**: Test different ad placements

### Optimization
1. **High-traffic pages**: Prioritize ad placement on popular pages
2. **Content quality**: Higher quality content = better ad rates
3. **User engagement**: Engaged users = higher ad revenue

## 🔄 Migration Path: PWA to React Native

When you're ready to convert to React Native:

1. **Keep PWA version** with AdSense
2. **Create React Native app** with AdMob
3. **Share backend API** between both versions
4. **Cross-platform strategy** for maximum reach

Your AdMob configuration is already prepared for this migration!
