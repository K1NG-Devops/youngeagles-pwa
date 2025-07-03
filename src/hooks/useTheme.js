import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check if theme preference is saved in localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // If no saved preference, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    // Update localStorage when theme changes
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    // Update document class for Tailwind dark mode
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return { isDark, toggleTheme };
}; 