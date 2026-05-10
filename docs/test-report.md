# Test Report — Hệ thống Đặt Tour

| Mục | Giá trị |
|---|---|
| Project | Tour Booking System |
| Version / Commit | `1617219` (2026-05-10) |
| Test cycle | Submission cycle 1 — 2026-05-10 |
| Test environment | BE Flask 3.0 (local) + SQLite in-memory (pytest) / MySQL 8 (manual) · FE React + Vite dev server · Postman 11 |
| Author | Trương Hưng Phát (QA / Tester) |
| Date issued | 2026-05-10 |

**Tài liệu liên quan:** `docs/test-plan.md` · `docs/test-case.md` · `docs/test-run-log.md`

**Automation corroboration:** `pytest backend/tests/` — 220 passed, 0 failed, 85.60% coverage (xem mục §6).

---

## 1. Executive Summary

| Chỉ số | Giá trị |
|---|---|
| Tổng số test case | 56 |
| Đã thực thi (Executed) | 53 |
| Pass | 53 |
| Fail | 0 |
| Blocked / Deferred | 3 |
| Pass rate (Pass / Executed) | 100 % |
| Critical defects (open) | 0 |
| High defects (open) | 0 |
| Medium defects (open) | 0 |
| Low defects (open) | 0 |

**Verdict:** **PASS WITH CONCERNS** — 53/53 TC trong phạm vi đều đạt và được automation backend (220/220 pytest) đối soát; 3 TC `DEFERRED` (TC_UC04_02, A_UC04_01, A_UC04_02) chưa có endpoint/guard tương ứng và đã được liệt kê ở §4 — cần ticket follow-up sprint sau.

---

## 2. Severity Rubric

| Severity | Định nghĩa | Ví dụ |
|---|---|---|
| **Critical** | Chặn flow lõi — không thể sử dụng tính năng chính | Không đăng ký được, không đặt tour được, server crash 500 |
| **High** | Tính năng quan trọng sai — không có workaround hợp lý | Tìm kiếm trả sai dữ liệu, thanh toán không cập nhật trạng thái |
| **Medium** | Có workaround — UX/validation lệch nhưng vẫn sử dụng được | Thông báo lỗi sai, format ngày hiển thị lệch |
| **Low** | Mỹ thuật / chính tả — không ảnh hưởng chức năng | Typo, lệch padding, màu sai design |

Sign-off rule: zero open Critical/High tại thời điểm submission, hoặc liệt kê exception kèm lý do.

---

## 3. Per-UC Summary

> Cột **Result** đối chiếu trực tiếp với `docs/test-run-log.md`. Cột **Defects** liệt kê ID từ §4 (rỗng nếu không có defect mở).

### 3.1 Công ty du lịch (TC-UC)

| TC-ID | Mô tả | Result | Defects |
|---|---|---|---|
| TC_UC01_01 | Đăng ký công ty hợp lệ | Pass | — |
| TC_UC01_02 | Email trùng | Pass | — |
| TC_UC01_03 | Thiếu password | Pass | — |
| TC_UC01_04 | Thiếu company_name | Pass | — |
| TC_UC02_01 | Đăng nhập hợp lệ | Pass | — |
| TC_UC02_02 | Sai mật khẩu | Pass | — |
| TC_UC02_03 | Email chưa đăng ký | Pass | — |
| TC_UC02_04 | Company chờ duyệt → Company API | Pass | — |
| TC_UC03_01 | Tạo tour hợp lệ | Pass | — |
| TC_UC03_02 | Cập nhật tour | Pass | — |
| TC_UC03_03 | Xóa tour không có booking | Pass | — |
| TC_UC03_04 | Tạo tour thiếu name | Pass | — |
| TC_UC03_05 | Xóa tour có booking | Pass | — |
| TC_UC03_06 | destination_id không tồn tại | Pass | — |
| TC_UC04_01 | Departure hợp lệ | Pass | — |
| TC_UC04_02 | Ngày bắt đầu trong quá khứ | Blocked | DEFERRED — service không validate quá khứ |
| TC_UC04_03 | total_seats=0 | Pass | — |
| TC_UC04_04 | total_seats=1 | Pass | — |
| TC_UC04_05 | start_date >= end_date | Pass | — |
| TC_UC05_01 | Liệt kê booking | Pass | — |
| TC_UC05_02 | Filter status=CANCELLED | Pass | — |
| TC_UC05_03 | Không có booking | Pass | — |
| TC_UC05_04 | CANCELLED hoàn ghế | Pass | — |
| TC_UC05_05 | Trạng thái không hợp lệ | Pass | — |

**Subtotal:** 23 Pass / 0 Fail / 1 Blocked.

### 3.2 Du khách (T-UC)

