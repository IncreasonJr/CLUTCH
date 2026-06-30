'use client';

import React from 'react';

// ── H2H record generator ──────────────────────────────────────────────────────

function h2hRecord(homeTeam, awayTeam) {
  let hash = 0;
  const combined = homeTeam + awayTeam;
  for (const c of combined) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  const total = 5;
  const homeWins = hash % 3;        // 0, 1, or 2
  const draws = (hash >> 4) % 2;   // 0 or 1
  const awayWins = Math.max(0, total - homeWins - draws);
  return { homeWins, draws, awayWins, total };
}

// ── styles ───────────────────────────────────────────────────────────────────

const TURQUOISE = '#00ACA9';
const GOLD = '#FFD93D';
const ORANGE = '#FF6B35';

const styles = {
  card: {
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '16px',
    border: '1px solid var(--glass-border)',
    padding: '20px',
    color: 'var(--text-primary)',
    transition: 'background var(--transition-base), border-color var(--transition-base), color var(--transition-base)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '18px',
  },
  title: {
    fontSize: '0.85rem',
    fontWeight: 700,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  subLabel: {
    fontSize: '0.7rem',
    color: 'var(--text-secondary)',
    letterSpacing: '0.04em',
    marginBottom: '14px',
    textAlign: 'center',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '8px',
    marginBottom: '16px',
  },
  statBox: (color) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 8px',
    borderRadius: '10px',
    background: `${color}11`,
    border: `1px solid ${color}33`,
  }),
  statNumber: (color) => ({
    fontSize: '1.8rem',
    fontWeight: 900,
    color,
    lineHeight: 1,
    letterSpacing: '-0.02em',
  }),
  statLabel: {
    fontSize: '0.65rem',
    fontWeight: 600,
    color: 'var(--text-muted)',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
  barContainer: {
    display: 'flex',
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden',
    gap: '2px',
    marginBottom: '12px',
  },
  barSegment: (flex, color) => ({
    flex,
    background: color,
    transition: 'flex 0.6s cubic-bezier(0.4,0,0.2,1)',
  }),
  teamLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  teamLabel: (color) => ({
    fontSize: '0.68rem',
    fontWeight: 700,
    color,
    letterSpacing: '0.03em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '45%',
  }),
  disclaimer: {
    fontSize: '0.6rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    letterSpacing: '0.02em',
    marginTop: '4px',
  },
};

// ── component ─────────────────────────────────────────────────────────────────

export default function HeadToHead({
  homeTeam = 'Home',
  awayTeam = 'Away',
  homeProb = 0.5,
  awayProb = 0.35,
  stats
}) {
  const h2h = stats || h2hRecord(homeTeam, awayTeam);
  const homeWins = h2h.homeWins ?? h2h.home_wins ?? 0;
  const draws = h2h.draws ?? h2h.draw_wins ?? 0;
  const awayWins = h2h.awayWins ?? h2h.away_wins ?? 0;
  const total = h2h.total ?? (homeWins + draws + awayWins);
  const safeTotal = total || 1;

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ fontSize: '1rem', color: TURQUOISE }}>⚔️</span>
        <h3 style={styles.title}>Head to Head</h3>
      </div>

      <p style={styles.subLabel}>Last {total} Meetings</p>

      {/* Stat boxes */}
      <div style={styles.statsRow}>
        <div style={styles.statBox(TURQUOISE)}>
          <span style={styles.statNumber(TURQUOISE)}>{homeWins}</span>
          <span style={styles.statLabel}>Home</span>
        </div>
        <div style={styles.statBox(GOLD)}>
          <span style={styles.statNumber(GOLD)}>{draws}</span>
          <span style={styles.statLabel}>Draw</span>
        </div>
        <div style={styles.statBox(ORANGE)}>
          <span style={styles.statNumber(ORANGE)}>{awayWins}</span>
          <span style={styles.statLabel}>Away</span>
        </div>
      </div>

      {/* Team labels above bar */}
      <div style={styles.teamLabels}>
        <span style={styles.teamLabel(TURQUOISE)} title={homeTeam}>{homeTeam}</span>
        <span style={styles.teamLabel(ORANGE)} title={awayTeam}>{awayTeam}</span>
      </div>

      {/* Segmented bar */}
      <div style={styles.barContainer}>
        <div
          style={styles.barSegment(
            homeWins / safeTotal,
            `linear-gradient(90deg, ${TURQUOISE}, #00D4D1)`
          )}
        />
        {draws > 0 && (
          <div style={styles.barSegment(draws / safeTotal, 'var(--text-muted)')} />
        )}
        <div
          style={styles.barSegment(
            awayWins / safeTotal,
            'rgba(255,107,53,0.7)'
          )}
        />
      </div>

      <p style={styles.disclaimer}>
        {stats ? '✓ Live SportScore historical records' : '* Historical data is estimated'}
      </p>
    </div>
  );
}
