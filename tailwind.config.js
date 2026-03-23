/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          900: '#0A0A0F',
          800: '#111118',
          700: '#1A1A24',
          600: '#22222F',
          500: '#2C2C3E',
        },
        accent: {
          DEFAULT: '#7C6AF7',
          light: '#9D8FF9',
          dark: '#5B4DE0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
