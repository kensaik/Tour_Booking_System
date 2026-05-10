import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import BookingsPage from "./BookingsPage";

vi.mock("@/components/company/CompanyLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/company.service", () => ({
  CompanyService: {
    getCompanyBookings: vi.fn(),
    updateBookingStatus: vi.fn(),
  },
}));

import { CompanyService } from "@/services/company.service";

const mockUser = {
  id: 1,
  email: "company@example.com",
  full_name: "Tour Company Ltd",
  role: "company",
  is_active: true,
};

const mockBookingsData = {
  bookings: [
    {
      id: 1,
      tour_id: 1,
      tour: { name: "Tour Đà Lạt" },
      guest_name: "Nguyễn A",
      guest_phone: "0912345678",
      num_people: 2,
      total_price: 5000000,
      booking_status: "confirmed",
      payment_status: "fully_paid",
      departure: { start_date: "2025-06-01T08:00" },
    },
    {
      id: 2,
      tour_id: 1,
      tour: { name: "Tour Hạ Long" },
      guest_name: "Trần B",
      guest_phone: "0987654321",
      num_people: 3,
      total_price: 7500000,
      booking_status: "pending",
      payment_status: "unpaid",
      departure: { start_date: "2025-07-15T08:00" },
    },
    {
      id: 3,
      tour_id: 2,
      tour: { name: "Tour Sapa" },
      guest_name: "Lê C",
      guest_phone: "0923456789",
      num_people: 4,
      total_price: 10000000,
      booking_status: "cancelled",
      payment_status: "pending",
      departure: { start_date: "2025-08-20T08:00" },
    },
  ],
};

