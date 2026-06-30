'use client';
// ============================================
// FILE: src/components/Navbar.jsx
// Premium responsive navbar — desktop top, mobile bottom dock + mobile top header
// ============================================

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, BarChart2, User, Menu, X, Zap, Sun, Moon, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { href: '/',            icon: Home,      label: 'Home' },
  { href: '/predictions', icon: BarChart2, label: 'Predictions' },
  { href: '/profile',     icon: User,      label: 'Profile' },
];

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Monitor scroll for header styling
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Monitor document theme on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  // Toggle theme handler
  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  };

  // Hide nav on login page
  if (pathname === '/login') return null;

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <>
      {/* ── Desktop Top Nav ──────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'none',
        background: scrolled
          ? 'var(--glass-bg)'
          : 'transparent',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: scrolled ? '1px solid var(--glass-border-turquoise)' : '1px solid transparent',
        transition: 'all 0.3s ease',
      }} className="md-nav">
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 24px',
          height: 64,
          display: 'flex', alignItems: 'center', justifySpace: 'between',
          justifyContent: 'space-between',
        }}>
          {/* Logo */}
          <Link href="/" style={{
            display: 'flex', alignItems: 'center', gap: 10,
            textDecoration: 'none',
          }}>
            <img src="/logo1.png" alt="CLUTCH Logo" style={{
              width: 32, height: 32, objectFit: 'contain',
            }} />
            <span style={{
              fontFamily: 'var(--font-orbitron, sans-serif)',
              fontWeight: 900, fontSize: '1.25rem',
              color: 'var(--text-primary)', letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}>
              CLUTCH
            </span>
          </Link>

          {/* Nav Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <Link key={href} href={href} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '8px 16px', borderRadius: 10,
                  textDecoration: 'none',
                  background: active ? 'rgba(0,172,169,0.12)' : 'transparent',
                  color: active ? '#00ACA9' : 'var(--text-secondary)',
                  fontSize: '0.88rem', fontWeight: active ? 600 : 500,
                  fontFamily: 'var(--font-poppins, sans-serif)',
                  transition: 'all 0.2s ease',
                  border: active ? '1px solid rgba(0,172,169,0.25)' : '1px solid transparent',
                }}>
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </div>

          {/* Right section: Theme Toggle + User badge/Sign In */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle light/dark theme"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#00ACA9'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--glass-border)'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              /* User badge */
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '6px 14px', borderRadius: 9999,
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
              }}>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #00788E, #4DD0D0)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.7rem', fontWeight: 700, color: '#fff',
                  fontFamily: 'var(--font-orbitron, sans-serif)',
                }}>
                  {(user.email?.[0] || 'U').toUpperCase()}
                </div>
                <span style={{
                  color: 'var(--text-secondary)', fontSize: '0.82rem',
                  fontFamily: 'var(--font-poppins, sans-serif)',
                  maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {user.username || user.email?.split('@')[0]}
                </span>
              </div>
            ) : (
              /* Guest Sign In CTA */
              <Link href="/login" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 16px', borderRadius: 9999,
                background: 'linear-gradient(135deg, #00788E, #00ACA9)',
                color: '#fff', fontSize: '0.82rem', fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'var(--font-poppins, sans-serif)',
                boxShadow: '0 2px 10px rgba(0,172,169,0.25)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = 'none'}
              >
                <LogIn size={14} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Mobile Top Header ────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        transition: 'all 0.2s',
      }} className="mobile-header">
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 8,
          textDecoration: 'none',
        }}>
          <img src="/logo1.png" alt="CLUTCH Logo" style={{
            width: 28, height: 28, objectFit: 'contain',
          }} />
          <span style={{
            fontFamily: 'var(--font-orbitron, sans-serif)',
            fontWeight: 900, fontSize: '1.05rem',
            color: 'var(--text-primary)', letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            CLUTCH
          </span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle light/dark theme"
          style={{
            background: 'none',
            border: 'none',
            padding: 8,
            cursor: 'pointer',
            color: 'var(--text-primary)',
          }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* ── Mobile Bottom Dock ───────────────────────────────── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--glass-border)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transition: 'all 0.2s',
      }} className="mobile-nav">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = isActive(href);
          return (
            <Link key={href} href={href} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '12px 8px',
              textDecoration: 'none',
              color: active ? '#00ACA9' : 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              position: 'relative',
            }}>
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute', top: 6,
                  width: 4, height: 4, borderRadius: '50%',
                  background: '#00ACA9',
                  boxShadow: '0 0 8px rgba(0,172,169,0.8)',
                }} />
              )}
              <Icon
                size={22}
                style={{
                  filter: active ? 'drop-shadow(0 0 6px rgba(0,172,169,0.6))' : 'none',
                  transform: active ? 'translateY(-1px)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              />
              <span style={{
                fontSize: '0.65rem',
                fontWeight: active ? 700 : 500,
                fontFamily: 'var(--font-poppins, sans-serif)',
                letterSpacing: active ? '0.04em' : 0,
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Responsive CSS for desktop and mobile headers */}
      <style>{`
        @media (min-width: 768px) {
          .md-nav { display: block !important; }
          .mobile-header { display: none !important; }
          .mobile-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          .md-nav { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-nav { display: flex !important; }
        }
      `}</style>
    </>
  );
}
