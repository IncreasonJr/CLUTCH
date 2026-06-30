'use client';

import React from 'react';

// ── helpers ──────────────────────────────────────────────────────────────────

function factorial(n) {
  if (n <= 1) return 1;
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function poisson(k, lambda) {
  return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
}

function overProb(n, lambda) {
  let cumulative = 0;
  for (let k = 0; k <= n; k++) cumulative += poisson(k, lambda);
  return Math.max(0, Math.min(1, 1 - cumulative));
}

// ── styles ───────────────────────────────────────────────────────────────────

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
  icon: {
    fontSize: '1rem',
    color: '#00ACA9',
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '56px 1fr 48px',
    alignItems: 'center',
    gap: '8px',
  },
  rowLabel: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    whiteSpace: 'nowrap',
  },
  barTrack: {
    height: '6px',
    background: 'var(--glass-border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #00ACA9, #00D4D1)',
    borderRadius: '3px',
    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: '0 0 6px rgba(0,172,169,0.4)',
  }),
  pct: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    color: '#00ACA9',
    textAlign: 'right',
  },
  divider: {
    height: '1px',
    background: 'var(--glass-border)',
    margin: '14px 0',
  },
  bttsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    background: 'rgba(255,107,53,0.08)',
    borderRadius: '10px',
    padding: '10px 14px',
    border: '1px solid rgba(255,107,53,0.18)',
  },
  bttsLabel: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: 'var(--text-secondary)',
    letterSpacing: '0.02em',
  },
  bttsBadge: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '1rem',
    fontWeight: 800,
    color: '#FF6B35',
    letterSpacing: '0.04em',
  },
};

// ── component ─────────────────────────────────────────────────────────────────

export default function OverUnderDisplay({ homePob = 0.5, awayProb = 0.35 }) {
  const lambda_home = -Math.log(1 - homePob + 0.001) * 1.8;
  const lambda_away = -Math.log(1 - awayProb + 0.001) * 1.4;
  const lambda_total = lambda_home + lambda_away;

  const btts = (1 - Math.exp(-lambda_home)) * (1 - Math.exp(-lambda_away));

  const thresholds = [0.5, 1.5, 2.5, 3.5, 4.5];

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.icon}>📊</span>
        <h3 style={styles.title}>Goals Market</h3>
      </div>

      {/* Column headers */}
      <div style={{ ...styles.row, marginBottom: '6px' }}>
        <span style={{ ...styles.rowLabel, fontSize: '0.65rem', color: 'var(--text-muted)' }}>LINE</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textAlign: 'center' }}>PROBABILITY</span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textAlign: 'right' }}>OVER</span>
      </div>

      {/* Over/Under rows */}
      <div style={styles.grid}>
        {thresholds.map((n) => {
          const op = overProb(Math.floor(n), lambda_total);
          const pct = Math.round(op * 100);
          return (
            <div key={n} style={styles.row}>
              <span style={styles.rowLabel}>O {n}</span>
              <div style={styles.barTrack}>
                <div style={styles.barFill(pct)} />
              </div>
              <span style={styles.pct}>{pct}%</span>
            </div>
          );
        })}
      </div>

      <div style={styles.divider} />

      {/* BTTS */}
      <div style={styles.bttsRow}>
        <span style={styles.bttsLabel}>⚽ Both Teams to Score</span>
        <span style={styles.bttsBadge}>{Math.round(btts * 100)}%</span>
      </div>
    </div>
  );
}
