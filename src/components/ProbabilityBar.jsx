'use client';
// ============================================
// FILE: src/components/ProbabilityBar.jsx
// 3-segment horizontal probability bar
// Shows Home / Draw / Away percentages
// ============================================

export default function ProbabilityBar({ homeProb, drawProb, awayProb, homeTeam, awayTeam }) {
  // Normalize so segments always sum to 100
  const raw  = [homeProb || 33, drawProb || 34, awayProb || 33];
  const total = raw.reduce((a, b) => a + b, 0) || 100;
  const [h, d, a] = raw.map((v) => Math.round((v / total) * 100));

  const segments = [
    { label: homeTeam || 'Home',  value: h, color: '#00788E', textColor: '#4DD0D0' },
    { label: 'Draw',              value: d, color: '#4DD0D0', textColor: '#4DD0D0' },
    { label: awayTeam || 'Away',  value: a, color: '#00ACA9', textColor: '#00ACA9' },
  ];

  return (
    <div className="space-y-3">
      {/* Bar track */}
      <div className="flex w-full h-2.5 rounded-full overflow-hidden gap-px bg-black-400">
        {segments.map((seg, i) => (
          <div
            key={i}
            style={{
              width:           `${seg.value}%`,
              backgroundColor: seg.color,
              transition:      'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
              minWidth:        seg.value > 0 ? '3px' : '0',
            }}
          />
        ))}
      </div>

      {/* Labels row */}
      <div className="flex justify-between text-xs">
        {segments.map((seg, i) => (
          <div
            key={i}
            className={`flex flex-col items-${i === 0 ? 'start' : i === 1 ? 'center' : 'end'}`}
          >
            <span className="font-bold" style={{ color: seg.color }}>
              {seg.value}%
            </span>
            <span className="text-gray-500 truncate max-w-[80px]" title={seg.label}>
              {seg.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