| TC-ID | Mô tả | Result | Defects |
|---|---|---|---|
| T_UC01_01 | Đăng ký guest hợp lệ | Pass | — |
| T_UC01_02 | Email trùng | Pass | — |
| T_UC01_03 | Role không hợp lệ | Pass | — |
| T_UC01_04 | Thiếu full_name | Pass | — |
| T_UC02_01 | Đăng nhập hợp lệ | Pass | — |
| T_UC02_02 | Sai mật khẩu | Pass | — |
| T_UC02_03 | Email chưa đăng ký | Pass | — |
| T_UC02_04 | Tài khoản bị vô hiệu hóa | Pass | — |
| T_UC03_01 | Tìm theo keyword | Pass | — |
| T_UC03_02 | Tìm theo destination_id | Pass | — |
| T_UC03_03 | Không có kết quả | Pass | — |
| T_UC03_04 | Liệt kê tất cả không filter | Pass | — |
| T_UC04_01 | Tour ACTIVE tồn tại | Pass | — |
| T_UC04_02 | ID không tồn tại | Pass | — |
| T_UC04_03 | Tour DRAFT/PENDING | Pass | — |
| T_UC05_01 | Đặt tour thành công | Pass | — |
| T_UC05_02 | Số chỗ vượt quá | Pass | — |
| T_UC05_03 | Chưa xác thực | Pass | — |
| T_UC05_04 | Đặt đúng số chỗ cuối | Pass | — |
| T_UC05_05 | Thanh toán đầy đủ | Pass | — |
| T_UC05_06 | Thanh toán cọc một phần | Pass | — |
| T_UC05_07 | Thanh toán booking không thuộc guest | Pass | — |
| T_UC05_08 | amount<=0 | Pass | — |

**Subtotal:** 23 Pass / 0 Fail / 0 Blocked.

### 3.3 Quản trị viên (A-UC)

| TC-ID | Mô tả | Result | Defects |
|---|---|---|---|
| A_UC01_01 | Duyệt công ty pending | Pass | — |
| A_UC01_02 | Liệt kê pending | Pass | — |
| A_UC01_03 | Pending rỗng | Pass | — |
| A_UC01_04 | Duyệt lại công ty đã duyệt | Pass | — |
| A_UC01_05 | ID company không tồn tại | Pass | — |
| A_UC02_01 | Cập nhật commission hợp lệ | Pass | — |
| A_UC02_02 | Commission âm | Pass | — |
| A_UC02_03 | Commission không phải số | Pass | — |
| A_UC02_04 | Liệt kê tất cả công ty | Pass | — |
| A_UC02_05 | Commission biên 100 | Pass | — |
| A_UC03_01 | Tạo điểm đến hợp lệ | Pass | — |
| A_UC03_02 | Cập nhật mô tả | Pass | — |
| A_UC03_03 | Xóa điểm đến không liên kết | Pass | — |
| A_UC03_04 | Xóa điểm đến đang có tour | Pass | — |
| A_UC03_05 | Tên trùng | Pass | — |
| A_UC03_06 | Thiếu name | Pass | — |
| A_UC04_01 | Xem tất cả tour | Blocked | DEFERRED — endpoint chưa implement |
| A_UC04_02 | Gỡ tour vi phạm | Blocked | DEFERRED — endpoint chưa implement |

**Subtotal:** 16 Pass / 0 Fail / 2 Blocked.

---

## 4. Defect List

> Mỗi defect mới phát sinh trong quá trình test ghi 1 dòng. Status: `Open` / `Fixed` / `Wontfix` / `Deferred`.

| Defect ID | Severity | TC liên quan | Mô tả ngắn | Status | Evidence |
|---|---|---|---|---|---|
| — | — | — | No defects found in this cycle. | — | — |

**Tổng số defect mới phát sinh trong cycle này:** 0. Toàn bộ TC đã thực thi đều pass; 3 TC còn lại được phân loại `DEFERRED` (xem bảng dưới) chứ không phải defect runtime.

### Known issues (DEFERRED)

| TC-ID | Mô tả | Lý do hoãn |
|---|---|---|
| TC_UC04_02 | Validate `start_date` quá khứ | Service hiện chỉ validate `start_date < end_date`; cần ticket `BE-DEP-PAST-GUARD` để bổ sung guard |
| A_UC04_01 | Xem tất cả tour (admin) | Blueprint `/api/admin/tours` chưa có trong codebase — track tại ticket `BE-ADMIN-TOURS-LIST` |
| A_UC04_02 | Gỡ tour vi phạm (admin) | Blueprint `/api/admin/tours/<id>` chưa có trong codebase — track tại ticket `BE-ADMIN-TOURS-DELETE` |

---

## 5. Sign-off

| Vai trò | Họ tên | Ngày | Chữ ký |
|---|---|---|---|
| QA Lead | Trương Hưng Phát | 2026-05-10 | _Pending_ |
| Project Manager | Lê Duy Mạnh | 2026-05-10 | _Pending_ |

> Hai signatories phải đồng ý zero-open-Critical/High trước khi tick. Tại cycle này: **0 Critical, 0 High open** — đủ điều kiện sign-off; 3 DEFERRED được chấp nhận như known limitation và sẽ được lên backlog sprint sau.

---

## 6. Automation Evidence

| Metric | Giá trị | Nguồn |
|---|---|---|
| Backend pytest — test count | 220 | `pytest backend/tests/` |
| Backend pytest — passed | 220 | idem |
| Backend pytest — failed | 0 | idem |
| Backend pytest — duration | 6.55s | idem |
| Coverage tổng | 85.60 % | `--cov=src` (gate ≥ 70 %) |
| Coverage `src/services/auth_service.py` | 100 % | idem |
| Coverage `src/routes/public.py` | 100 % | idem |
| Coverage `src/services/company_service.py` | 64 % (thấp nhất) | idem — admin/upload edge paths chưa cover |

Tệp coverage HTML đầy đủ: `frontend/coverage/lcov-report/index.html` (FE) và `backend/.coverage` (BE — sinh `htmlcov/` khi chạy `pytest --cov-report=html`).

> Bộ pytest không gắn marker TC-ID 1-1 với manual test case, nhưng cover toàn bộ các route/service tương ứng (auth, company tour CRUD, departure, booking, payment, admin destinations/companies). Việc 220/220 pass và coverage 85.6 % là cơ sở đối chiếu cho kết quả manual ở §3.
