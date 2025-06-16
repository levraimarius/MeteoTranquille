/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "spin-slow": "spin 10s linear infinite",
        "pulse-gentle": "pulse 3s ease-in-out infinite",
      },
      dropShadow: {
        glow: [
          "0 0 10px rgba(250, 204, 21, 0.5)",
          "0 0 20px rgba(250, 204, 21, 0.3)",
        ],
        "glow-white": [
          "0 0 5px rgba(255, 255, 255, 0.5)",
          "0 0 10px rgba(255, 255, 255, 0.3)",
        ],
      },
      backdropBlur: {
        "2xl": "40px",
      },
      fontFamily: {
        modern: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
      },
      colors: {
        glass: {
          light: "rgba(255, 255, 255, 0.1)",
          medium: "rgba(255, 255, 255, 0.2)",
          dark: "rgba(0, 0, 0, 0.1)",
        },
      },
      boxShadow: {
        glass:
          "0 8px 32px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
        "glass-hover":
          "0 12px 40px rgba(255, 255, 255, 0.15), 0 6px 20px rgba(255, 255, 255, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.3)",
      },
    },
  },
  plugins: [],
};
