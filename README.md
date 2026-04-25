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
- **Frontend:** React
- **Database:** MySQL

## Cài đặt và chạy

### Yêu cầu
- Python 3.x
- Node.js 18+
- MySQL Server

### Chạy Backend (Flask)
```bash
cd backend
python -m venv venv
# Active venv (Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate)
pip install -r requirements.txt
flask run

### Chạy Frontend (nếu dùng React)
cd frontend
npm install
npm start

### Truy cập
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

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

## Demo

## Tài liệu
- [Phân tích yêu cầu](docs/requirements.md)
- [Database Design](docs/database-design.md)
- [Test Plan](docs/test-plan.md)
- [API Documentation](docs/api-docs.md)