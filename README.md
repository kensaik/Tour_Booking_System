# Hệ Thống Quản Lý Tour Du Lịch (Tour Booking System)

## Mô tả
Xây dựng hệ thống nền tảng cho phép du khách tìm kiếm, đặt chỗ, thanh toán đặt cọc và nhận lịch trình tour trực tuyến. 
Hệ thống đồng thời hỗ trợ các công ty lữ hành quản lý số lượng chỗ trống, lịch khởi hành, hướng dẫn viên, 
và cung cấp công cụ cho Admin quản trị các công ty đối tác cùng cấu hình hệ thống.

## Thành viên nhóm

| Thành viên            | MSSV         | Vai trò                                      |
| Lê Duy Mạnh           | [2351010124] | PM / Backend Developer / Database Design     |
| Nguyễn Trần Minh Quân | [2351010175] | Frontend Lead / UI-UX Design                 |
| Tô Nguyễn Sơn Nam     | [2351050109] | Backend Developer / API Design               |
| Trương Hưng Phát      | [2351010154] | QA-Tester / Unit Test Setup                  |

## Công nghệ sử dụng
- **Backend:** Python (Flask)
- **Frontend:** React + TypeScript + Vite
- **Database:** MySQL
- **Cloud Storage:** Cloudinary (upload hình ảnh)
- **Email:** Gmail SMTP (xác nhận đặt tour, thông báo)

## Cài đặt và chạy

### Yêu cầu
- Python 3.x
- Node.js 18+
- MySQL Server (đang chạy ở cổng 3306)

### Chạy Backend (Flask)
```bash
cd backend

# 1. Tạo môi trường ảo và kích hoạt
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# 2. Cài đặt thư viện
pip install -r requirements.txt

# 3. Cấu hình biến môi trường
# Copy nội dung từ file .env.example sang file .env và điền thông tin
cp .env.example .env

# Chỉnh sửa file .env với các thông tin:
# - Database MySQL
# - Cloudinary (lấy từ https://cloudinary.com/console)
# - Email Gmail SMTP (sử dụng App Password, NOT regular password)

# 4. Khởi tạo dữ liệu mẫu (Cực kỳ quan trọng để Test)
# Lệnh này sẽ xóa DB cũ, tạo lại các bảng và bơm dữ liệu giả lập (Tours, Users, Bookings...)
python database/seed.py

# 5. Khởi động Server
flask run
```

> **Tài khoản Test mặc định (Mật khẩu chung: `123`)**
> - Admin: `admin@test.com`
> - Công ty: `company@test.com`
> - Khách hàng: `guest1@test.com`

### Chạy Frontend (nếu dùng React)
```bash
cd frontend
npm install
npm run dev
```

### Truy cập
- Frontend: `http://localhost:5173` (nếu dùng Vite) hoặc `http://localhost:3000`
- Backend API: `http://localhost:5000`

## Lint & Format

Cấu hình editor được khoá qua [`.editorconfig`](.editorconfig) (LF, UTF-8, 2 spaces mặc định, 4 spaces cho Python).

### Backend (ruff)
Cấu hình nằm trong `backend/pyproject.toml`. Chỉ cần cài dev deps một lần:
```bash
cd backend
pip install -r requirements-dev.txt
```

### Frontend (ESLint + Prettier)
Xem [`frontend/README.md`](frontend/README.md) để biết cách bootstrap Vite + cài dev deps một lần.

## Running automation tests

API automation suite (Phase 6) runs against an ephemeral MySQL service in GitHub Actions and is **manual-dispatch only** — it does not block PRs.

**Trigger from the Actions tab:**
1. Open `Actions` → workflow **Automation Tests** → `Run workflow`.
2. Select the branch (defaults to current default branch) and click `Run workflow`.
3. After the run completes, download the `automation-report` artifact for the HTML test report.

**Requirements:** repository secret `JWT_SECRET_KEY_TEST` must be set (any non-empty value works for the ephemeral container; do not reuse production secrets).

The PR coverage gate (`ci.yml` → backend job) enforces `--cov-fail-under=70` independently and blocks merges if backend coverage drops below 70%.

## Demo

## Cấu hình dịch vụ

### Cloudinary (Lưu trữ hình ảnh)
1. Đăng ký tài khoản tại [Cloudinary](https://cloudinary.com/)
2. Lấy thông tin từ Dashboard: `Cloud Name`, `API Key`, `API Secret`
3. Thêm vào `.env`:
```
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_ENABLED=true
```

### Gmail SMTP (Gửi email)
1. Bật 2-Factor Authentication trên Google Account
2. Tạo App Password tại [Google App Passwords](https://myaccount.google.com/apppasswords)
3. Thêm vào `.env`:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
EMAIL_PORT=587
EMAIL_USE_TLS=true
```

## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [Test Plan](docs/test-plan.md)
- [API Documentation](docs/api-docs.md)
- [Contributing Guide](docs/contributing.md)