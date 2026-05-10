import CompanyLayout from "@/components/company/CompanyLayout";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Image as ImageIcon, Plus, X, CheckCircle } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CompanyService } from "@/services/company.service";
import { PublicService } from "@/services/public.service";
import { UploadService } from "@/services/upload.service";
import LoadingState from "@/components/ui/LoadingState";
import ErrorState from "@/components/ui/ErrorState";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Toast, { ToastType } from "@/components/ui/Toast";

interface TourFormData {
  name: string;
  description: string;
  price: string | number;
  destination_id: number | string;
  image_url: string;
  itineraries: Array<{ day_number: number; title: string; description: string; id?: number }>;
}

export default function CompanyTourDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<TourFormData | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [destSearch, setDestSearch] = useState("");
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadService.uploadImage(file);
      setFormData({ ...formData, image_url: result.url });
    } catch (error) {
      console.error("Upload failed:", error);
      setToast({ message: "Tải ảnh lên thất bại!", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  const {
    data: tour,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["company-tour", id],
    queryFn: () => CompanyService.getTourDetail(id as string),
    enabled: !!id,
  });

  const { data: destResponse } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => PublicService.getDestinations(),
  });
  const destinations = useMemo(() => destResponse?.destinations || [], [destResponse]);

  useEffect(() => {
    if (tour?.tour) {
      const t = tour.tour;
      setFormData({
        name: t.name,
        description: t.description,
        price: t.price,
        destination_id: t.destination_id,
        image_url: t.image_url,
        itineraries: t.itineraries || [],
      });
      const dest = destinations.find((d) => d.id === t.destination_id);
      if (dest) setDestSearch(dest.name);
    }
  }, [tour, destinations]);

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => CompanyService.updateTour(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-tour", id] });
      queryClient.invalidateQueries({ queryKey: ["company-tours"] });
      setToast({ message: "Cập nhật tour thành công!", type: "success" });
    },
  });

  const publishMutation = useMutation({
    mutationFn: () => CompanyService.updateTour(id as string, { status: "active" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company-tour", id] });
      queryClient.invalidateQueries({ queryKey: ["company-tours"] });
      setToast({ message: "Tour đã được duyệt và chính thức hoạt động!", type: "success" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();


    const total_days = formData.itineraries.length;

    updateMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      destination_id: parseInt(formData.destination_id),
      total_days: total_days,
    });
  };

  const addDay = () => {
    setFormData({
      ...formData,
      itineraries: [
        ...formData.itineraries,
        { day_number: formData.itineraries.length + 1, title: "", description: "" },
      ],
    });
  };

  const updateItinerary = (index: number, field: string, value: string) => {
    const newItineraries = [...formData.itineraries];
    newItineraries[index] = { ...newItineraries[index], [field]: value };
    setFormData({ ...formData, itineraries: newItineraries });
  };

  const removeDay = (index: number) => {
    const newItineraries = formData.itineraries.filter((_, i: number) => i !== index);
    const reindexed = newItineraries.map((day, i: number) => ({ ...day, day_number: i + 1 }));
    setFormData({ ...formData, itineraries: reindexed });
  };

  if (isLoading)
    return (
      <CompanyLayout>
        <LoadingState message="Đang tải thông tin tour..." />
      </CompanyLayout>
    );
  if (error || !tour)
    return (
      <CompanyLayout>
        <ErrorState message="Không tìm thấy thông tin tour hoặc có lỗi xảy ra." />
      </CompanyLayout>
    );
  if (!formData) return null;

  return (
    <CompanyLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/company/tours")}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Chi tiết Tour</h1>
            <p className="text-on-surface-variant">
              ID: #{id} • Trạng thái:{" "}
              {tour.tour.status?.toLowerCase() === "active" ? "Đang hoạt động" : "Nháp"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {tour.tour.status?.toLowerCase() === "draft" && (
              <button
                type="button"
                onClick={() => setShowPublishConfirm(true)}
                disabled={publishMutation.isPending}
                className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary px-6 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {publishMutation.isPending ? "Đang duyệt..." : "Duyệt Tour"}
              </button>
            )}
            <button
              form="edit-tour-form"
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        <form id="edit-tour-form" onSubmit={handleSubmit} className="space-y-6">

          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full"></span>
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Tên Tour *</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Điểm đến *</label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="Gõ để tìm điểm đến..."
                    className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                    value={destSearch}
                    onFocus={() => setShowDestDropdown(true)}
                    onBlur={() => {

                      setTimeout(() => setShowDestDropdown(false), 200);
                    }}
                    onChange={(e) => {
                      setDestSearch(e.target.value);
                      setShowDestDropdown(true);
                      const match = destinations.find(
                        (d) => d.name.toLowerCase() === e.target.value.toLowerCase(),
                      );
                      if (match) {
                        setFormData({ ...formData, destination_id: match.id });
                      }
                    }}
                  />
                  {showDestDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl max-h-60 overflow-auto py-2">
                      {destinations
                        .filter((d) => d.name.toLowerCase().includes(destSearch.toLowerCase()))
                        .map((d) => (
                          <div
                            key={d.id}
                            className="px-4 py-2.5 hover:bg-primary/10 cursor-pointer transition-colors flex items-center justify-between group"
                            onClick={() => {
                              setDestSearch(d.name);
                              setFormData({ ...formData, destination_id: d.id });
                              setShowDestDropdown(false);
                            }}
                          >
                            <span className="text-on-surface group-hover:text-primary font-medium">
                              {d.name}
                            </span>
                            {formData.destination_id === d.id && (
                              <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            )}
                          </div>
                        ))}
                      {destinations.filter((d) =>
                        d.name.toLowerCase().includes(destSearch.toLowerCase()),
                      ).length === 0 && (
                        <div className="px-4 py-3 text-sm text-on-surface-variant italic">
                          Không tìm thấy điểm đến nào...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Giá tour (VNĐ) *</label>
                <input
                  required
                  type="text"
                  placeholder="Ví dụ: 1.500.000"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                  value={formData.price ? Number(formData.price).toLocaleString("vi-VN") : ""}
                  onChange={(e) => {

                    const value = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, price: value });
                  }}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Mô tả tổng quát *</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none resize-none"
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1.5">Ảnh đại diện Tour *</label>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <div className="relative group w-full sm:w-48 h-32 bg-surface-container rounded-xl border-2 border-dashed border-outline-variant hover:border-primary transition-all overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                    {formData.image_url ? (
                      <>
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-xs font-bold">Thay đổi ảnh</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-on-surface-variant mb-2" />
                        <p className="text-xs text-on-surface-variant px-4 text-center">
                          {isUploading ? "Đang tải lên..." : "Bấm để tải ảnh lên"}
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      disabled={isUploading}
                    />
                  </div>
                  <div className="flex-1 text-sm text-on-surface-variant">
                    <p className="font-medium text-on-surface mb-1">Yêu cầu:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Định dạng: JPG, PNG, GIF</li>
                      <li>Kích thước tối ưu: 800 x 600 px</li>
                      <li>Dung lượng tối đa: 2MB</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <span className="w-1.5 h-6 bg-secondary rounded-full"></span>
                Lịch trình chi tiết
              </h2>
              <button
                type="button"
                onClick={addDay}
                className="text-primary hover:text-primary-container font-medium flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Thêm ngày
              </button>
            </div>

            <div className="space-y-6">
              {formData.itineraries.map((day, index: number) => (
                <div
                  key={index}
                  className="relative p-4 rounded-xl border border-outline-variant bg-surface-container-low group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-primary uppercase tracking-wider">
                      Ngày {day.day_number}
                    </span>
                    {formData.itineraries.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDay(index)}
                        className="text-error hover:bg-error-container p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    <input
                      required
                      type="text"
                      placeholder="Tiêu đề ngày"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                      value={day.title || ""}
                      onChange={(e) => updateItinerary(index, "title", e.target.value)}
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Những hoạt động chính trong ngày..."
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                      value={day.description || ""}
                      onChange={(e) => {
                        const newItineraries = [...formData.itineraries];
                        newItineraries[index].description = e.target.value;
                        setFormData({ ...formData, itineraries: newItineraries });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>


        <ConfirmModal
          isOpen={showPublishConfirm}
          onClose={() => setShowPublishConfirm(false)}
          onConfirm={() => {
            publishMutation.mutate(undefined, {
              onSuccess: () => setShowPublishConfirm(false),
            });
          }}
          type="success"
          title="Duyệt Tour"
          message="Duyệt tour này sẽ giúp khách hàng có thể nhìn thấy và bắt đầu đặt chỗ. Bạn đã kiểm tra kỹ thông tin chưa?"
          confirmLabel="Duyệt ngay"
          isLoading={publishMutation.isPending}
        />

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </CompanyLayout>
  );
}
