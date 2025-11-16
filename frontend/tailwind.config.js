/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
      },
      colors: {
        "brand-cyan": "#06b6d4",
        "brand-blue": "#3b82f6"
      },
      boxShadow: {
        "glow-cyan": "0 15px 45px rgba(6, 182, 212, 0.35)"
      }
    }
  },
  plugins: []
};

