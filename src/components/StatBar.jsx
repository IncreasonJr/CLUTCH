'use client';

import React from 'react';

// ── constants ─────────────────────────────────────────────────────────────────

const TURQUOISE = '#00ACA9';
const ORANGE = '#FF6B35';
const INACTIVE = 'rgba(255,255,255,0.12)';

// ── styles ───────────────────────────────────────────────────────────────────

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
  },
  labelRow: {
    textAlign: 'center',
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.4)',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    justifyContent: 'space-between',
  },
  value: (isWinner, color) => ({
    fontFamily: "'Courier New', Courier, monospace",
    fontSize: '0.85rem',
    fontWeight: 800,
    color: isWinner ? color : 'rgba(255,255,255,0.35)',
    minWidth: '44px',
    letterSpacing: '0.02em',
    flexShrink: 0,
  }),
  barWrapper: {
    flex: 1,
    height: '6px',
    borderRadius: '3px',
    display: 'flex',
    overflow: 'hidden',
  },
  homeHalf: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
  },
  awayHalf: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  homeFill: (pct, isWinner) => ({
    width: `${pct}%`,
    height: '100%',
    background: isWinner
      ? `linear-gradient(270deg, ${TURQUOISE}, #00D4D1)`
      : INACTIVE,
    boxShadow: isWinner ? `0 0 6px rgba(0,172,169,0.5)` : 'none',
    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
    borderRadius: '3px 0 0 3px',
  }),
  awayFill: (pct, isWinner) => ({
    width: `${pct}%`,
    height: '100%',
    background: isWinner
      ? `linear-gradient(90deg, ${ORANGE}, #FF8C5A)`
      : INACTIVE,
    boxShadow: isWinner ? `0 0 6px rgba(255,107,53,0.5)` : 'none',
    transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
    borderRadius: '0 3px 3px 0',
  }),
  teamRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1px',
  },
  teamName: (color) => ({
    fontSize: '0.6rem',
    fontWeight: 600,
    color,
    letterSpacing: '0.04em',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '45%',
    opacity: 0.7,
  }),
};

// ── component ─────────────────────────────────────────────────────────────────

export default function StatBar({
  homeValue = 50,
  awayValue = 50,
  label = 'Stat',
  homeTeam = 'Home',
  awayTeam = 'Away',
  unit = '',
  higherIsBetter = true,
}) {
  const total = homeValue + awayValue || 1;

  // Proportion for bar widths (0–100%)
  const homePct = (homeValue / total) * 100;
  const awayPct = (awayValue / total) * 100;

  // Determine winner
  const homeWins = higherIsBetter ? homeValue >= awayValue : homeValue <= awayValue;
  const awayWins = higherIsBetter ? awayValue > homeValue : awayValue < homeValue;

  return (
    <div style={styles.wrapper}>
      {/* Label */}
      <div style={styles.labelRow}>{label}</div>

      {/* Values + bar */}
      <div style={styles.valueRow}>
        {/* Home value */}
        <span style={styles.value(homeWins, TURQUOISE)}>
          {homeValue}{unit}
        </span>

        {/* Bar */}
        <div style={styles.barWrapper}>
          {/* Home half — fills right-to-left */}
          <div style={styles.homeHalf}>
            <div style={styles.homeFill(homePct, homeWins)} />
          </div>
          {/* 1px centre divider */}
          <div style={{ width: '2px', background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />
          {/* Away half — fills left-to-right */}
          <div style={styles.awayHalf}>
            <div style={styles.awayFill(awayPct, awayWins)} />
          </div>
        </div>

        {/* Away value */}
        <span style={{ ...styles.value(awayWins, ORANGE), textAlign: 'right' }}>
          {awayValue}{unit}
        </span>
      </div>

      {/* Team name hints */}
      <div style={styles.teamRow}>
        <span style={styles.teamName(TURQUOISE)} title={homeTeam}>{homeTeam}</span>
        <span style={{ ...styles.teamName(ORANGE), textAlign: 'right' }} title={awayTeam}>{awayTeam}</span>
      </div>
    </div>
  );
}
