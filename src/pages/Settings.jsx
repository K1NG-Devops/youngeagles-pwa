import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
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
  FaSave
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Settings = () => {
  const { isDark, setTheme } = useTheme();
  const { user } = useAuth();
  
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

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const saveSettings = () => {
    // In a real app, this would save to the backend
    localStorage.setItem('appSettings', JSON.stringify(settings));
    toast.success('Settings saved successfully!');
  };

  const resetSettings = () => {
    if (window.confirm('Are you sure you want to reset all settings to default?')) {
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
      toast.info('Settings reset to default');
    }
  };

  const clearCache = () => {
    if (window.confirm('Clear all cached data? This will log you out.')) {
      localStorage.clear();
      sessionStorage.clear();
      toast.success('Cache cleared successfully');
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
    <div className={`min-h-screen transition-colors pb-32 ${
      isDark ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Settings
          </h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Customize your Young Eagles experience
          </p>
        </div>

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
                  onClick={() => toast.info('Sync feature coming soon!')}
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
      </div>
    </div>
  );
};

export default Settings;
