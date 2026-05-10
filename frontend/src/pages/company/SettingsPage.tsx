import { useState } from "react";
import CompanyLayout from "@/components/company/CompanyLayout";
import { useAuthStore } from "@/stores/authStore";
import { Save, Building, Phone, Mail, MapPin, Info, Lock } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import Toast, { ToastType } from "@/components/ui/Toast";

export default function CompanySettingsPage() {
  const { user } = useAuthStore();
  const profile = user?.company_profile;

  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: profile?.phone || "",
    address: profile?.address || "",
    description: profile?.description || "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);


    setTimeout(() => {
      setIsSaving(false);
      setToast({ message: "Đã cập nhật thông tin hồ sơ thành công!", type: "success" });
    }, 1000);
  };

  return (
    <CompanyLayout>
      <PageHeader
        title="Cài đặt hồ sơ"
        description="Quản lý thông tin công ty và cấu hình tài khoản"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">

        <div className="lg:col-span-2 space-y-6">
          <form
            onSubmit={handleSubmit}
            className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm space-y-6"
          >
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  Tên công ty
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Nhập tên công ty"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface-variant cursor-not-allowed outline-none"
                />
                <p className="text-[10px] text-on-surface-variant italic">
                  * Email đăng nhập không thể thay đổi
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="09xx xxx xxx"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Địa chỉ trụ sở
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  placeholder="Số nhà, tên đường, quận/huyện..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-on-surface-variant flex items-center gap-2">
                <Info className="w-4 h-4" />
                Giới thiệu công ty
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant bg-surface outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                placeholder="Mô tả về lịch sử, sứ mệnh hoặc các thế mạnh của công ty..."
              />
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="bg-primary hover:bg-primary-container text-white font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>


          <div className="bg-surface-container-lowest rounded-2xl p-6 border border-outline-variant shadow-sm">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2 mb-6">
              <Lock className="w-5 h-5 text-secondary" />
              Bảo mật tài khoản
            </h2>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant">
              <div>
                <p className="font-bold text-on-surface">Mật khẩu</p>
                <p className="text-sm text-on-surface-variant">
                  Thay đổi mật khẩu định kỳ để bảo vệ tài khoản
                </p>
              </div>
              <button className="bg-surface-container-high hover:bg-surface-container text-on-surface font-semibold px-6 py-2 rounded-lg transition-colors border border-outline-variant">
                Đổi mật khẩu
              </button>
            </div>
          </div>
        </div>


        <div className="space-y-6">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
            <h3 className="font-bold text-primary mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Lưu ý
            </h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Thông tin công ty của bạn sẽ được hiển thị công khai trên các trang chi tiết tour. Hãy
              đảm bảo thông tin liên hệ chính xác để khách hàng có thể dễ dàng tiếp cận.
            </p>
          </div>

          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant">
            <h3 className="font-bold text-on-surface mb-4">Trạng thái tài khoản</h3>
            <div className="flex items-center gap-3 p-3 bg-green-50 text-green-700 rounded-xl border border-green-100">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase">Đã xác thực</span>
            </div>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </CompanyLayout>
  );
}
