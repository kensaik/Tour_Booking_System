# Test Data - Hệ Thống Đặt Tour

Thư mục này chứa dữ liệu mẫu dùng cho việc kiểm thử.

---

## Cấu trúc thư mục

```
docs/test-data/
├── users.json          # Dữ liệu tài khoản test
├── tours.json          # Dữ liệu tour mẫu
├── bookings.json       # Dữ liệu booking mẫu
└── README.md           # File này
```

---

## Hướng dẫn sử dụng

### Cách 1: Seed trực tiếp vào database

```bash
cd backend
python -c "
from src import app, db
from src.models import User, Destination, Tour, GuestProfile, CompanyProfile
from src.utils.auth import hash_password

with app.app_context():
    # Tạo users
    admin = User(email='admin@test.com', password_hash=hash_password('Admin@123'), role='ADMIN')
    company = User(email='abc@travel.com', password_hash=hash_password('Company@123'), role='COMPANY')
    guest = User(email='a@gmail.com', password_hash=hash_password('Guest@123'), role='GUEST')

    db.session.add_all([admin, company, guest])
    db.session.commit()
    
    # Tạo profiles
    company_profile = CompanyProfile(user_id=company.id, company_name='ABC Travel', is_approved=True)
    guest_profile = GuestProfile(user_id=guest.id, full_name='Nguyen Van A', phone_number='0900000000')

    db.session.add_all([company_profile, guest_profile])
    db.session.commit()
    
    print('Seed completed!')
"
```

### Cách 2: Sử dụng Postman/curl

Import file `docs/test-data/users.json` vào Postman collection.

---

## Tài khoản Test

| Role | Email | Password | Trạng thái |
|------|-------|----------|------------|
| Admin | `admin@test.com` | `Admin@123` | Active |
| Company (đã duyệt) | `abc@travel.com` | `Company@123` | `is_approved=True` |
| Company (chờ duyệt) | `pending@travel.com` | `Company@123` | `is_approved=False` |
| Guest | `a@gmail.com` | `Guest@123` | Active |

---

## Dữ liệu Tour Test

| ID | Tên | Giá | Trạng thái | Điểm đến |
|----|-----|-----|------------|-----------|
| 1 | Tour Đà Lạt 3N2Đ | 1,500,000 | ACTIVE | Đà Lạt |
| 2 | Tour Phú Quốc 4N3Đ | 2,500,000 | ACTIVE | Phú Quốc |
| 3 | Tour Nha Trang 2N1Đ | 1,200,000 | ACTIVE | Nha Trang |
| 5 | Tour Hà Nội 4N3Đ | 3,000,000 | ACTIVE | Hà Nội |

---

## Cập nhật log

| Ngày | Người cập nhật | Mô tả |
|------|-----------------|--------|
| 06/05/2026 | Trương Hưng Phát | Tạo file |
