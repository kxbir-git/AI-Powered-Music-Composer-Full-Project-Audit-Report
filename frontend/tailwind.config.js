/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0B0D17',
          800: '#121526',
          700: '#1A1E36',
          600: '#252B48',
        },
        brand: {
          purple: '#8B5CF6',
          pink: '#EC4899',
          cyan: '#06B6D4',
          indigo: '#6366F1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
