/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        title: '#DD7C3D',
        'indicator-red': '#C72C41',
        'indicator-yellow': '#F2D600',
        'indicator-green': '#00FF00',
        'indicator-blue': '#0000FF',
        'text-orange': "#F2A900"
      },
    },
  },
  plugins: [],
};
