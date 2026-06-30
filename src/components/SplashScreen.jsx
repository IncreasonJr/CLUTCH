'use client';
// ============================================
// FILE: src/components/SplashScreen.jsx
// Immersive launch/splash screen overlay for CLUTCH PWA
// ============================================

import { useEffect, useState } from 'react';

export default function SplashScreen({ onFinished }) {
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if the splash screen has already been shown in this tab session
    if (typeof window !== 'undefined') {
      const shown = sessionStorage.getItem('clutch_splash_shown');
      if (shown === 'true') {
        setShow(false);
        if (onFinished) onFinished();
        return;
      }
    }

    // Otherwise, show the splash screen
    setShow(true);

    // Hard-coded display duration of 500ms for maximum speed
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('clutch_splash_shown', 'true');
      }
      setFadeOut(true);

      // Complete unmount after transition completes (250ms)
      const unmountTimer = setTimeout(() => {
        setShow(false);
        if (onFinished) onFinished();
      }, 250);

      return () => clearTimeout(unmountTimer);
    }, 500);

    return () => clearTimeout(timer);
  }, [onFinished]);

  if (!show) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      transition: 'opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: fadeOut ? 0 : 1,
      transform: fadeOut ? 'scale(1.03)' : 'scale(1)',
      pointerEvents: fadeOut ? 'none' : 'auto',
    }}>
      {/* Radial glow background effect */}
      <div style={{
        position: 'absolute',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0, 172, 169, 0.15) 0%, transparent 70%)',
        filter: 'blur(30px)',
        zIndex: -1,
      }} />

      {/* Main Brand Column */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}>
        {/* Pulsing Logo Container */}
        <div style={{
          width: 96,
          height: 96,
          borderRadius: '24px',
          background: 'var(--glass-bg)',
          border: '1.5px solid var(--glass-border-turquoise)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(0, 172, 169, 0.15)',
          animation: 'float 3s ease-in-out infinite',
        }}>
          <img
            src="/logo1.png"
            alt="CLUTCH Logo"
            style={{
              width: '64px',
              height: '64px',
              objectFit: 'contain',
            }}
          />
        </div>

        {/* Brand Name */}
        <h1 style={{
          fontFamily: 'var(--font-orbitron, sans-serif)',
          fontSize: '2rem',
          fontWeight: 900,
          color: 'var(--text-primary)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          margin: 0,
          opacity: 0.9,
        }}>
          CLUTCH
        </h1>

        {/* Subtle tagline */}
        <p style={{
          fontFamily: 'var(--font-inter, sans-serif)',
          fontSize: '0.8rem',
          fontWeight: 500,
          color: 'var(--text-muted)',
          margin: '-10px 0 0 0',
          letterSpacing: '0.05em',
        }}>
          AI Match Predictor
        </p>
      </div>

      {/* Glowing Loading Bar at Bottom */}
      <div style={{
        position: 'absolute',
        bottom: '80px',
        width: '140px',
        height: '3px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, #00ACA9, transparent)',
          borderRadius: '2px',
          animation: 'shimmer 1.5s infinite linear',
        }} />
      </div>
    </div>
  );
}
