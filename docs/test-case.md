# Test Cases — Tour Booking System

**Version:** 1.0 | **Author:** Trương Hưng Phát | **Date:** Apr 29, 2025
**Refs:** `docs/test-plan.md` · `docs/api-docs.md`

---

## Tourism Company

### TC-UC-01 · Register

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| TC_UC01_01 | Register with all valid data | EP (Valid) | DB running; `newco@test.com` not registered | 1. POST `/companies/register` with `ten_cong_ty`, `email`, `mat_khau`, `so_dien_thoai`, `dia_chi` all valid | HTTP 201; record in DB with `trang_thai = cho_duyet`; response has company ID | |
| TC_UC01_02 | Register with duplicate email | EP (Invalid) | `abc@travel.com` already registered | 1. POST `/companies/register` with `email = abc@travel.com` and valid other fields | HTTP 409 or 400; error "email already exists"; no duplicate record | |
| TC_UC01_03 | Register with missing required field (`mat_khau`) | EP (Invalid) | None | 1. POST `/companies/register` omitting `mat_khau` | HTTP 400; validation error listing missing field; no record inserted | |

### TC-UC-02 · Login

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| TC_UC02_01 | Login with valid credentials | EP (Valid) | Company exists with `trang_thai = da_duyet` | 1. POST `/users/login` with correct `email` and `mat_khau` | HTTP 200; `token` (JWT) in response; `vai_tro = cong_ty` | |
| TC_UC02_02 | Login with wrong password | EP (Invalid) | Company account exists | 1. POST `/users/login` with correct email, wrong `mat_khau` | HTTP 401; error message; no token returned | |
| TC_UC02_03 | Login with unregistered email | EP (Invalid) | None | 1. POST `/users/login` with `email = ghost@test.com` | HTTP 401; error message; no token returned | |
| TC_UC02_04 | Login with pending-approval account | Scenario | Company exists with `trang_thai = cho_duyet` | 1. POST `/users/login` with valid credentials of pending company | HTTP 403; error "account not approved"; no token returned | |

### TC-UC-03 · Manage Tour & Itinerary

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| TC_UC03_01 | Create tour with valid data | EP (Valid) | Authenticated approved company; `diem_den_id = 2` exists | 1. POST `/tours` with `ten_tour`, `mo_ta`, `gia`, `so_ngay`, `diem_den_id`, `cong_ty_id` all valid | HTTP 201; tour record in DB; `tour_id` in response | |
| TC_UC03_02 | Edit existing tour | EP (Valid) | Authenticated approved company; tour owned by company exists | 1. PUT `/tours/{id}` with updated `ten_tour` and `gia` | HTTP 200; DB record updated; response reflects new values | |
| TC_UC03_03 | Delete tour with no active bookings | EP (Valid) | Authenticated; tour exists; no active bookings | 1. DELETE `/tours/{id}` | HTTP 200; record removed; GET `/tours/{id}` returns 404 | |
| TC_UC03_04 | Create tour missing `ten_tour` | EP (Invalid) | Authenticated approved company | 1. POST `/tours` omitting `ten_tour` | HTTP 400; validation error for missing field; no record inserted | |

### TC-UC-04 · Schedule Departure

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| TC_UC04_01 | Create departure with valid date and seats | EP (Valid) | Authenticated; tour exists | 1. POST `/departures` with `tour_id`, `ngay_khoi_hanh = 2026-09-01`, `so_cho = 20` | HTTP 201; record in DB with `so_cho_con_lai = 20`; appears in `GET /departures?tour_id=X` | |
| TC_UC04_02 | Create departure with past date | EP (Invalid) | Authenticated; tour exists | 1. POST `/departures` with `ngay_khoi_hanh = 2020-01-01` | HTTP 400; error "departure date must be in the future"; no record inserted | |
| TC_UC04_03 | Create departure with zero seats | BVA (boundary = 0) | Authenticated; tour exists | 1. POST `/departures` with `so_cho = 0` | HTTP 400; validation error for seat count; no record inserted | |
| TC_UC04_04 | Create departure with 1 seat (minimum valid) | BVA (boundary = 1) | Authenticated; tour exists | 1. POST `/departures` with `so_cho = 1` | HTTP 201; record created successfully | |

