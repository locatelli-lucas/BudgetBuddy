/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // README Design Tokens
        primary: '#2563EB',
        success: '#22C55E',
        danger: '#EF4444',
        warning: '#F59E0B',
        background: '#0F172A',
        surface: '#1E293B',
        'surface-container': '#1d2235',
        'surface-container-high': '#282a32',
        'surface-container-highest': '#32343d',
        'surface-variant': '#1E293B',
        'on-surface': '#F8FAFC',
        'on-surface-variant': '#c3c6d7',
        'on-background': '#F8FAFC',
        'on-primary': '#ffffff',
        'primary-container': '#1d4ed8',
        'on-primary-container': '#eeefff',
        'outline': '#8d90a0',
        'outline-variant': '#434655',
        'error': '#EF4444',
        'error-container': '#7f1d1d',
        'on-error': '#ffffff',
        'secondary': '#b9c7e0',
        'secondary-container': '#3c4a5e',
        'on-secondary-container': '#abb9d2',
        'tertiary': '#ffb596',
        'tertiary-container': '#bc4800',
        'on-tertiary-container': '#ffede6',
      },
      fontFamily: {
        inter: ['Inter'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};
