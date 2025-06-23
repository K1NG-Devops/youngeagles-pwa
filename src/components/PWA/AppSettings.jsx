import React, { useState, useEffect } from 'react';
import { FaCog, FaMoon, FaSun, FaBell, FaGlobe, FaUser, FaShieldAlt, FaDatabase, FaInfoCircle, FaUndo, FaArrowLeft, FaCheck } from 'react-icons/fa';
import { showTopNotification } from '../TopNotificationManager';

const AppSettings = ({ isDark, onThemeChange, onClose }) => {
  const [settings, setSettings] = useState({
    // Theme Settings
    darkMode: isDark || false,
    
    // Notification Settings
    enableNotifications: true,
    homeworkReminders: true,
    submissionNotifications: true,
    weeklyReports: true,
    
    // Display Settings
    language: 'en',
    timeFormat: '12h',
    dateFormat: 'MM/DD/YYYY',
    
    // Privacy Settings
    shareProgress: true,
    allowAnalytics: true,
    
    // Performance Settings
    autoSave: true,
    cacheData: true,
    
    // User Preferences
    defaultHomeworkView: 'grid',
    showWelcomeMessages: true
  });



  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Update setting with autosave
  const updateSetting = async (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    setSettings(newSettings);

    // Immediately apply theme changes
    if (key === 'darkMode') {
      onThemeChange(value);
    }

    // Autosave to localStorage
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings));
      
      // Show subtle feedback for important changes
      if (key === 'darkMode') {
        showTopNotification(`${value ? 'Dark' : 'Light'} theme applied`, 'success');
      } else if (key === 'language') {
        showTopNotification('Language setting saved', 'success');
      }
      // For other settings, just save silently for better UX
      
    } catch (error) {
      console.error('Error saving setting:', error);
      showTopNotification('Failed to save setting', 'error');
    }
  };

  // Reset to defaults with autosave
  const resetToDefaults = async () => {
    const defaultSettings = {
      darkMode: false,
      enableNotifications: true,
      homeworkReminders: true,
      submissionNotifications: true,
      weeklyReports: true,
      language: 'en',
      timeFormat: '12h',
      dateFormat: 'MM/DD/YYYY',
      shareProgress: true,
      allowAnalytics: true,
      autoSave: true,
      cacheData: true,
      defaultHomeworkView: 'grid',
      showWelcomeMessages: true
    };
    
    setSettings(defaultSettings);
    
    // Apply theme immediately  
    onThemeChange(defaultSettings.darkMode);
    
    // Autosave defaults
    try {
      localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
      showTopNotification('Settings reset to defaults', 'success');
    } catch (error) {
      console.error('Error saving default settings:', error);
      showTopNotification('Failed to reset settings', 'error');
    }
  };



  const SettingSection = ({ title, icon: Icon, children }) => (
    <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4 mb-4`}>
      <div className="flex items-center mb-3">
        <Icon className={`mr-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const ToggleSetting = ({ label, description, value, onChange, disabled = false }) => (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
          {label}
        </label>
        {description && (
          <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
            {description}
          </p>
        )}
      </div>
      <button
        onClick={async () => !disabled && await onChange(!value)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${
          value 
            ? 'bg-blue-600' 
            : isDark ? 'bg-gray-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectSetting = ({ label, value, options, onChange }) => (
    <div className="flex items-center justify-between">
      <label className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={async (e) => await onChange(e.target.value)}
        className={`ml-4 px-3 py-1 rounded border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          isDark 
            ? 'bg-gray-700 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={`min-h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'} pb-6`}>
      {/* Header - Clean Icon-Based Design */}
      <div className={`sticky top-0 z-10 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-4`}>
        <div className="flex items-center justify-between">
          {/* Left: Back Button + Settings Icon */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'text-blue-400 hover:bg-gray-700' 
                  : 'text-blue-600 hover:bg-blue-50'
              }`}
              title="Back to Dashboard"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <FaCog className={`w-6 h-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              <span className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} hidden sm:block`}>
                Settings
              </span>
            </div>
          </div>
          
          {/* Right: Status + Reset Button */}
          <div className="flex items-center space-x-3">
            {/* Autosave Status - Icon Only on Mobile */}
            <div className={`flex items-center space-x-1 ${isDark ? 'text-green-400' : 'text-green-600'}`}>
              <FaCheck className="w-3 h-3" />
              <span className="text-xs hidden sm:inline">Auto-save</span>
            </div>
            
            {/* Reset Button - Icon Only on Mobile */}
            <button
              onClick={resetToDefaults}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'text-gray-400 hover:bg-gray-700 hover:text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
              title="Reset to Defaults"
            >
              <FaUndo className="w-4 h-4" />
              <span className="ml-1 text-sm hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Content */}
      <div className="p-4 max-w-4xl mx-auto">
        
        {/* Theme Settings */}
        <SettingSection title="Appearance" icon={settings.darkMode ? FaMoon : FaSun}>
          <ToggleSetting
            label="Dark Mode"
            description="Use dark theme across the entire app"
            value={settings.darkMode}
            onChange={(value) => updateSetting('darkMode', value)}
          />
          <SelectSetting
            label="Language"
            value={settings.language}
            options={[
              { value: 'en', label: 'English' },
              { value: 'es', label: 'Español' },
              { value: 'fr', label: 'Français' }
            ]}
            onChange={(value) => updateSetting('language', value)}
          />
          <SelectSetting
            label="Date Format"
            value={settings.dateFormat}
            options={[
              { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
              { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
              { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' }
            ]}
            onChange={(value) => updateSetting('dateFormat', value)}
          />
          <SelectSetting
            label="Time Format"
            value={settings.timeFormat}
            options={[
              { value: '12h', label: '12 Hour' },
              { value: '24h', label: '24 Hour' }
            ]}
            onChange={(value) => updateSetting('timeFormat', value)}
          />
        </SettingSection>

        {/* Notification Settings */}
        <SettingSection title="Notifications" icon={FaBell}>
          <ToggleSetting
            label="Enable Notifications"
            description="Receive push notifications for important updates"
            value={settings.enableNotifications}
            onChange={(value) => updateSetting('enableNotifications', value)}
          />
          <ToggleSetting
            label="Homework Reminders"
            description="Get reminded about upcoming homework deadlines"
            value={settings.homeworkReminders}
            onChange={(value) => updateSetting('homeworkReminders', value)}
            disabled={!settings.enableNotifications}
          />
          <ToggleSetting
            label="Submission Notifications"
            description="Receive notifications when homework is submitted"
            value={settings.submissionNotifications}
            onChange={(value) => updateSetting('submissionNotifications', value)}
            disabled={!settings.enableNotifications}
          />
          <ToggleSetting
            label="Weekly Reports"
            description="Get weekly progress reports via notification"
            value={settings.weeklyReports}
            onChange={(value) => updateSetting('weeklyReports', value)}
            disabled={!settings.enableNotifications}
          />
        </SettingSection>

        {/* Privacy Settings */}
        <SettingSection title="Privacy & Security" icon={FaShieldAlt}>
          <ToggleSetting
            label="Share Progress Data"
            description="Allow sharing anonymized progress data for research"
            value={settings.shareProgress}
            onChange={(value) => updateSetting('shareProgress', value)}
          />
          <ToggleSetting
            label="Analytics"
            description="Help improve the app by sharing usage analytics"
            value={settings.allowAnalytics}
            onChange={(value) => updateSetting('allowAnalytics', value)}
          />
        </SettingSection>

        {/* Performance Settings */}
        <SettingSection title="Performance" icon={FaDatabase}>
          <ToggleSetting
            label="Auto-Save"
            description="Automatically save your work as you type"
            value={settings.autoSave}
            onChange={(value) => updateSetting('autoSave', value)}
          />
          <ToggleSetting
            label="Cache Data"
            description="Store data locally for faster loading"
            value={settings.cacheData}
            onChange={(value) => updateSetting('cacheData', value)}
          />
        </SettingSection>

        {/* User Experience */}
        <SettingSection title="User Experience" icon={FaUser}>
          <SelectSetting
            label="Default Homework View"
            value={settings.defaultHomeworkView}
            options={[
              { value: 'grid', label: 'Grid View' },
              { value: 'list', label: 'List View' },
              { value: 'card', label: 'Card View' }
            ]}
            onChange={(value) => updateSetting('defaultHomeworkView', value)}
          />
          <ToggleSetting
            label="Welcome Messages"
            description="Show helpful tips and welcome messages"
            value={settings.showWelcomeMessages}
            onChange={(value) => updateSetting('showWelcomeMessages', value)}
          />
        </SettingSection>

        {/* App Info */}
        <SettingSection title="About" icon={FaInfoCircle}>
          <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} space-y-2`}>
            <div className="flex justify-between">
              <span>App Version:</span>
              <span className="font-mono">1.2.0</span>
            </div>
            <div className="flex justify-between">
              <span>Last Updated:</span>
              <span>June 2025</span>
            </div>
            <div className="flex justify-between">
              <span>Build:</span>
              <span className="font-mono">PWA-2025.06</span>
            </div>
          </div>
        </SettingSection>

        {/* Autosave Info */}
        <div className={`${isDark ? 'bg-blue-900 border-blue-700' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4 mb-4`}>
          <div className="flex items-center">
            <FaInfoCircle className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
            <span className={`text-sm ${isDark ? 'text-blue-200' : 'text-blue-800'}`}>
              All settings are automatically saved as you change them. No need to manually save!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppSettings; 