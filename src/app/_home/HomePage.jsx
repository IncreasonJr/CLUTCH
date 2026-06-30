'use client';
// ============================================
// FILE: src/app/_home/HomePage.jsx
// Redesigned authenticated home — today's matches
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { fetchTodaysPredictions, refreshPredictions } from '../../services/api';
import EnhancedMatchCard from '../../components/EnhancedMatchCard';
import SearchBar from '../../components/SearchBar';
import SplashScreen from '../../components/SplashScreen';
import { RefreshCw, Calendar, Activity, Zap, CheckCircle2 } from 'lucide-react';


// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(26,26,26,0.65)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: 16,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div className="skeleton" style={{ width: 72, height: 22, borderRadius: 999 }} />
        <div className="skeleton" style={{ width: 48, height: 16, borderRadius: 4 }} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="skeleton" style={{ flex: 1, height: 18, borderRadius: 6 }} />
        <div className="skeleton" style={{ width: 52, height: 34, borderRadius: 10 }} />
        <div className="skeleton" style={{ flex: 1, height: 18, borderRadius: 6 }} />
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <div className="skeleton" style={{ flex: 1, height: 20, borderRadius: 4 }} />
        <div className="skeleton" style={{ flex: 1, height: 20, borderRadius: 4 }} />
        <div className="skeleton" style={{ flex: 1, height: 20, borderRadius: 4 }} />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onRefresh, refreshing, filtered }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '48px 24px',
      background: 'rgba(26,26,26,0.6)',
      backdropFilter: 'blur(16px)',
      border: '1px solid rgba(0,172,169,0.12)',
      borderRadius: 20,
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,172,169,0.08)',
        border: '1px solid rgba(0,172,169,0.2)',
        marginBottom: 16,
      }}>
        <Calendar size={28} color="#00ACA9" />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
        {filtered ? 'No matches in this filter' : 'No matches this week'}
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: 260, marginBottom: 20, lineHeight: 1.5 }}>
        {filtered
          ? 'Try a different date filter or check back later.'
          : 'No matches are scheduled for this week. Predictions will appear here once fixtures are loaded.'}
      </p>
      <button className="btn-ghost" onClick={onRefresh} disabled={refreshing}
        style={{ fontSize: '0.875rem', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
        {refreshing ? 'Syncing...' : 'Refresh'}
      </button>
    </div>
  );
}

// ── Filter tabs ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all', label: 'All (this week)' },
  { key: 'today', label: 'Today' },
  { key: 'tomorrow', label: 'Tomorrow' },
  { key: 'weekend', label: 'This Weekend' },
];

