# Test Cases — Hệ thống Đặt Tour

**Phiên bản:** 3.0 | **Tác giả:** Trương Hưng Phát | **Ngày:** 06/05/2026
**Tài liệu tham chiếu:** `docs/test-plan.md` · `docs/api-docs.md` · `backend/src/`

---

## 0. Substitution Map (giá trị cụ thể dùng trong toàn bộ test)

> Mọi test case dưới đây dùng các giá trị/định danh sau. Khi seed DB hoặc viết script test, dùng đúng các giá trị này thay cho `<placeholder>`.

### 0.1 Hạ tầng & Auth

| Khóa | Giá trị | Nguồn |
|---|---|---|
| `BASE_URL` | `http://localhost:5000` | `backend/run.py` |
| `AUTH_HEADER` | `Authorization: Bearer <access_token>` | `flask-jwt-extended`, `src/utils/auth.py` |
| Hash mật khẩu | `bcrypt` | `src/utils/auth.py:hash_password` |

### 0.2 Tài khoản seed (DB test)

| Vai trò | Email | Password | Trạng thái phụ |
|---|---|---|---|
| Admin | `admin@test.com` | `Admin@123` | `role = ADMIN`, `is_active = True` |
| Company (đã duyệt) | `abc@travel.com` | `Company@123` | `role = COMPANY`, `company_profile.is_approved = True` |
| Company (chờ duyệt) | `pending@travel.com` | `Company@123` | `role = COMPANY`, `company_profile.is_approved = False` |
| Guest | `a@gmail.com` | `Guest@123` | `role = GUEST` |
| Email mới (chưa tạo) | `newco@test.com`, `tourist@test.com` | — | dùng cho TC đăng ký |
| Email không tồn tại | `ghost@test.com` | — | dùng cho TC đăng nhập sai |

### 0.3 Resource ID seed

| Khóa | Giá trị | Ghi chú |
|---|---|---|
| `DESTINATION_ACTIVE_ID` | `1` (`name="Đà Lạt"`) | Có ≥1 tour ACTIVE liên kết |
| `DESTINATION_FREE_ID` | `2` (`name="Phú Quốc"`) | Không có tour nào liên kết — dùng để test xóa thành công |
| `DESTINATION_LINKED_ID` | `1` | Có tour liên kết — test xóa fail |
| `EXISTING_DESTINATION_NAME` | `"Paris"` | Tên đã tồn tại — test trùng |
| `NEW_DESTINATION_NAME` | `"Kyoto"` | Tên chưa tồn tại |
| `TOUR_ACTIVE_ID` | `5` | `status = ACTIVE`, thuộc company `abc@travel.com` |
| `TOUR_NONEXISTENT_ID` | `9999` | Không tồn tại |
| `DEPARTURE_AVAILABLE_ID` | `3` | `available_seats ≥ 2`, `start_date > now` |
| `COMPANY_PENDING_ID` | id của `company_profile` ứng với `pending@travel.com` | |
| `COMPANY_APPROVED_ID` | id của `company_profile` ứng với `abc@travel.com` | |

### 0.4 Enum / status flag (đúng theo `src/constants.py`)

| Constant | Các giá trị hợp lệ |
|---|---|
| `UserRole` | `ADMIN`, `COMPANY`, `GUEST` |
| `TourStatus` | `DRAFT` *(default khi tạo)*, `PENDING`, `ACTIVE`, `COMPLETED`, `CANCELLED` |
| `DepartureStatus` | `PLANNED` *(default)*, `IN_PROGRESS`, `COMPLETED`, `CANCELLED` |
| `BookingStatus` | `PENDING` *(default)*, `CONFIRMED`, `COMPLETED`, `CANCELLED` |
| `PaymentStatus` | `UNPAID` *(default)*, `DEPOSIT_PAID`, `FULLY_PAID`, `REFUNDED` |
| `Payment.status` (record) | `"SUCCESS"` *(hard-coded khi tạo)* |

