import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigation } from '../contexts/NavigationContext';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FaMoon, 
  FaSun, 
  FaDesktop, 
  FaBell, 
  FaVolumeUp, 
  FaVolumeOff, 
  FaShieldAlt, 
  FaLanguage, 
  FaDownload,
  FaTrash,
  FaSync,
  FaInfo,
  FaSave,
  FaQuestionCircle,
  FaEnvelope,
  FaFile,
  FaUserShield,
  FaExternalLinkAlt,
  FaBars,
  FaArrowUp,
  FaArrowDown,
  FaGripVertical,
  FaArrowLeft,
  FaTimes
} from 'react-icons/fa';
import nativeNotificationService from '../services/nativeNotificationService.js';
import pushNotificationService from '../services/pushNotificationService.js';

const Settings = () => {
  const { isDark, setTheme } = useTheme();
  const { 
    navigationStyle, 
    setNavigationStyle, 
    NAVIGATION_STYLES, 
    deviceType, 
    isTopNavSuitable, 
    recommendedStyles,
    isStyleAvailable 
  } = useNavigation();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Push notification state
  const [pushSubscription, setPushSubscription] = useState(null);
  const [pushSupported, setPushSupported] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      homework: true,
      announcements: true,
      grades: true,
      events: false,
      email: true,
      push: false
    },
    sound: {
      enabled: true,
      volume: 75
    },
    privacy: {
      shareProgress: true,
      allowAnalytics: false,
      publicProfile: false
    },
    app: {
      language: 'en',
      autoSync: true,
      offlineMode: true,
      autoUpdate: true
    }
  });

  // Check push notification status on component mount
  useEffect(() => {
    const checkPushStatus = async () => {
      try {
        const isSupported = pushNotificationService.isSupported();
        setPushSupported(isSupported);
        
        if (isSupported) {
          const subscription = await pushNotificationService.getSubscription();
          setPushSubscription(subscription);
          
          // Update settings to reflect current subscription status
          setSettings(prev => ({
            ...prev,
            notifications: {
              ...prev.notifications,
              push: !!subscription
            }
          }));
        }
      } catch (error) {
        console.error('Error checking push notification status:', error);
      }
    };

    checkPushStatus();
  }, []);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  // Handle push notification subscription toggle
  const handlePushNotificationToggle = async (enabled) => {
    if (!pushSupported) {
      nativeNotificationService.error('Push notifications are not supported on this device');
      return;
    }

    setPushLoading(true);
    
    try {
      if (enabled) {
        // Subscribe to push notifications
        const subscription = await pushNotificationService.subscribe();
        if (subscription) {
          setPushSubscription(subscription);
          nativeNotificationService.success('Push notifications enabled successfully!');
        } else {
          nativeNotificationService.error('Failed to enable push notifications');
          return;
        }
      } else {
        // Unsubscribe from push notifications
        await pushNotificationService.unsubscribe();
        setPushSubscription(null);
        nativeNotificationService.success('Push notifications disabled successfully!');
      }
      
      // Update settings
      setSettings(prev => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          push: enabled
        }
      }));
    } catch (error) {
      console.error('Error toggling push notifications:', error);
      nativeNotificationService.error('Failed to update push notification settings');
    } finally {
      setPushLoading(false);
    }
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    localStorage.setItem('appSettings', JSON.stringify(settings));
    nativeNotificationService.success('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (nativeNotificationService.confirm('Are you sure you want to reset all settings to default?', 'Reset Settings')) {
      const defaultSettings = {
        notifications: {
          homework: true,
          announcements: true,
          grades: true,
          events: false,
          email: true,
          push: false
        },
        sound: {
          enabled: true,
          volume: 75
        },
        privacy: {
          shareProgress: true,
          allowAnalytics: false,
          publicProfile: false
        },
        app: {
          language: 'en',
          autoSync: true,
          offlineMode: true,
          autoUpdate: true
        }
      };
      setSettings(defaultSettings);
      nativeNotificationService.info('Settings reset to default');
    }
  };

  const clearCache = () => {
    if (nativeNotificationService.confirm('Clear all cached data? This will log you out.', 'Clear Cache')) {
      localStorage.clear();
      sessionStorage.clear();
      nativeNotificationService.success('Cache cleared successfully');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex-1">
        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {label}
        </h4>
        {description && (
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? 'bg-blue-600' : isDark ? 'bg-gray-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} px-2 xs:px-4`}>
      <div className="max-w-3xl mx-auto px-2 xs:px-4 sm:px-6 lg:px-8 py-4">
        {/* Header with Exit Button */}
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Settings</h1>
          
          {/* Exit Button */}
          <button
            onClick={() => navigate(-1)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              isDark 
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600' 
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
            } shadow-sm hover:shadow-md`}
            title="Go back"
          >
            <FaArrowLeft className="text-sm" />
            <span className="font-medium">Back</span>
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {isDark ? <FaMoon className="mr-3 text-blue-400" /> : <FaSun className="mr-3 text-yellow-500" />}
              Appearance
            </h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !isDark 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaSun className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">Light</div>
                  <div className="text-sm opacity-75">Clean and bright</div>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isDark 
                      ? 'border-blue-500 bg-blue-900 text-blue-300' 
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaMoon className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">Dark</div>
                  <div className="text-sm opacity-75">Easy on the eyes</div>
                </button>

                <button
                  onClick={() => {
                    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    setTheme(systemDark ? 'dark' : 'light');
                  }}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isDark 
                      ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500' 
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaDesktop className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">System</div>
                  <div className="text-sm opacity-75">Follow system</div>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Style Settings */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaBars className="mr-3 text-purple-500" />
              Navigation Style
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Choose how you want to navigate through the app
                </p>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  deviceType === 'mobile' 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    : deviceType === 'tablet'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {deviceType} device
                </span>
              </div>

              {/* Device-specific warning for top navigation */}
              {!isTopNavSuitable && (
                <div className={`p-3 rounded-lg border ${
                  isDark 
                    ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300' 
                    : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                }`}>
                  <div className="flex items-center">
                    <FaInfo className="mr-2 text-yellow-500" />
                    <span className="text-sm font-medium">
                      Top navigation is not recommended for {deviceType} devices
                    </span>
                  </div>
                  <p className="text-xs mt-1 opacity-90">
                    For the best experience, use Bottom Navigation or Floating Navigation on mobile devices.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setNavigationStyle(NAVIGATION_STYLES.BOTTOM)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    navigationStyle === NAVIGATION_STYLES.BOTTOM
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' 
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaArrowDown className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">Bottom Navigation</div>
                  <div className="text-sm opacity-75">Tab bar at bottom</div>
                  {recommendedStyles.includes('bottom') && (
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                        Recommended
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setNavigationStyle(NAVIGATION_STYLES.TOP)}
                  disabled={!isStyleAvailable(NAVIGATION_STYLES.TOP)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    !isStyleAvailable(NAVIGATION_STYLES.TOP)
                      ? 'opacity-50 cursor-not-allowed border-gray-300 bg-gray-100 text-gray-400 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500'
                      : navigationStyle === NAVIGATION_STYLES.TOP
                        ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' 
                        : isDark 
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500' 
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaArrowUp className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">Top Navigation</div>
                  <div className="text-sm opacity-75">
                    {isStyleAvailable(NAVIGATION_STYLES.TOP) ? 'Header with tabs' : 'Desktop only'}
                  </div>
                  {recommendedStyles.includes('top') && (
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                        Recommended
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setNavigationStyle(NAVIGATION_STYLES.SIDE)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    navigationStyle === NAVIGATION_STYLES.SIDE
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' 
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaBars className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">Side Navigation</div>
                  <div className="text-sm opacity-75">Hamburger menu</div>
                  {recommendedStyles.includes('side') && (
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                        Recommended
                      </span>
                    </div>
                  )}
                </button>

                <button
                  onClick={() => setNavigationStyle(NAVIGATION_STYLES.FLOATING)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    navigationStyle === NAVIGATION_STYLES.FLOATING
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300' 
                      : isDark 
                        ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500' 
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FaGripVertical className="text-2xl mx-auto mb-2" />
                  <div className="font-medium">Floating Navigation</div>
                  <div className="text-sm opacity-75">Draggable button</div>
                  {recommendedStyles.includes('floating') && (
                    <div className="mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full dark:bg-green-900 dark:text-green-200">
                        Recommended
                      </span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaBell className="mr-3 text-blue-500" />
              Notifications
            </h2>
            
            <div className="space-y-3">
              <ToggleSwitch
                enabled={settings.notifications.homework}
                onChange={(value) => handleSettingChange('notifications', 'homework', value)}
                label="Homework Assignments"
                description="Get notified when new homework is assigned"
              />
              <ToggleSwitch
                enabled={settings.notifications.announcements}
                onChange={(value) => handleSettingChange('notifications', 'announcements', value)}
                label="School Announcements"
                description="Receive important school updates"
              />
              <ToggleSwitch
                enabled={settings.notifications.grades}
                onChange={(value) => handleSettingChange('notifications', 'grades', value)}
                label="Grades & Feedback"
                description="Know when assignments are graded"
              />
              <ToggleSwitch
                enabled={settings.notifications.email}
                onChange={(value) => handleSettingChange('notifications', 'email', value)}
                label="Email Notifications"
                description="Receive notifications via email"
              />
              
              {/* Push Notifications */}
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <label className={`block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Push Notifications
                    </label>
                    <p className={`text-xs mt-1 ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {pushSupported 
                        ? 'Receive notifications even when app is closed' 
                        : 'Not supported on this device'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {pushLoading && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    )}
                    <button
                      onClick={() => handlePushNotificationToggle(!settings.notifications.push)}
                      disabled={!pushSupported || pushLoading}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.push && pushSupported
                          ? 'bg-blue-600' 
                          : 'bg-gray-300 dark:bg-gray-600'
                      } ${(!pushSupported || pushLoading) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {pushSubscription && (
                  <div className={`mt-2 text-xs ${
                    isDark ? 'text-green-400' : 'text-green-600'
                  }`}>
                    ✓ Push notifications active
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sound Settings */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {settings.sound.enabled ? (
                <FaVolumeUp className="mr-3 text-green-500" />
              ) : (
                <FaVolumeOff className="mr-3 text-gray-500" />
              )}
              Sound
            </h2>
            
            <div className="space-y-4">
              <ToggleSwitch
                enabled={settings.sound.enabled}
                onChange={(value) => handleSettingChange('sound', 'enabled', value)}
                label="Enable Sounds"
                description="Play notification sounds and button clicks"
              />
              
              {settings.sound.enabled && (
                <div className={`p-4 rounded-lg border ${
                  isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
                }`}>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Volume: {settings.sound.volume}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sound.volume}
                    onChange={(e) => handleSettingChange('sound', 'volume', parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaShieldAlt className="mr-3 text-purple-500" />
              Privacy & Security
            </h2>
            
            <div className="space-y-3">
              <ToggleSwitch
                enabled={settings.privacy.shareProgress}
                onChange={(value) => handleSettingChange('privacy', 'shareProgress', value)}
                label="Share Progress with Teachers"
                description="Allow teachers to see detailed progress reports"
              />
              <ToggleSwitch
                enabled={settings.privacy.allowAnalytics}
                onChange={(value) => handleSettingChange('privacy', 'allowAnalytics', value)}
                label="Usage Analytics"
                description="Help improve the app by sharing anonymous usage data"
              />
              <ToggleSwitch
                enabled={settings.privacy.publicProfile}
                onChange={(value) => handleSettingChange('privacy', 'publicProfile', value)}
                label="Public Profile"
                description="Make your profile visible to other parents (name only)"
              />
            </div>
          </div>

          {/* App Settings */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaLanguage className="mr-3 text-orange-500" />
              App Preferences
            </h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <label className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Language
                </label>
                <select
                  value={settings.app.language}
                  onChange={(e) => handleSettingChange('app', 'language', e.target.value)}
                  className={`form-select w-full ${
                    isDark ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'
                  }`}
                >
                  <option value="en">English</option>
                  <option value="af">Afrikaans</option>
                  <option value="zu">Zulu</option>
                  <option value="xh">Xhosa</option>
                </select>
              </div>
              
              <ToggleSwitch
                enabled={settings.app.autoSync}
                onChange={(value) => handleSettingChange('app', 'autoSync', value)}
                label="Auto Sync"
                description="Automatically sync data when connected to internet"
              />
              <ToggleSwitch
                enabled={settings.app.offlineMode}
                onChange={(value) => handleSettingChange('app', 'offlineMode', value)}
                label="Offline Mode"
                description="Cache data for offline access"
              />
              <ToggleSwitch
                enabled={settings.app.autoUpdate}
                onChange={(value) => handleSettingChange('app', 'autoUpdate', value)}
                label="Auto Updates"
                description="Automatically update the app when new versions are available"
              />
            </div>
          </div>

          {/* Storage & Cache */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaDownload className="mr-3 text-indigo-500" />
              Storage & Data
            </h2>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border ${
                isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Cache Size
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    ~2.4 MB
                  </span>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={clearCache}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <FaTrash className="mr-2" />
                    Clear Cache
                  </button>
                  <button
                    onClick={() => nativeNotificationService.info('Sync feature coming soon!')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                  >
                    <FaSync className="mr-2" />
                    Sync Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={saveSettings}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center flex-1"
            >
              <FaSave className="mr-2" />
              Save Settings
            </button>
            <button
              onClick={resetSettings}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center flex-1"
            >
              <FaSync className="mr-2" />
              Reset to Default
            </button>
          </div>

          {/* Help & Support */}
          <div className={`p-6 rounded-lg shadow-sm border mb-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaQuestionCircle className="mr-3 text-blue-500" />
              Help & Support
            </h2>
            
            <div className="space-y-3">
              <Link
                to="/contact"
                className={`flex items-center justify-between p-4 rounded-lg border hover:bg-blue-50 transition-colors ${
                  isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <FaEnvelope className="text-blue-500" />
                  <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Contact Support</span>
                </div>
                <FaExternalLinkAlt className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </Link>
              
              <Link
                to="/privacy-policy"
                className={`flex items-center justify-between p-4 rounded-lg border hover:bg-blue-50 transition-colors ${
                  isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <FaUserShield className="text-blue-500" />
                  <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Privacy Policy</span>
                </div>
                <FaExternalLinkAlt className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </Link>

              <Link
                to="/terms-of-service"
                className={`flex items-center justify-between p-4 rounded-lg border hover:bg-blue-50 transition-colors ${
                  isDark ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <FaFile className="text-blue-500" />
                  <span className={`ml-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Terms of Service</span>
                </div>
                <FaExternalLinkAlt className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              </Link>
            </div>
          </div>

          {/* App Info */}
          <div className={`p-6 rounded-lg shadow-sm border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          }`}>
            <h2 className={`text-xl font-semibold mb-4 flex items-center ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              <FaInfo className="mr-3 text-blue-500" />
              About
            </h2>
            
            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex justify-between">
                <span>Version:</span>
                <span className="font-medium">2.0.0</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="font-medium">July 2, 2025</span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="font-medium">{user?.id || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span>Account Type:</span>
                <span className="font-medium capitalize">{user?.role || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Bottom Exit Button */}
          <div className="flex justify-center py-6">
            <button
              onClick={() => navigate(-1)}
              className={`flex items-center space-x-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                isDark 
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-600' 
                  : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-300'
              } shadow-sm hover:shadow-md`}
              title="Exit settings"
            >
              <FaTimes className="text-sm" />
              <span className="font-medium">Exit Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
