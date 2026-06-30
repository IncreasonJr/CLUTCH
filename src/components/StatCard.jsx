'use client';
// ============================================
// FILE: src/components/StatCard.jsx
// Reusable stat display card with trend arrow,
// glassmorphism, and icon circle
// ============================================

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// ─── Trend indicator ──────────────────────────────────────────────────────────
function TrendIcon({ trend }) {
  if (trend === 'up')   return <TrendingUp  size={14} color="#00E676" strokeWidth={2.5} />;
  if (trend === 'down') return <TrendingDown size={14} color="#FF1744" strokeWidth={2.5} />;
  if (trend === 'flat') return <Minus        size={14} color="rgba(255,255,255,0.35)" strokeWidth={2.5} />;
  return null;
}

export default function StatCard({ icon: Icon, label, value, trend, color = '#00ACA9', subtitle }) {
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: hovered
      ? '1px solid rgba(0,172,169,0.2)'
      : '1px solid rgba(255,255,255,0.06)',
    borderRadius: '14px',
    padding: '16px',
    transition: 'border 0.2s, box-shadow 0.2s, transform 0.2s',
    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: hovered
      ? '0 6px 24px rgba(0,0,0,0.25)'
      : '0 2px 8px rgba(0,0,0,0.15)',
    fontFamily: 'var(--font-inter, sans-serif)',
  };

  const iconBgStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: `${color}26`,   // color at ~15% opacity
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginBottom: '12px',
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* ── Icon circle ── */}
      {Icon && (
        <div style={iconBgStyle}>
          <Icon size={20} color={color} strokeWidth={2} />
        </div>
      )}

      {/* ── Label ── */}
      <div
        style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'rgba(255,255,255,0.5)',
          fontWeight: 500,
          marginBottom: '4px',
        }}
      >
        {label}
      </div>

      {/* ── Value + Trend ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
        <span
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: color,
            fontFamily: 'var(--font-jetbrains, monospace)',
            lineHeight: 1.1,
          }}
        >
          {value ?? '—'}
        </span>
        {trend && <TrendIcon trend={trend} />}
      </div>

      {/* ── Subtitle ── */}
      {subtitle && (
        <div
          style={{
            fontSize: '0.7rem',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '2px',
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
