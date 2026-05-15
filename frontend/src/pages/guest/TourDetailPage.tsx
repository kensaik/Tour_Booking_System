import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PublicService } from "@/services/public.service";
import { formatPrice, formatDate } from "@/lib/format";
import Modal from "@/components/ui/Modal";
import { Info } from "lucide-react";

interface Departure {
  id: number;
  start_date: string;
  available_seats: number;
}

interface Itinerary {
  id: number;
  day_number: number;
  title: string;
  description: string;
}

interface TourDetail {
  id: number;
  name: string;
  description: string;
  price: number;
  total_days: number;
  destination: string;
  image_url?: string;
  itineraries: Itinerary[];
  departures: Departure[];
}

export default function TourDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedDepartureId, setSelectedDepartureId] = useState<number | null>(null);
  const [guests, setGuests] = useState(2);
  const [showWarningModal, setShowWarningModal] = useState(false);

  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tour", id],
    queryFn: () => PublicService.getTourDetail(id as string),
  });

  if (isLoading) return <div className="text-center py-20">Đang tải dữ liệu...</div>;
  if (error || !response?.tour)
    return <div className="text-center py-20 text-red-500">Lỗi khi tải tour</div>;

  const tour: TourDetail = response.tour;
  const images = [
    tour.image_url ||
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800&h=600&fit=crop",
  ];
  const includes = [
    "Xe limousine đưa đón",
    "Lưu trú trên du thuyền",
    "Bữa ăn theo chương trình",
    "Vé tham quan",
    "Hướng dẫn viên chuyên nghiệp",
    "Bảo hiểm du lịch",
  ];
  const excludes = ["Chi tiêu cá nhân", "Đồ uống có cồn", "Tip cho hướng dẫn viên"];
  const highlights = ["Tham quan các địa điểm nổi bật", "Dịch vụ chuyên nghiệp", "Giá cả hợp lý"];

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBookNow = () => {
    if (!selectedDepartureId) {
      setShowWarningModal(true);
      return;
    }

    const departure = tour.departures.find((d) => d.id === selectedDepartureId);

    navigate("/checkout", {
      state: {
        tour: {
          id: tour.id,
          name: tour.name,
          image: images[0],
          duration: `${tour.total_days} ngày`,
        },
        departure,
        guests,
        pricePerPerson: tour.price,
      },
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <nav className="text-sm text-on-surface-variant mb-4">
          <Link to="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="mx-2">/</span>
          <Link to="/tours" className="hover:text-primary">
            Tour
          </Link>
          <span className="mx-2">/</span>
          <span className="text-on-surface">{tour.name}</span>
        </nav>

        <div className="relative mb-8 rounded-xl overflow-hidden">
          <img
            src={images[selectedImage]}
            alt={tour.name}
            className="w-full h-[400px] object-cover bg-slate-200"
          />
          <button
            onClick={prevImage}
            aria-label="Ảnh trước"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextImage}
            aria-label="Ảnh sau"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                aria-label={`Xem ảnh ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === selectedImage ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {images.map((img, index) => (
            <button
              key={index}
              aria-label={`Xem ảnh ${index + 1}`}
              onClick={() => setSelectedImage(index)}
              className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedImage ? "border-primary" : "border-transparent"
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover bg-slate-200" />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-on-surface-variant mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm">{tour.destination}</span>
              </div>
              <h1 className="text-3xl font-bold text-on-surface mb-4">{tour.name}</h1>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-tertiary fill-current" />
                  <span className="font-semibold">5.0</span>
                  <span className="text-on-surface-variant">(0 đánh giá)</span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <Clock className="w-5 h-5" />
                  <span>{tour.total_days} ngày</span>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    aria-label="Yêu thích"
                    className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
                  >
                    <Heart className="w-5 h-5" />
                  </button>
                  <button
                    aria-label="Chia sẻ"
                    className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-4">Giới thiệu</h2>
              <p className="text-on-surface-variant whitespace-pre-line">
                {tour.description || "Chưa có thông tin mô tả."}
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-4">Điểm nổi bật</h2>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {highlights.map((highlight, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-on-surface-variant">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-on-surface mb-4">Lịch trình</h2>
              <div className="space-y-6">
                {tour.itineraries && tour.itineraries.length > 0 ? (
                  tour.itineraries.map((day) => (
                    <div key={day.id} className="border border-outline-variant rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-on-surface mb-4">
                        Ngày {day.day_number}: {day.title}
                      </h3>
                      <p className="text-on-surface-variant whitespace-pre-line">
                        {day.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant">Đang cập nhật lịch trình.</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-outline-variant rounded-xl p-6">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Bao gồm</h2>
                <ul className="space-y-2">
                  {includes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-on-surface-variant">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border border-outline-variant rounded-xl p-6">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Không bao gồm</h2>
                <ul className="space-y-2">
                  {excludes.map((item, index) => (
                    <li key={index} className="flex items-center gap-2 text-on-surface-variant">
                      <span className="w-4 h-4 rounded-full border border-error flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-error" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-surface-container-lowest rounded-xl shadow-lg p-6">
              <div className="mb-6">
                <p className="text-on-surface-variant text-sm">Giá từ</p>
                <p className="text-3xl font-bold text-primary">{formatPrice(tour.price)}</p>
                <p className="text-on-surface-variant text-sm">/ người</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Chọn ngày khởi hành</label>
                <div className="grid grid-cols-2 gap-2">
                  {tour.departures && tour.departures.length > 0 ? (
                    tour.departures.map((departure) => (
                      <button
                        key={departure.id}
                        onClick={() => setSelectedDepartureId(departure.id)}
                        className={`p-3 rounded-lg border text-sm transition-colors ${
                          selectedDepartureId === departure.id
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-outline-variant hover:border-primary"
                        }`}
                      >
                        <div className="font-medium">{formatDate(departure.start_date)}</div>
                        <div className="text-xs text-on-surface-variant">
                          {departure.available_seats} chỗ
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="col-span-2 text-sm text-on-surface-variant p-3 border border-outline-variant rounded-lg text-center">
                      Chưa có lịch khởi hành
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Số khách</label>
                <div className="flex items-center gap-4">
                  <button
                    aria-label="Giảm số khách"
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-10 h-10 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors font-bold"
                  >
                    -
                  </button>
                  <span className="text-xl font-semibold w-8 text-center">{guests}</span>
                  <button
                    aria-label="Tăng số khách"
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    className="w-10 h-10 rounded-lg border border-outline-variant hover:bg-surface-container-low transition-colors font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-4 mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-on-surface-variant">Giá tour</span>
                  <span className="font-medium">{formatPrice(tour.price * guests)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatPrice(tour.price * guests)}</span>
                </div>
              </div>

              <button
                onClick={handleBookNow}
                className="block w-full bg-primary hover:bg-primary-container text-white text-center font-semibold py-3 rounded-lg transition-colors"
              >
                Đặt ngay
              </button>

              <p className="text-center text-xs text-on-surface-variant mt-4">
                Đặt tour dễ dàng, thanh toán an toàn
              </p>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showWarningModal} onClose={() => setShowWarningModal(false)} title="Thông báo">
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Info className="w-8 h-8 text-amber-600" />
          </div>
          <p className="text-on-surface-variant mb-6">
            Quý khách vui lòng chọn ngày khởi hành để tiếp tục đặt tour.
          </p>
          <button
            onClick={() => setShowWarningModal(false)}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl hover:bg-primary-container transition-colors"
          >
            Đã hiểu
          </button>
        </div>
      </Modal>
    </div>
  );
}
