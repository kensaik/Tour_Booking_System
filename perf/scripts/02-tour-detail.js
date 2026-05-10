// Scenario 02 — tour detail (tour + itineraries + departures eager-loaded).
// Mirrors public.py: GET /api/public/tours, GET /api/public/tours/<id>

import { sleep } from 'k6';
import { getJSON, assertOK } from '../lib/http.js';
import { resolveOptions } from '../options/profile.js';

export const options = resolveOptions();

export function setup() {
  const res = getJSON('/api/public/tours');
  assertOK(res, 'setup: tours', { status: 200, jsonKey: 'tours' });
  const tours = res.json('tours') || [];
  if (tours.length === 0) {
    throw new Error('No tours seeded. Run database/seed.py first.');
  }
  return { tourIds: tours.map((t) => t.id) };
}

export default function (data) {
  const id = data.tourIds[Math.floor(Math.random() * data.tourIds.length)];
  const res = getJSON(`/api/public/tours/${id}`, {
    tags: { kind: 'read', endpoint: 'tour_detail' },
  });
  assertOK(res, `tour detail id=${id}`, { status: 200, jsonKey: 'tour' });
  sleep(1);
}
