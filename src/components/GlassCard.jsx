'use client';
// ============================================
// FILE: src/components/GlassCard.jsx
// Reusable glassmorphism card container
// ============================================

export default function GlassCard({
  children,
  className = '',
  hover = false,
  onClick,
  padding = 'p-5',
  style = {},
}) {
  const hoverClass = hover ? 'glass-card' : 'glass';
  const clickable  = onClick ? 'cursor-pointer' : '';

  return (
    <div
      className={`rounded-2xl ${padding} ${hoverClass} ${clickable} ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  );
}
