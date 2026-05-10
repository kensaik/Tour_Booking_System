# Phân Tích Yêu Cầu — Hệ Thống Quản Lý Tour Du Lịch

---

## 1. Tổng Quan

### 1.1. Mục Tiêu Hệ Thống
Xây dựng nền tảng Web cho phép:
- **Du khách** tìm kiếm, xem chi tiết, đặt chỗ và thanh toán cọc tour du lịch trực tuyến.
- **Công ty du lịch** quản lý tour, lịch trình, lịch khởi hành, chỗ trống và xem thống kê kinh doanh.
- **Admin** quản trị công ty đối tác, danh mục điểm đến, kiểm duyệt nội dung và theo dõi vận hành toàn hệ thống.

### 1.2. Phạm Vi (Scope)
| Trong phạm vi | Ngoài phạm vi |
| --- | --- |
| Đăng ký / đăng nhập 3 vai trò | Tích hợp cổng thanh toán thực tế (mock cọc) |
| Quản lý tour, lịch trình theo ngày | App mobile native |
| Lịch khởi hành + chỗ trống | Chatbot tư vấn AI |
| Đặt chỗ + thanh toán cọc | Hệ thống đánh giá / loyalty point |
| Duyệt và quản lý công ty | Quản lý hướng dẫn viên chi tiết |
| Thống kê doanh thu cơ bản | Báo cáo BI nâng cao |
| Upload hình ảnh tour (Cloudinary) | CDN tự dựng |
| Email thông báo (SMTP) | SMS / Push notification |

### 1.3. Công Nghệ
- **Backend:** Python 3.x, Flask, SQLAlchemy.
- **Frontend:** React + TypeScript + Vite.
- **Database:** MySQL 8.x.
- **Lưu trữ ảnh:** Cloudinary.
- **Email:** Gmail SMTP (App Password).
- **Auth:** JWT.

---

## 2. Tác Nhân (Actors)

| Mã | Tác nhân | Mô tả |
| --- | --- | --- |
| A1 | Du khách (Guest / Tourist) | Người dùng cuối tìm kiếm và đặt tour. Có thể duyệt công khai, phải đăng nhập để đặt chỗ. |
| A2 | Công ty du lịch (Company) | Doanh nghiệp lữ hành cung cấp và quản lý tour. Phải được Admin duyệt trước khi đăng tour. |
| A3 | Admin | Quản trị viên hệ thống, kiểm duyệt công ty, quản lý điểm đến và giám sát vận hành. |

---

## 3. Use Case Tổng Hợp

### 3.1. Use Case của Công Ty Du Lịch

| Mã | Tên Use Case | Mô tả ngắn |
| --- | --- | --- |
| UC-C-01 | Đăng ký | Đăng ký tài khoản doanh nghiệp, trạng thái khởi tạo "chờ phê duyệt". |
| UC-C-02 | Đăng nhập | Xác thực và nhận JWT token để duy trì phiên. |
| UC-C-03 | Quản lý tour và lịch trình | Tạo / sửa / xoá tour và lịch trình theo từng ngày. |
| UC-C-04 | Lên lịch khởi hành | Thiết lập ngày đi cụ thể, số chỗ tối đa, giá. |
| UC-C-05 | Xem thống kê kinh doanh | Dashboard: tổng tour, lịch khởi hành, doanh thu. |

#### UC-C-01: Đăng ký công ty
- **Tiền điều kiện:** Email chưa tồn tại trong hệ thống.
- **Luồng chính:** Nhập thông tin công ty (tên, email, mật khẩu, mã số thuế, giấy phép, liên hệ) → Hệ thống lưu với trạng thái `pending` → Gửi email xác nhận đến công ty và Admin.
- **Hậu điều kiện:** Tài khoản tồn tại, chưa thể đăng nhập tạo tour cho đến khi được Admin duyệt.
- **Luồng ngoại lệ:** Email trùng, dữ liệu không hợp lệ, thiếu giấy phép.

#### UC-C-02: Đăng nhập
- **Tiền điều kiện:** Tài khoản đã đăng ký và được duyệt.
- **Luồng chính:** Nhập email + mật khẩu → Xác thực → Cấp JWT.
- **Luồng ngoại lệ:** Sai email/mật khẩu, tài khoản chưa duyệt, tài khoản bị vô hiệu hoá.

