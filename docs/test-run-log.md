# Test Run Log — Hệ thống Đặt Tour

**Phiên bản:** 1.0 (template) | **Ngày bắt đầu:** _<điền khi run>_ | **Ngày kết thúc:** _<điền khi run>_
**Tài liệu tham chiếu:** `docs/test-case.md` · `docs/test-plan.md` · `docs/test-report.md`

> **Hướng dẫn điền log**
> - Mỗi TC có duy nhất một dòng. Ghi `Pass` / `Fail` / `Blocked` vào cột **Result**.
> - **Evidence** ghi đường dẫn tương đối từ repo root (vd. `docs/evidence/TC_UC01_01-step1.png`). Tối thiểu 1 ảnh / TC.
> - Cột **Notes**: ghi lỗi quan sát được, môi trường, version commit, hoặc lý do `Blocked`.
> - TC `DEFERRED` (xem cột Marker trong `test-case.md`) được đánh dấu `Blocked` mặc định và link sang ticket / lý do trong Notes.

## 1. Công ty du lịch (TC-UC)

| TC-ID | Tester | Date | Result | Evidence | Notes |
|---|---|---|---|---|---|
| TC_UC01_01 | | | | | |
| TC_UC01_02 | | | | | |
| TC_UC01_03 | | | | | |
| TC_UC01_04 | | | | | |
| TC_UC02_01 | | | | | |
| TC_UC02_02 | | | | | |
| TC_UC02_03 | | | | | |
| TC_UC02_04 | | | | | |
| TC_UC03_01 | | | | | |
| TC_UC03_02 | | | | | |
| TC_UC03_03 | | | | | |
| TC_UC03_04 | | | | | |
| TC_UC03_05 | | | | | |
| TC_UC03_06 | | | | | |
| TC_UC04_01 | | | | | |
| TC_UC04_02 | | | | | DEFERRED — service không validate `start_date` quá khứ. |
| TC_UC04_03 | | | | | |
| TC_UC04_04 | | | | | |
| TC_UC04_05 | | | | | |
| TC_UC05_01 | | | | | |
| TC_UC05_02 | | | | | |
| TC_UC05_03 | | | | | |
| TC_UC05_04 | | | | | |
| TC_UC05_05 | | | | | |

## 2. Du khách (T-UC)

| TC-ID | Tester | Date | Result | Evidence | Notes |
|---|---|---|---|---|---|
| T_UC01_01 | | | | | |
| T_UC01_02 | | | | | |
| T_UC01_03 | | | | | |
| T_UC01_04 | | | | | |
| T_UC02_01 | | | | | |
| T_UC02_02 | | | | | |
| T_UC02_03 | | | | | |
| T_UC02_04 | | | | | |
| T_UC03_01 | | | | | |
| T_UC03_02 | | | | | |
| T_UC03_03 | | | | | |
| T_UC03_04 | | | | | |
| T_UC04_01 | | | | | |
| T_UC04_02 | | | | | |
| T_UC04_03 | | | | | |
| T_UC05_01 | | | | | |
| T_UC05_02 | | | | | |
| T_UC05_03 | | | | | |
| T_UC05_04 | | | | | |
| T_UC05_05 | | | | | |
| T_UC05_06 | | | | | |
| T_UC05_07 | | | | | |
| T_UC05_08 | | | | | |

## 3. Quản trị viên (A-UC)

| TC-ID | Tester | Date | Result | Evidence | Notes |
|---|---|---|---|---|---|
| A_UC01_01 | | | | | |
| A_UC01_02 | | | | | |
| A_UC01_03 | | | | | |
| A_UC01_04 | | | | | |
| A_UC01_05 | | | | | |
| A_UC02_01 | | | | | |
| A_UC02_02 | | | | | |
| A_UC02_03 | | | | | |
| A_UC02_04 | | | | | |
| A_UC02_05 | | | | | |
| A_UC03_01 | | | | | |
| A_UC03_02 | | | | | |
| A_UC03_03 | | | | | |
| A_UC03_04 | | | | | |
| A_UC03_05 | | | | | |
| A_UC03_06 | | | | | |
| A_UC04_01 | | | | | DEFERRED — endpoint `/api/admin/tours` chưa implement. |
| A_UC04_02 | | | | | DEFERRED — endpoint `/api/admin/tours/<id>` chưa implement. |

## Tổng kết execution

| Chỉ số | Giá trị |
|---|---|
| Tổng số TC | 56 |
| Pass | _<điền>_ |
| Fail | _<điền>_ |
| Blocked / Deferred | _<điền>_ |
| Pass rate (Pass / (Pass+Fail)) | _<điền>_% |

> Reconcile các số trên với `docs/test-report.md` §Executive Summary trước khi sign-off.
