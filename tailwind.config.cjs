/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        alatsi: ['Alatsi', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
