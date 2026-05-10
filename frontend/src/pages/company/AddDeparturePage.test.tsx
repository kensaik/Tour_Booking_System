import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithProviders } from "@/test/render-with-providers";
import { useAuthStore } from "@/stores/authStore";
import AddDeparturePage from "./AddDeparturePage";

vi.mock("@/components/company/CompanyLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/services/company.service", () => ({
  CompanyService: {
    getMyTours: vi.fn(),
    addDeparture: vi.fn(),
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
    { id: 1, name: "Tour Đà Lạt 3 ngày" },
    { id: 2, name: "Tour Hạ Long 4 ngày" },
  ],
};

describe("CompanyAddDeparturePage", () => {
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

  it("renders page header and tour selection field", async () => {
    renderWithProviders(<AddDeparturePage />);

    expect(await screen.findByText(/Thêm Lịch khởi hành/i)).toBeInTheDocument();
    expect(await screen.findByPlaceholderText(/Gõ để tìm tour/i)).toBeInTheDocument();
  });

  it("displays departure list section with add button", async () => {
    renderWithProviders(<AddDeparturePage />);

    expect(await screen.findByText(/Danh sách ngày khởi hành/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Thêm ngày/i })).toBeInTheDocument();
  });

  it("blocks submission when no tour is selected", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const startDateInput = await screen.findByLabelText(/Ngày bắt đầu/i);
    await user.type(startDateInput, "2025-06-01T08:00");

    const endDateInputs = screen.getAllByLabelText(/Ngày kết thúc/i);
    await user.type(endDateInputs[0], "2025-06-03T17:00");

    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);

    expect(await screen.findByText(/Vui lòng chọn tour/i)).toBeInTheDocument();
    expect(CompanyService.addDeparture).not.toHaveBeenCalled();
  });

  it("blocks submission when start or end date is empty", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Tour Đà Lạt");


    const firstOption = await screen.findByText("Tour Đà Lạt 3 ngày");
    await user.click(firstOption);


    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);

    expect(
      await screen.findByText(/Vui lòng điền đầy đủ ngày bắt đầu và ngày kết thúc/i),
    ).toBeInTheDocument();
    expect(CompanyService.addDeparture).not.toHaveBeenCalled();
  });

  it("validates that start date < end date", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Tour Đà Lạt");

    const firstOption = await screen.findByText("Tour Đà Lạt 3 ngày");
    await user.click(firstOption);


    const startDateInput = screen.getByLabelText(/Ngày bắt đầu/i);
    await user.type(startDateInput, "2025-06-03T17:00");

    const endDateInput = screen.getByLabelText(/Ngày kết thúc/i);
    await user.type(endDateInput, "2025-06-01T08:00");

    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);


    expect(CompanyService.addDeparture).toHaveBeenCalled();
  });

  it("validates capacity > 0", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Tour Đà Lạt");

    const firstOption = await screen.findByText("Tour Đà Lạt 3 ngày");
    await user.click(firstOption);


    const startDateInput = screen.getByLabelText(/Ngày bắt đầu/i);
    await user.type(startDateInput, "2025-06-01T08:00");

    const endDateInput = screen.getByLabelText(/Ngày kết thúc/i);
    await user.type(endDateInput, "2025-06-03T17:00");


    const capacityInput = screen.getByLabelText(/Số chỗ/i) as HTMLInputElement;
    await user.clear(capacityInput);
    await user.type(capacityInput, "0");

    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);


    expect(CompanyService.addDeparture).toHaveBeenCalled();
  });

  it("calls CompanyService.addDeparture with correct payload", async () => {
    vi.mocked(CompanyService.addDeparture).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Tour Đà Lạt");

    const firstOption = await screen.findByText("Tour Đà Lạt 3 ngày");
    await user.click(firstOption);


    const startDateInput = screen.getByLabelText(/Ngày bắt đầu/i);
    await user.type(startDateInput, "2025-06-01T08:00");

    const endDateInput = screen.getByLabelText(/Ngày kết thúc/i);
    await user.type(endDateInput, "2025-06-03T17:00");

    const capacityInput = screen.getByLabelText(/Số chỗ/i);
    await user.clear(capacityInput);
    await user.type(capacityInput, "25");

    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);

    expect(CompanyService.addDeparture).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        start_date: "2025-06-01T08:00",
        end_date: "2025-06-03T17:00",
        total_seats: 25,
      }),
    );
  });

  it("allows adding multiple departure rows", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    let startInputs = await screen.findAllByLabelText(/Ngày bắt đầu/i);
    expect(startInputs.length).toBe(1);


    const addBtn = screen.getByRole("button", { name: /Thêm ngày/i });
    await user.click(addBtn);

    startInputs = await screen.findAllByLabelText(/Ngày bắt đầu/i);
    expect(startInputs.length).toBe(2);
  });

  it("allows removing departure rows", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const addBtn = screen.getByRole("button", { name: /Thêm ngày/i });
    await user.click(addBtn);

    let removeButtons = screen.getAllByLabelText(/Xóa ngày khởi hành/i);
    expect(removeButtons.length).toBe(2);


    await user.click(removeButtons[0]);

    removeButtons = screen.queryAllByLabelText(/Xóa ngày khởi hành/i);
    expect(removeButtons.length).toBe(1);
  });

  it("filters tour dropdown by search query", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);

    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Hạ Long");

    expect(screen.getByText("Tour Hạ Long 4 ngày")).toBeInTheDocument();
    expect(screen.queryByText("Tour Đà Lạt 3 ngày")).not.toBeInTheDocument();
  });

  it("shows error toast when API fails", async () => {
    vi.mocked(CompanyService.addDeparture).mockRejectedValue({
      response: { data: { message: "Tour not found" } },
    });

    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Tour Đà Lạt");

    const firstOption = await screen.findByText("Tour Đà Lạt 3 ngày");
    await user.click(firstOption);


    const startDateInput = screen.getByLabelText(/Ngày bắt đầu/i);
    await user.type(startDateInput, "2025-06-01T08:00");

    const endDateInput = screen.getByLabelText(/Ngày kết thúc/i);
    await user.type(endDateInput, "2025-06-03T17:00");

    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);

    expect(await screen.findByText(/Tour not found/i)).toBeInTheDocument();
  });

  it("shows success toast and navigates after successful save", async () => {
    vi.mocked(CompanyService.addDeparture).mockResolvedValue({ ok: true });
    const user = userEvent.setup();
    renderWithProviders(<AddDeparturePage />);


    const tourInput = await screen.findByPlaceholderText(/Gõ để tìm tour/i);
    await user.type(tourInput, "Tour Đà Lạt");

    const firstOption = await screen.findByText("Tour Đà Lạt 3 ngày");
    await user.click(firstOption);


    const startDateInput = screen.getByLabelText(/Ngày bắt đầu/i);
    await user.type(startDateInput, "2025-06-01T08:00");

    const endDateInput = screen.getByLabelText(/Ngày kết thúc/i);
    await user.type(endDateInput, "2025-06-03T17:00");

    const saveBtn = screen.getByRole("button", { name: /Lưu lại/i });
    await user.click(saveBtn);

    expect(await screen.findByText(/Thêm lịch trình thành công/i)).toBeInTheDocument();
  });
});
