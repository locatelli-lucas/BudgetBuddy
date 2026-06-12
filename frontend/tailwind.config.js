/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode (default) — from mock/colors/Colors.html
        primary: '#b4c5ff',
        'on-primary': '#002a78',
        'primary-container': '#2563eb',
        'on-primary-container': '#eeefff',

        background: '#11131b',
        'on-background': '#e1e2ed',

        surface: '#11131b',
        'surface-container': '#1d1f27',
        'surface-container-low': '#191b23',
        'surface-container-lowest': '#0c0e16',
        'surface-container-high': '#282a32',
        'surface-container-highest': '#32343d',
        'surface-variant': '#32343d',
        'surface-bright': '#373942',
        'surface-dim': '#11131b',

        'on-surface': '#e1e2ed',
        'on-surface-variant': '#c3c6d7',

        outline: '#8d90a0',
        'outline-variant': '#434655',

        secondary: '#b9c7e0',
        'secondary-container': '#3c4a5e',
        'on-secondary': '#233144',
        'on-secondary-container': '#abb9d2',

        tertiary: '#ffb596',
        'tertiary-container': '#bc4800',
        'on-tertiary': '#581e00',
        'on-tertiary-container': '#ffede6',

        error: '#ffb4ab',
        'error-container': '#93000a',
        'on-error': '#690005',
        'on-error-container': '#ffdad6',

        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',

        'inverse-surface': '#e1e2ed',
        'inverse-on-surface': '#2e3039',
        'inverse-primary': '#0053db',
      },
      fontFamily: {
        inter: ['Inter'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      fontSize: {
        'display': ['40px', { lineHeight: '48px', letterSpacing: '-0.02em', fontWeight: '600' }],
        'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.01em', fontWeight: '500' }],
        'label-sm': ['12px', { lineHeight: '16px', letterSpacing: '0.02em', fontWeight: '500' }],
        'numeric-display': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '500' }],
      },
    },
  },
  plugins: [],
};
