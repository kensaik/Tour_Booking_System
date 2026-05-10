import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import AdminDashboardPage from "./DashboardPage";

vi.mock("@/components/admin/AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/admin.service", () => ({
  AdminService: {
    getStats: vi.fn(),
    getCompanies: vi.fn(),
  },
}));

import { AdminService } from "@/services/admin.service";

const mockAdminUser = {
  id: 1,
  email: "admin@tourgo.com",
  full_name: "Admin User",
  role: "admin",
  is_active: true,
};

const mockStatsData = {
  total_revenue: 50000000,
  total_companies: 12,
  approved_companies: 9,
  total_guests: 150,
  total_tours: 45,
};

const mockCompaniesData = {
  companies: [
    {
      id: 1,
      company_name: "TourCo 1",
      total_revenue: 15000000,
      tours_count: 10,
      bookings_count: 50,
    },
    {
      id: 2,
      company_name: "TourCo 2",
      total_revenue: 12000000,
      tours_count: 8,
      bookings_count: 40,
    },
    {
      id: 3,
      company_name: "TourCo 3",
      total_revenue: 10000000,
      tours_count: 7,
      bookings_count: 35,
    },
  ],
};

describe("AdminDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useAuthStore.setState({
      user: mockAdminUser,
      isAuthenticated: true,
      token: "mock-admin-token",
    });
  });

  it("renders dashboard header", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Tổng quan hệ thống TourGo/i)).toBeInTheDocument();
  });

  it("renders stat cards with data from AdminService.getStats", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Tổng doanh thu/i)).toBeInTheDocument();
    expect(screen.getByText(/Số công ty/i)).toBeInTheDocument();
    expect(screen.getByText(/Tổng khách hàng/i)).toBeInTheDocument();
    const tourTexts = screen.getAllByText(/Tổng tour/i);
    expect(tourTexts.length).toBeGreaterThan(0);
  });

  it("renders revenue metric card with formatted value", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Tổng doanh thu/i)).toBeInTheDocument();

    expect(await screen.findByText(/50[.,]000[.,]000đ/)).toBeInTheDocument();
  });

  it("renders companies metric with approved/total count", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Số công ty/i)).toBeInTheDocument();
    expect(await screen.findByText(/9 đã duyệt/i)).toBeInTheDocument();
  });

  it("renders guest count metric", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Tổng doanh thu/i);
    expect(screen.getByText(/Tổng khách hàng/i)).toBeInTheDocument();
  });

  it("renders tours count metric", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Tổng doanh thu/i);
    const tourTexts = screen.getAllByText(/Tổng tour/i);
    expect(tourTexts.length).toBeGreaterThan(0);
  });

  it("renders sub-stats with pending companies highlight", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Tổng doanh thu/i);
    expect(screen.getByText(/Công ty mới/i)).toBeInTheDocument();
  });

  it("renders top companies section with sorted data", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Top công ty/i)).toBeInTheDocument();

    expect(await screen.findByText(/TourCo 1/)).toBeInTheDocument();
  });

  it("renders quick actions section with navigation links", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Thao tác nhanh/i)).toBeInTheDocument();
    expect(await screen.findByText(/Quản lý điểm đến/i)).toBeInTheDocument();
    expect(await screen.findByText(/Duyệt công ty/i)).toBeInTheDocument();
  });

  it("handles empty companies data gracefully", async () => {
    vi.mocked(AdminService.getStats).mockResolvedValue(mockStatsData);
    vi.mocked(AdminService.getCompanies).mockResolvedValue({ companies: [] });

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Chưa có công ty nào/i)).toBeInTheDocument();
  });

  it("handles stats with zero values", async () => {
    const zeroStats = {
      total_revenue: 0,
      total_companies: 0,
      approved_companies: 0,
      total_guests: 0,
      total_tours: 0,
    };
    vi.mocked(AdminService.getStats).mockResolvedValue(zeroStats);
    vi.mocked(AdminService.getCompanies).mockResolvedValue({ companies: [] });

    renderWithProviders(<AdminDashboardPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Tổng doanh thu/i)).toBeInTheDocument();
    expect(await screen.findByText(/0đ/)).toBeInTheDocument();
  });
});
