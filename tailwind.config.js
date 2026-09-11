/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      colors: {
        coffee: {
          50: '#faf7f2',
          100: '#f5ecde',
          200: '#e8d5b8',
          300: '#d9bd93',
          400: '#c89e6a',
          500: '#b88450',
          600: '#a06b3e',
          700: '#825634',
          800: '#5e3f28',
          900: '#3d2a1c',
          950: '#241710',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf5eb',
          200: '#f4e9d4',
          300: '#ecd9b5',
          400: '#e0c089',
          500: '#d4a865',
        },
        forest: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        ember: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
