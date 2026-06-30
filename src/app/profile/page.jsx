'use client';
// ============================================
// FILE: src/app/profile/page.jsx
// User profile — hero, stats, account info, logout
// ============================================

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { loginWithEmail, saveSession } from '../../lib/auth';
import { LogOut, User, BarChart2, Target, Zap, Settings, ShieldCheck, Clock, LogIn, Mail } from 'lucide-react';

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, subtext }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', padding: '20px 12px', borderRadius: 16,
      textAlign: 'center',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.08)',
      transition: 'border-color 0.2s, transform 0.2s',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = `${color}44`;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, marginBottom: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: `${color}18`, border: `1px solid ${color}33`,
      }}>
        <Icon size={18} color={color} />
      </div>
      <p style={{
        fontSize: '1.5rem', fontWeight: 800, marginBottom: 2, color,
        fontFamily: 'var(--font-orbitron, "Noto Serif TC", serif)',
        lineHeight: 1,
      }}>
        {value ?? '—'}
      </p>
      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter, sans-serif)' }}>
        {label}
      </p>
      {subtext && (
        <p style={{ fontSize: '0.62rem', color: `${color}aa`, marginTop: 2, fontFamily: 'var(--font-inter, sans-serif)' }}>
          {subtext}
        </p>
      )}
    </div>
  );
}

// ── Account row ───────────────────────────────────────────────────────────────
function AccountRow({ label, value, first }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0',
      borderTop: first ? 'none' : '1px solid var(--glass-border)',
    }}>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter, sans-serif)' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontFamily: 'var(--font-inter, sans-serif)', maxWidth: '60%', textAlign: 'right' }}>
        {value}
      </span>
    </div>
  );
}

// ── Activity row (placeholder) ────────────────────────────────────────────────
function ActivityRow({ home, away, prediction, date }) {
  const predColor = prediction === 'Home Win' ? '#00ACA9'
    : prediction === 'Away Win' ? '#FF6B35'
    : '#FFD93D';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '11px 0', borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: '0.82rem', fontWeight: 600, color: '#D0D0D0',
          fontFamily: 'var(--font-inter, sans-serif)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {home} vs {away}
        </p>
        <p style={{ fontSize: '0.68rem', color: '#444', marginTop: 2, fontFamily: 'var(--font-inter, sans-serif)' }}>
          {date}
        </p>
      </div>
      <span style={{
        fontSize: '0.7rem', fontWeight: 700, padding: '3px 10px',
        borderRadius: 6, flexShrink: 0, marginLeft: 12,
        color: predColor, background: `${predColor}18`,
        border: `1px solid ${predColor}33`,
        fontFamily: 'var(--font-inter, sans-serif)',
      }}>
        {prediction}
      </span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPredictions, setRecentPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchStats() {
    try {
      const { data, error } = await supabase
        .from('user_predictions')
        .select('id, user_prediction, points_earned, created_at, matches(home_team, away_team, match_date)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const total = data?.length || 0;
      const correct = data?.filter(p => p.points_earned > 0).length || 0;
      const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
      
      setStats({ total, correct, accuracy });
      
      // Format the recent predictions list
      const labelMap = { home_win: 'Home Win', draw: 'Draw', away_win: 'Away Win' };
      const formatted = (data || []).slice(0, 5).map(p => {
        const m = p.matches || {};
        const matchDate = m.match_date ? new Date(m.match_date) : new Date(p.created_at);
        return {
          home: m.home_team || 'Unknown',
          away: m.away_team || 'Unknown',
          prediction: labelMap[p.user_prediction] || p.user_prediction,
          date: matchDate.toLocaleDateString('en-GH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
        };
      });
      setRecentPredictions(formatted);
    } catch (err) {
      console.error('Error fetching user stats:', err.message);
      setStats({ total: 0, correct: 0, accuracy: 0 });
      setRecentPredictions([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    toast.success('Logged out successfully');
    logout();
  }

  if (!user) {
    return <GuestProfileView />;
  }

  const initial = (user.email?.[0] || 'U').toUpperCase();
  const username = user.username || user.email?.split('@')[0] || 'Football Fan';
  const memberSince = user.created_at
    ? new Date(user.created_at).toLocaleDateString('en-GH', { month: 'long', year: 'numeric' })
    : 'N/A';

  const accuracyColor = !stats ? '#00ACA9'
    : stats.accuracy >= 70 ? '#22c55e'
    : stats.accuracy >= 50 ? '#FFD93D'
    : '#FF6B35';

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* ── Hero section ── */}
      <div style={{
        padding: '48px 16px 32px',
        background: 'linear-gradient(180deg, rgba(0,120,142,0.14) 0%, rgba(0,0,0,0) 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
      }}>
        {/* Avatar with glow ring */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          {/* Pulsing glow ring */}
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #00ACA9, #4DD0D0, #00ACA9)',
            animation: 'glowPulse 3s ease-in-out infinite',
            padding: 2,
          }}>
            <div style={{ borderRadius: '50%', background: '#0A0A0A', width: '100%', height: '100%' }} />
          </div>
          {/* Avatar */}
          <div style={{
            position: 'relative', width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: '#fff',
            background: 'linear-gradient(135deg, #00788E 0%, #4DD0D0 100%)',
            boxShadow: '0 0 30px rgba(0,172,169,0.5)',
            fontFamily: 'var(--font-orbitron, sans-serif)',
          }}>
            {initial}
          </div>
        </div>

        {/* Username */}
        <h1 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4,
          fontFamily: 'var(--font-orbitron, "Noto Serif TC", serif)',
          letterSpacing: '-0.01em',
        }}>
          {username}
        </h1>
        {/* Email */}
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 10, fontFamily: 'var(--font-inter, sans-serif)' }}>
          {user.email}
        </p>
        {/* Active member badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 14px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
          background: 'rgba(0,172,169,0.12)', color: '#4DD0D0',
          border: '1px solid rgba(0,172,169,0.3)',
          fontFamily: 'var(--font-inter, sans-serif)',
        }}>
          <ShieldCheck size={12} />
          Active Member
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px' }} className="animate-fadeIn">

        {/* ── Stats grid ── */}
        <div style={{ marginBottom: 20 }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#00ACA9', marginBottom: 12,
            fontFamily: 'var(--font-inter, sans-serif)',
          }}>
            Your Statistics
          </p>
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[0,1,2].map(i => (
                <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <StatCard
                icon={BarChart2} label="Predictions"
                value={stats?.total} color="#4DD0D0"
                subtext="total made"
              />
              <StatCard
                icon={Target} label="Correct"
                value={stats?.correct} color="#00ACA9"
                subtext="hits"
              />
              <StatCard
                icon={Zap} label="Accuracy"
                value={stats?.accuracy != null ? `${stats.accuracy}%` : null}
                color={accuracyColor}
                subtext={
                  stats?.accuracy >= 70 ? 'Excellent!' :
                  stats?.accuracy >= 50 ? 'Good' : 'Keep going'
                }
              />
            </div>
          )}
        </div>

        {/* ── Account info card ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
          padding: '16px 20px', marginBottom: 16,
        }}>
          <p style={{
            fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: '#00ACA9', marginBottom: 4,
            fontFamily: 'var(--font-inter, sans-serif)',
          }}>
            Account Info
          </p>
          <AccountRow first label="Email" value={user.email} />
          <AccountRow label="Member Since" value={memberSince} />
          <AccountRow label="Plan" value={
            <span style={{
              fontSize: '0.72rem', padding: '2px 10px', borderRadius: 999,
              background: 'rgba(0,172,169,0.12)', color: '#4DD0D0',
              border: '1px solid rgba(0,172,169,0.3)',
            }}>
              Free
            </span>
          } />
        </div>

        {/* ── Recent activity ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18,
          padding: '16px 20px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Clock size={14} color="#00ACA9" />
            <p style={{
              fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: '#00ACA9',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              Recent Predictions
            </p>
          </div>
          {recentPredictions.length === 0 ? (
            <p style={{
              fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center',
              padding: '16px 0', fontFamily: 'var(--font-inter, sans-serif)',
              lineHeight: 1.4,
            }}>
              You haven't placed any predictions yet.
            </p>
          ) : (
            recentPredictions.map((a, i) => (
              <ActivityRow key={i} {...a} />
            ))
          )}
        </div>

        {/* ── Logout button ── */}
        <button
          className="btn-danger"
          onClick={handleLogout}
          id="logout-btn"
          style={{ width: '100%', fontSize: '0.95rem', padding: '14px', borderRadius: 14 }}
        >
          <LogOut size={16} />
          Logout
        </button>

        {/* Disclaimer */}
        <p style={{
          fontSize: '0.72rem', textAlign: 'center', marginTop: 24, marginBottom: 8,
          color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'var(--font-inter, sans-serif)',
        }}>
          Predictions are for entertainment purposes only.
          <br />Not financial or betting advice.
        </p>
      </div>
    </div>
  );
}

