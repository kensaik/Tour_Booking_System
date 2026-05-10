# Tài Liệu API (API Documentation) - Hệ Thống Tour Booking

Tài liệu này cung cấp danh sách đầy đủ và chi tiết các API (Endpoint, Request, Response) đã được xây dựng và hoàn thiện trong Backend của hệ thống Tour Booking.

---

## 1. Authentication (Xác thực)
*Tất cả các API yêu cầu đăng nhập sẽ cần đính kèm Header: `Authorization: Bearer <access_token>`*

### 1.1 Đăng ký - `POST /api/auth/register`
Sử dụng để đăng ký tài khoản cho Du khách (`GUEST`) hoặc Công ty (`COMPANY`).
- **Request Body (JSON):**
  ```json
  {
    "email": "user@gmail.com",
    "password": "password123",
    "role": "GUEST",  // hoặc "COMPANY"
    "full_name": "Nguyen Van A" // Bắt buộc nếu là GUEST
    // "company_name": "ABC Travel" // Bắt buộc nếu là COMPANY
  }
  ```
- **Response (201 Created):**
  ```json
  {
    "message": "User registered successfully",
    "user_id": 1,
    "role": "GUEST"
  }
  ```

### 1.2 Đăng nhập - `POST /api/auth/login`
- **Request Body (JSON):**
  ```json
  {
    "email": "user@gmail.com",
    "password": "password123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "user": {
      "id": 1,
      "email": "user@gmail.com",
      "role": "GUEST"
    }
  }
  ```

---

## 2. Public API (Dành cho Người Dùng Trải Nghiệm - Không Cần Đăng Nhập)

### 2.1 Lấy danh sách điểm đến - `GET /api/public/destinations`
- **Response (200 OK):**
  ```json
  {
    "destinations": [
      { "id": 1, "name": "Đà Lạt", "description": "Thành phố sương mù" }
    ]
  }
  ```

### 2.2 Tìm kiếm & Lấy danh sách Tour - `GET /api/public/tours`
- **Query Parameters (Tùy chọn):** `?destination_id=1&keyword=Đà Lạt`
- **Response (200 OK):** Chỉ trả về các Tour có trạng thái `ACTIVE`.
  ```json
  {
    "tours": [
      {
        "id": 1,
        "name": "Tour Đà Lạt 3N2Đ",
        "company_name": "ABC Travel",
        "destination": "Đà Lạt",
        "price": 1500000,
        "total_days": 3,
        "description": "..."
      }
    ]
  }
  ```

### 2.3 Xem chi tiết Tour - `GET /api/public/tours/<id>`
- **Response (200 OK):** Đặc biệt, trường `departures` (Ngày khởi hành) sẽ tự động lọc và **chỉ hiển thị những ngày chưa xuất phát (start_date > hiện tại) và còn ghế (available_seats > 0)**.
  ```json
  {
    "tour": {
      "id": 1,
      "name": "Tour Đà Lạt 3N2Đ",
      "price": 1500000,
      "itineraries": [
        { "day_number": 1, "title": "Khởi hành", "description": "..." }
      ],
      "departures": [
        {
          "id": 1,
          "start_date": "2026-06-01T08:00:00",
          "end_date": "2026-06-03T17:00:00",
          "total_seats": 20,
          "available_seats": 15,
          "guide_name": "Nguyễn B"
        }
      ]
    }
  }
  ```

---

## 3. Guest API (Dành cho Du Khách)
*Yêu cầu Token có Role `GUEST`.*

### 3.1 Đặt chỗ (Booking) - `POST /api/guest/departures/<id>/book`
- **Path Parameter:** `<id>` là ID của đợt khởi hành (Departure ID).
- **Request Body (JSON):**
  ```json
  {
    "num_people": 2
  }
  ```
- **Response (201 Created):** Tự động trừ số ghế (`available_seats`) của Tour.
  ```json
  {
    "message": "Booking successful",
    "booking_id": 10,
    "total_price": 3000000
  }
  ```

### 3.2 Thanh toán mô phỏng - `POST /api/guest/payments`
- **Request Body (JSON):**
  ```json
  {
    "booking_id": 10,
    "amount": 3000000,
    "payment_method": "VNPAY"
  }
  ```
