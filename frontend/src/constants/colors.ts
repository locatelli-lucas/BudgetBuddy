// src/constants/colors.ts
// Based on the design system from mock/colors/Colors.html

export const darkColors = {
  primary: '#b4c5ff',
  primaryContainer: '#2563eb',
  onPrimary: '#002a78',
  onPrimaryContainer: '#eeefff',

  background: '#11131b',
  surface: '#11131b',
  surfaceContainer: '#1d1f27',
  surfaceContainerLow: '#191b23',
  surfaceContainerLowest: '#0c0e16',
  surfaceContainerHigh: '#282a32',
  surfaceContainerHighest: '#32343d',
  surfaceVariant: '#32343d',
  surfaceBright: '#373942',
  surfaceDim: '#11131b',

  onSurface: '#e1e2ed',
  onSurfaceVariant: '#c3c6d7',
  onBackground: '#e1e2ed',

  outline: '#8d90a0',
  outlineVariant: '#434655',

  secondary: '#b9c7e0',
  secondaryContainer: '#3c4a5e',
  onSecondary: '#233144',
  onSecondaryContainer: '#abb9d2',

  tertiary: '#ffb596',
  tertiaryContainer: '#bc4800',
  onTertiary: '#581e00',
  onTertiaryContainer: '#ffede6',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  inverseSurface: '#e1e2ed',
  inverseOnSurface: '#2e3039',
  inversePrimary: '#0053db',
} as const;

export const lightColors = {
  primary: '#2563EB',
  primaryContainer: '#dbe1ff',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#002a78',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceContainer: '#F1F5F9',
  surfaceContainerLow: '#F8FAFC',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#E2E8F0',
  surfaceContainerHighest: '#CBD5E1',
  surfaceVariant: '#E2E8F0',
  surfaceBright: '#FFFFFF',
  surfaceDim: '#F1F5F9',

  onSurface: '#0F172A',
  onSurfaceVariant: '#475569',
  onBackground: '#0F172A',

  outline: '#94A3B8',
  outlineVariant: '#CBD5E1',

  secondary: '#64748B',
  secondaryContainer: '#E2E8F0',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#334155',

  tertiary: '#EA580C',
  tertiaryContainer: '#FFEDD5',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#7C2D12',

  error: '#DC2626',
  errorContainer: '#FEE2E2',
  onError: '#FFFFFF',
  onErrorContainer: '#7F1D1D',

  success: '#16A34A',
  warning: '#F59E0B',
  danger: '#DC2626',

  inverseSurface: '#0F172A',
  inverseOnSurface: '#F8FAFC',
  inversePrimary: '#b4c5ff',
} as const;

// Reactive Colors object via Proxy.
// Every `Colors.primary` access resolves against the active theme palette.
// Components import { Colors } as normal — zero changes needed.
let _activeTheme: 'light' | 'dark' = 'dark';

export const Colors = new Proxy({} as Record<keyof typeof darkColors, string>, {
  get(_target, prop: string) {
    const palette = _activeTheme === 'dark' ? darkColors : lightColors;
    return palette[prop as keyof typeof darkColors] ?? prop;
  },
  set(_target, prop: string, value: string) {
    // Allow setting for compatibility, but proxy handles reads
    return true;
  },
  ownKeys() {
    return Object.keys(darkColors);
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

export function applyThemeColors(theme: 'light' | 'dark') {
  _activeTheme = theme;

  // Also toggle the 'dark' class on <html> for web Tailwind darkMode
  if (typeof document !== 'undefined') {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
