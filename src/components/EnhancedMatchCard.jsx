'use client';
// ============================================
// FILE: src/components/EnhancedMatchCard.jsx
// Premium glassmorphism match card with
// probability bars and micro-animations
// ============================================

import { useRouter } from 'next/navigation';
import { Zap, Clock, CheckCircle, Activity } from 'lucide-react';
import { getTeamEmoji } from '../utils/teamHelper';

function TeamAvatarCircle({ name, side }) {
  const emoji = getTeamEmoji(name);
  const initial = (name?.[0] || '?').toUpperCase();
  const grad = side === 'home'
    ? 'linear-gradient(135deg, #00788E, #00ACA9)'
    : 'linear-gradient(135deg, #1a1a2e, #16213e)';
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: grad,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: emoji !== '⚽' ? '1.1rem' : '0.8rem', fontWeight: 800, color: '#fff',
      border: `1px solid ${side === 'home' ? 'rgba(0,172,169,0.3)' : 'rgba(255,255,255,0.08)'}`,
      flexShrink: 0,
      fontFamily: 'var(--font-orbitron, sans-serif)',
    }}>
      {emoji !== '⚽' ? emoji : initial}
    </div>
  );
}

// ── Status helpers ────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const s = status?.toLowerCase();
  if (s === 'live') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem',
        fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        background: 'rgba(239,68,68,0.18)', color: '#f87171',
        border: '1px solid rgba(239,68,68,0.4)',
        animation: 'pulse-red 2s infinite',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: '#f87171', display: 'inline-block',
          animation: 'pulse-red 1s infinite',
        }} />
        LIVE
      </span>
    );
  }
  if (s === 'finished') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem',
        fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
        background: 'rgba(0,172,169,0.15)', color: '#4DD0D0',
        border: '1px solid rgba(0,172,169,0.35)',
      }}>
        <CheckCircle size={10} />
        FT
      </span>
    );
  }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 10px', borderRadius: '999px', fontSize: '0.68rem',
      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      background: 'rgba(234,179,8,0.12)', color: '#fbbf24',
      border: '1px solid rgba(234,179,8,0.3)',
    }}>
      <Clock size={10} />
      UPCOMING
    </span>
  );
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  try {
    return new Date(dateStr).toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
  } catch { return '--:--'; }
}

// ── Probability bar ───────────────────────────────────────────────────────────
function ProbBar({ label, value, color, isHighlighted }) {
  const pct = value != null ? Math.round(value * 100) : 0;
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 4,
      }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter, sans-serif)' }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: isHighlighted ? color : 'var(--text-muted)',
          fontFamily: 'var(--font-jetbrains, monospace)',
        }}>
          {pct}%
        </span>
      </div>
      <div style={{
        height: 4, borderRadius: 2,
        background: 'rgba(255,255,255,0.06)',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          borderRadius: 2,
          background: isHighlighted
            ? `linear-gradient(90deg, ${color}aa, ${color})`
            : 'rgba(255,255,255,0.12)',
          transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: isHighlighted ? `0 0 8px ${color}66` : 'none',
        }} />
      </div>
    </div>
  );
}

