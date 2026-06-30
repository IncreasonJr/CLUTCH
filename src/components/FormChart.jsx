'use client';

import React from 'react';

// ── mock form generator ───────────────────────────────────────────────────────

function mockForm(name) {
  const outcomes = ['W', 'W', 'D', 'L', 'W', 'D', 'W', 'L', 'W', 'W'];
  let hash = 0;
  for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return Array.from({ length: 5 }, (_, i) => outcomes[(hash + i) % outcomes.length]);
}

// ── result config ─────────────────────────────────────────────────────────────

const RESULT_CONFIG = {
  W: { bg: '#00E676', label: 'W', glow: 'rgba(0,230,118,0.5)' },
  D: { bg: '#FFD93D', label: 'D', glow: 'rgba(255,217,61,0.5)' },
  L: { bg: '#FF1744', label: 'L', glow: 'rgba(255,23,68,0.5)' },
};

// ── styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2px',
  },
  teamName: {
    fontSize: '0.8rem',
    fontWeight: 700,
    color: 'rgba(255,255,255,0.8)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '140px',
    letterSpacing: '0.02em',
  },
  last5Label: {
    fontSize: '0.65rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.28)',
  },
  dotsRow: {
    display: 'flex',
    gap: '4px',
    alignItems: 'center',
  },
  dot: (cfg) => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    background: cfg.bg,
    boxShadow: `0 0 8px ${cfg.glow}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#ffffff',
    fontWeight: 800,
    fontSize: '0.7rem',
    flexShrink: 0,
    transition: 'transform 0.15s ease',
    cursor: 'default',
    userSelect: 'none',
  }),
};

// ── component ─────────────────────────────────────────────────────────────────

export default function FormChart({ teamName = 'Team', results }) {
  const form =
    Array.isArray(results) && results.length > 0
      ? results.slice(-5)
      : mockForm(teamName);

  return (
    <div style={styles.wrapper}>
      <div style={styles.metaRow}>
        <span style={styles.teamName} title={teamName}>{teamName}</span>
        <span style={styles.last5Label}>Last 5</span>
      </div>

      <div style={styles.dotsRow}>
        {form.map((result, i) => {
          const cfg = RESULT_CONFIG[result] ?? RESULT_CONFIG.D;
          return (
            <div
              key={i}
              style={styles.dot(cfg)}
              title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
            >
              {cfg.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
