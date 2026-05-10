// Shared HTTP helpers for k6 scenarios.
// Base URL via __ENV.BASE_URL (default http://127.0.0.1:8000).

import http from 'k6/http';
import { check } from 'k6';

export const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:8000';

const JSON_HEADERS = { 'Content-Type': 'application/json', 'Accept': 'application/json' };

export function authHeaders(token) {
  return Object.assign({}, JSON_HEADERS, { Authorization: `Bearer ${token}` });
}

export function getJSON(path, params = {}) {
  return http.get(`${BASE_URL}${path}`, Object.assign({ headers: JSON_HEADERS }, params));
}

export function postJSON(path, body, params = {}) {
  return http.post(
    `${BASE_URL}${path}`,
    JSON.stringify(body),
    Object.assign({ headers: JSON_HEADERS }, params),
  );
}

export function putJSON(path, body, params = {}) {
  return http.put(
    `${BASE_URL}${path}`,
    JSON.stringify(body),
    Object.assign({ headers: JSON_HEADERS }, params),
  );
}

// expect: { status: 200, jsonKey: 'tours' } — both optional.
export function assertOK(res, label, expect = {}) {
  const status = expect.status || 200;
  const checks = { [`${label}: status ${status}`]: (r) => r.status === status };

  if (expect.jsonKey) {
    checks[`${label}: body has '${expect.jsonKey}'`] = (r) => {
      try {
        const b = r.json();
        return b && Object.prototype.hasOwnProperty.call(b, expect.jsonKey);
      } catch (e) {
        return false;
      }
    };
  }
  return check(res, checks);
}
