import CompanyLayout from '@/components/company/CompanyLayout'
import { Search, Download, Eye, CheckCircle, XCircle } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CompanyService } from '@/services/company.service'
import { formatPrice, formatDate } from '@/lib/format'
import StatusBadge from '@/components/ui/StatusBadge'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import PageHeader from '@/components/ui/PageHeader'

interface Booking {
  id: number
  booking_status: string
  payment_status: string
  num_people: number
  total_price: number
  tour?: {
    name: string
  }
  user?: {
    full_name: string
    phone?: string
  }
  departure?: {
    start_date: string
  }
}

export default function CompanyBookingsPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['company-bookings'],
    queryFn: () => CompanyService.getCompanyBookings(),
  })

  const bookings: Booking[] = response?.bookings || []

  if (isLoading) return <CompanyLayout><LoadingState message="Đang tải danh sách đặt tour..." /></CompanyLayout>
  if (error) return <CompanyLayout><ErrorState message="Lỗi tải danh sách đặt tour." /></CompanyLayout>

  return (
    <CompanyLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <PageHeader
          title="Quản lý Đặt tour"
          description="Xem và quản lý các đơn đặt tour của công ty"
        />
        <button className="inline-flex items-center gap-2 bg-surface-container-lowest hover:bg-surface-container text-on-surface font-medium px-4 py-2 rounded-lg border border-outline-variant transition-colors">
          <Download className="w-4 h-4" />
          Xuất Excel
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm theo tên, SĐT, mã đặt tour..."
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <select aria-label="Lọc theo trạng thái" className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary">
            <option>Tất cả trạng thái</option>
            <option>Đã xác nhận</option>
            <option>Chờ xác nhận</option>
            <option>Đã hủy</option>
          </select>
          <select aria-label="Lọc theo thanh toán" className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary">
            <option>Tất cả thanh toán</option>
            <option>Đã thanh toán</option>
            <option>Chưa thanh toán</option>
            <option>Đã hoàn tiền</option>
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Mã đặt tour</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tour</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Khách hàng</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ngày khởi hành</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Số khách</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tổng tiền</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Thanh toán</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 font-mono text-sm font-medium text-primary">
                    #{booking.id}
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface">
                    {booking.tour?.name}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-on-surface">{booking.user?.full_name}</p>
                      <p className="text-sm text-on-surface-variant">{booking.user?.phone || 'N/A'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface">
                    {booking.departure ? formatDate(booking.departure.start_date) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-on-surface">
                    {booking.num_people}
                  </td>
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
                      <button aria-label="Xem chi tiết" className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface">
                        <Eye className="w-4 h-4" />
                      </button>
                      {booking.booking_status === 'pending' && (
                        <>
                          <button aria-label="Xác nhận đặt tour" className="p-2 hover:bg-primary/10 rounded-lg text-primary">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button aria-label="Hủy đặt tour" className="p-2 hover:bg-error-container rounded-lg text-error">
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
        </div>
      </div>
    </CompanyLayout>
  )
}

