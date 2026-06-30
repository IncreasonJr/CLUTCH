// ============================================
// FILE: src/app/login/page.jsx
// Email-only login / auto-register
// ============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { loginWithEmail, saveSession } from '../../lib/auth';
import { useAuth } from '../../context/AuthContext';

/* ── Spinner SVG ───────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      width="20" height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeOpacity="1" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
  const router   = useRouter();
  const { refreshUser } = useAuth();

  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [shake,   setShake]   = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { user, isNew } = await loginWithEmail(email);
      saveSession(user);
      refreshUser();
      toast.success(isNew ? 'Account created! Welcome to CLUTCH 🎉' : 'Welcome back!');
      router.push('/');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
      transition: 'background var(--transition-base)',
    }}>

      {/* ── Background glow orbs ────────────────────────────────────────── */}
      <div className="animate-glow-orb" style={{
        position: 'absolute',
        top: '-15%',
        left: '-10%',
        width: '55vw',
        height: '55vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,172,169,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
        animationDelay: '0s',
      }} />
      <div className="animate-glow-orb" style={{
        position: 'absolute',
        bottom: '-20%',
        right: '-10%',
        width: '50vw',
        height: '50vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,120,142,0.1) 0%, transparent 70%)',
        pointerEvents: 'none',
        animationDelay: '2s',
      }} />
      <div className="animate-glow-orb" style={{
        position: 'absolute',
        top: '60%',
        left: '60%',
        width: '30vw',
        height: '30vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,172,169,0.06) 0%, transparent 70%)',
        pointerEvents: 'none',
        animationDelay: '1s',
      }} />

      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div
        className={shake ? 'animate-shake' : ''}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'var(--bg-surface)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(0,172,169,0.3)',
          borderRadius: '1.5rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,172,169,0.15)',
          padding: 'clamp(2rem, 5vw, 2.75rem)',
          animation: 'fadeInUp 0.5s ease-out both',
          zIndex: 1,
          transition: 'background var(--transition-base), border-color var(--transition-base)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 72,
            height: 72,
            marginBottom: '1.25rem',
          }}>
            <img src="/logo1.png" alt="CLUTCH Logo" style={{
              width: 64,
              height: 64,
              objectFit: 'contain',
            }} />
          </div>

          <h1 style={{
            fontFamily: 'var(--font-orbitron)',
            fontSize: '1.6rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '0.5rem',
            letterSpacing: '-0.01em',
          }}>Welcome Back</h1>

          <p style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
          }}>Enter your email to continue.<br />No password required.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>

          {/* Email input */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontFamily: 'var(--font-poppins)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem',
            }}>Email Address</label>
            <input
              id="login-email"
              type="email"
              className="input-glass"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              disabled={loading}
              required
              autoComplete="email"
              autoFocus
              style={{ fontFamily: 'var(--font-inter)' }}
            />

            {/* Error message */}
            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                marginTop: '0.5rem',
                color: '#f87171',
                fontFamily: 'var(--font-inter)',
                fontSize: '0.8rem',
              }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}
          </div>

          {/* Helper text */}
          <p style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            New user? We'll create your account automatically.
          </p>

          {/* Submit button */}
          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading || !email.trim()}
            style={{
              width: '100%',
              padding: '0.9rem',
              fontFamily: 'var(--font-orbitron)',
              fontSize: '0.9rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              borderRadius: '0.875rem',
              gap: '0.6rem',
            }}
          >
            {loading ? (
              <>
                <Spinner />
                Signing in…
              </>
            ) : (
              <>
                Continue
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Footer text */}
        <p style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginTop: '1.75rem',
          lineHeight: 1.6,
        }}>
          By continuing you agree to our{' '}
          <span style={{ color: 'rgba(0,172,169,0.9)', cursor: 'pointer' }}>Terms of Service</span>
        </p>
      </div>
    </div>
  );
}
