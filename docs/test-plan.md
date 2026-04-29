# Kế hoạch kiểm thử — Hệ thống Đặt Tour

---

## 1. Lịch sử chỉnh sửa tài liệu

| Ngày | Phiên bản | Mô tả | Tác giả |
|---|---:|---|---|
| 29/04/2025 | 1.0 | Bản nháp ban đầu | Trương Hưng Phát, QA/Tester |

---

## 2. Từ viết tắt

| Từ viết tắt | Meaning |
|---|---|
| QA | Quality Assurance |
| UC | Use Case |
| API | Application Programming Interface |
| UI | User Interface |
| DB | Database |
| REST | Representational State Transfer |
| JWT | JSON Web Token |
| CRUD | Create, Read, Update, Delete |
| PM | Project Manager |
| SRS | Software Requirements Specification |

---

## 3. Tổng quan dự án và mục tiêu

### Tổng quan dự án

**Hệ thống Đặt Tour** là một ứng dụng web đồ án tốt nghiệp, kết nối du khách với các công ty du lịch đã đăng ký thông qua một nền tảng tập trung. Hệ thống hỗ trợ ba nhóm tác nhân: **Du khách** (Tourist), **Công ty du lịch** (Tourism Company), và **Quản trị viên** (Admin).

- **Backend:** Python (Flask) — REST API
- **Frontend:** React — Ứng dụng một trang
- **Cơ sở dữ liệu:** MySQL

Hệ thống cho phép công ty du lịch đăng ký tài khoản ở trạng thái chờ quản trị viên phê duyệt, quản lý tour và lịch khởi hành, cũng như xem thống kê kinh doanh. Du khách có thể tìm kiếm, xem chi tiết và đặt tour bằng cách thanh toán tiền cọc. Quản trị viên giám sát việc phê duyệt công ty, nội dung tour và danh mục điểm đến.

Nếu có thay đổi lớn về phạm vi, yêu cầu hoặc lịch kiểm thử, kế hoạch này phải được xem xét và phê duyệt lại.

### Mục tiêu

Kế hoạch kiểm thử này xác định:

- Phạm vi kiểm thử cho cả ba luồng tác nhân
- Phương pháp kiểm thử, công cụ và loại kiểm thử
- Tài nguyên và môi trường cần thiết
- Tiêu chí bắt đầu và kết thúc kiểm thử
- Vai trò, trách nhiệm và tiến độ
- Rủi ro và phương án dự phòng
- Quy trình phê duyệt

---

## 4. Phạm vi kiểm thử

### 4.1 Chức năng được kiểm thử

#### Tác nhân Công ty du lịch

| ID | Use Case | Loại kiểm thử |
|---|---|---|
| TC-UC-01 | Đăng ký với trạng thái chờ phê duyệt | Chức năng, Kiểm tra hợp lệ, Cơ sở dữ liệu |
| TC-UC-02 | Đăng nhập và nhận JWT token | Chức năng, Bảo mật |
| TC-UC-03 | Tạo / chỉnh sửa / xóa tour và lịch trình hằng ngày | Chức năng, Cơ sở dữ liệu, Giao diện |
| TC-UC-04 | Lên lịch khởi hành (ngày + số chỗ) | Chức năng, Cơ sở dữ liệu, Kiểm tra hợp lệ |
| TC-UC-05 | Xem bảng thống kê kinh doanh | Chức năng, Giao diện |

#### Tác nhân Du khách

| ID | Use Case | Loại kiểm thử |
|---|---|---|
| T-UC-01 | Đăng ký tài khoản du khách | Chức năng, Kiểm tra hợp lệ, Cơ sở dữ liệu |
| T-UC-02 | Đăng nhập và nhận JWT token | Chức năng, Bảo mật |
| T-UC-03 | Tìm kiếm tour theo điểm đến và ngày khởi hành | Chức năng, Giao diện |
| T-UC-04 | Xem chi tiết tour (lịch trình, giá, chính sách) | Chức năng, Giao diện |
| T-UC-05 | Đặt tour và thanh toán tiền cọc — tạo booking, cập nhật số chỗ, gửi thông báo | Chức năng, Cơ sở dữ liệu, Tích hợp |