**Quan trọng — hành vi mặc định:**
- Tour mới tạo qua `POST /api/company/tours` mặc định `status = DRAFT` → **không** xuất hiện trên `/api/public/tours`. Để test public list, phải `PUT` cập nhật `status = "ACTIVE"`.
- Booking mới tạo: `booking_status = PENDING`, `payment_status = UNPAID`.

### 0.5 Endpoint map (đúng theo `src/routes/`)

| Endpoint | Method | Decorator | Body field bắt buộc |
|---|---|---|---|
| `/api/auth/register` | POST | — | `email`, `password`, `role`, (`company_name` nếu COMPANY \| `full_name` nếu GUEST) |
| `/api/auth/login` | POST | — | `email`, `password` |
| `/api/auth/me` | GET | `@jwt_required` | — |
| `/api/public/tours` | GET | — | query: `keyword`, `destination_id` |
| `/api/public/tours/<id>` | GET | — | — |
| `/api/public/destinations` | GET | — | — |
| `/api/company/tours` | GET/POST | `@company_required` | POST: `name`, `description`, `price`, `total_days`, `destination_id` |
| `/api/company/tours/<id>` | GET/PUT/DELETE | `@company_required` | — |
| `/api/company/tours/<tour_id>/itineraries` | POST | `@company_required` | `day_number`, `title`, `description` |
| `/api/company/itineraries/<id>` | PUT/DELETE | `@company_required` | — |
| `/api/company/tours/<tour_id>/departures` | POST | `@company_required` | `start_date`, `end_date`, `total_seats` |
| `/api/company/bookings` | GET | `@company_required` | query: `status`, `departure_id` |
| `/api/company/bookings/<id>` | GET | `@company_required` | — |
| `/api/company/bookings/<id>/status` | PUT | `@company_required` | `booking_status` |
| `/api/guest/departures/<id>/book` | POST | `@guest_required` | `num_people` (int > 0) |
| `/api/guest/bookings` | GET | `@guest_required` | — |
| `/api/guest/bookings/<id>` | GET | `@guest_required` | — |
| `/api/guest/payments` | POST | `@guest_required` | `booking_id`, `amount`, `payment_method` |
| `/api/guest/payments` | GET | `@guest_required` | query: `booking_id` |
| `/api/admin/destinations` | GET/POST | `@admin_required` | POST: `name` |
| `/api/admin/destinations/<id>` | PUT/DELETE | `@admin_required` | — |
| `/api/admin/companies` | GET | `@admin_required` | query: `status=pending` |
| `/api/admin/companies/<id>/approve` | PUT | `@admin_required` | — |
| `/api/admin/companies/<id>/commission` | PUT | `@admin_required` | `commission_rate` (0–100) |

### 0.6 Response field map (key trả về thường dùng)

| Endpoint thành công | Field response |
|---|---|
| `POST /api/auth/register` | `message`, `user_id` |
| `POST /api/auth/login` | `access_token`, `user` (chứa `id`, `email`, `role`) |
| `POST /api/company/tours` | `message`, `tour_id` |
| `POST /api/company/tours/<id>/departures` | `message`, `departure_id` |
| `POST /api/guest/departures/<id>/book` | `message`, `booking_id`, `total_price` |
| `POST /api/guest/payments` | `message`, `payment_id`, **`booking_status`** (lưu ý: key là `booking_status` nhưng giá trị thực ra là `booking.payment_status` — xem `routes/guest.py:85`) |
| `PUT /api/company/bookings/<id>/status` | `message`, `new_status` |
| Lỗi validation/auth | `error`, `message` |

### 0.7 Marker (text-only, không dùng emoji)

- **IMPLEMENTED** — đã implement, có thể chạy thật
- **DEFERRED** — endpoint/hành vi chưa có trong codebase; test giữ lại để track yêu cầu nhưng cần được skip/xfail khi run
- **NOTE** — có ghi chú đặc biệt về sai lệch giữa spec và implementation

---

## 1. Công ty du lịch