- **Response (201 Created):** Nếu trả đủ, Booking tự chuyển sang `FULLY_PAID`. Nếu trả thiếu, chuyển sang `DEPOSIT_PAID`.
  ```json
  {
    "message": "Payment successful",
    "payment_id": 1,
    "booking_status": "FULLY_PAID"
  }
  ```

### 3.3 Xem lịch sử Đặt chỗ & Thanh toán
- **Lịch sử Đặt chỗ:** `GET /api/guest/bookings` và chi tiết 1 đơn `GET /api/guest/bookings/<id>`
- **Lịch sử Thanh toán:** `GET /api/guest/payments` (có thể truyền `?booking_id=10`)

---

## 4. Company API (Dành cho Công Ty Du Lịch)
*Yêu cầu Token có Role `COMPANY` và đã được Admin phê duyệt (`is_approved = True`).*

### 4.1 Quản lý Tour
- **`GET /api/company/tours`**: Lấy danh sách Tour của công ty.
- **`POST /api/company/tours`**: Tạo Tour mới.
  - Body: `{"name": "...", "description": "...", "price": 1500, "total_days": 3, "destination_id": 1}`
- **`GET /api/company/tours/<id>`**: Xem chi tiết Tour (bao gồm lịch trình & khởi hành).
- **`PUT /api/company/tours/<id>`**: Chỉnh sửa Tour.
- **`DELETE /api/company/tours/<id>`**: Xóa Tour (Sẽ báo lỗi nếu Tour đang có khách đặt).

### 4.2 Quản lý Lịch trình & Khởi hành
- **`POST /api/company/tours/<tour_id>/itineraries`**: Thêm chi tiết cho 1 ngày trong Tour.
- **`PUT /api/company/itineraries/<id>`**: Sửa ngày lịch trình.
- **`DELETE /api/company/itineraries/<id>`**: Xóa ngày lịch trình.
- **`POST /api/company/tours/<tour_id>/departures`**: Thêm ngày khởi hành.
  - Body: `{"start_date": "2026-06-01T08:00:00", "end_date": "...", "total_seats": 20}`

### 4.3 Quản lý Đơn hàng (Xác nhận Booking)
- **`GET /api/company/bookings`**: Lấy danh sách đơn đặt của khách. Có thể dùng `?status=PENDING` hoặc `?departure_id=1`.
- **`GET /api/company/bookings/<id>`**: Xem chi tiết 1 đơn.
- **`PUT /api/company/bookings/<id>/status`**: Cập nhật trạng thái đơn (Chốt đơn hoặc Hủy đơn).
  - Body: `{"booking_status": "CONFIRMED"}` (hoặc `CANCELLED`, `COMPLETED`).
  - **Lưu ý:** Nếu Công ty (hoặc Khách) đổi sang `CANCELLED`, hệ thống tự động cộng hoàn lại ghế vào Tour.

---

## 5. Admin API (Dành cho Quản Trị Viên)
*Yêu cầu Token có Role `ADMIN`.*

### 5.1 Quản lý Điểm đến (Destinations)
- **`GET /api/admin/destinations`**: Xem danh sách điểm đến.
- **`POST /api/admin/destinations`**: Tạo điểm đến mới.
- **`PUT /api/admin/destinations/<id>`**: Sửa tên/mô tả điểm đến.
- **`DELETE /api/admin/destinations/<id>`**: Xóa điểm đến (Báo lỗi nếu đã có Tour dùng điểm đến này).

### 5.2 Quản lý Đối tác (Companies)
- **`GET /api/admin/companies`**: Lấy danh sách Công ty. Truyền `?status=pending` để lọc các công ty đang chờ duyệt.
- **`PUT /api/admin/companies/<id>/approve`**: Phê duyệt cho phép công ty bắt đầu hoạt động.
- **`PUT /api/admin/companies/<id>/commission`**: Thay đổi cấu hình phần trăm hoa hồng (commission_rate) cho công ty.
  - Body: `{"commission_rate": 15.5}`