#### Tác nhân Quản trị viên

| ID | Use Case | Loại kiểm thử |
|---|---|---|
| A-UC-01 | Phê duyệt hoặc từ chối đăng ký công ty du lịch | Chức năng, Cơ sở dữ liệu |
| A-UC-02 | Quản lý các công ty du lịch đã được phê duyệt (chỉnh sửa, vô hiệu hóa) | Chức năng, Cơ sở dữ liệu |
| A-UC-03 | Quản lý danh sách danh mục điểm đến (CRUD) | Chức năng, Cơ sở dữ liệu |
| A-UC-04 | Quản lý các tour được đăng trên nền tảng | Chức năng, Cơ sở dữ liệu, Giao diện |

---

### 4.2 Chức năng không được kiểm thử

| Phạm vi loại trừ | Lý do |
|---|---|
| Cổng thanh toán trực tuyến đầy đủ (VNPay, Stripe, v.v.) | Không nằm trong phạm vi dự án — luồng đặt cọc được mô phỏng |
| Hạ tầng gửi Email / SMS | Việc kích hoạt thông báo nằm trong phạm vi; hạ tầng gửi thông báo không nằm trong phạm vi |
| Ứng dụng di động native (iOS / Android) | Dự án chỉ hướng đến nền tảng web |
| Kiểm thử hiệu năng / tải | Ngoài phạm vi sprint đồ án |
| Kiểm thử xâm nhập bảo mật | Không nằm trong phạm vi — chỉ kiểm tra bảo mật xác thực cơ bản |

---

## 5. Phương pháp kiểm thử

### 5.1 Quản lý ca kiểm thử

| Hạng mục | Mô tả |
|---|---|
| Nơi lưu trữ test case | File Markdown `docs/test-case.md` + Google Sheets dùng chung với nhóm |
| Chuẩn bị test case | QA viết test case dựa trên đặc tả use case |
| Review test case | PM hoặc Backend Developer review trước khi thực thi |
| Theo dõi lỗi | GitHub Issues — nhãn `bug`, `severity: critical / high / medium / low` |
| Theo dõi thực thi kiểm thử | Checkbox trong `docs/test-case.md`, cập nhật trạng thái theo từng sprint |

---

### 5.2 Các loại kiểm thử

#### Kiểm thử đơn vị

Kiểm thử đơn vị backend được viết bằng **pytest**. Mỗi route Flask và hàm service được kiểm thử độc lập. CI chạy `pytest` mỗi khi có push thông qua GitHub Actions.

#### Kiểm thử khói

Được thực hiện sau mỗi lần build mới được triển khai lên môi trường QA/local. Mục tiêu là xác nhận rằng đăng nhập, danh sách tour và các điểm vào luồng đặt tour có thể truy cập trước khi chạy kiểm thử sâu hơn.

#### Kiểm thử chức năng

Thực thi kiểm thử thủ công cho từng use case trong mục 4.1. QA xác minh hành vi mong đợi, thông báo lỗi và các trường hợp biên theo đặc tả use case.

#### Kiểm thử hồi quy

Chạy toàn bộ bộ kiểm thử chức năng sau mỗi lần sửa lỗi hoặc merge tính năng mới. Ưu tiên các luồng UC dùng chung pipeline xác thực và đặt tour.

#### Kiểm thử cơ sở dữ liệu

Xác minh dữ liệu được thêm, cập nhật và xóa chính xác cho:

- Đăng ký người dùng (du khách và công ty)
- Bản ghi tour và lịch trình
- Bản ghi lịch khởi hành
- Bản ghi đặt tour (trạng thái, cập nhật số chỗ)

#### Kiểm thử giao diện

Kiểm tra thủ công giao diện React:

- Bố cục, căn chỉnh, nhãn và trạng thái nút
- Phản hồi kiểm tra hợp lệ của form (lỗi hiển thị trực tiếp)
- Bố cục responsive trên desktop và mobile viewport

#### Kiểm thử tương thích

Kiểm thử chức năng và hiển thị trên các trình duyệt được hỗ trợ ở phiên bản mới nhất.

