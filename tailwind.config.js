/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tell Tailwind where to look for className usage
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#007AFF',
        success: '#28a745',
        warning: '#ffc107',
        danger: '#dc3545',
      }
    },
  },
  plugins: [],
}