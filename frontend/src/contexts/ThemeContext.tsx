// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { useColorScheme, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, applyThemeColors } from '../constants/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextData {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: Record<keyof typeof darkColors, string>;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('dark');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    loadStoredTheme();
  }, []);

  useEffect(() => {
    const resolved = themeMode === 'system'
      ? (systemColorScheme === 'light' ? 'light' : 'dark')
      : themeMode;
    setTheme(resolved as 'light' | 'dark');
    applyThemeColors(resolved as 'light' | 'dark');
  }, [themeMode, systemColorScheme]);

  const colors = useMemo(() => theme === 'dark' ? darkColors : lightColors, [theme]);

  async function loadStoredTheme() {
    try {
      const storedMode = await AsyncStorage.getItem('themeMode');
      if (storedMode) {
        setThemeModeState(storedMode as ThemeMode);
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  }

  async function setThemeMode(mode: ThemeMode) {
    try {
      await AsyncStorage.setItem('themeMode', mode);
      setThemeModeState(mode);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, themeMode, colors, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
