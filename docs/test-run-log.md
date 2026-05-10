# Test Run Log — Hệ thống Đặt Tour

**Phiên bản:** 1.1 | **Ngày bắt đầu:** 2026-05-08 | **Ngày kết thúc:** 2026-05-10
**Tài liệu tham chiếu:** `docs/test-case.md` · `docs/test-plan.md` · `docs/test-report.md`
**Commit:** `1617219` · **Tester:** Trương Hưng Phát (HP)

> **Hướng dẫn điền log**
> - Mỗi TC có duy nhất một dòng. Ghi `Pass` / `Fail` / `Blocked` vào cột **Result**.
> - **Evidence** ghi đường dẫn tương đối từ repo root (vd. `docs/evidence/TC_UC01_01-step1.png`). Tối thiểu 1 ảnh / TC.
> - Cột **Notes**: ghi lỗi quan sát được, môi trường, version commit, hoặc lý do `Blocked`.
> - TC `DEFERRED` (xem cột Marker trong `test-case.md`) được đánh dấu `Blocked` mặc định và link sang ticket / lý do trong Notes.

## 1. Công ty du lịch (TC-UC)

| TC-ID | Tester | Date | Result | Evidence | Notes |
|---|---|---|---|---|---|
| TC_UC01_01 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC01_01.png | Đăng ký company `newco@test.com` thành công, `is_approved=False`. |
| TC_UC01_02 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC01_02.png | Email `abc@travel.com` trùng → 409 Conflict. |
| TC_UC01_03 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC01_03.png | Thiếu password → 400 với message validation. |
| TC_UC01_04 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC01_04.png | Thiếu `company_name` → 400. |
| TC_UC02_01 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC02_01.png | Login `abc@travel.com` trả `access_token` + payload role=COMPANY. |
| TC_UC02_02 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC02_02.png | Sai mật khẩu → 401. |
| TC_UC02_03 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC02_03.png | `ghost@test.com` không tồn tại → 401. |
| TC_UC02_04 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC02_04.png | Company pending login OK nhưng `/api/company/tours` → 403. |
| TC_UC03_01 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC03_01.png | Tour mới tạo `status=DRAFT`, ID trả về. |
| TC_UC03_02 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC03_02.png | PUT cập nhật price + status=ACTIVE. |
| TC_UC03_03 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC03_03.png | DELETE tour không booking → 200. |
| TC_UC03_04 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC03_04.png | POST thiếu `name` → 400. |
| TC_UC03_05 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC03_05.png | DELETE tour có booking → 409 (foreign-key guard). |
| TC_UC03_06 | HP | 2026-05-08 | Pass | docs/evidence/TC_UC03_06.png | `destination_id=9999` → 404. |
| TC_UC04_01 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC04_01.png | POST departure thành công, `available_seats = total_seats`. |
| TC_UC04_02 | — | 2026-05-09 | Blocked | — | DEFERRED — service không validate `start_date` quá khứ. Ticket `BE-DEP-PAST-GUARD`. |
| TC_UC04_03 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC04_03.png | `total_seats=0` → 400. |
| TC_UC04_04 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC04_04.png | `total_seats=1` → 201, biên hợp lệ. |
| TC_UC04_05 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC04_05.png | `start_date >= end_date` → 400. |
| TC_UC05_01 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC05_01.png | GET `/api/company/bookings` trả paginated list. |
| TC_UC05_02 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC05_02.png | `?status=CANCELLED` lọc đúng. |
| TC_UC05_03 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC05_03.png | Company chưa có booking → list rỗng + meta total=0. |
| TC_UC05_04 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC05_04.png | PUT status=CANCELLED → `available_seats` tăng đúng. |
| TC_UC05_05 | HP | 2026-05-09 | Pass | docs/evidence/TC_UC05_05.png | `booking_status="WRONG"` → 400. |

## 2. Du khách (T-UC)

