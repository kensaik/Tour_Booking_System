import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { MapPin, Star, Clock, Filter, Grid, List } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PublicService } from '@/services/public.service'
import { formatPrice } from '@/lib/format'
import LoadingState from '@/components/ui/LoadingState'
import EmptyState from '@/components/ui/EmptyState'

interface Tour {
  id: number
  name: string
  price: number
  total_days: number
  destination?: string
  image_url?: string
}

export default function GuestToursPage() {
  const [searchParams] = useSearchParams()
  const destinationId = searchParams.get('destination_id') || undefined
  const keyword = searchParams.get('keyword') || undefined

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState('popular')
  const [filterOpen, setFilterOpen] = useState(false)

  const { data: toursData, isLoading } = useQuery({
    queryKey: ['tours', { destinationId, keyword }],
    queryFn: () => PublicService.getTours({ destination_id: destinationId, keyword })
  })

  const tours: Tour[] = toursData?.tours || []

  if (isLoading) return <LoadingState message="Đang tải danh sách tour..." />

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-on-surface mb-2">Danh sách Tour</h1>
          <p className="text-on-surface-variant">Tìm thấy {tours.length} tour phù hợp</p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6 pb-4 border-b border-outline-variant">
          {/* Filter Toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
          </button>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sắp xếp theo"
            className="px-4 py-2 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary"
          >
            <option value="popular">Phổ biến nhất</option>
            <option value="price-asc">Giá: Thấp đến cao</option>
            <option value="price-desc">Giá: Cao đến thấp</option>
            <option value="rating">Đánh giá cao nhất</option>
          </select>

          {/* View Mode */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Chế độ lưới"
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-surface-container-low'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              aria-label="Chế độ danh sách"
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-surface-container-low'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-surface-container-low p-6 rounded-xl mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label htmlFor="filter-destination" className="block text-sm font-medium mb-2">Điểm đến</label>
                <select id="filter-destination" className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white">
                  <option>Tất cả</option>
                  <option>Hà Nội</option>
                  <option>Đà Nẵng</option>
                  <option>Sapa</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-price" className="block text-sm font-medium mb-2">Khoảng giá</label>
                <select id="filter-price" className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white">
                  <option>Tất cả</option>
                  <option>Dưới 2 triệu</option>
                  <option>2 - 5 triệu</option>
                  <option>Trên 5 triệu</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-duration" className="block text-sm font-medium mb-2">Thời gian</label>
                <select id="filter-duration" className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white">
                  <option>Tất cả</option>
                  <option>1 ngày</option>
                  <option>2-3 ngày</option>
                  <option>4+ ngày</option>
                </select>
              </div>
              <div>
                <label htmlFor="filter-rating" className="block text-sm font-medium mb-2">Đánh giá</label>
                <select id="filter-rating" className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-white">
                  <option>Tất cả</option>
                  <option>4.5+ sao</option>
                  <option>4+ sao</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Tours Grid/List */}
        {tours.length === 0 ? (
          <EmptyState
            title="Không tìm thấy tour nào phù hợp"
            description="Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn."
            actionLabel="Xem tất cả tour"
            onAction={() => {
              // Reset params logic here if needed
            }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tours.map((tour) => (
              <article
                key={tour.id}
                className="bg-surface-container-lowest rounded-xl overflow-hidden tour-card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,78,137,0.12)]"
              >
                <div className="relative h-48 bg-slate-200">
                  <img
                    alt={tour.name}
                    src={tour.image_url || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Mở bán
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-2">
                    <MapPin className="text-primary w-3 h-3" />
                    <span className="text-xs">{tour.destination || 'Việt Nam'}</span>
                  </div>
                  <h3 className="text-base font-semibold text-on-surface mb-2 line-clamp-1">
                    {tour.name}
                  </h3>
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="text-tertiary w-3 h-3 fill-current" />
                      <span className="text-xs font-medium">5.0</span>
                      <span className="text-xs text-on-surface-variant">(0)</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">{tour.total_days} ngày</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-outline-variant">
                    <div>
                      <p className="text-on-surface-variant text-[11px]">Giá từ</p>
                      <p className="text-lg font-semibold text-primary">{formatPrice(tour.price)}</p>
                    </div>
                    <Link
                      to={`/tours/${tour.id}`}
                      className="bg-secondary text-white px-4 py-2 rounded-lg hover:bg-on-secondary-container transition-colors text-sm font-medium"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {tours.map((tour) => (
              <article
                key={tour.id}
                className="bg-surface-container-lowest rounded-xl overflow-hidden tour-card-shadow transition-all duration-300 hover:shadow-[0px_8px_30px_rgba(0,78,137,0.12)] flex"
              >
                <div className="relative w-64 h-48 flex-shrink-0 bg-slate-200">
                  <img
                    alt={tour.name}
                    src={tour.image_url || 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                        Mở bán
                      </span>
                      <div className="flex items-center gap-1 text-on-surface-variant">
                        <MapPin className="text-primary w-3 h-3" />
                        <span className="text-xs">{tour.destination || 'Việt Nam'}</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-on-surface mb-2">{tour.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-on-surface-variant">
                      <div className="flex items-center gap-1">
                        <Star className="text-tertiary w-4 h-4 fill-current" />
                        <span className="font-medium">5.0</span>
                        <span>(0 đánh giá)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{tour.total_days} ngày</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <div>
                      <p className="text-on-surface-variant text-xs">Giá từ</p>
                      <p className="text-xl font-semibold text-primary">{formatPrice(tour.price)}</p>
                    </div>
                    <Link
                      to={`/tours/${tour.id}`}
                      className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-on-secondary-container transition-colors font-medium"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

