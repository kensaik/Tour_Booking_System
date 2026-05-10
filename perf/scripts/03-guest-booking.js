import { sleep } from 'k6';
import { getJSON, postJSON, assertOK, authHeaders } from '../lib/http.js';
import { loginCached } from '../lib/auth.js';
import { guestCreds } from '../lib/data.js';
import { resolveOptions } from '../options/profile.js';

export const options = resolveOptions();

export function setup() {
  const res = getJSON('/api/public/tours');
  assertOK(res, 'setup: tours', { status: 200, jsonKey: 'tours' });
  const tours = res.json('tours') || [];
  if (tours.length === 0) {
    throw new Error('No tours seeded. Run database/seed.py first.');
  }

  const firstDetail = getJSON(`/api/public/tours/${tours[0].id}`);
  assertOK(firstDetail, 'setup: detail', { status: 200, jsonKey: 'tour' });
  const tour = firstDetail.json('tour') || {};
  const departures = tour.departures || [];
  if (departures.length === 0) {
    throw new Error('Seeded tour has no departures.');
  }

  return {
    tourIds: tours.map((t) => t.id),
    departureId: departures[0].id,
  };
}

export default function (data) {
  const token = loginCached(guestCreds);
  const headers = authHeaders(token);

  const tourId = data.tourIds[Math.floor(Math.random() * data.tourIds.length)];
  const detail = getJSON(`/api/public/tours/${tourId}`, {
    tags: { kind: 'read', endpoint: 'tour_detail_pre_book' },
  });
  assertOK(detail, 'pre-book detail', { status: 200, jsonKey: 'tour' });

  const bookRes = postJSON(
    `/api/guest/departures/${data.departureId}/book`,
    { num_people: 1 },
    { headers, tags: { kind: 'write', endpoint: 'departure_book' } },
  );
  const ok =
    bookRes.status >= 200 && bookRes.status < 500 &&
    bookRes.headers['Content-Type'] &&
    bookRes.headers['Content-Type'].indexOf('application/json') !== -1;
  if (!ok) {
    console.error(`book failed: status=${bookRes.status} body=${bookRes.body}`);
  }

  sleep(1);
}