### TC-UC-01 · Đăng ký

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| TC_UC01_01 | Đăng ký công ty hợp lệ | EP+ | `newco@test.com` chưa có trong DB | `POST /api/auth/register` `{email:"newco@test.com", password:"Company@123", role:"COMPANY", company_name:"NewCo Travel"}` | 201; body `{message, user_id}`; DB: `users.role=COMPANY`, `company_profiles.is_approved=False`, `commission_rate=0.0` (default) | IMPLEMENTED |
| TC_UC01_02 | Email trùng | EP− | `abc@travel.com` đã tồn tại | `POST /api/auth/register` `{email:"abc@travel.com", password:"x", role:"COMPANY", company_name:"X"}` | 400; `message="Email is already registered"` | IMPLEMENTED |
| TC_UC01_03 | Thiếu `password` | EP− | — | `POST /api/auth/register` `{email:"newco@test.com", role:"COMPANY", company_name:"NewCo"}` | 400; `message="Email and password are required"` | IMPLEMENTED |
| TC_UC01_04 | Thiếu `company_name` khi role=COMPANY | EP− | — | `POST /api/auth/register` `{email:"newco@test.com", password:"x", role:"COMPANY"}` | 400; `message="Company name is required for COMPANY role"`; transaction rollback (user **không** được lưu) | IMPLEMENTED |

### TC-UC-02 · Đăng nhập

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| TC_UC02_01 | Đăng nhập hợp lệ | EP+ | `abc@travel.com` tồn tại, `is_active=True` | `POST /api/auth/login` `{email:"abc@travel.com", password:"Company@123"}` | 200; body có `access_token`, `user.role="COMPANY"` | IMPLEMENTED |
| TC_UC02_02 | Sai mật khẩu | EP− | `abc@travel.com` tồn tại | `POST /api/auth/login` `{email:"abc@travel.com", password:"wrong"}` | 401; `message="Invalid email or password"` | IMPLEMENTED |
| TC_UC02_03 | Email chưa đăng ký | EP− | `ghost@test.com` không tồn tại | `POST /api/auth/login` `{email:"ghost@test.com", password:"x"}` | 401; `message="Invalid email or password"` | IMPLEMENTED |
| TC_UC02_04 | Company chờ duyệt truy cập Company API | Scenario | `pending@travel.com` có `is_approved=False` | 1) login → token; 2) `GET /api/company/tours` với token | (1) 200 + token; (2) 403; `message="Company is not approved by Admin yet"` | IMPLEMENTED |

### TC-UC-03 · Quản lý tour

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| TC_UC03_01 | Tạo tour hợp lệ | EP+ | Token company `abc@travel.com` (đã duyệt); `destination_id=2` tồn tại | `POST /api/company/tours` `{name:"Tour ABC", description:"...", price:1500000, total_days:3, destination_id:2}` | 201; body `{message:"Tour created successfully", tour_id}`; DB: `status="DRAFT"` NOTE | IMPLEMENTED NOTE |
| TC_UC03_02 | Cập nhật tour | EP+ | Tour `id=5` thuộc company hiện tại | `PUT /api/company/tours/5` `{name:"Tour ABC v2", price:1700000}` | 200; `message="Tour updated successfully"`; DB cập nhật | IMPLEMENTED |
| TC_UC03_03 | Xóa tour không có booking | EP+ | Tour tồn tại, mọi `departures[*].bookings.count()==0` | `DELETE /api/company/tours/<id>` | 200; `message="Tour deleted successfully"`; sau đó `GET /api/public/tours/<id>` → 404 | IMPLEMENTED |
| TC_UC03_04 | Tạo tour thiếu `name` | EP− | Token company hợp lệ | `POST /api/company/tours` `{description:"...", price:100, total_days:2, destination_id:2}` | 400; `message="Missing required field: name"` | IMPLEMENTED |
| TC_UC03_05 | Xóa tour có booking | EP− | Tour có ≥1 departure với booking | `DELETE /api/company/tours/<id>` | 400; `message="Cannot delete tour because there are bookings for its departures."` | IMPLEMENTED |
| TC_UC03_06 | `destination_id` không tồn tại | EP− | — | `POST /api/company/tours` `{...,destination_id:9999}` | 400; `message="Invalid destination_id"` | IMPLEMENTED |

