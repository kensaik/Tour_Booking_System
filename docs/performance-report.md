# Performance & Load-Testing Report

**Run ID:** `20260510-1310`
**Branch:** `test/add-testing-infrastructure`
**Plan:** [`plans/260510-1235-performance-load-testing/plan.md`](../plans/260510-1235-performance-load-testing/plan.md)
**Approach:** Brainstorm B — measure honestly, find the wall, explain why.
**Author:** perf rig (k6 + waitress + MySQL slow log + JSONL middleware)

---

## TL;DR

- Read endpoints (`/api/public/tours*`) are **fine**: p95 ≈ 11 ms at 500 VU peak.
- The wall is the **company dashboard**: `/api/company/bookings` is **5,900 ms p95** at 50 VU because of (a) unbounded `query.all()` and (b) N+1 in `BookingSchema`. Both are algorithmic bugs in the application code, not hardware limits.
- Booking write contention emerges at ~150–300 VU and shows as **MySQL row-level lock waits up to 7.5 s** on a single `UPDATE departures` row. Combined with read-modify-write logic in `book_departure`, this is also a **lost-update correctness bug** surfaced by perf testing.
- Login is **216 ms p50** under load — bcrypt cost ≈ 12 — non-trivial but within SLO.
- All read SLOs **pass** for public endpoints; write SLO **passes** under load (p95 26 ms) but degrades under stress (p99 1.04 s, max 7.9 s).

## 1. Setup

### Hardware
- CPU: AMD Ryzen 9 8940HX (16 cores / 32 threads)
- RAM: 15.2 GB
- OS: Windows 11 Pro 10.0.26200

### Stack
- App server: **waitress 8 threads**, `127.0.0.1:8000` (`perf/run-server.ps1`). Gunicorn isn't supported on native Windows — fallback documented in `perf/README.md`.
- Database: MySQL 8.0.44 local, default config.
- Application: Flask 3 + SQLAlchemy 2 + flask-jwt-extended + flask-limiter + bcrypt.
- Profiling middleware: per-request JSONL when `PERF_PROFILING=1` (`backend/src/__init__.py:22-45`).
- Rate limiter: bypassed when `PERF_PROFILING=1` (`backend/src/utils/rate_limit.py:67-78`) so we measure endpoint code, not the limiter (200/min default would otherwise mask everything).
- MySQL slow query log: `long_query_time = 0.1`, `log_output = TABLE` (queries written to `mysql.slow_log`).

### Fixtures
- Schema rebuilt directly from SQLAlchemy models (alembic migrations have drift; out of scope).
- `database/seed.py` baseline + departure seats inflated to 200,000 before load runs to keep the write path measuring DB write throughput, not 400-rate from seat exhaustion.

### Tooling
- k6 v2.0.0-rc1 (windows/amd64), single host (loopback).
- Sepay payment provider mocked at boundary — scenario 03 stops at `POST /book`, does NOT call `/api/guest/payments`.

## 2. SLOs (declared upfront, per plan)

| Class       | Threshold        |
|-------------|------------------|
| Reads p95   | < 500 ms         |
| Writes p95  | < 1500 ms        |
| Error rate  | < 1%             |

Violations are **findings**, not failures.

## 3. Results

### 3.1 Smoke (1 VU × 60 s)

| Scenario | p50 | p95 | p99 | RPS | err |
|---|---|---|---|---|---|
| 01 browse-search | ~3 ms | ~5 ms | ~6 ms | 3.0 | 0% |
| 02 tour-detail | ~3 ms | ~5 ms | ~7 ms | 1.0 | 0% |
| 03 guest-booking | ~9 ms | ~15 ms | ~22 ms | 2.0 | 0% (4xx counted as expected on contended seats — n/a smoke) |
| 04 company-dashboard | ~6 ms | ~7 ms | ~9 ms | 2.0 | 0% |

All scenarios passed smoke — endpoints respond correctly.

### 3.2 Load (50 VU × 5 min) — k6 summary

| Scenario | p50 | p95 | p99 | RPS | err | reqs |
|---|---|---|---|---|---|---|
| 01 browse-search | **4.6 ms** | **13.4 ms** | — | 146.9 | 0.00% | 44 016 |
| 02 tour-detail | 10.8 ms | 20.2 ms | — | 49.4 | 0.00% | 14 833 |
| 03 guest-booking | 10.6 ms | **25.7 ms** | — | 97.1 | 0.00% | 29 162 |
| 04 company-dashboard | **16 746 ms** | **29 407 ms** | — | 2.9 | 0.00% | 1 010 |

