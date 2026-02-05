/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'serif': ['Crimson Pro', 'serif'],
        'sans': ['DM Sans', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#7b68ee',
          600: '#6d5bd0',
          700: '#5b47b3',
          800: '#4a3a94',
          900: '#3d3176',
        },
        accent: {
          pink: '#ff6b9d',
          teal: '#4ecdc4',
        }
      },
    },
  },
  plugins: [],
}