// ── Greeting helper ───────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ icon, label, value, color, pulse }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '6px 14px', borderRadius: 999,
      background: 'var(--bg-card)',
      border: '1px solid var(--glass-border)',
      flexShrink: 0,
    }}>
      {pulse && (
        <span style={{
          width: 7, height: 7, borderRadius: '50%',
          background: '#f87171', flexShrink: 0,
          animation: 'pulse-red 1.5s infinite',
        }} />
      )}
      {!pulse && icon}
      <span style={{ fontSize: '0.8rem', fontWeight: 700, color, fontFamily: 'var(--font-jetbrains, monospace)' }}>
        {value}
      </span>
      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</span>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const getWeekRangeString = () => {
    const start = new Date();
    const end = new Date();
    end.setUTCDate(start.getUTCDate() + 7);
    const options = { month: 'short', day: 'numeric', timeZone: 'UTC' };
    return `Matches: ${start.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', options)}`;
  };

  const isSameDate = (d1, d2) => 
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate();

  const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 6 || day === 0; // Saturday or Sunday
  };

  const loadMatches = useCallback(async (showToast = false) => {
    console.log('[HomePage] Fetching predictions from API...');
    try {
      const data = await fetchTodaysPredictions();
      console.log('[HomePage] Predictions loaded successfully. Count:', data?.length);
      setMatches(data || []);
      setError(null);
      if (showToast) toast.success(`${data?.length || 0} match${data?.length !== 1 ? 'es' : ''} loaded`);
    } catch (err) {
      console.error('[HomePage] Error loading predictions:', {
        message: err.message,
        stack: err.stack
      });
      setError(err.message || 'Network Error');
      if (showToast) toast.error('Could not load matches');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadMatches().finally(() => setLoading(false));
  }, [loadMatches]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshPredictions(); } catch { /* ignore */ }
    await loadMatches(true);
    setRefreshing(false);
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const liveCount = matches.filter(m => m.status?.toLowerCase() === 'live').length;
  const readyCount = matches.filter(m => m.prediction?.prediction_label).length;

  // ── Filter ─────────────────────────────────────────────────────────────────
  const getFilteredMatches = useCallback((tab) => {
    const todayDate = new Date();
    return matches.filter(m => {
      if (tab === 'all') return true;
      if (!m.match_date) return false;
      const mDate = new Date(m.match_date);
      
      if (tab === 'today') {
        return isSameDate(mDate, todayDate);
      }
      if (tab === 'tomorrow') {
        const tomorrow = new Date(todayDate);
        tomorrow.setUTCDate(todayDate.getUTCDate() + 1);
        return isSameDate(mDate, tomorrow);
      }
      if (tab === 'weekend') {
        return isWeekend(mDate);
      }
      return true;
    });
  }, [matches]);

  const filtered = getFilteredMatches(activeTab);

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = getFilteredMatches(t.key).length;
    return acc;
  }, {});

  const username = user?.username || user?.email?.split('@')[0] || 'Predictor';

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      <SplashScreen />
      {/* ── Hero header ─────────────────────────────────────────────────────── */}
      <div style={{
        paddingTop: 48, paddingBottom: 28,
        paddingLeft: 16, paddingRight: 16,
        background: 'linear-gradient(180deg, rgba(0,120,142,0.12) 0%, transparent 100%)',
        borderBottom: '1px solid var(--glass-border)',
        maxWidth: 720, margin: '0 auto',
      }}>
        {/* Greeting */}
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4, fontFamily: 'var(--font-inter, sans-serif)' }}>
          {getGreeting()}, <span style={{ color: '#00ACA9' }}>{username}</span>!
        </p>
        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.6rem, 5vw, 2.2rem)', fontWeight: 800,
          color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.15,
          fontFamily: 'var(--font-orbitron, "Noto Serif TC", serif)',
          letterSpacing: '-0.02em',
        }}>
          Weekly{' '}
          <span style={{
            background: 'linear-gradient(135deg, #4DD0D0, #00ACA9)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Predictions
          </span>
        </h1>
        {/* Date badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px', borderRadius: 999,
          background: 'rgba(0,172,169,0.08)',
          border: '1px solid rgba(0,172,169,0.2)',
          fontSize: '0.75rem', color: '#4DD0D0',
          marginBottom: 20, fontFamily: 'var(--font-inter, sans-serif)',
        }}>
          <Calendar size={12} />
          {getWeekRangeString()}
        </div>

        {/* SearchBar */}
        <SearchBar
          matches={matches}
          onResultClick={(match) => router.push('/match/' + match.id)}
          placeholder="Search teams or leagues…"
        />
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 0' }}>

        {/* ── Quick stats bar ── */}
        {!loading && (
          <div style={{
            display: 'flex', gap: 8, overflowX: 'auto',
            paddingBottom: 4, marginBottom: 20,
            scrollbarWidth: 'none',
          }}>
            <StatChip value={matches.length} label="matches" color="#00ACA9" />
            <StatChip value={liveCount} label="live now" color="#f87171" pulse={liveCount > 0} />
            <StatChip value={readyCount} label="predicted" color="#22c55e" />
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && matches.length > 0 && (
          <div style={{
            display: 'flex', gap: 6, overflowX: 'auto',
            marginBottom: 14, padding: '2px',
            scrollbarWidth: 'none',
          }}>
            {TABS.map(({ key, label }) => {
              const active = activeTab === key;
              const count = tabCounts[key];
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  style={{
                    flexShrink: 0,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '7px 16px', borderRadius: 999,
                    fontSize: '0.8rem', fontWeight: 600,
                    fontFamily: 'var(--font-inter, sans-serif)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: active ? 'linear-gradient(135deg, #00788E, #00ACA9)' : 'rgba(255,255,255,0.04)',
                    color: active ? '#fff' : '#666',
                    border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: active ? '0 2px 12px rgba(0,172,169,0.35)' : 'none',
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span style={{
                      fontSize: '0.65rem', padding: '1px 6px', borderRadius: 999,
                      background: active ? 'rgba(255,255,255,0.25)' : 'rgba(0,172,169,0.15)',
                      color: active ? '#fff' : '#4DD0D0',
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Match count badge ── */}
        {!loading && filtered.length > 0 && (
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 12, fontFamily: 'var(--font-inter, sans-serif)' }}>
            Showing <span style={{ color: '#00ACA9', fontWeight: 700 }}>{filtered.length}</span> of{' '}
            <span style={{ color: 'var(--text-primary)' }}>{matches.length}</span> matches
          </p>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="match-list stagger-children">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : error ? (
          <div style={{
            padding: 24, borderRadius: 16, textAlign: 'center',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}>
            <p style={{ color: '#f87171', fontSize: '0.875rem', marginBottom: 12 }}>{error}</p>
            <button className="btn-ghost" style={{ fontSize: '0.85rem', padding: '8px 18px' }}
              onClick={() => loadMatches(true)}>
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState onRefresh={handleRefresh} refreshing={refreshing} filtered={activeTab !== 'all'} />
        ) : (
          <div className="match-list stagger-children">
            {filtered.map(match => (
              <EnhancedMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {/* ── Mobile FAB ── */}
      <button
        onClick={handleRefresh}
        disabled={refreshing || loading}
        aria-label="Refresh predictions"
        className="md:hidden"
        style={{
          position: 'fixed', bottom: 88, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #00788E, #00ACA9)',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 4px 20px rgba(0,172,169,0.5), 0 2px 8px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s, opacity 0.2s',
          opacity: refreshing ? 0.7 : 1,
          zIndex: 40,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        <RefreshCw size={20} color="#fff" className={refreshing ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}
