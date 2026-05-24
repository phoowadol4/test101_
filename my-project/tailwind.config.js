/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // มีตรงนี้ไว้รองรับ .jsx อยู่แล้วครับ
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}