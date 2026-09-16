/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sigec: {
          navy: '#002747',
          'navy-dark': '#00192e',
          'navy-light': '#003660',
          orange: '#ff8928',
          'orange-hover': '#eb7717',
          'orange-light': '#fff3ea',
          bg: '#fbf8ff',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
