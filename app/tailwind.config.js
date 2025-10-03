/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Dark mode palette
        'bg-primary-dark': '#0f0f1a',
        'bg-secondary-dark': '#1a1a2e',
        'bg-tertiary-dark': '#25253d',

        // Light mode palette
        'bg-primary-light': '#fafafa',
        'bg-secondary-light': '#ffffff',
        'bg-tertiary-light': '#f0f0f5',

        // Japanese accents
        'sakura': {
          DEFAULT: '#ffc0d3',
          dark: '#ff4081',
        },
        'matcha': {
          DEFAULT: '#b8d4a8',
          dark: '#689f38',
        },
        'indigo': {
          DEFAULT: '#7986cb',
          dark: '#3f51b5',
        },
        'gold': {
          DEFAULT: '#e8c547',
          dark: '#ffc107',
        },
      },
      fontFamily: {
        japanese: ['"Noto Sans JP"', 'sans-serif'],
        english: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
