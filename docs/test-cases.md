# Test Cases — Hệ thống Đặt Tour (Format AAA)

**Phiên bản:** 4.0 (AAA format) | **Tác giả:** Trương Hưng Phát | **Ngày:** 10/05/2026
**Tham chiếu:** `docs/test-case.md` (v3.0) · `docs/test-plan.md` · `docs/api-docs.md` · `backend/src/`

> Định dạng theo mẫu `docs/test-cases - Trang tính1.pdf`: 6 cột — **Mã TC | Kịch bản | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert)**.
> Kỹ thuật: **EP (Valid)** = Equivalence Partition hợp lệ · **EP (Invalid)** = phân vùng không hợp lệ · **BVA** = Boundary Value Analysis · **Scenario** = kịch bản end-to-end · **Decision Table** = bảng quyết định · **State Transition** = chuyển trạng thái.
> Mọi giá trị seed (email, ID, enum) lấy từ `docs/test-case.md` §0 (Substitution Map). `BASE_URL = http://localhost:5000`.

---

## 1. Module Đặt tour (Booking) — Guest

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_BK_01 | Đặt tour thành công với dữ liệu chuẩn | EP (Valid) | Token guest `a@gmail.com`; departure `id=3` thuộc tour ACTIVE, `available_seats=5`, `start_date>now`; `tour.price=1500000` | 1. `POST /api/auth/login` `{email:"a@gmail.com", password:"Guest@123"}` lấy token. 2. `POST /api/guest/departures/3/book` header `Authorization: Bearer <token>` body `{num_people:2}`. | - 201; body `{message, booking_id, total_price:3000000}`. - DB: `departures.available_seats = 5 - 2 = 3`. - DB: booking mới `booking_status="PENDING"`, `payment_status="UNPAID"`. |
| TC_BK_02 | Đặt vượt quá số chỗ còn trống | EP (Invalid) | Departure `available_seats=1` | `POST /api/guest/departures/3/book` `{num_people:5}` | 400; `message="Not enough seats available. Only 1 seats left."`; `available_seats` không đổi (=1). |
| TC_BK_03 | Đặt đúng số chỗ cuối cùng | BVA (biên trên) | Departure `available_seats=2` | `POST /api/guest/departures/3/book` `{num_people:2}` | 201; `available_seats` về `0`; lần đặt kế tiếp với `num_people=1` → 400 "Only 0 seats left." |
| TC_BK_04 | `num_people = 0` | BVA (biên dưới invalid) | Departure còn ghế | `POST /api/guest/departures/3/book` `{num_people:0}` | 400; `message` báo `num_people must be a positive integer`. |
| TC_BK_05 | `num_people = 1` (biên dưới valid) | BVA | Departure `available_seats≥1` | `POST /api/guest/departures/3/book` `{num_people:1}` | 201; `available_seats -= 1`. |
| TC_BK_06 | Đặt khi chưa đăng nhập | Scenario (Auth) | Không gửi header `Authorization` | `POST /api/guest/departures/3/book` `{num_people:1}` | 401 (`verify_jwt_in_request` fail); không tạo booking. |
| TC_BK_07 | Đặt với role COMPANY (sai role) | EP (Invalid) | Token `abc@travel.com` (role=COMPANY) | `POST /api/guest/departures/3/book` `{num_people:1}` | 403; `message` báo yêu cầu role GUEST (`@guest_required`). |
| TC_BK_08 | Đặt departure đã khởi hành (quá khứ) | EP (Invalid) | Departure `start_date < now` | `POST /api/guest/departures/<id>/book` `{num_people:1}` | 400; `message` chứa "Cannot book a departure that has already started" (hoặc 404 nếu service ẩn departure quá khứ). |
| TC_BK_09 | Departure không tồn tại | EP (Invalid) | `id=9999` không có trong DB | `POST /api/guest/departures/9999/book` `{num_people:1}` | 404; `message="Departure not found"`. |

---