### TC-UC-04 · Lên lịch khởi hành

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| TC_UC04_01 | Departure hợp lệ | EP+ | Tour 5 thuộc company | `POST /api/company/tours/5/departures` `{start_date:"2026-09-01T08:00:00", end_date:"2026-09-05T17:00:00", total_seats:20}` | 201; `{message:"Departure added successfully", departure_id}`; DB: `available_seats=20`, `status="PLANNED"` | IMPLEMENTED |
| TC_UC04_02 | Ngày bắt đầu trong quá khứ | EP− | Tour 5 thuộc company | `POST /api/company/tours/5/departures` `{start_date:"2020-01-01T00:00:00", end_date:"2020-01-05T00:00:00", total_seats:10}` | Mong đợi: 400 lỗi "departure date must be in the future". Thực tế hiện tại: 201 (service không validate quá khứ — chỉ validate `start_date < end_date`) | DEFERRED |
| TC_UC04_03 | `total_seats=0` | BVA | Tour 5 thuộc company | `POST /api/company/tours/5/departures` `{start_date:"2026-09-01T08:00:00", end_date:"2026-09-05T17:00:00", total_seats:0}` | 400; `message="total_seats must be positive"` | IMPLEMENTED |
| TC_UC04_04 | `total_seats=1` (biên dưới hợp lệ) | BVA | Tour 5 thuộc company | `POST /api/company/tours/5/departures` `{...,total_seats:1}` | 201; `available_seats=1` | IMPLEMENTED |
| TC_UC04_05 | `start_date >= end_date` | EP− | Tour 5 thuộc company | `POST .../departures` `{start_date:"2026-09-05T17:00:00", end_date:"2026-09-01T08:00:00", total_seats:10}` | 400; `message="start_date must be before end_date"` | IMPLEMENTED |

### TC-UC-05 · Theo dõi kinh doanh

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| TC_UC05_01 | Liệt kê booking | EP+ | Có ≥1 booking thuộc tour của company | `GET /api/company/bookings` | 200; `bookings: [...]` mỗi item có `total_price`, `booking_status`, `payment_status` | IMPLEMENTED |
| TC_UC05_02 | Filter theo `status=CANCELLED` | EP+ | Có booking CANCELLED | `GET /api/company/bookings?status=CANCELLED` | 200; tất cả phần tử có `booking_status="CANCELLED"` | IMPLEMENTED |
| TC_UC05_03 | Không có booking | Scenario | Company chưa có booking nào | `GET /api/company/bookings` | 200; `bookings: []` | IMPLEMENTED |
| TC_UC05_04 | Chuyển booking sang CANCELLED hoàn ghế | EP+ | Booking `id=B` `booking_status=CONFIRMED`, `num_people=2`; departure `available_seats=A` | `PUT /api/company/bookings/B/status` `{booking_status:"CANCELLED"}` | 200; `new_status="CANCELLED"`; DB: `available_seats = A + 2` | IMPLEMENTED |
| TC_UC05_05 | Trạng thái không hợp lệ | EP− | Booking thuộc company | `PUT /api/company/bookings/<id>/status` `{booking_status:"FOO"}` | 400; `message="Invalid booking status"` | IMPLEMENTED |

---

## 2. Du khách