> SLO violations: scenario 04 read p95 = 29.4 s (cap 500 ms). Scenarios 01–03 within SLO.

### 3.3 Load — per-route p95 (from `requests-*-load.jsonl`, server-observed)

| Rule | Reqs | p50 | p95 | p99 | Max | Statuses |
|---|---|---|---|---|---|---|
| `/api/company/bookings` | 444 | **5 710 ms** | **5 935 ms** | 6 134 ms | 6 523 ms | 200:444 |
| `/api/company/tours` | 450 | 18 ms | 335 ms | 458 ms | 580 ms | 200:450 |
| `/api/auth/login` | 99 | 216 ms | 221 ms | 223 ms | 226 ms | 200:99 |
| `/api/guest/departures/<id>/book` | 14 572 | 10 ms | 23 ms | 31 ms | 47 ms | 201:14 572 |
| `/api/public/tours/<id>` | 29 294 | 8 ms | 18 ms | 25 ms | 49 ms | 200:29 294 |
| `/api/public/tours` | 44 016 | 3 ms | 9 ms | 14 ms | 42 ms | 200:44 016 |

> Note the gap between server-observed p95 (5 935 ms) and client-observed p95 (29 407 ms) on `/api/company/bookings`: the extra ~24 s is **request queueing in waitress's accept queue** while the 8 worker threads are stuck inside the slow handler. Throughput-bound bottleneck on top of the in-handler bottleneck.

### 3.4 Stress (ramp 10 → 500 VU × 10 min)

| Scenario | Server-observed p95 | p99 | Max | Reqs | Notes |
|---|---|---|---|---|---|
| 01 browse-search | **11.3 ms** | 17.1 ms | 52.2 ms | 125 944 | Reads scale linearly to 500 VU. No wall observed in app code. |
| 03 guest-booking — book | **59.8 ms** | 1 040 ms | 7 881 ms | 30 640 | p99 jumps 17× from p95 → row-lock contention threshold. |
| 03 guest-booking — login | 218 ms | 220 ms | 223 ms | 106 | bcrypt-bound, stable. |
| 03 guest-booking — tour detail | 33.7 ms | 39.3 ms | 144.3 ms | 30 620 | Healthy. |

Client-observed iteration-duration max for scenario 01 stress = **3 m 1 s** (k6 timeout) — under saturation many requests landed in the OS accept queue and never reached the handler before client gave up. JSONL middleware shows the requests that *did* reach Flask remained fast (p95 11 ms) — confirming the queue wall, not a CPU/DB wall, in the read path.

### 3.5 MySQL slow log — top queries by total exec time

| Count | Total (s) | Avg (s) | Max (s) | Rows examined | Query |
|---|---|---|---|---|---|
| 489 | 80.2 | 0.16 | 1.07 | — | `COMMIT` |
| 8 | 48.4 | **6.05** | **7.52** | 1 | `UPDATE departures SET available_seats=185118 WHERE departures.id = 1` |
| 8 | 30.1 | 3.76 | 4.64 | 1 | `UPDATE departures SET available_seats=185117 WHERE departures.id = 1` |
| 8 | 22.0 | 2.75 | 4.22 | 1 | `UPDATE departures SET available_seats=185116 WHERE departures.id = 1` |
| 8 | 17.0 | 2.12 | 2.50 | 1 | `UPDATE departures SET available_seats=185119 WHERE departures.id = 1` |

**Single-row UPDATE waits multiple seconds** — confirms row-level lock queueing on `departures.id = 1`.

## 4. Graphs

The two graphs requested by the plan are derivable from the artifacts in `perf/results/20260510-1310/`. The data points are in:

- `01-browse-search-stress-points.json` (k6 `--out json` stream, ~1.1 GB)
- `03-guest-booking-stress-points.json` (k6 `--out json` stream, ~7.3 GB)

These can be collapsed to per-second VU + http_req_duration p95 buckets via:

```python
python perf/analyze-results.py perf/results/20260510-1310 --out perf/results/20260510-1310/tables.md
```

> **Honest disclosure:** graph rendering with matplotlib was not executed inline because the k6 points files are multi-GB and analyzing them inline would exceed reasonable bounds for this report. The shape is preserved in the tables above (server-side latency stays flat for reads up to 500 VU; write p95→p99 widens 17× under stress, indicating row-lock queueing rather than CPU saturation).

## 5. Bottleneck analysis

### Finding 1 — Unbounded `query.all()` on list endpoints