#### UC-C-03: Quản lý tour và lịch trình
- **Tiền điều kiện:** Đã đăng nhập; trạng thái công ty = `approved`.
- **Luồng chính:** Tạo tour (tên, mô tả, điểm đến, ảnh, giá cơ sở, dịch vụ kèm theo, chính sách hoàn huỷ) → Thêm lịch trình theo ngày (Day 1..N: hoạt động, bữa ăn, chỗ ở) → Lưu vào CSDL.
- **Luồng ngoại lệ:** Thiếu trường bắt buộc; ảnh upload thất bại; tour đang được đặt không cho phép xoá.

#### UC-C-04: Lên lịch khởi hành
- **Tiền điều kiện:** Tour đã được tạo.
- **Luồng chính:** Chọn tour → Nhập ngày đi, ngày về, số chỗ tối đa, giá khởi hành → Lưu bản ghi lịch khởi hành độc lập.
- **Luồng ngoại lệ:** Ngày đi trong quá khứ; số chỗ ≤ 0; trùng lịch.

#### UC-C-05: Thống kê kinh doanh
- **Luồng chính:** Truy cập Dashboard → Hệ thống tổng hợp số tour, số lịch khởi hành, số booking, doanh thu (theo khoảng thời gian).

### 3.2. Use Case của Du Khách

| Mã | Tên Use Case | Mô tả ngắn |
| --- | --- | --- |
| UC-G-01 | Đăng ký | Tạo tài khoản du khách. |
| UC-G-02 | Đăng nhập | Xác thực để dùng các chức năng cá nhân. |
| UC-G-03 | Tìm kiếm tour | Lọc theo điểm đến, ngày khởi hành, giá. |
| UC-G-04 | Xem lịch trình chi tiết | Xem mô tả, lịch theo ngày, giá, dịch vụ, chính sách hoàn huỷ. |
| UC-G-05 | Đặt chỗ và thanh toán cọc | Chọn lịch khởi hành, nhập thông tin hành khách, thanh toán cọc. |

#### UC-G-03: Tìm kiếm tour
- **Tiền điều kiện:** Không bắt buộc đăng nhập.
- **Luồng chính:** Nhập điểm đến / khoảng thời gian / khoảng giá → Hệ thống truy vấn các lịch khởi hành còn chỗ → Trả về danh sách phân trang.
- **Luồng ngoại lệ:** Không có kết quả → Gợi ý điểm đến phổ biến.

#### UC-G-05: Đặt chỗ và thanh toán cọc
- **Tiền điều kiện:** Đã đăng nhập; lịch khởi hành còn chỗ trống ≥ số người đặt.
- **Luồng chính:**
  1. Du khách chọn lịch khởi hành → nhập số người + thông tin từng hành khách.
  2. Hệ thống tính tổng tiền và khoản cọc (theo % cấu hình).
  3. Du khách xác nhận → thực hiện thanh toán cọc (mock / cổng thanh toán).
  4. Hệ thống tạo booking trạng thái `deposit_paid`, giảm số chỗ trống.
  5. Gửi email xác nhận cho du khách và thông báo cho công ty.
- **Luồng ngoại lệ:** Hết chỗ trong lúc thanh toán → huỷ giao dịch và hoàn lại cọc; thanh toán thất bại → giữ chỗ tạm thời rồi giải phóng sau timeout.

### 3.3. Use Case của Admin

| Mã | Tên Use Case | Mô tả ngắn |
| --- | --- | --- |
| UC-A-01 | Duyệt công ty du lịch | Phê duyệt / từ chối công ty mới đăng ký. |
| UC-A-02 | Quản lý công ty du lịch | Cập nhật thông tin, kích hoạt / vô hiệu hoá. |
| UC-A-03 | Quản lý danh mục điểm đến | CRUD điểm đến dùng chung toàn hệ thống. |
| UC-A-04 | Quản lý tour du lịch | Giám sát, ẩn / xoá tour vi phạm. |
| UC-A-05 | Quản lý đơn đặt tour | Theo dõi và cập nhật trạng thái booking. |
| UC-A-06 | Xem thống kê và báo cáo | Báo cáo toàn hệ thống. |

---

## 4. Yêu Cầu Chức Năng (Functional Requirements)