// ── Guest profile view ────────────────────────────────────────────────────────
function GuestProfileView() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const { user, isNew } = await loginWithEmail(email);
      saveSession(user);
      refreshUser();
      toast.success(isNew ? 'Account created! Welcome to CLUTCH 🎉' : 'Welcome back!');
    } catch (err) {
      toast.error(err.message);
      setShake(true);
      setTimeout(() => setShake(false), 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen page-content animate-fadeIn" style={{
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '72px 16px 24px',
    }}>
      <div className={shake ? 'animate-shake' : ''} style={{
        width: '100%',
        maxWidth: '420px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: '20px',
        padding: '32px 24px',
        boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        textAlign: 'center',
      }}>
        {/* Placeholder Avatar */}
        <div style={{ position: 'relative', margin: '0 auto 20px', width: 80, height: 80 }}>
          <div style={{
            position: 'absolute', inset: -6, borderRadius: '50%',
            background: 'conic-gradient(from 0deg, #00ACA9, #4DD0D0, #00ACA9)',
            animation: 'glowPulse 3s ease-in-out infinite',
            padding: 2,
          }}>
            <div style={{ borderRadius: '50%', background: 'var(--bg-base)', width: '100%', height: '100%' }} />
          </div>
          <div style={{
            position: 'relative', width: 80, height: 80, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)',
            background: 'var(--bg-card)',
            fontFamily: 'var(--font-orbitron, sans-serif)',
          }}>
            ?
          </div>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8,
          fontFamily: 'var(--font-orbitron, sans-serif)',
          letterSpacing: '-0.02em',
        }}>
          Join CLUTCH
        </h2>
        
        {/* Description */}
        <p style={{
          fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 24,
          fontFamily: 'var(--font-inter, sans-serif)', lineHeight: 1.5,
        }}>
          Sign in to save your match predictions, track your hit accuracy, and unlock premium analytics.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <label htmlFor="guest-email" style={{
              fontSize: '0.72rem', fontWeight: 700,
              color: 'var(--text-secondary)', textTransform: 'uppercase',
              letterSpacing: '0.05em', marginBottom: 6,
              fontFamily: 'var(--font-poppins, sans-serif)',
            }}>
              Email Address
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                id="guest-email"
                name="guest-email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
                className="input-glass"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 12,
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-inter, sans-serif)',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {loading ? 'Signing In...' : (
              <>
                <LogIn size={16} />
                Continue
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
