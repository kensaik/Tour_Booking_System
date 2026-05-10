import CompanyLayout from '@/components/company/CompanyLayout'
import { Link } from 'react-router-dom'
import { Plus, Search, Calendar, Users, Edit, Trash2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { CompanyService } from '@/services/company.service'
import { formatPrice, formatDate } from '@/lib/format'
import StatusBadge from '@/components/ui/StatusBadge'

export default function CompanyDeparturesPage() {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['company-departures'],
    queryFn: () => CompanyService.getCompanyDepartures(),
  })

  const departures = response?.departures || []

  if (isLoading) return <CompanyLayout><div className="text-center py-20">Đang tải danh sách lịch trình...</div></CompanyLayout>
  if (error) return <CompanyLayout><div className="text-center py-20 text-red-500">Lỗi tải danh sách lịch trình.</div></CompanyLayout>

  return (
    <CompanyLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quản lý Lịch khởi hành</h1>
          <p className="text-on-surface-variant">Quản lý các ngày khởi hành cho tour của bạn</p>
        </div>
        <Link
          to="/company/departures/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Lịch khởi hành
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tour..."
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="filter-date" className="sr-only">Ngày khởi hành</label>
            <input
              id="filter-date"
              type="date"
              className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="filter-dep-status" className="sr-only">Trạng thái</label>
            <select id="filter-dep-status" className="px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary">
              <option>Tất cả</option>
              <option>Đang hoạt động</option>
              <option>Đã đầy</option>
              <option>Nháp</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-container border-b border-outline-variant">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Tour</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Ngày khởi hành</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Chỗ</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Giá</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Trạng thái</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {departures.map((departure: any) => {
                const booked = departure.total_seats - departure.available_seats
                const departureStatus = departure.available_seats === 0 ? 'full' : 'active'
                const price = departure.tour?.price || 0

                return (
                  <tr key={departure.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4 font-medium text-on-surface">
                      {departure.tour?.name || `Tour #${departure.tour_id}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-on-surface">
                        <Calendar className="w-4 h-4 text-primary" />
                        {formatDate(departure.start_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-on-surface">
                          <Users className="w-4 h-4 text-on-surface-variant" />
                          <span>{booked}/{departure.total_seats}</span>
                        </div>
                        <div className="w-20 h-2 bg-surface-container rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              booked >= departure.total_seats ? 'bg-error' :
                              booked >= departure.total_seats * 0.8 ? 'bg-tertiary' :
                              'bg-primary'
                            }`}
                            style={{ width: `${Math.min(100, (booked / departure.total_seats) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-primary">
                      {formatPrice(price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={departureStatus} type="departure" showIcon={false} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface" aria-label="Chỉnh sửa lịch khởi hành">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-error-container rounded-lg text-on-surface-variant hover:text-error" aria-label="Xóa lịch khởi hành">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </CompanyLayout>
  )
}
