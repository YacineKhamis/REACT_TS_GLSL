/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#007bff',
        dark: {
          DEFAULT: '#1a1a1a',
          lighter: '#2a2a2a',
          border: '#444',
        },
      },
    },
  },
  plugins: [],
};
