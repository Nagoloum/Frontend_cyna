/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ], 
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Kumbh Sans', 'sans-serif'],
      },
      colors: {
        accent: {
          DEFAULT: '#7c3aed',
          hover:   '#6d28d9',
          light:   '#ede9fe',
        },
      },
    },
  },
  plugins: [],
}