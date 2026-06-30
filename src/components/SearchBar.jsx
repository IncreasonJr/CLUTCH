'use client';
// ============================================
// FILE: src/components/SearchBar.jsx
// Premium glassmorphism search bar with
// debounced filtering and auto-suggest dropdown
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X } from 'lucide-react';

// ─── Highlight matching text in yellow/gold ───────────────────────────────────
function HighlightText({ text = '', query = '' }) {
  if (!query.trim()) return <span>{text}</span>;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark
            key={i}
            style={{
              background: 'rgba(255,217,61,0.35)',
              color: '#FFD93D',
              borderRadius: '2px',
              padding: '0 1px',
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

function formatDropdownTime(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleTimeString('en-GH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

export default function SearchBar({ onSearch, placeholder = 'Search teams, leagues…', matches = [], onResultClick }) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState([]);
  const [open, setOpen]             = useState(false);
  const [activeIdx, setActiveIdx]   = useState(-1);
  const [focused, setFocused]       = useState(false);
  const debounceRef                 = useRef(null);
  const inputRef                    = useRef(null);
  const dropdownRef                 = useRef(null);

  // ─── Debounced filter ───────────────────────────────────────────────────────
  const runFilter = useCallback((q) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      if (onSearch) onSearch('');
      return;
    }
    const lower = q.toLowerCase();
    const filtered = matches
      .filter(
        (m) =>
          m.home_team?.toLowerCase().includes(lower) ||
          m.away_team?.toLowerCase().includes(lower) ||
          m.league_code?.toLowerCase().includes(lower)
      )
      .slice(0, 6);
    setResults(filtered);
    setOpen(true);
    setActiveIdx(-1);
    if (onSearch) onSearch(q);
  }, [matches, onSearch]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runFilter(val), 300);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
    setActiveIdx(-1);
    if (onSearch) onSearch('');
    inputRef.current?.focus();
  };

  // ─── Keyboard navigation ────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeIdx >= 0 && results[activeIdx]) {
        handleSelect(results[activeIdx]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  };

  const handleSelect = (match) => {
    setOpen(false);
    setActiveIdx(-1);
    if (onResultClick) onResultClick(match);
  };

  // ─── Close dropdown on outside click ───────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        inputRef.current && !inputRef.current.closest('div').contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const wrapperStyle = {
    position: 'relative',
    width: '100%',
    maxWidth: '640px',
    margin: '0 auto',
  };

  const inputWrapStyle = {
    display: 'flex',
    alignItems: 'center',
    height: '56px',
    borderRadius: '28px',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: focused
      ? '1.5px solid rgba(0,172,169,0.7)'
      : '1.5px solid var(--glass-border)',
    boxShadow: focused
      ? '0 0 0 2px rgba(0,172,169,0.4), 0 8px 32px rgba(0,0,0,0.15)'
      : '0 4px 24px rgba(0,0,0,0.08)',
    padding: '0 20px',
    gap: '12px',
    transition: 'border 0.2s, box-shadow 0.2s',
  };

  const inputStyle = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text-primary)',
    fontSize: '0.975rem',
    fontFamily: 'var(--font-inter, sans-serif)',
    letterSpacing: '0.01em',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    left: 0,
    right: 0,
    background: 'var(--bg-surface)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid var(--glass-border)',
    borderRadius: '16px',
    overflow: 'hidden',
    zIndex: 50,
    boxShadow: '0 16px 48px rgba(0,0,0,0.2)',
    transition: 'background var(--transition-base), border-color var(--transition-base)',
  };

  return (
    <div style={wrapperStyle}>
      {/* ── Input wrapper ── */}
      <div style={inputWrapStyle}>
        <Search size={20} color={focused ? '#00ACA9' : 'var(--text-muted)'} strokeWidth={2} />
        <input
          ref={inputRef}
          id="match-search"
          name="match-search"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { setFocused(true); if (query.trim() && results.length) setOpen(true); }}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          aria-label="Search matches"
          aria-autocomplete="list"
          aria-expanded={open}
          style={inputStyle}
        />
        {query && (
          <button
            onClick={handleClear}
            aria-label="Clear search"
            style={{
              background: 'var(--glass-bg)',
              border: '1.5px solid var(--glass-border)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--glass-border)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--glass-bg)'}
          >
            <X size={14} color="var(--text-secondary)" />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {open && query.trim() && (
        <div ref={dropdownRef} style={dropdownStyle} role="listbox">
          {results.length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-inter, sans-serif)',
            }}>
              No matches found for &ldquo;<span style={{ color: '#FFD93D' }}>{query}</span>&rdquo;
            </div>
          ) : (
            results.map((match, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div
                  key={match.id || idx}
                  role="option"
                  aria-selected={isActive}
                  onClick={() => handleSelect(match)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 18px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0,172,169,0.12)' : 'transparent',
                    borderBottom: idx < results.length - 1 ? '1px solid var(--glass-border)' : 'none',
                    transition: 'background 0.12s',
                  }}
                >
                  {/* Left: teams */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-inter, sans-serif)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      <HighlightText text={match.home_team} query={query} />
                      <span style={{ color: 'var(--text-muted)', margin: '0 6px' }}>vs</span>
                      <HighlightText text={match.away_team} query={query} />
                    </div>
                    {match.league_code && (
                      <div style={{
                        fontSize: '0.72rem',
                        color: 'var(--text-muted)',
                        marginTop: '2px',
                        fontFamily: 'var(--font-inter, sans-serif)',
                      }}>
                        <HighlightText text={match.league_code} query={query} />
                      </div>
                    )}
                  </div>
                  {/* Right: time */}
                  <div style={{
                    fontSize: '0.72rem',
                    color: 'var(--text-secondary)',
                    fontFamily: 'var(--font-jetbrains, monospace)',
                    flexShrink: 0,
                    marginLeft: '12px',
                  }}>
                    {formatDropdownTime(match.match_date)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
