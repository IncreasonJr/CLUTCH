// ============================================
// FILE: src/app/layout.jsx
// Root layout: Google Fonts via next/font,
// providers, navbar, toaster.
// ============================================

import './globals.css';
import { Orbitron, Inter, JetBrains_Mono, Playfair_Display, Poppins } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import Navbar           from '../components/Navbar';
import { Toaster }      from 'react-hot-toast';

// ── Font configurations ──────────────────────

const orbitron = Orbitron({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800', '900'],
  variable: '--font-orbitron',
  display:  'swap',
});

const inter = Inter({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display:  'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700'],
  variable: '--font-jetbrains',
  display:  'swap',
});

const playfairDisplay = Playfair_Display({
  subsets:  ['latin'],
  weight:   ['400', '500', '600', '700', '800'],
  variable: '--font-playfair',
  display:  'swap',
});

const poppins = Poppins({
  subsets:  ['latin'],
  weight:   ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display:  'swap',
});

// ── Metadata ────────────────────────────────

export const metadata = {
  title:       'CLUTCH | AI Match Predictions',
  description: 'Premium AI-powered football predictions',
  manifest:    '/manifest.json',
  icons: {
    icon:  '/logo1.png',
    apple: '/logo1.png',
  },
  openGraph: {
    title:       'CLUTCH | AI Match Predictions',
    description: 'Premium AI-powered football predictions',
    type:        'website',
  },
  other: {
    'color-scheme': 'dark',
  },
};

export const viewport = {
  themeColor:   '#00ACA9',
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

// ── Root Layout ─────────────────────────────

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[
        orbitron.variable,
        inter.variable,
        jetbrainsMono.variable,
        playfairDisplay.variable,
        poppins.variable,
      ].join(' ')}
    >
      <head>
        {/* Inline script to prevent theme flash (FOUC) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>
            {children}
          </main>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background:     'var(--glass-bg)',
                backdropFilter: 'blur(16px)',
                color:          'var(--text-primary)',
                border:         '1px solid var(--glass-border-turquoise)',
                borderRadius:   '0.75rem',
                fontFamily:     'var(--font-poppins, sans-serif)',
                fontSize:       '0.9rem',
              },
              success: {
                iconTheme: { primary: '#00ACA9', secondary: '#111111' },
              },
              error: {
                iconTheme: { primary: '#FF1744', secondary: '#111111' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
