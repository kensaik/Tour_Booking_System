import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import AdminCompaniesPage from "./CompaniesPage";

vi.mock("@/components/admin/AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/admin.service", () => ({
  AdminService: {
    getCompanies: vi.fn(),
    approveCompany: vi.fn(),
    toggleStatus: vi.fn(),
    createCompany: vi.fn(),
    updateCommission: vi.fn(),
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

const mockCompaniesData = {
  companies: [
    {
      id: 1,
      company_name: "TourCo Approved",
      email: "tourco1@example.com",
      commission_rate: 10,
      is_approved: true,
      is_active: true,
      created_at: "2026-03-01T10:00:00Z",
    },
    {
      id: 2,
      company_name: "TourCo Pending",
      email: "tourco2@example.com",
      commission_rate: 0,
      is_approved: false,
      is_active: true,
      created_at: "2026-04-15T14:30:00Z",
    },
    {
      id: 3,
      company_name: "TourCo Locked",
      email: "tourco3@example.com",
      commission_rate: 8,
      is_approved: true,
      is_active: false,
      created_at: "2026-02-20T09:15:00Z",
    },
  ],
};

describe("AdminCompaniesPage", () => {
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

  it("renders page header and title", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Quản lý Công ty/i)).toBeInTheDocument();
    expect(screen.getByText(/Danh sách công ty du lịch/i)).toBeInTheDocument();
  });

  it("renders companies table with pending and approved companies", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/TourCo Approved/i)).toBeInTheDocument();
    expect(await screen.findByText(/TourCo Pending/i)).toBeInTheDocument();
  });

  it("filters companies by search term", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);
    const user = userEvent.setup();

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm công ty/i);
    await user.type(searchInput, "Pending");

    expect(await screen.findByText(/TourCo Pending/i)).toBeInTheDocument();
    expect(screen.queryByText(/TourCo Approved/i)).not.toBeInTheDocument();
  });

  it("filters companies by approval status", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);
    const user = userEvent.setup();

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    const statusSelect = screen.getByDisplayValue(/Tất cả trạng thái/i);
    await user.selectOptions(statusSelect, "pending");

    expect(await screen.findByText(/TourCo Pending/i)).toBeInTheDocument();
    expect(screen.queryByText(/TourCo Approved/i)).not.toBeInTheDocument();
  });

  it("displays company email in contact column", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/tourco1@example.com/i)).toBeInTheDocument();
    expect(await screen.findByText(/tourco2@example.com/i)).toBeInTheDocument();
  });

  it("displays commission rate for each company", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findAllByText(/10%/)).toBeDefined();
    expect(await screen.findAllByText(/8%/)).toBeDefined();
  });

  it("shows approve button for pending companies", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Pending/i);
    const approveButtons = screen.getAllByTitle(/Duyệt công ty/i);
    expect(approveButtons.length).toBeGreaterThan(0);
  });

  it("calls approveCompany when approve button clicked", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);
    vi.mocked(AdminService.approveCompany).mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Pending/i);
    const approveButtons = screen.getAllByTitle(/Duyệt công ty/i);
    await user.click(approveButtons[0]);

    expect(AdminService.approveCompany).toHaveBeenCalledWith(2);
  });

  it("shows lock/unlock button for approved companies", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    const lockButtons = screen.getAllByTitle(/Khóa công ty/i);
    expect(lockButtons.length).toBeGreaterThan(0);
  });

  it("calls toggleStatus when lock button clicked for active company", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);
    vi.mocked(AdminService.toggleStatus).mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    const lockButtons = screen.getAllByTitle(/Khóa công ty/i);
    await user.click(lockButtons[0]);

    expect(AdminService.toggleStatus).toHaveBeenCalledWith(1);
  });

  it("shows unlock button for locked companies", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Locked/i);
    const unlockButtons = screen.getAllByTitle(/Mở khóa công ty/i);
    expect(unlockButtons.length).toBeGreaterThan(0);
  });

  it("renders view and edit action buttons", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    expect(screen.getAllByTitle(/Xem chi tiết/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(/Chỉnh sửa/i).length).toBeGreaterThan(0);
  });

  it("displays company status badge as pending or approved", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    await screen.findByText(/TourCo Pending/i);

    expect(screen.getAllByText(/Chờ duyệt|Đã duyệt/i).length).toBeGreaterThan(0);
  });

  it("displays 'Bị khóa' badge for inactive companies", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Locked/i);
    expect(screen.getByText(/Bị khóa/i)).toBeInTheDocument();
  });

  it("displays add company button", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);
    expect(screen.getByRole("button", { name: /Thêm Công ty/i })).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    vi.mocked(AdminService.getCompanies).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockCompaniesData), 100);
        }),
    );

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(screen.getByText(/Đang tải danh sách công ty/i)).toBeInTheDocument();
  });

  it("shows error state when query fails", async () => {
    vi.mocked(AdminService.getCompanies).mockRejectedValue(new Error("API Error"));

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Lỗi tải danh sách/i)).toBeInTheDocument();
  });

  it("renders join date for each company", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Approved/i);

    const dateTexts = screen.getAllByText(/2026/);
    expect(dateTexts.length).toBeGreaterThan(0);
  });

  it("shows pending badge for unapproved companies in table", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue(mockCompaniesData);

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/TourCo Pending/i);

    expect(screen.getAllByText(/Chờ duyệt/i).length).toBeGreaterThan(0);
  });

  it("handles empty companies list gracefully", async () => {
    vi.mocked(AdminService.getCompanies).mockResolvedValue({ companies: [] });

    renderWithProviders(<AdminCompaniesPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });


    expect(await screen.findByText(/Quản lý Công ty/i)).toBeInTheDocument();

    expect(screen.queryByText(/TourCo/)).not.toBeInTheDocument();
  });
});
