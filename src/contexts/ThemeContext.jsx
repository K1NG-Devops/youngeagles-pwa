import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setIsDark(settings.darkMode || false);
      } catch (error) {
        console.error('Error loading theme settings:', error);
      }
    }
  }, []);

  // Update theme and save to localStorage
  const toggleTheme = (newTheme) => {
    const newIsDark = newTheme !== undefined ? newTheme : !isDark;
    setIsDark(newIsDark);
    
    // Update localStorage
    const savedSettings = localStorage.getItem('appSettings');
    let settings = {};
    
    if (savedSettings) {
      try {
        settings = JSON.parse(savedSettings);
      } catch (error) {
        console.error('Error parsing settings:', error);
      }
    }
    
    settings.darkMode = newIsDark;
    localStorage.setItem('appSettings', JSON.stringify(settings));
  };

  const value = {
    isDark,
    toggleTheme,
    setTheme: toggleTheme // Alias for consistency
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 