import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import ToursPage from "./ToursPage";

vi.mock("@/components/company/CompanyLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/company.service", () => ({
  CompanyService: {
    getMyTours: vi.fn(),
    deleteTour: vi.fn(),
    updateTour: vi.fn(),
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

const mockToursData = {
  tours: [
    {
      id: 1,
      name: "Tour Đà Lạt 3 ngày",
      destination: "Đà Lạt",
      price: 2500000,
      status: "draft",
      image_url: "https://example.com/tour1.jpg",
    },
    {
      id: 2,
      name: "Tour Hạ Long 4 ngày",
      destination: "Hạ Long",
      price: 3500000,
      status: "active",
      image_url: "https://example.com/tour2.jpg",
    },
    {
      id: 3,
      name: "Tour Sapa 5 ngày",
      destination: "Sapa",
      price: 4000000,
      status: "active",
      image_url: "https://example.com/tour3.jpg",
    },
  ],
};

describe("CompanyToursPage", () => {
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
    vi.mocked(CompanyService.getMyTours).mockResolvedValue(mockToursData);
  });

  it("renders page header and add tour button", async () => {
    renderWithProviders(<ToursPage />);

    expect(await screen.findByText(/Quản lý Tour/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Thêm Tour mới/i })).toBeInTheDocument();
  });

  it("displays search input and status filter dropdown", async () => {
    renderWithProviders(<ToursPage />);

    expect(
      await screen.findByPlaceholderText(/Tìm kiếm tour theo tên hoặc địa điểm/i),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Tất cả trạng thái/i)).toBeInTheDocument();
  });

  it("renders all tours in table with name, destination, price, status", async () => {
    renderWithProviders(<ToursPage />);

    expect(await screen.findByText(/Tour Đà Lạt 3 ngày/)).toBeInTheDocument();
    expect(screen.getByText(/Tour Hạ Long 4 ngày/)).toBeInTheDocument();
    expect(screen.getByText(/Tour Sapa 5 ngày/)).toBeInTheDocument();
  });

  it("filters tours by search query (name)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const searchInput = await screen.findByPlaceholderText(/Tìm kiếm tour/i);
    await user.type(searchInput, "Đà Lạt");

    expect(screen.getByText(/Tour Đà Lạt 3 ngày/)).toBeInTheDocument();
    expect(screen.queryByText(/Tour Hạ Long 4 ngày/)).not.toBeInTheDocument();
  });

  it("filters tours by status dropdown", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const statusSelect = await screen.findByDisplayValue(/Tất cả trạng thái/i);
    await user.selectOptions(statusSelect, "draft");

    expect(screen.getByText(/Tour Đà Lạt 3 ngày/)).toBeInTheDocument();
    expect(screen.queryByText(/Tour Hạ Long 4 ngày/)).not.toBeInTheDocument();
  });

  it("shows delete confirm modal and calls CompanyService.deleteTour on confirm", async () => {
    vi.mocked(CompanyService.deleteTour).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    // Find and click delete button for first tour
    const deleteButtons = await screen.findAllByTitle(/Xóa tour/i);
    await user.click(deleteButtons[0]);

    // Confirm modal should appear with confirmation message
    expect(
      await screen.findByText(/Bạn có chắc chắn muốn xóa tour này không/i),
    ).toBeInTheDocument();

    // Click confirm button
    const confirmBtn = screen.getByRole("button", { name: /Xóa ngay/i });
    await user.click(confirmBtn);

    expect(CompanyService.deleteTour).toHaveBeenCalledWith(1);
  });

  it("shows publish confirm modal for draft tours", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const publishButtons = await screen.findAllByTitle(/Duyệt tour/i);
    await user.click(publishButtons[0]);

    expect(await screen.findByText(/Duyệt tour này sẽ giúp khách hàng/i)).toBeInTheDocument();
  });

  it("calls CompanyService.updateTour with status=active on publish confirm", async () => {
    vi.mocked(CompanyService.updateTour).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const publishButtons = await screen.findAllByTitle(/Duyệt tour/i);
    await user.click(publishButtons[0]);

    const confirmBtn = screen.getByRole("button", { name: /Duyệt ngay/i });
    await user.click(confirmBtn);

    expect(CompanyService.updateTour).toHaveBeenCalledWith(1, { status: "active" });
  });

  it("shows edit link for all tours", async () => {
    renderWithProviders(<ToursPage />);

    const editLinks = await screen.findAllByTitle(/Sửa tour/i);
    expect(editLinks.length).toBeGreaterThan(0);
  });

  it("shows view link for all tours", async () => {
    renderWithProviders(<ToursPage />);

    const viewLinks = await screen.findAllByTitle(/Xem chi tiết/i);
    expect(viewLinks.length).toBeGreaterThan(0);
  });

  it("displays empty state when no tours match search", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const searchInput = await screen.findByPlaceholderText(/Tìm kiếm tour/i);
    await user.type(searchInput, "Nonexistent Tour");

    expect(await screen.findByText(/Không tìm thấy tour nào/i)).toBeInTheDocument();
  });

  it("shows success toast after deleting tour", async () => {
    vi.mocked(CompanyService.deleteTour).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const deleteButtons = await screen.findAllByTitle(/Xóa tour/i);
    await user.click(deleteButtons[0]);

    const confirmBtn = screen.getByRole("button", { name: /Xóa ngay/i });
    await user.click(confirmBtn);

    expect(await screen.findByText(/Xóa tour thành công/i)).toBeInTheDocument();
  });

  it("shows success toast after publishing tour", async () => {
    vi.mocked(CompanyService.updateTour).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<ToursPage />);

    const publishButtons = await screen.findAllByTitle(/Duyệt tour/i);
    await user.click(publishButtons[0]);

    const confirmBtn = screen.getByRole("button", { name: /Duyệt ngay/i });
    await user.click(confirmBtn);

    expect(await screen.findByText(/Tour đã được duyệt/i)).toBeInTheDocument();
  });
});
