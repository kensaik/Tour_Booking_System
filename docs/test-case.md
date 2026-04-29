# Test Case — Hệ thống Đặt Tour

**Phiên bản:** 1.0 | **Tác giả:** Trương Hưng Phát | **Ngày:** 29/04/2025  
**Tài liệu tham chiếu:** `docs/test-plan.md` · `docs/api-docs.md`

---

## Công ty du lịch

### TC-UC-01 · Đăng ký

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| TC_UC01_01 | Đăng ký với đầy đủ dữ liệu hợp lệ | EP (Hợp lệ) | DB đang chạy; `newco@test.com` chưa được đăng ký | 1. POST `/companies/register` với `ten_cong_ty`, `email`, `mat_khau`, `so_dien_thoai`, `dia_chi` đều hợp lệ | HTTP 201; bản ghi trong DB có `trang_thai = cho_duyet`; response có company ID | |
| TC_UC01_02 | Đăng ký với email trùng | EP (Không hợp lệ) | `abc@travel.com` đã được đăng ký | 1. POST `/companies/register` với `email = abc@travel.com` và các trường khác hợp lệ | HTTP 409 hoặc 400; lỗi "email already exists"; không tạo bản ghi trùng | |
| TC_UC01_03 | Đăng ký thiếu trường bắt buộc (`mat_khau`) | EP (Không hợp lệ) | Không có | 1. POST `/companies/register` nhưng bỏ qua `mat_khau` | HTTP 400; lỗi validation liệt kê trường bị thiếu; không insert bản ghi | |

### TC-UC-02 · Đăng nhập

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| TC_UC02_01 | Đăng nhập với thông tin hợp lệ | EP (Hợp lệ) | Công ty tồn tại với `trang_thai = da_duyet` | 1. POST `/users/login` với `email` và `mat_khau` chính xác | HTTP 200; response có `token` (JWT); `vai_tro = cong_ty` | |
| TC_UC02_02 | Đăng nhập sai mật khẩu | EP (Không hợp lệ) | Tài khoản công ty tồn tại | 1. POST `/users/login` với email đúng, `mat_khau` sai | HTTP 401; có thông báo lỗi; không trả về token | |
| TC_UC02_03 | Đăng nhập bằng email chưa đăng ký | EP (Không hợp lệ) | Không có | 1. POST `/users/login` với `email = ghost@test.com` | HTTP 401; có thông báo lỗi; không trả về token | |
| TC_UC02_04 | Đăng nhập bằng tài khoản đang chờ phê duyệt | Scenario | Công ty tồn tại với `trang_thai = cho_duyet` | 1. POST `/users/login` với thông tin hợp lệ của công ty đang chờ duyệt | HTTP 403; lỗi "account not approved"; không trả về token | |

### TC-UC-03 · Quản lý tour và lịch trình

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| TC_UC03_01 | Tạo tour với dữ liệu hợp lệ | EP (Hợp lệ) | Công ty đã được phê duyệt và đã xác thực; `diem_den_id = 2` tồn tại | 1. POST `/tours` với `ten_tour`, `mo_ta`, `gia`, `so_ngay`, `diem_den_id`, `cong_ty_id` đều hợp lệ | HTTP 201; có bản ghi tour trong DB; response có `tour_id` | |
| TC_UC03_02 | Chỉnh sửa tour hiện có | EP (Hợp lệ) | Đã xác thực; tour thuộc sở hữu công ty tồn tại | 1. PUT `/tours/{id}` với `ten_tour` và `gia` đã cập nhật | HTTP 200; bản ghi DB được cập nhật; response phản ánh giá trị mới | |
| TC_UC03_03 | Xóa tour không có booking đang hoạt động | EP (Hợp lệ) | Đã xác thực; tour tồn tại; không có booking đang hoạt động | 1. DELETE `/tours/{id}` | HTTP 200; bản ghi bị xóa; GET `/tours/{id}` trả về 404 | |
| TC_UC03_04 | Tạo tour thiếu `ten_tour` | EP (Không hợp lệ) | Công ty đã được phê duyệt và đã xác thực | 1. POST `/tours` nhưng bỏ qua `ten_tour` | HTTP 400; lỗi validation cho trường bị thiếu; không insert bản ghi | |

