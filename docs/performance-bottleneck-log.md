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

---

## Index các run

| Run | Branch | # bottleneck | Ghi chú |
|---|---|---|---|
| [`20260510-1310`](#run-20260510-1310) | `test/add-testing-infrastructure` | 6 | Baseline đầu tiên. |

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

### Danh sách fix ưu tiên

| Thứ tự | ID | Tác động dự kiến | Công sức |
|---|---|---|---|
| 1 | `260510-F2` — eager-load relationships trong `get_company_bookings` | p95 của `/api/company/bookings` từ 5,9 giây → có thể <500 ms (10×) | XS — một dòng `.options(joinedload(…))` |
| 2 | `260510-F1` — giới hạn hoặc bắt buộc phân trang trên list endpoint | Giới hạn worst case cho MỌI endpoint phân trang | S — cần coordinate với FE |
| 3 | `260510-F3` — atomic seat decrement | Xóa lỗi lost-update + giảm write p99 từ 1,04 giây → ~50 ms | S — viết lại một query + kiểm tra rowcount |
| 4 | `260510-F5` — đẩy departure filter vào SQL | Tiềm ẩn — quan trọng khi tour có nhiều departure | XS |
| 5 | `260510-F4` — bcrypt cost khi login | Không khuyến nghị sửa; bảo mật quan trọng hơn | n/a |
| 6 | `260510-F6` — waitress thread count | Không tune. Fix #1 làm nó không còn quan trọng. | n/a |

### Quyết định (2026-05-10)

- **Phân trang ngay.** Frontend chưa tồn tại (`frontend/` chỉ có config + README), không có consumer nào bị ràng buộc với shape không phân trang. Áp dụng envelope `{items, total, page, page_size}` đồng nhất cho mọi list endpoint. Default `page_size=20`, `max_page_size=200`.
- **Giữ flask-limiter.** Đã wired sẵn JWT-aware key + admin bypass — reverse-proxy không thay thế được phần per-user. Thay đổi duy nhất cần làm: đổi `storage_uri="memory://"` → Redis khi chạy >1 worker (memory storage là per-process, counter sẽ drift).

---