### T-UC-01 · Đăng ký

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| T_UC01_01 | Đăng ký guest hợp lệ | EP+ | `tourist@test.com` chưa có | `POST /api/auth/register` `{email:"tourist@test.com", password:"Guest@123", role:"GUEST", full_name:"Nguyễn Văn A", phone_number:"0900000000"}` | 201; `{message, user_id}`; `guest_profiles.full_name="Nguyễn Văn A"` | IMPLEMENTED |
| T_UC01_02 | Email trùng | EP− | `a@gmail.com` đã tồn tại | `POST /api/auth/register` `{email:"a@gmail.com", password:"x", role:"GUEST", full_name:"X"}` | 400; `message="Email is already registered"` | IMPLEMENTED |
| T_UC01_03 | Role không hợp lệ | EP− | — | `POST /api/auth/register` `{email:"tourist@test.com", password:"x", role:"UNKNOWN", full_name:"X"}` | 400; `message="Invalid role. Must be COMPANY or GUEST"` | IMPLEMENTED |
| T_UC01_04 | Thiếu `full_name` | EP− | — | `POST /api/auth/register` `{email:"tourist@test.com", password:"x", role:"GUEST"}` | 400; `message="Full name is required for GUEST role"`; rollback | IMPLEMENTED |

### T-UC-02 · Đăng nhập

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| T_UC02_01 | Đăng nhập hợp lệ | EP+ | `a@gmail.com` `is_active=True` | `POST /api/auth/login` `{email:"a@gmail.com", password:"Guest@123"}` | 200; `access_token`, `user.role="GUEST"` | IMPLEMENTED |
| T_UC02_02 | Sai mật khẩu | EP− | `a@gmail.com` tồn tại | `POST /api/auth/login` `{email:"a@gmail.com", password:"wrong"}` | 401; `message="Invalid email or password"` | IMPLEMENTED |
| T_UC02_03 | Email chưa đăng ký | EP− | — | `POST /api/auth/login` `{email:"ghost@test.com", password:"x"}` | 401; `message="Invalid email or password"` | IMPLEMENTED |
| T_UC02_04 | Tài khoản bị vô hiệu hóa | EP− | Guest tồn tại với `is_active=False` | `POST /api/auth/login` đúng email/mật khẩu | 403; `message="Account is deactivated"` NOTE (lưu ý 403 chứ không phải 401) | IMPLEMENTED NOTE |

### T-UC-03 · Tìm kiếm tour

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| T_UC03_01 | Tìm theo keyword | EP+ | ≥1 tour `status=ACTIVE` chứa "Đà Lạt" trong `name` hoặc `description` | `GET /api/public/tours?keyword=Đà Lạt` | 200; `tours[*].status="ACTIVE"`; mỗi item có `name`, `price`, `destination`; **không** có `itineraries`, `departures` (đã exclude trong list view) | IMPLEMENTED |
| T_UC03_02 | Tìm theo `destination_id` | EP+ | ≥1 tour ACTIVE với `destination_id=1` | `GET /api/public/tours?destination_id=1` | 200; mỗi item có `destination.id=1` | IMPLEMENTED |
| T_UC03_03 | Không có kết quả | Scenario | Không có tour ACTIVE chứa "Atlantis" | `GET /api/public/tours?keyword=Atlantis` | 200; `tours: []` | IMPLEMENTED |
| T_UC03_04 | Liệt kê tất cả không filter | EP+ | ≥3 tour ACTIVE | `GET /api/public/tours` | 200; chỉ trả về `status=ACTIVE` (DRAFT/PENDING/COMPLETED/CANCELLED bị loại) | IMPLEMENTED |

### T-UC-04 · Xem chi tiết tour

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| T_UC04_01 | Tour ACTIVE tồn tại | EP+ | `TOUR_ACTIVE_ID=5` `status=ACTIVE`, có ≥1 departure với `start_date>now` và `available_seats>0` | `GET /api/public/tours/5` | 200; `tour` có `name`, `price`, `itineraries[]`, `departures[]` (chỉ ngày tương lai và còn ghế — xem `public_service.py:40-45`) | IMPLEMENTED |
| T_UC04_02 | ID không tồn tại | EP− | Không có tour `id=9999` | `GET /api/public/tours/9999` | 404; `message="Tour not found or not active"` | IMPLEMENTED |
| T_UC04_03 | Tour DRAFT/PENDING | EP− | Tour tồn tại nhưng `status!=ACTIVE` | `GET /api/public/tours/<id>` | 404; `message="Tour not found or not active"` | IMPLEMENTED |