## 2. Module Thanh toán (Payment) — Guest

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_PM_01 | Thanh toán đầy đủ (full) | EP (Valid) + State Transition | Booking `B` thuộc guest, `total_price=3000000`, `payment_status=UNPAID` | `POST /api/guest/payments` `{booking_id:B, amount:3000000, payment_method:"VNPAY"}` | 201; response `booking_status="FULLY_PAID"` *(NOTE: key là `booking_status` nhưng value là `payment_status` — `routes/guest.py:85`)*; DB `Payment.status="SUCCESS"`, `Booking.payment_status="FULLY_PAID"`. |
| TC_PM_02 | Thanh toán cọc một phần | EP (Valid) + State Transition | Booking `total_price=3000000`, `payment_status=UNPAID` | `POST /api/guest/payments` `{booking_id:B, amount:1000000, payment_method:"VNPAY"}` | 201; `booking_status="DEPOSIT_PAID"`; DB `Booking.payment_status="DEPOSIT_PAID"`. |
| TC_PM_03 | Thanh toán booking của người khác | EP (Invalid) | Booking `B'` thuộc guest khác | `POST /api/guest/payments` `{booking_id:B', amount:100, payment_method:"VNPAY"}` | 404; `message="Booking not found or access denied"`. |
| TC_PM_04 | `amount = 0` | BVA (biên invalid) | Booking thuộc guest | `POST /api/guest/payments` `{booking_id:B, amount:0, payment_method:"VNPAY"}` | 400; `message="amount must be a positive number"`. |
| TC_PM_05 | `amount` âm | EP (Invalid) | Booking thuộc guest | `POST /api/guest/payments` `{booking_id:B, amount:-1000, payment_method:"VNPAY"}` | 400; `message="amount must be a positive number"`. |
| TC_PM_06 | `amount = 1` (biên dưới valid) | BVA | Booking `total_price=3000000`, UNPAID | `POST /api/guest/payments` `{booking_id:B, amount:1, payment_method:"VNPAY"}` | 201; `booking_status="DEPOSIT_PAID"` (1 < total_price). |
| TC_PM_07 | Thiếu `payment_method` | EP (Invalid) | Booking thuộc guest | `POST /api/guest/payments` `{booking_id:B, amount:1000}` | 400; `message` báo thiếu trường bắt buộc. |
| TC_PM_08 | Liệt kê thanh toán theo booking | EP (Valid) | Guest có ≥1 payment cho booking `B` | `GET /api/guest/payments?booking_id=B` | 200; `payments[*].booking_id=B`. |

---

## 3. Module Auth — Đăng ký / Đăng nhập

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_AU_01 | Đăng ký Guest hợp lệ | EP (Valid) | `tourist@test.com` chưa có trong DB | `POST /api/auth/register` `{email:"tourist@test.com", password:"Guest@123", role:"GUEST", full_name:"Nguyễn Văn A", phone_number:"0900000000"}` | 201; `{message, user_id}`; DB `users.role=GUEST`, `guest_profiles.full_name="Nguyễn Văn A"`. |
| TC_AU_02 | Đăng ký Company hợp lệ | EP (Valid) | `newco@test.com` chưa có | `POST /api/auth/register` `{email:"newco@test.com", password:"Company@123", role:"COMPANY", company_name:"NewCo Travel"}` | 201; DB `company_profiles.is_approved=False`, `commission_rate=0.0`. |
| TC_AU_03 | Email đã tồn tại | EP (Invalid) | `abc@travel.com` đã có trong DB | `POST /api/auth/register` `{email:"abc@travel.com", password:"x", role:"COMPANY", company_name:"X"}` | 400; `message="Email is already registered"`. |
| TC_AU_04 | Thiếu `password` | EP (Invalid) | — | `POST /api/auth/register` `{email:"newco@test.com", role:"COMPANY", company_name:"NewCo"}` | 400; `message="Email and password are required"`. |
| TC_AU_05 | Thiếu `company_name` khi role=COMPANY | EP (Invalid) + Decision Table | — | `POST /api/auth/register` `{email:"newco@test.com", password:"x", role:"COMPANY"}` | 400; `message="Company name is required for COMPANY role"`; transaction rollback (user **không** được lưu). |
| TC_AU_06 | Thiếu `full_name` khi role=GUEST | EP (Invalid) + Decision Table | — | `POST /api/auth/register` `{email:"tourist@test.com", password:"x", role:"GUEST"}` | 400; `message="Full name is required for GUEST role"`; rollback. |
| TC_AU_07 | Role không hợp lệ | EP (Invalid) | — | `POST /api/auth/register` `{email:"x@y.com", password:"x", role:"UNKNOWN", full_name:"X"}` | 400; `message="Invalid role. Must be COMPANY or GUEST"`. |
| TC_AU_08 | Đăng nhập hợp lệ | EP (Valid) | `a@gmail.com`, `is_active=True` | `POST /api/auth/login` `{email:"a@gmail.com", password:"Guest@123"}` | 200; body có `access_token`, `user.role="GUEST"`. |
| TC_AU_09 | Sai mật khẩu | EP (Invalid) | `a@gmail.com` tồn tại | `POST /api/auth/login` `{email:"a@gmail.com", password:"wrong"}` | 401; `message="Invalid email or password"`. |
| TC_AU_10 | Email chưa đăng ký | EP (Invalid) | `ghost@test.com` không tồn tại | `POST /api/auth/login` `{email:"ghost@test.com", password:"x"}` | 401; `message="Invalid email or password"`. |
| TC_AU_11 | Tài khoản bị vô hiệu hóa | Scenario | Guest `is_active=False` | `POST /api/auth/login` đúng email/mật khẩu | 403; `message="Account is deactivated"` *(NOTE: 403, không phải 401)*. |
| TC_AU_12 | Company chờ duyệt gọi Company API | Scenario (RBAC) | `pending@travel.com`, `is_approved=False` | 1. Login lấy token. 2. `GET /api/company/tours` với token. | (1) 200 + token; (2) 403; `message="Company is not approved by Admin yet"`. |

