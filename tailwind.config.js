const { themeColors } = require("./theme.config");
const plugin = require("tailwindcss/plugin");

const tailwindColors = Object.fromEntries(
  Object.entries(themeColors).map(([name, swatch]) => [
    name,
    {
      DEFAULT: swatch.light,
      light: swatch.light,
      dark: swatch.dark,
    },
  ]),
);

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
    "./hooks/**/*.{js,jsx,ts,tsx}",
  ],

  theme: {
    extend: {
      colors: tailwindColors,
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'card': '0 2px 12px rgba(0,0,0,0.06)',
        'card-dark': '0 2px 12px rgba(0,0,0,0.3)',
        'elevated': '0 4px 20px rgba(0,0,0,0.08)',
        'elevated-dark': '0 4px 20px rgba(0,0,0,0.4)',
        'glass': '0 8px 32px rgba(0,0,0,0.05)',
      },
    },
  },
  plugins: [
    plugin(({ addVariant }) => {
      addVariant("light", ':root:not([data-theme="dark"]) &');
    }),
  ],
};
