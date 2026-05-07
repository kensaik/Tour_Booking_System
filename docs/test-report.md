# Test Report — Hệ thống Đặt Tour

| Mục | Giá trị |
|---|---|
| Project | Tour Booking System |
| Version / Commit | _<điền: tag hoặc git SHA>_ |
| Test cycle | _<điền: vd. "Submission cycle 1 — 2026-05-15">_ |
| Test environment | _<điền: BE local Flask + MySQL test, FE dev server / Postman>_ |
| Author | _<QA name>_ |
| Date issued | _<YYYY-MM-DD>_ |

**Tài liệu liên quan:** `docs/test-plan.md` · `docs/test-case.md` · `docs/test-run-log.md`

---

## 1. Executive Summary

| Chỉ số | Giá trị |
|---|---|
| Tổng số test case | 56 |
| Đã thực thi (Executed) | _<điền>_ |
| Pass | _<điền>_ |
| Fail | _<điền>_ |
| Blocked / Deferred | _<điền>_ |
| Pass rate (Pass / Executed) | _<điền>_ % |
| Critical defects (open) | _<điền>_ |
| High defects (open) | _<điền>_ |
| Medium defects (open) | _<điền>_ |
| Low defects (open) | _<điền>_ |

**Verdict:** _<PASS / PASS WITH CONCERNS / FAIL>_ — _<điền lý do tóm tắt 1–2 câu>_

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

> Cập nhật cột **Result** sau khi run-log hoàn tất. Cột **Defects** liệt kê ID từ §4.

### 3.1 Công ty du lịch (TC-UC)

| TC-ID | Mô tả | Result | Defects |
|---|---|---|---|
| TC_UC01_01 | Đăng ký công ty hợp lệ | | |
| TC_UC01_02 | Email trùng | | |
| TC_UC01_03 | Thiếu password | | |
| TC_UC01_04 | Thiếu company_name | | |
| TC_UC02_01 | Đăng nhập hợp lệ | | |
| TC_UC02_02 | Sai mật khẩu | | |
| TC_UC02_03 | Email chưa đăng ký | | |
| TC_UC02_04 | Company chờ duyệt → Company API | | |
| TC_UC03_01 | Tạo tour hợp lệ | | |
| TC_UC03_02 | Cập nhật tour | | |
| TC_UC03_03 | Xóa tour không có booking | | |
| TC_UC03_04 | Tạo tour thiếu name | | |
| TC_UC03_05 | Xóa tour có booking | | |
| TC_UC03_06 | destination_id không tồn tại | | |
| TC_UC04_01 | Departure hợp lệ | | |
| TC_UC04_02 | Ngày bắt đầu trong quá khứ | Blocked | DEFERRED — service không validate quá khứ |
| TC_UC04_03 | total_seats=0 | | |
| TC_UC04_04 | total_seats=1 | | |
| TC_UC04_05 | start_date >= end_date | | |
| TC_UC05_01 | Liệt kê booking | | |
| TC_UC05_02 | Filter status=CANCELLED | | |
| TC_UC05_03 | Không có booking | | |
| TC_UC05_04 | CANCELLED hoàn ghế | | |
| TC_UC05_05 | Trạng thái không hợp lệ | | |

### 3.2 Du khách (T-UC)

| TC-ID | Mô tả | Result | Defects |
|---|---|---|---|
| T_UC01_01 | Đăng ký guest hợp lệ | | |
| T_UC01_02 | Email trùng | | |
| T_UC01_03 | Role không hợp lệ | | |
| T_UC01_04 | Thiếu full_name | | |
| T_UC02_01 | Đăng nhập hợp lệ | | |
| T_UC02_02 | Sai mật khẩu | | |
| T_UC02_03 | Email chưa đăng ký | | |
| T_UC02_04 | Tài khoản bị vô hiệu hóa | | |
| T_UC03_01 | Tìm theo keyword | | |
| T_UC03_02 | Tìm theo destination_id | | |
| T_UC03_03 | Không có kết quả | | |
| T_UC03_04 | Liệt kê tất cả không filter | | |
| T_UC04_01 | Tour ACTIVE tồn tại | | |
| T_UC04_02 | ID không tồn tại | | |
| T_UC04_03 | Tour DRAFT/PENDING | | |
| T_UC05_01 | Đặt tour thành công | | |
| T_UC05_02 | Số chỗ vượt quá | | |
| T_UC05_03 | Chưa xác thực | | |
| T_UC05_04 | Đặt đúng số chỗ cuối | | |
| T_UC05_05 | Thanh toán đầy đủ | | |
| T_UC05_06 | Thanh toán cọc một phần | | |
| T_UC05_07 | Thanh toán booking không thuộc guest | | |
| T_UC05_08 | amount<=0 | | |

### 3.3 Quản trị viên (A-UC)

| TC-ID | Mô tả | Result | Defects |
|---|---|---|---|
| A_UC01_01 | Duyệt công ty pending | | |
| A_UC01_02 | Liệt kê pending | | |
| A_UC01_03 | Pending rỗng | | |
| A_UC01_04 | Duyệt lại công ty đã duyệt | | |
| A_UC01_05 | ID company không tồn tại | | |
| A_UC02_01 | Cập nhật commission hợp lệ | | |
| A_UC02_02 | Commission âm | | |
| A_UC02_03 | Commission không phải số | | |
| A_UC02_04 | Liệt kê tất cả công ty | | |
| A_UC02_05 | Commission biên 100 | | |
| A_UC03_01 | Tạo điểm đến hợp lệ | | |
| A_UC03_02 | Cập nhật mô tả | | |
| A_UC03_03 | Xóa điểm đến không liên kết | | |
| A_UC03_04 | Xóa điểm đến đang có tour | | |
| A_UC03_05 | Tên trùng | | |
| A_UC03_06 | Thiếu name | | |
| A_UC04_01 | Xem tất cả tour | Blocked | DEFERRED — endpoint chưa implement |
| A_UC04_02 | Gỡ tour vi phạm | Blocked | DEFERRED — endpoint chưa implement |

---

## 4. Defect List

> Mỗi defect mới phát sinh trong quá trình test ghi 1 dòng. Status: `Open` / `Fixed` / `Wontfix` / `Deferred`.

| Defect ID | Severity | TC liên quan | Mô tả ngắn | Status | Evidence |
|---|---|---|---|---|---|
| _DEF-001_ | _<Critical/High/Medium/Low>_ | _<TC-ID>_ | _<mô tả ngắn>_ | _<Open/Fixed/...>_ | `docs/evidence/<file>.png` |

(Thêm dòng mới khi cần. Nếu không có defect, ghi rõ "No defects found in this cycle.")

### Known issues (DEFERRED)

| TC-ID | Mô tả | Lý do hoãn |
|---|---|---|
| TC_UC04_02 | Validate `start_date` quá khứ | Service hiện chỉ validate `start_date < end_date`; dev ticket cần mở để bổ sung guard |
| A_UC04_01 | Xem tất cả tour (admin) | Blueprint `/api/admin/tours` chưa có trong codebase |
| A_UC04_02 | Gỡ tour vi phạm (admin) | Blueprint `/api/admin/tours/<id>` chưa có trong codebase |

---

## 5. Sign-off

| Vai trò | Họ tên | Ngày | Chữ ký |
|---|---|---|---|
| QA Lead | _<điền>_ | _<YYYY-MM-DD>_ | _<điền>_ |
| Project Manager | _<điền>_ | _<YYYY-MM-DD>_ | _<điền>_ |

> Hai signatories phải đồng ý zero-open-Critical/High trước khi tick.
