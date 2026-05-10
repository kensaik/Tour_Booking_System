import { postJSON, assertOK } from './http.js';

const tokenCache = {};

export function login(email, password) {
  const res = postJSON('/api/auth/login', { email, password });
  assertOK(res, `login(${email})`, { status: 200, jsonKey: 'access_token' });
  if (res.status !== 200) {
    throw new Error(`login failed for ${email}: ${res.status} ${res.body}`);
  }
  return res.json('access_token');
}

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
