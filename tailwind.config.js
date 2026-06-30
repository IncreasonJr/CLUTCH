// ============================================
// FILE: tailwind.config.js
// Tailwind v4 — content paths and plugins only.
// All theme tokens live in globals.css @theme {}.
// ============================================

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require('tailwindcss-animate')],
};
