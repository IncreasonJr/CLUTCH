// ============================================
// FILE: next.config.js
// next-pwa for production PWA, Turbopack for dev
// ============================================

const withPWA = require('next-pwa')({
  dest:        'public',
  register:    true,
  skipWaiting: true,
  disable:     process.env.NODE_ENV === 'development', // PWA only in production
});

module.exports = withPWA({
  reactStrictMode: true,
  turbopack: {},   // silence Turbopack + webpack config warning in dev
});