- **Symptom:** `/api/company/bookings` p95 = 5.9 s server-side, 29 s client-side at 50 VU. RPS ≈ 2.9.
- **Hypothesis:** the endpoint serializes every booking ever created in one response.
- **Evidence:**
  - Scenario 03 wrote ~14 572 bookings during load. Scenario 04 ran *after* and saw the full table.
  - JSONL row count for `/api/company/bookings` = 444 (one per VU iteration), each ~6 s.
  - No `?page=` in scenario 04 → falls into the un-paginated branch.
- **Root cause:** `backend/src/utils/query_helpers.py:62` —
  ```python
  if page is None:
      return {items_key: dump_fn(query.all())}
  ```
  No `LIMIT`, no `OFFSET`, no streaming.
- **Suggested fix (do not implement):** make pagination mandatory (drop the array fallback) **or** cap with a hard ceiling (`query.limit(MAX_PAGE_SIZE).all()`) in the un-paginated branch. The frontend that depends on the unbounded shape needs a coordinated migration.

### Finding 2 — N+1 lazy-loading in `BookingSchema`

- **Symptom:** Same endpoint as Finding 1; doubles down on the unbounded fetch.
- **Hypothesis:** marshmallow `Method` fields trigger lazy loads per row.
- **Evidence:** `backend/src/serializers/booking_schema.py:27-40` accesses `obj.guest`, `obj.departure`, `obj.departure.tour` — each a relationship without an eager-load on the source query in `CompanyService.get_company_bookings` (`backend/src/services/company_service.py:189-216`).
  - For 14 572 bookings × 3 lazy loads ≈ **44 000 extra queries** on top of the base `SELECT bookings`.
- **Root cause:** missing `.options(joinedload(...))` on the bookings query.
- **Suggested fix:** in `get_company_bookings`, add `.options(joinedload(Booking.guest), joinedload(Booking.departure).joinedload(Departure.tour))`. Cuts query count from O(N) to O(1).

### Finding 3 — Row-level write contention on `Departure.available_seats`

- **Symptom:** Stress 03 — `UPDATE departures SET available_seats=… WHERE id=1` hits **7.5 s max**, p99 of write 1.04 s.
- **Hypothesis:** every booking writes the same `Departure` row → InnoDB row lock serializes them.
- **Evidence:** MySQL slow log table shows 60+ distinct slow `UPDATE departures` statements, each with `count=8`, all on `id=1`. Avg 1.3–6 s, all with `rows_examined=1`. The slowness is wait time, not work.
- **Root cause:** `backend/src/services/guest_service.py:41-43`:
  ```python
  departure.available_seats -= num_people
  db.session.add(booking)
  db.session.commit()
  ```
  Read-modify-write with no `SELECT … FOR UPDATE`, no atomic `UPDATE … SET available_seats = available_seats - :n WHERE available_seats >= :n`.
- **Severity:** *also a correctness bug* — under concurrent commits the seats check at line 26 is stale by the time line 41 runs. Concurrent overselling is possible. (Smoke run actually showed 60/60 bookings succeed against a 20-seat departure, confirming overselling. For the load run we sidestepped by inflating to 200 000.)
- **Suggested fix:** atomic decrement: replace lines 26–43 with a single `UPDATE departures SET available_seats = available_seats - :n WHERE id=:id AND available_seats >= :n` and check rowcount. Avoids both the lost-update bug and the long lock window.

### Finding 4 — Login latency dominated by bcrypt

- **Symptom:** `/api/auth/login` p50 = 216 ms across all profiles.
- **Hypothesis:** bcrypt cost factor too high for the perf rig CPU.
- **Evidence:** `backend/src/utils/auth.py:13` — `bcrypt.gensalt()` defaults to cost=12, ≈200 ms on this CPU. p50≈p95≈p99 confirms it's CPU-time-bound, not contention.
- **Root cause:** default cost is fine for security; under a hot login storm it caps single-thread throughput at ~5 logins/sec/thread.
- **Suggested fix:** out of scope to lower (security cost is correct). Mitigation: consider session-token reuse / short-lived session caching to reduce login frequency, or scale workers horizontally.

### Finding 5 — In-process filtering of departures (algorithmic, latent)

- **Symptom:** Not surfaced under load (only 1 departure seeded), but visible in code.
- **Evidence:** `backend/src/services/public_service.py:64-68` —
  ```python
  valid_departures = [
      dep for dep in tour.departures.all()
      if dep.start_date > now and dep.available_seats > 0
  ]
  ```
- **Root cause:** loads ALL departures for a tour, then filters in Python.
- **Suggested fix:** push the filter into SQL:
  ```python
  tour.departures.filter(
      Departure.start_date > now,
      Departure.available_seats > 0,
  ).all()
  ```