---

## 4. Module Quản lý tour — Company

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_TR_01 | Tạo tour hợp lệ | EP (Valid) | Token company `abc@travel.com` (đã duyệt); `destination_id=2` tồn tại | `POST /api/company/tours` `{name:"Tour ABC", description:"...", price:1500000, total_days:3, destination_id:2}` | 201; `{message:"Tour created successfully", tour_id}`; DB `tours.status="DRAFT"` *(NOTE: DRAFT mặc định, không xuất hiện trên `/api/public/tours`)*. |
| TC_TR_02 | Cập nhật tour của chính mình | EP (Valid) | Tour `id=5` thuộc company hiện tại | `PUT /api/company/tours/5` `{name:"Tour ABC v2", price:1700000}` | 200; `message="Tour updated successfully"`; DB cập nhật `name`, `price`. |
| TC_TR_03 | Activate tour (DRAFT → ACTIVE) | State Transition | Tour `id=5`, `status=DRAFT` | `PUT /api/company/tours/5` `{status:"ACTIVE"}` | 200; DB `status="ACTIVE"`; `GET /api/public/tours/5` → 200. |
| TC_TR_04 | Thiếu `name` khi tạo tour | EP (Invalid) | Token company hợp lệ | `POST /api/company/tours` `{description:"...", price:100, total_days:2, destination_id:2}` | 400; `message="Missing required field: name"`. |
| TC_TR_05 | `destination_id` không tồn tại | EP (Invalid) | — | `POST /api/company/tours` `{name:"X", description:"...", price:100, total_days:2, destination_id:9999}` | 400; `message="Invalid destination_id"`. |
| TC_TR_06 | `price` âm | BVA (biên invalid) | — | `POST /api/company/tours` `{name:"X", description:"...", price:-1, total_days:2, destination_id:2}` | 400; `message` báo `price must be non-negative`. |
| TC_TR_07 | Xóa tour không có booking | EP (Valid) | Tour tồn tại, mọi `departures[*].bookings.count()==0` | `DELETE /api/company/tours/<id>` | 200; `message="Tour deleted successfully"`; sau đó `GET /api/public/tours/<id>` → 404. |
| TC_TR_08 | Xóa tour có booking | EP (Invalid) | Tour có ≥1 departure với booking | `DELETE /api/company/tours/<id>` | 400; `message="Cannot delete tour because there are bookings for its departures."`. |
| TC_TR_09 | Sửa tour của company khác | EP (Invalid) + RBAC | Tour `id=5` thuộc company A; token thuộc company B | `PUT /api/company/tours/5` `{price:1}` (token B) | 403/404; tour không bị thay đổi. |

---

