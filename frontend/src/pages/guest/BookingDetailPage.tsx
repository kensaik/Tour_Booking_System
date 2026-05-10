import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Users,
  CreditCard,
  ShieldCheck,
  Printer,
  Download,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { GuestService } from "@/services/guest.service";
import { formatPrice, formatDate } from "@/lib/format";
import StatusBadge from "@/components/ui/StatusBadge";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => GuestService.getBookingDetail(id as string),
    enabled: !!id,
  });

  if (isLoading) return <LoadingState message="Đang tải chi tiết đơn hàng..." />;
  if (error || !response?.booking) return <ErrorState message="Không tìm thấy đơn hàng này." />;

  const booking = response.booking;

  return (
    <div className="min-h-screen pt-20 pb-16 bg-surface-container-low">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <Link
            to="/my-trips"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg hover:bg-white transition-colors text-sm font-medium">
              <Printer className="w-4 h-4" />
              In vé
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-outline-variant rounded-lg hover:bg-white transition-colors text-sm font-medium">
              <Download className="w-4 h-4" />
              Tải hóa đơn
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-on-surface-variant">Mã đặt tour:</span>
                    <span className="font-bold text-primary">#{booking.id}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-on-surface">{booking.tour?.name}</h1>
                </div>
                <div className="text-right">
                  <div className="mb-2">
                    <StatusBadge status={booking.booking_status} type="booking" />
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    Đặt ngày: {formatDate(booking.created_at)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-6 border-t border-outline-variant">
                <div>
                  <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Ngày khởi hành
                  </p>
                  <p className="font-semibold">{formatDate(booking.departure?.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Số lượng khách
                  </p>
                  <p className="font-semibold">{booking.num_people} người</p>
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Điểm đến
                  </p>
                  <p className="font-semibold">{booking.tour?.destination || "N/A"}</p>
                </div>
              </div>
            </div>


            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-4">Thông tin liên hệ</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Họ và tên</span>
                  <span className="font-medium">{booking.contact_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Email</span>
                  <span className="font-medium">{booking.contact_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Số điện thoại</span>
                  <span className="font-medium">{booking.contact_phone}</span>
                </div>
                {booking.notes && (
                  <div className="pt-2">
                    <p className="text-xs text-on-surface-variant mb-1">Ghi chú:</p>
                    <p className="text-sm p-3 bg-surface-container-low rounded-lg italic">
                      "{booking.notes}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>


          <div className="lg:col-span-1 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-on-surface mb-4">Thanh toán</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tổng cộng</span>
                  <span className="font-bold text-lg">{formatPrice(booking.total_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-on-surface-variant">Trạng thái</span>
                  <StatusBadge status={booking.payment_status} type="payment" />
                </div>
              </div>

              {booking.payment_status === "pending" && (
                <button
                  onClick={() =>
                    navigate("/checkout", {
                      state: { bookingId: booking.id, totalAmount: booking.total_price },
                    })
                  }
                  className="w-full bg-primary hover:bg-primary-container text-white font-semibold py-3 rounded-lg transition-colors mb-4"
                >
                  Thanh toán ngay
                </button>
              )}

              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Giao dịch được bảo mật bởi TourGo</span>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> Hỗ trợ khách hàng
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">
                Nếu bạn có bất kỳ thắc mắc nào về đơn hàng này, vui lòng liên hệ với chúng tôi.
              </p>
              <Link to="/contact" className="text-sm font-bold text-primary hover:underline">
                Gửi hỗ trợ →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
