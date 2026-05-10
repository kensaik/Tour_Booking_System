import { Mail, Phone, MapPin } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <h1 className="text-4xl font-bold text-on-surface mb-8 text-center">
          Liên hệ với chúng tôi
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

          <div className="bg-surface p-8 rounded-xl shadow-sm border border-outline-variant">
            <h2 className="text-2xl font-semibold text-on-surface mb-6">Thông tin liên hệ</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <MapPin className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-medium text-on-surface">Địa chỉ</h3>
                  <p className="text-on-surface-variant">123 Đường Cầu Giấy, Hà Nội, Việt Nam</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-medium text-on-surface">Điện thoại</h3>
                  <p className="text-on-surface-variant">+84 123 456 789</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail className="w-6 h-6 text-primary shrink-0" />
                <div>
                  <h3 className="font-medium text-on-surface">Email</h3>
                  <p className="text-on-surface-variant">support@tourgo.vn</p>
                </div>
              </div>
            </div>
          </div>


          <div className="bg-surface p-8 rounded-xl shadow-sm border border-outline-variant">
            <h2 className="text-2xl font-semibold text-on-surface mb-6">Gửi tin nhắn</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Họ tên</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Nhập họ tên của bạn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Nhập email của bạn"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-on-surface mb-1">Nội dung</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-outline-variant focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Bạn cần hỗ trợ gì?"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-white font-medium py-3 rounded-lg hover:bg-primary-container transition-colors"
              >
                Gửi ngay
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
