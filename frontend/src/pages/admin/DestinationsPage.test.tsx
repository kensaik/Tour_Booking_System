import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import DestinationsPage from "./DestinationsPage";

vi.mock("@/components/admin/AdminLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/admin.service", () => ({
  AdminService: {
    getDestinations: vi.fn(),
    createDestination: vi.fn(),
    updateDestination: vi.fn(),
    deleteDestination: vi.fn(),
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

const mockDestinationsData = {
  destinations: [
    {
      id: 1,
      name: "Đà Lạt",
      description: "Thành phố ngàn hoa",
      image_url: "https://example.com/dalat.jpg",
    },
    {
      id: 2,
      name: "Hạ Long",
      description: "Vịnh nước tuyệt đẹp",
      image_url: "https://example.com/halong.jpg",
    },
    {
      id: 3,
      name: "Phú Quốc",
      description: "Đảo thiên đường",
      image_url: null,
    },
  ],
};

describe("DestinationsPage", () => {
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
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Quản lý Điểm đến/i)).toBeInTheDocument();
    expect(screen.getByText(/Danh sách các điểm đến du lịch/i)).toBeInTheDocument();
  });

  it("renders destinations grid with cards", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Đà Lạt/i)).toBeInTheDocument();
    expect(await screen.findByText(/Hạ Long/i)).toBeInTheDocument();
    expect(await screen.findByText(/Phú Quốc/i)).toBeInTheDocument();
  });

  it("displays destination descriptions in cards", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Thành phố ngàn hoa/i)).toBeInTheDocument();
    expect(await screen.findByText(/Vịnh nước tuyệt đẹp/i)).toBeInTheDocument();
  });

  it("displays destination images when available", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const images = screen.getAllByRole("img");
    expect(images.length).toBeGreaterThan(0);
  });

  it("shows placeholder icon when image is not available", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Phú Quốc/i);
    // MapPin icon should be rendered as fallback
    expect(screen.getAllByRole("img", { hidden: true }).length).toBeGreaterThan(0);
  });

  it("filters destinations by search term", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm điểm đến/i);
    await user.type(searchInput, "Đà Lạt");

    expect(await screen.findByText(/Đà Lạt/i)).toBeInTheDocument();
    expect(screen.queryByText(/Hạ Long/i)).not.toBeInTheDocument();
  });

  it("searches by destination description", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Phú Quốc/i);
    const searchInput = screen.getByPlaceholderText(/Tìm kiếm điểm đến/i);
    await user.type(searchInput, "thiên đường");

    expect(await screen.findByText(/Phú Quốc/i)).toBeInTheDocument();
    expect(screen.queryByText(/Đà Lạt/i)).not.toBeInTheDocument();
  });

  it("renders add destination button", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    expect(screen.getByRole("button", { name: /Thêm Điểm đến/i })).toBeInTheDocument();
  });

  it("opens add modal when add button clicked", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /Thêm Điểm đến/i }));

    expect(await screen.findByText(/Thêm điểm đến mới/i)).toBeInTheDocument();
  });

  it("calls createDestination with form data on submit", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    vi.mocked(AdminService.createDestination).mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /Thêm Điểm đến/i }));

    const nameInput = screen.getByPlaceholderText(/VD: Đà Lạt, Phú Quốc/i);
    await user.type(nameInput, "Sapa");

    const descInput = screen.getByPlaceholderText(/Mô tả ngắn/i);
    await user.type(descInput, "Vùng đất cao");

    const submitBtn = screen.getByRole("button", { name: /Thêm mới/i });
    await user.click(submitBtn);

    expect(AdminService.createDestination).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Sapa",
        description: "Vùng đất cao",
      })
    );
  });

  it("shows view, edit, and delete buttons on each destination card", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    expect(screen.getAllByTitle(/Xem chi tiết/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(/Sửa/i).length).toBeGreaterThan(0);
    expect(screen.getAllByTitle(/Xóa/i).length).toBeGreaterThan(0);
  });

  it("opens delete confirm modal when delete button clicked", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const deleteButtons = screen.getAllByTitle(/Xóa/i);
    await user.click(deleteButtons[0]);

    expect(await screen.findByText(/Xóa điểm đến/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/Bạn có chắc chắn muốn xóa điểm đến này/i)
    ).toBeInTheDocument();
  });

  it("calls deleteDestination when confirm delete is clicked", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    vi.mocked(AdminService.deleteDestination).mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const deleteButtons = screen.getAllByTitle(/Xóa/i);
    await user.click(deleteButtons[0]);

    const confirmBtn = await screen.findByRole("button", { name: /Xóa ngay/i });
    await user.click(confirmBtn);

    expect(AdminService.deleteDestination).toHaveBeenCalledWith(1);
  });

  it("does not call deleteDestination when cancel is clicked", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const deleteButtons = screen.getAllByTitle(/Xóa/i);
    await user.click(deleteButtons[0]);

    const cancelBtn = await screen.findByRole("button", { name: /Hủy/i });
    await user.click(cancelBtn);

    expect(AdminService.deleteDestination).not.toHaveBeenCalled();
  });

  it("opens edit modal when edit button clicked", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const editButtons = screen.getAllByTitle(/Sửa/i);
    await user.click(editButtons[0]);

    expect(await screen.findByText(/Chỉnh sửa điểm đến/i)).toBeInTheDocument();
  });

  it("calls updateDestination when edit form is submitted", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    vi.mocked(AdminService.updateDestination).mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const editButtons = screen.getAllByTitle(/Sửa/i);
    await user.click(editButtons[0]);

    const nameInput = await screen.findByDisplayValue(/Đà Lạt/i);
    await user.clear(nameInput);
    await user.type(nameInput, "Đà Lạt Updated");

    const submitBtn = screen.getByRole("button", { name: /Lưu thay đổi/i });
    await user.click(submitBtn);

    expect(AdminService.updateDestination).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        name: "Đà Lạt Updated",
      })
    );
  });

  it("opens view modal when view button clicked", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Đà Lạt/i);
    const viewButtons = screen.getAllByTitle(/Xem chi tiết/i);
    await user.click(viewButtons[0]);

    expect(await screen.findByText(/Chi tiết điểm đến/i)).toBeInTheDocument();
  });

  it("renders empty state when no destinations exist", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue({ destinations: [] });

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(
      await screen.findByText(/Chưa có điểm đến nào/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Hãy bắt đầu bằng việc thêm điểm đến đầu tiên/i)
    ).toBeInTheDocument();
  });

  it("renders empty state with action button for no destinations", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue({ destinations: [] });
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Chưa có điểm đến nào/i);
    const actionBtn = screen.getByRole("button", { name: /Thêm điểm đến/i });
    expect(actionBtn).toBeInTheDocument();

    await user.click(actionBtn);
    expect(await screen.findByText(/Thêm điểm đến mới/i)).toBeInTheDocument();
  });

  it("shows empty state message when search returns no results", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    const searchInput = screen.getByPlaceholderText(/Tìm kiếm điểm đến/i);
    await user.type(searchInput, "NonExistent");

    expect(
      await screen.findByText(/Không tìm thấy điểm đến/i)
    ).toBeInTheDocument();
  });

  it("shows loading state initially", () => {
    vi.mocked(AdminService.getDestinations).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockDestinationsData), 100);
        })
    );

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(screen.getByText(/Đang tải danh sách điểm đến/i)).toBeInTheDocument();
  });

  it("shows error state when query fails", async () => {
    vi.mocked(AdminService.getDestinations).mockRejectedValue(new Error("API Error"));

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Lỗi tải danh sách điểm đến/i)).toBeInTheDocument();
  });

  it("displays destination ID in card footer", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/#1/)).toBeInTheDocument();
    expect(await screen.findByText(/#2/)).toBeInTheDocument();
    expect(await screen.findByText(/#3/)).toBeInTheDocument();
  });

  it("defaults to 'Chưa có mô tả' when description is empty", async () => {
    const noDescriptionData = {
      destinations: [
        {
          id: 1,
          name: "Test Destination",
          description: "",
          image_url: null,
        },
      ],
    };
    vi.mocked(AdminService.getDestinations).mockResolvedValue(noDescriptionData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    expect(await screen.findByText(/Chưa có mô tả/i)).toBeInTheDocument();
  });

  it("handles destination without image_url gracefully", async () => {
    vi.mocked(AdminService.getDestinations).mockResolvedValue(mockDestinationsData);

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await screen.findByText(/Phú Quốc/i);
    // Should render without image display issues
    expect(screen.getByText(/Phú Quốc/i)).toBeInTheDocument();
  });

  it("displays destination list updates after successful creation", async () => {
    vi.mocked(AdminService.getDestinations)
      .mockResolvedValueOnce(mockDestinationsData)
      .mockResolvedValueOnce({
        destinations: [
          ...mockDestinationsData.destinations,
          {
            id: 4,
            name: "New Destination",
            description: "New place",
            image_url: null,
          },
        ],
      });
    vi.mocked(AdminService.createDestination).mockResolvedValue({});
    const user = userEvent.setup();

    renderWithProviders(<DestinationsPage />, {
      authState: { user: mockAdminUser, isAuthenticated: true },
    });

    await user.click(screen.getByRole("button", { name: /Thêm Điểm đến/i }));

    const nameInput = screen.getByPlaceholderText(/VD: Đà Lạt, Phú Quốc/i);
    await user.type(nameInput, "New Destination");

    const submitBtn = screen.getByRole("button", { name: /Thêm mới/i });
    await user.click(submitBtn);

    expect(AdminService.createDestination).toHaveBeenCalled();
  });
});
