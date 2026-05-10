# Test Summary — Hệ thống Đặt Tour

| Mục | Giá trị |
|---|---|
| Project | Tour Booking System |
| Version / Commit | `1617219` |
| Test cycle | Submission cycle 1 — 2026-05-10 |
| Tester | Trương Hưng Phát (HP) |
| Ngày tổng hợp | 2026-05-10 |
| Tài liệu nguồn | `docs/test-plan.md` · `docs/test-case.md` · `docs/test-run-log.md` · `docs/test-report.md` |

---

## 1. Bảng chỉ số bắt buộc

| Chỉ số | Giá trị | Nguồn |
|---|---|---|
| **Tổng số test case** | **56** | `docs/test-case.md` (TC-UC + T-UC + A-UC) — đối soát `docs/test-run-log.md` §Tổng kết |
| **Pass rate** | **100 %** (53 Pass / 53 Executed) — **94.6 %** nếu tính cả 3 DEFERRED trên tổng 56 | `docs/test-report.md` §1 Executive Summary |
| **BE unit coverage** | **85.60 %** (gate ≥ 70 %) | `pytest backend/tests/ --cov=src` — `docs/test-report.md` §6 |
| **FE unit coverage** | **Statements 85.79 % · Branches 80.60 % · Functions 57.94 % · Lines 85.79 %** | `frontend/coverage/lcov-report/index.html` (Vitest + V8) |
| **Automation pass rate** | **100 %** — **220/220** pytest backend pass; **5/5** BE E2E journeys; **11** Playwright FE E2E specs (chạy trên CI GitHub Actions) | BE: `pytest backend/tests/`; BE E2E: `backend/tests_e2e/`; FE: `frontend/e2e/*.spec.ts` |

> **Verdict:** **PASS WITH CONCERNS** — toàn bộ TC trong phạm vi đều đạt; 3 TC `DEFERRED` (TC_UC04_02, A_UC04_01, A_UC04_02) ngoài phạm vi do endpoint/guard chưa implement (đã có ticket follow-up).

---

## 2. Phân rã manual test case

| Nhóm | Tổng | Pass | Fail | Blocked / Deferred |
|---|---|---|---|---|
| Công ty du lịch (TC-UC) | 24 | 23 | 0 | 1 |
| Du khách (T-UC) | 23 | 23 | 0 | 0 |
| Quản trị viên (A-UC) | 18 | 16 | 0 | 2 |
| **Tổng** | **56 (53 executed)** | **53** | **0** | **3 deferred** |

**Pass / Executed = 53 / 53 = 100 %.** **Pass / Total = 53 / 56 = 94.6 %.**

---

## 3. Backend unit coverage chi tiết

| Chỉ số | Giá trị |
|---|---|
| Test count | 220 |
| Passed | 220 |
| Failed | 0 |
| Duration | ~6.55 s |
| Coverage tổng | **85.60 %** (gate ≥ 70 %) |
| `src/services/auth_service.py` | 100 % |
| `src/routes/public.py` | 100 % |
| `src/services/company_service.py` | 64 % (thấp nhất — admin/upload edge paths chưa cover) |

Lệnh: `pytest backend/tests/ --cov=src --cov-report=term-missing --cov-fail-under=70`.

---

## 4. Frontend unit coverage chi tiết

| Chỉ số | Cover | Total | % |
|---|---|---|---|
| Statements | 3520 | 4103 | **85.79 %** |
| Branches | 424 | 526 | **80.60 %** |
| Functions | 124 | 214 | **57.94 %** |
| Lines | 3520 | 4103 | **85.79 %** |

**Bộ test:** Vitest + Testing Library, 19 file `*.test.ts(x)` trong `frontend/src/` (lib, stores, pages auth/admin/company/guest). Lệnh: `npm --prefix frontend run test:coverage` (provider `v8`, output `frontend/coverage/`).

---

## 5. Automation pass rate

| Bộ automation | Số test | Passed | Failed | Pass rate |
|---|---|---|---|---|
| BE pytest unit + integration (`backend/tests/`) | 220 | 220 | 0 | **100 %** |
| BE E2E happy-path (`backend/tests_e2e/`) | 5 | 5 | 0 | **100 %** |
| FE Playwright E2E (`frontend/e2e/`) | 11 specs | 11 | 0 | **100 %** |
| **Tổng automation** | **236** | **236** | **0** | **100 %** |

**BE E2E breakdown:**
- `test_company_journey.py`: 2 (full-journey approve→tour→departure, missing company_name 400)
- `test_tourist_journey.py`: 3 (tourist books tour, book without auth 401, overbooking 400)

**FE E2E breakdown:**
- `auth.spec.ts`: 7 (guest/company/admin login, pending company, invalid creds, logout, seed mirror)
- `guest-booking.spec.ts`: 2 (full booking flow, POST 500 surface error)
- `admin.spec.ts`: 1 (approve pending company)
- `company-crud.spec.ts`: 1 (add tour appears in list)

**CI:** GitHub Actions chạy `pytest` + `npm test` mỗi push. Coverage gate BE ≥ 70 % bắt buộc qua `--cov-fail-under=70`.

---

## 6. Defects & known issues

| Loại | Số lượng |
|---|---|
| Critical (open) | 0 |
| High (open) | 0 |
| Medium (open) | 0 |
| Low (open) | 0 |
| Defect mới phát sinh trong cycle | 0 |
| TC DEFERRED (track sang sprint sau) | 3 |

**DEFERRED:**
- `TC_UC04_02` — validate `start_date` quá khứ → ticket `BE-DEP-PAST-GUARD`.
- `A_UC04_01` — admin xem tất cả tour → ticket `BE-ADMIN-TOURS-LIST` (endpoint chưa implement).
- `A_UC04_02` — admin gỡ tour vi phạm → ticket `BE-ADMIN-TOURS-DELETE` (endpoint chưa implement).

---

## 7. Sign-off

| Vai trò | Họ tên | Ngày | Trạng thái |
|---|---|---|---|
| QA Lead | Trương Hưng Phát | 2026-05-10 | _Pending_ |
| Project Manager | Lê Duy Mạnh | 2026-05-10 | _Pending_ |

Đủ điều kiện sign-off: 0 Critical / 0 High open · BE coverage 85.60 % vượt gate 70 % · FE statements coverage 85.79 % · automation 236/236 pass.