// ── Confidence ring ───────────────────────────────────────────────────────────
function ConfidenceRing({ confidence }) {
  if (confidence == null) return null;
  const pct = confidence > 1 ? Math.round(confidence) : Math.round(confidence * 100);
  const color = pct >= 70 ? '#22c55e' : pct >= 50 ? '#FFD93D' : '#FF6B35';
  const circumference = 2 * Math.PI * 14;
  const strokeDash = (pct / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
      <svg width={40} height={40} viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={18} cy={18} r={14} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={3} />
        <circle
          cx={18} cy={18} r={14} fill="none"
          stroke={color} strokeWidth={3}
          strokeDasharray={`${strokeDash} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.6rem', fontWeight: 700,
        color, fontFamily: 'var(--font-jetbrains, monospace)',
      }}>
        {pct}%
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function EnhancedMatchCard({ match }) {
  const router = useRouter();

  const {
    id, home_team, away_team, match_date,
    status, home_score, away_score, league_code,
    prediction,
  } = match || {};

  const label      = prediction?.prediction_label || prediction?.prediction;
  const confidence = prediction?.confidence;
  const homePct    = prediction?.home_prob;
  const drawPct    = prediction?.draw_prob;
  const awayPct    = prediction?.away_prob;
  const isFinished = status?.toLowerCase() === 'finished';
  const isLive     = status?.toLowerCase() === 'live';

  // Determine which probability is the prediction
  const predKey = label === 'Home Win' ? 'home'
    : label === 'Away Win' ? 'away'
    : label === 'Draw' ? 'draw' : null;

  const labelColor = predKey === 'home' ? '#00ACA9'
    : predKey === 'away' ? '#FF6B35'
    : predKey === 'draw' ? '#FFD93D' : '#A0A0A0';

  const handleClick = () => { if (id) router.push(`/match/${id}`); };

  return (
    <div
      className="glass-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${home_team} vs ${away_team}`}
      style={{ padding: '16px', cursor: 'pointer' }}
    >
      {/* ── Top row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <StatusBadge status={status} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {league_code && (
            <span style={{
              fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4,
              background: 'rgba(0,172,169,0.1)', color: '#4DD0D0',
              fontFamily: 'var(--font-jetbrains, monospace)',
            }}>
              {league_code}
            </span>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-jetbrains, monospace)' }}>
            {formatTime(match_date)}
          </span>
        </div>
      </div>

      {/* ── Teams row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        {/* Home */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{
              fontWeight: 700, fontSize: '0.85rem',
              color: predKey === 'home' ? '#00ACA9' : 'var(--text-primary)',
              lineHeight: 1.2, transition: 'color 0.2s',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              {home_team || 'Home Team'}
            </p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>HOME</p>
          </div>
          <TeamAvatarCircle name={home_team} side="home" />
        </div>

        {/* Score / VS */}
        <div style={{ flexShrink: 0, textAlign: 'center' }}>
          {(isFinished || isLive) && home_score != null ? (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 14px', borderRadius: 10,
              background: 'rgba(0,172,169,0.1)',
              border: '1px solid rgba(0,172,169,0.2)',
            }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4DD0D0', fontFamily: 'var(--font-orbitron, monospace)' }}>
                {home_score}
              </span>
              <span style={{ color: 'var(--text-muted)', fontWeight: 300 }}>–</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#4DD0D0', fontFamily: 'var(--font-orbitron, monospace)' }}>
                {away_score}
              </span>
            </div>
          ) : (
            <div style={{
              padding: '6px 14px', borderRadius: 10, fontSize: '0.8rem',
              fontWeight: 600, color: 'var(--text-secondary)',
              background: 'var(--bg-card)',
              border: '1px solid var(--glass-border)',
              fontFamily: 'var(--font-jetbrains, monospace)',
            }}>
              VS
            </div>
          )}
        </div>

        {/* Away */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
          <TeamAvatarCircle name={away_team} side="away" />
          <div>
            <p style={{
              fontWeight: 700, fontSize: '0.85rem',
              color: predKey === 'away' ? '#FF6B35' : 'var(--text-primary)',
              lineHeight: 1.2, transition: 'color 0.2s',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              {away_team || 'Away Team'}
            </p>
            <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 2 }}>AWAY</p>
          </div>
        </div>
      </div>

      {/* ── Prediction section ── */}
      {label && (
        <div style={{
          borderTop: '1px solid var(--glass-border)',
          paddingTop: 12,
        }}>
          {/* Prediction label + confidence ring */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Zap size={12} color={labelColor} />
              <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontFamily: 'var(--font-inter, sans-serif)' }}>
                AI Prediction
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontSize: '0.8rem', fontWeight: 700,
                color: labelColor,
                padding: '3px 10px', borderRadius: 6,
                background: `${labelColor}18`,
                border: `1px solid ${labelColor}33`,
                fontFamily: 'var(--font-inter, sans-serif)',
              }}>
                {label}
              </span>
              <ConfidenceRing confidence={confidence} />
            </div>
          </div>

          {/* Probability bars */}
          {(homePct != null || drawPct != null || awayPct != null) && (
            <div style={{ display: 'flex', gap: 10 }}>
              <ProbBar label="Home" value={homePct} color="#00ACA9" isHighlighted={predKey === 'home'} />
              <ProbBar label="Draw" value={drawPct} color="#FFD93D" isHighlighted={predKey === 'draw'} />
              <ProbBar label="Away" value={awayPct} color="#FF6B35" isHighlighted={predKey === 'away'} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