## 5. Module Lên lịch khởi hành (Departure) — Company

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_DP_01 | Tạo departure hợp lệ | EP (Valid) | Tour `id=5` thuộc company | `POST /api/company/tours/5/departures` `{start_date:"2026-09-01T08:00:00", end_date:"2026-09-05T17:00:00", total_seats:20}` | 201; `{message, departure_id}`; DB `available_seats=20`, `status="PLANNED"`. |
| TC_DP_02 | `total_seats = 0` | BVA (biên invalid) | Tour `id=5` thuộc company | `POST /api/company/tours/5/departures` `{start_date:"2026-09-01T08:00:00", end_date:"2026-09-05T17:00:00", total_seats:0}` | 400; `message="total_seats must be positive"`. |
| TC_DP_03 | `total_seats = 1` (biên dưới valid) | BVA | Tour `id=5` thuộc company | `POST .../departures` `{...,total_seats:1}` | 201; `available_seats=1`. |
| TC_DP_04 | `start_date >= end_date` | EP (Invalid) | Tour `id=5` thuộc company | `POST .../departures` `{start_date:"2026-09-05T17:00:00", end_date:"2026-09-01T08:00:00", total_seats:10}` | 400; `message="start_date must be before end_date"`. |
| TC_DP_05 | `start_date` trong quá khứ | EP (Invalid) — DEFERRED | Tour `id=5` thuộc company | `POST .../departures` `{start_date:"2020-01-01T00:00:00", end_date:"2020-01-05T00:00:00", total_seats:10}` | Mong đợi: 400 "departure date must be in the future". **Thực tế:** 201 (service không validate quá khứ — chỉ validate `start_date<end_date`). Cần xfail/skip. |

---

## 6. Module Tìm kiếm & Xem tour — Public

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_SR_01 | Tìm theo keyword có kết quả | EP (Valid) | ≥1 tour `status=ACTIVE` chứa "Đà Lạt" trong `name`/`description` | `GET /api/public/tours?keyword=Đà Lạt` | 200; mọi item `status="ACTIVE"`; có `name`, `price`, `destination`; **không** có `itineraries`/`departures` (list view exclude). |
| TC_SR_02 | Tìm theo `destination_id` | EP (Valid) | ≥1 tour ACTIVE với `destination_id=1` | `GET /api/public/tours?destination_id=1` | 200; mọi item `destination.id=1`. |
| TC_SR_03 | Keyword không khớp | Scenario | Không có tour ACTIVE nào chứa "Atlantis" | `GET /api/public/tours?keyword=Atlantis` | 200; `tours: []`. |
| TC_SR_04 | Liệt kê toàn bộ ACTIVE | EP (Valid) | ≥3 tour ACTIVE; ≥1 tour DRAFT/PENDING/COMPLETED | `GET /api/public/tours` | 200; chỉ trả `status=ACTIVE`; DRAFT/PENDING/COMPLETED/CANCELLED bị loại. |
| TC_SR_05 | Xem chi tiết tour ACTIVE | EP (Valid) | `TOUR_ACTIVE_ID=5`, có ≥1 departure tương lai còn ghế | `GET /api/public/tours/5` | 200; `tour` có `name`, `price`, `itineraries[]`, `departures[]` (chỉ ngày tương lai và `available_seats>0`). |
| TC_SR_06 | Tour không tồn tại | EP (Invalid) | Không có tour `id=9999` | `GET /api/public/tours/9999` | 404; `message="Tour not found or not active"`. |
| TC_SR_07 | Tour DRAFT/PENDING không lộ ra public | EP (Invalid) + RBAC | Tour tồn tại, `status="DRAFT"` | `GET /api/public/tours/<id>` | 404; `message="Tour not found or not active"`. |

---

## 7. Module Theo dõi kinh doanh — Company

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_CB_01 | Liệt kê booking của company | EP (Valid) | Có ≥1 booking thuộc tour của company `abc@travel.com` | `GET /api/company/bookings` (token company) | 200; `bookings[]`, mỗi item có `total_price`, `booking_status`, `payment_status`. |
| TC_CB_02 | Filter `status=CANCELLED` | EP (Valid) | Có ≥1 booking CANCELLED của company | `GET /api/company/bookings?status=CANCELLED` | 200; mọi item `booking_status="CANCELLED"`. |
| TC_CB_03 | Company chưa có booking | Scenario | Company chưa có booking nào | `GET /api/company/bookings` | 200; `bookings: []`. |
| TC_CB_04 | CONFIRMED → CANCELLED hoàn ghế | State Transition | Booking `id=B`, `booking_status="CONFIRMED"`, `num_people=2`; `departure.available_seats=A` | `PUT /api/company/bookings/B/status` `{booking_status:"CANCELLED"}` | 200; `new_status="CANCELLED"`; DB `available_seats = A + 2`. |
| TC_CB_05 | Trạng thái không hợp lệ | EP (Invalid) | Booking thuộc company | `PUT /api/company/bookings/<id>/status` `{booking_status:"FOO"}` | 400; `message="Invalid booking status"`. |
| TC_CB_06 | Đổi trạng thái booking của company khác | EP (Invalid) + RBAC | Booking thuộc company A; token company B | `PUT /api/company/bookings/<id>/status` `{booking_status:"CONFIRMED"}` | 403/404; trạng thái không thay đổi. |