---

### 5.3 Tương thích trình duyệt, hệ điều hành và thiết bị

| Loại nền tảng | Mục tiêu hỗ trợ |
|---|---|
| Trình duyệt | Phiên bản mới nhất của Google Chrome, Mozilla Firefox, Microsoft Edge |
| Hệ điều hành | Windows 10/11, macOS |
| Thiết bị | Desktop (1280px+), Tablet (768px), Mobile (375px) |

---

### 5.4 Phương pháp tự động hóa

Sau khi kiểm thử thủ công xác nhận hệ thống ổn định, các luồng happy path sau sẽ được tự động hóa bằng **pytest + Selenium**:

#### Happy path — Du khách

1. Đăng ký tài khoản du khách
2. Đăng nhập
3. Tìm kiếm tour theo điểm đến
4. Mở trang chi tiết tour
5. Gửi yêu cầu đặt tour kèm tiền cọc
6. Xác minh xác nhận đặt tour

#### Happy path — Công ty du lịch

1. Đăng ký công ty ở trạng thái chờ duyệt
2. Admin phê duyệt công ty
3. Công ty đăng nhập
4. Tạo tour kèm lịch trình
5. Lên lịch khởi hành

Các test tự động sẽ được thêm vào pipeline CI của GitHub Actions sau khi tỉ lệ pass của kiểm thử thủ công đạt 100% trên các luồng quan trọng.

---

## 6. Tiêu chí bắt đầu và kết thúc

### 6.1 Tiêu chí bắt đầu

Kiểm thử có thể bắt đầu khi tất cả điều kiện sau được đáp ứng:

- Backend API đã được triển khai và có thể truy cập trên môi trường local / QA
- Ứng dụng React frontend đang chạy và đã kết nối với backend
- Cơ sở dữ liệu MySQL đã được seed dữ liệu kiểm thử cần thiết
- Tất cả đặc tả use case trong kế hoạch kiểm thử này đã được review
- GitHub Issues đã được thiết lập để theo dõi lỗi
- Môi trường QA được Backend Developer xác nhận ổn định

### 6.2 Tiêu chí kết thúc

Kiểm thử được xem là hoàn tất khi:

- 100% test case trong phạm vi đã được thực thi
- Không còn lỗi Critical hoặc High severity đang mở
- Tất cả lỗi phát hiện đã được ghi nhận trên GitHub Issues kèm bước tái hiện
- Ảnh chụp màn hình được đính kèm cho các báo cáo lỗi liên quan đến UI
- Bộ kiểm thử hồi quy được hoàn thành sau lần sửa lỗi cuối cùng
- Báo cáo tổng kết kiểm thử được chia sẻ với nhóm và PM phê duyệt mức độ sẵn sàng phát hành

---

## 7. Tiêu chí tạm dừng và tiếp tục

### 7.1 Tiêu chí tạm dừng

Kiểm thử sẽ dừng nếu xảy ra một trong các trường hợp sau:

- Môi trường local / QA bị crash hoặc không thể truy cập
- API đăng nhập không trả về token hợp lệ — chặn tất cả luồng cần xác thực
- Kết nối cơ sở dữ liệu thất bại
- Một lỗi Critical chặn nhiều hơn một luồng UC chính
- Dữ liệu kiểm thử cần thiết không có sẵn hoặc bị hỏng

### 7.2 Tiêu chí tiếp tục

Kiểm thử tiếp tục khi:

- Backend Developer xác nhận môi trường đã được khôi phục
- Hotfix cho lỗi chặn đã được triển khai và smoke test pass
- Cơ sở dữ liệu đã được khôi phục với dữ liệu kiểm thử hợp lệ
- PM xác nhận nhóm có thể tiếp tục

---

## 8. Vai trò, trách nhiệm và tiến độ

### 8.1 Vai trò và trách nhiệm

