# Hệ Thống Quản Lý Tour Du Lịch (Tour Booking System)

## Mô tả

Nền tảng đặt tour du lịch trực tuyến: du khách tìm kiếm, đặt chỗ, thanh toán đặt cọc và nhận lịch trình; công ty lữ hành quản lý chỗ trống, lịch khởi hành, hướng dẫn viên; admin quản trị các công ty đối tác và cấu hình hệ thống.

## Thành viên nhóm

| MSSV       | Họ tên                | Vai trò                                  |
| ---------- | --------------------- | ---------------------------------------- |
| 2351010124 | Lê Duy Mạnh           | PM / Backend Developer / Database Design |
| 2351010175 | Nguyễn Trần Minh Quân | Frontend Lead / UI-UX Design             |
| 2351050109 | Tô Nguyễn Sơn Nam     | Backend Developer / API Design           |
| 2351010154 | Trương Hưng Phát      | QA-Tester / Unit Test Setup              |

## Công nghệ sử dụng

- **Backend**: Flask 3.0 (Python 3.11) + Flask-SQLAlchemy + Flask-Migrate + Flask-JWT-Extended + Marshmallow
- **Frontend**: React 19 + TypeScript + Vite 6 + Tailwind CSS v4 + TanStack Query + Zustand
- **Database**: MySQL 8 (production / E2E); SQLite `:memory:` (unit + integration tests)
- **Khác**: Cloudinary (upload ảnh), Gmail SMTP (email), Docker Compose, GitHub Actions CI/CD, Playwright (E2E)

## Cài đặt và chạy

### Yêu cầu

- Python 3.11
- Node.js 20+
- MySQL 8 (cổng `3306`) — hoặc dùng Docker Compose

### Chạy Backend

```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\Activate.ps1
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # cấu hình SECRET_KEY, JWT_SECRET_KEY, DATABASE_URL, Cloudinary, Gmail SMTP
python -c "from src import create_app; from src.extensions import db; app=create_app(); ctx=app.app_context(); ctx.push(); db.create_all()"
python -m database.seed
python run.py
```

### Chạy Frontend

```bash
cd frontend
npm install
npm run dev
```

### Chạy bằng Docker Compose (tuỳ chọn)

```bash
docker compose up --build
docker compose exec backend python -m database.seed
```

### Truy cập

- Frontend: <http://localhost:5173>
- Backend API: <http://localhost:5000> (health check: `GET /api/health`)

### Tài khoản test (chỉ dành cho dev/test)

| Vai trò             | Email                | Mật khẩu      |
| ------------------- | -------------------- | ------------- |
| Admin               | `admin@test.com`     | `Admin@123`   |
| Công ty (đã duyệt)  | `abc@travel.com`     | `Company@123` |
| Công ty (chờ duyệt) | `pending@travel.com` | `Company@123` |
| Guest               | `a@gmail.com`        | `Guest@123`   |

## Demo

> Toàn bộ ảnh chụp được lưu tại [`docs/screenshots/`](docs/screenshots/). Link video demo: _đang cập nhật_.

### Trang chủ & Khám phá tour (Guest)

| Hero / Tìm kiếm | Tour nổi bật |
| --- | --- |
| ![Home hero](docs/screenshots/home/home_hero_20260510.png) | ![Featured tours](docs/screenshots/home/home_featured-tours_20260510.png) |

| Danh sách tour | Liên hệ |
| --- | --- |
| ![Tour list](docs/screenshots/home/home_tour-list_20260510.png) | ![Contact](docs/screenshots/home/home_contact_20260510.png) |

### Đăng nhập / Đăng ký

| Đăng nhập | Đăng ký |
| --- | --- |
| ![Sign in](docs/screenshots/login/login_signin_20260510.png) | ![Register](docs/screenshots/login/login_register_20260510.png) |

### Chi tiết tour

| Tổng quan | Thư viện ảnh | Khu vực đặt tour |
| --- | --- | --- |
| ![Tour overview](docs/screenshots/tour-detail/tour-detail_overview_20260510.png) | ![Tour gallery](docs/screenshots/tour-detail/tour-detail_gallery_20260510.png) | ![Booking section](docs/screenshots/tour-detail/tour-detail_booking-section_20260510.png) |

### Luồng đặt tour & Thanh toán

| Thông tin liên hệ | Phương thức thanh toán | QR VNPAY |
| --- | --- | --- |
| ![Contact info](docs/screenshots/booking/booking_contact_info_20260510.png) | ![Payment method](docs/screenshots/booking/booking_payment_method_20260510.png) | ![VNPAY QR](docs/screenshots/booking/booking_vnpay_qr_20260510.png) |

| Đặt tour thành công | Lịch sử đặt tour |
| --- | --- |
| ![Booking success](docs/screenshots/booking/booking_success_20260510.png) | ![Booking history](docs/screenshots/booking/booking_history_20260510.png) |

### Khu vực Công ty lữ hành

| Dashboard | Quản lý tour |
| --- | --- |
| ![Company dashboard](docs/screenshots/company/company_dashboard_20260510.png) | ![Company tours](docs/screenshots/company/company_tours_20260510.png) |

| Lịch khởi hành | Thêm lịch khởi hành | Quản lý booking |
| --- | --- | --- |
| ![Schedules](docs/screenshots/company/company_schedules_20260510.png) | ![Add schedule](docs/screenshots/company/company_add-schedule_20260510.png) | ![Company bookings](docs/screenshots/company/company_bookings_20260510.png) |

### Khu vực Quản trị (Admin)

| Dashboard | Danh sách công ty | Thêm công ty |
| --- | --- | --- |
| ![Admin dashboard](docs/screenshots/admin/admin_dashboard_20260510.png) | ![Companies](docs/screenshots/admin/admin_companies_20260510.png) | ![Add company](docs/screenshots/admin/admin_add-company-modal_20260510.png) |

| Quản lý điểm đến | Thêm điểm đến |
| --- | --- |
| ![Destinations](docs/screenshots/admin/admin_destinations_20260510.png) | ![Add destination](docs/screenshots/admin/admin_add-destination-modal_20260510.png) |

## Tài liệu

- [Phân tích yêu cầu](docs/requirements.md)
- [Test Plan](docs/test-plan.md) · [Test Cases](docs/test-cases.md) · [Test Report](docs/test-report.md)
- [API Documentation](docs/api-docs.md)
- [Contributing Guide](docs/contributing.md)
- [Performance Results](docs/performance-results-log.md) · [Performance Bottleneck](docs/performance-bottleneck-log.md)
- [Automation Test Report](docs/automation/automation-test-report.md)
- [Weekly Reports](docs/weekly-reports/)