### T-UC-05 · Đặt tour & thanh toán

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| T_UC05_01 | Đặt tour thành công | EP+ | Token guest; departure `id=3` `available_seats≥2`, `start_date>now` | `POST /api/guest/departures/3/book` `{num_people:2}` | 201; body `{message, booking_id, total_price=tour.price*2}`; DB: `available_seats -= 2`; booking `booking_status=PENDING`, `payment_status=UNPAID` | IMPLEMENTED |
| T_UC05_02 | Số chỗ vượt quá | EP− | Departure `available_seats=1` | `POST /api/guest/departures/<id>/book` `{num_people:5}` | 400; `message` chứa `"Not enough seats available. Only 1 seats left."` | IMPLEMENTED |
| T_UC05_03 | Chưa xác thực | Scenario | Không có header `Authorization` | `POST /api/guest/departures/3/book` `{num_people:1}` | 401 (do `verify_jwt_in_request`) | IMPLEMENTED |
| T_UC05_04 | Đặt đúng số chỗ cuối | BVA | Departure `available_seats=2` | `POST /api/guest/departures/<id>/book` `{num_people:2}` | 201; `available_seats` về 0; lần đặt tiếp theo trả 400 "Not enough seats available. Only 0 seats left." | IMPLEMENTED |
| T_UC05_05 | Thanh toán đầy đủ | EP+ | Booking `B` thuộc guest, `total_price=3000000`, đang `payment_status=UNPAID` | `POST /api/guest/payments` `{booking_id:B, amount:3000000, payment_method:"VNPAY"}` | 201; `{message, payment_id, booking_status:"FULLY_PAID"}` NOTE (key là `booking_status` nhưng giá trị là `payment_status` — xem `routes/guest.py:85`); DB: `Payment.status="SUCCESS"`, `Booking.payment_status="FULLY_PAID"` | IMPLEMENTED NOTE |
| T_UC05_06 | Thanh toán cọc một phần | EP+ | Booking `total_price=3000000`, `payment_status=UNPAID` | `POST /api/guest/payments` `{booking_id:B, amount:1000000, payment_method:"VNPAY"}` | 201; response `booking_status="DEPOSIT_PAID"`; DB: `Booking.payment_status="DEPOSIT_PAID"` | IMPLEMENTED |
| T_UC05_07 | Thanh toán booking không thuộc guest | EP− | Booking `B'` thuộc guest khác | `POST /api/guest/payments` `{booking_id:B', amount:100, payment_method:"VNPAY"}` | 404; `message="Booking not found or access denied"` | IMPLEMENTED |
| T_UC05_08 | `amount<=0` | EP− | Booking thuộc guest | `POST /api/guest/payments` `{booking_id:B, amount:0, payment_method:"VNPAY"}` | 400; `message="amount must be a positive number"` | IMPLEMENTED |

---

## 3. Quản trị viên

### A-UC-01 · Phê duyệt công ty

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| A_UC01_01 | Duyệt công ty pending | EP+ | Token admin; `COMPANY_PENDING_ID` có `is_approved=False` | `PUT /api/admin/companies/<COMPANY_PENDING_ID>/approve` | 200; `message="Company approved successfully"`; DB: `is_approved=True` | IMPLEMENTED |
| A_UC01_02 | Liệt kê pending | EP+ | ≥1 company `is_approved=False` | `GET /api/admin/companies?status=pending` | 200; `companies[*].is_approved=False` | IMPLEMENTED |
| A_UC01_03 | Pending rỗng | Scenario | Không có công ty `is_approved=False` | `GET /api/admin/companies?status=pending` | 200; `companies: []` | IMPLEMENTED |
| A_UC01_04 | Duyệt lại công ty đã duyệt | Scenario | `COMPANY_APPROVED_ID` có `is_approved=True` | `PUT /api/admin/companies/<COMPANY_APPROVED_ID>/approve` | 200; `message="Company is already approved"`; DB không đổi | IMPLEMENTED |
| A_UC01_05 | ID company không tồn tại | EP− | — | `PUT /api/admin/companies/9999/approve` | 400 (route trả `result["status"]`) NOTE; `message="Company not found"`. Ghi chú: service trả status=404 nhưng route render `error="Bad Request"` cho mọi lỗi → status code 404 nhưng error label không nhất quán | IMPLEMENTED NOTE |

