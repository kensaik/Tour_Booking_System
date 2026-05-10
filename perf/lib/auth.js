// Login helper with per-VU token cache. Refreshes once per iteration if needed.
//
// Usage:
//   import { loginCached } from '../lib/auth.js';
//   const token = loginCached(creds);

import { postJSON, assertOK } from './http.js';

const tokenCache = {}; // VU-local in k6 (each VU has its own module instance scope per iter? no — module state is per-VU)

export function login(email, password) {
  const res = postJSON('/api/auth/login', { email, password });
  assertOK(res, `login(${email})`, { status: 200, jsonKey: 'access_token' });
  if (res.status !== 200) {
    throw new Error(`login failed for ${email}: ${res.status} ${res.body}`);
  }
  return res.json('access_token');
}

// Cache token per (email) within the current VU lifetime.
// k6 module state is per-VU, so this is safe — no cross-VU leakage.
export function loginCached(creds) {
  const key = creds.email;
  if (!tokenCache[key]) {
    tokenCache[key] = login(creds.email, creds.password);
  }
  return tokenCache[key];
}

export function clearTokenCache() {
  for (const k of Object.keys(tokenCache)) delete tokenCache[k];
}
