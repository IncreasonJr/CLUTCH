// ============================================
// FILE: src/lib/auth.js
// Email-only auth — NO OTP, NO verification
// Checks Supabase 'users' table directly.
// ============================================

import { supabase } from './supabase';

const SESSION_KEY = 'clutch_user';

/**
 * Login or register a user by email only.
 * - If user exists in 'users' table → store in localStorage and return.
 * - If user does NOT exist → create new record → store and return.
 * @param {string} email
 * @returns {{ user: object, isNew: boolean }}
 */
export async function loginWithEmail(email) {
  const cleanEmail = email.trim().toLowerCase();

  // 1. Look up user by email
  const { data: existing, error: lookupError } = await supabase
    .from('users')
    .select('*')
    .eq('email', cleanEmail)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Database lookup failed: ${lookupError.message}`);
  }

  // 2a. User found → restore session
  if (existing) {
    saveSession(existing);
    return { user: existing, isNew: false };
  }

  // 2b. New user → insert record
  const username = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '');
  const { data: created, error: insertError } = await supabase
    .from('users')
    .insert([{ email: cleanEmail, username }])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Failed to create account: ${insertError.message}`);
  }

  saveSession(created);
  return { user: created, isNew: true };
}

/**
 * Read the current user from localStorage.
 * @returns {object|null}
 */
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persist the user object to localStorage.
 * @param {object} user
 */
export function saveSession(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

/**
 * Clear the localStorage session and redirect to /login.
 */
export function logout() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
  window.location.href = '/login';
}