### TC-UC-05 · Business Statistics Dashboard

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| TC_UC05_01 | View dashboard with existing tours and revenue | EP (Valid) | Authenticated; ≥1 tour and ≥1 completed booking exist | 1. Navigate to company dashboard | Totals for tours, departures, revenue shown; values match DB records | |
| TC_UC05_02 | View dashboard with no tours created | Scenario | Authenticated; no tours created yet | 1. Navigate to company dashboard | All statistics show 0; no error or crash | |

---

## Tourist

### T-UC-01 · Register

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| T_UC01_01 | Register with all valid data | EP (Valid) | `tourist@test.com` not registered | 1. POST `/users/register` with `ten`, `email`, `mat_khau`, `so_dien_thoai`, `ngay_sinh`, `gioi_tinh`, `so_ho_chieu` all valid | HTTP 201; user record in DB with `vai_tro = du_khach`; `user_id` in response | |
| T_UC01_02 | Register with duplicate email | EP (Invalid) | `a@gmail.com` already registered | 1. POST `/users/register` with `email = a@gmail.com` | HTTP 409 or 400; error "email already exists"; no duplicate inserted | |
| T_UC01_03 | Register with invalid email format | EP (Invalid) | None | 1. POST `/users/register` with `email = not-an-email` | HTTP 400; validation error for invalid email format; no record inserted | |
| T_UC01_04 | Register with missing `mat_khau` | EP (Invalid) | None | 1. POST `/users/register` omitting `mat_khau` | HTTP 400; validation error listing missing field; no record inserted | |

### T-UC-02 · Login

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| T_UC02_01 | Login with valid credentials | EP (Valid) | Tourist account exists | 1. POST `/users/login` with correct `email` and `mat_khau` | HTTP 200; `token` (JWT) in response; `vai_tro = du_khach` | |
| T_UC02_02 | Login with wrong password | EP (Invalid) | Tourist account exists | 1. POST `/users/login` with correct email, wrong `mat_khau` | HTTP 401; error message; no token returned | |
| T_UC02_03 | Login with unregistered email | EP (Invalid) | None | 1. POST `/users/login` with `email = ghost@test.com` | HTTP 401; error message; no token returned | |

### T-UC-03 · Search Tours

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| T_UC03_01 | Search by destination with matches | EP (Valid) | ≥1 active tour for destination "Paris" | 1. GET `/tours?diem_den=Paris` | HTTP 200; only tours with destination "Paris" returned; name, price, departure info shown | |
| T_UC03_02 | Search by departure date with matches | EP (Valid) | ≥1 departure on `2026-09-01` | 1. GET `/tours?ngay_khoi_hanh=2026-09-01` | HTTP 200; only tours with departure on that date returned | |
| T_UC03_03 | Search returns no results | Scenario | No tours for destination "Atlantis" | 1. Search with destination "Atlantis" | HTTP 200; empty array; UI shows "no tours found" message; no crash | |
| T_UC03_04 | Browse all tours without filter | EP (Valid) | ≥3 active tours exist | 1. GET `/tours` (no query params) | HTTP 200; all active tours listed; UI renders without error | |

### T-UC-04 · View Tour Detail

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| T_UC04_01 | View detail of an existing tour | EP (Valid) | Tour with `tour_id = 5` exists | 1. GET `/tours/5` | HTTP 200; response includes `ten_tour`, `mo_ta`, `gia`, `lich_trinh` array; UI renders all sections | |
| T_UC04_02 | View detail with non-existent tour ID | EP (Invalid) | No tour with `tour_id = 9999` | 1. GET `/tours/9999` | HTTP 404; error message; UI shows not-found state | |

### T-UC-05 · Book Tour & Pay Deposit

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| T_UC05_01 | Successful booking with available seats | EP (Valid) | Authenticated tourist; departure `lich_khoi_hanh_id = 3` has `so_cho_con_lai ≥ 2` | 1. POST `/booking` with `lich_khoi_hanh_id = 3`, `so_luong_nguoi = 2`, `tien_coc = 300` | HTTP 201; booking created with `trang_thai = da_dat_coc`; `so_cho_con_lai` decremented by 2; notification triggered for company and tourist | |
| T_UC05_02 | Booking exceeds available seats | EP (Invalid) | Authenticated tourist; departure has `so_cho_con_lai = 1` | 1. POST `/booking` with `so_luong_nguoi = 5` | HTTP 400 or 409; error "not enough seats"; no booking record; seat count unchanged | |
| T_UC05_03 | Booking without authentication | Scenario | No Authorization header / no session | 1. POST `/booking` without JWT token | HTTP 401; no booking created; UI redirects to login | |
| T_UC05_04 | Book exactly the last available seat | BVA (boundary = seats left) | Authenticated tourist; departure has `so_cho_con_lai = 2` | 1. POST `/booking` with `so_luong_nguoi = 2` | HTTP 201; booking created; `so_cho_con_lai` becomes 0; subsequent booking attempt returns error | |

