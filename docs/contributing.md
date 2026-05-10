# Hướng Dẫn Đóng Góp (Contributing Guide)

Tài liệu này mô tả quy trình làm việc với Git của nhóm phát triển **Tour Booking System**, bao gồm chiến lược nhánh (branching strategy), quy ước đặt tên nhánh, và quy trình tạo Pull Request.

## 1. Mô hình nhánh (Branching Model)

Nhóm sử dụng mô hình **GitHub Flow rút gọn** với các nhánh chính sau:

| Nhánh         | Mục đích                                                                 |
| ------------- | ------------------------------------------------------------------------ |
| `main`        | Nhánh ổn định, luôn ở trạng thái deploy được. Không commit trực tiếp.    |
| `develop`     | Nhánh tích hợp các tính năng đang phát triển trước khi merge vào `main`. |
| `feature/*`   | Nhánh phát triển tính năng mới.                                          |
| `fix/*`       | Nhánh sửa lỗi (bug fix).                                                 |
| `chore/*`     | Nhánh cho công việc bảo trì, cấu hình, tài liệu, không ảnh hưởng logic.  |

> **Lưu ý:** Mọi thay đổi đều phải đi qua Pull Request và được review bởi ít nhất 1 thành viên trước khi merge.

## 2. Quy ước đặt tên nhánh (Branch Naming Convention)

Cấu trúc chung:

```
<type>/<short-description-in-kebab-case>
```

### 2.1. `feature/*` — Tính năng mới

Dùng khi thêm chức năng mới cho hệ thống (API endpoint, trang UI, module mới, v.v.).

Ví dụ:

```
feature/tour-search-api
feature/booking-checkout-page
feature/admin-user-management
```

### 2.2. `fix/*` — Sửa lỗi

Dùng khi sửa bug đã được phát hiện (lỗi logic, lỗi UI, lỗi bảo mật, v.v.).

Ví dụ:

```
fix/login-validation-error
fix/payment-amount-rounding
fix/tour-list-pagination
```

### 2.3. `chore/*` — Công việc bảo trì

Dùng cho các thay đổi không liên quan trực tiếp đến chức năng nghiệp vụ: cập nhật dependencies, chỉnh CI/CD, viết tài liệu, refactor không thay đổi hành vi, cấu hình lint/format, v.v.

Ví dụ:

```
chore/update-dependencies
chore/add-eslint-config
chore/update-readme
chore/setup-github-actions
```

### 2.4. Nguyên tắc đặt tên

- Sử dụng **kebab-case** (chữ thường, gạch nối `-`).
- Mô tả ngắn gọn, **không quá 50 ký tự**.
- **Không** chứa khoảng trắng, ký tự đặc biệt, hoặc tiếng Việt có dấu.
- Nên gắn issue ID nếu có: `feature/123-tour-search-api`.

## 3. Quy trình làm việc (Workflow)

### Bước 1. Đồng bộ nhánh `develop`

```bash
git checkout develop
git pull origin develop
```

### Bước 2. Tạo nhánh mới từ `develop`

```bash
git checkout -b feature/tour-search-api
```

### Bước 3. Commit theo Conventional Commits

```bash
git add .
git commit -m "feat(tour): add search API with filter by destination"
```

Tiền tố commit gợi ý: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`, `ci`.

### Bước 4. Push nhánh lên remote

```bash
git push -u origin feature/tour-search-api
```

### Bước 5. Tạo Pull Request

- **Base branch:** `develop` (không phải `main`).
- **Title:** ngắn gọn, theo dạng `[type] mô tả` (ví dụ: `[feature] Tour search API`).
- **Description:** mô tả thay đổi, ảnh hưởng, cách kiểm thử, link issue liên quan.
- Gán **reviewer** ít nhất 1 thành viên.
- Đảm bảo **CI pass** (lint, test) trước khi yêu cầu review.

### Bước 6. Merge và xoá nhánh

- Sau khi PR được approve và CI xanh, sử dụng **Squash and merge**.
- Xoá nhánh feature/fix/chore sau khi merge để giữ repository sạch.

## 4. Quy tắc bảo vệ nhánh (Branch Protection)

Áp dụng cho `main` và `develop`:

- **Cấm push trực tiếp** — bắt buộc qua Pull Request.
- **Bắt buộc review** — ít nhất 1 approval trước khi merge.
- **Bắt buộc CI pass** — pipeline trong `.github/workflows/ci.yml` phải thành công.
- **Cấm force push** và **cấm xoá nhánh**.

## 5. Ví dụ tình huống

| Tình huống                              | Loại nhánh  | Tên nhánh ví dụ                  |
| --------------------------------------- | ----------- | -------------------------------- |
| Thêm chức năng đặt tour                 | `feature/*` | `feature/tour-booking-flow`      |
| Sửa lỗi tính tiền cọc sai               | `fix/*`     | `fix/deposit-calculation`        |
| Cập nhật README và tài liệu API         | `chore/*`   | `chore/update-api-docs`          |
| Nâng cấp Flask lên phiên bản mới        | `chore/*`   | `chore/upgrade-flask-3`          |
| Sửa lỗi UI nút "Đặt ngay" không bấm được | `fix/*`     | `fix/book-now-button-click`      |
| Thêm trang quản lý hướng dẫn viên       | `feature/*` | `feature/guide-management-page`  |

## 6. Tham khảo

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Semantic Versioning](https://semver.org/)