---

## 8. Module Quản trị viên — Phê duyệt công ty

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_AD_01 | Duyệt công ty pending | EP (Valid) + State Transition | Token admin; `COMPANY_PENDING_ID` có `is_approved=False` | `PUT /api/admin/companies/<COMPANY_PENDING_ID>/approve` | 200; `message="Company approved successfully"`; DB `is_approved=True`. |
| TC_AD_02 | Liệt kê pending | EP (Valid) | ≥1 company `is_approved=False` | `GET /api/admin/companies?status=pending` | 200; mọi item `is_approved=False`. |
| TC_AD_03 | Pending rỗng | Scenario | Không còn công ty `is_approved=False` | `GET /api/admin/companies?status=pending` | 200; `companies: []`. |
| TC_AD_04 | Duyệt lại company đã duyệt | Scenario (idempotent) | `COMPANY_APPROVED_ID` có `is_approved=True` | `PUT /api/admin/companies/<COMPANY_APPROVED_ID>/approve` | 200; `message="Company is already approved"`; DB không đổi. |
| TC_AD_05 | ID company không tồn tại | EP (Invalid) | — | `PUT /api/admin/companies/9999/approve` | 404; `message="Company not found"` *(NOTE: route render `error="Bad Request"` cho mọi lỗi)*. |

---

## 9. Module Quản trị viên — Commission & Destination

| Mã TC | Kịch bản (Scenario) | Kỹ thuật áp dụng | Dữ liệu chuẩn bị (Arrange) | Các bước thực hiện (Act) | Kết quả mong đợi (Assert) |
|---|---|---|---|---|---|
| TC_AC_01 | Cập nhật commission hợp lệ | EP (Valid) | Admin token; `COMPANY_APPROVED_ID` tồn tại | `PUT /api/admin/companies/<COMPANY_APPROVED_ID>/commission` `{commission_rate:15.5}` | 200; response và DB `commission_rate=15.5`. |
| TC_AC_02 | Commission âm | BVA (biên invalid) | — | `PUT .../commission` `{commission_rate:-5}` | 400; `message="Commission rate must be between 0 and 100"`. |
| TC_AC_03 | Commission `= 0` (biên dưới) | BVA | — | `PUT .../commission` `{commission_rate:0}` | 200; `commission_rate=0.0`. |
| TC_AC_04 | Commission `= 100` (biên trên) | BVA | — | `PUT .../commission` `{commission_rate:100}` | 200; `commission_rate=100.0`. |
| TC_AC_05 | Commission `= 101` (vượt biên) | BVA (biên invalid) | — | `PUT .../commission` `{commission_rate:101}` | 400; `message="Commission rate must be between 0 and 100"`. |
| TC_AC_06 | Commission không phải số | EP (Invalid) | — | `PUT .../commission` `{commission_rate:"abc"}` | 400; `message="Valid commission_rate is required"`. |
| TC_AC_07 | Tạo destination hợp lệ | EP (Valid) | Admin token; `NEW_DESTINATION_NAME="Kyoto"` chưa có | `POST /api/admin/destinations` `{name:"Kyoto", description:"Cố đô Nhật Bản"}` | 201; body `destination` có `id`, `name`, `description`. |
| TC_AC_08 | Tạo destination tên trùng | EP (Invalid) | `EXISTING_DESTINATION_NAME="Paris"` đã có | `POST /api/admin/destinations` `{name:"Paris"}` | 400; `message="Destination name already exists"`. |
| TC_AC_09 | Tạo destination thiếu `name` | EP (Invalid) | — | `POST /api/admin/destinations` `{description:"x"}` | 400; `message="Destination name is required"`. |
| TC_AC_10 | Xóa destination chưa liên kết | EP (Valid) | `DESTINATION_FREE_ID=2`, `tours.count()==0` | `DELETE /api/admin/destinations/2` | 200; `message="Destination deleted successfully"`. |
| TC_AC_11 | Xóa destination đang có tour | EP (Invalid) | `DESTINATION_LINKED_ID=1`, `tours.count()>0` | `DELETE /api/admin/destinations/1` | 400; `message="Cannot delete destination because it is linked to existing tours"`. |
| TC_AC_12 | Cập nhật mô tả destination | EP (Valid) | Destination tồn tại | `PUT /api/admin/destinations/<id>` `{description:"new"}` | 200; `destination.description="new"`. |

---