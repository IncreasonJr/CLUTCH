'use client';
// ============================================
// FILE: src/app/match/[id]/page.jsx
// Comprehensive match detail with full stats
// ============================================

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { fetchMatchPrediction } from '../../../services/api';
import { getTeamEmoji } from '../../../utils/teamHelper';
import ConfidenceMeter   from '../../../components/ConfidenceMeter';
import OverUnderDisplay  from '../../../components/OverUnderDisplay';
import ScorePredictor    from '../../../components/ScorePredictor';
import FormChart         from '../../../components/FormChart';
import HeadToHead        from '../../../components/HeadToHead';
import LoadingSpinner    from '../../../components/LoadingSpinner';
import {
  ArrowLeft, Calendar, Clock, Shield, ChevronDown, ChevronUp,
  TrendingUp, Target, BarChart2, Activity
} from 'lucide-react';

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatDateTime(dateStr) {
  if (!dateStr) return 'TBD';
  try {
    return new Date(dateStr).toLocaleString('en-GH', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return dateStr; }
}

function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  if (s === 'live') return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 12px', borderRadius: 9999,
      background: 'rgba(255,23,68,0.15)', color: '#FF1744',
      border: '1px solid rgba(255,23,68,0.4)',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: '#FF1744', animation: 'pulse-red 1.5s infinite',
      }} />
      LIVE
    </span>
  );
  if (s === 'finished') return (
    <span style={{
      padding: '4px 12px', borderRadius: 9999,
      background: 'rgba(0,172,169,0.12)', color: '#4DD0D0',
      border: '1px solid rgba(0,172,169,0.3)',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>FULL TIME</span>
  );
  return (
    <span style={{
      padding: '4px 12px', borderRadius: 9999,
      background: 'rgba(255,217,61,0.1)', color: '#FFD93D',
      border: '1px solid rgba(255,217,61,0.3)',
      fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
      textTransform: 'uppercase',
    }}>UPCOMING</span>
  );
}

function PredictionLabel({ label }) {
  const colors = {
    'Home Win': { bg: 'rgba(0,172,169,0.15)', color: '#4DD0D0', border: 'rgba(0,172,169,0.4)' },
    'Draw':     { bg: 'rgba(255,217,61,0.12)', color: '#FFD93D', border: 'rgba(255,217,61,0.4)' },
    'Away Win': { bg: 'rgba(255,107,53,0.12)', color: '#FF6B35', border: 'rgba(255,107,53,0.4)' },
  };
  const c = colors[label] || colors['Draw'];
  return (
    <span style={{
      padding: '6px 16px', borderRadius: 9999,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.04em',
    }}>
      {label}
    </span>
  );
}

// ── Section Accordion ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, defaultOpen = true, children, accentColor = '#00ACA9' }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 20,
      marginBottom: 16,
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          padding: '18px 22px', background: 'none', border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `${accentColor}18`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {Icon && <Icon size={16} style={{ color: accentColor }} />}
          </div>
          <span style={{
            color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.95rem',
            fontFamily: 'var(--font-poppins, sans-serif)',
          }}>{title}</span>
        </div>
        {open
          ? <ChevronUp size={18} style={{ color: 'var(--text-muted)' }} />
          : <ChevronDown size={18} style={{ color: 'var(--text-muted)' }} />
        }
      </button>
      {open && (
        <div style={{ padding: '4px 22px 22px' }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── Prob Bar ───────────────────────────────────────────────────────────────────

function ProbRow({ label, value, color }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{label}</span>
        <span style={{
          color, fontWeight: 700, fontSize: '0.9rem',
          fontFamily: 'var(--font-jetbrains, monospace)',
        }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: 'var(--glass-border)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 4,
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

// ── Team Avatar ────────────────────────────────────────────────────────────────

function TeamAvatar({ name, side }) {
  const emoji = getTeamEmoji(name);
  const initial = (name?.[0] || '?').toUpperCase();
  const grad = side === 'home'
    ? 'linear-gradient(135deg, #00788E, #00ACA9)'
    : 'linear-gradient(135deg, #1a1a2e, #16213e)';
  return (
    <div style={{
      width: 64, height: 64, borderRadius: 18,
      background: grad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: emoji !== '⚽' ? '2rem' : '1.5rem', fontWeight: 800, color: '#fff',
      border: `2px solid ${side === 'home' ? 'rgba(0,172,169,0.5)' : 'rgba(255,255,255,0.1)'}`,
      boxShadow: side === 'home' ? '0 0 20px rgba(0,172,169,0.3)' : 'none',
      fontFamily: 'var(--font-orbitron, sans-serif)',
    }}>
      {emoji !== '⚽' ? emoji : initial}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MatchDetailPage() {
  const { id }   = useParams();
  const router   = useRouter();
  const { user } = useAuth();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    fetchMatchPrediction(id)
      .then(res => {
        const pred = res?.data || {};
        const match = pred.matches || {};
        const labelMap = { home_win: 'Home Win', draw: 'Draw', away_win: 'Away Win' };
        
        setData({
          id:          pred.match_id || match.id,
          home_team:   match.home_team,
          away_team:   match.away_team,
          match_date:  match.match_date,
          status:      match.status,
          home_score:  match.home_score,
          away_score:  match.away_score,
          league_code: match.league_code,
          stats:       match.stats,
          prediction: {
            prediction_label: labelMap[pred.prediction] || pred.prediction,
            confidence:       pred.confidence,
            home_prob:        pred.home_probability,
            draw_prob:        pred.draw_probability,
            away_prob:        pred.away_probability,
          }
        });
      })
      .catch(err => {
        setError(err.message);
        toast.error('Could not load match');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)',
    }}>
      <LoadingSpinner size="lg" text="Loading match..." />
    </div>
  );

  if (error || !data) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', padding: '24px 16px' }}>
      <button onClick={() => router.back()} style={{
        display: 'flex', alignItems: 'center', gap: 8,
        color: 'var(--text-secondary)', background: 'none', border: 'none',
        cursor: 'pointer', marginBottom: 24, fontSize: '0.9rem',
      }}>
        <ArrowLeft size={16} /> Back
      </button>
      <div style={{
        background: 'rgba(255,23,68,0.08)', border: '1px solid rgba(255,23,68,0.2)',
        borderRadius: 16, padding: 32, textAlign: 'center',
      }}>
        <p style={{ color: '#FF6B6B' }}>{error || 'Match not found'}</p>
        <button className="btn-ghost" style={{ marginTop: 16 }} onClick={() => router.back()}>
          Go Back
        </button>
      </div>
    </div>
  );

  const pred       = data.prediction || {};
  const label      = pred.prediction_label || pred.prediction;
  const confidence = pred.confidence ?? 0;
  const homeProb   = pred.home_prob   ?? pred.home_probability   ?? 0.33;
  const drawProb   = pred.draw_prob   ?? pred.draw_probability   ?? 0.33;
  const awayProb   = pred.away_prob   ?? pred.away_probability   ?? 0.34;
  const isFinished = data.status?.toLowerCase() === 'finished';
  const isLive     = data.status?.toLowerCase() === 'live';

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-base)',
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%, rgba(0,120,142,0.12) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(0,172,169,0.06) 0%, transparent 50%)
      `,
    }}>
      {/* Back Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'var(--bg-surface)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '14px 20px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <button onClick={() => router.back()} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--text-secondary)', background: 'none', border: 'none',
          cursor: 'pointer', fontSize: '0.9rem',
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={18} /> Back
        </button>
        <span style={{ color: 'var(--text-muted)' }}>·</span>
        <span style={{
          color: 'var(--text-secondary)', fontSize: '0.85rem',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {data.home_team} vs {data.away_team}
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* ── MATCH HEADER CARD ─────────────────────────────────────── */}
        <div style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--glass-border)',
          borderRadius: 24, padding: '28px 24px', marginBottom: 16,
        }}>
          {/* League + Status row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', marginBottom: 28,
            flexWrap: 'wrap', gap: 8,
          }}>
            {data.league_code && (
              <span style={{
                padding: '4px 14px', borderRadius: 9999,
                background: 'rgba(0,172,169,0.1)', color: '#4DD0D0',
                border: '1px solid rgba(0,172,169,0.25)',
                fontSize: '0.78rem', fontWeight: 600, letterSpacing: '0.04em',
                fontFamily: 'var(--font-poppins, sans-serif)',
                maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {data.league_code}
              </span>
            )}
            <StatusBadge status={data.status} />
          </div>

          {/* Teams */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', gap: 16,
          }}>
            {/* Home team */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <TeamAvatar name={data.home_team} side="home" />
              <p style={{
                marginTop: 10, fontWeight: 700, fontSize: '1rem',
                color: 'var(--text-primary)', lineHeight: 1.3,
                fontFamily: 'var(--font-poppins, sans-serif)',
              }}>
                {data.home_team}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>HOME</p>
            </div>

            {/* Score or VS */}
            <div style={{ textAlign: 'center', flexShrink: 0 }}>
              {(isFinished || isLive) && data.home_score != null ? (
                <div>
                  <div style={{
                    fontFamily: 'var(--font-jetbrains, monospace)',
                    fontSize: '2.5rem', fontWeight: 700,
                    color: 'var(--text-primary)', letterSpacing: '0.08em',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: 16, padding: '10px 20px',
                  }}>
                    {data.home_score} <span style={{ color: 'var(--text-muted)' }}>–</span> {data.away_score}
                  </div>
                  {isLive && (
                    <p style={{
                      color: '#FF1744', fontSize: '0.75rem', fontWeight: 700,
                      marginTop: 6, animation: 'pulse-red 1.5s infinite',
                      letterSpacing: '0.1em',
                    }}>● LIVE</p>
                  )}
                </div>
              ) : (
                <div style={{
                  fontFamily: 'var(--font-orbitron, sans-serif)',
                  color: 'var(--text-muted)', fontSize: '1.5rem', fontWeight: 700,
                  padding: '10px 16px',
                }}>VS</div>
              )}
            </div>

            {/* Away team */}
            <div style={{ flex: 1, textAlign: 'center' }}>
              <TeamAvatar name={data.away_team} side="away" />
              <p style={{
                marginTop: 10, fontWeight: 700, fontSize: '1rem',
                color: 'var(--text-primary)', lineHeight: 1.3,
                fontFamily: 'var(--font-poppins, sans-serif)',
              }}>
                {data.away_team}
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>AWAY</p>
            </div>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginTop: 24, paddingTop: 20,
            borderTop: '1px solid var(--glass-border)',
          }}>
            <Calendar size={14} style={{ color: 'var(--text-muted)' }} />
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              {formatDateTime(data.match_date)}
            </span>
          </div>
        </div>

        {/* ── PREDICTION CARD ───────────────────────────────────────── */}
        {label && (
          <Section title="AI Prediction" icon={Target} defaultOpen={true} accentColor="#00ACA9">
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: 20,
              flexWrap: 'wrap', gap: 12,
            }}>
              <div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 8 }}>
                  PREDICTED OUTCOME
                </p>
                <PredictionLabel label={label} />
              </div>
              {confidence > 0 && (
                <div style={{ textAlign: 'right' }}>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 4 }}>
                    CONFIDENCE
                  </p>
                  <span style={{
                    fontFamily: 'var(--font-jetbrains, monospace)',
                    fontSize: '2rem', fontWeight: 700, color: '#00ACA9',
                  }}>
                    {confidence}%
                  </span>
                </div>
              )}
            </div>
            {confidence > 0 && (
              <div style={{ marginTop: 8 }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 10, letterSpacing: '0.08em' }}>
                  CONFIDENCE LEVEL
                </p>
                <ConfidenceMeter confidence={confidence} />
              </div>
            )}

            {/* Prediction rationale */}
            <div style={{
              marginTop: 18, padding: 14, borderRadius: 12,
              background: 'rgba(0,172,169,0.06)',
              border: '1px solid rgba(0,172,169,0.15)',
            }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <Shield size={16} style={{ color: '#00ACA9', flexShrink: 0, marginTop: 2 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', lineHeight: 1.6 }}>
                  {label === 'Home Win'
                    ? `${data.home_team} are favoured with a ${Math.round(homeProb * 100)}% win probability based on current form and historical data.`
                    : label === 'Away Win'
                    ? `${data.away_team} are expected to win with a ${Math.round(awayProb * 100)}% probability. Away form has been strong.`
                    : `This match is closely contested. A draw is predicted with ${Math.round(drawProb * 100)}% probability, suggesting evenly matched teams.`
                  }
                </p>
              </div>
            </div>
          </Section>
        )}

        {/* ── WIN PROBABILITIES ─────────────────────────────────────── */}
        <Section title="Win Probability" icon={BarChart2} defaultOpen={true} accentColor="#4DD0D0">
          <ProbRow label={`${data.home_team} Win`} value={homeProb} color="#00ACA9" />
          <ProbRow label="Draw"                    value={drawProb} color="#FFD93D" />
          <ProbRow label={`${data.away_team} Win`} value={awayProb} color="#FF6B35" />
        </Section>

        {/* ── GOALS MARKET (Over/Under) ─────────────────────────────── */}
        <Section title="Goals Market" icon={TrendingUp} defaultOpen={true} accentColor="#FF6B35">
          <OverUnderDisplay homeProb={homeProb} awayProb={awayProb} />
        </Section>

        {/* ── CORRECT SCORE ─────────────────────────────────────────── */}
        <Section title="Correct Score Predictions" icon={Target} defaultOpen={false} accentColor="#FFD93D">
          <ScorePredictor homeProb={homeProb} awayProb={awayProb} />
        </Section>

        {/* ── TEAM FORM ─────────────────────────────────────────────── */}
        <Section title="Team Form" icon={Activity} defaultOpen={false} accentColor="#00E676">
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
          }}>
            <FormChart teamName={data.home_team} results={data.stats?.home_form} />
            <FormChart teamName={data.away_team} results={data.stats?.away_form} />
          </div>
        </Section>

        {/* ── HEAD TO HEAD ─────────────────────────────────────────── */}
        <Section title="Head to Head" icon={BarChart2} defaultOpen={false} accentColor="#FF6B35">
          <HeadToHead
            homeTeam={data.home_team}
            awayTeam={data.away_team}
            homeProb={homeProb}
            awayProb={awayProb}
            stats={data.stats?.h2h}
          />
        </Section>

        {/* ── DISCLAIMER ───────────────────────────────────────────── */}
        <p style={{
          textAlign: 'center', color: 'var(--text-muted)',
          fontSize: '0.72rem', marginTop: 8,
          fontFamily: 'var(--font-inter, sans-serif)',
        }}>
          Predictions are for entertainment purposes only. Not betting advice.
        </p>
      </div>
    </div>
  );
}
