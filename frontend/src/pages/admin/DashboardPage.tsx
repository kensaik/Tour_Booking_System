import AdminLayout from "@/components/admin/AdminLayout";
import { Users, Building2, Globe, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminService } from "@/services/admin.service";
import StatsCard from "@/components/ui/StatsCard";
import { formatPrice } from "@/lib/format";

export default function AdminDashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => AdminService.getStats(),
  });

  const { data: companiesResponse } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => AdminService.getCompanies(),
  });

  const companies = companiesResponse?.companies || [];

  const topCompanies = [...companies]
    .sort((a, b) => (b.total_revenue || 0) - (a.total_revenue || 0))
    .slice(0, 5)
    .map((company) => ({
      name: company.company_name,
      tours: company.tours_count || 0,
      bookings: company.bookings_count || 0,
      revenue: formatPrice(company.total_revenue || 0),
    }));

  const statCards = [
    {
      label: "Tổng doanh thu",
      value: stats?.total_revenue ? formatPrice(stats.total_revenue) : "0đ",
      icon: DollarSign,
      color: "bg-green-500/10",
      iconColor: "text-green-500",
    },
    {
      label: "Số công ty",
      value: (stats?.total_companies || 0).toString(),
      change: `${stats?.approved_companies || 0} đã duyệt`,
      icon: Building2,
      color: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "Tổng khách hàng",
      value: (stats?.total_guests || 0).toString(),
      icon: Users,
      color: "bg-secondary/10",
      iconColor: "text-secondary",
    },
    {
      label: "Tổng tour",
      value: (stats?.total_tours || 0).toString(),
      icon: Globe,
      color: "bg-tertiary/10",
      iconColor: "text-tertiary",
    },
  ];

  const subStats = [
    {
      label: "Công ty mới",
      value: (stats?.total_companies - stats?.approved_companies || 0).toString(),
      icon: Building2,
      highlight: (stats?.total_companies - stats?.approved_companies || 0) > 0,
    },
    {
      label: "Tổng tour hoạt động",
      value: (stats?.total_tours || 0).toString(),
      icon: Globe,
    },
    {
      label: "Công ty đã duyệt",
      value: `${stats?.approved_companies || 0}/${stats?.total_companies || 0}`,
      icon: TrendingUp,
    },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant">Tổng quan hệ thống TourGo</p>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <StatsCard
            key={index}
            label={stat.label}
            value={stat.value}
            change={stat.change}
            trend="up"
            icon={stat.icon}
            color={stat.color}
            iconColor={stat.iconColor}
          />
        ))}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {subStats.map((stat, index) => (
          <div
            key={index}
            className={`p-4 rounded-xl border ${
              stat.highlight
                ? "bg-amber-50 border-amber-200"
                : "bg-surface-container-lowest border-outline-variant"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.highlight
                    ? "bg-amber-100 text-amber-600"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-on-surface">{stat.value}</p>
                <p
                  className={`text-sm ${stat.highlight ? "text-amber-600" : "text-on-surface-variant"}`}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Top công ty</h2>
          </div>
          <div className="p-6">
            {topCompanies.length > 0 ? (
              <div className="space-y-4">
                {topCompanies.map((company, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-on-surface">{company.name}</p>
                        <p className="text-sm text-on-surface-variant">{company.tours} tours</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">{company.revenue}</p>
                      <p className="text-sm text-on-surface-variant">{company.bookings} đơn</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-on-surface-variant py-8">Chưa có công ty nào</p>
            )}
          </div>
        </div>


        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Thao tác nhanh</h2>
          </div>
          <div className="p-6 space-y-3">
            <a
              href="/admin/destinations"
              className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface">Quản lý điểm đến</p>
                <p className="text-sm text-on-surface-variant">Thêm, sửa, xóa điểm đến</p>
              </div>
            </a>
            <a
              href="/admin/companies"
              className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                <Building2 className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface">Duyệt công ty</p>
                <p className="text-sm text-on-surface-variant">
                  {stats?.total_companies - stats?.approved_companies || 0} công ty chờ duyệt
                </p>
              </div>
            </a>
            <a
              href="/admin/companies"
              className="flex items-center gap-4 p-4 rounded-xl border border-outline-variant hover:bg-surface-container transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center group-hover:bg-tertiary/20 transition-colors">
                <Users className="w-5 h-5 text-tertiary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-on-surface">Quản lý khách hàng</p>
                <p className="text-sm text-on-surface-variant">Xem danh sách người dùng hệ thống</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