---

## Admin

### A-UC-01 · Approve / Reject Tourism Company

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| A_UC01_01 | Approve a pending company | EP (Valid) | Authenticated Admin; company with `trang_thai = cho_duyet` exists | 1. Set company status to `da_duyet` | HTTP 200; `trang_thai = da_duyet` in DB; company can now log in and post tours | |
| A_UC01_02 | Reject a pending company | EP (Valid) | Authenticated Admin; company with `trang_thai = cho_duyet` exists | 1. Set company status to `tu_choi` | HTTP 200; `trang_thai = tu_choi` in DB; company login returns 403 | |
| A_UC01_03 | View pending list when no pending companies | Scenario | Authenticated Admin; no companies with `trang_thai = cho_duyet` | 1. GET `/companies?trang_thai=cho_duyet` | HTTP 200; empty array; UI shows "no pending companies" message | |

### A-UC-02 · Manage Approved Companies

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| A_UC02_01 | Edit company information | EP (Valid) | Authenticated Admin; approved company exists | 1. PUT `/companies/{id}` with updated `ten_cong_ty` and `dia_chi` | HTTP 200; DB record updated; response reflects new values | |
| A_UC02_02 | Deactivate an approved company | Scenario | Authenticated Admin; company has `trang_thai = da_duyet` | 1. Set company status to `khoa` | HTTP 200; `trang_thai = khoa` in DB; company login returns 403; tours hidden from tourist search | |

### A-UC-03 · Manage Destination Categories (CRUD)

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| A_UC03_01 | Add new destination with valid data | EP (Valid) | Authenticated Admin; "Kyoto" does not exist | 1. POST `/destinations` with `ten_diem_den = "Kyoto"`, `mo_ta`, `quoc_gia = "Nhật Bản"` | HTTP 201; record in DB; destination available in tour creation form | |
| A_UC03_02 | Edit existing destination description | EP (Valid) | Authenticated Admin; destination exists | 1. PUT `/destinations/{id}` with updated `mo_ta` | HTTP 200; DB record updated; response reflects new description | |
| A_UC03_03 | Delete destination with no linked tours | EP (Valid) | Authenticated Admin; destination exists; no tours linked to it | 1. DELETE `/destinations/{id}` | HTTP 200; record removed; GET returns 404 | |
| A_UC03_04 | Add destination with duplicate name | EP (Invalid) | "Paris" already exists | 1. POST `/destinations` with `ten_diem_den = "Paris"` | HTTP 409 or 400; error "destination already exists"; no new record | |

### A-UC-04 · Manage Tours on Platform

| Test Case ID | Description | Data Type | Preconditions | Steps | Expected Result | Notes |
|---|---|---|---|---|---|---|
| A_UC04_01 | View all tours across all companies | EP (Valid) | Authenticated Admin; ≥1 tour from any company | 1. GET `/tours` (Admin scope) | HTTP 200; all tours listed with company name, status, creation date | |
| A_UC04_02 | Remove a policy-violating tour | Scenario | Authenticated Admin; tour exists | 1. DELETE `/tours/{id}` as Admin | HTTP 200; tour removed from DB; no longer in tourist search results | |
| A_UC04_03 | Edit tour content as Admin | EP (Valid) | Authenticated Admin; tour exists | 1. PUT `/tours/{id}` with updated `mo_ta` | HTTP 200; DB updated; changes reflected in tourist tour detail view | |

---

## Summary

| Actor | Use Cases | TCs | High Priority | Medium Priority | Low Priority |
|---|---|---|---|---|---|
| Tourism Company | 5 | 15 | 8 | 6 | 1 |
| Tourist | 5 | 14 | 9 | 4 | 1 |
| Admin | 4 | 10 | 5 | 4 | 1 |
| **Total** | **14** | **39** | **22** | **14** | **3** |
