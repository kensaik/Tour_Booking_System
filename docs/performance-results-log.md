# Lịch sử kết quả kiểm thử hiệu năng

Tập hợp các lần đo hiệu năng (smoke / load / stress). Phân tích bottleneck tách sang [`performance-bottleneck-history.md`](./performance-bottleneck-history.md).

---

## Lịch sử chỉnh sửa tài liệu

| Ngày | Thay đổi |
|---|---|
| 2026-05-10 | Tạo tài liệu, ghi nhận run `20260510-1310`. |
| 2026-05-10 | Thêm run `20260510-1633-postfix` (sau khi fix F1/F2/F3/F5). |

---

## Index các run

| Run | Branch | Ghi chú |
|---|---|---|
| [`20260510-1310`](#run-20260510-1310) | `test/add-testing-infrastructure` | Baseline đầu tiên. Phát hiện 6 bottleneck. |
| [`20260510-1633-postfix`](#run-20260510-1633-postfix) | `main` | Sau fix F1/F2/F3/F5. Smoke + load (skip stress). `/api/company/bookings` paginated p95 từ 5.935 ms → 21 ms (288×). Legacy non-paginated path melted ở 60 s timeout — joinedload khuếch đại payload. |

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


---

## Run `20260510-1633-postfix`

**Branch:** `main`
**Plan:** validate fixes F1/F2/F3/F5 (xem [`performance-bottleneck-log.md`](./performance-bottleneck-log.md))
**Tác giả:** perf rig (k6 + waitress + JSONL middleware)
**Phân tích bottleneck:** [`performance-bottleneck-log.md#run-20260510-1633-postfix`](./performance-bottleneck-log.md)

### Môi trường

Giống [`20260510-1310`](#run-20260510-1310). Không re-seed; departure `id=1` vẫn 200.000 seats. Không stress (theo yêu cầu user — chỉ smoke + load).

Khác biệt:
- Branch: `main` (đã merge các fix F1/F2/F3/F5).
- Thêm scenario `04-company-dashboard-paginated.js` để exercise paginated path mà 04 gốc không pass `?page=`.

### SLO

Giữ nguyên ngưỡng baseline (đọc p95 < 500 ms, ghi p95 < 1.500 ms, lỗi < 1%).

| Endpoint | p95 đo được | SLO | Pass? |
|---|---|---|---|
| `/api/public/tours` (load) | 13,4 ms | < 500 ms | ✓ |
| `/api/public/tours/<id>` (load) | 19,8 ms | < 500 ms | ✓ |
| `/api/guest/departures/<id>/book` (load) | 21,9 ms | < 1.500 ms | ✓ |
| `/api/company/bookings?page=1` (load) | 20,6 ms | < 500 ms | ✓ |
| `/api/company/bookings` không page (load) | 60.000 ms (timeout) | < 500 ms | ✗ |

### Smoke (1 VU × 60 s)

| Scenario | p50 | p95 | Max | Reqs | Lỗi |
|---|---|---|---|---|---|
| 01 browse-search | 3,2 ms | 4,7 ms | 5,1 ms | 181 | 0% |
| 02 tour-detail | 5,6 ms | 7,4 ms | 9,9 ms | 61 | 0% |
| 03 guest-booking | 6,3 ms | 8,3 ms | 208,6 ms | 121 | 0% |
| 04 company-dashboard (legacy) | 8,0 ms | 11,1 ms | 217,8 ms | 119 | 0% |
| 04 company-dashboard (paginated) | 9,5 ms | 12,7 ms | 207,1 ms | 119 | 0% |

### Load (50 VU × 5 phút) — k6 client

| Scenario | p50 | p95 | Max | RPS | Reqs | Lỗi |
|---|---|---|---|---|---|---|
| 01 browse-search | 4,7 ms | 13,4 ms | 214,7 ms | 146,9 | 44.209 | 0% |
| 02 tour-detail | 9,8 ms | 19,8 ms | 218,8 ms | 49,4 | 14.858 | 0% |
| 03 guest-booking | 9,4 ms | **21,9 ms** | **1.462,7 ms** | 97,4 | 29.306 | 0% |
| 04 company-dashboard (legacy) | **60.000 ms** | **60.000 ms** | 60.000 ms | 1,1 | 356 | 0% |
| 04 company-dashboard (paginated) | 10,7 ms | **20,6 ms** | 1.457,8 ms | 97,3 | 29.282 | 0% |

> Scenario 04 legacy (không pass `page` param) hồi quy nặng so với baseline (16,7 s wall / 5,9 s server → 60 s timeout). Nguyên nhân: `joinedload` materialize toàn bộ bookings + relations × 50 VU. Pagination là bắt buộc trên client.

### Đối chiếu baseline

| Metric | Baseline `20260510-1310` | Postfix `20260510-1633-postfix` | Delta |
|---|---|---|---|
| `/api/company/bookings` paginated p95 | n/a (chưa có pagination) | 20,6 ms | n/a |
| `/api/company/bookings` server p95 (load) | 5.935 ms | 60.000 ms (timeout, legacy) / 20,6 ms (paginated) | -288× / +10× |
| 03 booking p95 (load) | 25,7 ms | 21,9 ms | -15% |
| 03 booking p99 (stress) — *không re-test stress* | 1.040 ms | n/a | — |
| 01 browse p95 (load) | 13,4 ms | 13,4 ms | 0% |
| 02 detail p95 (load) | 20,2 ms | 19,8 ms | -2% |
