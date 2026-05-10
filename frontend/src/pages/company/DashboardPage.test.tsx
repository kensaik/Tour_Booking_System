import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import DashboardPage from "./DashboardPage";

vi.mock("@/components/company/CompanyLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/company.service", () => ({
  CompanyService: {
    getCompanyBookings: vi.fn(),
    getMyTours: vi.fn(),
    getCompanyDepartures: vi.fn(),
  },
}));

import { CompanyService } from "@/services/company.service";

const mockUser = {
  id: 1,
  email: "company@example.com",
  full_name: "Tour Company Ltd",
  role: "company",
  is_active: true,
  company_profile: {
    is_approved: true,
  },
};

const mockBookingsData = {
  bookings: [
    {
      id: 1,
      tour_id: 1,
      user_id: 10,
      guest_name: "Nguyễn A",
      booking_status: "confirmed",
      payment_status: "fully_paid",
      total_price: 5000000,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      tour_id: 1,
      user_id: 11,
      guest_name: "Trần B",
      booking_status: "pending",
      payment_status: "deposit_paid",
      total_price: 3000000,
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ],
};

const mockToursData = {
  tours: [
    {
      id: 1,
      name: "Tour Đà Lạt",
      destination: "Đà Lạt",
      price: 2500000,
      status: "active",
    },
    {
      id: 2,
      name: "Tour Hạ Long",
      destination: "Hạ Long",
      price: 3500000,
      status: "approved",
    },
  ],
};

const mockDeparturesData = {
  departures: [
    {
      id: 1,
      tour_id: 1,
      tour: { name: "Tour Đà Lạt" },
      start_date: new Date(Date.now() + 86400000 * 5).toISOString(),
      total_seats: 20,
      available_seats: 5,
    },
  ],
};

describe("CompanyDashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store before setting new state
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
  });

  it("renders page header and KPI cards when data loads", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/Dashboard/i)).toBeInTheDocument();
    expect(await screen.findByText(/Tổng doanh thu/i)).toBeInTheDocument();
    const bookingCards = await screen.findAllByText(/Đơn đặt tour/i);
    expect(bookingCards.length).toBeGreaterThan(0);
    expect(screen.getByText(/Khách hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Tour hoạt động/i)).toBeInTheDocument();
  });

  it("displays total revenue metric", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    // Revenue metric is displayed
    expect(await screen.findByText(/Tổng doanh thu/i)).toBeInTheDocument();
  });

  it("displays total bookings count", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    // Bookings card displays
    const bookingCards = await screen.findAllByText(/Đơn đặt tour/i);
    expect(bookingCards.length).toBeGreaterThan(0);
  });

  it("displays unique customer count", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    // Customer metric is displayed
    expect(await screen.findByText(/Khách hàng/i)).toBeInTheDocument();
  });

  it("displays active/approved tours count", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    // Tours metric is displayed
    expect(await screen.findByText(/Tour hoạt động/i)).toBeInTheDocument();
  });

  it("renders recent bookings section with data", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/Đơn đặt tour gần đây/i)).toBeInTheDocument();
    expect(await screen.findByText(/Nguyễn A/)).toBeInTheDocument();
  });

  it("renders upcoming departures section", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/Lịch khởi hành sắp tới/i)).toBeInTheDocument();
  });

  it("shows empty message when no recent bookings", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue({ bookings: [] });
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue(mockDeparturesData);

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/Chưa có đơn đặt tour nào/i)).toBeInTheDocument();
  });

  it("shows empty message when no upcoming departures", async () => {
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
    vi.mocked(CompanyService.getCompanyDepartures).mockResolvedValue({ departures: [] });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText(/Chưa có lịch khởi hành sắp tới/i)).toBeInTheDocument();
  });
});
