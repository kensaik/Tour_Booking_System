## 1\. API Người Dùng

### 1.1 Đăng ký người dùng - POST /users/register

Request:

POST /users/register  
Content-Type: application/json  
<br/>{  
"ten": "Nguyen Van A",  
"email": "<a@gmail.com>",  
"mat_khau": "123456",  
"so_dien_thoai": "0123456789",  
"ngay_sinh": "1990-05-01",  
"gioi_tinh": "nam",  
"so_ho_chieu": "C1234567"  
}

Response:

{  
"message": "Đăng ký thành công",  
"user_id": 1  
}

### 1.2 Đăng nhập - POST /users/login

Request:

POST /users/login  
Content-Type: application/json  
<br/>{  
"email": "<a@gmail.com>",  
"mat_khau": "123456"  
}

Response:

{  
"token": "jwt-token-abc",  
"user": {  
"nguoi_dung_id": 1,  
"ten": "Nguyen Van A",  
"vai_tro": "du_khach"  
}  
}

## 2\. API Công Ty Du Lịch

### 2.1 Đăng ký công ty - POST /companies/register

{  
"ten_cong_ty": "ABC Travel",  
"email": "<abc@travel.com>",  
"mat_khau": "123456",  
"so_dien_thoai": "0901234567",  
"dia_chi": "Hà Nội"  
}

### 2.2 Lấy danh sách công ty - GET /companies

\[  
{  
"cong_ty_id": 1,  
"ten_cong_ty": "ABC Travel",  
"email": "<abc@travel.com>",  
"trang_thai": "da_duyet"  
}  
\]

## 3\. API Điểm Đến

### 3.1 Tạo điểm đến - POST /destinations

{  
"ten_diem_den": "Paris",  
"mo_ta": "Thành phố ánh sáng",  
"quoc_gia": "Pháp",  
"hinh_anh": "paris.jpg"  
}

## 4\. API Tour Du Lịch

### 4.1 Tạo tour - POST /tours

{  
"cong_ty_id": 1,  
"diem_den_id": 2,  
"ten_tour": "Tour Paris 5 ngày",  
"mo_ta": "Khám phá Paris hoa lệ",  
"gia": 1500,  
"so_ngay": 5,  
"trang_thai": "dang_ban"  
}

### 4.2 Lấy danh sách tour - GET /tours

\[  
{  
"tour_id": 5,  
"ten_tour": "Tour Paris 5 ngày",  
"gia": 1500,  
"so_ngay": 5,  
"trang_thai": "dang_ban"  
}  
\]

### 4.3 Chi tiết tour - GET /tours/{id}

{  
"tour_id": 5,  
"ten_tour": "Tour Paris 5 ngày",  
"mo_ta": "Khám phá Paris",  
"gia": 1500,  
"lich_trinh": \[  
{"ngay_thu": 1, "tieu_de": "Ngày 1", "mo_ta": "Tháp Eiffel"}  
\]  
}

## 5\. API Lịch Khởi Hành

### 5.1 Tạo lịch khởi hành - POST /departures

{  
"tour_id": 5,  
"ngay_khoi_hanh": "2026-07-15",  
"so_cho": 20  
}

### 5.2 Lấy lịch khởi hành - GET /departures?tour_id=5

\[  
{  
"lich_khoi_hanh_id": 3,  
"ngay_khoi_hanh": "2026-07-15",  
"so_cho": 20,  
"so_cho_con_lai": 18  
}  
\]

## 6\. API Đơn Đặt Tour

### 6.1 Đặt tour - POST /booking

{  
"nguoi_dung_id": 1,  
"lich_khoi_hanh_id": 3,  
"so_luong_nguoi": 2,  
"tien_coc": 300,  
"trang_thai": "cho_xac_nhan"  
}

### 6.2 Danh sách đơn đặt - GET /booking?user_id=1

\[  
{  
"don_dat_id": 10,  
"tour_id": 5,  
"so_luong_nguoi": 2,  
"trang_thai": "cho_xac_nhan"  
}  
\]

## 7\. API Thanh Toán

### 7.1 Thanh toán - POST /payments

{  
"don_dat_id": 10,  
"so_tien": 1500,  
"phuong_thuc": "vnpay",  
"trang_thai": "thanh_cong"  
}

### 7.2 Lịch sử thanh toán - GET /payments?don_dat_id=10

\[  
{  
"thanh_toan_id": 1,  
"so_tien": 1500,  
"phuong_thuc": "vnpay",  
"trang_thai": "thanh_cong",  
"ngay_thanh_toan": "2026-03-05"  
}  
\]
