// src/features/Settings/hooks/useThemeMode.js
import { useEffect } from 'react';
import useSettingsStore from '../stores/settingsStore'; 

/**
 * @file useThemeMode.js
 * @description Custom hook for managing the application's theme (dark/light mode).
 * It interacts with the `useSettingsStore` to get and set the current theme state
 * and applies the theme class to the document body. It also listens to system
 * theme preferences.
 *
 * @returns {{darkMode: boolean, toggleTheme: function}} An object containing:
 *  - `darkMode` {boolean}: The current state of dark mode (true if enabled, false if light mode).
 *  - `toggleTheme` {function}: A function to toggle the theme between dark and light mode.
 */
const useThemeMode = () => {
  const { darkMode, toggleDarkMode, setDarkMode } = useSettingsStore((state) => ({
    darkMode: state.darkMode,
    toggleDarkMode: state.toggleDarkMode,
    setDarkMode: state.setDarkMode, // Used for system preference listener
  }));

  // Effect to apply the theme class to the document body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  // Effect to detect system theme preference changes
  // This allows the app to adapt if the user changes their OS theme while the app is open.
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    /**
     * Handles changes in the system's preferred color scheme.
     * @param {MediaQueryListEvent} e - The media query list event.
     */
    const handleChange = (e) => setDarkMode(e.matches);

    // Note: The initial setting based on `prefersDark` at component mount
    // is typically handled by `initializeSettings` in `settingsStore.js`
    // to avoid conflicts and centralize initial settings logic (e.g., from localStorage).
    // This effect primarily handles live changes.

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setDarkMode]); // setDarkMode is stable from Zustand

  return { darkMode, toggleTheme: toggleDarkMode };
};

export default useThemeMode;
