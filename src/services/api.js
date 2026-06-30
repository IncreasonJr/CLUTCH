// ============================================
// FILE: src/services/api.js
// Axios wrappers for the Express backend API
// ============================================

import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://clutch-mefl.onrender.com/api';

const client = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30000ms timeout for mobile networks
  headers: { 'Content-Type': 'application/json' },
});

// Log configuration details on load
console.log('[API Service] Initialized');
console.log('[API Service] Base URL:', client.defaults.baseURL);
console.log('[API Service] Predictions endpoint:', `${client.defaults.baseURL}/predictions/today`);

// ─── Response interceptor with detailed error logging ────────────────────────
client.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('[API Service] Error Intercepted:', {
      message: err.message,
      url: err.config?.url,
      baseURL: err.config?.baseURL,
      status: err.response?.status,
      data: err.response?.data
    });

    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Network error';
    return Promise.reject(new Error(message));
  }
);

// ─── Normalizer ─────────────────────────────────────────────────────────────
const LABEL_MAP = { home_win: 'Home Win', draw: 'Draw', away_win: 'Away Win' };

export function normalizePredictions(raw) {
  const items = Array.isArray(raw) ? raw : (raw?.data || raw?.predictions || raw?.matches || []);
  return items.map((item) => {
    const m = item.matches || {};
    return {
      id:          item.match_id || m.id,
      home_team:   m.home_team,
      away_team:   m.away_team,
      match_date:  m.match_date,
      status:      m.status,
      home_score:  m.home_score,
      away_score:  m.away_score,
      league_code: m.league_code,
      external_id: m.external_id,
      prediction: {
        prediction_label: LABEL_MAP[item.prediction] || item.prediction,
        confidence:       item.confidence,
        home_prob:        item.home_probability,
        draw_prob:        item.draw_probability,
        away_prob:        item.away_probability,
      },
    };
  });
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

/** GET /api/predictions/today – all matches with predictions (normalized) */
export const fetchTodaysPredictions = () =>
  client.get('/predictions/today').then((r) => normalizePredictions(r.data));

/** GET /api/predictions/:matchId – single match prediction */
export const fetchMatchPrediction = (matchId) =>
  client.get(`/predictions/${matchId}`).then((r) => r.data);

/**
 * GET /api/predictions/:matchId/detailed
 * Falls back to the basic prediction endpoint if detailed doesn't exist.
 */
export const fetchMatchPredictionDetailed = async (matchId) => {
  try {
    const r = await client.get(`/predictions/${matchId}/detailed`);
    return r.data;
  } catch {
    const r = await client.get(`/predictions/${matchId}`);
    return r.data;
  }
};

/** POST /api/sync/manual – trigger manual re-sync (falls back to predictions/refresh) */
export const refreshPredictions = () =>
  client.post('/sync/manual', {}, {
    headers: { 'x-sync-api-key': process.env.NEXT_PUBLIC_SYNC_API_KEY || '' },
  }).then((r) => r.data).catch(() =>
    client.post('/predictions/refresh').then((r) => r.data)
  );

/** GET /api/matches/today */
export const fetchTodaysMatches = () =>
  client.get('/matches/today').then((r) => r.data);

/**
 * Client-side search across a normalized predictions list.
 */
export function searchMatches(matches, query) {
  if (!query?.trim()) return matches;
  const q = query.trim().toLowerCase();
  return matches.filter((m) =>
    m.home_team?.toLowerCase().includes(q) ||
    m.away_team?.toLowerCase().includes(q) ||
    m.league_code?.toLowerCase().includes(q)
  );
}

export default client;
