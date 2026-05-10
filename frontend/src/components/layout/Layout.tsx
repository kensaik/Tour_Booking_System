import { Outlet, Link, useLocation } from "react-router-dom";
import { Menu, X, User as UserIcon, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

const NAV_LINKS = [
  { path: "/", label: "Trang chủ" },
  { path: "/tours", label: "Tour" },
  { path: "/contact", label: "Liên hệ" },
];

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 w-full z-50 bg-surface shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-primary">TourGo</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`font-body-md text-base transition-all duration-200 ${
                  isActive(link.path)
                    ? "text-primary font-bold border-b-2 border-primary"
                    : "text-on-surface-variant hover:text-primary border-transparent"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                    {(user.full_name || "U").charAt(0)}
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-on-surface">
                    {user.full_name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-on-surface-variant transition-transform ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-outline-variant rounded-xl shadow-lg py-2 z-[60]">
                    <div className="px-4 py-2 border-b border-outline-variant mb-2">
                      <p className="text-xs text-on-surface-variant">Đăng nhập với</p>
                      <p className="text-sm font-semibold text-on-surface truncate">{user.email}</p>
                    </div>
                    {user.role.toLowerCase() === "admin" && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Quản trị hệ thống
                      </Link>
                    )}
                    {user.role.toLowerCase() === "company" && (
                      <Link
                        to="/company"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserIcon className="w-4 h-4" />
                        Quản lý Tour
                      </Link>
                    )}
                    <Link
                      to="/my-trips"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Chuyến đi của tôi
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error hover:bg-error-container transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-primary hover:bg-primary-container text-white font-medium text-sm px-6 py-2 rounded-lg shadow-sm transition-all duration-200"
              >
                Đăng nhập
              </Link>
            )}

            <button
              className="md:hidden p-2 text-on-surface"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden bg-surface border-t border-outline-variant px-4 py-4 space-y-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`block font-body-md ${
                  isActive(link.path) ? "text-primary font-bold" : "text-on-surface-variant"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <Link
                to="/login"
                className="block bg-primary text-white text-center font-medium py-2 rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Đăng nhập
              </Link>
            )}
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="w-full bg-error text-white text-center font-medium py-2 rounded-lg"
              >
                Đăng xuất
              </button>
            )}
          </nav>
        )}
      </header>

      <main className="pt-0">
        <Outlet />
      </main>

      <footer className="bg-surface-container-low border-t border-outline-variant">
        <div className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-12 flex flex-col md:flex-row justify-between gap-12">
          <div className="w-full md:w-1/3">
            <span className="text-2xl font-bold text-primary mb-4 block">TourGo</span>
            <p className="text-base text-on-surface-variant mb-6">
              © {new Date().getFullYear()} TourGo. Tất cả quyền được bảo lưu. Khám phá thế giới cùng
              niềm tin tuyệt đối.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                </svg>
              </a>
              <a href="#" className="text-secondary hover:text-primary transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="w-full md:w-2/3 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-on-surface uppercase tracking-wider mb-2">
                Công ty
              </span>
              <a
                href="#"
                className="text-base text-on-surface-variant hover:text-secondary transition-all duration-200"
              >
                Về chúng tôi
              </a>
              <a
                href="#"
                className="text-base text-on-surface-variant hover:text-secondary transition-all duration-200"
              >
                Tin tức
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-on-surface uppercase tracking-wider mb-2">
                Chính sách
              </span>
              <a
                href="#"
                className="text-base text-on-surface-variant hover:text-secondary transition-all duration-200"
              >
                Điều khoản & Điều kiện
              </a>
              <a
                href="#"
                className="text-base text-on-surface-variant hover:text-secondary transition-all duration-200"
              >
                Chính sách bảo mật
              </a>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-on-surface uppercase tracking-wider mb-2">
                Hỗ trợ
              </span>
              <a
                href="#"
                className="text-base text-on-surface-variant hover:text-secondary transition-all duration-200"
              >
                Câu hỏi thường gặp
              </a>
              <a
                href="#"
                className="text-base text-on-surface-variant hover:text-secondary transition-all duration-200"
              >
                Hỗ trợ khách hàng
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