### TC-UC-04 · Lên lịch khởi hành

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| TC_UC04_01 | Tạo lịch khởi hành với ngày và số chỗ hợp lệ | EP (Hợp lệ) | Đã xác thực; tour tồn tại | 1. POST `/departures` với `tour_id`, `ngay_khoi_hanh = 2026-09-01`, `so_cho = 20` | HTTP 201; bản ghi trong DB có `so_cho_con_lai = 20`; xuất hiện trong `GET /departures?tour_id=X` | |
| TC_UC04_02 | Tạo lịch khởi hành với ngày trong quá khứ | EP (Không hợp lệ) | Đã xác thực; tour tồn tại | 1. POST `/departures` với `ngay_khoi_hanh = 2020-01-01` | HTTP 400; lỗi "departure date must be in the future"; không insert bản ghi | |
| TC_UC04_03 | Tạo lịch khởi hành với số chỗ bằng 0 | BVA (biên = 0) | Đã xác thực; tour tồn tại | 1. POST `/departures` với `so_cho = 0` | HTTP 400; lỗi validation cho số chỗ; không insert bản ghi | |
| TC_UC04_04 | Tạo lịch khởi hành với 1 chỗ (giá trị hợp lệ nhỏ nhất) | BVA (biên = 1) | Đã xác thực; tour tồn tại | 1. POST `/departures` với `so_cho = 1` | HTTP 201; bản ghi được tạo thành công | |

### TC-UC-05 · Bảng thống kê kinh doanh

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| TC_UC05_01 | Xem dashboard khi đã có tour và doanh thu | EP (Hợp lệ) | Đã xác thực; có ≥1 tour và ≥1 booking đã hoàn tất | 1. Điều hướng đến dashboard của công ty | Hiển thị tổng số tour, lịch khởi hành, doanh thu; các giá trị khớp với bản ghi DB | |
| TC_UC05_02 | Xem dashboard khi chưa tạo tour | Scenario | Đã xác thực; chưa có tour nào được tạo | 1. Điều hướng đến dashboard của công ty | Tất cả thống kê hiển thị 0; không có lỗi hoặc crash | |

---

## Du khách

### T-UC-01 · Đăng ký

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| T_UC01_01 | Đăng ký với đầy đủ dữ liệu hợp lệ | EP (Hợp lệ) | `tourist@test.com` chưa được đăng ký | 1. POST `/users/register` với `ten`, `email`, `mat_khau`, `so_dien_thoai`, `ngay_sinh`, `gioi_tinh`, `so_ho_chieu` đều hợp lệ | HTTP 201; bản ghi user trong DB có `vai_tro = du_khach`; response có `user_id` | |
| T_UC01_02 | Đăng ký với email trùng | EP (Không hợp lệ) | `a@gmail.com` đã được đăng ký | 1. POST `/users/register` với `email = a@gmail.com` | HTTP 409 hoặc 400; lỗi "email already exists"; không insert bản ghi trùng | |
| T_UC01_03 | Đăng ký với định dạng email không hợp lệ | EP (Không hợp lệ) | Không có | 1. POST `/users/register` với `email = not-an-email` | HTTP 400; lỗi validation cho định dạng email không hợp lệ; không insert bản ghi | |
| T_UC01_04 | Đăng ký thiếu `mat_khau` | EP (Không hợp lệ) | Không có | 1. POST `/users/register` nhưng bỏ qua `mat_khau` | HTTP 400; lỗi validation liệt kê trường bị thiếu; không insert bản ghi | |

### T-UC-02 · Đăng nhập

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| T_UC02_01 | Đăng nhập với thông tin hợp lệ | EP (Hợp lệ) | Tài khoản du khách tồn tại | 1. POST `/users/login` với `email` và `mat_khau` chính xác | HTTP 200; response có `token` (JWT); `vai_tro = du_khach` | |
| T_UC02_02 | Đăng nhập sai mật khẩu | EP (Không hợp lệ) | Tài khoản du khách tồn tại | 1. POST `/users/login` với email đúng, `mat_khau` sai | HTTP 401; có thông báo lỗi; không trả về token | |
| T_UC02_03 | Đăng nhập bằng email chưa đăng ký | EP (Không hợp lệ) | Không có | 1. POST `/users/login` với `email = ghost@test.com` | HTTP 401; có thông báo lỗi; không trả về token | |

