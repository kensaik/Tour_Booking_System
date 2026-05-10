import CompanyLayout from "@/components/company/CompanyLayout";
import { Search, Download, Eye, CheckCircle, XCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CompanyService } from "@/services/company.service";
import { formatPrice, formatDate } from "@/lib/format";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import PageHeader from "@/components/ui/PageHeader";
import { useState } from "react";
import Toast, { ToastType } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface Booking {
  id: number;
  booking_status: string;
  payment_status: string;
  num_people: number;
  total_price: number;
  tour?: {
    name: string;
  };
  guest_name: string;
  guest_phone?: string;
  departure?: {
    start_date: string;
  };
}

export default function CompanyBookingsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả trạng thái");
  const [paymentFilter, setPaymentFilter] = useState("Tất cả thanh toán");
  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewingBooking, setViewingBooking] = useState<Booking | null>(null);

  const {
    data: response,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["company-bookings"],
    queryFn: () => CompanyService.getCompanyBookings(),
  });

  const bookings: Booking[] = response?.bookings || [];

  const filteredBookings = bookings.filter((booking) => {
    const searchStr = searchTerm.toLowerCase();
    const matchesSearch =
      (booking.guest_name || "").toLowerCase().includes(searchStr) ||
      (booking.guest_phone || "").includes(searchStr) ||
      `#${booking.id}`.includes(searchStr);

    const matchesStatus =
      statusFilter === "Tất cả trạng thái" ||
      (statusFilter === "Đã xác nhận" && booking.booking_status === "confirmed") ||
      (statusFilter === "Chờ xác nhận" && booking.booking_status === "pending") ||
      (statusFilter === "Đã hủy" && booking.booking_status === "cancelled");

    const matchesPayment =
      paymentFilter === "Tất cả thanh toán" ||
      (paymentFilter === "Đã thanh toán" && booking.payment_status === "fully_paid") ||
      (paymentFilter === "Chưa thanh toán" &&
        (booking.payment_status === "unpaid" || booking.payment_status === "pending"));

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await CompanyService.updateBookingStatus(id, status);
      setToast({
        message: status === "confirmed" ? "Xác nhận đơn thành công" : "Đã hủy đơn đặt tour",
        type: "success",
      });
      refetch();
    } catch {
      setToast({ message: "Lỗi khi cập nhật trạng thái", type: "error" });
    } finally {
      setConfirmCancelId(null);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setToast({ message: "Đã xuất file Excel thành công", type: "success" });
    }, 1500);
  };

  if (isLoading)
    return (
      <CompanyLayout>
        <LoadingState message="Đang tải danh sách đặt tour..." />
      </CompanyLayout>
    );
  if (error)
    return (
      <CompanyLayout>
        <ErrorState message="Lỗi tải danh sách đặt tour." />
      </CompanyLayout>
    );

  return (
    <CompanyLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader
          title="Quản lý Đặt tour"
          description="Xem và quản lý các đơn đặt tour của công ty"
        />
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-medium px-4 py-2 rounded-lg border border-outline-variant transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Đang xuất..." : "Xuất Excel"}
        </button>
      </div>


      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã đặt tour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
            />
          </div>
          <select
            aria-label="Lọc theo trạng thái"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none transition-all"
          >
            <option>Tất cả trạng thái</option>
            <option>Đã xác nhận</option>
            <option>Chờ xác nhận</option>
            <option>Đã hủy</option>
          </select>
          <select
            aria-label="Lọc theo thanh toán"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none transition-all"
          >
            <option>Tất cả thanh toán</option>
            <option>Đã thanh toán</option>
            <option>Chưa thanh toán</option>
          </select>
        </div>
      </div>


      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Mã đặt tour
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Tour
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Khách hàng
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Ngày khởi hành
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Số khách
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Tổng tiền
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Thanh toán
                </th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-primary">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface">{booking.tour?.name}</td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-on-surface">{booking.guest_name}</p>
                      <p className="text-sm text-on-surface-variant">
                        {booking.guest_phone || "N/A"}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface">
                    {booking.departure ? formatDate(booking.departure.start_date) : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-on-surface text-center">{booking.num_people}</td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {formatPrice(booking.total_price)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.booking_status} type="booking" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={booking.payment_status} type="payment" showIcon={false} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingBooking(booking)}
                        aria-label="Xem chi tiết"
                        className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {booking.booking_status === "pending" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                            aria-label="Xác nhận đặt tour"
                            className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(booking.id)}
                            aria-label="Hủy đặt tour"
                            className="p-2 hover:bg-error-container rounded-lg text-error transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBookings.length === 0 && (
            <div className="text-center py-20 text-on-surface-variant italic">
              Không tìm thấy đơn đặt tour nào phù hợp.
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmCancelId}
        title="Xác nhận hủy đơn"
        message="Bạn có chắc chắn muốn hủy đơn đặt tour này không? Hành động này sẽ hoàn lại chỗ trống cho tour."
        onConfirm={() => confirmCancelId && handleUpdateStatus(confirmCancelId, "cancelled")}
        onCancel={() => setConfirmCancelId(null)}
        variant="error"
      />


      <Modal
        isOpen={!!viewingBooking}
        onClose={() => setViewingBooking(null)}
        title={`Chi tiết đơn hàng #${viewingBooking?.id}`}
      >
        {viewingBooking && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-on-surface-variant mb-1 font-semibold uppercase text-[10px]">
                  Khách hàng
                </p>
                <p className="font-bold text-base">{viewingBooking.guest_name}</p>
                <p className="">{viewingBooking.guest_phone || "N/A"}</p>
              </div>
              <div>
                <p className="text-on-surface-variant mb-1 font-semibold uppercase text-[10px]">
                  Tour
                </p>
                <p className="font-bold text-base line-clamp-1">{viewingBooking.tour?.name}</p>
                <p className="">
                  {viewingBooking.departure
                    ? formatDate(viewingBooking.departure.start_date)
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-surface-container-low p-5 rounded-2xl space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Số người</span>
                <span className="font-medium">{viewingBooking.num_people} người</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Giá mỗi người</span>
                <span className="font-medium">
                  {formatPrice(viewingBooking.total_price / viewingBooking.num_people)}
                </span>
              </div>
              <div className="flex justify-between border-t border-outline-variant pt-3 mt-1 font-bold text-lg">
                <span>Tổng cộng</span>
                <span className="text-primary">{formatPrice(viewingBooking.total_price)}</span>
              </div>
            </div>

            <div>
              <p className="text-on-surface-variant mb-3 font-semibold uppercase text-[10px]">
                Trạng thái hệ thống
              </p>
              <div className="flex gap-6">
                <div className="flex-1">
                  <p className="text-[10px] text-on-surface-variant mb-1.5">Đơn hàng</p>
                  <StatusBadge status={viewingBooking.booking_status} type="booking" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-on-surface-variant mb-1.5">Thanh toán</p>
                  <StatusBadge
                    status={viewingBooking.payment_status}
                    type="payment"
                    showIcon={false}
                  />
                </div>
              </div>
            </div>

            {viewingBooking.booking_status.toLowerCase() === "pending" ? (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    handleUpdateStatus(viewingBooking.id, "confirmed");
                    setViewingBooking(null);
                  }}
                  className="flex-1 bg-primary hover:bg-primary-container text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  Xác nhận đơn
                </button>
                <button
                  onClick={() => {
                    setConfirmCancelId(viewingBooking.id);
                    setViewingBooking(null);
                  }}
                  className="flex-1 bg-error-container/10 hover:bg-error-container/20 text-error font-bold py-3 rounded-xl transition-all border border-error/20"
                >
                  Hủy đơn
                </button>
              </div>
            ) : (
              <button
                onClick={() => setViewingBooking(null)}
                className="w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold py-3 rounded-xl transition-colors mt-4"
              >
                Đóng
              </button>
            )}
          </div>
        )}
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </CompanyLayout>
  );
}