| Mã | Yêu cầu | Tác nhân | Ưu tiên |
| --- | --- | --- | --- |
| FR-01 | Đăng ký tài khoản du khách / công ty | A1, A2 | Cao |
| FR-02 | Đăng nhập / đăng xuất, JWT, đổi mật khẩu | A1, A2, A3 | Cao |
| FR-03 | Phân quyền theo vai trò (RBAC) | A3 | Cao |
| FR-04 | Quản lý điểm đến (CRUD) | A3 | Trung |
| FR-05 | Duyệt / từ chối / vô hiệu hoá công ty | A3 | Cao |
| FR-06 | CRUD tour + lịch trình theo ngày | A2 | Cao |
| FR-07 | Upload ảnh tour qua Cloudinary | A2 | Cao |
| FR-08 | Tạo / sửa / huỷ lịch khởi hành, quản lý chỗ trống | A2 | Cao |
| FR-09 | Tìm kiếm và lọc tour công khai | A1 | Cao |
| FR-10 | Xem chi tiết tour và lịch trình | A1 | Cao |
| FR-11 | Đặt chỗ + nhập thông tin hành khách | A1 | Cao |
| FR-12 | Thanh toán cọc (mock / VietQR / cổng) | A1 | Cao |
| FR-13 | Xem lịch sử đặt tour của bản thân | A1 | Trung |
| FR-14 | Huỷ booking theo chính sách hoàn huỷ | A1, A2 | Trung |
| FR-15 | Gửi email thông báo (đăng ký, đặt tour, duyệt) | Hệ thống | Cao |
| FR-16 | Dashboard thống kê công ty | A2 | Trung |
| FR-17 | Dashboard thống kê toàn hệ thống | A3 | Trung |
| FR-18 | Quản lý đơn đặt tour (admin override) | A3 | Trung |
| FR-19 | Rate limiting cho login / API public | Hệ thống | Cao |
| FR-20 | Logging hành vi quản trị (audit) | Hệ thống | Thấp |

---

## 5. Yêu Cầu Phi Chức Năng (Non-Functional Requirements)

| Mã | Loại | Yêu cầu |
| --- | --- | --- |
| NFR-01 | Hiệu năng | Trang danh sách tour trả về < 2s với ≤ 1000 bản ghi. |
| NFR-02 | Hiệu năng | API tìm kiếm chịu được 100 request đồng thời. |
| NFR-03 | Bảo mật | Mật khẩu hash bằng bcrypt; JWT có hạn ≤ 24h. |
| NFR-04 | Bảo mật | Phòng SQL Injection (ORM), XSS (React escape), CSRF (token). |
| NFR-05 | Bảo mật | HTTPS bắt buộc môi trường production. |
| NFR-06 | Bảo mật | Rate limit đăng nhập (5 lần / 15 phút / IP). |
| NFR-07 | Khả dụng | Uptime mục tiêu ≥ 99% (môi trường demo). |
| NFR-08 | Tương thích | Hỗ trợ Chrome/Edge/Firefox bản hiện hành. |
| NFR-09 | Tương thích | UI responsive (desktop, tablet, mobile ≥ 360px). |
| NFR-10 | Khả mở rộng | Thiết kế stateless API; sẵn sàng scale ngang. |
| NFR-11 | Khả bảo trì | Coverage backend ≥ 70% (gate CI). |
| NFR-12 | Khả bảo trì | Linting: `ruff` (BE), ESLint + Prettier (FE). |
| NFR-13 | Quốc tế hoá | Giao diện tiếng Việt; chuẩn UTF-8; tiền tệ VND. |
| NFR-14 | Khả truy cập | Tuân thủ cơ bản WCAG 2.1 AA cho luồng đặt tour. |
| NFR-15 | Sao lưu | Backup MySQL hằng ngày (môi trường production). |

---

## 6. Quy Tắc Nghiệp Vụ (Business Rules)

- **BR-01:** Công ty chỉ được đăng tour sau khi Admin duyệt (`status = approved`).
- **BR-02:** Du khách phải đăng nhập trước khi đặt chỗ.
- **BR-03:** Số chỗ trống của lịch khởi hành = `max_seats - SUM(booked_seats trạng thái deposit_paid|confirmed)`.
- **BR-04:** Khoản cọc mặc định = 30% tổng giá trị booking (cấu hình được).
- **BR-05:** Booking tự huỷ nếu không thanh toán cọc trong N phút (cấu hình; mặc định 15).
- **BR-06:** Huỷ booking theo chính sách hoàn huỷ của tour: `>= 7 ngày` hoàn 100% cọc, `3–6 ngày` hoàn 50%, `< 3 ngày` không hoàn.
- **BR-07:** Một email chỉ gắn với một tài khoản; vai trò xác định lúc đăng ký.
- **BR-08:** Admin không thể tự xoá tài khoản admin cuối cùng.
- **BR-09:** Tour bị xoá mềm (soft delete) nếu đã có booking lịch sử.
- **BR-10:** Giá lịch khởi hành có thể khác giá cơ sở của tour (ưu tiên giá lịch khởi hành).

