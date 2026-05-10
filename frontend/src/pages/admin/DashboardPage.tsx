import AdminLayout from '@/components/admin/AdminLayout'
import { Users, Building2, Globe, DollarSign, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AdminService } from '@/services/admin.service'
import StatsCard from '@/components/ui/StatsCard'

const RECENT_ACTIVITY = [
  { action: 'Hoạt động 1', target: 'Hệ thống', time: 'Vừa xong' },
]

export default function AdminDashboardPage() {
  const { data: response } = useQuery({
    queryKey: ['admin-companies'],
    queryFn: () => AdminService.getCompanies(),
  })

  const companies = response?.companies || []

  const topCompanies = [...companies].slice(0, 5).map((company: any) => ({
    name: company.company_name,
    tours: 0,
    bookings: 0,
    revenue: '0đ'
  }))

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-on-surface">Dashboard</h1>
        <p className="text-on-surface-variant">Tổng quan hệ thống TourGo</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          label="Tổng doanh thu hệ thống"
          value="0đ"
          change="+0%"
          trend="up"
          icon={DollarSign}
          color="bg-primary/10"
          iconColor="text-primary"
        />
        <StatsCard
          label="Số công ty"
          value={companies.length.toString()}
          change="+0"
          trend="up"
          icon={Building2}
          color="bg-secondary/10"
          iconColor="text-secondary"
        />
        <StatsCard
          label="Tổng khách hàng"
          value="0"
          change="+0%"
          trend="up"
          icon={Users}
          color="bg-tertiary/10"
          iconColor="text-tertiary"
        />
        <StatsCard
          label="Tổng tour"
          value="0"
          change="+0"
          trend="up"
          icon={Globe}
          color="bg-secondary/10"
          iconColor="text-secondary"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Companies */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="p-6 border-b border-outline-variant">
            <h2 className="text-lg font-semibold text-on-surface">Top công ty</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-outline-variant last:border-0">
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
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant">
          <div className="p-6 border-b border-outline-variant flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-on-surface">Hoạt động gần đây</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {RECENT_ACTIVITY.map((activity, index) => (
                <div key={index} className="flex items-start gap-3 py-3 border-b border-outline-variant last:border-0">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-on-surface">
                      <span className="font-medium">{activity.action}</span>
                    </p>
                    <p className="text-sm text-primary font-medium">{activity.target}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
