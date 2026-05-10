# Báo Cáo Automation Test — Hệ thống Đặt Tour

| Mục | Giá trị |
|---|---|
| Project | Tour Booking System |
| Version / Commit | `1617219` (2026-05-10) |
| Cycle | Submission cycle 1 — 2026-05-10 |
| Người tổng hợp | Trương Hưng Phát (QA / Tester) |
| Ngày phát hành | 2026-05-10 |
| Phạm vi | Toàn bộ automation: BE pytest unit + integration, BE E2E API, FE Vitest unit, FE Playwright E2E, CI GitHub Actions |
| Tài liệu liên quan | `docs/test-plan.md` · `docs/test-report.md` · `docs/test-summary.md` · `docs/test-run-log.md` |

---

## 1. Tóm tắt

| Chỉ số | Giá trị |
|---|---|
| Tổng số automation test | **236** |
| Pass | **236** |
| Fail | **0** |
| Pass rate | **100 %** |
| BE coverage tổng | **85.60 %** (gate ≥ 70 %) |
| FE coverage statements | **85.79 %** |
| FE coverage branches | **80.60 %** |
| FE coverage functions | **57.94 %** |
| Thời gian chạy BE pytest | ~6.55 s |
| CI status | Xanh (`ci.yml` + `playwright-e2e.yml` pass trên main) |

**Kết luận:** Tất cả automation suites đều **PASS**. Hệ thống đủ điều kiện sign-off về mặt automation; coverage gate vượt yêu cầu; không có flakiness ghi nhận trong cycle này.

---

## 2. Cấu trúc bộ automation

```
backend/
├── tests/                          # 220 unit + integration (pytest)
│   ├── unit/                       # 13 file — services, utils, integrations
│   ├── integration/                # 9 file — routes, pagination, rate-limit
│   ├── helpers/                    # fixtures dùng chung
│   └── conftest.py                 # SQLite in-memory app fixture
└── tests_e2e/                      # 5 happy-path E2E (Flask + MySQL)
    ├── test_company_journey.py     # 2 case
    └── test_tourist_journey.py     # 3 case

frontend/
├── src/**/*.test.ts(x)             # 19 file Vitest unit + Testing Library
└── e2e/                            # 11 spec Playwright (Chromium)
    ├── auth.spec.ts                # 7 spec
    ├── guest-booking.spec.ts       # 2 spec
    ├── admin.spec.ts               # 1 spec
    └── company-crud.spec.ts        # 1 spec

.github/workflows/
├── ci.yml                          # PR gate: lint + pytest + vitest
├── playwright-e2e.yml              # PR + main: full FE E2E (MySQL + Flask + Vite)
└── automation-tests.yml            # Manual dispatch: BE E2E + HTML report
```

---

## 3. Backend pytest (unit + integration)

### 3.1 Số liệu tổng

| Chỉ số | Giá trị | Nguồn |
|---|---|---|
| Test count | 220 | `pytest backend/tests/` |
| Passed | 220 | idem |
| Failed | 0 | idem |
| Duration | 6.55 s | idem |
| Coverage tổng | **85.60 %** | `--cov=src --cov-fail-under=70` |

Lệnh chạy:
```bash
pytest backend/tests/ --cov=src --cov-report=term-missing --cov-fail-under=70
```

### 3.2 Coverage theo module (trích)

| Module | Coverage | Ghi chú |
|---|---|---|
| `src/services/auth_service.py` | 100 % | Login, register, JWT đầy đủ |
| `src/routes/public.py` | 100 % | Tour search/detail public |
| `src/services/guest_service.py` | ~95 % | Booking + payment paths cover |
| `src/services/admin_service.py` | ~88 % | Approve company, commission, destination |
| `src/services/company_service.py` | **64 %** | Thấp nhất — admin/upload edge paths chưa cover |
| `src/integrations/payment.py` | ~90 % | SePay mock + amount validation |
| `src/utils/rate_limit.py` | ~85 % | Login 5/min, booking 10/min |

> Module `company_service.py` được flag là technical debt — bổ sung test cho upload edge cases ở sprint kế tiếp (`BE-COMPANY-UPLOAD-COV`).

---

## 4. Backend E2E API (`tests_e2e/`)

Bộ E2E chạy với MySQL service container (production parity), Flask process thực, không mock DB.

| Spec | Số case | Pass | Mô tả |
|---|---|---|---|
| `test_company_journey.py` | 2 | 2 | (a) full journey: admin approve → company tạo tour → tạo departure (b) thiếu `company_name` → 400 |
| `test_tourist_journey.py` | 3 | 3 | (a) tourist book tour thành công (b) book khi chưa auth → 401 (c) overbooking vượt số chỗ → 400 |
| **Tổng** | **5** | **5** | Pass rate 100 % |

Lệnh chạy (manual dispatch trong CI):
```bash
pytest tests_e2e/ --no-cov --html=report.html --self-contained-html
```

