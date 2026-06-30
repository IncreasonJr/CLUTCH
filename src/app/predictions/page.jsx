'use client';
// ============================================
// FILE: src/app/predictions/page.jsx
// All predictions — status tabs + league filter
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { fetchTodaysPredictions } from '../../services/api';
import EnhancedMatchCard from '../../components/EnhancedMatchCard';
import SearchBar from '../../components/SearchBar';
import { BarChart2, Filter, ChevronDown } from 'lucide-react';


// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(26,26,26,0.65)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 16,
      display: 'flex', flexDirection: 'column', gap: 12,
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

// ── Tabs config ───────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',      label: 'All' },
  { key: 'live',     label: 'Live' },
  { key: 'pending',  label: 'Upcoming' },
  { key: 'finished', label: 'Finished' },
];

// ── League dropdown ───────────────────────────────────────────────────────────
function LeagueDropdown({ leagues, value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '7px 14px', borderRadius: 999, cursor: 'pointer',
          background: value !== 'all' ? 'rgba(0,172,169,0.15)' : 'rgba(255,255,255,0.04)',
          border: value !== 'all' ? '1px solid rgba(0,172,169,0.4)' : '1px solid rgba(255,255,255,0.08)',
          color: value !== 'all' ? '#4DD0D0' : '#666',
          fontSize: '0.8rem', fontWeight: 600,
          fontFamily: 'var(--font-inter, sans-serif)',
          transition: 'all 0.2s',
        }}
      >
        <Filter size={12} />
        {value === 'all' ? 'All Leagues' : value}
        <ChevronDown size={12} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <>
          <div
            style={{ position: 'fixed', inset: 0, zIndex: 39 }}
            onClick={() => setOpen(false)}
          />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', right: 0,
            background: 'rgba(17,17,17,0.95)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
            overflow: 'hidden', zIndex: 40, minWidth: 160,
            boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          }}>
            {['all', ...leagues].map((lg, i) => (
              <button
                key={lg}
                onClick={() => { onChange(lg); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  padding: '10px 16px', cursor: 'pointer',
                  background: value === lg ? 'rgba(0,172,169,0.12)' : 'transparent',
                  color: value === lg ? '#4DD0D0' : '#A0A0A0',
                  fontSize: '0.85rem', fontFamily: 'var(--font-inter, sans-serif)',
                  borderBottom: i < leagues.length ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  border: 'none', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (value !== lg) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (value !== lg) e.currentTarget.style.background = 'transparent'; }}
              >
                {lg === 'all' ? '🌐 All Leagues' : lg}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function PredictionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [league, setLeague] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    console.log('[PredictionsPage] Fetching predictions...');
    fetchTodaysPredictions()
      .then(data => {
        console.log('[PredictionsPage] Predictions loaded successfully. Count:', data?.length);
        setMatches(data || []);
      })
      .catch(err => {
        console.error('[PredictionsPage] Error loading predictions:', {
          message: err.message,
          stack: err.stack
        });
        toast.error(err.message || 'Failed to load predictions');
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const leagues = [...new Set(matches.map(m => m.league_code).filter(Boolean))].sort();

  const tabCounts = TABS.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? matches.length
      : matches.filter(m => m.status?.toLowerCase() === t.key).length;
    return acc;
  }, {});

  const filtered = matches
    .filter(m => tab === 'all' || m.status?.toLowerCase() === tab)
    .filter(m => league === 'all' || m.league_code === league)
    .filter(m => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return m.home_team?.toLowerCase().includes(q) ||
        m.away_team?.toLowerCase().includes(q) ||
        m.league_code?.toLowerCase().includes(q);
    });

  return (
    <div className="min-h-screen page-content" style={{ background: 'var(--bg-base)' }}>
      {/* ── Header ── */}
      <div style={{
        padding: '48px 16px 24px',
        background: 'linear-gradient(180deg, rgba(0,120,142,0.1) 0%, transparent 100%)',
        borderBottom: '1px solid var(--glass-border)',
        maxWidth: 720, margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <BarChart2 size={18} color="#00ACA9" />
              <h1 style={{
                fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)',
                fontFamily: 'var(--font-orbitron, "Noto Serif TC", serif)',
                letterSpacing: '-0.02em',
              }}>
                All Predictions
              </h1>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter, sans-serif)' }}>
              Today's AI predictions ·{' '}
              <span style={{ color: '#00ACA9', fontWeight: 700 }}>{matches.length}</span> fixtures
            </p>
          </div>
        </div>

        {/* SearchBar */}
        <SearchBar
          matches={matches}
          onSearch={setSearchQuery}
          onResultClick={(match) => router.push('/match/' + match.id)}
          placeholder="Search teams, leagues…"
        />
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 0' }}>

        {/* ── Filter row: tabs + league dropdown ── */}
        {!loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
            {/* Status tabs */}
            <div style={{ display: 'flex', gap: 5, overflowX: 'auto', scrollbarWidth: 'none', flex: 1 }}>
              {TABS.map(({ key, label }) => {
                const active = tab === key;
                const count = tabCounts[key];
                return (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    style={{
                      flexShrink: 0,
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '6px 14px', borderRadius: 999,
                      fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      fontFamily: 'var(--font-inter, sans-serif)',
                      transition: 'all 0.2s',
                      background: active ? 'linear-gradient(135deg, #00788E, #00ACA9)' : 'rgba(255,255,255,0.04)',
                      color: active ? '#fff' : '#555',
                      border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: active ? '0 2px 12px rgba(0,172,169,0.35)' : 'none',
                    }}
                  >
                    {label}
                    {count > 0 && (
                      <span style={{
                        fontSize: '0.62rem', padding: '1px 5px', borderRadius: 999,
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

            {/* League dropdown */}
            {leagues.length > 0 && (
              <LeagueDropdown leagues={leagues} value={league} onChange={setLeague} />
            )}
          </div>
        )}

        {/* ── Match count ── */}
        {!loading && filtered.length > 0 && (
          <p style={{ fontSize: '0.73rem', color: 'var(--text-secondary)', marginBottom: 12, fontFamily: 'var(--font-inter, sans-serif)' }}>
            Showing <span style={{ color: '#00ACA9', fontWeight: 700 }}>{filtered.length}</span> of{' '}
            <span style={{ color: 'var(--text-primary)' }}>{matches.length}</span> matches
          </p>
        )}

        {/* ── Content ── */}
        {loading ? (
          <div className="match-list stagger-children">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', padding: '48px 24px',
            background: 'var(--bg-card)', border: '1px solid var(--glass-border)',
            borderRadius: 20,
          }}>
            <Filter size={28} color="var(--text-muted)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontFamily: 'var(--font-inter, sans-serif)' }}>
              No {tab !== 'all' ? tab : ''} predictions{league !== 'all' ? ` in ${league}` : ''} found
            </p>
          </div>
        ) : (
          <div className="match-list stagger-children">
            {filtered.map(match => (
              <EnhancedMatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