### T-UC-03 · Tìm kiếm tour

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| T_UC03_01 | Tìm kiếm theo điểm đến có kết quả | EP (Hợp lệ) | Có ≥1 tour đang hoạt động cho điểm đến "Paris" | 1. GET `/tours?diem_den=Paris` | HTTP 200; chỉ trả về các tour có điểm đến "Paris"; hiển thị tên, giá, thông tin khởi hành | |
| T_UC03_02 | Tìm kiếm theo ngày khởi hành có kết quả | EP (Hợp lệ) | Có ≥1 lịch khởi hành vào `2026-09-01` | 1. GET `/tours?ngay_khoi_hanh=2026-09-01` | HTTP 200; chỉ trả về các tour có lịch khởi hành vào ngày đó | |
| T_UC03_03 | Tìm kiếm không có kết quả | Scenario | Không có tour cho điểm đến "Atlantis" | 1. Tìm kiếm với điểm đến "Atlantis" | HTTP 200; mảng rỗng; UI hiển thị thông báo "no tours found"; không crash | |
| T_UC03_04 | Duyệt tất cả tour không dùng bộ lọc | EP (Hợp lệ) | Có ≥3 tour đang hoạt động | 1. GET `/tours` không có query params | HTTP 200; liệt kê tất cả tour đang hoạt động; UI render không lỗi | |

### T-UC-04 · Xem chi tiết tour

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| T_UC04_01 | Xem chi tiết một tour tồn tại | EP (Hợp lệ) | Tour với `tour_id = 5` tồn tại | 1. GET `/tours/5` | HTTP 200; response có `ten_tour`, `mo_ta`, `gia`, mảng `lich_trinh`; UI hiển thị đầy đủ các phần | |
| T_UC04_02 | Xem chi tiết với tour ID không tồn tại | EP (Không hợp lệ) | Không có tour với `tour_id = 9999` | 1. GET `/tours/9999` | HTTP 404; có thông báo lỗi; UI hiển thị trạng thái không tìm thấy | |

### T-UC-05 · Đặt tour và thanh toán tiền cọc

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| T_UC05_01 | Đặt tour thành công khi còn đủ chỗ | EP (Hợp lệ) | Du khách đã xác thực; lịch khởi hành `lich_khoi_hanh_id = 3` có `so_cho_con_lai ≥ 2` | 1. POST `/booking` với `lich_khoi_hanh_id = 3`, `so_luong_nguoi = 2`, `tien_coc = 300` | HTTP 201; booking được tạo với `trang_thai = da_dat_coc`; `so_cho_con_lai` giảm 2; thông báo được kích hoạt cho công ty và du khách | |
| T_UC05_02 | Đặt tour vượt quá số chỗ còn lại | EP (Không hợp lệ) | Du khách đã xác thực; lịch khởi hành còn `so_cho_con_lai = 1` | 1. POST `/booking` với `so_luong_nguoi = 5` | HTTP 400 hoặc 409; lỗi "not enough seats"; không tạo booking; số chỗ không đổi | |
| T_UC05_03 | Đặt tour khi chưa xác thực | Scenario | Không có Authorization header / không có session | 1. POST `/booking` không kèm JWT token | HTTP 401; không tạo booking; UI chuyển hướng đến trang đăng nhập | |
| T_UC05_04 | Đặt đúng số chỗ cuối cùng còn lại | BVA (biên = số chỗ còn lại) | Du khách đã xác thực; lịch khởi hành có `so_cho_con_lai = 2` | 1. POST `/booking` với `so_luong_nguoi = 2` | HTTP 201; booking được tạo; `so_cho_con_lai` trở thành 0; lần đặt tiếp theo trả về lỗi | |

---

## Quản trị viên

### A-UC-01 · Phê duyệt / Từ chối công ty du lịch

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| A_UC01_01 | Phê duyệt công ty đang chờ duyệt | EP (Hợp lệ) | Admin đã xác thực; công ty có `trang_thai = cho_duyet` tồn tại | 1. Cập nhật trạng thái công ty thành `da_duyet` | HTTP 200; `trang_thai = da_duyet` trong DB; công ty có thể đăng nhập và đăng tour | |
| A_UC01_02 | Từ chối công ty đang chờ duyệt | EP (Hợp lệ) | Admin đã xác thực; công ty có `trang_thai = cho_duyet` tồn tại | 1. Cập nhật trạng thái công ty thành `tu_choi` | HTTP 200; `trang_thai = tu_choi` trong DB; công ty đăng nhập trả về 403 | |
| A_UC01_03 | Xem danh sách chờ duyệt khi không có công ty nào | Scenario | Admin đã xác thực; không có công ty với `trang_thai = cho_duyet` | 1. GET `/companies?trang_thai=cho_duyet` | HTTP 200; mảng rỗng; UI hiển thị thông báo "no pending companies" | |

