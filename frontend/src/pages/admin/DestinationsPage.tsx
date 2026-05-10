import { useState } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Plus, Search, Eye, Edit, Trash2, MapPin, Image } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/services/admin.service'
import Modal from '@/components/ui/Modal'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Toast, { ToastType } from '@/components/ui/Toast'
import EmptyState from '@/components/ui/EmptyState'

export default function DestinationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [modalType, setModalType] = useState<'view' | 'edit' | 'add' | null>(null)
  const [deleteId, setDeleteId] = useState<number | string | null>(null)
  const [selectedDestination, setSelectedDestination] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  })
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  
  const queryClient = useQueryClient()
  
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['admin-destinations'],
    queryFn: () => AdminService.getDestinations(),
  })

  const destinations = response?.destinations || []

  const filteredDestinations = destinations.filter((dest: any) => 
    dest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dest.description && dest.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const createMutation = useMutation({
    mutationFn: (data: any) => AdminService.createDestination(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-destinations'] })
      setModalType(null)
      resetForm()
      setToast({ message: 'Thêm điểm đến thành công!', type: 'success' })
    },
    onError: (err: any) => {
      setToast({ message: err.response?.data?.message || 'Lỗi khi thêm điểm đến', type: 'error' })
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string, data: any }) => 
      AdminService.updateDestination(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-destinations'] })
      setModalType(null)
      resetForm()
      setToast({ message: 'Cập nhật điểm đến thành công!', type: 'success' })
    },
    onError: (err: any) => {
      setToast({ message: err.response?.data?.message || 'Lỗi khi cập nhật', type: 'error' })
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => AdminService.deleteDestination(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-destinations'] })
      setDeleteId(null)
      setToast({ message: 'Xóa điểm đến thành công!', type: 'success' })
    },
    onError: (err: any) => {
      setToast({ message: err.response?.data?.message || 'Không thể xóa điểm đến này', type: 'error' })
      setDeleteId(null)
    }
  })

  const resetForm = () => {
    setFormData({ name: '', description: '', image_url: '' })
    setSelectedDestination(null)
  }

  const handleOpenAdd = () => {
    resetForm()
    setModalType('add')
  }

  const handleOpenEdit = (dest: any) => {
    setSelectedDestination(dest)
    setFormData({
      name: dest.name,
      description: dest.description || '',
      image_url: dest.image_url || ''
    })
    setModalType('edit')
  }

  const handleOpenView = (dest: any) => {
    setSelectedDestination(dest)
    setModalType('view')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (modalType === 'add') {
      createMutation.mutate(formData)
    } else if (modalType === 'edit' && selectedDestination) {
      updateMutation.mutate({ id: selectedDestination.id, data: formData })
    }
  }

  if (isLoading) return (
    <AdminLayout>
      <div className="text-center py-20">Đang tải danh sách điểm đến...</div>
    </AdminLayout>
  )

  if (error) return (
    <AdminLayout>
      <div className="text-center py-20 text-red-500">Lỗi tải danh sách điểm đến.</div>
    </AdminLayout>
  )

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Quản lý Điểm đến</h1>
          <p className="text-on-surface-variant">Danh sách các điểm đến du lịch trên hệ thống</p>
        </div>
        <button 
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm Điểm đến
        </button>
      </div>

      {/* Search */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Tìm kiếm điểm đến..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      {/* Destinations Grid */}
      {filteredDestinations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((dest: any) => (
            <div 
              key={dest.id} 
              className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 bg-gradient-to-br from-primary/20 to-secondary/20">
                {dest.image_url ? (
                  <img 
                    src={dest.image_url} 
                    alt={dest.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <MapPin className="w-12 h-12 text-primary/40" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-bold text-on-surface mb-1">{dest.name}</h3>
                <p className="text-sm text-on-surface-variant line-clamp-2 mb-4">
                  {dest.description || 'Chưa có mô tả'}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-outline-variant">
                  <span className="text-xs text-on-surface-variant">
                    #{dest.id}
                  </span>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenView(dest)}
                      className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleOpenEdit(dest)}
                      className="p-2 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-on-surface transition-colors"
                      title="Sửa"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => setDeleteId(dest.id)}
                      className="p-2 hover:bg-error-container rounded-lg text-on-surface-variant hover:text-error transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title={searchTerm ? "Không tìm thấy điểm đến" : "Chưa có điểm đến nào"}
          description={searchTerm 
            ? `Không có điểm đến nào khớp với "${searchTerm}"` 
            : "Hãy bắt đầu bằng việc thêm điểm đến đầu tiên cho hệ thống."
          }
          icon={MapPin}
          actionLabel={searchTerm ? "Xóa tìm kiếm" : "Thêm điểm đến"}
          onAction={() => searchTerm ? setSearchTerm('') : handleOpenAdd()}
        />
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={modalType === 'add' || modalType === 'edit'} 
        onClose={() => { setModalType(null); resetForm() }} 
        title={modalType === 'add' ? 'Thêm điểm đến mới' : 'Chỉnh sửa điểm đến'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Tên điểm đến *
            </label>
            <input 
              type="text" 
              required
              placeholder="VD: Đà Lạt, Phú Quốc..."
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-on-surface mb-1">
              Mô tả
            </label>
            <textarea 
              rows={3}
              placeholder="Mô tả ngắn về điểm đến..."
              className="w-full px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-on-surface mb-2">
              Hình ảnh điểm đến
            </label>
            
            <div 
              className={`relative border-2 border-dashed rounded-xl transition-all ${
                formData.image_url 
                  ? 'border-primary bg-primary/5' 
                  : 'border-outline-variant hover:border-primary hover:bg-surface-container'
              }`}
            >
              {formData.image_url ? (
                <div className="relative">
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg z-10">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image_url: '' })}
                      className="relative z-20 bg-white text-error p-3 rounded-full hover:bg-error hover:text-white transition-all shadow-lg"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-48 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 text-primary">
                    <Image className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-medium text-on-surface">Nhấn hoặc kéo thả để tải ảnh</p>
                  <p className="text-xs text-on-surface-variant mt-1">PNG, JPG hoặc WebP (Max 5MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          setToast({ message: 'Ảnh quá lớn. Vui lòng chọn ảnh dưới 5MB', type: 'error' })
                          return
                        }
                        const reader = new FileReader()
                        reader.onloadend = () => {
                          setFormData({ ...formData, image_url: reader.result as string })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                  />
                </label>
              )}
            </div>
            {formData.image_url && (
              <button
                type="button"
                onClick={() => setFormData({ ...formData, image_url: '' })}
                className="mt-2 text-sm text-error hover:text-error/80 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Xóa ảnh
              </button>
            )}
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={() => { setModalType(null); resetForm() }}
              className="flex-1 py-2 rounded-lg border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
            >
              Hủy
            </button>
            <button 
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
            >
              {createMutation.isPending || updateMutation.isPending 
                ? 'Đang xử lý...' 
                : modalType === 'add' ? 'Thêm mới' : 'Lưu thay đổi'
              }
            </button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal 
        isOpen={modalType === 'view'} 
        onClose={() => setModalType(null)} 
        title="Chi tiết điểm đến"
      >
        {selectedDestination && (
          <div className="space-y-4">
            <div className="relative h-48 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20">
              {selectedDestination.image_url ? (
                <img 
                  src={selectedDestination.image_url} 
                  alt={selectedDestination.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <MapPin className="w-16 h-16 text-primary/40" />
                </div>
              )}
            </div>
            
            <div className="text-center py-2">
              <h3 className="text-xl font-bold text-on-surface">{selectedDestination.name}</h3>
              <p className="text-sm text-on-surface-variant">ID: #{selectedDestination.id}</p>
            </div>

            <div className="p-4 bg-surface-container rounded-xl">
              <p className="text-xs text-on-surface-variant uppercase font-bold tracking-wider mb-2">Mô tả</p>
              <p className="text-on-surface">
                {selectedDestination.description || 'Chưa có mô tả'}
              </p>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                onClick={() => handleOpenEdit(selectedDestination)}
                className="flex-1 py-2 rounded-lg border border-outline-variant text-on-surface font-medium hover:bg-surface-container transition-colors"
              >
                Chỉnh sửa
              </button>
              <button 
                onClick={() => {
                  setModalType(null)
                  setDeleteId(selectedDestination.id)
                }}
                className="flex-1 py-2 rounded-lg bg-error-container text-error font-medium hover:bg-error/10 transition-colors"
              >
                Xóa
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        type="danger"
        title="Xóa điểm đến"
        message="Bạn có chắc chắn muốn xóa điểm đến này không? Hành động này không thể hoàn tác."
        confirmLabel="Xóa ngay"
        isLoading={deleteMutation.isPending}
      />

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </AdminLayout>
  )
}