### A-UC-02 · Quản lý công ty đã duyệt

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| A_UC02_01 | Cập nhật commission hợp lệ | EP+ | Admin token; `COMPANY_APPROVED_ID` tồn tại | `PUT /api/admin/companies/<COMPANY_APPROVED_ID>/commission` `{commission_rate:15.5}` | 200; `commission_rate=15.5` trong response và DB | IMPLEMENTED |
| A_UC02_02 | Commission âm | EP− | — | `PUT .../commission` `{commission_rate:-5}` | 400; `message="Commission rate must be between 0 and 100"` | IMPLEMENTED |
| A_UC02_03 | Commission không phải số | EP− | — | `PUT .../commission` `{commission_rate:"abc"}` | 400; `message="Valid commission_rate is required"` | IMPLEMENTED |
| A_UC02_04 | Liệt kê tất cả công ty | EP+ | ≥1 công ty | `GET /api/admin/companies` | 200; `companies[]` kèm `company_name`, `is_approved`, `commission_rate` | IMPLEMENTED |
| A_UC02_05 | Commission biên 100 | BVA | — | `PUT .../commission` `{commission_rate:100}` | 200; `commission_rate=100.0` | IMPLEMENTED |

### A-UC-03 · Quản lý điểm đến (CRUD)

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| A_UC03_01 | Tạo điểm đến hợp lệ | EP+ | `NEW_DESTINATION_NAME="Kyoto"` chưa tồn tại | `POST /api/admin/destinations` `{name:"Kyoto", description:"Cố đô Nhật Bản"}` | 201; `destination` có `id`, `name`, `description` | IMPLEMENTED |
| A_UC03_02 | Cập nhật mô tả | EP+ | Điểm đến tồn tại | `PUT /api/admin/destinations/<id>` `{description:"new"}` | 200; `destination.description="new"` | IMPLEMENTED |
| A_UC03_03 | Xóa điểm đến không liên kết | EP+ | `DESTINATION_FREE_ID=2`, `tours.count()==0` | `DELETE /api/admin/destinations/2` | 200; `message="Destination deleted successfully"` | IMPLEMENTED |
| A_UC03_04 | Xóa điểm đến đang có tour | EP− | `DESTINATION_LINKED_ID=1`, `tours.count()>0` | `DELETE /api/admin/destinations/1` | 400; `message="Cannot delete destination because it is linked to existing tours"` | IMPLEMENTED |
| A_UC03_05 | Tên trùng | EP− | `EXISTING_DESTINATION_NAME="Paris"` đã tồn tại | `POST /api/admin/destinations` `{name:"Paris"}` | 400; `message="Destination name already exists"` | IMPLEMENTED |
| A_UC03_06 | Thiếu `name` | EP− | — | `POST /api/admin/destinations` `{description:"x"}` | 400; `message="Destination name is required"` | IMPLEMENTED |

### A-UC-04 · Quản lý tour trên nền tảng

> **DEFERRED:** Codebase hiện tại không có blueprint `/api/admin/tours` (xem `src/routes/admin.py`). Admin chỉ quản lý destinations và companies. Các test bên dưới giữ lại để track yêu cầu — cần `xfail` hoặc skip khi run.

| ID | Mô tả | Loại | Tiền điều kiện | Bước thực hiện | Kết quả mong đợi | Marker |
|---|---|---|---|---|---|---|
| A_UC04_01 | Xem tất cả tour | EP+ | Admin token | `GET /api/admin/tours` | 200; danh sách tour kèm tên company, status, created_at | DEFERRED |
| A_UC04_02 | Gỡ tour vi phạm | Scenario | Tour tồn tại | `DELETE /api/admin/tours/<id>` | 200; tour bị xóa; `GET /api/public/tours/<id>` → 404 | DEFERRED |

---