---

## 7. Yêu Cầu Dữ Liệu (Data Requirements)

Các thực thể chính (chi tiết xem `docs/database-design.md`):
- `User` (id, email, password_hash, role, status, …).
- `Company` (extends User; tax_code, license, status).
- `Destination` (id, name, region, description).
- `Tour` (id, company_id, destination_id, title, description, base_price, refund_policy, images[], status).
- `Itinerary` (id, tour_id, day_no, title, activities, meals, lodging).
- `Departure` (id, tour_id, start_date, end_date, max_seats, available_seats, price).
- `Booking` (id, departure_id, user_id, num_passengers, total_amount, deposit_amount, status, created_at).
- `Passenger` (id, booking_id, full_name, dob, id_number, phone).
- `Payment` (id, booking_id, amount, method, status, transaction_ref).

---

## 8. Giao Diện và Trải Nghiệm Người Dùng

- **Wireframe nguồn:** [Figma — Tour Booking System Wireframes](https://www.figma.com/design/fBoMnlxDbYtK8RPcJUR3wg/Tour-Booking-System---Wireframes).
- 3 layout chính: Public (Du khách), Company Dashboard, Admin Console.
- Yêu cầu khoá ngữ cảnh: trạng thái loading, empty state, error toast, xác nhận hành động phá huỷ.
- Form validation phía client (Zod / react-hook-form) đồng bộ với rule backend.

---

## 9. Tích Hợp Bên Ngoài

| Dịch vụ | Mục đích | Ghi chú cấu hình |
| --- | --- | --- |
| Cloudinary | Lưu trữ ảnh tour, ảnh đại diện công ty | `CLOUDINARY_*` trong `.env` |
| Gmail SMTP | Gửi email xác nhận / thông báo | App Password 16 ký tự |
| (Tuỳ chọn) Cổng thanh toán | Thanh toán cọc thực tế | Hiện mock cho mục đích Capstone |

---

## 10. Giả Định và Ràng Buộc

- **Giả định:** Một du khách chỉ thanh toán cọc một lần / booking; không chia nhỏ.
- **Giả định:** Công ty tự chịu trách nhiệm nội dung tour; Admin chỉ kiểm duyệt vi phạm.
- **Ràng buộc:** Triển khai trong khung Capstone; thời lượng ≤ 8 tuần (xem `Tour_Booking.md` § Timeline).
- **Ràng buộc:** Stack cố định Flask + React + MySQL (đã thống nhất tuần 1).

---

## 11. Tiêu Chí Chấp Nhận (Acceptance Criteria — cốt lõi)

- **AC-01:** Du khách đăng ký, đăng nhập, đặt chỗ và nhận email xác nhận thành công.
- **AC-02:** Công ty đã duyệt có thể tạo tour mới, lịch trình ≥ 1 ngày và lịch khởi hành.
- **AC-03:** Admin duyệt công ty pending → công ty đăng nhập tạo tour ngay sau đó.
- **AC-04:** Khi 2 du khách cùng đặt lịch khởi hành chỉ còn 1 chỗ, chỉ một booking thành công.
- **AC-05:** Coverage backend ≥ 70%; suite e2e cốt lõi (đăng ký → đặt tour) chạy pass trên CI.

---

## 12. Tham Chiếu

- Đề tài Capstone OU: [Capstone Projects.pdf](https://lms.ou.edu.vn/252/pluginfile.php/84322/mod_resource/content/1/Capstone%20Projects.pdf)
- Use Case chi tiết: [`docs/Tour_Booking.md`](Tour_Booking.md)
- Wireframe: [Figma](https://www.figma.com/design/fBoMnlxDbYtK8RPcJUR3wg/Tour-Booking-System---Wireframes)
- Repo: <https://github.com/kensaik/Tour_Booking_System>
- Liên quan: [`database-design.md`](database-design.md), [`api-docs.md`](api-docs.md), [`test-plan.md`](test-plan.md)