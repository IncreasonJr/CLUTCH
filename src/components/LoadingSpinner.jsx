'use client';
// ============================================
// FILE: src/components/LoadingSpinner.jsx
// Turquoise animated loading spinner
// ============================================

export default function LoadingSpinner({ size = 'md', text = null, fullPage = false }) {
  const sizes = {
    sm:  'w-5 h-5 border-2',
    md:  'w-8 h-8 border-3',
    lg:  'w-12 h-12 border-4',
    xl:  'w-16 h-16 border-4',
  };

  const sizeClass = sizes[size] || sizes.md;

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeClass} rounded-full animate-spin`}
        style={{
          borderColor:       'rgba(0, 172, 169, 0.2)',
          borderTopColor:    '#00ACA9',
          borderRightColor:  '#4DD0D0',
        }}
      />
      {text && (
        <p className="text-sm" style={{ color: '#A0A0A0' }}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50"
           style={{ background: 'rgba(18,18,18,0.85)', backdropFilter: 'blur(8px)' }}>
        {spinner}
      </div>
    );
  }

  return spinner;
}
