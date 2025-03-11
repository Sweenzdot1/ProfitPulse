/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Add any custom colors here
      },
      screens: {
        'xs': '475px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
