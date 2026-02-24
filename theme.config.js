/** @type {const} */
const themeColors = {
  // Falcon Focus palette: Navy, Gold, Teal — 2026 Premium
  primary: { light: '#0a7ea4', dark: '#12a5d3' },      // Teal (brighter in dark)
  secondary: { light: '#0f2b3d', dark: '#1e4a6e' },    // Deep Navy
  accent: { light: '#e5a100', dark: '#ffc42e' },       // Gold (richer light, vivid dark)
  background: { light: '#f8fafb', dark: '#0b1117' },   // Off-white / Deep dark
  surface: { light: '#eef2f7', dark: '#141e2b' },      // Subtle surface
  foreground: { light: '#0f2b3d', dark: '#e8eef7' },   // Navy text / off-white
  muted: { light: '#5e6e7e', dark: '#8899aa' },        // Refined muted
  border: { light: '#d0dae6', dark: '#1e3044' },       // Subtle borders
  success: { light: '#16a34a', dark: '#4ade80' },
  warning: { light: '#d97706', dark: '#fbbf24' },
  error: { light: '#dc2626', dark: '#f87171' },
};

module.exports = { themeColors };
