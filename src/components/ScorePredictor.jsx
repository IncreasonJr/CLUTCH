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

function scoreProb(h, a, lh, la) {
  return poisson(h, lh) * poisson(a, la);
}

// ── styles ───────────────────────────────────────────────────────────────────

const TURQUOISE = '#00ACA9';
const GLASS_BG = 'rgba(255,255,255,0.04)';

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
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  itemBase: {
    display: 'grid',
    gridTemplateColumns: '20px 64px 1fr 52px',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'var(--bg-card)',
    border: '1px solid var(--glass-border)',
    transition: 'border-color var(--transition-base), background var(--transition-base)',
  },
  itemTop: {
    background: 'rgba(0,172,169,0.07)',
    border: `1px solid rgba(0,172,169,0.35)`,
    boxShadow: '0 0 16px rgba(0,172,169,0.12), inset 0 0 8px rgba(0,172,169,0.05)',
  },
  rank: {
    fontSize: '0.7rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    textAlign: 'center',
  },
  rankTop: {
    color: TURQUOISE,
  },
  score: {
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '1.15rem',
    fontWeight: 900,
    color: 'var(--text-secondary)',
    letterSpacing: '0.05em',
    textAlign: 'center',
  },
  scoreTop: {
    color: TURQUOISE,
    textShadow: `0 0 12px rgba(0,172,169,0.5)`,
  },
  barTrack: {
    height: '5px',
    background: 'var(--glass-border)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  barFill: (pct, isTop) => ({
    height: '100%',
    width: `${Math.min(100, pct)}%`,
    background: isTop
      ? `linear-gradient(90deg, ${TURQUOISE}, #00D4D1)`
      : 'var(--text-muted)',
    borderRadius: '3px',
    transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)',
    boxShadow: isTop ? '0 0 6px rgba(0,172,169,0.45)' : 'none',
  }),
  pct: (isTop) => ({
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.75rem',
    fontWeight: 700,
    color: isTop ? TURQUOISE : 'var(--text-secondary)',
    textAlign: 'right',
  }),
};

// ── component ─────────────────────────────────────────────────────────────────

export default function ScorePredictor({ homeProb = 0.5, awayProb = 0.35 }) {
  const lambda_home = -Math.log(1 - homeProb + 0.001) * 1.8;
  const lambda_away = -Math.log(1 - awayProb + 0.001) * 1.4;

  const all = [];
  for (let h = 0; h <= 5; h++) {
    for (let a = 0; a <= 5; a++) {
      all.push({ h, a, prob: scoreProb(h, a, lambda_home, lambda_away) });
    }
  }
  const top5 = all.sort((a, b) => b.prob - a.prob).slice(0, 5);
  const maxProb = top5[0]?.prob ?? 0.01;

  return (
    <div style={styles.card}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ fontSize: '1rem', color: TURQUOISE }}>🎯</span>
        <h3 style={styles.title}>Correct Score</h3>
      </div>

      {/* Score list */}
      <div style={styles.list}>
        {top5.map(({ h, a, prob }, idx) => {
          const isTop = idx === 0;
          // scale bar: top score = 100%, rest proportional × 5 cap
          const barPct = Math.min(100, (prob / maxProb) * 100);
          const displayPct = (prob * 100).toFixed(1);

          return (
            <div
              key={`${h}-${a}`}
              style={{ ...styles.itemBase, ...(isTop ? styles.itemTop : {}) }}
            >
              <span style={{ ...styles.rank, ...(isTop ? styles.rankTop : {}) }}>
                {idx + 1}
              </span>
              <span style={{ ...styles.score, ...(isTop ? styles.scoreTop : {}) }}>
                {h}–{a}
              </span>
              <div style={styles.barTrack}>
                <div style={styles.barFill(barPct, isTop)} />
              </div>
              <span style={styles.pct(isTop)}>{displayPct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
