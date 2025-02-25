/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // body: 'var(--font-outfit), sans-serif',
        body: ['"JetBrains Mono"', "monospace"],
      },
      colors: {
        'very-dark-blue': '#0d1b2a', // Replace with your desired hex code
        'dark-blue': '#19426e', // Replace with your desired hex code
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