Artifact: `automation-report` (HTML self-contained) upload về Actions tab — dùng để đối soát rubric +20 % bonus.

---

## 5. Frontend Vitest (unit + component)

### 5.1 Coverage detail

| Loại | Cover | Total | % |
|---|---|---|---|
| Statements | 3520 | 4103 | **85.79 %** |
| Branches | 424 | 526 | **80.60 %** |
| Functions | 124 | 214 | **57.94 %** |
| Lines | 3520 | 4103 | **85.79 %** |

Tool: Vitest + Testing Library, provider coverage `v8`. 19 file `*.test.ts(x)` trong `frontend/src/`.

Phạm vi cover:
- `src/lib/format.test.ts` — utility format date/currency
- `src/pages/auth/{Login,Register}Page.test.tsx` — form validation, submit flow
- `src/pages/admin/{Companies,Dashboard,Destinations}Page.test.tsx` — CRUD UI
- `src/pages/company/{AddTour,AddDeparture,Bookings,Dashboard}Page.test.tsx` — company workflows
- `src/pages/guest/*` — search, detail, booking confirmation
- `src/stores/*` — Zustand auth store

Lệnh:
```bash
npm --prefix frontend run test:coverage
```

---

## 6. Frontend Playwright E2E

Cấu hình: Chromium, base URL `http://127.0.0.1:3000`, browser headless trong CI, headed local. Stack chạy: MySQL 8 + Flask backend + Vite preview server (đã build).

### 6.1 Spec breakdown

| File | Số spec | Pass | Phạm vi |
|---|---|---|---|
| `auth.spec.ts` | 7 | 7 | Login guest/company/admin, pending company guard, sai mật khẩu, logout, seed data mirror |
| `guest-booking.spec.ts` | 2 | 2 | Full booking flow (search → detail → checkout → confirmation), 500 surface error |
| `admin.spec.ts` | 1 | 1 | Approve pending company từ UI admin |
| `company-crud.spec.ts` | 1 | 1 | Add tour → tour xuất hiện trong list |
| **Tổng** | **11** | **11** | Pass rate 100 % |

### 6.2 Tuning CI

- `BCRYPT_ROUNDS=4` — giảm chi phí login fixture (cost 12 mặc định gây bottleneck với parallel workers)
- `DISABLE_RATE_LIMIT=true` — Playwright workers share IP, login 5/min cap sẽ 429 sau vài fixture logins
- `JWT_EXPIRY_MINUTES` mở rộng — tránh token expire giữa long e2e flow

Artifact upload khi fail: `playwright-report/`, `test-results/` (trace, screenshot, video).

---

## 7. CI/CD GitHub Actions

| Workflow | Trigger | Job | Mục đích |
|---|---|---|---|
| `ci.yml` | PR + push main | lint + pytest + vitest | Gate merge — coverage `--cov-fail-under=70` bắt buộc pass |
| `playwright-e2e.yml` | PR + push main | Playwright Chromium | Catch regression UI flow trước khi merge |
| `automation-tests.yml` | `workflow_dispatch` | BE E2E (MySQL service) | Chạy thủ công cho rubric bonus, không block PR |

Concurrency: `cancel-in-progress` để các push liên tiếp không tích lũy job thừa.

---

## 8. Hướng dẫn chạy

### Backend pytest (toàn bộ)
```bash
cd backend
pytest tests/ --cov=src --cov-report=term-missing --cov-report=html
# Coverage HTML: backend/htmlcov/index.html
```

### Backend E2E (cần MySQL chạy local hoặc Docker)
```bash
cd backend
flask run &                                  # cần env DATABASE_URL
pytest tests_e2e/ --html=report.html --self-contained-html
```

### Frontend Vitest
```bash
npm --prefix frontend run test                # watch mode
npm --prefix frontend run test:coverage       # full coverage
# Coverage HTML: frontend/coverage/lcov-report/index.html
```

### Frontend Playwright
```bash
# Cần backend chạy (port 5000) + frontend preview (port 3000)
npm --prefix frontend run e2e                # headless Chromium
npm --prefix frontend run e2e -- --headed    # headed debug
# Report: frontend/playwright-report/index.html
```

---

## 11. Sign-off automation

| Vai trò | Họ tên | Ngày | Trạng thái |
|---|---|---|---|
| QA Lead | Trương Hưng Phát | 2026-05-10 | Đạt — 236/236 pass, coverage gate vượt |
| DevOps | (CI bot) | 2026-05-10 | Đạt — `ci.yml` + `playwright-e2e.yml` xanh trên main |
| Project Manager | Lê Duy Mạnh | 2026-05-10 | _Pending_ |

**Kết luận:** Bộ automation đáp ứng đầy đủ yêu cầu rubric — 100 % pass rate, coverage BE 85.60 % (vượt gate 70 %), FE statements 85.79 %, không có flaky test còn mở. Sẵn sàng submission.

---