### A-UC-02 · Quản lý công ty đã được phê duyệt

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| A_UC02_01 | Chỉnh sửa thông tin công ty | EP (Hợp lệ) | Admin đã xác thực; công ty đã được phê duyệt tồn tại | 1. PUT `/companies/{id}` với `ten_cong_ty` và `dia_chi` đã cập nhật | HTTP 200; bản ghi DB được cập nhật; response phản ánh giá trị mới | |
| A_UC02_02 | Vô hiệu hóa một công ty đã được phê duyệt | Scenario | Admin đã xác thực; công ty có `trang_thai = da_duyet` | 1. Cập nhật trạng thái công ty thành `khoa` | HTTP 200; `trang_thai = khoa` trong DB; công ty đăng nhập trả về 403; tour bị ẩn khỏi tìm kiếm của du khách | |

### A-UC-03 · Quản lý danh mục điểm đến (CRUD)

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| A_UC03_01 | Thêm điểm đến mới với dữ liệu hợp lệ | EP (Hợp lệ) | Admin đã xác thực; "Kyoto" chưa tồn tại | 1. POST `/destinations` với `ten_diem_den = "Kyoto"`, `mo_ta`, `quoc_gia = "Nhật Bản"` | HTTP 201; có bản ghi trong DB; điểm đến xuất hiện trong form tạo tour | |
| A_UC03_02 | Chỉnh sửa mô tả điểm đến hiện có | EP (Hợp lệ) | Admin đã xác thực; điểm đến tồn tại | 1. PUT `/destinations/{id}` với `mo_ta` đã cập nhật | HTTP 200; bản ghi DB được cập nhật; response phản ánh mô tả mới | |
| A_UC03_03 | Xóa điểm đến không liên kết với tour nào | EP (Hợp lệ) | Admin đã xác thực; điểm đến tồn tại; không có tour liên kết | 1. DELETE `/destinations/{id}` | HTTP 200; bản ghi bị xóa; GET trả về 404 | |
| A_UC03_04 | Thêm điểm đến với tên trùng | EP (Không hợp lệ) | "Paris" đã tồn tại | 1. POST `/destinations` với `ten_diem_den = "Paris"` | HTTP 409 hoặc 400; lỗi "destination already exists"; không tạo bản ghi mới | |

### A-UC-04 · Quản lý tour trên nền tảng

| Test Case ID | Mô tả | Loại dữ liệu | Tiền điều kiện | Các bước thực hiện | Kết quả mong đợi | Ghi chú |
|---|---|---|---|---|---|---|
| A_UC04_01 | Xem tất cả tour của mọi công ty | EP (Hợp lệ) | Admin đã xác thực; có ≥1 tour từ bất kỳ công ty nào | 1. GET `/tours` với phạm vi Admin | HTTP 200; liệt kê tất cả tour kèm tên công ty, trạng thái, ngày tạo | |
| A_UC04_02 | Gỡ bỏ tour vi phạm chính sách | Scenario | Admin đã xác thực; tour tồn tại | 1. DELETE `/tours/{id}` với quyền Admin | HTTP 200; tour bị xóa khỏi DB; không còn xuất hiện trong kết quả tìm kiếm của du khách | |
| A_UC04_03 | Chỉnh sửa nội dung tour với quyền Admin | EP (Hợp lệ) | Admin đã xác thực; tour tồn tại | 1. PUT `/tours/{id}` với `mo_ta` đã cập nhật | HTTP 200; DB được cập nhật; thay đổi hiển thị trong trang chi tiết tour của du khách | |

---

## Tổng kết

| Tác nhân | Use Case | Số TC | Ưu tiên cao | Ưu tiên trung bình | Ưu tiên thấp |
|---|---|---|---|---|---|
| Công ty du lịch | 5 | 15 | 8 | 6 | 1 |
| Du khách | 5 | 14 | 9 | 4 | 1 |
| Quản trị viên | 4 | 10 | 5 | 4 | 1 |
| **Tổng cộng** | **14** | **39** | **22** | **14** | **3** |
