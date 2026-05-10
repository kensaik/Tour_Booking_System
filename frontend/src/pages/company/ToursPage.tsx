import { useState } from 'react'
import CompanyLayout from '@/components/company/CompanyLayout'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, MapPin, Edit, Trash2, Eye } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CompanyService } from '@/services/company.service'
import { formatPrice } from '@/lib/format'
import StatusBadge from '@/components/ui/StatusBadge'
import EmptyState from '@/components/ui/EmptyState'

export default function CompanyToursPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['company-tours'],
    queryFn: () => CompanyService.getMyTours(),
  })

  const tours = response?.tours || []

  const filteredTours = tours.filter((tour: any) => {
    const matchesSearch = tour.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tour.destination.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && tour.status !== 'draft') ||
                         (statusFilter === 'draft' && tour.status === 'draft')
    return matchesSearch && matchesStatus
  })

  const queryClient = useQueryClient()
  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => CompanyService.deleteTour(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-tours'] })
      alert('Xóa tour thành công!')
    }
  })

  const handleDelete = (id: string | number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tour này không?')) {
      deleteMutation.mutate(id)
    }
  }

  if (isLoading) return <CompanyLayout><div className="text-center py-20">Đang tải danh sách tour...</div></CompanyLayout>
  if (error) return <CompanyLayout><div className="text-center py-20 text-red-500">Lỗi tải danh sách tour.</div></CompanyLayout>

  return (
    <CompanyLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quản lý Tour</h1>
          <p className="text-on-surface-variant">Danh sách tour của công ty bạn</p>
        </div>
        <Link
          to="/company/tours/new"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Tour mới
        </Link>
      </div>

      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Tìm kiếm tour theo tên hoặc địa điểm..."
              className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select 
              className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="draft">Bản nháp</option>
            </select>
          </div>
        </div>
      </div>

      {filteredTours.length > 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant text-sm font-medium border-b border-outline-variant">
                  <th className="px-6 py-4">Tour</th>
                  <th className="px-6 py-4">Địa điểm</th>
                  <th className="px-6 py-4">Giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredTours.map((tour: any) => (
                  <tr key={tour.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={tour.image_url || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=400&h=300&fit=crop'} 
                          alt="" 
                          className="w-12 h-12 rounded-lg object-cover bg-surface-container" 
                        />
                        <div className="font-bold text-on-surface line-clamp-1">{tour.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4 text-primary" />
                        {tour.destination}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {formatPrice(tour.price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tour.status} type="tour" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/company/tours/${tour.id}`} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link to={`/company/tours/${tour.id}`} className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface" title="Sửa tour">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(tour.id)}
                          disabled={deleteMutation.isPending}
                          className="p-2 hover:bg-error-container rounded-lg text-on-surface-variant hover:text-error disabled:opacity-50 transition-colors" 
                          title="Xóa tour"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <EmptyState 
          title="Không tìm thấy tour nào" 
          message={searchQuery ? `Không có tour nào khớp với từ khóa "${searchQuery}"` : "Bạn chưa có tour nào. Hãy bắt đầu tạo tour đầu tiên!"}
          actionLabel={searchQuery ? "Xóa bộ lọc" : "Thêm Tour mới"}
          onAction={() => {
            if (searchQuery) {
              setSearchQuery('')
              setStatusFilter('all')
            } else {
              navigate('/company/tours/new')
            }
          }}
        />
      )}
    </CompanyLayout>
  )
}
