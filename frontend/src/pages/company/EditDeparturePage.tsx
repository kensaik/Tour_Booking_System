import CompanyLayout from "@/components/company/CompanyLayout";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompanyService } from "@/services/company.service";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Toast, { ToastType } from "@/components/ui/Toast";

export default function CompanyEditDeparturePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: departureData, isLoading: isLoadingDeparture } = useQuery({
    queryKey: ["company-departure", id],
    queryFn: () => CompanyService.getDeparture(id!),
  });

  const { data: toursData } = useQuery({
    queryKey: ["company-tours"],
    queryFn: () => CompanyService.getMyTours(),
  });

  const tours = toursData?.tours || [];
  const departure = departureData?.departure;

  const [selectedTour, setSelectedTour] = useState("");
  const [tourSearch, setTourSearch] = useState("");
  const [showTourDropdown, setShowTourDropdown] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalSeats, setTotalSeats] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    if (departure) {
      setSelectedTour(departure.tour_id?.toString() || "");
      setTourSearch(departure.tour?.name || "");
      setStartDate(departure.start_date?.slice(0, 16) || "");
      setEndDate(departure.end_date?.slice(0, 16) || "");
      setTotalSeats(departure.total_seats || 20);
    }
  }, [departure]);

  const handleSave = async () => {
    if (!selectedTour) {
      setToast({ message: "Vui lòng chọn tour", type: "error" });
      return;
    }

    if (!startDate || !endDate) {
      setToast({ message: "Vui lòng điền đầy đủ ngày bắt đầu và ngày kết thúc", type: "error" });
      return;
    }

    setIsSubmitting(true);
    try {
      await CompanyService.updateDeparture(id!, {
        tour_id: selectedTour,
        start_date: startDate,
        end_date: endDate,
        total_seats: totalSeats,
      });
      setToast({ message: "Cập nhật lịch trình thành công", type: "success" });
      setTimeout(() => navigate("/company/departures"), 1500);
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setToast({ message: apiError.response?.data?.message || "Có lỗi xảy ra", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingDeparture) {
    return (
      <CompanyLayout>
        <LoadingState />
      </CompanyLayout>
    );
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
        title="Chỉnh sửa Lịch khởi hành"
        description="Cập nhật thông tin lịch khởi hành"
      />

      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant p-6">
        {/* Tour Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-on-surface mb-2">Chọn Tour</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Gõ để tìm tour..."
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              value={tourSearch}
              onFocus={() => setShowTourDropdown(true)}
              onBlur={() => setTimeout(() => setShowTourDropdown(false), 200)}
              onChange={(e) => {
                setTourSearch(e.target.value);
                setShowTourDropdown(true);
                const match = tours.find(
                  (t) => t.name.toLowerCase() === e.target.value.toLowerCase(),
                );
                if (match) setSelectedTour(match.id);
              }}
            />
            {showTourDropdown && (
              <div className="absolute z-20 w-full mt-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl max-h-60 overflow-auto py-2">
                {tours
                  .filter((t) => t.name.toLowerCase().includes(tourSearch.toLowerCase()))
                  .map((t) => (
                    <div
                      key={t.id}
                      className="px-4 py-3 hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-between group"
                      onClick={() => {
                        setSelectedTour(t.id);
                        setTourSearch(t.name);
                        setShowTourDropdown(false);
                      }}
                    >
                      <span className="text-on-surface group-hover:text-primary font-medium">
                        {t.name}
                      </span>
                      {selectedTour === t.id && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Departure Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label
              htmlFor="start-date"
              className="block text-xs font-medium text-on-surface-variant mb-1"
            >
              Ngày bắt đầu
            </label>
            <input
              id="start-date"
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="end-date"
              className="block text-xs font-medium text-on-surface-variant mb-1"
            >
              Ngày kết thúc
            </label>
            <input
              id="end-date"
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label
              htmlFor="total-seats"
              className="block text-xs font-medium text-on-surface-variant mb-1"
            >
              Số chỗ
            </label>
            <input
              id="total-seats"
              type="number"
              min={1}
              value={totalSeats}
              onChange={(e) => setTotalSeats(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-3 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 pt-6 border-t border-outline-variant">
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-1 bg-primary hover:bg-primary-container text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Đang lưu..." : "Lưu lại"}
          </button>
          <Link
            to="/company/departures"
            className="flex-1 border border-outline-variant text-on-surface font-semibold py-3 rounded-lg hover:bg-surface-container transition-colors text-center"
          >
            Hủy
          </Link>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </CompanyLayout>
  );
}
