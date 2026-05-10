import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Star,
  Clock,
  CheckCircle,
  CreditCard,
  Headphones,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PublicService } from "../../services/public.service";
import { formatPrice } from "@/lib/format";

const WHY_CHOOSE_US = [
  {
    icon: CheckCircle,
    color: "bg-primary/10",
    iconColor: "text-primary",
    title: "Độ tin cậy tuyệt đối",
    description: "Mọi hành trình đều được kiểm định chất lượng nghiêm ngặt.",
  },
  {
    icon: CreditCard,
    color: "bg-secondary/10",
    iconColor: "text-secondary",
    title: "Giá cả minh bạch",
    description: "Cam kết giá tốt nhất, không phí ẩn trong suốt hành trình.",
  },
  {
    icon: Headphones,
    color: "bg-tertiary/10",
    iconColor: "text-tertiary",
    title: "Hỗ trợ 24/7",
    description: "Đội ngũ chuyên nghiệp luôn sẵn sàng đồng hành cùng bạn.",
  },
];

export default function HomePage() {
  const [destination, setDestination] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [guests, setGuests] = useState(1);
  const navigate = useNavigate();

  // Fetch destinations
  const { data: destinationsData } = useQuery({
    queryKey: ["destinations"],
    queryFn: PublicService.getDestinations,
  });
  const destinations = destinationsData?.destinations || [];

  // Fetch featured tours (we just get all tours for now and take first 3)
  const { data: toursData, isLoading: isLoadingTours } = useQuery({
    queryKey: ["tours", "featured"],
    queryFn: () => PublicService.getTours(),
  });
  const featuredTours = toursData?.tours?.slice(0, 3) || [];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination_id", destination);
    if (departureDate) params.set("date", departureDate);
    if (guests) params.set("guests", guests.toString());
    navigate(`/tours?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-[700px] flex items-center justify-center pt-24 pb-12 overflow-hidden bg-slate-900 border-b-2 border-red-200">
        {/* Background Image */}
        <div className="absolute inset-0 z-0 bg-black/40">
          <img
            alt="Ha Long Bay"
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop"
            className="w-full h-full object-cover brightness-[0.65]"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] px-4 md:px-8 text-center">
          <h1 className="text-5xl font-bold text-white mb-10 drop-shadow-lg leading-tight">
            Khám phá vẻ đẹp Việt Nam
          </h1>

          {/* Search Box */}
          <div className="bg-surface/95 backdrop-blur-md p-6 rounded-xl shadow-xl max-w-4xl mx-auto flex flex-col md:flex-row gap-4 items-end">
            {/* Destination */}
            <div className="w-full text-left">
              <label
                htmlFor="destination"
                className="block text-xs font-medium text-on-surface-variant mb-1 ml-1"
              >
                Điểm đến
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <select
                  id="destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary appearance-none text-base"
                >
                  <option value="">Tìm nơi bạn muốn đến...</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date */}
            <div className="w-full text-left">
              <label
                htmlFor="departureDate"
                className="block text-xs font-medium text-on-surface-variant mb-1 ml-1"
              >
                Ngày đi
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="departureDate"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            {/* Guests */}
            <div className="w-full text-left">
              <label
                htmlFor="guests"
                className="block text-xs font-medium text-on-surface-variant mb-1 ml-1"
              >
                Số khách
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-primary w-5 h-5" />
                <input
                  id="guests"
                  type="number"
                  min={1}
                  max={20}
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                  placeholder="Số người"
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="w-full md:w-auto bg-primary hover:bg-primary-container text-white font-medium text-sm px-10 py-3 rounded-lg shadow-lg flex items-center justify-center gap-2 whitespace-nowrap transition-all"
            >
              <Search className="w-5 h-5" />
              Tìm kiếm
            </button>
          </div>
        </div>
      </section>

      {/* Featured Tours */}
      <section className="max-w-[1200px] mx-auto px-4 md:px-8 py-20 bg-white border-b-2 border-blue-200">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">Tour Nổi Bật</h2>
            <p className="text-base text-on-surface-variant mt-1">
              Những hành trình được yêu thích nhất bởi cộng đồng TourGo
            </p>
          </div>
          <Link
            to="/tours"
            className="text-secondary font-medium text-sm flex items-center gap-1 hover:underline"
          >
            Xem tất cả <span>→</span>
          </Link>
        </div>

        {isLoadingTours ? (
          <div className="text-center py-10 text-on-surface-variant">
            Đang tải danh sách tour...
          </div>
        ) : featuredTours.length === 0 ? (
          <div className="text-center py-10 text-on-surface-variant">Chưa có tour nổi bật nào.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featuredTours.map((tour) => (
              <article
                key={tour.id}
                className="bg-surface-container-lowest rounded-xl overflow-hidden tour-card-shadow transition-all duration-300 hover:-translate-y-1 hover:shadow-[0px_8px_30px_rgba(0,78,137,0.12)]"
              >
                {/* Image */}
                <div className="relative h-64 bg-slate-200">
                  <img
                    alt={tour.name}
                    src={
                      tour.image_url ||
                      "https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop"
                    }
                    className="w-full h-full object-cover"
                  />
                  {/* Badge fallback if no specific logic for badge yet */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Đang mở bán
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center gap-1 text-on-surface-variant mb-2">
                    <MapPin className="text-primary w-4 h-4" />
                    <span className="text-xs font-medium">{tour.destination || "Việt Nam"}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-on-surface mb-2 line-clamp-1">
                    {tour.name}
                  </h3>

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="text-tertiary w-[18px] h-[18px] fill-current" />
                      <span className="text-xs font-medium text-on-surface">5.0</span>
                      <span className="text-xs text-on-surface-variant">(0 đánh giá)</span>
                    </div>
                    <div className="flex items-center gap-1 text-on-surface-variant">
                      <Clock className="w-[18px] h-[18px]" />
                      <span className="text-xs font-medium">{tour.total_days} ngày</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-outline-variant">
                    <div>
                      <p className="text-on-surface-variant text-xs">Giá từ</p>
                      <p className="text-primary font-bold text-lg">{formatPrice(tour.price)}</p>
                    </div>
                    <Link
                      to={`/tours/${tour.id}`}
                      className="bg-primary/10 hover:bg-primary/20 text-primary font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Why Choose Us */}
      <section className="bg-surface-container py-20 border-b-2 border-green-200">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-3xl font-bold text-on-surface mb-4">Tại sao nên chọn TourGo?</h2>
              <ul className="space-y-6">
                {WHY_CHOOSE_US.map((item, index) => (
                  <li key={index} className="flex gap-4 items-start">
                    <div className={`${item.color} p-2 rounded-lg`}>
                      <item.icon className={`${item.iconColor} w-6 h-6`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-on-surface">{item.title}</h4>
                      <p className="text-on-surface-variant">{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image */}
            <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-square md:aspect-video">
              <img
                alt="TourGo Service"
                src="https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=600&h=400&fit=crop"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Sẵn sàng cho chuyến đi của bạn?</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Đăng ký ngay hôm nay và nhận ưu đãi 10% cho lần đặt tour đầu tiên
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tours"
              className="bg-white text-primary font-semibold px-8 py-3 rounded-lg hover:bg-surface-container-low transition-colors"
            >
              Khám phá ngay
            </Link>
            <Link
              to="/contact"
              className="bg-transparent border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors inline-block"
            >
              Liên hệ tư vấn
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