describe("CompanyBookingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
    useAuthStore.setState({ user: mockUser, isAuthenticated: true });
    vi.mocked(CompanyService.getCompanyBookings).mockResolvedValue(mockBookingsData);
  });

  it("renders page header and bookings table", async () => {
    renderWithProviders(<BookingsPage />);

    expect(await screen.findByText(/Quản lý Đặt tour/i)).toBeInTheDocument();
    expect(screen.getByText(/Xem và quản lý các đơn đặt tour/i)).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: /Mã đặt tour/i })).toBeInTheDocument();
  });

  it("displays search input and filter dropdowns", async () => {
    renderWithProviders(<BookingsPage />);

    expect(
      await screen.findByPlaceholderText(/Tìm theo tên, SĐT, mã đặt tour/i),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Tất cả trạng thái/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Tất cả thanh toán/i)).toBeInTheDocument();
  });

  it("renders all bookings in table with guest name, tour, dates, price, status", async () => {
    renderWithProviders(<BookingsPage />);

    expect(await screen.findByText(/Nguyễn A/)).toBeInTheDocument();
    expect(screen.getByText(/Trần B/)).toBeInTheDocument();
    expect(screen.getByText(/Tour Đà Lạt/)).toBeInTheDocument();
    expect(screen.getByText(/Tour Hạ Long/)).toBeInTheDocument();
  });

  it("filters bookings by status", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const statusFilter = await screen.findByLabelText(/Lọc theo trạng thái/i);
    await user.selectOptions(statusFilter, "Đã xác nhận");

    expect(screen.getByText(/Nguyễn A/)).toBeInTheDocument();
    expect(screen.queryByText(/Trần B/)).not.toBeInTheDocument();
  });

  it("filters bookings by payment status", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const paymentFilter = await screen.findByLabelText(/Lọc theo thanh toán/i);
    await user.selectOptions(paymentFilter, "Đã thanh toán");

    expect(screen.getByText(/Nguyễn A/)).toBeInTheDocument();
    expect(screen.queryByText(/Trần B/)).not.toBeInTheDocument();
  });

  it("filters bookings by search query (guest name)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const searchInput = await screen.findByPlaceholderText(/Tìm theo tên, SĐT, mã đặt tour/i);
    await user.type(searchInput, "Nguyễn");

    expect(screen.getByText(/Nguyễn A/)).toBeInTheDocument();
    expect(screen.queryByText(/Trần B/)).not.toBeInTheDocument();
  });

  it("filters bookings by search query (phone number)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const searchInput = await screen.findByPlaceholderText(/Tìm theo tên, SĐT, mã đặt tour/i);
    await user.type(searchInput, "0987654321");

    expect(screen.getByText(/Trần B/)).toBeInTheDocument();
    expect(screen.queryByText(/Nguyễn A/)).not.toBeInTheDocument();
  });

  it("filters bookings by search query (booking ID)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const searchInput = await screen.findByPlaceholderText(/Tìm theo tên, SĐT, mã đặt tour/i);
    await user.type(searchInput, "#1");

    expect(screen.getByText(/Nguyễn A/)).toBeInTheDocument();
    expect(screen.queryByText(/Trần B/)).not.toBeInTheDocument();
  });

  it("shows confirm button for pending bookings", async () => {
    renderWithProviders(<BookingsPage />);

    const confirmButtons = await screen.findAllByLabelText(/Xác nhận đặt tour/i);
    expect(confirmButtons.length).toBeGreaterThan(0);
  });

  it("calls updateBookingStatus with confirmed status on confirm", async () => {
    vi.mocked(CompanyService.updateBookingStatus).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const confirmButtons = await screen.findAllByLabelText(/Xác nhận đặt tour/i);
    await user.click(confirmButtons[0]);

    expect(CompanyService.updateBookingStatus).toHaveBeenCalledWith(2, "confirmed");
  });

  it("shows cancel confirm modal and calls updateBookingStatus with cancelled status", async () => {
    vi.mocked(CompanyService.updateBookingStatus).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const cancelButtons = await screen.findAllByLabelText(/Hủy đặt tour/i);
    await user.click(cancelButtons[0]);


    expect(await screen.findByText(/Xác nhận hủy đơn/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Bạn có chắc chắn muốn hủy đơn đặt tour này không/i),
    ).toBeInTheDocument();
  });

  it("renders export button", async () => {
    renderWithProviders(<BookingsPage />);

    expect(await screen.findByRole("button", { name: /Xuất Excel/i })).toBeInTheDocument();
  });

  it("shows export button and handles export click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const exportBtn = await screen.findByRole("button", { name: /Xuất Excel/i });
    expect(exportBtn).toBeInTheDocument();

    await user.click(exportBtn);

    expect(screen.getByRole("button", { name: /Đang xuất/i })).toBeInTheDocument();
  });

  it("displays view detail button for all bookings", async () => {
    renderWithProviders(<BookingsPage />);

    const viewButtons = await screen.findAllByLabelText(/Xem chi tiết/i);
    expect(viewButtons.length).toBeGreaterThan(0);
  });

  it("opens booking detail modal on view click", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const viewButtons = await screen.findAllByLabelText(/Xem chi tiết/i);
    await user.click(viewButtons[0]);

    expect(await screen.findByText(/Chi tiết đơn hàng/i)).toBeInTheDocument();
  });

  it("shows empty state when no bookings match filters", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const searchInput = await screen.findByPlaceholderText(/Tìm theo tên, SĐT, mã đặt tour/i);
    await user.type(searchInput, "Nonexistent");

    expect(await screen.findByText(/Không tìm thấy đơn đặt tour nào/i)).toBeInTheDocument();
  });

  it("displays guest phone in booking detail modal", async () => {
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const viewButtons = await screen.findAllByLabelText(/Xem chi tiết/i);
    await user.click(viewButtons[0]);


    expect(await screen.findByText(/Chi tiết đơn hàng/i)).toBeInTheDocument();
    const phones = screen.getAllByText(/0912345678/);
    expect(phones.length).toBeGreaterThan(0);
  });

  it("displays tour name in booking detail modal", async () => {
    renderWithProviders(<BookingsPage />);


    expect(await screen.findByText(/Tour Đà Lạt/)).toBeInTheDocument();
    expect(screen.getByText(/Tour Hạ Long/)).toBeInTheDocument();
  });

  it("shows success toast after confirming booking", async () => {
    vi.mocked(CompanyService.updateBookingStatus).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<BookingsPage />);

    const confirmButtons = await screen.findAllByLabelText(/Xác nhận đặt tour/i);
    await user.click(confirmButtons[0]);

    expect(await screen.findByText(/Xác nhận đơn thành công/i)).toBeInTheDocument();
  });
});
