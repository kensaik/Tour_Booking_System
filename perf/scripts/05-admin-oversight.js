import { sleep } from 'k6';
import { getJSON, assertOK, authHeaders } from '../lib/http.js';
import { loginCached } from '../lib/auth.js';
import { adminCreds } from '../lib/data.js';
import { resolveOptions } from '../options/profile.js';

export const options = resolveOptions();

export default function () {
  const token = loginCached(adminCreds);
  const headers = authHeaders(token);

  const r1 = getJSON('/api/admin/companies', {
    headers,
    tags: { kind: 'read', endpoint: 'admin_companies' },
  });
  assertOK(r1, 'admin companies', { status: 200, jsonKey: 'companies' });

  const r2 = getJSON('/api/admin/destinations', {
    headers,
    tags: { kind: 'read', endpoint: 'admin_destinations' },
  });
  assertOK(r2, 'admin destinations', { status: 200, jsonKey: 'destinations' });

  sleep(1);
}
