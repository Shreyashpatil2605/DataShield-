/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        light: {
          bg: "#ffffff",
          text: "#000000",
          border: "#e5e7eb",
          card: "#f9fafb",
          input: "#f3f4f6",
        },
      },
    },
  },
  plugins: [],
};
