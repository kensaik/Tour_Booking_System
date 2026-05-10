// Scenario 04 — paginated variant. Same flow as 04-company-dashboard.js but
// passes ?page=1&page_size=20 to exercise the post-fix paginated envelope path
// in build_envelope_or_list. Used to validate F1 + F2 fixes against the legacy
// full-dump path (which the un-paginated variant exercises).

import { sleep } from 'k6';
import { getJSON, assertOK, authHeaders } from '../lib/http.js';
import { loginCached } from '../lib/auth.js';
import { companyCreds } from '../lib/data.js';
import { resolveOptions } from '../options/profile.js';

export const options = resolveOptions();

export default function () {
  const token = loginCached(companyCreds.approved);
  const headers = authHeaders(token);

  const r1 = getJSON('/api/company/tours?page=1&page_size=20', {
    headers,
    tags: { kind: 'read', endpoint: 'company_tours_paginated' },
  });
  assertOK(r1, 'company tours', { status: 200, jsonKey: 'tours' });

  const r2 = getJSON('/api/company/bookings?page=1&page_size=20', {
    headers,
    tags: { kind: 'read', endpoint: 'company_bookings_paginated' },
  });
  assertOK(r2, 'company bookings', { status: 200, jsonKey: 'bookings' });

  sleep(1);
}
