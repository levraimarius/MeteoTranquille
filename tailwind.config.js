/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 10s linear infinite",
      },
      dropShadow: {
        glow: [
          "0 0 10px rgba(250, 204, 21, 0.5)",
          "0 0 20px rgba(250, 204, 21, 0.3)",
        ],
      },
    },
  },
  plugins: [],
};
