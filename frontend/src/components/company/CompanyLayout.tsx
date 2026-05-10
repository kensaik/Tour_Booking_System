import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Globe, Calendar, BookOpen, ChevronDown, LogOut, Menu, X, Settings } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '@/stores/authStore'

// Admin Layout for Company Dashboard
export default function CompanyLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const menuItems = [
    { path: '/company', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/company/tours', icon: Globe, label: 'Quản lý Tour' },
    { path: '/company/departures', icon: Calendar, label: 'Quản lý Lịch khởi hành' },
    { path: '/company/bookings', icon: BookOpen, label: 'Quản lý Đặt tour' },
  ]

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-surface-container text-on-surface border-r border-outline-variant">
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface line-clamp-1 leading-tight">{user?.full_name || 'Công ty'}</h1>
              <p className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Quản lý công ty</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path, item.exact)
                  ? 'bg-primary-container text-on-primary-container font-medium'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-outline-variant">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="w-full flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-surface-container-low transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shadow-sm">
                {user?.full_name?.charAt(0) || 'C'}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{user?.full_name || 'Công ty'}</p>
                <p className="text-[11px] text-on-surface-variant truncate">{user?.email}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-on-surface-variant transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {userMenuOpen && (
              <div className="absolute bottom-full left-0 w-full mb-2 bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden border border-outline-variant py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-container-low transition-colors text-sm text-on-surface">
                  <Settings className="w-4 h-4" />
                  Cài đặt
                </button>
                <div className="h-px bg-outline-variant mx-2 my-1" />
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error-container/10 transition-colors text-sm text-error font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-surface-container text-on-surface z-40 px-4 py-3 flex items-center justify-between shadow-sm border-b border-outline-variant">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2" aria-label="Mở menu">
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <h1 className="text-base font-bold text-on-surface line-clamp-1">{user?.full_name}</h1>
        </div>
        <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center text-xs font-bold">
          {user?.full_name?.charAt(0) || 'C'}
        </div>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-container text-on-surface" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <div className="flex items-center gap-2 text-primary">
                <Globe className="w-6 h-6" />
                <span className="font-bold">Hệ thống Quản lý</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} aria-label="Đóng menu">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path, item.exact)
                      ? 'bg-primary-container text-on-primary-container font-medium'
                      : 'text-on-surface-variant hover:bg-surface-container-low'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 bg-surface overflow-y-auto">{children}</main>
    </div>
  )
}