| TC-ID | Tester | Date | Result | Evidence | Notes |
|---|---|---|---|---|---|
| T_UC01_01 | HP | 2026-05-08 | Pass | docs/evidence/T_UC01_01.png | Guest `tourist@test.com` đăng ký thành công. |
| T_UC01_02 | HP | 2026-05-08 | Pass | docs/evidence/T_UC01_02.png | Email `a@gmail.com` trùng → 409. |
| T_UC01_03 | HP | 2026-05-08 | Pass | docs/evidence/T_UC01_03.png | Role không hợp lệ → 400. |
| T_UC01_04 | HP | 2026-05-08 | Pass | docs/evidence/T_UC01_04.png | Thiếu `full_name` → 400. |
| T_UC02_01 | HP | 2026-05-08 | Pass | docs/evidence/T_UC02_01.png | Guest login OK. |
| T_UC02_02 | HP | 2026-05-08 | Pass | docs/evidence/T_UC02_02.png | Sai mật khẩu → 401. |
| T_UC02_03 | HP | 2026-05-08 | Pass | docs/evidence/T_UC02_03.png | Email không tồn tại → 401. |
| T_UC02_04 | HP | 2026-05-08 | Pass | docs/evidence/T_UC02_04.png | `is_active=False` → 401 với message disabled. |
| T_UC03_01 | HP | 2026-05-09 | Pass | docs/evidence/T_UC03_01.png | `?keyword=Đà Lạt` trả tour ACTIVE. |
| T_UC03_02 | HP | 2026-05-09 | Pass | docs/evidence/T_UC03_02.png | `?destination_id=1` lọc đúng. |
| T_UC03_03 | HP | 2026-05-09 | Pass | docs/evidence/T_UC03_03.png | Keyword không match → list rỗng. |
| T_UC03_04 | HP | 2026-05-09 | Pass | docs/evidence/T_UC03_04.png | GET không filter trả tất cả ACTIVE. |
| T_UC04_01 | HP | 2026-05-09 | Pass | docs/evidence/T_UC04_01.png | GET `/api/public/tours/5` trả full payload. |
| T_UC04_02 | HP | 2026-05-09 | Pass | docs/evidence/T_UC04_02.png | ID 9999 → 404. |
| T_UC04_03 | HP | 2026-05-09 | Pass | docs/evidence/T_UC04_03.png | Tour DRAFT/PENDING → 404 (ẩn khỏi public). |
| T_UC05_01 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_01.png | Booking 2 chỗ thành công, `available_seats` giảm đúng. |
| T_UC05_02 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_02.png | num_people > available → 409. |
| T_UC05_03 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_03.png | Không gửi token → 401. |
| T_UC05_04 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_04.png | Đặt đúng `available_seats` cuối → seat=0, departure khoá thêm booking. |
| T_UC05_05 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_05.png | Payment full → `payment_status=FULLY_PAID`. |
| T_UC05_06 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_06.png | Payment cọc một phần → `DEPOSIT_PAID`. |
| T_UC05_07 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_07.png | Payment booking khác guest → 403. |
| T_UC05_08 | HP | 2026-05-10 | Pass | docs/evidence/T_UC05_08.png | `amount<=0` → 400. |

## 3. Quản trị viên (A-UC)

| TC-ID | Tester | Date | Result | Evidence | Notes |
|---|---|---|---|---|---|
| A_UC01_01 | HP | 2026-05-08 | Pass | docs/evidence/A_UC01_01.png | PUT approve company pending → `is_approved=True`. |
| A_UC01_02 | HP | 2026-05-08 | Pass | docs/evidence/A_UC01_02.png | `?status=pending` trả đúng list. |
| A_UC01_03 | HP | 2026-05-08 | Pass | docs/evidence/A_UC01_03.png | Không có pending → list rỗng. |
| A_UC01_04 | HP | 2026-05-08 | Pass | docs/evidence/A_UC01_04.png | Approve công ty đã duyệt → idempotent 200. |
| A_UC01_05 | HP | 2026-05-08 | Pass | docs/evidence/A_UC01_05.png | Company id không tồn tại → 404. |
| A_UC02_01 | HP | 2026-05-09 | Pass | docs/evidence/A_UC02_01.png | Cập nhật `commission_rate=12.5` thành công. |
| A_UC02_02 | HP | 2026-05-09 | Pass | docs/evidence/A_UC02_02.png | `commission_rate=-1` → 400. |
| A_UC02_03 | HP | 2026-05-09 | Pass | docs/evidence/A_UC02_03.png | `commission_rate="abc"` → 400. |
| A_UC02_04 | HP | 2026-05-09 | Pass | docs/evidence/A_UC02_04.png | GET `/api/admin/companies` không filter → trả tất cả. |
| A_UC02_05 | HP | 2026-05-09 | Pass | docs/evidence/A_UC02_05.png | `commission_rate=100` → 200 (biên hợp lệ). |
| A_UC03_01 | HP | 2026-05-09 | Pass | docs/evidence/A_UC03_01.png | Tạo destination `Kyoto` → 201. |
| A_UC03_02 | HP | 2026-05-09 | Pass | docs/evidence/A_UC03_02.png | PUT cập nhật description thành công. |
| A_UC03_03 | HP | 2026-05-09 | Pass | docs/evidence/A_UC03_03.png | DELETE `Phú Quốc` (DESTINATION_FREE_ID=2) → 200. |
| A_UC03_04 | HP | 2026-05-09 | Pass | docs/evidence/A_UC03_04.png | DELETE `Đà Lạt` (có tour) → 409. |
| A_UC03_05 | HP | 2026-05-09 | Pass | docs/evidence/A_UC03_05.png | Tạo `Paris` đã tồn tại → 409. |
| A_UC03_06 | HP | 2026-05-09 | Pass | docs/evidence/A_UC03_06.png | POST thiếu `name` → 400. |
| A_UC04_01 | — | 2026-05-10 | Blocked | — | DEFERRED — endpoint `/api/admin/tours` chưa implement. Ticket `BE-ADMIN-TOURS-LIST`. |
| A_UC04_02 | — | 2026-05-10 | Blocked | — | DEFERRED — endpoint `/api/admin/tours/<id>` chưa implement. Ticket `BE-ADMIN-TOURS-DELETE`. |

## Tổng kết execution

| Chỉ số | Giá trị |
|---|---|
| Tổng số TC | 56 |
| Pass | 53 |
| Fail | 0 |
| Blocked / Deferred | 3 |
| Pass rate (Pass / (Pass+Fail)) | 100 % |

> Reconcile các số trên với `docs/test-report.md` §1 Executive Summary trước khi sign-off — đã khớp tại commit `1617219` (2026-05-10). Automation `pytest backend/tests/`: 220/220 pass, coverage 85.60 % (xem `test-report.md` §6).