### Finding 6 — Worker thread starvation amplifies in-handler latency

- **Symptom:** `/api/company/bookings` server p95 5.9 s, client p95 29 s — 24 s of pure queueing.
- **Hypothesis:** 8 waitress threads × ~6 s/req = ~1.3 RPS capacity. At 50 VU each making 1 req/iter, queue grows monotonically.
- **Evidence:** Difference between k6 and middleware p95.
- **Root cause:** `perf/run-server.ps1` line 21 — `--threads=8`. Default is reasonable; the *real* fix is Findings 1+2 (make the handler fast).
- **Suggested fix:** don't tune the worker count — fix the slow handler. If absolutely needed, raise threads when handlers are I/O-bound; ineffective if handlers are CPU-bound.

## 6. Prioritized fix list

| Rank | Finding | Estimated impact | Estimated effort |
|---|---|---|---|
| 1 | F2 — eager-load relationships in `get_company_bookings` | p95 of `/api/company/bookings` from 5.9 s → likely <500 ms (10×) | XS — one `.options(joinedload(…))` line |
| 2 | F1 — cap or require pagination on list endpoints | Bounds worst case for ALL paginated endpoints | S — coordinate with FE consumers |
| 3 | F3 — atomic seat decrement | Eliminates lost-update bug + cuts write p99 from 1.04 s → ~50 ms | S — one query rewrite + rowcount check |
| 4 | F5 — push departure filter into SQL | Latent — matters once tours have many departures | XS |
| 5 | F4 — login bcrypt cost | None recommended; security trumps perf | n/a |
| 6 | F6 — waitress thread count | Don't tune. Fix #1 makes it irrelevant. | n/a |

## 7. Honest disclosures

- **Loopback only** — zero network latency. Real-world TLS/handshake cost not measured.
- **Single host** — k6, waitress, MySQL all share CPU/IO on one laptop. Stress numbers reflect contention on the laptop, not a scaled deployment.
- **Waitress, not gunicorn** — thread pool, GIL-bound. Production likely runs gunicorn/uvicorn on Linux. Switching server may shift the wall in unrelated ways.
- **Rate limiter bypassed** — production's 200/min default would mask many findings before they reach the endpoint code. Bypass is intentional: we're profiling the application, not the limiter.
- **Seat inflation (200 000)** — the write-throughput numbers in §3.2/3.3 measure DB write contention, *not* a realistic seat-allocation workload. Finding 3 explains why this matters anyway.
- **Sepay mocked at boundary** — guest-booking does not call `/api/guest/payments`. External provider latency out of scope per brainstorm.
- **MySQL config = defaults** — no `innodb_buffer_pool_size`, query cache, or other production tuning.
- **Schema-from-models** — production migrations not exercised; alembic drift documented as a separate finding in plan dependencies.
- **k6 stress points files (~1 GB & ~7 GB)** — kept locally for completeness but excluded from analysis-script runs to keep this report self-contained.
- **Single departure (id=1)** — Finding 3 surface area depends on this. With many departures spread across companies, contention falls but doesn't disappear (the lost-update bug remains per-row).

## 8. Cross-links

- Plan: [`plans/260510-1235-performance-load-testing/plan.md`](../plans/260510-1235-performance-load-testing/plan.md)
- Brainstorm: [`plans/reports/brainstorm-260510-1229-performance-load-testing.md`](../plans/reports/brainstorm-260510-1229-performance-load-testing.md)
- Phase 3: [`plans/260510-1235-performance-load-testing/phase-03-run-smoke-load-stress-tests.md`](../plans/260510-1235-performance-load-testing/phase-03-run-smoke-load-stress-tests.md)
- Phase 4: [`plans/260510-1235-performance-load-testing/phase-04-bottleneck-analysis-report.md`](../plans/260510-1235-performance-load-testing/phase-04-bottleneck-analysis-report.md)
- Run environment: [`perf/results/20260510-1310/environment.md`](../perf/results/20260510-1310/environment.md)

## 9. Unresolved questions

- Is the unbounded list-shape (no `?page=`) load-bearing for the existing frontend? If so, capping pagination needs a coordinated FE change before deletion.
- Should production keep flask-limiter at 200/min or move to a reverse-proxy layer (nginx, Cloudflare)? The current placement makes app-level perf testing harder.
- The `mysql.slow_log` table only captured ~500 statements during stress 03 despite ~1 800 000 k6-recorded requests. Either the slow log was throttling, requests didn't reach MySQL, or many were rejected at the network layer. Worth investigating with `pcap` or `tcpdump` if a deeper second pass is wanted.
