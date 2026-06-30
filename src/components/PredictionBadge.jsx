'use client';
// ============================================
// FILE: src/components/PredictionBadge.jsx
// Colored badge for Home Win / Draw / Away Win
// ============================================

const STYLES = {
  'Home Win': {
    bg:     'rgba(0, 120, 142, 0.25)',
    border: 'rgba(0, 120, 142, 0.6)',
    text:   '#4DD0D0',
    dot:    '#00788E',
  },
  'Draw': {
    bg:     'rgba(77, 208, 208, 0.15)',
    border: 'rgba(77, 208, 208, 0.5)',
    text:   '#4DD0D0',
    dot:    '#4DD0D0',
  },
  'Away Win': {
    bg:     'rgba(0, 172, 169, 0.2)',
    border: 'rgba(0, 172, 169, 0.55)',
    text:   '#00ACA9',
    dot:    '#00ACA9',
  },
};

const DEFAULT_STYLE = {
  bg:     'rgba(60, 60, 60, 0.4)',
  border: 'rgba(100, 100, 100, 0.4)',
  text:   '#A0A0A0',
  dot:    '#666',
};

export default function PredictionBadge({ prediction, confidence }) {
  const s = STYLES[prediction] || DEFAULT_STYLE;
  const label = prediction || 'Pending';

  return (
    <div
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        background:   s.bg,
        border:       `1px solid ${s.border}`,
        color:        s.text,
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Colored dot */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: s.dot }}
      />
      <span>{label}</span>
      {confidence != null && (
        <span className="opacity-75">· {confidence}%</span>
      )}
    </div>
  );
}
