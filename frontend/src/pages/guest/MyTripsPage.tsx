import { Link, useNavigate } from 'react-router-dom'
import { Calendar, Users, Eye } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { GuestService } from '@/services/guest.service'
import { formatPrice, formatDate } from '@/lib/format'
import StatusBadge from '@/components/ui/StatusBadge'
import { useAuthStore } from '@/stores/authStore'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'

interface Booking {
  id: number
  booking_status: string
  payment_status: string
  num_people: number
  total_price: number
  tour?: {
    name: string
    image_url?: string
  }
  departure?: {
    start_date: string
  }
}

export default function MyTripsPage() {
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => GuestService.getMyBookings(),
    enabled: isAuthenticated,
  })

  const bookings: Booking[] = response?.bookings || []

  const activeTrips = bookings.filter((booking) =>
    booking.booking_status !== 'completed' && booking.booking_status !== 'cancelled'
  )
  const pastTrips = bookings.filter((booking) =>
    booking.booking_status === 'completed' || booking.booking_status === 'cancelled'
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-16">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <EmptyState
            title="Vui lòng đăng nhập"
            description="Bạn cần đăng nhập để xem chuyến đi của mình."
            actionLabel="Đăng nhập ngay"
            onAction={() => navigate('/login')}
          />
        </div>
      </div>
    )
  }

  if (isLoading) return <LoadingState message="Đang tải danh sách chuyến đi..." />
  if (error) return <ErrorState message="Lỗi khi tải danh sách chuyến đi." />

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h1 className="text-3xl font-bold text-on-surface mb-8">Chuyến đi của tôi</h1>

        {/* Active Trips */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-on-surface mb-4">Chuyến đi sắp tới</h2>
          {activeTrips.length > 0 ? (
            <div className="space-y-4">
              {activeTrips.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden tour-card-shadow"
                >
                  <div className="flex flex-col md:flex-row">
                    <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0 bg-slate-200">
                      <img
                        src={booking.tour?.image_url || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'}
                        alt={booking.tour?.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={booking.booking_status} type="booking" showIcon={false} />
                      </div>
                    </div>
                    <div className="p-5 flex-1">
                      <div className="flex flex-wrap justify-between gap-4 mb-4">
                        <div>
                          <p className="text-xs text-on-surface-variant mb-1">Mã đặt tour</p>
                          <p className="font-bold text-primary">#{booking.id}</p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant mb-1">Ngày khởi hành</p>
                          <p className="font-medium flex items-center gap-1">
                            <Calendar className="w-4 h-4 text-secondary" />
                            {booking.departure ? formatDate(booking.departure.start_date) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant mb-1">Số khách</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="w-4 h-4 text-secondary" />
                            {booking.num_people} người
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-on-surface-variant mb-1">Tổng thanh toán</p>
                          <p className="text-xl font-bold text-primary">{formatPrice(booking.total_price)}</p>
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-on-surface mb-2">{booking.tour?.name}</h3>
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-container transition-colors text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          Chi tiết
                        </button>
                        {booking.payment_status === 'pending' && (
                          <Link
                            to="/checkout"
                            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/10 transition-colors text-sm font-medium"
                          >
                            Thanh toán ngay
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Bạn chưa có chuyến đi nào sắp tới"
              description="Hãy khám phá các tour hấp dẫn và bắt đầu hành trình của bạn ngay."
              actionLabel="Khám phá tour ngay"
              onAction={() => navigate('/tours')}
            />
          )}
        </section>

        {/* Past Trips */}
        <section>
          <h2 className="text-xl font-semibold text-on-surface mb-4">Chuyến đi đã hoàn thành</h2>
          {pastTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pastTrips.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-surface-container-lowest rounded-xl overflow-hidden tour-card-shadow opacity-75"
                >
                  <div className="relative h-40 bg-slate-200">
                    <img
                      src={booking.tour?.image_url || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'}
                      alt={booking.tour?.name}
                      className="w-full h-full object-cover grayscale"
                    />
                    <div className="absolute top-3 left-3">
                      <StatusBadge status={booking.booking_status} type="booking" showIcon={false} />
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-on-surface-variant mb-1">#{booking.id}</p>
                    <h3 className="font-medium text-on-surface line-clamp-1 mb-2">{booking.tour?.name}</h3>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">
                        {booking.departure ? formatDate(booking.departure.start_date) : 'N/A'}
                      </span>
                      <span className="font-medium">{formatPrice(booking.total_price)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant">Chưa có chuyến đi nào trong lịch sử.</p>
          )}
        </section>
      </div>
    </div>
  )
}

