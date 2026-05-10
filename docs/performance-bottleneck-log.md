# Lịch sử bottleneck

Danh sách bottleneck phát hiện qua các lần kiểm thử hiệu năng. Số liệu thô nằm ở [`performance-results-log.md`](./performance-results-log.md).

---

## Lịch sử chỉnh sửa tài liệu

| Ngày | Thay đổi |
|---|---|
| 2026-05-10 | Tạo tài liệu, ghi nhận 6 bottleneck từ run `20260510-1310`. |
| 2026-05-10 | Chốt quyết định: phân trang ngay + giữ flask-limiter (đổi storage sang Redis khi scale). |
| 2026-05-10 | Fix `260510-F2`: eager-load `guest` + `departure.tour` trong `get_company_bookings` qua `joinedload`. |
| 2026-05-10 | Fix `260510-F1`, `F3`, `F5`: paginate envelope cho list endpoints (`build_envelope_or_list` trong `query_helpers.py`); atomic seat decrement trong `book_departure`; SQL filter cho departures trong `get_tour_detail`. |
| 2026-05-10 | Validate fixes ở run `20260510-1633-postfix`: F2/F3 confirmed fixed (paginated path 288× faster, write contention không còn). Phát sinh `260510-F7`: legacy non-paginated path melted do joinedload + full dump. |

---

## Index các run

| Run | Branch | # bottleneck | Ghi chú |
|---|---|---|---|
| [`20260510-1310`](#run-20260510-1310) | `test/add-testing-infrastructure` | 6 | Baseline đầu tiên. |
| [`20260510-1633-postfix`](#run-20260510-1633-postfix) | `main` | 1 mới (`F7`) | Validate F1/F2/F3/F5. F2 + F3 confirmed. F1 chỉ effective khi client pass `?page=` — legacy path regress. |

---

## Bottleneck tracker

Tổng hợp bottleneck qua các run. ID = `{run-date-short}-F{n}` để tránh trùng khi có nhiều run.

| ID | Mô tả | Vị trí | Run đầu | Trạng thái | Ghi chú |
|---|---|---|---|---|---|
| `260510-F1` | `query.all()` không giới hạn trên list endpoint | `backend/src/utils/query_helpers.py:62` | `20260510-1310` | Fixed (2026-05-10) | Envelope `{<key>, pagination}` qua `build_envelope_or_list`; áp dụng cho tours/bookings/payments. |
| `260510-F2` | N+1 lazy-loading trong `BookingSchema` | `backend/src/serializers/booking_schema.py:27-40`, `backend/src/services/company_service.py:189-216` | `20260510-1310` | Fixed (2026-05-10) | `joinedload(guest)` + `joinedload(departure.tour)` trong `get_company_bookings`. |
| `260510-F3` | Row-level write contention `Departure.available_seats` | `backend/src/services/guest_service.py:41-43` | `20260510-1310` | Fixed (2026-05-10) | Atomic UPDATE với guard `available_seats >= num_people`; rowcount==0 → 400. |
| `260510-F4` | Latency login do bcrypt | `backend/src/utils/auth.py:13` | `20260510-1310` | Won't fix | Bảo mật > latency. |
| `260510-F5` | Lọc departure trong bộ nhớ | `backend/src/services/public_service.py:64-68` | `20260510-1310` | Fixed (2026-05-10) | `tour.departures.filter(start_date>now, available_seats>0)` đẩy vào SQL. |
| `260510-F6` | Worker thread starvation khuếch đại latency | `perf/run-server.ps1:21` | `20260510-1310` | Won't fix | Fix F2 làm vấn đề biến mất. |
| `260510-F7` | Legacy non-paginated path bị joinedload khuếch đại → 60 s timeout ở 50 VU | `backend/src/utils/query_helpers.py:69-79` (fallback `query.all()` khi thiếu `page`) + `backend/src/services/company_service.py` (joinedload) | `20260510-1633-postfix` | Open | Hệ quả không lường: F2 (joinedload) + F1 (pagination tùy chọn) tạo DoS vector cho client cũ. Đề xuất: enforce `?page=` ở backend (400 nếu thiếu) hoặc auto-paginate với default page=1. |

**Trạng thái:** `Open` · `In progress` · `Fixed in {run}` · `Won't fix` · `Regressed in {run}`

---

## Run `20260510-1310`

**Nguồn dữ liệu:** [`performance-results-log.md#run-20260510-1310`](./performance-results-log.md#run-20260510-1310)
**Branch:** `test/add-testing-infrastructure`

### Bottleneck phát hiện

| ID | Bottleneck | Vị trí |
|---|---|---|
| `260510-F1` | `query.all()` không giới hạn trên list endpoint | `backend/src/utils/query_helpers.py:62` |
| `260510-F2` | N+1 lazy-loading trong `BookingSchema` | `backend/src/serializers/booking_schema.py:27-40`, `backend/src/services/company_service.py:189-216` |
| `260510-F3` | Row-level write contention trên `Departure.available_seats` | `backend/src/services/guest_service.py:41-43` |
| `260510-F4` | Latency login bị chi phối bởi bcrypt | `backend/src/utils/auth.py:13` |
| `260510-F5` | Lọc departure trong bộ nhớ (tiềm ẩn) | `backend/src/services/public_service.py:64-68` |
| `260510-F6` | Worker thread starvation khuếch đại latency | `perf/run-server.ps1:21` |

---

## Run `20260510-1633-postfix`

**Nguồn dữ liệu:** [`performance-results-log.md#run-20260510-1633-postfix`](./performance-results-log.md#run-20260510-1633-postfix)
**Branch:** `main`

### Bottleneck verification

| ID | Trước (load p95) | Sau (load p95) | Trạng thái |
|---|---|---|---|
| `260510-F1` | n/a (chưa enforce) | 20,6 ms khi paginated · 60 s khi không | Partial — fix chỉ effective ở paginated path; legacy hồi quy thành F7 |
| `260510-F2` | 5.935 ms (server) | 20,6 ms (paginated) | **Fixed** — eager-load loại N+1 |
| `260510-F3` | 25,7 ms p95 / 1.040 ms p99 stress | 21,9 ms p95 (max 1.462 ms) | **Fixed** — atomic UPDATE; tail max do MySQL serialize |
| `260510-F5` | n/a (single tour seed) | n/a | Không có dữ liệu mới — cần seed đa-departure |
| `260510-F7` (mới) | n/a | 60 s timeout (load 50 VU) | **Open** — legacy path bị F2 amplify |