| Vai trò | Tên | Trách nhiệm kiểm thử |
|---|---|---|
| QA / Tester | Trương Hưng Phát | Viết test case, thực thi kiểm thử thủ công, ghi nhận lỗi, kiểm thử lại bản sửa, tạo báo cáo tổng kết kiểm thử |
| Project Manager | Lê Duy Mạnh | Review và phê duyệt test plan, điều phối tiến độ, chấp nhận hoặc từ chối mức độ sẵn sàng phát hành |
| Frontend Developer | Nguyễn Trần Minh Quân | Sửa lỗi UI, hỗ trợ QA thiết lập môi trường frontend |
| Backend Developer | Tô Nguyễn Sơn Nam | Sửa lỗi API và DB, duy trì môi trường QA, cung cấp dữ liệu kiểm thử |

### 8.2 Tiến độ

| Hoạt động | Bắt đầu | Kết thúc | Người phụ trách | Ghi chú |
|---|---|---|---|---|
| Lập kế hoạch kiểm thử | Tuần 6 | Tuần 6 | QA | Soạn thảo, review và phê duyệt kế hoạch kiểm thử này |
| Chuẩn bị test case | Tuần 7 | Tuần 7 | QA | Viết test case theo từng use case |
| Thiết lập môi trường | Tuần 7 | Tuần 7 | Backend Dev | Triển khai API + DB + seed data |
| Smoke testing | Tuần 8 | Tuần 8 | QA | Xác minh độ ổn định của build |
| Thực thi kiểm thử chức năng | Tuần 8 | Tuần 9 | QA | Thực thi toàn bộ test case thủ công |
| Kiểm thử lại lỗi đã sửa | Tuần 9 | Tuần 10 | QA | Xác minh tất cả lỗi đã được sửa |
| Kiểm thử hồi quy | Tuần 10 | Tuần 10 | QA | Chạy hồi quy cuối cùng |
| Tổng kết kiểm thử + ký duyệt | Tuần 10 | Tuần 10 | QA + PM | Phê duyệt cuối cùng |

---

## 9. Phụ thuộc, rủi ro và phương án dự phòng

### 9.1 Phụ thuộc

- Backend API phải được triển khai trước khi QA có thể bắt đầu kiểm thử chức năng
- Backend Developer phải cung cấp script seed dữ liệu
- Frontend phải được tích hợp với backend trước khi kiểm thử UI bắt đầu
- Luồng phê duyệt của Admin phải hoạt động trước khi có thể kiểm thử đầy đủ các luồng Công ty du lịch
- GitHub Issues phải được thiết lập trước khi bắt đầu thực thi kiểm thử

### 9.2 Rủi ro và phương án dự phòng

| Rủi ro | Ảnh hưởng | Phương án dự phòng |
|---|---|---|
| Backend API bàn giao trễ | Cao — chặn việc bắt đầu kiểm thử chức năng | QA sẽ chuẩn bị toàn bộ test case và dữ liệu kiểm thử trong thời gian chờ; việc thực thi bắt đầu ngay khi API sẵn sàng |
| Môi trường local / QA không ổn định | Cao — kiểm thử bị chặn | QA và Backend Dev phối hợp khôi phục; QA ghi nhận các test case bị ảnh hưởng là blocked |
| Luồng phê duyệt Admin chưa sẵn sàng | Cao — không thể kiểm thử UC của công ty và admin | QA kiểm thử luồng du khách trước; các luồng công ty/admin được hoãn đến khi UC phê duyệt ổn định |
| Thay đổi phạm vi trong quá trình kiểm thử | Trung bình — test case có thể cần chỉnh sửa | QA cập nhật các test case bị ảnh hưởng; PM phê duyệt phạm vi đã chỉnh sửa trước khi tiếp tục |
| Thành viên chủ chốt không có mặt | Trung bình — tốc độ thực thi giảm | PM phân công lại các test case quan trọng cho thành viên khả dụng khác hoặc điều chỉnh tiến độ |

---

## 10. Phê duyệt

| Vai trò | Tên | Trạng thái | Ngày |
|---|---|---|---|
| QA / Tester | Trương Hưng Phát | Chờ phê duyệt | — |
| Project Manager | Lê Duy Mạnh | Chờ phê duyệt | — |
| Backend Developer | Tô Nguyễn Sơn Nam | Chờ phê duyệt | — |
