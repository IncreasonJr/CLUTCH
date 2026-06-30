'use client';
// ============================================
// FILE: src/components/MatchCard.jsx
// Glassmorphism card for a single match
// ============================================

import { useRouter }      from 'next/navigation';
import PredictionBadge    from './PredictionBadge';

function StatusBadge({ status }) {
  const map = {
    live:     { label: '● LIVE',     cls: 'badge badge-live' },
    pending:  { label: '○ PENDING',  cls: 'badge badge-pending' },
    finished: { label: '✓ FT',       cls: 'badge badge-finished' },
  };
  const s = map[status?.toLowerCase()] || map.pending;
  return <span className={s.cls}>{s.label}</span>;
}

function formatTime(dateStr) {
  if (!dateStr) return '--:--';
  try {
    return new Date(dateStr).toLocaleTimeString('en-GH', {
      hour:   '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '--:--';
  }
}

export default function MatchCard({ match }) {
  const router = useRouter();

  const {
    id,
    home_team,
    away_team,
    match_date,
    status,
    home_score,
    away_score,
    prediction,        // { prediction_label, confidence, home_prob, draw_prob, away_prob }
    league_code,
  } = match || {};

  const label      = prediction?.prediction_label || prediction?.prediction;
  const confidence = prediction?.confidence != null ? Math.round(prediction.confidence * 100) : null;
  const isFinished = status?.toLowerCase() === 'finished';
  const isLive     = status?.toLowerCase() === 'live';

  const handleClick = () => {
    if (id) router.push(`/match/${id}`);
  };

  return (
    <div
      className="glass-card animate-fadeIn"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`${home_team} vs ${away_team}`}
    >
      {/* Top row: status + league + time */}
      <div className="flex items-center justify-between mb-3">
        <StatusBadge status={status} />
        <div className="flex items-center gap-2 text-xs" style={{ color: '#666' }}>
          {league_code && (
            <span className="px-2 py-0.5 rounded" style={{ background: 'rgba(0,172,169,0.1)', color: '#4DD0D0' }}>
              {league_code}
            </span>
          )}
          <span>{formatTime(match_date)}</span>
        </div>
      </div>

      {/* Teams row */}
      <div className="flex items-center justify-between gap-3 my-4">
        {/* Home team */}
        <div className="flex-1 text-right">
          <p className="font-semibold text-sm leading-tight" style={{ color: '#F2F2F2' }}>
            {home_team || 'Home Team'}
          </p>
          {isFinished && (
            <span className="text-xs mt-0.5" style={{ color: '#A0A0A0' }}>Home</span>
          )}
        </div>

        {/* Score or VS */}
        <div className="flex-shrink-0 text-center">
          {(isFinished || isLive) && home_score != null ? (
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ background: 'rgba(0,172,169,0.12)', border: '1px solid rgba(0,172,169,0.25)' }}
            >
              <span className="text-xl font-bold" style={{ color: '#4DD0D0' }}>{home_score}</span>
              <span style={{ color: '#666' }}>-</span>
              <span className="text-xl font-bold" style={{ color: '#4DD0D0' }}>{away_score}</span>
            </div>
          ) : (
            <div
              className="px-3 py-1.5 rounded-lg text-sm font-medium"
              style={{ background: 'rgba(40,40,40,0.6)', color: '#666', border: '1px solid rgba(60,60,60,0.5)' }}
            >
              VS
            </div>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 text-left">
          <p className="font-semibold text-sm leading-tight" style={{ color: '#F2F2F2' }}>
            {away_team || 'Away Team'}
          </p>
          {isFinished && (
            <span className="text-xs mt-0.5" style={{ color: '#A0A0A0' }}>Away</span>
          )}
        </div>
      </div>

      {/* Prediction badge */}
      {label && (
        <div className="flex items-center justify-between mt-3 pt-3"
             style={{ borderTop: '1px solid rgba(0,172,169,0.12)' }}>
          <span className="text-xs" style={{ color: '#666' }}>AI Prediction</span>
          <PredictionBadge prediction={label} confidence={confidence} />
        </div>
      )}
    </div>
  );
}
