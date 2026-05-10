import CompanyLayout from '@/components/company/CompanyLayout'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CompanyService } from '@/services/company.service'
import PageHeader from '@/components/ui/PageHeader'
import LoadingState from '@/components/ui/LoadingState'

export default function CompanyAddDeparturePage() {
  const navigate = useNavigate()
  const { data: response, isLoading } = useQuery({
    queryKey: ['company-tours'],
    queryFn: () => CompanyService.getMyTours(),
  })

  const tours = response?.tours || []

  const [selectedTour, setSelectedTour] = useState('')
  const [departures, setDepartures] = useState([
    { start_date: '', end_date: '', total_seats: 20 }
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addDepartureRow = () => {
    setDepartures([...departures, { start_date: '', end_date: '', total_seats: 20 }])
  }

  const removeDeparture = (index: number) => {
    setDepartures(departures.filter((_, i) => i !== index))
  }

  const updateDeparture = (index: number, field: string, value: string | number) => {
    const updated = [...departures]
    updated[index] = { ...updated[index], [field]: value }
    setDepartures(updated)
  }

  const handleSave = async () => {
    if (!selectedTour) {
      alert('Vui lòng chọn tour')
      return
    }

    
    const isInvalid = departures.some(departure => !departure.start_date || !departure.end_date)
    if (isInvalid) {
      alert('Vui lòng điền đầy đủ ngày bắt đầu và ngày kết thúc.')
      return
    }

    setIsSubmitting(true)
    try {

      await Promise.all(
        departures.map(departure => CompanyService.addDeparture(selectedTour, departure))
      )
      alert('Thêm lịch trình thành công')
      navigate('/company/departures')
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu lịch trình')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <CompanyLayout>
      <div className="mb-4">
        <Link
          to="/company/departures"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </Link>
      </div>

      <PageHeader 
        title="Thêm Lịch khởi hành" 
        description="Thêm ngày khởi hành cho tour của bạn" 
      />

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">

        <div className="mb-6">
          <label htmlFor="tour-select" className="block text-sm font-medium text-on-surface mb-2">Chọn Tour</label>
          <select 
            id="tour-select" 
            value={selectedTour}
            onChange={(e) => setSelectedTour(e.target.value)}
            className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
          >
            <option value="">Chọn tour...</option>
            {isLoading ? <option value="" disabled>Đang tải...</option> : tours.map((tour: any) => (
              <option key={tour.id} value={tour.id}>{tour.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-on-surface">Danh sách ngày khởi hành</h3>
            <button
              onClick={addDepartureRow}
              className="inline-flex items-center gap-2 text-primary hover:text-primary-container font-medium text-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm ngày
            </button>
          </div>

          {departures.map((departure, index) => (
            <div key={index} className="flex flex-col md:flex-row gap-4 p-4 bg-surface-container rounded-lg">
              <div className="flex-1">
                <label htmlFor={`start-date-${index}`} className="block text-xs font-medium text-on-surface-variant mb-1">Ngày bắt đầu</label>
                <input
                  id={`start-date-${index}`}
                  type="datetime-local"
                  value={departure.start_date}
                  onChange={(e) => updateDeparture(index, 'start_date', e.target.value)}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`end-date-${index}`} className="block text-xs font-medium text-on-surface-variant mb-1">Ngày kết thúc</label>
                <input
                  id={`end-date-${index}`}
                  type="datetime-local"
                  value={departure.end_date}
                  onChange={(e) => updateDeparture(index, 'end_date', e.target.value)}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="w-full md:w-32">
                <label htmlFor={`departure-slots-${index}`} className="block text-xs font-medium text-on-surface-variant mb-1">Số chỗ</label>
                <input
                  id={`departure-slots-${index}`}
                  type="number"
                  min={1}
                  value={departure.total_seats}
                  onChange={(e) => updateDeparture(index, 'total_seats', parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => removeDeparture(index)}
                  aria-label="Xóa ngày khởi hành"
                  className="p-2 hover:bg-error-container rounded-lg text-on-surface-variant hover:text-error transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-outline-variant">
          <button 
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary-container text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
          </button>
          <Link
            to="/company/departures"
            className="flex-1 border border-outline-variant text-on-surface font-semibold py-3 rounded-lg hover:bg-surface-container transition-colors text-center"
          >
            Hủy
          </Link>
        </div>
      </div>
    </CompanyLayout>
  )
}

