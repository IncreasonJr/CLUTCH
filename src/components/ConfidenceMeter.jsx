'use client';
// ============================================
// FILE: src/components/ConfidenceMeter.jsx
// Animated horizontal confidence gauge
// ============================================

import { useEffect, useState } from 'react';

// ─── Derive color/gradient from value ────────────────────────────────────────
function getBarStyle(pct) {
  if (pct >= 80) return { background: '#00E676' };
  if (pct >= 60) return { background: 'linear-gradient(90deg, #FFD93D, #00ACA9)' };
  if (pct >= 40) return { background: 'linear-gradient(90deg, #FF6B35, #FFD93D)' };
  return { background: '#FF1744' };
}

// ─── Confidence level label + color ──────────────────────────────────────────
function getLevel(pct) {
  if (pct >= 80) return { label: 'Very High', color: '#00E676', key: 3 };
  if (pct >= 60) return { label: 'High',      color: '#00ACA9', key: 2 };
  if (pct >= 40) return { label: 'Medium',    color: '#FFD93D', key: 1 };
  return              { label: 'Low',         color: '#FF1744', key: 0 };
}

const LEVELS = [
  { label: 'Low',       thresholdKey: 0, color: '#FF1744' },
  { label: 'Medium',    thresholdKey: 1, color: '#FFD93D' },
  { label: 'High',      thresholdKey: 2, color: '#00ACA9' },
  { label: 'Very High', thresholdKey: 3, color: '#00E676' },
];

export default function ConfidenceMeter({ confidence = 0 }) {
  const pct     = Math.min(100, Math.max(0, Math.round(confidence)));
  const level   = getLevel(pct);
  const barFill = getBarStyle(pct);

  // Animate on mount: transition from 0 → pct
  const [displayPct, setDisplayPct] = useState(0);
  useEffect(() => {
    // Slight delay so transition is visible
    const timer = setTimeout(() => setDisplayPct(pct), 80);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div style={{ width: '100%', fontFamily: 'var(--font-inter, sans-serif)' }}>

      {/* ── Top: percentage label ── */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '0.9rem',
            fontWeight: 700,
            color: '#00ACA9',
            fontFamily: 'var(--font-jetbrains, monospace)',
            letterSpacing: '0.02em',
          }}
        >
          {pct}%
        </span>
      </div>

      {/* ── Bar track ── */}
      <div
        style={{
          width: '100%',
          height: '8px',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.1)',
          overflow: 'hidden',
          position: 'relative',
        }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Confidence: ${pct}%`}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${displayPct}%`,
            borderRadius: '4px',
            transition: 'width 0.65s cubic-bezier(0.4,0,0.2,1)',
            ...barFill,
          }}
        />
      </div>

      {/* ── Bottom: level labels ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
        }}
      >
        {LEVELS.map((l) => {
          const isActive = l.thresholdKey === level.key;
          return (
            <span
              key={l.label}
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 400,
                color: isActive ? l.color : 'rgba(255,255,255,0.28)',
                letterSpacing: '0.04em',
                transition: 'color 0.2s',
                textTransform: 'uppercase',
              }}
            >
              {l.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}
