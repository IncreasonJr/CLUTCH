// ============================================
// FILE: src/utils/teamHelper.js
// Utility helper to get flag/club emojis for teams
// ============================================

export function getTeamEmoji(name) {
  if (!name) return '⚽';
  const clean = name.toLowerCase().trim();

  // ── Countries ──────────────────────────────────────────────────────────────
  if (clean === 'germany') return '🇩🇪';
  if (clean === 'paraguay') return '🇵🇾';
  if (clean === 'ghana') return '🇬🇭';
  if (clean === 'nigeria') return '🇳🇬';
  if (clean === 'england') return '🏴\u200d󠁢󠁥󠁮󠁧󠁿';
  if (clean === 'france') return '🇫🇷';
  if (clean === 'brazil') return '🇧🇷';
  if (clean === 'argentina') return '🇦🇷';
  if (clean === 'spain') return '🇪🇸';
  if (clean === 'italy') return '🇮🇹';
  if (clean === 'portugal') return '🇵🇹';
  if (clean === 'netherlands' || clean === 'holland') return '🇳🇱';
  if (clean === 'belgium') return '🇧🇪';
  if (clean === 'croatia') return '🇭🇷';
  if (clean === 'uruguay') return '🇺🇾';
  if (clean === 'colombia') return '🇨🇴';
  if (clean === 'chile') return '🇨🇱';
  if (clean === 'peru') return '🇵🇪';
  if (clean === 'mexico') return '🇲🇽';
  if (clean === 'usa' || clean.includes('united states')) return '🇺🇸';
  if (clean === 'canada') return '🇨🇦';
  if (clean === 'japan') return '🇯🇵';
  if (clean.includes('korea')) return '🇰🇷';
  if (clean === 'china') return '🇨🇳';
  if (clean === 'saudi arabia') return '🇸🇦';
  if (clean === 'australia') return '🇦🇺';
  if (clean === 'senegal') return '🇸🇳';
  if (clean === 'egypt') return '🇪🇬';
  if (clean === 'morocco') return '🇲🇦';
  if (clean === 'cameroon') return '🇨🇲';
  if (clean.includes('ivory coast') || clean.includes("d'ivoire")) return '🇨🇮';
  if (clean === 'south africa') return '🇿🇦';
  if (clean === 'algeria') return '🇩🇿';
  if (clean === 'tunisia') return '🇹🇳';
  if (clean === 'switzerland') return '🇨🇭';
  if (clean === 'sweden') return '🇸🇪';
  if (clean === 'norway') return '🇳🇴';
  if (clean === 'denmark') return '🇩🇰';
  if (clean === 'poland') return '🇵🇱';
  if (clean === 'ukraine') return '🇺🇦';
  if (clean === 'russia') return '🇷🇺';
  if (clean === 'turkey') return '🇹🇷';
  if (clean === 'greece') return '🇬🇷';
  if (clean === 'austria') return '🇦🇹';
  if (clean === 'wales') return '🏴\u200d󠁢󠁷󠁬󠁳󠁿';
  if (clean === 'scotland') return '🏴\u200d󠁢󠁳󠁣󠁴󠁿';
  if (clean === 'ireland') return '🇮🇪';

  // ── Club Keywords/Nicknames ────────────────────────────────────────────────
  if (clean.includes('arsenal')) return '🔴🦁';
  if (clean.includes('chelsea')) return '🔵🦁';
  if (clean.includes('liverpool')) return '🔴🦅';
  if (clean.includes('manchester united') || clean.includes('man utd')) return '🔴👿';
  if (clean.includes('manchester city') || clean.includes('man city')) return '🔵🦈';
  if (clean.includes('tottenham') || clean.includes('spurs')) return '⚪🐓';
  if (clean.includes('real madrid')) return '⚪👑';
  if (clean.includes('barcelona')) return '🔵🔴';
  if (clean.includes('atletico')) return '🔴⚪';
  if (clean.includes('bayern')) return '🔴🔵';
  if (clean.includes('dortmund')) return '🟡⚫';
  if (clean.includes('juventus')) return '⚪⚫';
  if (clean.includes('milan')) return '🔴⚫';
  if (clean.includes('roma')) return '🐺🟡';
  if (clean.includes('napoli')) return '🔵💎';
  if (clean.includes('ajax')) return '⚪🔴';
  if (clean.includes('paris saint') || clean.includes('psg')) return '🔵🗼';

  return '⚽';
}
