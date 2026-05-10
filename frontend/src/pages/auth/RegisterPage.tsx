import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, Phone, ArrowLeft, CheckCircle } from "lucide-react";
import { AuthService } from "@/services/auth.service";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    setErrorMsg("");

    if (formData.password !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp");
      return;
    }

    if (!acceptTerms) {
      setErrorMsg("Vui lòng chấp nhận điều khoản sử dụng");
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.register({
        email: formData.email,
        password: formData.password,
        full_name: formData.fullName,
        phone_number: formData.phone,
        role: "guest",
      });
      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      navigate("/login");
    } catch (error) {
      const apiError = error as { response?: { data?: { message?: string } } };
      setErrorMsg(apiError.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRequirements = [
    { met: formData.password.length >= 8, text: "Ít nhất 8 ký tự" },
    { met: /[A-Z]/.test(formData.password), text: "Ít nhất 1 chữ hoa" },
    { met: /[0-9]/.test(formData.password), text: "Ít nhất 1 số" },
    {
      met: formData.password === formData.confirmPassword && formData.password.length > 0,
      text: "Mật khẩu khớp",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 py-8">
      <div className="fixed inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop"
          alt=""
          className="w-full h-full object-cover brightness-[0.3]"
        />
      </div>

      <div className="relative z-10 w-full max-w-lg min-w-[320px] sm:min-w-[480px]">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Quay lại trang chủ</span>
        </Link>

        <div className="bg-surface/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-outline-variant">
          <div className="text-center mb-8">
            <span className="text-3xl font-bold text-primary">TourGo</span>
            <h1 className="text-2xl font-bold text-on-surface mt-4">Tạo tài khoản</h1>
            <p className="text-on-surface-variant mt-2">
              Tham gia cùng chúng tôi để khám phá Việt Nam
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-error-container text-on-error-container p-3 rounded-lg text-sm">
                {errorMsg}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-on-surface mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  placeholder="Nguyễn Văn A"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your.email@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-on-surface mb-2">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="0912 345 678"
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Tạo mật khẩu"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="mt-3 space-y-1">
                {passwordRequirements.map((req, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-xs ${req.met ? "text-green-600" : "text-on-surface-variant"}`}
                  >
                    <CheckCircle className={`w-3 h-3 ${req.met ? "fill-green-600" : ""}`} />
                    <span>{req.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-on-surface mb-2"
              >
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Nhập lại mật khẩu"
                  className="w-full pl-11 pr-12 py-3 rounded-lg border border-outline-variant bg-white focus:ring-2 focus:ring-primary focus:border-primary text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              <span className="text-sm text-on-surface-variant">
                Tôi đồng ý với{" "}
                <a href="#" className="text-primary hover:text-primary/80">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-primary hover:text-primary/80">
                  Chính sách bảo mật
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Đang xử lý...</span>
                </>
              ) : (
                "Đăng ký"
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-outline-variant" />
            <span className="text-sm text-on-surface-variant">hoặc</span>
            <div className="flex-1 h-px bg-outline-variant" />
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg border border-outline-variant bg-white hover:bg-surface-container transition-colors">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-on-surface">Đăng ký với Google</span>
            </button>
          </div>

          <p className="text-center mt-6 text-on-surface-variant">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
