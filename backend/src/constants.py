class TourStatus:
    DRAFT = "DRAFT"           # Đang soạn thảo, chưa mở bán
    PENDING = "PENDING"       # Chờ Admin duyệt (nếu cần)
    ACTIVE = "ACTIVE"         # Đang mở bán
    COMPLETED = "COMPLETED"   # Đã kết thúc
    CANCELLED = "CANCELLED"   # Đã hủy

class DepartureStatus:
    PLANNED = "PLANNED"       # Đang lên kế hoạch / Mở bán
    IN_PROGRESS = "IN_PROGRESS" # Đang diễn ra
    COMPLETED = "COMPLETED"   # Đã kết thúc
    CANCELLED = "CANCELLED"   # Đã hủy

class PaymentStatus:
    UNPAID = "UNPAID"         # Chưa thanh toán
    DEPOSIT_PAID = "DEPOSIT_PAID" # Đã thanh toán cọc
    FULLY_PAID = "FULLY_PAID" # Đã thanh toán toàn bộ
    REFUNDED = "REFUNDED"     # Đã hoàn tiền

class BookingStatus:
    PENDING = "PENDING"       # Chờ xác nhận / Chờ thanh toán
    CONFIRMED = "CONFIRMED"   # Đã xác nhận
    COMPLETED = "COMPLETED"   # Đã hoàn thành tour
    CANCELLED = "CANCELLED"   # Đã hủy

class UserRole:
    ADMIN = "ADMIN"
    COMPANY = "COMPANY"
    GUEST = "GUEST"