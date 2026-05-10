import CompanyLayout from "@/components/company/CompanyLayout";
import { Users, Globe, DollarSign, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { CompanyService } from "@/services/company.service";
import { formatPrice, formatDate } from "@/lib/format";
import StatsCard from "@/components/ui/StatsCard";
import StatusBadge from "@/components/ui/StatusBadge";
import { useAuthStore } from "@/stores/authStore";

export default function CompanyDashboardPage() {
  const { user } = useAuthStore();
  const isApproved = user?.company_profile?.is_approved;

  const { data: bookingsData } = useQuery({
    queryKey: ["company-bookings"],
    queryFn: () => CompanyService.getCompanyBookings(),
    enabled: !!user && !!isApproved,
  });

  const { data: toursData } = useQuery({
    queryKey: ["company-tours"],
    queryFn: () => CompanyService.getMyTours(),
    enabled: !!user && !!isApproved,
  });

  const { data: departuresData } = useQuery({
    queryKey: ["company-departures"],
    queryFn: () => CompanyService.getCompanyDepartures(),
    enabled: !!user && !!isApproved,
  });

  const bookings = bookingsData?.bookings || [];
  const tours = toursData?.tours || [];
  const departures = departuresData?.departures || [];

  const totalRevenue = bookings
    .filter((booking: any) => {
      const pStatus = booking.payment_status?.toLowerCase();
      const bStatus = booking.booking_status?.toLowerCase();
      return (pStatus === "fully_paid" || pStatus === "deposit_paid") && bStatus === "confirmed";
    })
    .reduce((sum: number, booking: any) => sum + booking.total_price, 0);
  const totalBookings = bookings.length;
  const totalCustomers = new Set(bookings.map((booking: any) => booking.user_id)).size;
  const activeTours = tours.filter(
    (tour: any) => tour.status === "active" || tour.status === "approved",
  ).length;

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
    .slice(0, 5);
  const upcomingDepartures = [...departures]
    .filter((departure: any) => new Date(departure.start_date) > new Date())
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 5);

  return (
    <CompanyLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant">Xem tổng quan hoạt động kinh doanh của bạn</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Tổng doanh thu"
          value={formatPrice(totalRevenue)}
          icon={DollarSign}
          color="bg-primary/10"
          iconColor="text-primary"
        />
        <StatsCard
          label="Đơn đặt tour"
          value={totalBookings.toString()}
          icon={BookOpen}
          color="bg-secondary/10"
          iconColor="text-secondary"
        />
        <StatsCard
          label="Khách hàng"
          value={totalCustomers.toString()}
          icon={Users}
          color="bg-tertiary/10"
          iconColor="text-tertiary"
        />
        <StatsCard
          label="Tour hoạt động"
          value={activeTours.toString()}
          icon={Globe}
          color="bg-secondary/10"
          iconColor="text-secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Đơn đặt tour gần đây</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-on-surface-variant">Chưa có đơn đặt tour nào.</p>
              ) : (
                recentBookings.map((booking: any) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0"
                  >
                    <div>
                      <p className="font-medium text-on-surface">
                        {booking.tour?.name || `Tour #${booking.tour_id}`}
                      </p>
                      <p className="text-sm text-on-surface-variant">{booking.guest_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-on-surface">
                        {formatPrice(booking.total_price)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={booking.booking_status} type="booking" />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Upcoming Departures */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Lịch khởi hành sắp tới</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingDepartures.length === 0 ? (
                <p className="text-on-surface-variant">Chưa có lịch khởi hành sắp tới.</p>
              ) : (
                upcomingDepartures.map((departure: any) => {
                  const booked = departure.total_seats - departure.available_seats;
                  return (
                    <div
                      key={departure.id}
                      className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0"
                    >
                      <div>
                        <p className="font-medium text-on-surface">
                          {departure.tour?.name || `Tour #${departure.tour_id}`}
                        </p>
                        <p className="text-sm text-on-surface-variant">
                          {formatDate(departure.start_date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-1 justify-end">
                          <span className="text-sm font-medium text-on-surface">
                            {booked}/{departure.total_seats}
                          </span>
                          <span className="text-xs text-on-surface-variant">chỗ</span>
                        </div>
                        <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden ml-auto">
                          <div
                            className={`h-full rounded-full ${booked >= departure.total_seats * 0.8 ? "bg-secondary" : "bg-primary"}`}
                            style={{ width: `${(booked / departure.total_seats) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
}
