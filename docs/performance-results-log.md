# Lịch sử kết quả kiểm thử hiệu năng

Tập hợp các lần đo hiệu năng (smoke / load / stress). Phân tích bottleneck tách sang [`performance-bottleneck-history.md`](./performance-bottleneck-history.md).

---

## Lịch sử chỉnh sửa tài liệu

| Ngày | Thay đổi |
|---|---|
| 2026-05-10 | Tạo tài liệu, ghi nhận run `20260510-1310`. |

---

## Index các run

| Run | Branch | Ghi chú |
|---|---|---|
| [`20260510-1310`](#run-20260510-1310) | `test/add-testing-infrastructure` | Baseline đầu tiên. Phát hiện 6 bottleneck. |

---

## Run `20260510-1310`

**Branch:** `test/add-testing-infrastructure`
**Plan:** [`plans/260510-1235-performance-load-testing/plan.md`](../plans/260510-1235-performance-load-testing/plan.md)
**Tác giả:** perf rig (k6 + waitress + MySQL slow log + JSONL middleware)
**Phân tích bottleneck:** [`performance-bottleneck-history.md#run-20260510-1310`](./performance-bottleneck-history.md#run-20260510-1310)

### Tóm tắt

- Endpoint đọc public: p95 ≈ 11 ms ở 500 VU.
- `/api/company/bookings`: **5.900 ms p95** ở 50 VU (vi phạm SLO).
- Write contention ~150–300 VU; row-lock chờ tới 7,5 giây trên một dòng `UPDATE departures`.
- `/api/auth/login`: p50 = 216 ms (bcrypt cost ≈ 12).

### Môi trường

| Hạng mục | Giá trị |
|---|---|
| CPU / RAM / OS | Ryzen 9 8940HX (16C/32T) / 15,2 GB / Windows 11 Pro |
| App server | waitress 8 threads, `127.0.0.1:8000` (`perf/run-server.ps1`) |
| Database | MySQL 8.0.44 local, config mặc định |
| Stack | Flask 3 + SQLAlchemy 2 + flask-jwt-extended + flask-limiter + bcrypt |
| Profiling | JSONL middleware khi `PERF_PROFILING=1` (`backend/src/__init__.py:22-45`) |
| Rate limit | Bỏ qua khi `PERF_PROFILING=1` (`backend/src/utils/rate_limit.py:67-78`) |
| MySQL slow log | `long_query_time=0.1`, `log_output=TABLE` |
| Dữ liệu | `database/seed.py` baseline, departure seats nâng lên 200.000 |
| Tải | k6 v2.0.0-rc1 (windows/amd64), single host loopback |
| Sepay | Mock tại boundary (scenario 03 dừng tại `POST /book`) |

### SLO

| Loại | Ngưỡng |
|---|---|
| Đọc p95 | < 500 ms |
| Ghi p95 | < 1.500 ms |
| Tỷ lệ lỗi | < 1% |

### Smoke (1 VU × 60s)

| Scenario | p50 | p95 | p99 | RPS | Lỗi |
|---|---|---|---|---|---|
| 01 browse-search | ~3 ms | ~5 ms | ~6 ms | 3,0 | 0% |
| 02 tour-detail | ~3 ms | ~5 ms | ~7 ms | 1,0 | 0% |
| 03 guest-booking | ~9 ms | ~15 ms | ~22 ms | 2,0 | 0% |
| 04 company-dashboard | ~6 ms | ~7 ms | ~9 ms | 2,0 | 0% |

### Load (50 VU × 5 phút) — k6 client

| Scenario | p50 | p95 | RPS | Lỗi | Reqs |
|---|---|---|---|---|---|
| 01 browse-search | 4,6 ms | 13,4 ms | 146,9 | 0% | 44.016 |
| 02 tour-detail | 10,8 ms | 20,2 ms | 49,4 | 0% | 14.833 |
| 03 guest-booking | 10,6 ms | 25,7 ms | 97,1 | 0% | 29.162 |
| 04 company-dashboard | **16.746 ms** | **29.407 ms** | 2,9 | 0% | 1.010 |

> SLO violation: scenario 04 p95 = 29,4s.

### Load — server-side p95 theo route

| Route | Reqs | p50 | p95 | p99 | Max |
|---|---|---|---|---|---|
| `/api/company/bookings` | 444 | 5.710 ms | **5.935 ms** | 6.134 ms | 6.523 ms |
| `/api/company/tours` | 450 | 18 ms | 335 ms | 458 ms | 580 ms |
| `/api/auth/login` | 99 | 216 ms | 221 ms | 223 ms | 226 ms |
| `/api/guest/departures/<id>/book` | 14.572 | 10 ms | 23 ms | 31 ms | 47 ms |
| `/api/public/tours/<id>` | 29.294 | 8 ms | 18 ms | 25 ms | 49 ms |
| `/api/public/tours` | 44.016 | 3 ms | 9 ms | 14 ms | 42 ms |

> Chênh lệch server p95 (5.935 ms) vs client p95 (29.407 ms) = ~24s queueing trong waitress accept queue.

### Stress (10 → 500 VU × 10 phút)

| Scenario | p95 server | p99 | Max | Reqs | Ghi chú |
|---|---|---|---|---|---|
| 01 browse-search | 11,3 ms | 17,1 ms | 52,2 ms | 125.944 | Read scale tuyến tính tới 500 VU. |
| 03 book | 59,8 ms | **1.040 ms** | **7.881 ms** | 30.640 | p99 tăng 17× → row-lock contention. |
| 03 login | 218 ms | 220 ms | 223 ms | 106 | bcrypt-bound. |
| 03 tour detail | 33,7 ms | 39,3 ms | 144,3 ms | 30.620 | Bình thường. |

### MySQL slow log — top theo tổng thời gian

| Lần | Tổng (s) | TB (s) | Max (s) | Query |
|---|---|---|---|---|
| 489 | 80,2 | 0,16 | 1,07 | `COMMIT` |
| 8 | 48,4 | **6,05** | **7,52** | `UPDATE departures SET available_seats=185118 WHERE id=1` |
| 8 | 30,1 | 3,76 | 4,64 | `UPDATE departures SET available_seats=185117 WHERE id=1` |
| 8 | 22,0 | 2,75 | 4,22 | `UPDATE departures SET available_seats=185116 WHERE id=1` |
| 8 | 17,0 | 2,12 | 2,50 | `UPDATE departures SET available_seats=185119 WHERE id=1` |

### Artifacts

`perf/results/20260510-1310/`:
- `01-browse-search-stress-points.json` (~1,1 GB)
- `03-guest-booking-stress-points.json` (~7,3 GB)

Gộp bằng: `python perf/analyze-results.py perf/results/20260510-1310 --out perf/results/20260510-1310/tables.md`

### Caveats

- Loopback only — không network latency, không TLS.
- Single host — k6 + waitress + MySQL share CPU/IO.
- Waitress thay vì gunicorn (Windows native).
- Rate limiter bỏ qua (cố ý).
- Departure seats nâng lên 200.000 → đo write contention, không phải workload thực.
- Sepay mock tại boundary.
- MySQL config mặc định, không tune.
- Schema từ models, không qua alembic migration.
- Stress points file ~1–7 GB, giữ local.
- Chỉ một departure (`id=1`) → kết quả contention bị skew.

### Câu hỏi chưa giải quyết

- `mysql.slow_log` chỉ ghi ~500 câu trong stress 03 dù k6 ghi ~1.800.000 request. Cần `pcap`/`tcpdump` để xác minh request có đến MySQL không.
