// Scenario 01 — public browse + search.
// Mirrors public.py: GET /api/public/destinations, /api/public/tours, /api/public/tours?keyword=&destination_id=

import { sleep } from 'k6';
import { getJSON, assertOK } from '../lib/http.js';
import { resolveOptions } from '../options/profile.js';

export const options = resolveOptions();

export function setup() {
  // Capture available destinations once. Fail loud if seed missing.
  const res = getJSON('/api/public/destinations');
  assertOK(res, 'setup: destinations', { status: 200, jsonKey: 'destinations' });
  const destinations = res.json('destinations') || [];
  if (destinations.length === 0) {
    throw new Error('No destinations seeded. Run database/seed.py first.');
  }
  const keywords = ['Đà', 'Tour', 'Phú', 'Paris', ''];
  return { destinationIds: destinations.map((d) => d.id), keywords };
}

export default function (data) {
  // 1. List all tours
  const r1 = getJSON('/api/public/tours', { tags: { kind: 'read', endpoint: 'tours_list' } });
  assertOK(r1, 'list tours', { status: 200, jsonKey: 'tours' });

  // 2. Filter by destination
  const dId = data.destinationIds[Math.floor(Math.random() * data.destinationIds.length)];
  const r2 = getJSON(`/api/public/tours?destination_id=${dId}`, {
    tags: { kind: 'read', endpoint: 'tours_filter_destination' },
  });
  assertOK(r2, 'filter by destination', { status: 200, jsonKey: 'tours' });

  // 3. Search by keyword
  const kw = data.keywords[Math.floor(Math.random() * data.keywords.length)];
  const r3 = getJSON(`/api/public/tours?keyword=${encodeURIComponent(kw)}`, {
    tags: { kind: 'read', endpoint: 'tours_search_keyword' },
  });
  assertOK(r3, 'search by keyword', { status: 200, jsonKey: 'tours' });

  sleep(1); // think time between iterations
}
