import CompanyLayout from "@/components/company/CompanyLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Image as ImageIcon, Plus, X } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CompanyService } from "@/services/company.service";
import { PublicService } from "@/services/public.service";
import { UploadService } from "@/services/upload.service";

export default function CompanyAddTourPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    destination_id: "",
    image_url: "",
    itineraries: [{ day_number: 1, title: "", description: "" }],
  });
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await UploadService.uploadImage(file);
      setFormData({ ...formData, image_url: result.url });
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Tải ảnh lên thất bại!");
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch destinations for selection
  const { data: destResponse } = useQuery({
    queryKey: ["destinations"],
    queryFn: () => PublicService.getDestinations(),
  });
  const destinations = destResponse?.destinations || [];

  const mutation = useMutation({
    mutationFn: (data: any) => CompanyService.createTour(data),
    onSuccess: () => {
      navigate("/company/tours");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Auto calculate total days from itineraries length
    const total_days = formData.itineraries.length;

    mutation.mutate({
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
    const newItineraries = formData.itineraries.filter((_, i) => i !== index);
    // Re-index days
    const reindexed = newItineraries.map((day, i) => ({ ...day, day_number: i + 1 }));
    setFormData({ ...formData, itineraries: reindexed });
  };

  return (
    <CompanyLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </button>

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-on-surface">Thêm Tour mới</h1>
          <button
            form="add-tour-form"
            type="submit"
            disabled={mutation.isPending}
            className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-6 py-2 rounded-lg font-medium shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {mutation.isPending ? "Đang lưu..." : "Lưu và Đăng tour"}
          </button>
        </div>

        <form id="add-tour-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info Card */}
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
                  placeholder="Ví dụ: Tour Đà Lạt 3 ngày 2 đêm - Khám phá Langbiang"
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Điểm đến *</label>
                <select
                  required
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                  value={formData.destination_id}
                  onChange={(e) => setFormData({ ...formData, destination_id: e.target.value })}
                >
                  <option value="">Chọn điểm đến</option>
                  {destinations.map((d: any) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
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
                  placeholder="Giới thiệu sơ lược về tour của bạn..."
                  className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none resize-none"
                  value={formData.description}
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

          {/* Itinerary Section */}
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
              {formData.itineraries.map((day, index) => (
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
                      placeholder="Tiêu đề ngày (ví dụ: Khởi hành từ TP.HCM)"
                      className="w-full px-3 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                      value={day.title}
                      onChange={(e) => updateItinerary(index, "title", e.target.value)}
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Những hoạt động chính trong ngày..."
                      className="w-full px-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest focus:ring-2 focus:ring-primary outline-none"
                      value={day.description}
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
      </div>
    </CompanyLayout>
  );
}
